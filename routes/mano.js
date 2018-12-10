/*
routing de mano de obra. igual que todos.
*/
var express = require('express');
var app = express();
var path = require('path');
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

function generar_excel_plan_laboral(rows){
    var workbook = new excel.Workbook();
    //Add Worksheets to the workbook
    var worksheet = workbook.addWorksheet('PLAN LABORAL');
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
    worksheet.cell(1,1).string('FECHA').style(style);
    worksheet.cell(1,2).string('NRO OT').style(style);
    worksheet.cell(1,3).string('EMPLEADO').style(style);
    worksheet.cell(1,4).string('CLIENTE PLAN').style(style);
    worksheet.cell(1,5).string('CLIENTE REAL').style(style);
    worksheet.cell(1,6).string('ENCARGADO').style(style);
    worksheet.cell(1,7).string('TRATO CLIENTE').style(style);
    worksheet.cell(1,8).string('HS ENTRADA').style(style);
    worksheet.cell(1,9).string('HS SALIDA').style(style);
    worksheet.cell(1,11).string('IMPUTACION').style(style);

    //luego los datos
    var i = 1;
    rows.forEach(function(row) {
        worksheet.cell(i+1,1).string(String(formatear_fecha(row.fecha))).style(style);
        worksheet.cell(i+1,2).string(String(row.nro_ot)).style(style);
        worksheet.cell(i+1,3).string(String(row.empleado)).style(style);
        worksheet.cell(i+1,4).string(String(row.cliente_plan)).style(style);
        worksheet.cell(i+1,5).string(String(row.cliente_real)).style(style);
        worksheet.cell(i+1,6).string(String(row.encargado)).style(style);
        worksheet.cell(i+1,7).string(String(row.trato_cliente)).style(style);
        worksheet.cell(i+1,8).string(String(row.h_entrada)).style(style);
        worksheet.cell(i+1,9).string(String(row.h_salida)).style(style);
        worksheet.cell(i+1,10).string(String(row.imputacion)).style(style1);
        //worksheet.cell(i+1,2).string(String(row.)).style(style);//debug
        i=i+1;
        //console.log(row.descripcion);//debug
    });
    workbook.write('Listado_PLANLABORAL.xlsx');
}


// MOSTRAR LISTADO DE Trabajos / mano de obra programada
app.get('/', function(req, res, next) {
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
        //vemos los datos en la base
        req.getConnection(function(error, conn) {
            conn.query('SELECT * FROM mano_obra ORDER BY id DESC',function(err, rows) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    res.render('mano/listar', {title: 'Listado de Trabajos', data: '',usuario: user})
                } else {
                    generar_excel_plan_laboral(rows);//generamos excel PLAN LABORAL / MANO OBRA
                    res.render('mano/listar', {title: 'Listado de Trabajos', usuario: user, data: rows})
                }
            })
        })
    }
    else {
        // render to views/index.ejs template file
        res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});
    }
})

//RESPONSE PARA CARGA DE TRABAJOS / OBRAS ELABORADAS -- FORMULARIO 
app.get('/add', function(req, res, next){
   
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        res.render('mano/add', {
            title: 'Cargar nuevo Plan Laboral',fecha: '', nro_ot: '', empleado: '',cliente_plan: '',cliente_real: '',encargado: '', 
            trato_cliente: '',h_entrada: '',h_salida: '', imputacion: '', usuario_insert: user, usuario: user});
    }
    else {
        // render to views/index.ejs template file
        res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});
    }
})

