
/*
16) routes/users.js is responsible for handling CRUD operations like adding, 
editing, deleting and viewing users from database. Database queries, form validation and template rendering is done here.
 */

var path = require('path');
var express = require('express');
var app = express();
var excel = require('excel4node');//para generar excel
var user = '';//global para ver el usuario
var userId = '';//global para userid
 

function formatear_fecha_yyyymmdd(date) {
    var d;

    if(date)
    {
    //hay que ver si es string o date el objeto que viene
    if(date.constructor == String)
    {   
        var arr = date.split("-");
        /*d = new Date(arr[0],arr[1],arr[2],0,0,0,0);
        month = '' + (d.getMonth());
        day = '' + (d.getDate());
        year = d.getFullYear();*/
        month = arr[1];
        day = arr[2];
        year = arr[0];


    }
    else
    {   d = new Date(date);
        month = '' + (d.getMonth()+1);
        day = '' + (d.getDate());
        year = d.getFullYear();
    }


    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');//retornamos valor como a mysql le gusta
    }
    else{return null;}
}

function formatear_fecha(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    
    if(month == 12 && day == 31 && year == 1969)
    { return "-";}
    else
    {return [day,month,year].join('/');}//retornamos valor como a mysql le gusta
}

function generar_excel_ot(rows){
    var workbook = new excel.Workbook();
    //Add Worksheets to the workbook
    var worksheet = workbook.addWorksheet('OTs');
    // Create a reusable style
    var style = workbook.createStyle({
    font: {
        color: '#000000',
        size: 12
    },
    numberFormat: '$#,##0.00; ($#,##0.00); -'
    });

    //dibujamos el excel
    //primero la cabecera
    worksheet.cell(1,1).string('OT NRO').style(style);
    worksheet.cell(1,2).string('FECHA EMISION').style(style);
    worksheet.cell(1,3).string('FECHA INICIO EJECUCION').style(style);
    worksheet.cell(1,4).string('FECHA FIN EJECUCION').style(style);
    worksheet.cell(1,5).string('FACTURA NRO').style(style);
    worksheet.cell(1,6).string('RECIBO NRO').style(style);
    worksheet.cell(1,7).string('REMISION NRO').style(style);
    worksheet.cell(1,8).string('TIPO FACTURA').style(style);
    worksheet.cell(1,9).string('ESTADO FACTURA').style(style);
    worksheet.cell(1,10).string('CLIENTE').style(style);
    worksheet.cell(1,11).string('OBRA').style(style);
    worksheet.cell(1,12).string('DESCRIPCION').style(style);
    worksheet.cell(1,13).string('ENCARGADO').style(style);
    //worksheet.cell(1,1).string('').style(style);

    //luego los datos
    var i = 1;
    rows.forEach(function(row) {

        worksheet.cell(i+1,1).string(String(row.ot_nro)).style(style);
        worksheet.cell(i+1,2).string(String(formatear_fecha(row.fec_emision))).style(style);
        worksheet.cell(i+1,3).string(String(formatear_fecha(row.fec_ini_ejecucion))).style(style);
        worksheet.cell(i+1,4).string(String(formatear_fecha(row.fec_fin_ejecucion))).style(style);
        //worksheet.cell(i+1,2).date(Date(formatear_fecha(row.fec_emision))).style({numberFormat: 'dd/mm/yyyy'});
        //worksheet.cell(i+1,3).date(Date(formatear_fecha(row.fec_ini_ejecucion))).style({numberFormat: 'dd/mm/yyyy'});
        //worksheet.cell(i+1,4).date(Date(formatear_fecha(row.fec_fin_ejecucion))).style({numberFormat: 'dd/mm/yyyy'});
        worksheet.cell(i+1,5).string(String(row.fact_nro)).style(style);
        worksheet.cell(i+1,6).string(String(row.recibo_nro)).style(style);
        worksheet.cell(i+1,7).string(String(row.remision_nro)).style(style);
        worksheet.cell(i+1,8).string(String(row.fact_tipo)).style(style);
        worksheet.cell(i+1,9).string(String(row.fact_estado)).style(style);
        worksheet.cell(i+1,10).string(String(row.cliente)).style(style);
        worksheet.cell(i+1,11).string(String(row.obra)).style(style);
        worksheet.cell(i+1,12).string(String(row.descripcion)).style(style);
        worksheet.cell(i+1,13).string(String(row.encargado)).style(style);
        //worksheet.cell(i+1,2).string(String(row.)).style(style);//debug
        i=i+1;
        //console.log(row.descripcion);//debug
    });
    workbook.write('Listado_OT.xlsx');
}


