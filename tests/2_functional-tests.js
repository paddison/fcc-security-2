/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

const {Thread, Reply, Board} = require("../schemas");

let pw = "123";
let board = "chai"
let idThread;
let idReply;
let idThreadReply;

chai.use(chaiHttp);

before(done => {
  Board.collection.drop();
  Thread.collection.drop();
  Reply.collection.drop();
  console.log("db wiped");
  done();
})

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test("Post a thread", (done) => {
          chai.request(server)
          .post('/api/threads/chai')
          .send({board: "chai", text: `test`, delete_password: pw})
          .end(function(err, res){
            assert.equal(res.status, 200);  
            Thread.findOne({text: `test`, board: "chai"}, (err, data) => {
              assert.equal(data.text, `test`);
              done();
            })               
          }); 
      });
      test("Post another thread", (done) => {
        chai.request(server)
        .post('/api/threads/chai')
        .send({board: "chai", text: `testReply`, delete_password: pw})
        .end(function(err, res){
          assert.equal(res.status, 200);  
          Thread.findOne({text: `testReply`, board: "chai"}, (err, data) => {
            assert.equal(data.text, `testReply`);
            idThreadReply = data._id
            done();
          })               
        }); 
    });
    });
    
    suite('GET', function() {
      test("Get boards", (done) => {
        chai.request(server)
          .get("/api/threads/chai")
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isBelow(res.body.length, 11);
            assert.notProperty(res.body[0], "delete_password");
            assert.notProperty(res.body[0], "reported");
            assert.property(res.body[0], "text");
            assert.property(res.body[0], "board");
            assert.property(res.body[0], "created_on");
            idThread = res.body[0]._id;
            done();
          });
      })
    });

    suite('DELETE', function() {
      test("use incorrect password", done => {
        chai.request(server)
          .delete("/api/threads/chai")
          .send({board: board, thread_id: idThread, delete_password: "xxx"})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "incorrect password")
            Thread.findById(idThread, (err, data) => {
              assert.equal(data._id, idThread)
              done();
            })
          })
      });
      test("delete with correct password", done => {
        chai.request(server)
          .delete("/api/threads/chai")
          .send({board: board, thread_id: idThread, delete_password: pw})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success")
            Thread.findById(idThread, (err, data) => {
              assert.isNotOk(data)
              done();
            });
          });
      });
    });  
    
    suite('PUT', function() {
      test("Report an exisiting thread", (done) => {
        chai.request(server)
          .put("/api/threads/chai")
          .send({board: "chai", thread_id: idThreadReply})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success")
            Thread.findById(idThreadReply, (err, data) => {
              assert.equal(data.reported, true);
              done();
            })
          })
      });
      test("Report invalid id", (done) => {
        chai.request(server)
        .put("/api/threads/chai")
        .send({board: board, thread_id: "123"})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "no thread found")
          done()
        });
      });
    });
  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test("Post a reply", (done) => {
          chai.request(server)
          .post('/api/replies/chai')
          .send({board: "chai", text: "reply", delete_password: pw, thread_id: idThreadReply})
          .end(function(err, res){
            assert.equal(res.status, 200);  
            Reply.findOne({text: "reply", thread: idThreadReply}, (err, data) => {
              assert.equal(data.text, "reply");
              idReply = data._id
              done();
            })             
          }); 
      });
    });
    
    suite('GET', function() {
      test("Get thread from board", (done) => {
        chai.request(server)
          .get("/api/replies/chai?thread_id=" + idThreadReply)
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.equal(res.body._id, idThreadReply);
            assert.property(res.body, "replies")
            assert.equal(res.body.replies[0]._id, idReply)
            done();
          });
      });
    });
    
    suite('PUT', function() {
      test("Report an exisiting reply", (done) => {
        chai.request(server)
          .put("/api/replies/chai")
          .send({board: board, reply_id: idReply, thread_id: idThreadReply})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success")
            Reply.findById(idReply, (err, data) => {
              assert.equal(data.reported, true);
              done();
            })
          })
      });
      test("Report invalid id", (done) => {
        chai.request(server)
        .put("/api/replies/chai")
        .send({board: board, reply_id: "123", thread_id: idThreadReply})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, "no reply found")
          done()
        });
      });
    });
    
    suite('DELETE', function() {
      test("use incorrect password", done => {
        chai.request(server)
          .delete("/api/replies/chai")
          .send({board: board, reply_id: idReply, thread_id: idThreadReply, delete_password: "xxx"})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "incorrect password")           
            done();           
          })
      });
      test("delete with correct password", done => {
        chai.request(server)
          .delete("/api/replies/chai")
          .send({board: board, reply_id: idReply, thread_id: idThreadReply, delete_password: pw})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success")
            done();    
          });
      });
    });   
  });
});
