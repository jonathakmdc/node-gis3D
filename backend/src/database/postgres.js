const pg = require('pg');
const {getDb} = require('../repository/userRepository');

const TYPE = 'postgresql';
const CLIENT = 'dev';

const getClient = async () => {
    const db = await getDb(TYPE, CLIENT);
    if (db){
        const client = new pg.Client(db);  
        client.connect();
        return client;
    }else{
        throw new Error('Configuração de banco de dados não definida.');
    }
}

const query = async (query) => {
    const client = await getClient();
    if(client){
        const {rows} = await client.query(query);
        client.end();
        return rows;
    }
}

module.exports =  {query}