var db = require("../config/database");
const UserModel = {};
var bcrypt = require('bcrypt')

UserModel.create = (username, password, email) => {
    return bcrypt.hash(password, 15)
        .then((hashedPassword) => {
            let baseSQL = "INSERT INTO user (username,email,password,created) VALUES (?,?,?,now());";
            return db.execute(baseSQL, [username, email, hashedPassword])
        })
        .then(([results, fields]) => {
            if (results && results.affectedRows) {
                return Promise.resolve(results.insertId);
            } else {
                return Promise.resolve(-1);
            }
        })
        .catch((err) => Promise.reject(err));
}

UserModel.usernameExists = (username) => {
    return db.execute("SELECT * FROM user WHERE username=?", [username])
        .then(([results, fields]) => {
            return Promise.resolve(!(results && results.length == 0))
        })
        .catch((err) => Promise.reject(err));
}

UserModel.emailExists = (email) => {
    return db.execute("SELECT * FROM user WHERE email=?", [email])
        .then(([results, fields]) => {
            return Promise.resolve(!(results && results.length == 0))
        })
        .catch((err) => Promise.reject(err));
}

UserModel.authenticate = (username, password) => {
    let userId;
    let baseSQL = "SELECT id, username, password FROM user WHERE username=?;";
    return db.execute(baseSQL, [username])
        .then(([results, fields]) => {
            if (results && results.length === 1) {
                userId = results[0].id;
                return bcrypt.compare(password, results[0].password);
            } else {
                // Invalid username case
                return Promise.resolve(-1);
            }
        })
        .then((passwordsMatch) => {
            if (passwordsMatch) {
                return Promise.resolve(userId);
            } else {
                // Password doesn't match case
                return Promise.resolve(-1);
            }

        })
        .catch((err) => Promise.reject(err));
}

module.exports = UserModel;