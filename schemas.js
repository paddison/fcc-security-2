var mongoose = require("mongoose")

const boardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    threads: [{type: mongoose.Schema.Types.ObjectId, ref: "Thread"}]
});

const threadSchema = new mongoose.Schema({
    board: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },    
    created_on: {
        type: Date,
        default: new Date(),
        required: true
    },    
    bumped_on: {
        type: Date,
        default: new Date(),
        required: true
    },    
    reported: {
        type: Boolean,
        default: false,
        required: true
    },    
    delete_password: {
        type: String,
        required: true
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Reply"
    }]
});
  
const replySchema = new mongoose.Schema({
    thread: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Thread"
    },
    text: {
        type: String,
        required: true
    },    
    created_on: {
        type: Date,
        default: new Date(),
        required: true
    }, 
    delete_password: {
        type: String,
        required: true
    },
    reported: {
        type: Boolean,
        default: false,
        required: true
    }
});
  

module.exports = {
    Thread: mongoose.model("Thread", threadSchema),
    Reply: mongoose.model("Reply", replySchema),
    Board: mongoose.model("Board", boardSchema)
} 