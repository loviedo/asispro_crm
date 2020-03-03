var express = require('express');
var app = express();
var path = require('path');
var excel = require('excel4node');//para generar excel
var user = '';//global para ver el usuario
var userId = '';//global para userid
var datos = []; //listado de datos para select dinamico

function generar_excel_clientes(rows){
    var workbook = new excel.Workbook();
    //Add Worksheets to the workbook
    var worksheet = workbook.addWorksheet('CLIENTES');
    // Create a reusable style
    var style = workbook.createStyle({
    font: {
        color: '#000000',
        size: 12
    },
    numberFormat: '#,##0.00; (#,##0.00); -'
    });
    var style1 = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        numberFormat: '#,##0; (#,##0); -'
        });

    //dibujamos el excel
    //primero la cabecera
    worksheet.cell(1,1).string('ID').style(style);
    worksheet.cell(1,2).string('NOMBRE').style(style);
    worksheet.cell(1,3).string('RUC').style(style);
    /*worksheet.cell(1,4).string('IVA 10%').style(style);
    worksheet.cell(1,5).string('IVA 5%').style(style);
    worksheet.cell(1,6).string('GASTO REAL').style(style);
    worksheet.cell(1,7).string('CONCEPTO').style(style);
    worksheet.cell(1,8).string('CONDICION FACTURA').style(style);
    worksheet.cell(1,9).string('PROVEEDOR').style(style);
    worksheet.cell(1,10).string('NRO FACTURA').style(style);
    worksheet.cell(1,11).string('ENCARGADO').style(style);
    worksheet.cell(1,12).string('CODIGO').style(style);
    worksheet.cell(1,13).string('OT NRO').style(style);*/
    //worksheet.cell(1,1).string('').style(style);

    //luego los datos
    var i = 1;
    rows.forEach(function(row) {
        worksheet.cell(i+1,2).number(Number(row.id)).style(style);
        worksheet.cell(i+1,7).string(String(row.nombre)).style(style);
        worksheet.cell(i+1,8).string(String(row.ruc)).style(style);
        /*worksheet.cell(i+1,3).number(Number(row.exentas)).style(style);
        worksheet.cell(i+1,4).number(Number(row.iva_10)).style(style);
        worksheet.cell(i+1,5).number(Number(row.iva_5)).style(style);
        worksheet.cell(i+1,6).number(Number(row.gasto_real)).style(style);
        worksheet.cell(i+1,7).string(String(row.concepto)).style(style);
        worksheet.cell(i+1,8).string(String(row.fact_condicion)).style(style);
        worksheet.cell(i+1,9).string(String(row.proveedor)).style(style);
        worksheet.cell(i+1,10).string(String(row.fact_nro)).style(style);
        worksheet.cell(i+1,11).string(String(row.encargado)).style(style);
        worksheet.cell(i+1,12).number(Number(row.codigo)).style(style1);
        worksheet.cell(i+1,13).number(Number(row.nro_ot)).style(style1);*/
        //worksheet.cell(i+1,2).string(String(row.)).style(style);//debug
        i=i+1;
        //console.log(row.descripcion);//debug
    });
    workbook.write('Listado_CLIENTES.xlsx');
}

