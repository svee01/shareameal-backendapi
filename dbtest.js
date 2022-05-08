const mysql = require('mysql')
require('dotenv').config()

const pool = mysql.createPool({
    connectionLimit : 10,
    host : process.env.DB_HOST,
    port : process.env.DB_PORT,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE,
})

pool.getConnection(function(err, connection) {
    if (err) throw err

    connection.query('SELECT id, name FROM meal;', function(error, results, fields) {
        connection.release()

        if (error) throw error
        console.log('Result = ', results)

        pool.end((err) => {
            console.log('Pool was closed.')
        })
    })
})