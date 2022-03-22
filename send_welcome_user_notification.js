const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  
  if (event.Records[0].eventName == 'INSERT') {
    console.log('Regsitro', event.Records[0].dynamodb);
    let new_user = event.Records[0].dynamodb.NewImage;

    return sendMail(
      `${new_user.user_name.S} Bienvenido(a) a ${new_user.operator_name.S}`,
      `Señor(a) ${new_user.user_name.S}, Nos complace darle la bienvenida a ${new_user.operator_name.S}, agradecemos que nos haya elegido como su operador de carpeta digital`,
      new_user.user_email.S);
  }
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