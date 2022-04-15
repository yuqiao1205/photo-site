var db = require("../config/database");
const postMiddleware={};
const {getCommentsForPost, getPostById} = require('../models/comments');

postMiddleware.getRecentPosts = function(req,res,next){
let baseSQL = 'SELECT id,title,description,thumbnail,created FROM posts ORDER BY created DESC LIMIT 8';
db.execute(baseSQL,[])
.then(([results,fields])=>{
    res.locals.results = results;
    if(results && results.length == 0){
       req.flash('error','The are no posts created yet');
        console.log(results);
    }
    next();
})
.catch((err)=>next(err));
}

postMiddleware.getPostById = async function(req,res,next){
    try{
        let postId = req.params.id;
        let results = await getPostById(postId);
        if(results && results.length){
            res.locals.currentPost = results[0];
            next();
        }else{
            req.flash('error','this is not the post you are looking for.');
            res.redirect('/');
        }
    } catch(error){
        next(error);
    }
}
postMiddleware.getCommentsByPostId=async function(req,res,next){
    let postId = req.params.id;
    try{
        let results = await getCommentsForPost(postId);
        res.locals.currentPost.comment = results;
        next();
    }catch(error){
        next(error);
    }
}

module.exports=postMiddleware;