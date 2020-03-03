var express = require('express');
var app = express();
var path = require('path');
var excel = require('excel4node');//para generar excel
var user = '';//global para ver el usuario
var userId = '';//global para userid
var datos = []; //listado de datos para select dinamico


function generar_excel_provedores(rows){
    var workbook = new excel.Workbook();
    //Add Worksheets to the workbook
    var worksheet = workbook.addWorksheet('PROVEEDORES');
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
        worksheet.cell(i+1,1).number(Number(row.id)).style(style);
        worksheet.cell(i+1,2).string(String(row.nombre)).style(style);
        worksheet.cell(i+1,3).string(String(row.ruc)).style(style);
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
    workbook.write('Listado_PROVEEDOR.xlsx');
}

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
            conn.query('SELECT * FROM proveedor ORDER BY id DESC',function(err, rows) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    res.render('proveedor/listar', {title: 'Listado de Proveedores', data: '',usuario: user})
                } else {
                    generar_excel_provedores(rows);//generamos excel CLIENTES
                    res.render('proveedor/listar', {title: 'Listado de Proveedores', usuario: user, data: rows})
                }
            })
        })
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//RESPONSE PARA CARGA DE PROVEEDOR -- FORMULARIO 
app.get('/add', function(req, res, next){
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        res.render('proveedor/add', { title: 'Cargar nuevo PROVEEDOR', nombre: '', ruc: '', usuario_insert: user, usuario: user});
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//NUEVO PROVEEDOR - POST DE INSERT
app.post('/add', function(req, res, next){   
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }   
    if(user.length >0){ 
        var errors = req.validationErrors();
        
        if(!errors) {//Si no hay errores, entonces conitnuamos
            //mysql acepta solos YYYY-MM-DD
            var nombre = req.sanitize('nombre').trim();
            var ruc = req.sanitize('ruc').trim();

            var pro = { nombre: nombre, ruc: ruc}   
            
            //conectamos a la base de datos
            req.getConnection(function(error, conn) {
                conn.query('INSERT INTO proveedor SET ?', pro, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err)
                        
                        // render to views/factura/add.ejs
                        res.render('proveedor/add', {
                            title: 'Agregar Nuevo PROVEEDOR',
                            nombre: pro.nombre,
                            usuario: user,
                            ruc: pro.ruc
                        })
                    } else {                
                        req.flash('success', 'Datos agregados correctamente!')
                        
                        //console.log(datos);//debug
                        // render to views/user/add.ejs
                        res.render('proveedor/add', {title: 'Cargar nuevo PROVEEDOR', nombre: '',ruc: '', usuario_insert: user, usuario: user});
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
            
            res.render('proveedor/add', {title: 'Agregar Nuevo PROVEEDOR', nombre: pro.nombre, ruc: pro.ruc, usuario_insert: user })
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
            conn.query('SELECT * FROM proveedor WHERE id = ' + req.params.id, function(err, rows, fields) {
                if(err) throw err
                
                // if user not found
                if (rows.length <= 0) {
                    req.flash('error', 'PROVEEDOR con id = ' + req.params.id + ' no encontrado')
                    res.redirect('/proveedor')
                }
                else { // Si existe la factura
                    // render to views/factura/edit.ejs template file
                    res.render('proveedor/editar', {title: 'Editar PROVEEDOR', id: rows[0].id, nombre: rows[0].nombre, ruc: rows[0].ruc, usuario: user })
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
        var errors = req.validationErrors()
        
        if( !errors ) {
            var pro = {nombre: req.sanitize('nombre').trim(), ruc: req.sanitize('ruc').trim()}  
            
            req.getConnection(function(error, conn) {
                conn.query('UPDATE proveedor SET ? WHERE id = ' + req.params.id, pro, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err)
                        
                        // render to views/clientes/add.ejs
                        res.render('proveedor/editar', {
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
                        res.render('proveedor/editar', {
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
            res.render('proveedor/editar', { 
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
    if(req.session.loggedIn)
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
    if(req.session.loggedIn)
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
                    res.redirect('/proveedor')
                } else {
                    req.flash('success', 'PROVEEDOR eliminado / ID = ' + req.params.id)
                    //redireccionar al listado de GASTO
                    res.redirect('/proveedor')

                    //insertar log de uso de sistema en caso de suceso de insercion
                }
            })
        })
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})


module.exports = app;