//NUEVO PROGRAMACOIN DE OBRA - POST DE INSERT
app.post('/add', function(req, res, next){   
    
    /*req.assert('name', 'Nombre es requerido').notEmpty()           //Validar nombre
    req.assert('age', 'Edad es requerida').notEmpty()             //Validar edad
    req.assert('email', 'SE requiere un email valido').isEmail()  //Validar email
 */
    var errors = req.validationErrors();
    
    if(!errors) {//Si no hay errores, entonces conitnuamos

        /*var fact_nro = Number(req.sanitize('fact_nro').escape().trim());
        var recibo_nro = Number(req.sanitize('recibo_nro').escape().trim());
        var remision_nro = Number(req.sanitize('remision_nro').escape().trim());*/

        var mano_plan = {
            fecha: formatear_fecha_yyyymmdd(req.sanitize('fecha').escape().trim()),
            nro_ot: req.sanitize('nro_ot').escape().trim(),
            empleado: req.sanitize('empleado').escape().trim(),
            cliente_plan: req.sanitize('cliente_plan').escape().trim(),
            cliente_real: req.sanitize('cliente_real').escape().trim(),
            encargado: req.sanitize('encargado').escape().trim(),
            trato_cliente: req.sanitize('trato_cliente').escape().trim(),
            h_entrada: req.sanitize('h_entrada').escape().trim(),
            h_salida: req.sanitize('h_salida').escape().trim(),
            imputacion: req.sanitize('imputacion').escape().trim(),
            usuario_insert: user
        }   
        
        //conectamos a la base de datos
        req.getConnection(function(error, conn) {
            conn.query('INSERT INTO mano_obra SET ?', mano_plan, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    
                    // render to views/factura/add.ejs
                    res.render('mano/add', {
                        title: 'Agregar Nuevo Plan Laboral',
                        fecha: mano_plan.fecha,
                        nro_ot: mano_plan.nro_ot,
                        empleado: mano_plan.empleado,
                        cliente_plan: mano_plan.cliente_plan,
                        cliente_real: mano_plan.cliente_real,
                        encargado: mano_plan.encargado,
                        trato_cliente: mano_plan.trato_cliente,
                        h_entrada: mano_plan.h_entrada,
                        h_salida: mano_plan.h_salida,
                        imputacion: mano_plan.imputacion,
                        usuario: user
                    })
                } else {                
                    req.flash('success', 'Datos agregados correctamente!')
                    
                    // render to views/ot/add.ejs
                    //console.log(datos);//debug
                    // render to views/user/add.ejs
                    res.render('mano/add', {
                        title: 'Cargar nuevo Plan Laboral',fecha: '', nro_ot: '', empleado: '',cliente_plan: '',cliente_real: '',encargado: '', 
                        trato_cliente: '',h_entrada: '',h_salida: '', imputacion: '', usuario_insert: user, usuario: user});
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
        res.render('mano/add', { 
            title: 'Agregar Nuevo Plan Laboral',
            fecha: mano_plan.fecha,
            nro_ot: mano_plan.nro_ot,
            empleado: mano_plan.empleado,
            cliente_plan: mano_plan.cliente_plan,
            cliente_real: mano_plan.cliente_real,
            encargado: mano_plan.encargado,
            trato_cliente: mano_plan.trato_cliente,
            h_entrada: mano_plan.h_entrada,
            h_salida: mano_plan.h_salida,
            imputacion: mano_plan.imputacion,
            usuario: user
        })
    }
})

//FORMULARIO DE EDICION DE DATOS
app.get('/editar/:id', function(req, res, next){
    req.getConnection(function(error, conn) {
        conn.query('SELECT * FROM mano_obra WHERE id = ' + req.params.id, function(err, rows, fields) {
            if(err) throw err
            
            // if user not found
            if (rows.length <= 0) {
                req.flash('error', 'PLAN LABORAL con id = ' + req.params.id + ' no encontrado')
                res.redirect('/mano')
            }
            else { // Si existe la factura
                // render to views/factura/edit.ejs template file

                var date1 = rows[0].fecha;

                res.render('mano/editar', {
                    title: 'Editar Plan Laboral', 
                    //data: rows[0],
                    id: rows[0].id,
                    fecha: formatear_fecha_yyyymmdd(date1),
                    nro_ot: rows[0].nro_ot,
                    empleado: rows[0].empleado,
                    cliente_plan: rows[0].cliente_plan,
                    cliente_real: rows[0].cliente_real,
                    encargado: rows[0].encargado,
                    trato_cliente: rows[0].trato_cliente,
                    h_entrada: rows[0].h_entrada,
                    h_salida: rows[0].h_salida,
                    imputacion: rows[0].imputacion,
                    usuario: user
                })
            }            
        })
    })
})

app.post('/editar/:id', function(req, res, next) {
    /*  -- VALIDACIONES ESPERAMOS
    req.assert('name', 'Name is required').notEmpty()           //Validate name
    req.assert('age', 'Age is required').notEmpty()             //Validate age
    req.assert('email', 'A valid email is required').isEmail()  //Validate email
    */
    var errors = req.validationErrors()
    
    if( !errors ) {   //No errors were found.  Passed Validation!


       var mano_plan = {
            fecha: formatear_fecha_yyyymmdd(req.sanitize('fecha').escape().trim()),
            nro_ot: req.sanitize('nro_ot').escape().trim(),
            empleado: req.sanitize('empleado').escape().trim(),
            cliente_plan: req.sanitize('cliente_plan').escape().trim(),
            cliente_real: req.sanitize('cliente_real').escape().trim(),
            encargado: req.sanitize('encargado').escape().trim(),
            trato_cliente: req.sanitize('trato_cliente').escape().trim(),
            h_entrada: req.sanitize('h_entrada').escape().trim(),
            h_salida: req.sanitize('h_salida').escape().trim(),
            imputacion: req.sanitize('imputacion').escape().trim(),
            usuario_insert: user
        } 
        
        req.getConnection(function(error, conn) {
            conn.query('UPDATE mano_obra SET ? WHERE id = ' + req.params.id, mano_plan, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    
                    // render to views/gastos/add.ejs
                    res.render('mano/editar', {
                        title: 'Agregar Nuevo Plan Laboral',
                        fecha: mano_plan.fecha,
                        nro_ot: mano_plan.nro_ot,
                        empleado: mano_plan.empleado,
                        cliente_plan: mano_plan.cliente_plan,
                        cliente_real: mano_plan.cliente_real,
                        encargado: mano_plan.encargado,
                        trato_cliente: mano_plan.trato_cliente,
                        h_entrada: mano_plan.h_entrada,
                        h_salida: mano_plan.h_salida,
                        imputacion: mano_plan.imputacion,
                        usuario: user
                    })
                } else {                
                    req.flash('success', 'Datos actualizados correctamente!')
                    
                    // render to views/ot/add.ejs
                    res.render('mano/editar', {
                        title: 'Editar Plan Laboral',
                        id: req.params.id,
                        fecha: req.body.fecha,
                        nro_ot: req.body.nro_ot,
                        empleado: req.body.empleado,
                        cliente_plan: req.body.cliente_plan,
                        cliente_real: req.body.cliente_real,
                        encargado: req.body.encargado,
                        trato_cliente: req.body.trato_cliente,
                        h_entrada: req.body.h_entrada,
                        h_salida: req.body.h_salida,
                        imputacion: req.body.imputacion,
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
        
        /*** Using req.body.name 
         * because req.param('name') is deprecated
         */ 
        res.render('mano/editar', { 
            title: 'Editar Plan Laboral',
            id: req.params.id,
            fecha: req.body.fecha,
            nro_ot: req.body.nro_ot,
            empleado: req.body.empleado,
            cliente_plan: req.body.cliente_plan,
            cliente_real: req.body.cliente_real,
            encargado: req.body.encargado,
            trato_cliente: req.body.trato_cliente,
            h_entrada: req.body.h_entrada,
            h_salida: req.body.h_salida,
            imputacion: req.body.imputacion,
            usuario_insert: user
        })
    }
})

/* GENERACION EXCEL */
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
        var file = path.resolve("Listado_PLANLABORAL.xlsx");
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
    var mano_plan = { id: req.params.id }
    
    req.getConnection(function(error, conn) {
        conn.query('DELETE FROM mano_obra WHERE id = ' + req.params.id, mano_plan, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                //redireccionar al listado de ingresos
                res.redirect('/mano')
            } else {
                req.flash('success', 'PLan Laboral eliminado exitosamente! ID = ' + req.params.id)
                //redireccionar al listado de ingresos
                res.redirect('/mano')

                //insertar log de uso de sistema en caso de suceso de insercion
            }
        })
    })
})

module.exports = app;
