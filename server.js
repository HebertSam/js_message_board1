const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

const path = require("path");
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

const session = require("express-session");
app.use(session({secret:"somestring"}));

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/message_board1");

let CommentSchema = new mongoose.Schema({
    name: {type:String, required:true, minlength:4},
    comment: {type:String, required:true, minlength:2}
}, {timestamps:true});

let PostSchema = new mongoose.Schema({
    name: {type:String, required:true, minlength:4},
    post: {type:String, required:true, minlength:2},
    comments: [CommentSchema]
}, {timestamps:true});

mongoose.model("Post", PostSchema);
let Post = mongoose.model("Post");

mongoose.model("Comment", CommentSchema);
let Comment = mongoose.model("Comment");

app.get("/", function(req, res){
    Post.find({}, function(err, posts){
        if(err){
            return console.log("something went wrong")
        }else if (req.session.error){
            console.log(req.session.error)
            res.render("index", {posts:posts, errors:req.session.error});
            req.session.destroy();
        }else{
            // console.log(posts);
            res.render("index", {posts:posts, errors:req.session.error});
        }
    })
})

app.post("/create", function(req, res){
    let body = req.body;
    // console.log(body)
    let post = new Post(body);
    post.save(function(err){
        if(err) {
            console.log("somthing went wrong")
            req.session.error = post.errors;
            res.redirect("/")
        }else {
            res.redirect("/");
        }
    });

})

app.post("/create/:id", function(req, res){
    let body = req.body;
    console.log(body)
    Post.findOne({_id:req.params.id}, function(err, post){
        if (err){
           return console.log("something went wrong")
        }
        let comment = new Comment(body)
        console.log(post)
        console.log(comment)
        post.comments.push(comment)
        comment.save(function(err){
            if(err){
                console.log("something went wrong", err)
            }
            post.save(function(err){
                if(err){
                    console.log("something went wrong")
                    
                }
            })
            res.redirect("/")
        })
        })
    })
app.listen(8000, function(){
    console.log("listening on port 8000");
})



