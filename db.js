const mysql = require('mysql');

const DB_CONFIG = {
    host: 'remotemysql.com',
    user: '6TvtGx4GMe',
    password: 'hRKdZaZPrS',
    database: '6TvtGx4GMe'
};

const LOCALHOST_DB_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hpl'
};

let chooseDB = LOCALHOST_DB_CONFIG;

const conn = mysql.createConnection(chooseDB);

let sql = "";

(function init() {
    conn.connect(function(err) {
        if (err) throw err;
        else console.log("Connect to DB " + chooseDB.database + " success!");
    })
    conn.query("CREATE TABLE IF NOT EXISTS user (" +
        "id INT AUTO_INCREMENT PRIMARY KEY," +
        "email varchar(255) NOT NULL UNIQUE," +
        "username varchar(255)," +
        "password varchar(255)," +
        "dob varchar(255)," +
        "sex varchar(255)," +
        "roles int(10))",
        function(err, res) {
            if (err) throw err;
            else console.log("Create user successful");
        });

    conn.query("CREATE TABLE IF NOT EXISTS test_result (" +
        "id INT AUTO_INCREMENT PRIMARY KEY," +
        "email varchar(255)," +
        "result varchar(255)," +
        "timestamp varchar(255))",
        function(err, res) {
            if (err) {
                if (err.code == 1062) resolve({ code: 403, msg: "Account existed!" });
                else throw err;
            } else console.log("Create test_result successful");
        });
})();

module.exports = {
    login: function(email, password) {
        sql = "SELECT * FROM user WHERE email = ? AND password = ?";
        return new Promise(function(resolve, reject) {
            conn.query(sql, [email, password], function(err, res) {
                if (err) {
                    reject({ code: 400, msg: err });
                }
                resolve({ code: 200, msg: res });
            });
        });
    },
    signup: function(email, username, password, dob, sex, roles) {
        sql = "INSERT INTO user (email, username, password, dob, sex, roles) VALUES (?,?,?,?,?,?)";
        return new Promise(function(resolve, reject) {
            conn.query(sql, [email, username, password, dob, sex, roles], function(err, res) {
                if (err) {
                    if (err.errno == 1062) {
                        reject({ code: 403, msg: err });
                    } else {
                        reject({ code: 400, msg: err })
                    }
                }
                resolve({ code: 200, msg: res });
            });
        });
    }
}