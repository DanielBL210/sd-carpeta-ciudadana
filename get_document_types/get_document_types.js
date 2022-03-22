const databaseConnection = require('./database')
exports.handler = async (event) => {
    // TODO implement

    const connection = await databaseConnection();
    connection.on(`error`, (err) => {
        console.error(`Connection error ${err.code}`);
    });
    let doc_types = await connection.awaitQuery(`SELECT * FROM doc_type`);
    await connection.release();
    return doc_types;
};
