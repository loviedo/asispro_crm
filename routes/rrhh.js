var express = require('express');
var app = express();
var path = require('path');
var excel = require('excel4node');//para generar excel
var user = '';//global para ver el usuario
var userId = '';//global para userid

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

function generar_excel_emples(rows){
    var workbook = new excel.Workbook();
    //Add Worksheets to the workbook
    var worksheet = workbook.addWorksheet('GASTOS');
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
    worksheet.cell(1,1).string('NOMBRE').style(style);
    worksheet.cell(1,2).string('TELEFONO').style(style);
    //worksheet.cell(1,1).string('').style(style);

    //luego los datos
    var i = 1;
    rows.forEach(function(row) {
        worksheet.cell(i+1,1).string(String(row.nombre)).style(style);
        worksheet.cell(i+1,2).number(Number(row.telefono)).style(style);
        i=i+1;
        //console.log(row.descripcion);//debug
    });
    workbook.write('Listado_EMPLEADOS.xlsx');
}

// MOSTRAR LISTADO DE GASTOS
app.get('/', function(req, res, next) {
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
        //vemos los datos en la base
        req.getConnection(function(error, conn) {
            conn.query('SELECT * FROM empleados ORDER BY id DESC',function(err, rows) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    res.render('rrhh/listar', {title: 'Empleados', data: '',usuario: user})
                } else {
                    generar_excel_emples(rows);//generamos excel gastos
                    res.render('rrhh/listar', {title: 'Empleados', usuario: user, data: rows})
                }
            })
        })
    }
    else {
        // render to views/index.ejs template file
        res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});
    }
})

//RESPONSE PARA CARGA DE GASTOS -- FORMULARIO 
app.get('/add', function(req, res, next){    
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        // render to views/user/add.ejs
        res.render('rrhh/add', {
            title: 'Cargar nuevo EMPLEADO', nombre: '', telefono: '', usuario_insert: user, usuario: user})
    }
    else {
        // render to views/index.ejs template file
        res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});
    }
})

//NUEVO GASTO - POST DE INSERT
app.post('/add', function(req, res, next){   
    
    var errors = req.validationErrors()
    
    if(!errors) {//Si no hay errores, entonces conitnuamos

        var gasto = {
            nombre: req.sanitize('nombre').escape().trim(),
            telefono: req.sanitize('telefono').escape().trim(),
            usuario_insert: user
        }   
        
        //conectamos a la base de datos
        req.getConnection(function(error, conn) {
            conn.query('INSERT INTO empleados SET ?', gasto, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    
                    // render to views/factura/add.ejs
                    res.render('rrhh/add', {
                        title: 'Agregar Nuevo EMPLEADO',
                        nombre: gasto.fecha,
                        telefono: gasto.monto,
                        usuario: user
                    })
                } else {                
                    req.flash('success', 'Datos agregados correctamente!')
                    
                    // render to views/ot/add.ejs
                    res.render('rrhh/add', {
                        title: 'Agregar nuevo EMPLEADO',
                        nombre: '',
                        telefono: '',
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
        res.render('rrhh/add', { 
            title: 'Agregar Nuevo GASTO',
            nombre: req.body.nombre,
            telefono: req.body.telefono,
            usuario_insert: user
        })
    }
})

//FORMULARIO DE EDICION DE DATOS
app.get('/editar/:id', function(req, res, next){
    req.getConnection(function(error, conn) {
        conn.query('SELECT * FROM empleados WHERE id = ' + req.params.id, function(err, rows, fields) {
            if(err) throw err
            
            // if user not found
            if (rows.length <= 0) {
                req.flash('error', 'EMPLEADO con id = ' + req.params.id + ' no encontrado')
                res.redirect('/gastos')
            }
            else { // Si existe el empleado

                res.render('rrhh/editar', {
                    title: 'Editar EMPLEADO', 
                    //data: rows[0],
                    id: rows[0].id,
                    nombre: rows[0].nombre,
                    telefono: rows[0].telefono,
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

        var emple = {
            nombre: req.sanitize('nombre').escape().trim(),
            telefono: req.sanitize('telefono').escape().trim(),
            usuario_insert: user
        }  
        
        req.getConnection(function(error, conn) {
            conn.query('UPDATE empleados SET ? WHERE id = ' + req.params.id, emple, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err);
                    
                    // render to views/rrhh/add.ejs
                    res.render('rrhh/editar', {
                        title: 'Editar EMPLEADO',
                        nombre: req.body.nombre,
                        telefono: req.body.telefono,
                        usuario_insert: user,
                        usuario: user
                    })
                } else {                
                    req.flash('success', 'Datos actualizados correctamente!');
                    
                    // render to views/rrhh/add.ejs
                    res.render('rrhh/editar', {
                        title: 'Editar EMPLEADO',
                        nombre: req.body.nombre,
                        telefono: req.body.telefono,
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

        res.render('rrhh/editar', { 
            title: 'Editar EMPLEADO',
            nombre: req.body.nombre,
            telefono: req.body.telefono,
            usuario_insert: user
        })
    }
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
        //DESCARGAR PDF CON DATOS DEL ESTUDIO
        var file = path.resolve("Listado_EMPLEADOS.xlsx");
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


// DELETE EMPLEADO
app.delete('/eliminar/(:id)', function(req, res, next) {
    var emple = { id: req.params.id }
    
    req.getConnection(function(error, conn) {
        conn.query('DELETE FROM empleados WHERE id = ' + req.params.id, emple, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                //redireccionar al listado de EMPLEADO
                res.redirect('/rrhh')
            } else {
                req.flash('success', 'EMPLEADO eliminado exitosamente ID = ' + req.params.id)
                //redireccionar al listado de EMPLEADO
                res.redirect('/rrhh')

                //insertar log de uso de sistema en caso de suceso de insercion
            }
        })
    })
})

module.exports = app;