/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const {postThread, getBoard, postReply, getThread, deleteThread, deleteReply, reportThread, reportReply} = require("../handlers")

module.exports = function (app) {
  app.route('/api/threads/:board')
    .post(postThread)
    .get(getBoard)
    .put(reportThread)
    .delete(deleteThread)
    
  app.route('/api/replies/:board')
    .post(postReply)
    .get(getThread)
    .put(reportReply)
    .delete(deleteReply)

};
