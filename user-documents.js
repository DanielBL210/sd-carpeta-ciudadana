var multipart = require('parse-multipart');
var jwt_decode = require('jwt-decode');
const databaseConnection = require('./database');

const AWS = require('aws-sdk');

const BUCKET_NAME = process.env.BUCKET_NAME;

var s3 = new AWS.S3({
  params: {
    Bucket: BUCKET_NAME,
    accessKeyId: process.env.KEY_ACCESS,
    secretAccessKey: process.env.KEY_PASSWORD
  }
});

exports.handler = async (event, context) => {
  console.log('event', event);
  console.log('context', context);
  let response = await documentTest(event);
  console.log('response', response);
  return response;
};


async function documentTest(event) {
  var bodyBuffer = new Buffer(event["body-json"].toString(), 'base64');
  console.log('params ====>', event.params);
  let boundary;
  try {
    boundary = multipart.getBoundary(event.params.header['Content-Type']);
  } catch (e) {
    boundary = multipart.getBoundary(event.params.header['content-type']);
  }

  const dispositionNames = await getContextDisposition(event, boundary);
  console.log('dispositionNames', dispositionNames);
  var files = multipart.Parse(bodyBuffer, boundary);
  let cont = 0;
  let doc_type = parseInt(dispositionNames[cont]);
  let doc_type_object = await getDocumentTypeDatabase(doc_type);
  console.log('doc_type_object', doc_type_object);
  let doc_prefix_file = doc_type_object[0].doc_prefix_file;


  var decodedId = jwt_decode(event.params.header.Authorization);
  console.log('decodeId', decodedId);
  let sub = decodedId.sub;
  console.log('Sub', sub);

  for (var file of files) {
    var filenameArr = (file.filename).split('.');
    let ext = filenameArr[filenameArr.length - 1];
    if (ext == 'pdf') {
      var { url, key, bucket } = await uploadFileIntoS3(file, sub, doc_prefix_file);
      if (url != "") {
        let exist = await getDocumentDatabase(doc_type, sub);
        console.log(exist);
        if (!exist[0]) {
          let result = await insertDocumentDatabase(doc_type, sub, ext);
          console.log('result', result);
        }

      }
    } else {
      return "Tipo de archivo no permitido";
    }
  }
  return url;
}




async function getContextDisposition(event, boundary) {
  var rawDisposition = new Buffer(event["body-json"].toString(), 'base64').toString();
  var arrDisposition = rawDisposition.split(boundary);
  arrDisposition.pop();
  arrDisposition.shift();
  var names = (arrDisposition.map(x => x.split(`\"`)[1]));
  return names;
}



async function getPresignedKey(sub, fullPath) {
  const filePath = (fullPath.split('/')).pop();

  var purl = s3.getSignedUrl('getObject', {
    Bucket: BUCKET_NAME,
    Key: `documents/${sub}/${filePath}`,
    Expires: 60 * 60
  });
  return purl;
}




async function uploadFileIntoS3(file, sub, name) {
  var filenameArr = (file.filename).split('.');
  const extension = filenameArr[filenameArr.length - 1];

  var options = {
    Bucket: BUCKET_NAME,
    Key: `documents/${sub}/${name}_${sub}.${extension}`,
    Body: file.data,
    ContentType: `${file.type}`,
    ContentEncoding: 'base64'
  };

  try {
    await s3.putObject(options).promise();
    console.log(`${name} subido a s3: documents/${sub}/${name}_${sub}.${extension}`);
    return {
      url: getPresignedKey(sub, `https://carpetapp.s3.amazonaws.com/documents/${sub}/${name}_${sub}.${extension}`),
      key: options.Key,
      bucket: options.Bucket
    }
  } catch (err) {
    console.error('EEEEEEE ====>', err);
    throw err;
  }
}


async function insertDocumentDatabase(document_type, sub, ext) {
  const connection = await databaseConnection();
  connection.on(`error`, (err) => {
    console.error(`Connection error ${err.code}`);
  });
  let query = `INSERT INTO documents.documents(document_type, document_sub, document_ext) VALUES (${document_type},'${sub}','${ext}')`;
  console.log('query', query);
  let result = await connection.awaitQuery(query);
  await connection.release();
  return result;
}

async function getDocumentDatabase(document_type, sub) {
  const connection = await databaseConnection();
  connection.on(`error`, (err) => {
    console.error(`Connection error ${err.code}`);
  });
  let result = await connection.awaitQuery(`SELECT document_id, document_type, document_sub FROM documents.documents where document_type = ${document_type} and document_sub = '${sub}'`);
  await connection.release();
  return result;
}

async function getDocumentTypeDatabase(document_type) {
  const connection = await databaseConnection();
  connection.on(`error`, (err) => {
    console.error(`Connection error ${err.code}`);
  });
  let result = await connection.awaitQuery(`SELECT doc_type_id, doc_name, doc_prefix_file FROM documents.doc_type where doc_type_id = ${document_type}`);
  await connection.release();
  return result;
}





