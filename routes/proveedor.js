

var path = require('path');
var express = require('express');
var app = express();
var user = '';//global para ver el usuario


// ADD NEW factura POST ACTION
app.post('/add', function(req, res, next){ 
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
        //controlamos quien se loga.
	if(user.length >0){
        //vemos los datos en la base
        var prov = {
            nombre: req.sanitize('nombre').escape().trim(),
            ruc: req.sanitize('ruc').escape().trim(),
            usuario_insert: user
        }   
        
        //conectamos a la base de datos
        req.getConnection(function(error, conn) {
            conn.query('INSERT INTO proveedor SET ?', prov, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err);
                    // render to views/factura/add.ejs
                } else {                
                    req.flash('success', 'Datos agregados correctamente!');
                }
            })
        })
    }
    else {
        // render to views/index.ejs template file
        res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});
    }
})

module.exports = app;