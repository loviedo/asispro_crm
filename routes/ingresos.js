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

function generar_excel_ingresos(rows){
    var workbook = new excel.Workbook({numberFormat: 'dd/mm/yyyy'});
    //Add Worksheets to the workbook
    var worksheet = workbook.addWorksheet('INGRESOS');
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
    worksheet.cell(1,2).string('FECHA').style(style);
    worksheet.cell(1,3).string('CLIENTE').style(style);
    worksheet.cell(1,4).string('OBRA').style(style);
    worksheet.cell(1,5).string('NRO OT').style(style);
    worksheet.cell(1,6).string('PAGO').style(style);
    worksheet.cell(1,7).string('FACTURA NRO').style(style);
    worksheet.cell(1,8).string('FACTURA CONDICION').style(style);
    worksheet.cell(1,9).string('MONTO').style(style);
    worksheet.cell(1,10).string('MONTO SIN IVA').style(style);
    worksheet.cell(1,11).string('IVA').style(style);
    worksheet.cell(1,12).string('RETENCION').style(style);
    worksheet.cell(1,13).string('PORCENTAJE').style(style);
    worksheet.cell(1,14).string('TOTAL FACTURADO').style(style);
    worksheet.cell(1,15).string('OBSERVACIONES').style(style);
    //worksheet.cell(1,1).string('').style(style);

    //luego los datos
    var i = 1;
    rows.forEach(function(row) {
        worksheet.cell(i+1,1).number(Number(row.id)).style(style);
        worksheet.cell(i+1,2).date(formatear_fecha_yyyymmdd(row.fecha)).style({dateFormat: 'dd/mm/yyyy'});//ver formato fecha
        worksheet.cell(i+1,3).string(String(row.cliente)).style(style);
        worksheet.cell(i+1,4).string(String(row.obra)).style(style);
        worksheet.cell(i+1,5).number(Number(row.nro_ot)).style(style);
        worksheet.cell(i+1,6).string(String(row.pago)).style(style);
        worksheet.cell(i+1,7).string(String(row.fact_nro)).style(style);
        worksheet.cell(i+1,8).string(String(row.fact_condicion)).style(style);
        worksheet.cell(i+1,9).number(Number(row.monto)).style(style);
        worksheet.cell(i+1,10).number(Number(row.monto_s_iva)).style(style);
        worksheet.cell(i+1,11).number(Number(row.iva)).style(style);
        worksheet.cell(i+1,12).number(Number(row.retencion)).style(style);
        worksheet.cell(i+1,13).string(String(row.calcu_ret)).style(style);
        worksheet.cell(i+1,14).number(Number(row.total_facturado)).style(style1);
        worksheet.cell(i+1,15).string(String(row.obs)).style(style);
        //worksheet.cell(i+1,2).string(String(row.)).style(style);//debug
        i=i+1;
        //console.log(row.descripcion);//debug
    });
    workbook.write('Listado_INGRESOS.xlsx');
}

// MOSTRAR LISTADO DE INGRESOS
app.get('/', function(req, res, next) {
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
        //vemos los datos en la base
        req.getConnection(function(error, conn) {
            conn.query('SELECT * FROM ingresos ORDER BY fecha DESC',function(err, rows) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    res.render('ingresos/listar', {title: 'Listado de INGRESOS', data: '',usuario: user})
                } else {
                    generar_excel_ingresos(rows);//generamos excel gastos
                    res.render('ingresos/listar', {title: 'Listado de INGRESOS', usuario: user, data: rows})
                }
            })
        })
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//RESPONSE PARA CARGA DE INGRESOS -- FORMULARIO 
app.get('/add', function(req, res, next){
   
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        req.getConnection(function(error, conn) {
            conn.query('SELECT * FROM ot ORDER BY ot_nro DESC',function(err, rows) {
                if (err) {console.log(err);}
                else{
                    datos = [];
                    rows.forEach(function(row) {    
                        datos.push(row);
                    });
                    conn.query('SELECT * FROM clientes ORDER BY id DESC',function(err, rows1) {
                        if (err) {console.log(err);}
                        else{
                            datos_clientes = [];
                            rows1.forEach(function(row) {    
                                datos_clientes.push(row);
                            });  
                            //console.log(datos);//debug nros de ot
                            res.render('ingresos/add', {
                                title: 'Cargar nuevo INGRESO',fecha: '', id_cliente:'', cliente: '', obra: '', pago: '', nro_ot: '0',monto: '0', fact_nro: '',fact_condicion: 'CONTADO', calcu_iva:'',
                                mon_s_iva:'0', iva: '',retencion: '',calcu_ret: '', total_facturado: '0', obs:'', data: datos, usuario_insert: user, usuario: user, data_clientes: datos_clientes});
                        }
                    })                                            
                }
            })
        })
    }
    else {
        // render to views/index.ejs template file
        res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});
    }
})

