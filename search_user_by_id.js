var aws = require("aws-sdk");
const dynamodb = new aws.DynamoDB();
const ddb = new aws.DynamoDB.DocumentClient();
const ddb_v = new aws.DynamoDB({
    apiVersion: '2012-08-10'
});
const TABLE_USERS = "users";

exports.handler = async (event) => {
    return new Promise((resolve, reject) => {
        getUserById(event)
            .then(data => {
                console.log('Exitoso => ', data);
                let resp = {};
                if (data.Count > 0) {
                    resp = data.Items[0];
                }
                generate_response(resp, resolve, reject);

            })
            .catch(error => {
                console.log('error => ', error);
                reject(error);
            });
    });


};

function getUserById(event) {
    let num_id_user = event.user_id_number;

    let params = {
        TableName: TABLE_USERS,
        KeyConditionExpression: "#UserId = :UserId",
        ExpressionAttributeNames: {
            "#UserId": "user_identification_number"
        },
        ExpressionAttributeValues: {
            ":UserId": num_id_user
        }
    };
    return new Promise((resolve, reject) => {
        ddb.query(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    resolve(data);
                } catch (error) {
                    reject(err);
                }
            }
        });
    });
}

function generate_response(data, resolve, reject) {
    resolve(data);
}