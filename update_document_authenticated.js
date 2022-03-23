const databaseConnection = require('./database')
exports.handler = async (event) => {
    // TODO implement
    console.log(event);
    const connection = await databaseConnection();
        connection.on(`error`, (err) => { console.error(`Connection error ${err.code}`);
    });
    const q1="UPDATE documents.documents SET document_authenticate = 1 ";
    let sub=event.sub;
    let document_type=event.document_type;
    let query = await connection.awaitQuery(`${q1} where document_type = ${document_type} and document_sub = '${sub}'`);
    console.log('query result',query);
    await connection.release();
    return query;
};
