var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();

const TABLE_USERS = "users";

exports.handler = async (event, context) => {
    // TODO implement

    console.log('Hola ', event)

    return new Promise((resolve, reject) => {
        parse_user(event)
            .then(data => put_new_user(data.user_attributes, data.user_id))
            .then(data_user => send_user_notification(data_user))
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
            "operator_name": 'Operador Ciudadano',
            "operator": 1,
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

function send_user_notification(data) {
    console.log('data_user',data);
    let message= {
         to: data.user_email,
         subject: data.user_name + ' Bienvenido a Operador ciudadano CD (Carpeta Digital)',
         text: data.user_name + ' Bienvenido a Operador ciudadano CD (Carpeta Digital). A continuacion podra subir sus documentos.',
         
     };

    sendSQS(message,'10');



    return {
       // to: to,
        //subject: subject,
        //text: message
    };

}