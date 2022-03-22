const https = require('https');
const host = process.env.HOST;
const path = process.env.PATH;

exports.handler = async function (event,context) {
    console.log(event);
    let url = host + path + event.userName;
    return new Promise(function (resolve, reject) {
        console.log('url',url);
        https.get(url, (res) => {
          console.log('res.statusCode',res.statusCode);
          if(res.statusCode == 204){
              context.succeed(event);
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