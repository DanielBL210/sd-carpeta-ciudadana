var aws = require("aws-sdk");
const dynamodb = new aws.DynamoDB();
const ddb = new aws.DynamoDB.DocumentClient();
const ddb_v = new aws.DynamoDB({
    apiVersion: '2012-08-10'
});
const TABLE_USERS = "users";

exports.handler = async (event) => {
    let user_email = event.user_email;
    var params = {
        TableName: TABLE_USERS,
        ProjectionExpression: "#em, user_identification_number, operator_name",
        FilterExpression: "#em =:em",
        ExpressionAttributeNames: {
            "#em": "user_email",
        },
        ExpressionAttributeValues: {
            ":em": user_email

        }
    };

    let pp = await ddb.scan(params).promise();

    try {
        return pp.Items[0];
    } catch (err) {
        return err;
    }

}