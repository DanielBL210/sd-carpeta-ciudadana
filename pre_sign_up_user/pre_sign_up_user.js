const https = require('https');
const host = process.env.HOST;
const path = process.env.PATH;
const AWS = require("aws-sdk");
const sendSQS = require('./send_sqs');
const docClient = new AWS.DynamoDB.DocumentClient();

const TABLE_USERS = "users";
const ID_OPERADOR = 21;
const NAME_OPERDADOR = "Folder Ciudadano 3000";

exports.handler = async (event, context) => {
    // TODO implement

    console.log('Hola ', event, context);
    //return event;

    return new Promise((resolve, reject) => {
        validate_citizen_centralizer(event, context)
            .then(event => parse_user(event))
            .then(data => put_new_user(data.user_attributes, data.user_id))
            .then(data_user => send_new_user_centralizer(data_user))
            .then(data => context.succeed(event))
            .catch(err => {
                console.log('no se pudo crear user => ', err);
                reject(err);
            })
    });



};

function put_new_user(user_attributes, user_id) {

    var params = {
        TableName: TABLE_USERS,
        Item: {
            "user_identification_number": user_id,
            "user_email": user_attributes.email,
            "operator_name": NAME_OPERDADOR,
            "operator": ID_OPERADOR,
            "address": user_attributes.address,
            "user_name": user_attributes.name,
            "sub": user_attributes.sub

        }
    };

    console.log("Adding a new user... ", params);
    return new Promise((resolve, reject) => {
        docClient.put(params, function (err, data) {
            if (err) {
                console.error("Unable to add user. Error JSON:", JSON.stringify(err, null, 2));
                reject(JSON.stringify(err, null, 2));
            } else {
                console.log("Added user:", JSON.stringify(data, null, 2));
                resolve(params.Item);
            }
        });
    });

}

function parse_user(event) {
    let user_id = '';
    let user_attributes = {};

    return new Promise((resolve, reject) => {
        user_id = event.userName;
        user_attributes = event.request.userAttributes;
        resolve({
            "user_id": user_id,
            "user_attributes": user_attributes
        });
    }).catch(error => {
        return error;
    })

}

async function send_new_user_centralizer(data) {
    console.log('data_user',data);
    
     let new_user={
        "id": parseInt(data.user_identification_number),
        "name": data.user_name,
        "address": data.address,
        "email": data.user_email,
        "operatorId": data.operator,
        "operatorName": data.operator_name
    };
    console.log(new_user);
    return await sendSQS(new_user,'10');
}

function validate_citizen_centralizer(event, context) { 
    let url = host + path + event.userName;
    return new Promise(function (resolve, reject) {
        https.get(url, (res) => {
          
          if(res.statusCode == 204){
              resolve(event);
          }else if(res.statusCode == 200){
              context.fail("El ciudadano ya esta registrado en otro operador");
          }else{
              console.log("Error al consumir servicio de validacion statusCode ",res.statusCode);
              context.fail("No se pudo validar el usuario");
          }
          
            
        }).on('error', (e) => {
            context.fail(event);
            reject(e);
        })
    })

}