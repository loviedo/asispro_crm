/* LOGIN DE USUARIO */

var express = require('express')
var app = express()

/* al venir aca vemos entregamos  */
app.get('/', function(req, res) {
    // render to views/index.ejs template file
    res.render('index', {title: 'ASISPRO ERP', message: 'test'})
})
 
exports.signup = function(req, res){
    message = '';
    if(req.method == "POST"){
       //post data
 
    } else {
       res.render('signup');
    }
 };
/** 
 * We assign app object to module.exports
 * 
 * module.exports exposes the app object as a module
 * 
 * module.exports should be used to return the object 
 * when this file is required in another module like app.js
 */ 
module.exports = app;