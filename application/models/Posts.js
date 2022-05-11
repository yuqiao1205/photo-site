const PostModel = {};
const db = require('../config/database');

PostModel.create = (title, description, photopath, thumbnail, fk_userId) => {
    let baseSQL = "INSERT INTO posts (title,description,photopath,thumbnail,created,fk_userId) VALUES (?,?,?,?,now(),?);";

    return db.execute(baseSQL, [title, description, photopath, thumbnail, fk_userId])
        .then(([results, fields]) => {
            return Promise.resolve(results && results.affectedRows);
        })
        .catch((err) => Promise.reject(err));
}

PostModel.search = (searchTerm) => {
    let baseSQL = "SELECT id,title,description,thumbnail, concat_ws(' ',title,description) AS haystack\
    FROM posts\
    HAVING haystack like ?;";
    let sqlReadySearchTerm = "%" + searchTerm + "%";
    return db.execute(baseSQL, [sqlReadySearchTerm])
        .then(([results, fields]) => {
            return Promise.resolve(results);
        })
        .catch((err) => Promise.reject(err));
}

PostModel.getRecentPosts = (numberOfPost) => {
    let baseSQL = 'SELECT id,title,description,thumbnail,created FROM posts ORDER BY created DESC LIMIT 6';
    return db.execute(baseSQL, [numberOfPost])
        .then(([results, fields]) => {
            return Promise.resolve(results);
        })
        .catch((err) => Promise.reject(err));
}


PostModel.getPostById = (postId) => {
    let baseSQL = "SELECT u.id, u.username, p.title, p.description, p.photopath, p.thumbnail, p.created\
    FROM user u\
    JOIN posts p\
    ON u.id=fk_userId\
    WHERE p.id=?;";

    return db
        .execute(baseSQL, [postId])
        .then(([results, fields]) => {
            return Promise.resolve(results);
        })
        .catch((err) => Promise.reject(err));
}

module.exports = PostModel;