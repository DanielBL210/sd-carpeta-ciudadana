var aws = require("aws-sdk");
const ddb = new aws.DynamoDB.DocumentClient();
var sfn = new aws.StepFunctions();


const TABLE = "step_functions_per_path";

exports.handler = async (event) => {
    console.log(event);
    let path = event.context['resource-path'];
    let method = event.context['http-method'];
    console.log('looking step function for => ', path, method);
    var params = {
        TableName: TABLE,
        ProjectionExpression: "#p, #m, step_function, step_function_arn",
        FilterExpression: "#p =:p AND #m =:m",
        ExpressionAttributeNames: {
            "#p": "path",
            "#m": "method"
        },
        ExpressionAttributeValues: {
            ":p": path,
            ":m": method

        }
    };
    console.log('looking step function for params => ', params);
    let pp = await ddb.scan(params).promise();

    let step_function = null;
    try {
        step_function = pp.Items[0];
    } catch (err) {
        return err;
    }
    console.log('step_function', step_function);

    let StateMachineArn = step_function.step_function_arn;
    event = JSON.stringify(event);

    params = {
        input: event,
        stateMachineArn: StateMachineArn
    };
    console.log('executing step function for params => ', params);
    return sfn.startExecution(params).promise();


}


