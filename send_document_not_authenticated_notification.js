const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  
  
    return sendMail(
      `${event.name} Su documento tipo ${event.document_type_name} NO fue autenticado exitosamente`,
      `Señor(a) ${event.name}, le notificamos que su documento tipo ${event.document_type_name} NOT fue autenticado exitosamente, por favor ingrese a la aplicacion y verifique sus datos, agradecemos que utilice nuestros servicios como operador de carpeta digital`,
      event.user_email);
  
};

async function sendMail(subject, message, to) {

  var smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL,
      pass: process.env.PASSWORD
    }
  });

  const mailOptions = {
    from: 'FolderApp',
    to: to,
    subject: subject,
    text: message
  };
  console.log(mailOptions);
  try {
    await smtpTransport.sendMail(mailOptions);
    return 'Sent'
  } catch (e) {
    console.log(e);
    throw (e)
  }
}