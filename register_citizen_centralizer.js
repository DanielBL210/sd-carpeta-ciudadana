const https = require('https');
var axios = require('axios');
const host = process.env.HOST;
const path = process.env.PATH;


exports.handler = async function (event, context) {
    console.log('event', event);
    let data = event.Records[0].body;
    let dataJson = JSON.parse(data);
    let url = host + path;



    console.log('data', dataJson);
    try {
        let response = await axios.post(url, dataJson);
        //console.log('response',response);
        let result = {
            "status": response.status,
            "statusCode": response.status,
            "message": response.data
        };
        console.log('result', result);
        return result;
    } catch (e) {
        console.log('e.response.data', e.response.data);
        let result = {
            "status": e.response.status,
            "statusCode": e.response.status,
            "message": e.response.data
        };
        console.log('result', result);
        return result;
    }




}