// MOSTRAR LISTADO DE CLIENTES
app.get('/', function(req, res, next) {
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
        //vemos los datos en la base
        req.getConnection(function(error, conn) {
            conn.query('SELECT * FROM clientes ORDER BY id DESC',function(err, rows) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    res.render('clientes/listar', {title: 'Listado de CLIENTES', data: '',usuario: user})
                } else {
                    generar_excel_clientes(rows);//generamos excel CLIENTES
                    res.render('clientes/listar', {title: 'Listado de CLIENTES', usuario: user, data: rows})
                }
            })
        })
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//RESPONSE PARA CARGA DE CLIENTES -- FORMULARIO 
app.get('/add', function(req, res, next){
   
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        // render to views/user/add.ejs
        res.render('clientes/add', {
            title: 'Cargar nuevo CLIENTE', nombre: '', ruc: '', usuario_insert: user, usuario: user});
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//NUEVO CLIENTE - POST DE INSERT
app.post('/add', function(req, res, next){   
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }   
    if(user.length >0){ 
        /*req.assert('name', 'Nombre es requerido').notEmpty()           //Validar nombre
        req.assert('age', 'Edad es requerida').notEmpty()             //Validar edad
        req.assert('email', 'SE requiere un email valido').isEmail()  //Validar email
    */
        var errors = req.validationErrors();
        
        if(!errors) {//Si no hay errores, entonces conitnuamos

            //mysql acepta solos YYYY-MM-DD
            var nombre = req.sanitize('nombre').trim();
            var ruc = req.sanitize('ruc').trim();

            /*var fact_nro = Number(req.sanitize('fact_nro').trim());
            var recibo_nro = Number(req.sanitize('recibo_nro').trim());
            var remision_nro = Number(req.sanitize('remision_nro').trim());*/

            var cli = {
                nombre: nombre,
                ruc: ruc,
                usuario_insert: user
                //usuario_insert: req.sanitize('usuario_insert').trim()//no usamos en la pagina.
            }   
            
            //conectamos a la base de datos
            req.getConnection(function(error, conn) {
                conn.query('INSERT INTO clientes SET ?', cli, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err)
                        
                        // render to views/factura/add.ejs
                        res.render('clientes/add', {
                            title: 'Agregar Nuevo CLIENTE',
                            nombre: cli.nombre,
                            usuario: user,
                            ruc: cli.ruc
                        })
                    } else {                
                        req.flash('success', 'Datos agregados correctamente!')
                        
                        //console.log(datos);//debug
                        // render to views/user/add.ejs
                        res.render('clientes/add', {
                            title: 'Cargar nuevo CLIENTE', nombre: '',ruc: '', usuario_insert: user, usuario: user});
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
            
            res.render('clientes/add', { 
                title: 'Agregar Nuevo CLIENTE',
                nombre: cli.nombre,
                ruc: cli.ruc,
                usuario:cli.user,
                usuario_insert: user
            })
        }
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//FORMULARIO DE EDICION DE DATOS
app.get('/editar/:id', function(req, res, next){
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    if(user.length >0){
        req.getConnection(function(error, conn) {
            conn.query('SELECT * FROM clientes WHERE id = ' + req.params.id, function(err, rows, fields) {
                if(err) throw err
                
                // if user not found
                if (rows.length <= 0) {
                    req.flash('error', 'CLENTE con id = ' + req.params.id + ' no encontrado')
                    res.redirect('/clientes')
                }
                else { // Si existe la factura
                    // render to views/factura/edit.ejs template file
                    res.render('clientes/editar', {
                        title: 'Editar CLIENTE', 
                        //data: rows[0],
                        id: rows[0].id,
                        nombre: rows[0].nombre,
                        ruc: rows[0].ruc,
                        usuario: user
                    })
                }            
            })
        })
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

app.post('/editar/:id', function(req, res, next) {

    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    if(user.length >0){
        /*  -- VALIDACIONES ESPERAMOS
        req.assert('name', 'Name is required').notEmpty()           //Validate name
        req.assert('age', 'Age is required').notEmpty()             //Validate age
        req.assert('email', 'A valid email is required').isEmail()  //Validate email*/

        var errors = req.validationErrors()
        
        if( !errors ) {   //No errors were found.  Passed Validation!
            
            /********************************************
             * Express-validator module
             
            req.body.comment = 'a <span>comment</span>';
            req.body.username = '   a user    ';
            
            req.sanitize('comment'); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
            req.sanitize('username').trim(); // returns 'a user'
            ********************************************/
        


            var clie = {
                nombre: req.sanitize('nombre').trim(),
                ruc: req.sanitize('ruc').trim(),
                usuario_insert: user
                //usuario_insert: req.sanitize('usuario_insert').trim()//no usamos en la pagina.
            }  
            
            req.getConnection(function(error, conn) {
                conn.query('UPDATE clientes SET ? WHERE id = ' + req.params.id, clie, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err)
                        
                        // render to views/clientes/add.ejs
                        res.render('clientes/editar', {
                            title: 'Editar CLIENTE',
                            id: req.params.id,
                            nombre: req.body.nombre,
                            ruc: req.body.ruc,
                            usuario_insert: user,
                            usuario: user
                        })
                    } else {                
                        req.flash('success', 'Datos actualizados correctamente!')
                        
                        // render to views/ot/add.ejs
                        res.render('clientes/editar', {
                            title: 'Editar CLIENTE',
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
        else {   //Display errors to user
            var error_msg = ''
            errors.forEach(function(error) {
                error_msg += error.msg + '<br>'
            })
            req.flash('error', error_msg)
            res.render('clientes/editar', { 
                title: 'Editar CLIENTE',
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
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
        //vemos los datos en la base
        //DESCARGAR PDF
        var file = path.resolve("Listado_CLIENTES.xlsx");
        res.contentType('Content-Type',"application/pdf");
        res.download(file, function (err) {
            if (err) {
                console.log("ERROR AL ENVIAR EL ARCHIVO:");
                console.log(err);
            } else {
                console.log("ARCHIVO ENVIADO!");
            }
        });
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
});

// DELETE USER
app.delete('/eliminar/(:id)', function(req, res, next) {
    //primero traemos los datos de la tabla
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
    if(user.length >0){
        var cliente = { id: req.params.id }
        
        req.getConnection(function(error, conn) {
            conn.query('DELETE FROM clientes WHERE id = ' + req.params.id, cliente, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    //redireccionar al listado de GASTO
                    res.redirect('/clientes')
                } else {
                    req.flash('success', 'CLIENTE eliminado / ID = ' + req.params.id)
                    //redireccionar al listado de GASTO
                    res.redirect('/clientes')

                    //insertar log de uso de sistema en caso de suceso de insercion
                }
            })
        })
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

module.exports = app;

