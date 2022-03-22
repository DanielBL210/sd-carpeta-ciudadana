const mysql = require("mysql-await");

const configMysql = {
    host: process.env.HOST,
    user: process.env.DBUSER,
    database: process.env.DBNAME,
    password: process.env.DBPASSWORD,
    port: 3306
};

module.exports = async function databaseConnection(){
//async function databaseConnection(){
    
    const pool2 = mysql.createPool(configMysql);
    pool2.on(`acquire`, (connection) => {
        console.log(`Connection %d acquired`, connection.threadId);
    });
    pool2.on(`connection`, (connection) => {
        console.log(`Connection %d connected`, connection.threadId);
    });
    pool2.on(`enqueue`, () => {
        console.log(`Waiting for available connection slot`);
    });
    pool2.on(`release`, function (connection) {
        console.log(`Connection %d released`, connection.threadId);
    });
    const connection = await pool2.awaitGetConnection();
    return connection;
};


  