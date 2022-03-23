const AWS = require("aws-sdk");
const stepfunctions = new AWS.StepFunctions({ apiVersion: '2016-11-23' });

exports.handler = async (event) => {
    let data = event.Records[0].body;
    let dataJson = JSON.parse(data);
    console.log('sasas', dataJson);
    return send_sf(dataJson);
};

async function send_sf(event) {
    var params = {
        "stateMachineArn": "arn:aws:states:us-east-1:348911272626:stateMachine:authenticate_document", /* required */
        "input": "{\"userName\": \"" + event.userName +
            "\",\"urlDocument\": \"" + event.urlDocument +
            "\",\"sub\": \"" + event.sub +
            "\",\"document_type\": " + event.document_type +
            ",\"documentTitle\": \"" + event.documentTitle +
            "\",\"document_type_name\": \"" + event.document_type_name + "\"}"



    };

    console.log(params);
    try {
        const executeResult = await stepfunctions.startExecution(params).promise();


        console.log('executeResult: ', executeResult);
    } catch (e) {
        console.log(e);
        throw (e)
    }
}