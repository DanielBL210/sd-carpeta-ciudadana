var multipart = require('parse-multipart');

const AWS = require('aws-sdk');

const BUCKET_NAME = process.env.BUCKET_NAME;

var s3 = new AWS.S3({ 
params: {
    Bucket: BUCKET_NAME,
    accessKeyId: process.env.KEY_ACCESS,
    secretAccessKey: process.env.KEY_PASSWORD
}});

exports.handler = async (event) => {
    let response = await documentTest(event);
    return response;
};


async function documentTest(event){
var bodyBuffer = new Buffer(event["body-json"].toString(), 'base64');
console.log(event.params);
try{
    var boundary = multipart.getBoundary(event.params.header['Content-Type']);
}catch(e){
    var boundary = multipart.getBoundary(event.params.header['content-type']);
}

const dispositionNames = await getContextDisposition(event, boundary);
var files = multipart.Parse(bodyBuffer, boundary);
 let cont=0;

    for (var file of files){
    var {url, key, bucket} = await uploadFileIntoS3(file, event.params.path.sub, dispositionNames[cont]);

	}
  return url;
}
    
    
    
    
async function getContextDisposition(event, boundary){
    var rawDisposition = new Buffer(event["body-json"].toString(), 'base64').toString();
    var arrDisposition = rawDisposition.split(boundary);
    arrDisposition.pop();
    arrDisposition.shift();
    var names = (arrDisposition.map(x => x.split(`\"`)[1]));
    return names;
}



async function getPresignedKey(sub, fullPath){
  const filePath = (fullPath.split('/')).pop();
  var purl = s3.getSignedUrl('getObject', {
      Bucket: BUCKET_NAME,
      Key: `documents/${sub}/${filePath}`,
      Expires: 60 * 60
  });
  return purl;
}


async function uploadFileIntoS3 (file, sub, name){
  var filenameArr = (file.filename).split('.');
  const extension = filenameArr[filenameArr.length - 1];
  var options = {
    Bucket: BUCKET_NAME,
    Key: `documents/${file.filename}`, 
    Body: file.data,
    ContentType: `${file.type}`,
    ContentEncoding: 'base64'
  };
  
  try {
    await s3.putObject(options).promise();
    console.log(`${name} subido a s3: documents/${sub}/${name}_${sub}.${extension}`);
    return { 
      url: `https://carpetapp.s3.amazonaws.com/documents/${sub}/${name}_${sub}.${extension}`,
      key: options.Key,
      bucket: options.Bucket
    }
  } catch (err) {
      console.error(err);
      throw err;
  }
}