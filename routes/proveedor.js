var express = require('express');
var app = express();
var path = require('path');
var excel = require('excel4node');//para generar excel
var user = '';//global para ver el usuario
var userId = '';//global para userid
var datos = []; //listado de datos para select dinamico




// MOSTRAR LISTADO DE PROVEEDORES
app.get('/', function(req, res, next) {
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
        //vemos los datos en la base
        req.getConnection(function(error, conn) {
            conn.query('SELECT * FROM proveedores ORDER BY id DESC',function(err, rows) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    res.render('proveedores/listar', {title: 'Listado de Proveedores', data: '',usuario: user})
                } else {
                    generar_excel_clientes(rows);//generamos excel CLIENTES
                    res.render('proveedores/listar', {title: 'Listado de Proveedores', usuario: user, data: rows})
                }
            })
        })
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//RESPONSE PARA CARGA DE PROVEEDOR -- FORMULARIO 
app.get('/add', function(req, res, next){
   
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        res.render('proveedores/add', { title: 'Cargar nuevo PROVEEDOR', nombre: '', ruc: '', usuario_insert: user, usuario: user});
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//NUEVO PROVEEDOR - POST DE INSERT
app.post('/add', function(req, res, next){   
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }   
    if(user.length >0){ 
        var errors = req.validationErrors();
        
        if(!errors) {//Si no hay errores, entonces conitnuamos
            //mysql acepta solos YYYY-MM-DD
            var nombre = req.sanitize('nombre').trim();
            var ruc = req.sanitize('ruc').trim();

            var pro = { nombre: nombre, ruc: ruc, usuario_insert: user}   
            
            //conectamos a la base de datos
            req.getConnection(function(error, conn) {
                conn.query('INSERT INTO proveedor SET ?', pro, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err)
                        
                        // render to views/factura/add.ejs
                        res.render('proveedores/add', {
                            title: 'Agregar Nuevo PROVEEDOR',
                            nombre: gasto.nombre,
                            ruc: gasto.ruc
                        })
                    } else {                
                        req.flash('success', 'Datos agregados correctamente!')
                        
                        //console.log(datos);//debug
                        // render to views/user/add.ejs
                        res.render('proveedores/add', {title: 'Cargar nuevo PROVEEDOR', nombre: '',ruc: '', usuario_insert: user, usuario: user});
                    }
                })
            })
        }
        //tuvimos errores
        else {//Mostrar errores
            var error_msg = ''
            errors.forEach(function(error) {
                error_msg += error.msg + '<br>'
            })                
            req.flash('error', error_msg)        
            
            res.render('proveedores/add', {title: 'Agregar Nuevo PROVEEDOR', nombre: gasto.nombre, ruc: gasto.ruc, usuario_insert: user })
        }
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//FORMULARIO DE EDICION DE DATOS
app.get('/editar/:id', function(req, res, next){
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    if(user.length >0){
        req.getConnection(function(error, conn) {
            conn.query('SELECT * FROM proveedores WHERE id = ' + req.params.id, function(err, rows, fields) {
                if(err) throw err
                
                // if user not found
                if (rows.length <= 0) {
                    req.flash('error', 'PROVEEDOR con id = ' + req.params.id + ' no encontrado')
                    res.redirect('/proveedores')
                }
                else { // Si existe la factura
                    // render to views/factura/edit.ejs template file
                    res.render('proveedores/editar', {title: 'Editar PROVEEDOR', id: rows[0].id, nombre: rows[0].nombre, ruc: rows[0].ruc, usuario: user })
                }            
            })
        })
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

app.post('/editar/:id', function(req, res, next) {

    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    if(user.length >0){
        var errors = req.validationErrors()
        
        if( !errors ) {
            var pro = {nombre: req.sanitize('nombre').trim(), ruc: req.sanitize('ruc').trim(), usuario_insert: user}  
            
            req.getConnection(function(error, conn) {
                conn.query('UPDATE proveedor SET ? WHERE id = ' + req.params.id, pro, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err)
                        
                        // render to views/clientes/add.ejs
                        res.render('proveedores/editar', {
                            title: 'Editar PROVEEDOR',
                            id: req.params.id,
                            nombre: req.body.nombre,
                            ruc: req.body.ruc,
                            usuario_insert: user,
                            usuario: user
                        })
                    } else {                
                        req.flash('success', 'Datos actualizados correctamente!')
                        
                        // render to views/ot/add.ejs
                        res.render('proveedores/editar', {
                            title: 'Editar PROVEEDOR',
                            id: req.params.id,
                            nombre: req.body.nombre,
                            ruc: req.body.ruc,
                            usuario_insert: user,
                            usuario: user               
                        })
                    }
                })
            })
        }
        else {//mostramos error
            var error_msg = ''
            errors.forEach(function(error) {
                error_msg += error.msg + '<br>'
            })
            req.flash('error', error_msg)
            res.render('proveedores/editar', { 
                title: 'Editar PROVEEDOR',
                nombre: req.body.nombre,
                ruc: req.body.ruc,
                usuario_insert: user
            })
        }
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

/* GENERAMOS Y ENVIAMOS EXCEL */
app.post('/descargar', function(req, res, next) {
    //primero traemos los datos de la tabla
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
        //vemos los datos en la base
        //DESCARGAR PDF
        var file = path.resolve("Listado_PROVEEDOR.xlsx");
        res.contentType('Content-Type',"application/pdf");
        res.download(file, function (err) {
            if (err) {
                console.log("ERROR AL ENVIAR EL ARCHIVO:");
                console.log(err);
            } else { console.log("ARCHIVO ENVIADO!"); }
        });
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
});

// DELETE USER
app.delete('/eliminar/(:id)', function(req, res, next) {
    //primero traemos los datos de la tabla
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
    if(user.length >0){
        var proveedor = { id: req.params.id }
        
        req.getConnection(function(error, conn) {
            conn.query('DELETE FROM proveedor WHERE id = ' + req.params.id, proveedor, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    res.redirect('/proveedores')
                } else {
                    req.flash('success', 'PROVEEDOR eliminado / ID = ' + req.params.id)
                    //redireccionar al listado de GASTO
                    res.redirect('/proveedores')

                    //insertar log de uso de sistema en caso de suceso de insercion
                }
            })
        })
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})


module.exports = app;