// MOSTRAR LISTA DE FACTURAS
app.get('/', function(req, res, next) {
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
        //vemos los datos en la base
        req.getConnection(function(error, conn) {
            conn.query('SELECT * FROM ot ORDER BY ot_nro DESC',function(err, rows) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    res.render('ot/listar', {title: 'Listado de OTs', data: '',usuario: user})
                } else {
                    // render views/ot/listar.ejs
                    generar_excel_ot(rows);//generamos excel
                    res.render('ot/listar', {title: 'Listado de Facturas',usuario: user, data: rows})
                }
            })
        })
    }
    else {
        // render to views/index.ejs template file
        res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});
    }
})
 
// SHOW ADD USER FORM
app.get('/add', function(req, res, next){    
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        // render to views/user/add.ejs
        res.render('ot/add', {
            title: 'Cargar nueva OT', ot_nro: '', fec_emision: '',fec_ini_ejecucion: '',fec_fin_ejecucion: '',fact_nro: '',recibo_nro: '',remision_nro: '', 
            fact_tipo: '',fact_estado: '',cliente: '', obra: '', descripcion: '',encargado: '', usuario_insert: user, usuario: user})
    }
    else {
        // render to views/index.ejs template file
        res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});
    }
})
 
// ADD NEW factura POST ACTION
app.post('/add', function(req, res, next){   
    
    /*req.assert('name', 'Nombre es requerido').notEmpty()           //Validar nombre
    req.assert('age', 'Edad es requerida').notEmpty()             //Validar edad
    req.assert('email', 'SE requiere un email valido').isEmail()  //Validar email
 */
    var errors = req.validationErrors()
    
    if( !errors ) {//Si no hay errores, entonces conitnuamos
        
        /********************************************
         * Express-validator module
         
        req.body.comment = 'a <span>comment</span>';
        req.body.username = '   a user    ';
        req.sanitize('comment'); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
        req.sanitize('username').trim(); // returns 'a user'
        ********************************************/

        //mysql acepta solos YYYY-MM-DD
        var date1 = req.sanitize('fec_emision').trim();
        var date2 = req.sanitize('fec_ini_ejecucion').trim();
        var date3 = req.sanitize('fec_fin_ejecucion').trim();
        var fact_nro = Number(req.sanitize('fact_nro').trim());
        var recibo_nro = Number(req.sanitize('recibo_nro').trim());
        var remision_nro = Number(req.sanitize('remision_nro').trim());

        var ot = {
            ot_nro: req.sanitize('ot_nro').trim(),
            fec_emision: formatear_fecha_yyyymmdd(date1),
            fec_ini_ejecucion: formatear_fecha_yyyymmdd(date2),
            fec_fin_ejecucion: formatear_fecha_yyyymmdd(date3),
            fact_nro: fact_nro,
            recibo_nro: recibo_nro,
            remision_nro: remision_nro,
            fact_tipo: req.sanitize('fact_tipo').trim(),
            fact_estado: req.sanitize('fact_estado').trim(),
            cliente: req.sanitize('cliente').trim(),
            obra: req.sanitize('obra').trim(),
            descripcion: req.sanitize('descripcion').trim(),
            encargado: req.sanitize('encargado').trim(),
            usuario_insert: user
            //usuario_insert: req.sanitize('usuario_insert').trim()//no usamos en la pagina.
        }   
        
        //conectamos a la base de datos
        req.getConnection(function(error, conn) {
            conn.query('INSERT INTO ot SET ?', ot, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    
                    // render to views/factura/add.ejs
                    res.render('ot/add', {
                        title: 'Agregar Nueva OT',
                        ot_nro: ot.ot_nro,
                        fec_emision: ot.fec_emision,
                        fec_ini_ejecucion: ot.fec_ini_ejecucion,
                        fec_fin_ejecucion: ot.fec_fin_ejecucion,
                        fact_nro: ot.fact_nro,
                        recibo_nro: ot.recibo_nro,
                        remision_nro: ot.remision_nro,
                        fact_tipo: ot.fact_tipo,
                        fact_estado: ot.fact_estado,
                        cliente: ot.cliente,
                        obra: ot.obra,
                        descripcion: ot.descripcion,
                        encargado: ot.encargado,
                        usuario: user
                    })
                } else {                
                    req.flash('success', 'Datos agregados correctamente!')
                    
                    // render to views/ot/add.ejs
                    res.render('ot/add', {
                        title: 'Agregar nueva Factura',
                        ot_nro: '',
                        fec_emision: '',
                        fec_ini_ejecucion: '',
                        fec_fin_ejecucion: '',
                        fact_nro: '',
                        recibo_nro: '',
                        remision_nro: '',
                        fact_tipo: '',
                        fact_estado: '',
                        cliente: '',
                        obra: '',
                        descripcion: '',
                        encargado: '',
                        usuario: user                 
                    })
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
        
        /**
         * Using req.body.name 
         * because req.param('name') is deprecated
         */ 
        res.render('ot/add', { 
            title: 'Agregar Nueva OT',
            ot_nro: req.body.ot_nro,
            fec_emision: req.body.fec_emision,
            fec_ini_ejecucion: req.body.fec_ini_ejecucion,
            fec_fin_ejecucion: req.body.fec_fin_ejecucion,
            fact_nro: req.body.fact_nro,
            recibo_nro: req.body.recibo_nro,
            remision_nro: req.body.remision_nro,
            fact_tipo: req.body.fact_tipo,
            fact_estado: req.body.fact_estado,
            remision_nro: req.body.remision_nro,
            cliente: req.body.cliente,
            obra: req.body.obra,
            descripcion: req.body.descripcion,
            encargado: req.body.encargado,
            usuario_insert: user
        })
    }
})
 
// SHOW EDIT USER FORM
app.get('/editar/:id', function(req, res, next){
    req.getConnection(function(error, conn) {
        conn.query('SELECT * FROM ot WHERE id = ' + req.params.id, function(err, rows, fields) {
            if(err) throw err
            
            // if user not found
            if (rows.length <= 0) {
                req.flash('error', 'OT con id = ' + req.params.id + ' no encontrada')
                res.redirect('/ot')
            }
            else { // Si existe la factura
                // render to views/factura/edit.ejs template file

                var date1 = rows[0].fec_emision;
                var date2 = rows[0].fec_ini_ejecucion;
                var date3 = rows[0].fec_fin_ejecucion;

                res.render('ot/editar', {
                    title: 'Editar OT', 
                    //data: rows[0],
                    id: rows[0].id,
                    ot_nro: rows[0].ot_nro,
                    fec_emision: formatear_fecha_yyyymmdd(date1),
                    fec_ini_ejecucion: formatear_fecha_yyyymmdd(date2),
                    fec_fin_ejecucion: formatear_fecha_yyyymmdd(date3),
                    fact_nro: rows[0].fact_nro,
                    recibo_nro: rows[0].recibo_nro,
                    remision_nro: rows[0].remision_nro,
                    fact_tipo: rows[0].fact_tipo,
                    fact_estado: rows[0].fact_estado,
                    cliente: rows[0].cliente,
                    obra: rows[0].obra,
                    descripcion: rows[0].descripcion,
                    encargado: rows[0].encargado,
                    usuario_insert: user,
                    usuario: user
                })
            }            
        })
    })
})
 
// EDIT USER POST ACTION
app.post('/editar/:id', function(req, res, next) {
    /*  -- VALIDACIONES ESPERAMOS
    req.assert('name', 'Name is required').notEmpty()           //Validate name
    req.assert('age', 'Age is required').notEmpty()             //Validate age
    req.assert('email', 'A valid email is required').isEmail()  //Validate email
    */
    var errors = req.validationErrors()
    
    if( !errors ) {   //No errors were found.  Passed Validation!
        
        /********************************************
         * Express-validator module
         
        req.body.comment = 'a <span>comment</span>';
        req.body.username = '   a user    ';
 
        req.sanitize('comment'); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
        req.sanitize('username').trim(); // returns 'a user'
        ********************************************/

        //mysql acepta solos YYYY-MM-DD
        //console.log(req.sanitize('fec_emision').trim());//debug
        var date1 = req.sanitize('fec_emision').trim();
        var date2 = req.sanitize('fec_ini_ejecucion').trim();
        var date3 = req.sanitize('fec_fin_ejecucion').trim();

        var fact_nro = Number(req.sanitize('fact_nro').trim());
        var recibo_nro = Number(req.sanitize('recibo_nro').trim());
        var remision_nro = Number(req.sanitize('remision_nro').trim());

       var ot = {
            ot_nro: req.sanitize('ot_nro').trim(),
            fec_emision: formatear_fecha_yyyymmdd(date1),
            fec_ini_ejecucion: formatear_fecha_yyyymmdd(date2),
            fec_fin_ejecucion: formatear_fecha_yyyymmdd(date3),
            fact_nro: fact_nro,
            recibo_nro: recibo_nro,
            remision_nro: remision_nro,
            fact_tipo: req.sanitize('fact_tipo').trim(),
            fact_estado: req.sanitize('fact_estado').trim(),
            cliente: req.sanitize('cliente').trim(),
            obra: req.sanitize('obra').trim(),
            descripcion: req.sanitize('descripcion').trim(),
            encargado: req.sanitize('encargado').trim(),
            usuario_insert: user
            //usuario_insert: req.sanitize('usuario_insert').trim()//no usamos en la pagina.
        }
        
        req.getConnection(function(error, conn) {
            conn.query('UPDATE ot SET ? WHERE id = ' + req.params.id, ot, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    
                    // render to views/user/add.ejs
                    res.render('ot/editar', {
                        title: 'Editar OT',
                        id: req.params.id, 
                        ot_nro: req.body.ot_nro,
                        fec_emision: req.body.fec_emision, 
                        fec_ini_ejecucion: req.body.fec_ini_ejecucion, 
                        fec_fin_ejecucion: req.body.fec_fin_ejecucion,
                        fact_nro: req.body.fact_nro,
                        recibo_nro: req.body.recibo_nro,
                        remision_nro: req.body.remision_nro,
                        fact_tipo: req.body.fact_tipo,
                        fact_estado: req.body.fact_estado,
                        cliente: req.body.cliente,
                        obra: req.body.obra,
                        descripcion: req.body.descripcion,
                        encargado: req.body.encargado,
                        usuario_insert: user,
                        usuario: user
                    })
                } else {
                    req.flash('success', 'OT actualizada exitosamente!')
                    
                    // render ot/editar
                    res.render('ot/editar', {
                        title: 'Editar OT',
                        id: req.params.id, 
                        ot_nro: req.body.ot_nro,
                        fec_emision: req.body.fec_emision,
                        fec_ini_ejecucion: req.body.fec_ini_ejecucion, 
                        fec_fin_ejecucion: req.body.fec_fin_ejecucion,
                        fact_nro: req.body.fact_nro,
                        recibo_nro: req.body.recibo_nro,
                        remision_nro: req.body.remision_nro,
                        fact_tipo: req.body.fact_tipo,
                        fact_estado: req.body.fact_estado,
                        cliente: req.body.cliente,
                        obra: req.body.obra,
                        descripcion:req.body.descripcion,
                        encargado:req.body.encargado,
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
        
        /**
         * Using req.body.name 
         * because req.param('name') is deprecated
         */ 
        res.render('ot/editar', { 
            title: 'Editar OT',            
            ot_nro: req.body.ot_nro,
            fec_emision: req.body.fec_emision,
            fec_ini_ejecucion: req.body.fec_ini_ejecucion,
            fec_fin_ejecucion: req.body.fec_fin_ejecucion,
            fact_nro: req.body.fact_nro,
            recibo_nro: req.body.recibo_nro,
            remision_nro: req.body.remision_nro,
            fact_tipo: req.body.fact_tipo,
            fact_estado: req.body.fact_estado,
            remision_nro: req.body.remision_nro,
            cliente: req.body.cliente,
            obra: req.body.obra,
            descripcion: req.body.descripcion,
            encargado: req.body.encargado,
            usuario_insert: user,
            usuario: user
        })
    }
})
 

/* GENERAMOS Y ENVIAMOS EXCEL OT */
app.post('/descargar', function(req, res, next) {
    //primero traemos los datos de la tabla
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
        //vemos los datos en la base
        //DESCARGAR PDF CON DATOS DEL ESTUDIO
        var file = path.resolve("Listado_OT.xlsx");
        res.contentType('Content-Type',"application/pdf");
        res.download(file, function (err) {
            if (err) {
                console.log("ERROR AL ENVIAR EL ARCHIVO:");
                console.log(err);
            } else {
                console.log("ARCHIVO ENVIADO!");
            }
        });
    }
    else {
        // render to views/index.ejs template file
        res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});
    }
});

// DELETE USER
app.delete('/eliminar/(:id)', function(req, res, next) {
    var ot = { id: req.params.id }
    
    req.getConnection(function(error, conn) {
        conn.query('DELETE FROM ot WHERE id = ' + req.params.id, ot, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                //redireccionar al listado de OTs
                res.redirect('/ot')
            } else {
                req.flash('success', 'Orden de Trabajo eliminado exitosamente! ID = ' + req.params.id)
                //redireccionar al listado de OTs
                res.redirect('/ot')

                //insertar log de uso de sistema en caso de suceso de insercion
            }
        })
    })
})
 
module.exports = app