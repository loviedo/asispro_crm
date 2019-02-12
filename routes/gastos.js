var express = require('express');
var app = express();
var path = require('path');
var excel = require('excel4node');//para generar excel
var user = '';//global para ver el usuario
var userId = '';//global para userid
var datos = []; 

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

function generar_excel_gastos(rows){
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
    worksheet.cell(1,1).string('ITEM').style(style);
    worksheet.cell(1,2).string('FECHA').style(style);
    worksheet.cell(1,3).string('MONTO').style(style);
    worksheet.cell(1,4).string('EXENTAS').style(style);
    worksheet.cell(1,5).string('IVA 10%').style(style);
    worksheet.cell(1,6).string('IVA 5%').style(style);
    worksheet.cell(1,7).string('GASTO REAL').style(style);
    worksheet.cell(1,8).string('CONCEPTO').style(style);
    worksheet.cell(1,9).string('CONDICION FACTURA').style(style);
    worksheet.cell(1,10).string('PROVEEDOR').style(style);
    worksheet.cell(1,11).string('NRO FACTURA').style(style);
    worksheet.cell(1,12).string('ENCARGADO').style(style);
    worksheet.cell(1,13).string('CODIGO').style(style);
    worksheet.cell(1,14).string('OT NRO').style(style);
    worksheet.cell(1,15).string('IMPUTADO').style(style);
    worksheet.cell(1,16).string('ORIGEN PAGO').style(style);
    //worksheet.cell(1,1).string('').style(style);

    //luego los datos
    var i = 1;
    rows.forEach(function(row) {
        worksheet.cell(i+1,1).string(String(i)).style(style);
        worksheet.cell(i+1,2).string(String(formatear_fecha(row.fecha))).style(style);
        worksheet.cell(i+1,3).number(Number(row.monto)).style(style);
        worksheet.cell(i+1,4).number(Number(row.exentas)).style(style);
        worksheet.cell(i+1,5).number(Number(row.iva_10)).style(style);
        worksheet.cell(i+1,6).number(Number(row.iva_5)).style(style);
        worksheet.cell(i+1,7).number(Number(row.gasto_real)).style(style);
        worksheet.cell(i+1,8).string(String(row.concepto)).style(style);
        worksheet.cell(i+1,9).string(String(row.fact_condicion)).style(style);
        worksheet.cell(i+1,10).string(String(row.proveedor)).style(style);
        worksheet.cell(i+1,11).string(String(row.fact_nro)).style(style);
        worksheet.cell(i+1,12).string(String(row.encargado)).style(style);
        worksheet.cell(i+1,13).number(Number(row.codigo)).style(style1);
        worksheet.cell(i+1,14).number(Number(row.nro_ot)).style(style1);
        worksheet.cell(i+1,15).string(String(row.imputado)).style(style);
        worksheet.cell(i+1,16).string(String(row.origen_pago)).style(style);
        //worksheet.cell(i+1,2).string(String(row.)).style(style);//debug
        i=i+1;
        //console.log(row.descripcion);//debug
    });
    workbook.write('Listado_GASTOS.xlsx');
}

