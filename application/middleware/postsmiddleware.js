const postMiddleware = {};

const db = require("../config/database");

const PostModel = require('../models/Posts');
const CommentsModel = require('../models/Comments');

postMiddleware.getRecentPosts = async function (req, res, next) {
    try {
        let results = await PostModel.getRecentPosts(5);
        res.locals.results = results;
        if (results && results.length == 0) {
            req.flash('error', 'There are no post created yet');
        }
        next();
    } catch (err) {
        next(err)
    }
}

postMiddleware.getPostById = async function (req, res, next) {
    try {
        let postId = req.params.id;
        let results = await PostModel.getPostById(postId);
        if (results && results.length) {
            res.locals.currentPost = results[0];
            next();
        } else {
            req.flash('error', 'This is not the post you are looking for!');
            req.session.save(function (err) {
                res.redirect('/');
            });
        }
    } catch (error) {
        next(error);
    }
}

postMiddleware.getCommentsByPostId = async function (req, res, next) {
    let postId = req.params.id;
    try {
        let results = await CommentsModel.getCommentsForPost(postId);
        res.locals.currentPost.comment = results;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = postMiddleware;