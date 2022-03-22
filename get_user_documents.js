
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
    let response = await get_user_documents(event);
    console.log('response', response);
    return response;
};


async function get_user_documents(event) {
    var decodedId = jwt_decode(event.params.header.Authorization);
    console.log('decodeId', decodedId);
    let sub = decodedId.sub;
    console.log('sub', sub);
    let user_documents = await get_user_documents_database(sub);
    console.log('user_documents', user_documents);
    let aux_object;
    let aux_prefix_file;
    let aux_ext;
    let aux_url;
    let response_array = [];
    for (var user_doc of user_documents) {
        console.log('user_doc', user_doc);
        aux_object = await get_document_type_database(user_doc.document_type);
        console.log('aux', aux_object);
        aux_prefix_file = aux_object[0].doc_prefix_file;
        aux_ext = user_doc.document_ext;

        aux_url = await getPresignedKey(sub, `/${aux_prefix_file}_${sub}.${aux_ext}`);

        response_array.push({
            "document_id": user_doc.document_id,
            "document_type": user_doc.document_type,
            "document_type_name": aux_object[0].doc_name,
            "url": aux_url
        });

    }
    return response_array;
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
    console.log('sub', sub);
    console.log('fullPath', fullPath);
    const filePath = (fullPath.split('/')).pop();
    console.log('filePath', filePath);
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




async function get_user_documents_database(sub) {
    const connection = await databaseConnection();
    connection.on(`error`, (err) => {
        console.error(`Connection error ${err.code}`);
    });
    let query = `SELECT document_id, document_type, document_sub, document_ext FROM documents where document_sub = '${sub}'`;
    console.log(query);
    let result = await connection.awaitQuery(query);
    await connection.release();
    return result;
}




async function get_document_type_database(document_type) {
    const connection = await databaseConnection();
    connection.on(`error`, (err) => {
        console.error(`Connection error ${err.code}`);
    });
    let result = await connection.awaitQuery(`SELECT doc_type_id, doc_name, doc_prefix_file FROM documents.doc_type where doc_type_id = ${document_type}`);
    await connection.release();
    return result;
}



