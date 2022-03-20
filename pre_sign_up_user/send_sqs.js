const AWS = require('aws-sdk');
const SQS = new AWS.SQS({apiVersion: '2012-11-05'});


const sendSQS = (message, requestId) => {
  return new Promise((resolve, reject) => {
  const params = {
    MessageBody: JSON.stringify(message),
    QueueUrl: process.env.VALIDATIONQUEUE,
    MessageAttributes: {
            correlationId: {
                "DataType": "String",
                "StringValue": requestId,
            }
    }
  };
  SQS.sendMessage(params, (err,result) => {
      if(err) return(err);
      if(result) resolve(result);
    });
  });
};

module.exports = sendSQS;