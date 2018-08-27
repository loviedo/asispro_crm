/*
15) As you can see above app.js code, we have loaded two local files/modules: 
routes/index.js and routes/users.js. These two files contains code to show content of index and users page.
*/

var express = require('express')
var app = express()
var user = '';//global para ver el usuario
var userId = '';
 
app.get('/', function(req, res) {
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    
    //controlamos quien se loga.
	if(user.length >0){
        //si no estalogado entonces pasamos null y no se muestran algunas cosas.
		res.render("index", {title: 'ASISPRO ERP', message: 'UD ESTA LOGADO:', usuario: user});
		return;
    }
    else {
        // render to views/index.ejs template file
        res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});
    }
})

app.get('/login', function(req, res) {
    // render to views/index.ejs template file
    res.render('login', {title: 'ASISPRO ERP', message: 'login', usuario: user})
})

//SOLO PARA DEBUG, NO SE DEBE MOSTRAR
app.get('/signup', function(req, res) {
    // render to views/index.ejs template file
    res.render('signup', {title: 'ASISPRO ERP', message: 'signup', usuario: user})
})

//PARA DESLOGAR SESION - APLICAR
app.get('/logout', function(req, res) {
    var user1 = req.session.user;//quien cerro sesion
    req.session.destroy(function(err){  
        if(err){  console.log(err);  }  
        else  
        {  console.log('sesion cerrada / usuario: ' + user1); }  
    }); 
    //req.session = null;
    user = '';
    res.redirect('/'); //cerramos la sesion y vamos al home
})


//EJEMPLO DE PAGINA PARA USAR COMO SESION
//pagina que debemos controlar si ya se logo el usuario
app.get('/dashboard', function(req, res,next) {
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    
    //controlamos quien se loga.
	if(user.length>0){
        req.getConnection(function(error, conn) {
            var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'"; 
            conn.query(sql,function(err, rows, fields) {
                console.log(rows);
                res.render('dashboard', {title: 'ASISPRO ERP', message: 'fulano',usuario:rows[0].user_name});
            })
        })
    }
    else
    {   res.render("login", {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});
		return;
    }

})


//ACCION PARA LOGIN
app.post('/login', function(req, res, next) {
    var post  = req.body;
    var name= post.user_name;//campo del form
    var pass= post.password;//campo del form

    req.getConnection(function(error, conn) {
        var sql="SELECT id, first_name, last_name, user_name FROM users WHERE user_name='"+name+"' and password = '"+pass+"'";  
        conn.query(sql,function(err, rows, fields) {
            //SI ERROR / MOSTRAR / mejorar el mensaje segun codigo
            if (err) {
                res.render('login',{title: 'TEST APLICACION ASISPRO', message: 'Usuario o Contrasena equivocada'});
            } else {
                if (rows.length > 0)
                {   // render views/facturas/listar.ejs
                    req.session.userId = rows[0].id;
                    req.session.user = rows[0].user_name;
                    console.log(rows[0].id);
                    res.redirect('/dashboard');
                }
                else
                {   res.render('login',{title: 'TEST APLICACION ASISPRO', message: 'Usuario o Contrasena equivocada'});}

            }
        })
    })
})

app.post('/signup', function(req, res, next) {
    var post = req.body;
    //lo siguiente esta al pedo
    var name= post.user_name;
    var pass= post.password;
    var fname= post.first_name;
    var lname= post.last_name;
    var mob= post.mob_no;

    //aqui construimos el insert, los nombres de los campos de la tabla deben ser asignados
    var usuario = {
        first_name: req.sanitize('first_name').escape(),
        last_name: req.sanitize('last_name'),
        mob_no: req.sanitize('mob_no'),
        user_name: req.sanitize('user_name'),
        password: req.sanitize('password')
    }

    req.getConnection(function(error, conn) {
        //var sql = "INSERT INTO users (first_name,last_name,mob_no,user_name, password) VALUES ('" + fname + "','" + lname + "','" + mob + "','" + name + "','" + pass + "')";
        conn.query('INSERT INTO `users` SET ?',usuario,function(err, results) {
            //SI ERROR / MOSTRAR / mejorar el mensaje segun codigo
            if (err) {
                res.render('signup',{title: 'TEST APLICACION ASISPRO', message: err.sql+ " - " + err.sqlMessage, usuario: ''});
            } else {
                // render to views/facturas/listar.ejs template file
                message = "Succesfully! Your account has been created.";
                res.render('signup',{title: 'TEST APLICACION ASISPRO',message: message, usuario: ''});
            }
        })
    })
})





 
/** 
 * We assign app object to module.exports
 * 
 * module.exports exposes the app object as a module
 * 
 * module.exports should be used to return the object 
 * when this file is required in another module like app.js
 */ 
module.exports = app;