// MOSTRAR LISTADO DE GASTOS
app.get('/', function(req, res, next) {
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
        //si el usuario es cristina entonces solo ve lo de ella, si no, se ve todo
        var sql_con ="";
        if(user == "cibanez")
        {
            sql_con = "SELECT * FROM gastos WHERE usuario_insert = '"+user+"' ORDER BY fecha ASC";
        }
        else
        {
            sql_con = "SELECT * FROM gastos ORDER BY fecha ASC";
        }
        req.getConnection(function(error, conn) {
            conn.query(sql_con,function(err, rows) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    res.render('gastos/listar', {title: 'Listado de GASTOS', data: '',usuario: user})
                } else {
                    generar_excel_gastos(rows);//generamos excel gastos segun el usuario que sea claro
                    res.render('gastos/listar', {title: 'Listado de GASTOS', usuario: user, data: rows})
                }
            })
        })
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//RESPONSE PARA CARGA DE GASTOS -- FORMULARIO 
app.get('/add', function(req, res, next){
   
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        req.getConnection(function(error, conn) {
            conn.query('SELECT * FROM ot ORDER BY ot_nro DESC',function(err, rows) {
                if (err) {
                    console.log(err);
                }
                else{
                    datos = [];
                    rows.forEach(function(row) {    
                        datos.push(row);
                    });
                    console.log(datos);//debug
                    // render to views/user/add.ejs
                    res.render('gastos/add', {
                        title: 'Cargar nuevo GASTO', fecha: '', monto: '0',exentas: '0',iva_10: '0',iva_5: '0',gasto_real: '0',gasto_real1: '0',concepto: '', 
                        fact_condicion: '',proveedor: '',fact_nro: '', encargado: '', codigo: '',nro_ot:'',imputado:'', origen_pago:'', usuario_insert: user, usuario: user, data: datos});
                }
            })
        })
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//NUEVO GASTO - POST DE INSERT
app.post('/add', function(req, res, next){   
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        /*req.assert('name', 'Nombre es requerido').notEmpty()           //Validar nombre
        req.assert('age', 'Edad es requerida').notEmpty()             //Validar edad
        req.assert('email', 'SE requiere un email valido').isEmail()  //Validar email*/
        var errors = req.validationErrors();
        
        if(!errors) {//Si no hay errores, entonces conitnuamos


            //mysql acepta solos YYYY-MM-DD
            var date1 = req.sanitize('fecha').escape().trim();
            var mon = Number(req.sanitize('monto').escape().trim()); 
            var exe = Number(req.sanitize('exentas').escape().trim());
            var calcu_iva = req.sanitize('calcu_iva').escape().trim();
            if(calcu_iva == "IVA_10"){
                var iva10 = Number(req.sanitize('iva_10').escape().trim());
                var iva5 = 0;
            }
            if(calcu_iva == "IVA_5"){
                var iva10 = 0;
                var iva5 = Number(req.sanitize('iva_5').escape().trim());
            }
            var gasreal = Number(req.sanitize('gasto_real').escape().trim());
            var cod = Number(req.sanitize('codigo').escape().trim());
            var ot = Number(req.sanitize('nro_ot').escape().trim());
            var origen_pago = req.sanitize('origen_pago').escape().trim();

            /*var fact_nro = Number(req.sanitize('fact_nro').escape().trim());
            var recibo_nro = Number(req.sanitize('recibo_nro').escape().trim());
            var remision_nro = Number(req.sanitize('remision_nro').escape().trim());*/

            var gasto = {
                fecha: formatear_fecha_yyyymmdd(date1),
                monto: mon,
                exentas: exe,
                iva_10: iva10,
                iva_5: iva5,
                gasto_real: gasreal,
                concepto: req.sanitize('concepto').trim(),
                fact_condicion: req.sanitize('fact_condicion').trim(),
                proveedor: req.sanitize('proveedor').trim(),
                fact_nro: req.sanitize('fact_nro').trim(),
                encargado: req.sanitize('encargado').trim(),
                codigo: cod,
                nro_ot: ot,
                origen_pago:origen_pago,
                imputado: req.sanitize('imputado').trim(),
                usuario_insert: user
                //usuario_insert: req.sanitize('usuario_insert').escape().trim()//no usamos en la pagina.
            }   
            
            //conectamos a la base de datos
            req.getConnection(function(error, conn) {
                conn.query('INSERT INTO gastos SET ?', gasto, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err)
                        
                        // render to views/factura/add.ejs
                        res.render('gastos/add', {
                            title: 'Agregar Nuevo GASTO',
                            fecha: gasto.fecha,
                            monto: gasto.monto,
                            exentas: gasto.exentas,
                            iva_10: gasto.iva_10,
                            iva_5: gasto.iva_5,
                            gasto_real: gasto.gasto_real,
                            concepto: gasto.concepto,
                            fact_condicion: gasto.fact_condicion,
                            proveedor: gasto.proveedor,
                            fact_nro: gasto.fact_nro,
                            encargado: gasto.encargado,
                            codigo: gasto.codigo,
                            nro_ot: gasto.nro_ot,
                            imputado: gasto.imputado,
                            origen_pago: gasto.origen_pago,
                            usuario: user,
                            data: datos
                        })
                    } else {                
                        req.flash('success', 'Datos agregados correctamente!')
                        
                        // render to views/ot/add.ejs
                        conn.query('SELECT * FROM ot ORDER BY ot_nro DESC',function(err, rows) {
                            if (err) {
                                console.log(err);
                            }
                            else{
                                datos = [];
                                rows.forEach(function(row) {    
                                    datos.push(row);
                                });
                                console.log(datos);//debug
                                // render to views/user/add.ejs
                                res.render('gastos/add', {
                                    title: 'Cargar nuevo GASTO', fecha: '', monto: '0',exentas: '0',iva_10: '0',iva_5: '0',gasto_real: '0',concepto: '', 
                                    fact_condicion: '',proveedor: '',fact_nro: '', encargado: '', codigo: '',nro_ot:'',imputado:'',origen_pago:'', usuario_insert: user, usuario: user, data: datos});
                            }
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
            res.render('gastos/add', { 
                title: 'Agregar Nuevo GASTO',
                fecha: req.body.fecha,
                monto: req.body.monto,
                exentas: req.body.exentas,
                iva_10: req.body.iva_10,
                iva_5: req.body.iva_5,
                gasto_real: req.body.gasto_real,
                concepto: req.body.concepto,
                fact_condicion: req.body.fact_condicion,
                proveedor: req.body.proveedor,
                fact_nro: req.body.fact_nro,
                encargado: req.body.encargado,
                codigo: req.body.codigo,
                nro_ot: req.body.nro_ot,
                imputado: req.body.imputado,
                origen_pago: req.body.origen_pago,
                usuario_insert: user
            })
        }
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//FORMULARIO DE EDICION DE DATOS
app.get('/editar/:id', function(req, res, next){
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
        //controlamos quien se loga.
        if(user.length >0){
        req.getConnection(function(error, conn) {
            conn.query('SELECT * FROM gastos WHERE id = ' + req.params.id, function(err, rows, fields) {
                if(err) throw err
                
                // if user not found
                if (rows.length <= 0) {
                    req.flash('error', 'GASTO con id = ' + req.params.id + ' no encontrada')
                    res.redirect('/gastos')
                }
                else { // Si existe la factura
                    // render to views/factura/edit.ejs template file
                    req.getConnection(function(error, conn) {
                        conn.query('SELECT * FROM ot ORDER BY ot_nro DESC',function(err, rows2) {
                            if (err) {
                                console.log(err);
                            }
                            else{
                                datos = [];
                                rows2.forEach(function(row) {    
                                    datos.push(row);
                                });
                                //console.log(datos);//debug
                                var date1 = rows[0].fecha;

                                res.render('gastos/editar', {
                                    title: 'Editar GASTO', 
                                    //data: rows[0],
                                    id: rows[0].id,
                                    fecha: formatear_fecha_yyyymmdd(date1),
                                    monto: rows[0].monto,
                                    exentas: rows[0].exentas,
                                    iva_10: rows[0].iva_10,
                                    iva_5: rows[0].iva_5,
                                    gasto_real: rows[0].gasto_real,
                                    concepto: rows[0].concepto,
                                    fact_condicion: rows[0].fact_condicion,
                                    proveedor: rows[0].proveedor,
                                    fact_nro: rows[0].fact_nro,
                                    encargado: rows[0].encargado,
                                    codigo: rows[0].codigo,
                                    nro_ot: rows[0].nro_ot,
                                    imputado: rows[0].imputado,
                                    origen_pago: rows[0].origen_pago,
                                    usuario: user, data: datos
                                })
                            }
                        })
                    })
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
    //controlamos quien se loga.
	if(user.length >0){
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
            
            req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
            req.sanitize('username').trim(); // returns 'a user'
            ********************************************/

            //mysql acepta solos YYYY-MM-DD
            var date1 = req.sanitize('fecha').escape().trim();
            var mon = Number(req.sanitize('monto').escape().trim()); 
            var exe = Number(req.sanitize('exentas').escape().trim());
            var iva10 = Number(req.sanitize('iva_10').escape().trim());
            var iva5 = Number(req.sanitize('iva_5').escape().trim());
            var gasreal = Number(req.sanitize('gasto_real').escape().trim());
            var cod = Number(req.sanitize('codigo').escape().trim());
            var ot = Number(req.sanitize('nro_ot').escape().trim());

            var gasto = {
                fecha: formatear_fecha_yyyymmdd(date1),
                monto: mon,
                exentas: exe,
                iva_10: iva10,
                iva_5: iva5,
                gasto_real: gasreal,
                concepto: req.sanitize('concepto').escape().trim(),
                fact_condicion: req.sanitize('fact_condicion').escape().trim(),
                proveedor: req.sanitize('proveedor').escape().trim(),
                fact_nro: req.sanitize('fact_nro').escape().trim(),
                encargado: req.sanitize('encargado').escape().trim(),
                codigo: cod,
                nro_ot: ot,
                imputado: req.sanitize('imputado').escape().trim(),
                origen_pago = req.sanitize('origen_pago').escape().trim(),
                usuario_insert: user
                //usuario_insert: req.sanitize('usuario_insert').escape().trim()//no usamos en la pagina.
            }  
            
            req.getConnection(function(error, conn) {
                conn.query('UPDATE gastos SET ? WHERE id = ' + req.params.id, gasto, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err)
                        
                        // render to views/gastos/add.ejs
                        res.render('gastos/editar', {
                            title: 'Editar GASTO',
                            id: req.params.id,
                            fecha: req.body.fecha,
                            monto: req.body.monto,
                            exentas: req.body.exentas,
                            iva_10: req.body.iva_10,
                            iva_5: req.body.iva_5,
                            gasto_real: req.body.gasto_real,
                            concepto: req.body.concepto,
                            fact_condicion: req.body.fact_condicion,
                            proveedor: req.body.proveedor,
                            fact_nro: req.body.fact_nro,
                            encargado: req.body.encargado,
                            codigo: req.body.codigo,
                            nro_ot: req.body.nro_ot,
                            imputado: req.body.imputado,
                            origen_pago: req.body.origen_pago,
                            usuario_insert: user,
                            usuario: user
                        })
                    } else {                
                        req.flash('success', 'Datos actualizados correctamente!')
                        
                        req.getConnection(function(error, conn) {
                            conn.query('SELECT * FROM ot ORDER BY ot_nro DESC',function(err, rows) {
                                if (err) {
                                    console.log(err);
                                }
                                else{
                                    datos = [];
                                    rows.forEach(function(row) {    
                                        datos.push(row);
                                    });
                                    console.log(datos);//debug
                                    // render to views/user/add.ejs
                                    // render to views/ot/add.ejs
                                    res.render('gastos/editar', { title: 'Editar GASTO', id: req.params.id,fecha: req.body.fecha,monto: req.body.monto, exentas: req.body.exentas,
                                        iva_10: req.body.iva_10, iva_5: req.body.iva_5, gasto_real: req.body.gasto_real, concepto: req.body.concepto, fact_condicion: req.body.fact_condicion,
                                        proveedor: req.body.proveedor, fact_nro: req.body.fact_nro, encargado: req.body.encargado, codigo: req.body.codigo, nro_ot: req.body.nro_ot,
                                        imputado: req.body.imputado, origen_pago: req.body.origen_pago, usuario_insert: user, usuario: user, data: datos})
                                }
                            })
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
            res.render('gastos/editar', { 
                title: 'Editar GASTO',
                fecha: req.body.fecha,
                monto: req.body.monto,
                exentas: req.body.exentas,
                iva_10: req.body.iva_10,
                iva_5: req.body.iva_5,
                gasto_real: req.body.gasto_real,
                concepto: req.body.concepto,
                fact_condicion: req.body.fact_condicion,
                proveedor: req.body.proveedor,
                fact_nro: req.body.fact_nro,
                encargado: req.body.encargado,
                codigo: req.body.codigo,
                nro_ot: req.body.nro_ot,
                imputado: req.body.imputado,
                origen_pago: req.body.origen_pago,
                usuario_insert: user
            })
        }
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
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
        var file = path.resolve("Listado_GASTOS.xlsx");
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
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
        var gasto = { id: req.params.id }
        
        req.getConnection(function(error, conn) {
            conn.query('DELETE FROM gastos WHERE id = ' + req.params.id, gasto, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    //redireccionar al listado de GASTO
                    res.redirect('/gastos')
                } else {
                    req.flash('success', 'Gasto eliminado exitosamente! ID = ' + req.params.id)
                    //redireccionar al listado de GASTO
                    res.redirect('/gastos')

                    //insertar log de uso de sistema en caso de suceso de insercion
                }
            })
        })
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

module.exports = app;