//NUEVO GASTO - POST DE INSERT
app.post('/add', function(req, res, next){   
    if(req.session.loggedIn)
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

            /*var fact_nro = Number(req.sanitize('fact_nro').trim());
            var recibo_nro = Number(req.sanitize('recibo_nro').trim());
            var remision_nro = Number(req.sanitize('remision_nro').trim());*/

            var ingreso = {
                fecha: formatear_fecha_yyyymmdd(req.sanitize('fecha').trim()),
                id_cliente: req.sanitize('id_cliente').trim(),
                cliente: req.sanitize('cliente').trim(),
                obra: req.sanitize('obra').trim(),
                fact_nro: req.sanitize('fact_nro').trim(),
                fact_condicion: req.sanitize('fact_condicion').trim(),
                monto: Number(req.sanitize('monto').trim()),
                calcu_iva: req.sanitize('calcu_iva').trim(),
                iva: Number(req.sanitize('iva').trim()),
                retencion: Number(req.sanitize('retencion').trim()),
                calcu_ret: req.sanitize('calcu_ret').trim(),
                total_facturado: Number(req.sanitize('total_facturado').trim()),
                nro_ot: Number(req.sanitize('nro_ot').trim()),
                monto_s_iva: Number(req.sanitize('mon_s_iva').trim()),
                pago: req.sanitize('pago').trim(),//string
                obs: req.sanitize('obs').trim(),
                usuario_insert: user
                //usuario_insert: req.sanitize('usuario_insert').trim()//no usamos en la pagina.
            }   
            
            //conectamos a la base de datos
            req.getConnection(function(error, conn) {
                conn.query('INSERT INTO ingresos SET ?', ingreso, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err)
                        
                        // render to views/factura/add.ejs
                        res.render('ingresos/add', {
                            title: 'Agregar Nuevo INGRESO',
                            fecha: ingreso.fecha,
                            id_cliente: ingreso.id_cliente,
                            cliente: ingreso.cliente,
                            obra: ingreso.obra,
                            pago: ingreso.pago,
                            fact_nro: ingreso.fact_nro,
                            fact_condicion: ingreso.fact_condicion,
                            monto: ingreso.monto,
                            calcu_iva: ingreso.calcu_iva,
                            mon_s_iva: ingreso.mon_s_iva,
                            iva: ingreso.iva,
                            retencion: ingreso.retencion,
                            calcu_ret: ingreso.calcu_ret,
                            total_facturado: ingreso.total_facturado,
                            nro_ot: ingreso.nro_ot,
                            usuario: user
                        })
                    } else {                
                        req.flash('success', 'Datos agregados correctamente!')
                        
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
                                    //console.log(datos);//debug
                                    conn.query('SELECT * FROM clientes ORDER BY id DESC',function(err, rows1) {
                                        if (err) {console.log(err);}
                                        else{
                                            datos_clientes = [];
                                            rows1.forEach(function(row) {    
                                                datos_clientes.push(row);
                                            });  
                                            res.render('ingresos/add', {
                                                title: 'Cargar nuevo INGRESO',fecha: '', id_cliente: '', cliente: '', obra: '', pago: '', nro_ot: '0',monto: '0', fact_nro: '',fact_condicion: 'CONTADO', calcu_iva:'',
                                                mon_s_iva:'0', iva: '',retencion: '',calcu_ret: '', total_facturado: '0', obs:'', data: datos, usuario_insert: user, usuario: user,data_clientes: datos_clientes});
                                        }
                                    })
                                }
                            })
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
            res.render('ingresos/add', { 
                title: 'Agregar Nuevo INGRESO',
                fecha: ingreso.fecha,
                id_cliente: ingreso.id_cliente,
                cliente: ingreso.cliente,
                obra: ingreso.obra,
                fact_nro: ingreso.fact_nro,
                fact_condicion: ingreso.fact_condicion,
                monto: ingreso.monto,
                calcu_iva: ingreso.calcu_iva,
                iva: ingreso.iva,
                retencion: ingreso.retencion,
                calcu_ret: ingreso.calcu_ret,
                total_facturado: ingreso.total_facturado,
                pago: ingreso.pago,
                mon_s_iva: ingreso.mon_s_iva,
                nro_ot: ingreso.nro_ot,
                obs: ingreso.obs,
                usuario: user
            })
        }
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//FORMULARIO DE EDICION DE DATOS
app.get('/editar/:id', function(req, res, next){
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
        //controlamos quien se loga.
	if(user.length >0){
        req.getConnection(function(error, conn) {
            conn.query('SELECT * FROM ingresos WHERE id = ' + req.params.id, function(err, rows, fields) {
                if(err) throw err
                
                // if user not found
                if (rows.length <= 0) {
                    req.flash('error', 'INGRESO con id = ' + req.params.id + ' no encontrado')
                    res.redirect('/ingresos')
                }
                else { // Si existe el ingreso
                    var date1 = rows[0].fecha;
                    req.getConnection(function(error, conn) {
                        conn.query('SELECT * FROM ot ORDER BY ot_nro DESC',function(err, rows1) {
                            if (err) {
                                console.log(err);
                            }
                            else{
                                datos = [];
                                rows1.forEach(function(row) {    
                                    datos.push(row);
                                });
                                //console.log(datos);//debug
                                conn.query('SELECT * FROM clientes ORDER BY id DESC',function(err, rows1) {
                                    if (err) {console.log(err);}
                                    else{
                                        datos_clientes = [];
                                        rows1.forEach(function(row) {    
                                            datos_clientes.push(row);
                                        });  
                                        //console.log(datos);//debug nros de ot
                                        res.render('ingresos/editar', { title: 'Editar INGRESO', id: rows[0].id, fecha: formatear_fecha_yyyymmdd(date1), id_cliente: rows[0].id_cliente,cliente: rows[0].cliente, obra: rows[0].obra,
                                            fact_nro: rows[0].fact_nro, fact_condicion: rows[0].fact_condicion, monto: rows[0].monto, pago: rows[0].pago, calcu_iva: rows[0].calcu_iva,
                                            iva: rows[0].iva, retencion: rows[0].retencion, calcu_ret: rows[0].calcu_ret, total_facturado: rows[0].total_facturado, nro_ot: rows[0].nro_ot,
                                            mon_s_iva: rows[0].monto_s_iva, obs: rows[0].obs, data: datos, usuario: user, data_clientes: datos_clientes})
                                    }
                                })  
                            }
                        })
                    })
                }            
            })
        })
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

app.post('/editar/:id', function(req, res, next) {
    if(req.session.loggedIn)
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


        var ingreso = {
                fecha: formatear_fecha_yyyymmdd(req.sanitize('fecha').trim()),
                id_cliente: req.sanitize('id_cliente').trim(),
                cliente: req.sanitize('cliente').trim(),
                obra: req.sanitize('obra').trim(),
                fact_nro: req.sanitize('fact_nro').trim(),
                fact_condicion: req.sanitize('fact_condicion').trim(),
                monto: Number(req.sanitize('monto').trim()),
                calcu_iva: req.sanitize('calcu_iva').trim(),
                iva: Number(req.sanitize('iva').trim()),
                retencion: Number(req.sanitize('retencion').trim()),
                calcu_ret: req.sanitize('calcu_ret').trim(),
                total_facturado: Number(req.sanitize('total_facturado').trim()),
                nro_ot: Number(req.sanitize('nro_ot').trim()),
                monto_s_iva: Number(req.sanitize('mon_s_iva').trim()),
                pago: req.sanitize('pago').trim(),
                obs: req.sanitize('obs').trim(),
                usuario_insert: user
                //usuario_insert: req.sanitize('usuario_insert').trim()//no usamos en la pagina.
            } 
            
            req.getConnection(function(error, conn) {
                conn.query('UPDATE ingresos SET ? WHERE id = ' + req.params.id, ingreso, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err)
                        
                        // render to views/gastos/add.ejs
                        res.render('ingresos/editar', {
                            title: 'Agregar Nuevo INGRESO',
                            fecha: ingreso.fecha,
                            id_cliente: ingreso.id_cliente,
                            cliente: ingreso.cliente,
                            obra: ingreso.obra,
                            pago: ingreso.pago,
                            fact_nro: ingreso.fact_nro,
                            fact_condicion: ingreso.fact_condicion,
                            monto: ingreso.monto,
                            calcu_iva: ingreso.calcu_iva,
                            iva: ingreso.iva,
                            retencion: ingreso.retencion,
                            calcu_ret: ingreso.calcu_ret,
                            total_facturado: ingreso.total_facturado,
                            nro_ot: ingreso.nro_ot,
                            mon_s_iva: ingreso.mon_s_iva,
                            obs: ingreso.obs,
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
                                    //console.log(datos);//debug
                                    conn.query('SELECT * FROM clientes ORDER BY id DESC',function(err, rows1) {
                                        if (err) {console.log(err);}
                                        else{
                                            datos_clientes = [];
                                            rows1.forEach(function(row) {    
                                                datos_clientes.push(row);
                                            });  
                                            //console.log(datos);//debug nros de ot
                                            res.render('ingresos/editar', {
                                                title: 'Editar INGRESO',
                                                id: req.params.id,
                                                fecha: req.body.fecha,
                                                id_cliente: req.body.id_cliente,
                                                cliente: req.body.cliente,
                                                obra: req.body.obra,
                                                pago: req.body.pago,
                                                fact_nro: req.body.fact_nro,
                                                fact_condicion: req.body.fact_condicion,
                                                monto: req.body.monto,
                                                calcu_iva: req.body.calcu_iva,
                                                iva: req.body.iva,
                                                retencion: req.body.retencion,
                                                calcu_ret: req.body.calcu_ret,
                                                total_facturado: req.body.total_facturado,
                                                nro_ot: req.body.nro_ot,
                                                mon_s_iva: req.body.mon_s_iva,
                                                usuario_insert: user,
                                                data: datos,
                                                obs: req.body.obs,
                                                data_clientes: datos_clientes,
                                                usuario: user               
                                            })
                                        }
                                    })
                                }
                            })
                        })


                        // render to views/ot/add.ejs

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
            res.render('ingresos/editar', { 
                title: 'Editar INGRESO',
                fecha: req.body.fecha,
                id_cliente: req.body.id_cliente,
                cliente: req.body.cliente,
                obra: req.body.obra,
                fact_nro: req.body.fact_nro,
                fact_condicion: req.body.fact_condicion,
                monto: req.body.monto,
                calcu_iva: req.body.calcu_iva,
                iva: req.body.iva,
                retencion: req.body.retencion,
                calcu_ret: req.body.calcu_ret,
                total_facturado: req.body.total_facturado,
                nro_ot: req.body.nro_ot,
                pago: req.body.pago,
                mon_s_iva: req.body.mon_s_iva,
                obs: req.body.obs,
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
        //DESCARGAR PDF CON DATOS DEL ESTUDIO
        var file = path.resolve("Listado_INGRESOS.xlsx");
        res.contentType('Content-Type',"application/pdf");
        res.download(file, function (err) {
            if (err) {
                console.log("ERROR AL ENVIAR EL ARCHIVO:");
                console.log(err);
            } else {
                console.log("ARCHIVO ENVIADO!");
            }
        });
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
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
        var ingreso = { id: req.params.id }
        
        req.getConnection(function(error, conn) {
            conn.query('DELETE FROM ingresos WHERE id = ' + req.params.id, ingreso, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    //redireccionar al listado de ingresos
                    res.redirect('/ingresos')
                } else {
                    req.flash('success', 'INGRESO eliminado exitosamente! ID = ' + req.params.id)
                    //redireccionar al listado de ingresos
                    res.redirect('/ingresos')

                    //insertar log de uso de sistema en caso de suceso de insercion
                }
            })
        })
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

module.exports = app;