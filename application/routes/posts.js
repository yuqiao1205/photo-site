var express = require('express');
var router = express.Router();
var db = require("../config/database");
const {
    successPrint,
    errorPrint
} = require('../helpers/debug/debugprinters');
var sharp = require('sharp');
var multer = require('multer');
var crypto = require('crypto');
var PostError = require('../helpers/error/PostError');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/image/uploads");
    },
    filename: function (req, file, cb) {
        let fileExt = file.mimetype.split('/')[1];
        let randomName = crypto.randomBytes(22).toString('hex');
        cb(null, `${randomName}.${fileExt}`);
    }
});

var uploader = multer({
    storage: storage
});
// TODO/*do server validation, if any values that used for the insert statement are undefind,
// mysql,query or execute will fail with the following error: BIND paramters cannot be undefined*/

router.post('/createPost', uploader.single("uploadImg"), (req, res, next) => {
    console.log(req);
    let fileUploaded = req.file.path;
    let fileAsThumbnail = `thumbnail-${req.file.filename}`;
    let destinationOfThumbnail = req.file.destination + '/' + fileAsThumbnail;
    let title = req.body.title;
    let description = req.body.description;
    let fk_userId = req.session.userid;

    sharp(fileUploaded)
        .resize(200)
        .toFile(destinationOfThumbnail)
        .then(() => {
            let baseSQL = "INSERT INTO posts (title,description,photopath,thumbnail,created,fk_userId) VALUES (?,?,?,?,now(),?);";
            console.log("title=" + title + "des=" + description + "file=" + fileUploaded + "des" + destinationOfThumbnail + "fkid" + fk_userId);
            return db.execute(baseSQL, [title, description, fileUploaded, destinationOfThumbnail, fk_userId]);
        })
        .then(([results, fields]) => {
            if (results && results.affectedRows) {
                //req.flash('success','Your post was created successfully!');
                res.redirect('/');
            } else {
                throw new PostError('Post could not be created!', '/postimage', 200)
            }
        })
        .catch((err) => {
            if (err instanceof PostError) {
                errorPrint(err.getMessage());
                ('error', err.getMessage());
                req.status(err.getStatus());
                res.redirect(err.getRedirectURL());
            } else {
                next(err);
            }
        });
});

//localhost:3000/post/search?search=value
router.get('/search', (req, res, next) => {
    let searchTerm = req.query.search;
    console.log(req.query);
    // res.send(req.query);
    if (!searchTerm) {
        res.send({
            resultsStatus: "info",
            message: "No seach term given",
            results: []
        })
    } else {
        let baseSQL = "SELECT id,title,description,thumbnail, concat_ws(' ',title,description) AS haystack\
             FROM posts\
             HAVING haystack like ?;";
        let sqlReadySearchTerm = "%" + searchTerm + "%";
        db.execute(baseSQL, [sqlReadySearchTerm])
            .then(([results, fields]) => {
                
                if (results && results.length) {
                    res.send({
                        resultsStatus: "info",
                        message: `${results.length} results found`,
                        results: results
                    });
                } else {
                    db.query('SELECT id,title,description,thumbnail,created FROM posts ORDER BY created DESC LIMIT 8;', [])
                        .then(([results, fields]) => {
                            res.send({
                                resultsStatus: "info",
                                message: "No results where found for your search but here are the 8 most recent posts",
                                results: results
                            });
                        })
                }
            })
            .catch((err) => {
                console.log(`Error: ${err}`)
                next(err);
            });
    }
});

module.exports = router;