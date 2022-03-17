var aws = require("aws-sdk");
const dynamodb = new aws.DynamoDB();


exports.handler = async (event) => {

    const documentClient = new aws.DynamoDB.DocumentClient();

    const params = {
        TableName: "users",
        KeyConditionExpression: "#userEmail = :myEmail",
        ExpressionAttributeNames: {
            "#userEmail": "user_identification_number"
        },
        ExpressionAttributeValues: {
            ":myEmail": "1234567890"
        }
    };

    try {
        const data = await documentClient.query(params).promise();
        console.log('El resultado es ',data)
    } catch (err) {
        console.log(err)
    }

    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
