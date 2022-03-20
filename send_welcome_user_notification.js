exports.handler = async (event) => {
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
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
  try{
    await smtpTransport.sendMail(mailOptions);
    return 'Sent'
  }catch(e){
    console.log(e);
    throw(e)
  }
}