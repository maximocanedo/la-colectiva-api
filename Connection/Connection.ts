'use strict';
import mysql, { ConnectionOptions, MysqlError } from 'mysql';
interface IConnection {
    host: string;
    user: string;
    password: string;
    database: string;
};
class Connection {
    constructor() {
    }
    Fetch(
    query: string,
    params: any[],
    callback: any,
    onError: any,
    onClose: any
  ): any {
    const connection = mysql.createConnection({
        host: "localhost",
        user: "api",
        password: "/cQvQocwRoPC4tD0",
        database: "arroz-con-leche"
    });
    connection.query(query, params, callback);
    connection.on("error", onError);
    connection.on("close", onClose);
    connection.end();
  }
}

/*
(error, results, fields) => {
            if (error) {
              console.error('Error executing query:', error);
              return;
            }
          
            // Aquí puedes hacer algo con los resultados de la consulta
            console.log('Query results:', results);
        }
*/
export default Connection;