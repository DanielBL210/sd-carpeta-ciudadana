var jwt_decode = require('jwt-decode');
const databaseConnection = require('./database');
const sendSQS = require('./send_sqs');
exports.handler = async (event) => {
    
    console.log(event);
    let body = event["body-json"];
    // TODO implement
    let jwt_json_decode= await jwt_decode_method(event);
    let document_info= await getDocumentDatabase(body.document_id);
    let doc_type_object= await getDocumentTypeDatabase(document_info[0].document_type); 
    
    //console.log(jwt_json_decode,document_info,doc_type_object);
    
    let data_to_validate_doc = {
          "userName": jwt_json_decode.username,
          "urlDocument": doc_type_object[0].doc_prefix_file,
          "sub": jwt_json_decode.sub,
          "document_type": document_info[0].document_type,
          "documentTitle": doc_type_object[0].doc_name,
          "document_type_name": doc_type_object[0].doc_name
        };
        let send_request = await send_validate_document(data_to_validate_doc);
        console.log('send_request', send_request);
    return send_request;
};

async function getDocumentDatabase(document_id) {
  const connection = await databaseConnection();
  connection.on(`error`, (err) => {
    console.error(`Connection error ${err.code}`);
  });
  let result = await connection.awaitQuery(`SELECT document_id, document_type, document_sub, document_date, document_ext, document_authenticate FROM documents.documents where document_id = ${document_id}`);
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

async function send_validate_document(data) {
  console.log(data);
  return sendSQS(data, '10');
}

async function jwt_decode_method(data) {
  return jwt_decode(data.params.header.Authorization);
}
