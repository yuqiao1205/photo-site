var express = require('express');
var router = express.Router();
var db = require("../config/database");
var PostModel = require('../models/Posts');

const {
    successPrint,
    errorPrint
} = require('../helpers/debug/debugprinters');
var sharp = require('sharp');
var multer = require('multer');
var crypto = require('crypto');
var PostError = require('../helpers/error/PostError');

const {
    check
} = require('express-validator');

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

function imageFilter(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(null, false);
    } else {
        req.fileValidationError = null;
    }
    cb(null, true);

};

var uploader = multer({
    storage: storage,
    fileFilter: imageFilter
});

// server side validation for image post
router.post('/createPost',
    check('title', 'Title cannot be empty!').isLength({
        min: 1
    }),
    check('description').exists().withMessage('Description is required!'),
    uploader.single("uploadImg"),
    (req, res, next) => {
        // Check required fields of title, description
        {
            let errorMessage = '';

            if (!req.body.title) {
                errorMessage += "Title is required!  ";
            }

            if (!req.body.description) {
                errorMessage += "Description is required! ";
            }

            if (errorMessage !== '') {
                req.flash('error', errorMessage);

                res.status(200);
                req.session.save(function (err) {
                    res.redirect('/postimage');
                });

                return;
            }
        }

        // Check image type and check upload file is empty or not
        if (req.fileValidationError) {
            req.flash('error', req.fileValidationError);
            req.session.save(function (err) {
                res.redirect('/postimage');
            });
            return;
        } else if (!req.file) {
            req.flash('error', 'Image upload file is required!');
            req.session.save(function (err) {
                res.redirect('/postimage');
            });
            return;
        }

        let fileUploaded = req.file.path;
        let fileAsThumbnail = `thumbnail-${req.file.filename}`;
        let destinationOfThumbnail = req.file.destination + '/' + fileAsThumbnail;
        let title = req.body.title;
        let description = req.body.description;
        let fk_userId = req.session.userId;

        sharp(fileUploaded)
            .resize(200)
            .toFile(destinationOfThumbnail)
            .then(() => {
                return PostModel.create(title, description, fileUploaded, destinationOfThumbnail, fk_userId);
            })
            .then((postWasCreated) => {
                if (postWasCreated) {

                    req.flash('success', 'Your post was created successfully!');
                    req.session.save(function (err) {
                        res.redirect('/');
                    });
                } else {
                    throw new PostError('Post could not be created!', '/postimage', 200)
                }
            })
            .catch((err) => {
                if (err instanceof PostError) {
                    errorPrint(err.getMessage());
                    req.status(err.getStatus());
                    res.redirect(err.getRedirectURL());
                } else {
                    next(err); 
                }
            });
    });


router.get('/search', async (req, res, next) => {
                try {
                    let searchTerm = req.query.search;
                    if (!searchTerm) {
                        res.send({
                            message: "No seach term given",
                            results: []
                        });
                    } else {
                        let results = await PostModel.search(searchTerm);
                        if (results.length) {
                            res.send({
                                message: `${results.length} results found`,
                                results: results
                            });
                        } else {
                            let results = await PostModel.getRecentPosts(5);
                            res.send({
                                message: "No results found, but here are the 5 most recent posts",
                                results: results
                            });
                        }
                    }
                } catch (err) {
                    next(err);
                }
            })
module.exports = router;