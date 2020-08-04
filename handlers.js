const {Thread, Reply, Board} = require("./schemas");
const mongoose = require("mongoose")

function postThread(req, res) {
    let {board, text, delete_password} = req.body;
    Thread.create({board, text, delete_password, replies: []}, (err, thread) => {
        Board.findOneAndUpdate({name: board}, {$push: {threads: thread._id}}, {upsert: true, useFindAndModify: false}, (err, data) => {
            res.redirect(`/b/${board}`)
        });     
    });
};    

function postReply(req, res) {
    try {
        const id = mongoose.Types.ObjectId(req.body.thread_id)
        const reply = new Reply({
            thread: id,
            text: req.body.text,
            reported: false,
            delete_password: req.body.delete_password
        });
        Thread.findOneAndUpdate({ _id: req.body.thread_id }, {$set: {bumped_on: new Date()}, $push: {replies: reply._id}}, {useFindAndModify: false},(err, data) => {
            if (data.length != 0) {
                reply.save((err, data) => {
                    res.json(req.body);
                })              
            }else {
                res.json({"err": "thread not found"})
            }});
    } catch(err) {
        res.json({"err": "invalid id"})
    }    
}

function getBoard(req, res) {
    Board.findOne({name: req.params.board})
        .populate({
            path: "threads", 
            select: "-reported -delete_password", 
            options: {limit: 10, sort: {bumped_on: -1}} ,
            populate: {
                path: "replies", 
                select: "-reported -delete_password",
                options: {sort: {created_on: -1}, limit: 3}} 
        })
        .exec((err, data) => {
            res.json(data.threads)
        })
} 

function getThread(req, res) {
    Thread.findById(req.query.thread_id)
        .select("-reported -delete_password")
        .populate({
            path: "replies",
            select: "-reported -delete_password"})
        .exec((err, data) => {
            res.json(data)
        });
}

function deleteThread(req, res) {
    let {board, thread_id, delete_password} = req.body;
    Thread.deleteOne({board: board, _id: thread_id, delete_password: delete_password}, (err, data) => {
        if (data.deletedCount === 0) {
            res.send("incorrect password")
        }else {
            res.send("success")
        }
    })
}

function deleteReply(req, res) {
    let {thread_id, reply_id, delete_password} = req.body;
    Reply.findOneAndUpdate({_id: reply_id, thread: thread_id, delete_password: delete_password}, {text: "[deleted]"}, {useFindAndModify: false}, (err, data) => {
        if (!data) {
            res.send("incorrect password")
        }else {
            res.send("success")
        }
    })
}

function reportThread(req, res) {
    let {thread_id} = req.body;
    Thread.findOneAndUpdate({_id: thread_id}, {reported: true}, {useFindAndModify: false}, (err, data) => {
        if (!data) {
            res.send("no thread found")
        }else {
            res.send("success")
        }
    })
}

function reportReply(req, res) {
    let {thread_id, reply_id} = req.body;
    Reply.findOneAndUpdate({_id: reply_id, thread: thread_id}, {reported: true}, {useFindAndModify: false}, (err, data) => {
        if (!data) {
            res.send("no reply found")
        }else {
            res.send("success")
        }
    })
}

module.exports = {
    postThread: postThread,
    getBoard: getBoard,
    postReply: postReply,
    getThread: getThread,
    deleteThread: deleteThread,
    deleteReply: deleteReply,
    reportThread: reportThread,
    reportReply: reportReply
}