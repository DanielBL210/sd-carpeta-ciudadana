const https = require('https');
const host = process.env.HOST;
const path = process.env.PATH;

exports.handler = async function (event,context) {
    console.log(event);
    let url = host + path + event.userName + '/'+event.urlDocument+'/'+event.documentTitle;
    return new Promise(function (resolve, reject) {
        https.get(url, (res) => {
          console.log(res.statusCode);
          resolve(res.statusCode);
            
        }).on('error', (e) => {
            context.fail(event);
            reject(e);
        })
    })
    
}