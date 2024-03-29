/* routing de mano de obra. igual que todos. */
var express = require('express');
var app = express();
var path = require('path');
var excel = require('excel4node');//para generar excel
var user = '';//global para ver el usuario
var fechita = '';//global para traer la fecha
var userId = '';//global para userid
var rol=0; //si el usuario/rol es restringido entonces mostramos la pagina restringida
var plan_ultimo=''; //


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
    const style = workbook.createStyle({
    font: {
        color: '#000000',
        size: 12
    },
    numberFormat: '#,##0.00; (#,##0.00); -'
    });

    const style1 = workbook.createStyle({
        font: {
            color: '#000000',
            fgColor:'#EF820D',
            size: 12
        },
        numberFormat: '#,##0; (#,##0); -'
    });

    const bgStyle = workbook.createStyle({
        fill: {
          type: 'pattern',
          patternType: 'solid',
          //bgColor: '#EF820D',
          //fgColor: '#EF820D', //forecolor es el color de fondo de la celda.
        }
      });

    //dibujamos el excel
    //primero la cabecera
    worksheet.cell(2,2).string('FECHA').style(style);
    worksheet.cell(2,3).string('EMPLEADO').style(style);
    worksheet.cell(2,4).string('CLIENTE PLAN MAÑANA').style(style);
    worksheet.cell(2,5).string('OBRA PLAN MAÑANA').style(style);
    worksheet.cell(2,6).string('ENCARGADO').style(style);
    worksheet.cell(2,7).string('TRATO CLIENTE').style(style);
    worksheet.cell(2,8).string('CLIENTE PLAN TARDE').style(style);
    worksheet.cell(2,9).string('OBRA PLAN TARDE').style(style);
    worksheet.cell(2,10).string('ENCARGADO').style(style);
    worksheet.cell(2,11).string('TRATO CLIENTE').style(style);

    //worksheet.cell(1,2).string('NRO OT').style(style);
    /*worksheet.cell(1,2).string('EMPLEADO').style(style);

    worksheet.cell(1,5).string('OT PLAN MAÑANA').style(style);
    worksheet.cell(1,6).string('CLIENTE REAL MAÑANA').style(style);
    worksheet.cell(1,7).string('CLIENTE PLAN TARDE').style(style);
    worksheet.cell(1,8).string('OBRA PLAN TARDE').style(style);
    worksheet.cell(1,9).string('OT PLAN TARDE').style(style);
    worksheet.cell(1,10).string('OBRA REAL MAÑANA').style(style);
    worksheet.cell(1,11).string('OT REAL MAÑANA').style(style);
    worksheet.cell(1,12).string('CLIENTE REAL TARDE').style(style);
    worksheet.cell(1,13).string('OBRA REAL TARDE').style(style);
    worksheet.cell(1,14).string('OT REAL TARDE').style(style);

    worksheet.cell(1,17).string('HS ENTRADA').style(style);
    worksheet.cell(1,18).string('HS SALIDA').style(style);*/
    //worksheet.cell(1,16).string('IMPUTACION 1').style(style);
    //worksheet.cell(1,17).string('IMPUTACION 2').style(style);

    //luego los datos
    var i = 1;
    rows.forEach(function(row) {
        worksheet.cell(i+2,2).date(formatear_fecha_yyyymmdd(row.fecha)).style({numberFormat: 'dd/mm/yyyy'});//ver formato fecha
        worksheet.cell(i+2,3).string(String(row.empleado)).style(style);
        worksheet.cell(i+2,4).string(String(row.cliente_plan_m)).style(style);
        worksheet.cell(i+2,5).string(String(row.obra_plan_m)).style(style);
        worksheet.cell(i+2,6).string(String(row.encargado)).style(style);
        worksheet.cell(i+2,7).string(String(row.trato_cliente)).style(style);
        worksheet.cell(i+2,8).string(String(row.cliente_plan_t)).style(style);
        worksheet.cell(i+2,9).string(String(row.obra_plan_t)).style(style);
        worksheet.cell(i+2,10).string(String(row.encargado2)).style(style);
        worksheet.cell(i+2,11).string(String(row.trato_cliente2)).style(style);


        //worksheet.cell(i+1,2).string(String(row.nro_ot)).style(style);
        /*worksheet.cell(i+1,2).string(String(row.empleado)).style(style);

        worksheet.cell(i+1,5).string(String(row.ot_plan_m)).style(style);
        worksheet.cell(i+1,6).string(String(row.cliente_plan_t)).style(style);
        worksheet.cell(i+1,7).string(String(row.obra_plan_t)).style(style);
        worksheet.cell(i+1,8).string(String(row.ot_plan_t)).style(style);
        worksheet.cell(i+1,9).string(String(row.cliente_real_m)).style(style);
        worksheet.cell(i+1,10).string(String(row.obra_real_m)).style(style);
        worksheet.cell(i+1,11).string(String(row.ot_real_m)).style(style);
        worksheet.cell(i+1,12).string(String(row.cliente_real_t)).style(style);
        worksheet.cell(i+1,13).string(String(row.obra_real_t)).style(style);
        worksheet.cell(i+1,14).string(String(row.ot_real_t)).style(style);

        worksheet.cell(i+1,17).string(String(row.h_entrada)).style(style);
        worksheet.cell(i+1,18).string(String(row.h_salida)).style(style);*/
        //worksheet.cell(i+1,16).string(String(row.imputacion_1)).style(style1);
        //worksheet.cell(i+1,17).string(String(row.imputacion_2)).style(style1);
        //worksheet.cell(i+1,2).string(String(row.)).style(style);//debug
        i=i+1;
        //console.log(row.descripcion);//debug
    });
    workbook.write('Listado_PLANLABORAL.xlsx');
}

function manhana()
{   var today = new Date();
    var dd = today.getDate()+1;
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) { dd = '0' + dd; } 
    if (mm < 10) { mm = '0' + mm; } 
    var today = yyyy + '-' + mm + '-' + dd;
    return today;
}
function hoy()
{   var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) { dd = '0' + dd; } 
    if (mm < 10) { mm = '0' + mm; } 
    var today = yyyy + '-' + mm + '-' + dd;
    return today;
}

// MOSTRAR LISTADO DE Trabajos / mano de PLANIFICADA
app.get('/', function(req, res, next) {
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        //vemos los datos en la base
        req.getConnection(function(error, conn) {
            conn.query('SELECT * FROM mano_obra where MONTH(fecha) = MONTH(CURRENT_DATE()) AND YEAR(fecha) = YEAR(CURRENT_DATE()) ORDER BY fecha DESC',function(err, rows1) {
                if (err) {
                    req.flash('error', err)
                    res.render('mano/listar', {title: 'Listado de Trabajos', data: '',usuario: user})
                } else {
                    req.getConnection(function(error, conn) {
                        conn.query('SELECT * FROM mano_obra where MONTH(fecha) = MONTH(CURRENT_DATE()) AND YEAR(fecha) = YEAR(CURRENT_DATE())  ORDER BY fecha DESC',function(err, rows) {
                            //if(err) throw err
                            if (err) {
                                req.flash('error', err)
                                res.render('mano/listar', {title: 'Listado de Trabajos', data: '',usuario: user})
                            } else {
                                generar_excel_plan_laboral(rows1);//generamos excel PLAN LABORAL / MANO OBRA
                                res.render('mano/listar', {title: 'Listado de Trabajos', usuario: user, data: rows})
                            }
                        })
                    })
                }
            })
        })
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

// MOSTRAR LISTADO DE TRABAJOS / mano de obra REAL
app.get('/real', function(req, res, next) {
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        //vemos los datos en la base
        req.getConnection(function(error, conn) {
            //este conjunto de datos es para el excel
            conn.query('SELECT * FROM mano_obra ORDER BY fecha DESC',function(err, rows1) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    res.render('mano/listar_real', {title: 'Listado de Trabajos', data: '',usuario: user})
                } else {
                    req.getConnection(function(error, conn) {
                        //datos para visualizar
                        //conn.query('select * from mano_obra where fecha >= DATE_SUB((select max(fecha) from mano_obra), INTERVAL 1 DAY)',function(err, rows) {
                        conn.query("SELECT * FROM mano_obra WHERE /*fecha < curdate() and*/ month(fecha) >= month(current_date())-1 and year(fecha) = year(current_date()) ORDER BY fecha DESC",function(err, rows) {
                        //conn.query("SELECT * FROM mano_obra WHERE /*fecha < curdate() and*/ (month(fecha) =12 and year(fecha) =2021) or (month(fecha) =1 and year(fecha) =2022)  ORDER BY fecha DESC",function(err, rows) {
                            //if(err) throw err
                            if (err) {
                                req.flash('error', err)
                                res.render('mano/listar_real', {title: 'Listado de Trabajos', data: '',usuario: user})
                            } else {
                                generar_excel_plan_laboral(rows1);//generamos excel PLAN LABORAL / MANO OBRA
                                res.render('mano/listar_real', {title: 'Listado de Trabajos', usuario: user, data: rows})
                            }
                        })
                    })
                }
            })
        })
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//RESPONSE PARA CARGA DE TRABAJOS / OBRAS ELABORADAS -- FORMULARIO NORMAL -- NO MOSTRAMOS 
app.get('/add', function(req, res, next){
   
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        req.getConnection(function(error, conn) {
            //traemos las OTs para mostrar en la ventana modal
            datos = [];
            conn.query('SELECT * FROM ot ORDER BY ot_nro DESC',function(err, rows) {
                if (err) {console.log(err);}
                else{
                    rows.forEach(function(row) {    
                        datos.push(row);
                    });
                    //console.log(datos);//debug de datos de OT
                    //traemos los personales para mostrar en el modal
                    datos_rrhh = [];
                    conn.query('SELECT * FROM empleados ORDER BY codigo DESC',function(err, rows) {
                        if (err) {console.log(err);}
                        else{
                            rows.forEach(function(row) {    
                                datos_rrhh.push(row);
                            });
                            //console.log(datos_rrhh);//debug de datos de RRHH
                            //dibujamos la tabla con los datos que consultamos
                            req.getConnection(function(error, conn) {
                                conn.query('select * from mano_obra where fecha >= DATE_SUB((select max(fecha) from mano_obra), INTERVAL 2 DAY)',function(err, rows) {
                                    //if(err) throw err
                                    if (err) {
                                        req.flash('error', err)
                                        res.render('mano/listar_real', {title: 'Listado de Trabajos', data: '',usuario: user})
                                    } else {
                                        var fec = hoy();
                                        res.render('mano/add_mano', {
                                        title: 'Cargar nuevo Plan Laboral',fecha: fec, /*nro_ot: '',*/ empleado: '',cliente_plan_m: '',cliente_real_m: '',cliente_plan_t: '',cliente_real_t: '', 
                                        obra_plan_m:'', obra_real_m:'', obra_plan_t:'', obra_real_t:'', encargado: '', trato_cliente: '',h_entrada: '', h_salida: '',
                                        monto:'',subtotal:'',hora_50:'',hora_100:'',hora_normal:'', hora_neg:'', ot_plan_m:'', ot_plan_t:'', ot_real_m:'', ot_real_t:'',otros:'',jornal:'',
                                        cliente_real_n: '', obra_real_n:'', ot_real_n:'', encargado2: '', trato_cliente2: '',
                                        usuario_insert: user, usuario: user, data: datos, data_rrhh: datos_rrhh});
                                    }
                                })
                            })
                        }
                    })
                }             
            })
        })
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//RESPONSE PARA CARGA DE TRABAJOS / OBRAS ELABORADAS -- FORMULARIO SIMPLIFICADO - CARGA CRISTINA 
app.get('/add_mano', function(req, res, next){
   
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        req.getConnection(function(error, conn) {
            //traemos las planificaciones para mostrar en la tablita frente
            datos = [];//datos de planificacion
            datos_ot = [];
            conn.query('SELECT * FROM ot order by id desc',function(err, rows) {
                if (err) {console.log(err);}
                else{
                    rows.forEach(function(row) {    
                        datos_ot.push(row);
                    });
                    //console.log(datos_ot);//debug de datos de MANO OBRA

                    conn.query('select * from mano_obra where fecha >= curdate()',function(err, rows) {
                        if (err){console.log(err);}
                        else{
                            rows.forEach(function(row) {    
                                datos.push(row);
                            });
                            //console.log(datos);//debug de datos de MANO OBRA
                            //traemos los personales para mostrar en el modal
                            datos_rrhh = [];
                            conn.query('SELECT * FROM empleados ORDER BY codigo DESC',function(err, rows) {
                                if (err) {console.log(err);}
                                else{
                                    rows.forEach(function(row) {    
                                        datos_rrhh.push(row);
                                    });
                                    //console.log(datos_rrhh);//debug de datos de RRHH
                                    //dibujamos la tabla con los datos que consultamos
                                    var fec = manhana();
                                    res.render('mano/add_mano', {
                                    title: 'Cargar nuevo Plan Laboral', fecha: fec, codigo: '', empleado: '',cliente_plan_m: '',cliente_real_m: '',cliente_plan_t: '',cliente_real_t: '', 
                                    obra_plan_m:'', obra_real_m:'', obra_plan_t:'', obra_real_t:'', encargado: '', trato_cliente: '',h_entrada: '', h_salida: '',
                                    monto:'',subtotal:'',hora_50:'',hora_100:'',hora_normal:'', hora_neg:'', ot_plan_m:'', ot_plan_t:'', ot_real_m:'', ot_real_t:'',otros:'',jornal:'',
                                    cliente_real_n: '', obra_real_n:'', ot_real_n:'', encargado2: '', trato_cliente2: '', hora_normal:'0',hora_50:'0',hora_100:'0',hora_neg:'0',pasaje:'0',
                                    usuario_insert: user, usuario: user, data_ot: datos_ot, data: datos, data_rrhh: datos_rrhh});
                                }              
                            })
                        }             
                    })
                }
            })
        })
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//aqui solamente listamos los datos segun la fecha cargada
app.post('/add_listar', function(req, res, next){
   
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        //vemos la fecha para consultar y listar
        fechita = formatear_fecha_yyyymmdd(req.sanitize('fecha1').trim());

        req.getConnection(function(error, conn) {
            //traemos las planificaciones para mostrar en la tablita frente
            datos = [];//datos de planificacion
            datos_ot = [];
            conn.query('SELECT * FROM ot order by id desc',function(err, rows) {
                if (err) {console.log(err);}
                else{
                    rows.forEach(function(row) {    
                        datos_ot.push(row);
                    });
                    //console.log(datos_ot);//debug de datos de MANO OBRA

                    conn.query("SELECT * FROM mano_obra WHERE fecha < curdate() ORDER BY fecha DESC",function(err, rows) {
                        if (err) {console.log(err);}
                        else{
                            rows.forEach(function(row) {    
                                datos.push(row);
                            });
                            //console.log(datos);//debug de datos de MANO OBRA
                            //traemos los personales para mostrar en el modal
                            datos_rrhh = [];
                            conn.query('SELECT * FROM empleados ORDER BY codigo DESC',function(err, rows) {
                                if (err) {console.log(err);}
                                else{
                                    rows.forEach(function(row) {    
                                        datos_rrhh.push(row);
                                    });
                                    //console.log(datos_rrhh);//debug de datos de RRHH
                                    //dibujamos la tabla con los datos que consultamos

                                    res.render('mano/add_mano', {
                                    title: 'Cargar nuevo Plan Laboral',fecha: '', codigo: '', empleado: '',cliente_plan_m: '',cliente_real_m: '',cliente_plan_t: '',cliente_real_t: '', 
                                    obra_plan_m:'', obra_real_m:'', obra_plan_t:'', obra_real_t:'', encargado: '', trato_cliente: '',h_entrada: '', h_salida: '',
                                    monto:'',subtotal:'',hora_50:'',hora_100:'',hora_normal:'', hora_neg:'', ot_plan_m:'', ot_plan_t:'', ot_real_m:'', ot_real_t:'',otros:'',jornal:'',
                                    cliente_real_n: '', obra_real_n:'', ot_real_n:'',encargado2: '', trato_cliente2: '',hora_normal:'',hora_50:'',hora_100:'',hora_neg:'',pasaje:'',
                                    usuario_insert: user, usuario: user, data_ot: datos_ot, data: datos, data_rrhh: datos_rrhh});
                                }              
                            })
                        }             
                    })
                }
            })
        })
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//NUEVO PROGRAMACION DE OBRA - POST DE INSERT SIMPLIFICADO
app.post('/add_mano', function(req, res, next){   
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


            
            //AL AGREGAR DATOS, SE CARGA LO PLANIFICADO A LO REAL, NO SE LEE EL INPUT / POR ESO ASIGNAMOS LO PLAN A LO REAL
            //EDIT DEL COMENTARIO ANTERIOR: FINALMENTE SE CARGA VACÍO LO REAL
            var mano_plan = {
                fecha: formatear_fecha_yyyymmdd(req.sanitize('fecha').trim()),
                codigo: req.sanitize('codigo').trim(),
                empleado: req.sanitize('empleado').trim(),
                cliente_plan_m: req.sanitize('cliente_plan_m').trim(),
                cliente_plan_t: req.sanitize('cliente_plan_t').trim(),
                obra_plan_m: req.sanitize('obra_plan_m').trim(),
                obra_plan_t: req.sanitize('obra_plan_t').trim(),
                ot_plan_m: req.sanitize('ot_plan_m').trim(),
                ot_plan_t: req.sanitize('ot_plan_t').trim(),
                h_entrada: req.sanitize('h_entrada').trim(),
                h_salida: req.sanitize('h_salida').trim(),
                cliente_real_m: '',//req.sanitize('cliente_plan_m').trim(),//PLAN -> REAL
                cliente_real_t: '',//req.sanitize('cliente_plan_t').trim(),//PLAN -> REAL
                obra_real_m: '',//req.sanitize('obra_plan_m').trim(),//PLAN -> REAL
                obra_real_t: '',//req.sanitize('obra_plan_t').trim(),//PLAN -> REAL
                ot_real_m: '',//req.sanitize('ot_plan_m').trim(),//PLAN -> REAL
                ot_real_t: '',//req.sanitize('ot_plan_t').trim(),//PLAN -> REAL
                encargado: req.sanitize('encargado').trim(),
                trato_cliente: req.sanitize('trato_cliente').trim(),
                cliente_real_n: req.sanitize('cliente_real_n').trim(),
                obra_real_n: req.sanitize('obra_real_n').trim(),
                ot_real_n: req.sanitize('ot_real_n').trim(),
                encargado2: req.sanitize('encargado2').trim(),
                trato_cliente2: req.sanitize('trato_cliente2').trim(),
                hora_normal: req.sanitize('hora_normal').trim(),
                hora_50: req.sanitize('hora_50').trim(),
                hora_100: req.sanitize('hora_100').trim(),
                hora_neg: req.sanitize('hora_neg').trim(),
                pasaje: req.sanitize('pasaje').trim(),
                usuario_insert: user
            }   
            
            //conectamos a la base de datos
            req.getConnection(function(error, conn) {
                conn.query('INSERT INTO mano_obra SET ?', mano_plan, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err)
                        
                        // render to views/factura/add.ejs
                        res.render('mano/add_mano', {
                            title: 'Agregar Nuevo Plan Laboral',
                            fecha: mano_plan.fecha,
                            //nro_ot: mano_plan.nro_ot,
                            empleado: mano_plan.empleado,
                            cliente_plan_m: mano_plan.cliente_plan_m,
                            //cliente_real_m: mano_plan.cliente_real_m,
                            cliente_plan_t: mano_plan.cliente_plan_t,
                            //cliente_real_t: mano_plan.cliente_real_t,
                            obra_plan_m: mano_plan.obra_plan_m,
                            //obra_real_m: mano_plan.obra_real_m,
                            obra_plan_t: mano_plan.obra_plan_t,
                            //obra_real_t: mano_plan.obra_real_t,
                            //encargado: mano_plan.encargado,
                            //trato_cliente: mano_plan.trato_cliente,
                            //h_entrada: mano_plan.h_entrada,
                            //h_salida: mano_plan.h_salida,
                            //monto: mano_plan.monto,
                            //subtotal: mano_plan.subtotal,
                            //hora_50: mano_plan.hora_50,
                            //hora_100: mano_plan.hora_100,
                            //hora_normal: mano_plan.hora_normal,
                            //hora_neg: mano_plan.hora_neg,
                            ot_plan_m: mano_plan.ot_plan_m,
                            //ot_real_m: mano_plan.ot_real_m,
                            ot_plan_t: mano_plan.ot_plan_t,
                            //ot_real_t: mano_plan.ot_real_t,
                            //otros: mano_plan.otros,
                            //jornal: mano_plan.jornal,
                            usuario: user
                        })
                    } else {                
                        req.flash('success', 'Datos agregados correctamente!')
                        
                        // render to views/mano/add.ejs
                        req.getConnection(function(error, conn) {
                            //traemos las planificaciones para mostrar en la tablita frente
                            datos = [];//datos de planificacion
                            datos_ot = [];
                            conn.query('SELECT * FROM ot order by id desc',function(err, rows) {
                                if (err) {console.log(err);}
                                else{
                                    rows.forEach(function(row) {    
                                        datos_ot.push(row);
                                    });
                                    //console.log(datos_ot);//debug de datos de MANO OBRA
                
                                    conn.query('SELECT * FROM mano_obra WHERE fecha >= curdate() ORDER BY fecha DESC',function(err, rows) {
                                        if (err) {console.log(err);}
                                        else{
                                            rows.forEach(function(row) {    
                                                datos.push(row);
                                            });
                                            //console.log(datos);//debug de datos de MANO OBRA
                                            //traemos los personales para mostrar en el modal
                                            datos_rrhh = [];
                                            conn.query('SELECT * FROM empleados ORDER BY codigo DESC',function(err, rows) {
                                                if (err) {console.log(err);}
                                                else{
                                                    rows.forEach(function(row) {    
                                                        datos_rrhh.push(row);
                                                    });
                                                    //console.log(datos_rrhh);//debug de datos de RRHH
                                                    //dibujamos la tabla con los datos que consultamos
                
                                                    res.render('mano/add_mano', {
                                                        title: 'Cargar nuevo Plan Laboral',fecha: '', codigo: '', empleado: '',cliente_plan_m: '',cliente_real_m: '',cliente_plan_t: '',cliente_real_t: '', 
                                                        obra_plan_m:'', obra_real_m:'', obra_plan_t:'', obra_real_t:'', encargado: '', trato_cliente: '',h_entrada: '', h_salida: '',
                                                        monto:'',subtotal:'',hora_50:'',hora_100:'',hora_normal:'', hora_neg:'', ot_plan_m:'', ot_plan_t:'', ot_real_m:'', 
                                                        ot_real_t:'',otros:'',jornal:'', cliente_real_n: '', obra_real_n:'', ot_real_n:'',encargado2: '', trato_cliente2: '',
                                                        hora_normal:'',hora_50:'',hora_100:'',hora_neg:'',pasaje:'',
                                                        usuario_insert: user, usuario: user, data_ot: datos_ot, data: datos, data_rrhh: datos_rrhh});
                                                }              
                                            })
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
            res.render('mano/add_mano', { 
                title: 'Agregar Nuevo Plan Laboral',
                fecha: mano_plan.fecha,
                //nro_ot: mano_plan.nro_ot,
                codigo: mano_plan.codigo,
                empleado: mano_plan.empleado,
                cliente_plan_m: mano_plan.cliente_plan_m,
                cliente_plan_t: mano_plan.cliente_plan_t,
                obra_plan_m: mano_plan.obra_plan_m,
                obra_plan_t: mano_plan.obra_plan_t,
                ot_plan_m: mano_plan.ot_plan_m,
                ot_plan_t: mano_plan.ot_plan_t,
                cliente_real_m: mano_plan.cliente_real_m,
                cliente_real_t: mano_plan.cliente_real_t,
                obra_real_m: mano_plan.obra_real_m,
                obra_real_t: mano_plan.obra_real_t,
                ot_real_m: mano_plan.ot_real_m,
                ot_real_t: mano_plan.ot_real_t,
                h_entrada: mano_plan.h_entrada,
                h_salida: mano_plan.h_salida,
                encargado: mano_plan.encargado,
                trato_cliente: mano_obra.trato_cliente,
                hora_normal: mano_plan.hora_normal,
                hora_50: mano_plan.hora_50,
                hora_100: mano_plan.hora_100,
                hora_neg: mano_plan.hora_neg,
                pasaje: mano_obra.pasaje,
                usuario: user
            })
        }
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//NUEVO PROGRAMACION DE OBRA - POST DE INSERT NORMAL
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

            var mano_plan = {
                fecha: formatear_fecha_yyyymmdd(req.sanitize('fecha').trim()),
                codigo: req.sanitize('codigo').trim(),
                empleado: req.sanitize('empleado').trim(),
                cliente_plan_m: req.sanitize('cliente_plan_m').trim(),
                cliente_real_m: req.sanitize('cliente_real_m').trim(),
                cliente_plan_t: req.sanitize('cliente_plan_t').trim(),
                cliente_real_t: req.sanitize('cliente_real_t').trim(),
                obra_plan_m: req.sanitize('obra_plan_m').trim(),
                obra_real_m: req.sanitize('obra_real_m').trim(),
                obra_plan_t: req.sanitize('obra_plan_t').trim(),
                obra_real_t: req.sanitize('obra_real_t').trim(),
                encargado: req.sanitize('encargado').trim(),
                trato_cliente: req.sanitize('trato_cliente').trim(),
                h_entrada: req.sanitize('h_entrada').trim(),
                h_salida: req.sanitize('h_salida').trim(),
                monto: Number(req.sanitize('monto').trim()),
                subtotal: Number(req.sanitize('subtotal').trim()),
                ot_plan_m: req.sanitize('ot_plan_m').trim(),
                ot_real_m: req.sanitize('ot_real_m').trim(),
                ot_plan_t: req.sanitize('ot_plan_t').trim(),
                ot_real_t: req.sanitize('ot_real_t').trim(),
                otros: Number(req.sanitize('otros').trim()),
                jornal: Number(req.sanitize('jornal').trim()),
                hora_normal: req.sanitize('hora_normal').trim(),
                hora_50: req.sanitize('hora_50').trim(),
                hora_100: req.sanitize('hora_100').trim(),
                hora_neg: req.sanitize('hora_neg').trim(),
                pasaje: req.sanitize('pasaje').trim(),
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
                            codigo: mano_plan.codigo,
                            empleado: mano_plan.empleado,
                            cliente_plan_m: mano_plan.cliente_plan_m,
                            cliente_real_m: mano_plan.cliente_real_m,
                            cliente_plan_t: mano_plan.cliente_plan_t,
                            cliente_real_t: mano_plan.cliente_real_t,
                            cliente_real_n: mano_plan.cliente_real_n,
                            obra_plan_m: mano_plan.obra_plan_m,
                            obra_real_m: mano_plan.obra_real_m,
                            obra_plan_t: mano_plan.obra_plan_t,
                            obra_real_t: mano_plan.obra_real_t,
                            obra_real_n: mano_plan.obra_real_n,
                            encargado: mano_plan.encargado,
                            trato_cliente: mano_plan.trato_cliente,
                            h_entrada: mano_plan.h_entrada,
                            h_salida: mano_plan.h_salida,
                            monto: mano_plan.monto,
                            subtotal: mano_plan.subtotal,
                            hora_50: mano_plan.hora_50,
                            hora_100: mano_plan.hora_100,
                            hora_normal: mano_plan.hora_normal,
                            hora_neg: mano_plan.hora_neg,
                            ot_plan_m: mano_plan.ot_plan_m,
                            ot_real_m: mano_plan.ot_real_m,
                            ot_plan_t: mano_plan.ot_plan_t,
                            ot_real_t: mano_plan.ot_real_t,
                            ot_real_n: mano_plan.ot_real_n,
                            hora_normal: mano_plan.hora_normal,
                            hora_50: mano_plan.hora_50,
                            hora_100: mano_plan.hora_100,
                            hora_neg: mano_plan.hora_neg,
                            pasaje: mano_obra.pasaje,
                            otros: mano_plan.otros,
                            //jornal: mano_plan.jornal,
                            usuario: user
                        })
                    } else {                
                        req.flash('success', 'Datos agregados correctamente!')
                        
                        // render to views/mano/add.ejs
                        req.getConnection(function(error, conn) {
                            
                            //traemos las OTs para mostrar en la ventana modal
                            datos = [];
                            conn.query('SELECT * FROM ot ORDER BY ot_nro DESC',function(err, rows) {
                                if (err) {
                                    console.log(err);
                                }
                                else{

                                    rows.forEach(function(row) {    
                                        datos.push(row);
                                    });
                                    console.log(datos);//debug de datos de OT
                                    //traemos los personales para mostrar en el modal
                                    datos_rrhh = [];
                                    conn.query('SELECT * FROM empleados ORDER BY codigo DESC',function(err, rows) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        else{

                                            rows.forEach(function(row) {    
                                                datos_rrhh.push(row);
                                            });
                                            console.log(datos_rrhh);//debug de datos de RRHH
                                                        //dibujamos la tabla con los datos que consultamos
                                            res.render('mano/add', {
                                            title: 'Cargar nuevo Plan Laboral',fecha: '', codigo: '', empleado: '',cliente_plan_m: '',cliente_real_m: '',cliente_plan_t: '',cliente_real_t: '', 
                                            obra_plan_m:'', obra_real_m:'', obra_plan_t:'', obra_real_t:'', encargado: '', trato_cliente: '',h_entrada: '', h_salida: '',
                                            monto:'',subtotal:'',hora_50:'',hora_100:'',hora_normal:'', hora_neg:'', ot_plan_m:'', ot_plan_t:'', ot_real_m:'', ot_real_t:'',otros:'',jornal:'',
                                            encargado2: '', trato_cliente2: '',cliente_real_n: '', obra_real_n:'', ot_real_n:'', hora_normal:'',hora_50:'',hora_100:'',hora_neg:'',pasaje:'',
                                            usuario_insert: user, usuario: user,  data: datos, data_rrhh: datos_rrhh});
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
            res.render('mano/add', { 
                title: 'Agregar Nuevo Plan Laboral',
                fecha: mano_plan.fecha,
                codigo: mano_plan.codigo,
                empleado: mano_plan.empleado,
                cliente_plan_m: mano_plan.cliente_plan_m,
                cliente_real_m: mano_plan.cliente_real_m,
                cliente_plan_t: mano_plan.cliente_plan_t,
                cliente_real_t: mano_plan.cliente_real_t,
                cliente_real_n: mano_plan.cliente_real_n,//
                obra_plan_m: mano_plan.obra_plan_m,
                obra_real_m: mano_plan.obra_real_m,
                obra_plan_t: mano_plan.obra_plan_t,
                obra_real_t: mano_plan.obra_real_t,
                obra_real_n: mano_plan.obra_real_n,//
                encargado: mano_plan.encargado,
                trato_cliente: mano_plan.trato_cliente,
                h_entrada: mano_plan.h_entrada,
                h_salida: mano_plan.h_salida,
                monto: mano_plan.monto,
                subtotal: mano_plan.subtotal,
                hora_50: mano_plan.hora_50,
                hora_100: mano_plan.hora_100,
                hora_normal: mano_plan.hora_normal,
                hora_neg: mano_plan.hora_neg,
                ot_plan_m: mano_plan.ot_plan_m,
                ot_real_m: mano_plan.ot_real_m,
                ot_plan_t: mano_plan.ot_plan_t,
                ot_real_t: mano_plan.ot_real_t,
                ot_real_n: mano_plan.ot_real_n,//
                hora_normal: mano_plan.hora_normal,
                hora_50: mano_plan.hora_50,
                hora_100: mano_plan.hora_100,
                hora_neg: mano_plan.hora_neg,
                pasaje: mano_obra.pasaje,
                //otros: mano_plan.otros,
                //jornal: mano_plan.jornal,
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
            conn.query('SELECT * FROM mano_obra WHERE id = ' + req.params.id, function(err, rows, fields) {
                if(err) throw err
                
                //Si no se encuentra la planificacion laboral
                if (rows.length <= 0) {
                    req.flash('error', 'PLAN LABORAL con id = ' + req.params.id + ' no encontrado')
                    res.redirect('/mano')
                }
                else { // Si existe el plan
                    //traemos los valores que preguntamos
                    req.getConnection(function(error, conn) {
                        //traemos las OTs para mostrar en la ventana modal
                        datos_ot = [];
                        conn.query('SELECT * FROM ot ORDER BY ot_nro DESC',function(err, rows1) {
                            if (err) { console.log(err);}
                            else{
                                rows1.forEach(function(row) {    
                                    datos_ot.push(row);
                                });
                                //console.log(datos);//debug de datos de OT
                                //traemos los personales para mostrar en el modal
                                datos_rrhh = [];
                                conn.query('SELECT * FROM empleados ORDER BY codigo DESC',function(err, rows2) {
                                    if (err) { console.log(err); }
                                    else{
                                        rows2.forEach(function(row) {    
                                            datos_rrhh.push(row);
                                        });
                                        //console.log(datos_rrhh);//debug de datos de RRHH
                                        //dibujamos la tabla con los datos que consultamos
                                        var date1 = new Date(formatear_fecha_yyyymmdd(rows[0].fecha));//traemos la fecha de carga de la planificacion.
                                        var date2 = new Date(hoy());//de hoy
                                        date1.setDate(date1.getDate() + 1);//sumamos 1 siempre a las fechas cuando se declara new date
                                        date2.setDate(date2.getDate() + 1);//sumamos 1 siempre a las fechas cuando se declara new date
                                        //antes de pasar la info, tenemos que ver que usuario/rol y que fecha es para restringir
                                        

                                        //REGLAS
                                        //PLANIFICACION DE HOY NO DEBE EDITARSE NADA (rol: 2)
                                        //PLANIFICACION DE MANHANA PUEDE EDITARSE TODO (rol: 1)
                                        if(user == "cibanez" || user == "prueba")//[cambiar a asignar para probar la logica]
                                        {   //vemos cuantos dias pasaron para ver la restriccion
                                            //var dias_dif = Math.ceil(Math.abs(date2.getTime() - date1.getTime())/ (1000 * 3600 * 24)); 
                                            var dias_dif = Math.ceil((date1.getTime()- date2.getTime())/ (1000 * 3600 * 24)); 
                                            if(dias_dif < 0)//para el caso de lo real. solamente modificable el de ayer
                                            {rol = 2;}
                                            if(dias_dif == 0)//para el caso de planificado, si estoy viendo la planificacion para hoy NO DEBE PODER EDITARSE NADA
                                            {rol = 2;}
                                            //if(dias_dif == 1)//si la fecha de carga igual a la fecha de hoy + 1 dia
                                            //{rol = 1;}//es el dia siguiente 
                                            if(dias_dif >= 1)//si la fecha de carga igual a la fecha de hoy + 1 dia //PARAM = 2 para darle 5 dias de tiempo
                                            {rol = 1;}//es +2 o mas dias 
                                        }
                                        
                                        res.render('mano/editar', {
                                            title: 'Editar Plan Laboral', 
                                            //data: rows[0],
                                            id: rows[0].id,
                                            fecha: formatear_fecha_yyyymmdd(date1),
                                            codigo: rows[0].codigo,
                                            empleado: rows[0].empleado,
                                            cliente_plan_m: rows[0].cliente_plan_m,
                                            cliente_real_m: rows[0].cliente_real_m,
                                            cliente_plan_t: rows[0].cliente_plan_t,
                                            cliente_real_t: rows[0].cliente_real_t,
                                            cliente_real_n: rows[0].cliente_real_n,//cliente real nocturno
                                            obra_plan_m: rows[0].obra_plan_m,
                                            obra_real_m: rows[0].obra_real_m,
                                            obra_plan_t: rows[0].obra_plan_t,
                                            obra_real_t: rows[0].obra_real_t,
                                            obra_real_n: rows[0].obra_real_n,//obra real nocturno
                                            encargado: rows[0].encargado,
                                            trato_cliente: rows[0].trato_cliente,
                                            h_entrada: rows[0].h_entrada,
                                            h_salida: rows[0].h_salida,
                                            monto: rows[0].monto,
                                            subtotal: rows[0].subtotal,
                                            hora_50: rows[0].hora_50,
                                            hora_100: rows[0].hora_100,
                                            hora_normal: rows[0].hora_normal,
                                            hora_neg: rows[0].hora_neg,
                                            ot_plan_m: rows[0].ot_plan_m,
                                            ot_real_m: rows[0].ot_real_m,
                                            ot_plan_t: rows[0].ot_plan_t,
                                            ot_real_t: rows[0].ot_real_t,
                                            ot_real_n: rows[0].ot_real_n,//OT real nocturn, no existe plainficado
                                            hora_normal: rows[0].hora_normal,
                                            hora_50: rows[0].hora_50,
                                            hora_100: rows[0].hora_100,
                                            hora_neg: rows[0].hora_neg,
                                            pasaje: rows[0].pasaje,
                                            //jornal: rows[0].jornal,
                                            encargado2: rows[0].encargado2,
                                            trato_cliente2: rows[0].trato_cliente2,
                                            restri: rol,
                                            data_ot: datos_ot,//datos de ot
                                            data_rrhh:datos_rrhh, //datos de rrhh
                                            usuario: user
                                        })
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

        /* INICIO-- cambios si la OT es administrativa */
        var cpm = req.sanitize('cliente_plan_m').trim();
        var cpt = req.sanitize('cliente_plan_t').trim();
        var jornal_ = 0;
        var monto_ = 0;
        var subtotal_ = 0;
        
        if(cpm == '9999000' && cpt == '9999000')
        {   //si las OT son administrativas, entonces el jornal y el monto deben ser 0
            jornal_ = 0;
            monto_ = 0;
            subtotal_ = 0;
        }
        /* FIN-- cambios si la OT es administrativa */
        
        if( !errors ) {   //No errors were found.  Passed Validation!
        var mano_plan = {
                fecha: formatear_fecha_yyyymmdd(req.sanitize('fecha').trim()),
                codigo: req.sanitize('codigo').trim(),
                empleado: req.sanitize('empleado').trim(),
                cliente_plan_m: req.sanitize('cliente_plan_m').trim(),
                cliente_real_m: req.sanitize('cliente_plan_m').trim(),
                cliente_plan_t: req.sanitize('cliente_plan_t').trim(),
                cliente_real_t: req.sanitize('cliente_plan_t').trim(),
                //cliente_real_n: req.sanitize('cliente_real_n').trim(),
                obra_plan_m: req.sanitize('obra_plan_m').trim(),
                obra_real_m: req.sanitize('obra_plan_m').trim(),
                obra_plan_t: req.sanitize('obra_plan_t').trim(),
                obra_real_t: req.sanitize('obra_plan_t').trim(),
                //obra_real_n: req.sanitize('obra_real_n').trim(),
                encargado: req.sanitize('encargado').trim(),
                trato_cliente: req.sanitize('trato_cliente').trim(),
                encargado2: req.sanitize('encargado2').trim(),//encargado tarde
                trato_cliente2: req.sanitize('trato_cliente2').trim(),//trato cliente tarde
                //en lo real cargamos lo que se haya modificado en lo planificado
                encargado_real: req.sanitize('encargado').trim(),//
                trato_cliente_real: req.sanitize('trato_cliente').trim(),//
                encargado_real2: req.sanitize('encargado2').trim(),//
                trato_cliente_real2: req.sanitize('trato_cliente2').trim(),//
                //h_entrada: req.sanitize('h_entrada').trim(),
                //h_salida: req.sanitize('h_salida').trim(),
                //monto: monto_,//agregado 25/03/2020 por temas de actualizar cuando es ot admin
                //subtotal: subtotal_,//agregado 25/03/2020 por temas de actualizar cuando es ot admin
                //hora_50: req.sanitize('hora_50').trim(),
                //hora_100: req.sanitize('hora_100').trim(),
                //hora_normal: req.sanitize('hora_normal').trim(),
                //hora_neg: req.sanitize('hora_neg').trim(),
                ot_plan_m: req.sanitize('ot_plan_m').trim(),
                ot_real_m: req.sanitize('ot_plan_m').trim(),
                ot_plan_t: req.sanitize('ot_plan_t').trim(),
                ot_real_t: req.sanitize('ot_plan_t').trim(),
                ot_real_n: req.sanitize('ot_real_n').trim(),
                //hora_neg: req.sanitize('hora_neg').trim(),
                //pasaje: Number(req.sanitize('pasaje').trim()),//no actualizamos prque no existe en la pagina
                //restri: Number(req.sanitize('restri').trim())
                //jornal: jornal_,//agregado 25/03/2020 por temas de actualizar cuando es ot admin
                usuario_insert: user
            } 

            if(cpm == '9999000' && cpt == '9999000'){
                mano_plan = {
                    fecha: formatear_fecha_yyyymmdd(req.sanitize('fecha').trim()),
                    codigo: req.sanitize('codigo').trim(),
                    empleado: req.sanitize('empleado').trim(),
                    cliente_plan_m: req.sanitize('cliente_plan_m').trim(),
                    cliente_real_m: req.sanitize('cliente_plan_m').trim(),
                    cliente_plan_t: req.sanitize('cliente_plan_t').trim(),
                    cliente_real_t: req.sanitize('cliente_plan_t').trim(),
                    //cliente_real_n: req.sanitize('cliente_real_n').trim(),
                    obra_plan_m: req.sanitize('obra_plan_m').trim(),
                    obra_real_m: req.sanitize('obra_plan_m').trim(),
                    obra_plan_t: req.sanitize('obra_plan_t').trim(),
                    obra_real_t: req.sanitize('obra_plan_t').trim(),
                    //obra_real_n: req.sanitize('obra_real_n').trim(),
                    encargado: req.sanitize('encargado').trim(),
                    trato_cliente: req.sanitize('trato_cliente').trim(),
                    encargado2: req.sanitize('encargado2').trim(),//encargado tarde
                    trato_cliente2: req.sanitize('trato_cliente2').trim(),//trato cliente tarde
                    //en lo real cargamos lo que se haya modificado en lo planificado
                    encargado_real: req.sanitize('encargado').trim(),//
                    trato_cliente_real: req.sanitize('trato_cliente').trim(),//
                    encargado_real2: req.sanitize('encargado2').trim(),//
                    trato_cliente_real2: req.sanitize('trato_cliente2').trim(),//
                    //h_entrada: req.sanitize('h_entrada').trim(),
                    //h_salida: req.sanitize('h_salida').trim(),
                    monto: monto_,//agregado 25/03/2020 por temas de actualizar cuando es ot admin
                    subtotal: subtotal_,//agregado 25/03/2020 por temas de actualizar cuando es ot admin
                    //hora_50: req.sanitize('hora_50').trim(),
                    //hora_100: req.sanitize('hora_100').trim(),
                    //hora_normal: req.sanitize('hora_normal').trim(),
                    //hora_neg: req.sanitize('hora_neg').trim(),
                    ot_plan_m: req.sanitize('ot_plan_m').trim(),
                    ot_real_m: req.sanitize('ot_plan_m').trim(),
                    ot_plan_t: req.sanitize('ot_plan_t').trim(),
                    ot_real_t: req.sanitize('ot_plan_t').trim(),
                    ot_real_n: req.sanitize('ot_real_n').trim(),
                    //hora_neg: req.sanitize('hora_neg').trim(),
                    //pasaje: Number(req.sanitize('pasaje').trim()),//no actualizamos prque no existe en la pagina
                    //restri: Number(req.sanitize('restri').trim())
                    jornal: jornal_,//agregado 25/03/2020 por temas de actualizar cuando es ot admin
                    usuario_insert: user
                } 
            }

            
            req.getConnection(function(error, conn) {
                conn.query('UPDATE mano_obra SET ? WHERE id = ' + req.params.id, mano_plan, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err)
                        
                        // render to views/gastos/add.ejs
                        res.render('mano/editar', {title: 'Editar Plan Laboral', id: req.params.id, fecha: mano_plan.fecha, codigo: mano_plan.codigo, empleado: mano_plan.empleado,
                            cliente_plan_m: mano_plan.cliente_plan_m, cliente_real_m: mano_plan.cliente_plan_m, cliente_plan_t: mano_plan.cliente_plan_t, cliente_real_t: mano_plan.cliente_plan_t,
                            //cliente_real_n: mano_plan.cliente_real_n,
                            obra_plan_m: mano_plan.obra_plan_m,obra_real_m: mano_plan.obra_plan_m, obra_plan_t: mano_plan.obra_plan_t, obra_real_t: mano_plan.obra_plan_t, obra_real_n: mano_plan.obra_real_n,
                            encargado: mano_plan.encargado, trato_cliente: mano_plan.trato_cliente, encargado2: mano_plan.encargado2, trato_cliente2: mano_plan.trato_cliente2,
                            //h_entrada: mano_plan.h_entrada,
                            //h_salida: mano_plan.h_salida,
                            //monto: mano_plan.monto,
                            //subtotal: mano_plan.subtotal,
                            //hora_50: mano_plan.hora_50,
                            //hora_100: mano_plan.hora_100,
                            //hora_normal: mano_plan.hora_normal,
                            //hora_neg: mano_plan.hora_neg,
                            ot_plan_m: mano_plan.ot_plan_m, ot_real_m: mano_plan.ot_plan_m,ot_plan_t: mano_plan.ot_plan_t,ot_real_t: mano_plan.ot_plan_t,ot_real_n: mano_plan.ot_real_n,
                            //pasaje: mano_plan.pasaje,
                            restri: mano_plan.restri,//pasamos la restriccion guardada en el req
                            //jornal: mano_plan.jornal,
                            usuario: user
                        })
                    } else {                
                        req.flash('success', 'Datos actualizados correctamente!')

                        //traemos las planificaciones para mostrar en la tablita frente
                        datos = [];//datos de planificacion
                        datos_ot = [];
                        conn.query('SELECT * FROM mano_obra WHERE id = ' + req.params.id, function(err, rows) {
                            if (err) {console.log(err);}
                            else{
                                rows.forEach(function(row) {    
                                    datos_ot.push(row);
                                });
                                //console.log(datos_ot);//debug de datos de MANO OBRA
            
                                conn.query('SELECT * FROM mano_obra order by fecha desc',function(err, rows) {
                                    if (err) {console.log(err);}
                                    else{
                                        rows.forEach(function(row) {    
                                            datos.push(row);
                                        });
                                        //console.log(datos);//debug de datos de MANO OBRA
                                        //traemos los personales para mostrar en el modal
                                        datos_rrhh = [];
                                        conn.query('SELECT * FROM empleados ORDER BY codigo DESC',function(err, rows1) {
                                            if (err) {console.log(err);}
                                            else{
                                                rows1.forEach(function(row1) {    
                                                    datos_rrhh.push(row1);
                                                });
                                                //console.log(datos_rrhh);//debug de datos de RRHH
                                                //console.log(datos_rrhh);//debug de datos de RRHH
                                                //dibujamos la tabla con los datos que consultamos
                                                var date1 = new Date(formatear_fecha_yyyymmdd(rows[0].fecha));//traemos la fecha de carga de la planificacion.
                                                var date2 = new Date(hoy());//de hoy
                                                date1.setDate(date1.getDate() + 1);//sumamos 1 siempre a las fechas cuando se declara new date
                                                date2.setDate(date2.getDate() + 1);//sumamos 1 siempre a las fechas cuando se declara new date
                                                //antes de pasar la info, tenemos que ver que usuario/rol y que fecha es para restringir

                                                if(user == "cibanez" || user == "prueba")//[cambiar a asignar para probar la logica]
                                                {   //vemos cuantos dias pasaron para ver la restriccion
                                                    //var dias_dif = Math.ceil(Math.abs(date2.getTime() - date1.getTime())/ (1000 * 3600 * 24)); 
                                                    var dias_dif = Math.ceil((date1.getTime()- date2.getTime())/ (1000 * 3600 * 24)); 
                                                    if(dias_dif < 0)//para el caso de planificado, si estoy viendo lo real para ayer
                                                    {rol = 2;}
                                                    if(dias_dif == 0)//para el caso de planificado, si estoy viendo la planificacion para hoy NO DEBE PODER EDITARSE NADA
                                                    {rol = 2;}
                                                    if(dias_dif == 1)//si la fecha de carga igual a la fecha de hoy + 1 dia
                                                    {rol = 1;}//es el dia siguiente 
                                                    if(dias_dif >= 2)//si la fecha de carga igual a la fecha de hoy + 1 dia //PARAM = 2 para darle 2 dias de tiempo
                                                    {rol = 2;}//es +2 o mas dias 
                                                }


                                                res.render('mano/editar', {title: 'Editar Plan Laboral',id: req.params.id,fecha: req.body.fecha,codigo: req.body.codigo,empleado: req.body.empleado,
                                                    cliente_plan_m: req.body.cliente_plan_m,cliente_real_m: req.body.cliente_real_m,cliente_plan_t: req.body.cliente_plan_t,cliente_real_t: req.body.cliente_real_t,
                                                    cliente_real_n: req.body.cliente_real_n,obra_plan_m: req.body.obra_plan_m,obra_real_m: req.body.obra_real_m,obra_plan_t: req.body.obra_plan_t,
                                                    obra_real_t: req.body.obra_real_t,obra_real_n: req.body.obra_real_n,encargado: req.body.encargado,trato_cliente: req.body.trato_cliente,
                                                    encargado2: req.body.encargado2,trato_cliente2: req.body.trato_cliente2,h_entrada: req.body.h_entrada,h_salida: req.body.h_salida,
                                                    monto: req.body.monto, /* */subtotal: req.body.subtotal, /* */hora_50: req.body.hora_50,hora_100: req.body.hora_100,hora_normal: req.body.hora_normal,
                                                    hora_neg: req.body.hora_neg,ot_plan_m: req.body.ot_plan_m,ot_real_m: req.body.ot_real_m,ot_plan_t: req.body.ot_plan_t,ot_real_t: req.body.ot_real_t,
                                                    ot_real_n: req.body.ot_real_n, pasaje: req.body.pasaje, restri: rol, jornal: req.body.jornal, /* */
                                                    usuario_insert: user, usuario: user, data_ot: datos_ot, data: datos, data_rrhh: datos_rrhh
                                                })
                                            }              
                                        })
                                    }             
                                })
                            }
                        })
                    }
                })
            })
        }
    else {//Display errors to user
            var error_msg = ''
            errors.forEach(function(error) { error_msg += error.msg + '<br>' })
            req.flash('error', error_msg)
            
            /*** Using req.body.name * because req.param('name') is deprecated  */ 
            req.getConnection(function(error, conn) {
                conn.query('UPDATE mano_obra SET ? WHERE id = ' + req.params.id, mano_plan, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err)
                        
                        // render to views/gastos/add.ejs
                        res.render('mano/editar', {
                            title: 'Editar Plan Laboral', id: req.params.id, fecha: mano_plan.fecha, codigo: mano_plan.codigo, empleado: mano_plan.empleado, cliente_plan_m: mano_plan.cliente_plan_m,
                            cliente_real_m: mano_plan.cliente_real_m, cliente_plan_t: mano_plan.cliente_plan_t, cliente_real_t: mano_plan.cliente_real_t, cliente_real_n: mano_plan.cliente_real_n,
                            obra_plan_m: mano_plan.obra_plan_m, obra_real_m: mano_plan.obra_real_m, obra_plan_t: mano_plan.obra_plan_t, obra_real_t: mano_plan.obra_real_t,
                            obra_real_n: mano_plan.obra_real_n, encargado: mano_plan.encargado, trato_cliente: mano_plan.trato_cliente, encargado2: req.body.encargado2, trato_cliente2: req.body.trato_cliente2,
                            h_entrada: mano_plan.h_entrada, h_salida: mano_plan.h_salida, monto: mano_plan.monto, subtotal: mano_plan.subtotal, hora_50: mano_plan.hora_50, hora_100: mano_plan.hora_100,
                            hora_normal: mano_plan.hora_normal, hora_neg: mano_plan.hora_neg, ot_plan_m: mano_plan.ot_plan_m, ot_real_m: mano_plan.ot_real_m, ot_plan_t: mano_plan.ot_plan_t,
                            ot_real_t: mano_plan.ot_real_t,ot_real_n: mano_plan.ot_real_n,hora_normal: mano_plan.hora_normal,hora_50: mano_plan.hora_50,hora_100: mano_plan.hora_100,
                            hora_neg: mano_plan.hora_neg,pasaje: mano_plan.pasaje,restri: rol,
                            //jornal: mano_plan.jornal,
                            usuario: user
                        })
                    } else {                
                        req.flash('success', 'Datos actualizados correctamente!')

                        //traemos las planificaciones para mostrar en la tablita frente
                        datos = [];//datos de planificacion
                        datos_ot = [];
                        conn.query('SELECT * FROM ot order by id desc',function(err, rows) {
                            if (err) {console.log(err);}
                            else{
                                rows.forEach(function(row) {    
                                    datos_ot.push(row);
                                });
                                //console.log(datos_ot);//debug de datos de MANO OBRA
            
                                conn.query('SELECT * FROM mano_obra order by fecha desc',function(err, rows) {
                                    if (err) {console.log(err);}
                                    else{
                                        rows.forEach(function(row) {    
                                            datos.push(row);
                                        });
                                        //console.log(datos);//debug de datos de MANO OBRA
                                        //traemos los personales para mostrar en el modal
                                        datos_rrhh = [];
                                        conn.query('SELECT * FROM empleados ORDER BY codigo DESC',function(err, rows) {
                                            if (err) {console.log(err);}
                                            else{
                                                rows.forEach(function(row) {    
                                                    datos_rrhh.push(row);
                                                });
                                                //console.log(datos_rrhh);//debug de datos de RRHH
                                                //dibujamos la tabla con los datos que consultamos
                                                res.render('mano/editar', {
                                                    title: 'Editar Plan Laboral',
                                                    id: req.params.id,
                                                    fecha: req.body.fecha,
                                                    codigo: req.body.codigo,
                                                    empleado: req.body.empleado,
                                                    cliente_plan_m: req.body.cliente_plan_m,
                                                    cliente_real_m: req.body.cliente_real_m,
                                                    cliente_plan_t: req.body.cliente_plan_t,
                                                    cliente_real_t: req.body.cliente_real_t,
                                                    cliente_real_n: req.body.cliente_real_n,
                                                    obra_plan_m: req.body.obra_plan_m,
                                                    obra_real_m: req.body.obra_real_m,
                                                    obra_plan_t: req.body.obra_plan_t,
                                                    obra_real_t: req.body.obra_real_t,
                                                    obra_real_n: req.body.obra_real_n,
                                                    encargado: req.body.encargado,
                                                    trato_cliente: req.body.trato_cliente,
                                                    encargado2: req.body.encargado2,
                                                    trato_cliente2: req.body.trato_cliente2,
                                                    h_entrada: req.body.h_entrada,
                                                    h_salida: req.body.h_salida,
                                                    monto: req.body.monto,
                                                    subtotal: req.body.subtotal,
                                                    hora_50: req.body.hora_50,
                                                    hora_100: req.body.hora_100,
                                                    hora_normal: req.body.hora_normal,
                                                    hora_neg: req.body.hora_neg,
                                                    ot_plan_m: req.body.ot_plan_m,
                                                    ot_real_m: req.body.ot_real_m,
                                                    ot_plan_t: req.body.ot_plan_t,
                                                    ot_real_t: req.body.ot_real_t,
                                                    ot_real_n: req.body.ot_real_n,
                                                    pasaje: req.body.pasaje,
                                                    restri: rol,
                                                    //jornal: req.body.jornal,
                                                    usuario_insert: user, usuario: user, data_ot: datos_ot, data: datos, data_rrhh: datos_rrhh
                                                })
                                            }              
                                        })
                                    }             
                                })
                            }
                        })
                    }
                })
            })
        }
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

app.get('/editar_real/:id', function(req, res, next){
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){ 
        req.getConnection(function(error, conn) {
            conn.query('SELECT * FROM mano_obra WHERE id = ' + req.params.id, function(err, rows, fields) {
                if(err) throw err
                
                //Si no se encuentra la planificacion laboral
                if (rows.length <= 0) {
                    req.flash('error', 'PLAN LABORAL con id = ' + req.params.id + ' no encontrado')
                    res.redirect('/mano')
                }
                else { // Si existe el plan
                    //traemos los valores que preguntamos
                    req.getConnection(function(error, conn) {
                        //traemos las OTs para mostrar en la ventana modal
                        datos_ot = [];
                        conn.query('SELECT * FROM ot ORDER BY ot_nro DESC',function(err, rows1) {
                            if (err) { console.log(err);}
                            else{
                                rows1.forEach(function(row) {    
                                    datos_ot.push(row);
                                });
                                //console.log(datos);//debug de datos de OT
                                //traemos los personales para mostrar en el modal
                                datos_rrhh = [];
                                conn.query('SELECT * FROM empleados ORDER BY codigo DESC',function(err, rows2) {
                                    if (err) { console.log(err); }
                                    else{
                                        rows2.forEach(function(row) {    
                                            datos_rrhh.push(row);
                                        });
                                        //console.log(datos_rrhh);//debug de datos de RRHH
                                        //dibujamos la tabla con los datos que consultamos
                                        var date1 = new Date(formatear_fecha_yyyymmdd(rows[0].fecha));//traemos la fecha de carga de la planificacion.
                                        var date2 = new Date(hoy());//de hoy
                                        date1.setDate(date1.getDate() + 1);//sumamos 1 siempre a las fechas cuando se declara new date
                                        date2.setDate(date2.getDate() + 1);//sumamos 1 siempre a las fechas cuando se declara new date
                                        //antes de pasar la info, tenemos que ver que usuario/rol y que fecha es para restringir
                                        

                                        //REGLAS
                                        //REAL DE AYER PUEDE EDITARSE TODO MENOS FECHA (rol: 1)
                                        //REAL DE ANTEAYER PARA ATRAS NO  PUEDE EDITARSE TODO (rol: 2)
                                        //ROL = 0 es usuario sin restriccion
                                        //console.log('usuario: '+ user +' /rol: ' + rol);//debug
                                        //ceramos el rol porque puede usarse entre sesiones> 
                                        rol=0
                                        if(user == "cibanez" || user == "prueba")//[cambiar a asignar para probar la logica]
                                        {   //vemos cuantos dias pasaron para ver la restriccion
                                            //var dias_dif = Math.ceil(Math.abs(date2.getTime() - date1.getTime())/ (1000 * 3600 * 24)); 
                                            var dias_dif = Math.ceil((date1.getTime()- date2.getTime())/ (1000 * 3600 * 24)); 
                                            if(dias_dif < -1)//para el caso de lo real mas anteayer para atr[as ya no se puede modificar nada
                                            {rol = 2;}
                                            if(dias_dif == -1)//para el caso de real, si es la planificacion de ayer, se puede modificar todo menos la fecha
                                            {rol = 1;}
                                        }
                                        /*if(user == "cibanez")
                                        { rol=0}*/
                                        
                                        res.render('mano/editar_real', {
                                            title: 'Editar Plan Laboral', 
                                            //data: rows[0],
                                            id: rows[0].id,
                                            fecha: formatear_fecha_yyyymmdd(date1),
                                            codigo: rows[0].codigo,
                                            empleado: rows[0].empleado,
                                            cliente_plan_m: rows[0].cliente_plan_m,
                                            cliente_real_m: rows[0].cliente_real_m,
                                            cliente_plan_t: rows[0].cliente_plan_t,
                                            cliente_real_t: rows[0].cliente_real_t,
                                            cliente_real_n: rows[0].cliente_real_n,//cliente real nocturno
                                            obra_plan_m: rows[0].obra_plan_m,
                                            obra_real_m: rows[0].obra_real_m,
                                            obra_plan_t: rows[0].obra_plan_t,
                                            obra_real_t: rows[0].obra_real_t,
                                            obra_real_n: rows[0].obra_real_n,//obra real nocturno
                                            encargado: rows[0].encargado,
                                            trato_cliente: rows[0].trato_cliente,
                                            h_entrada: rows[0].h_entrada,
                                            h_salida: rows[0].h_salida,
                                            monto: rows[0].monto,
                                            subtotal: rows[0].subtotal,
                                            hora_50: rows[0].hora_50,
                                            hora_100: rows[0].hora_100,
                                            hora_normal: rows[0].hora_normal,
                                            hora_neg: rows[0].hora_neg,
                                            ot_plan_m: rows[0].ot_plan_m,
                                            ot_real_m: rows[0].ot_real_m,
                                            ot_plan_t: rows[0].ot_plan_t,
                                            ot_real_t: rows[0].ot_real_t,
                                            ot_real_n: rows[0].ot_real_n,//OT real nocturn, no existe plainficado
                                            hora_normal: rows[0].hora_normal,
                                            hora_50: rows[0].hora_50,
                                            hora_100: rows[0].hora_100,
                                            hora_neg: rows[0].hora_neg,
                                            pasaje: rows[0].pasaje,
                                            jornal: rows[0].jornal,
                                            encargado2: rows[0].encargado2,
                                            trato_cliente2: rows[0].trato_cliente2,
                                            encargado_real: rows[0].encargado_real,//encargado real manhana
                                            trato_cliente_real: rows[0].trato_cliente_real,//encargado real manhana
                                            encargado_real2: rows[0].encargado_real2,//encargado real tarde
                                            trato_cliente_real2: rows[0].trato_cliente_real2,//encargado real tarde
                                            restri: rol,
                                            data_ot: datos_ot,//datos de ot
                                            data_rrhh:datos_rrhh, //datos de rrhh
                                            usuario: user
                                        })
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

app.post('/editar_real/:id', function(req, res, next) {
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
        
        if( !errors ) {//sin errores

        //calculo de dia trabajado, monto y subtotal
        var otrm = Number(req.sanitize('ot_real_m').trim());
        var otrt = Number(req.sanitize('ot_real_t').trim());
        var jornito = Number(req.sanitize('jornal').trim());
        var val_dia = 0;
        if(otrm >0 && otrm < 999900) //si existe ot real mannhana  y es menor a 999900 (no son OTs administativas)
        {   val_dia = 0.5;}
        if(otrt >0 && otrt < 999900) //si existe ot real tarde  y es menor a 999900 (no son OTs administativas)
        {   val_dia = val_dia + 0.5;}

        //CALCULAMOS MONTO EN BASE AL JORNAL
        var montito = jornito * 8;;
        //if(otrm >0 && otrm < 999900) //si existe ot real mannhana  y es menor a 999900 (no son OTs administativas)
        //{   montito = jornito * 8;}

        //CALCULAMOS SUBTOTAL EN BASE AL MONTO X DIA LABURADO (0.5+ 0.5 en el maximo valor de los casos)
        var subtotito  = montito * val_dia;
        
        //CALCULAMOS EL PLUS
        var hnormal= Number(req.sanitize('hora_normal').trim());
        
        var h50= Number(req.sanitize('hora_50').toString().replace(",",".").trim());
        var h100= Number(req.sanitize('hora_100').toString().replace(",",".").trim());
        var hneg= Number(req.sanitize('hora_neg').toString().replace(",",".").trim());

        //revisar el calculo del plus
        var plusito = ((jornito*hnormal) + (jornito*h50) + (jornito*h100) - (jornito*hneg));
        //var plusito = ((jornito*hnormal) + (jornito*h50*(1.5)) + (jornito*h100*(2)) - (jornito*hneg*(2)));
        //VEMOS EL PASAJE
        var paje= Number(req.sanitize('pasaje').trim());

        //estas variables utilizamos para actulizar los mayores a la fecha actual de update
        var fecha_futuro = formatear_fecha_yyyymmdd(req.sanitize('fecha').trim())
        var cod_futuro = req.sanitize('codigo').trim()
        
        
        //objeto para actualizar campos
        var mano_plan = {
                fecha: formatear_fecha_yyyymmdd(req.sanitize('fecha').trim()),//fecha se mantiene nomas ya
                codigo: req.sanitize('codigo').trim(),
                empleado: req.sanitize('empleado').trim(),
                cliente_plan_m: req.sanitize('cliente_plan_m').trim(),
                cliente_real_m: req.sanitize('cliente_real_m').trim(),
                cliente_plan_t: req.sanitize('cliente_plan_t').trim(),
                cliente_real_t: req.sanitize('cliente_real_t').trim(),
                cliente_real_n: req.sanitize('cliente_real_n').trim(),
                obra_plan_m: req.sanitize('obra_plan_m').trim(),
                obra_real_m: req.sanitize('obra_real_m').trim(),
                obra_plan_t: req.sanitize('obra_plan_t').trim(),
                obra_real_t: req.sanitize('obra_real_t').trim(),
                obra_real_n: req.sanitize('obra_real_n').trim(),
                encargado: req.sanitize('encargado').trim(),
                trato_cliente: req.sanitize('trato_cliente').trim(),
                encargado2: req.sanitize('encargado2').trim(),
                trato_cliente2: req.sanitize('trato_cliente2').trim(),
                encargado_real: req.sanitize('encargado_real').trim(),//real manhana
                trato_cliente_real: req.sanitize('trato_cliente_real').trim(),//real manhana
                encargado_real2: req.sanitize('encargado_real2').trim(),//real tarde
                trato_cliente_real2: req.sanitize('trato_cliente_real2').trim(),//real tarde
                h_entrada: req.sanitize('h_entrada').trim(),
                h_salida: req.sanitize('h_salida').trim(),
                ot_plan_m: req.sanitize('ot_plan_m').trim(),
                ot_real_m: req.sanitize('ot_real_m').trim(),
                ot_plan_t: req.sanitize('ot_plan_t').trim(),
                ot_real_t: req.sanitize('ot_real_t').trim(),
                ot_real_n: req.sanitize('ot_real_n').trim(),
                hora_normal: req.sanitize('hora_normal').toString().replace(",",".").trim(),
                hora_50: req.sanitize('hora_50').toString().replace(",",".").trim(),
                hora_100: req.sanitize('hora_100').toString().replace(",",".").trim(),
                hora_neg: req.sanitize('hora_neg').toString().replace(",",".").trim(),
                //jornal: Number(req.sanitize('jornal').trim()), //recibimos del campo oculto. pero NO ACTUALIZAMOS
                usuario_insert: user,

                //VALORES CALCULADOS
                monto: montito, //calculado previamente y actualizamos en la tabla
                subtotal: subtotito, //calculamos previamente y actualizamos en la tabla
                pasaje: paje,//asignamos el pasaje
                plus: plusito,//asignamos el plus
            } 

            //valores de los campos a actualizar para el futuro.
            var mano_futuro = {
                cliente_plan_m: req.sanitize('cliente_plan_m').trim(),
                cliente_real_m: req.sanitize('cliente_real_m').trim(),
                cliente_plan_t: req.sanitize('cliente_plan_t').trim(),
                cliente_real_t: req.sanitize('cliente_real_t').trim(),
                cliente_real_n: req.sanitize('cliente_real_n').trim(),
                obra_plan_m: req.sanitize('obra_plan_m').trim(),
                obra_real_m: req.sanitize('obra_real_m').trim(),
                obra_plan_t: req.sanitize('obra_plan_t').trim(),
                obra_real_t: req.sanitize('obra_real_t').trim(),
                obra_real_n: req.sanitize('obra_real_n').trim(),
                encargado: req.sanitize('encargado').trim(),
                trato_cliente: req.sanitize('trato_cliente').trim(),
                encargado2: req.sanitize('encargado2').trim(),
                trato_cliente2: req.sanitize('trato_cliente2').trim(),
                encargado_real: req.sanitize('encargado_real').trim(),//real manhana
                trato_cliente_real: req.sanitize('trato_cliente_real').trim(),//real manhana
                encargado_real2: req.sanitize('encargado_real2').trim(),//real tarde
                trato_cliente_real2: req.sanitize('trato_cliente_real2').trim(),//real tarde
                ot_plan_m: req.sanitize('ot_plan_m').trim(),
                ot_real_m: req.sanitize('ot_real_m').trim(),
                ot_plan_t: req.sanitize('ot_plan_t').trim(),
                ot_real_t: req.sanitize('ot_real_t').trim(),
                ot_real_n: req.sanitize('ot_real_n').trim(),
                //jornal: Number(req.sanitize('jornal').trim()), //recibimos del campo oculto. pero NO ACTUALIZAMOS
                usuario_insert: user,
            } 


            
            req.getConnection(function(error, conn) {
                conn.query('UPDATE mano_obra SET ? WHERE id = ' + req.params.id, mano_plan, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err)
                        
                        //si hay error
                        res.render('mano/editar_real', {
                            title: 'Editar Plan Laboral',
                            id: req.params.id, fecha: mano_plan.fecha, codigo: mano_plan.codigo, empleado: mano_plan.empleado, cliente_plan_m: mano_plan.cliente_plan_m, cliente_real_m: mano_plan.cliente_real_m,
                            cliente_plan_t: mano_plan.cliente_plan_t, cliente_real_t: mano_plan.cliente_real_t, cliente_real_n: mano_plan.cliente_real_n, obra_plan_m: mano_plan.obra_plan_m,
                            obra_real_m: mano_plan.obra_real_m, obra_plan_t: mano_plan.obra_plan_t, obra_real_t: mano_plan.obra_real_t, obra_real_n: mano_plan.obra_real_n,
                            encargado: mano_plan.encargado, trato_cliente: mano_plan.trato_cliente, encargado2: req.body.encargado2, trato_cliente2: req.body.trato_cliente2, h_entrada: mano_plan.h_entrada,
                            h_salida: mano_plan.h_salida, monto: mano_plan.monto, subtotal: mano_plan.subtotal, ot_plan_m: mano_plan.ot_plan_m, ot_real_m: mano_plan.ot_real_m,
                            ot_plan_t: mano_plan.ot_plan_t, ot_real_t: mano_plan.ot_real_t, ot_real_n: mano_plan.ot_real_n, hora_normal: mano_plan.hora_normal, hora_50: mano_plan.hora_50,
                            hora_100: mano_plan.hora_100, hora_neg: mano_plan.hora_neg, pasaje: mano_plan.pasaje,
                            //jornal: mano_plan.jornal, //no mostramos en esta pagina
                            //plus: mano_plan.plus, //no mostramos en esta pagina
                            usuario: user
                        })
                    } else {                
                        req.flash('success', 'Datos actualizados correctamente!')

                        //finalmente no dejamos que actualice los datos a las fechas a futuro, ponemos un update dummy 
                        //actualizamos las fechas del futuro ya cargadas para ese cliente.
                        /*conn.query('UPDATE mano_obra SET ? WHERE fecha > "' + fecha_futuro + '" and codigo ="' + cod_futuro + '"', mano_futuro, function(err, result) {
                            if (err) {
                                req.flash('error', err)
                                
                                //si hay error
                                res.render('mano/editar_real', {
                                    title: 'Editar Plan Laboral',
                                    id: req.params.id, fecha: mano_plan.fecha, codigo: mano_plan.codigo, empleado: mano_plan.empleado, cliente_plan_m: mano_plan.cliente_plan_m, cliente_real_m: mano_plan.cliente_real_m,
                                    cliente_plan_t: mano_plan.cliente_plan_t, cliente_real_t: mano_plan.cliente_real_t, cliente_real_n: mano_plan.cliente_real_n, obra_plan_m: mano_plan.obra_plan_m,
                                    obra_real_m: mano_plan.obra_real_m, obra_plan_t: mano_plan.obra_plan_t, obra_real_t: mano_plan.obra_real_t, obra_real_n: mano_plan.obra_real_n,
                                    encargado: mano_plan.encargado, trato_cliente: mano_plan.trato_cliente, encargado2: req.body.encargado2, trato_cliente2: req.body.trato_cliente2, h_entrada: mano_plan.h_entrada,
                                    h_salida: mano_plan.h_salida, monto: mano_plan.monto, subtotal: mano_plan.subtotal, ot_plan_m: mano_plan.ot_plan_m, ot_real_m: mano_plan.ot_real_m,
                                    ot_plan_t: mano_plan.ot_plan_t, ot_real_t: mano_plan.ot_real_t, ot_real_n: mano_plan.ot_real_n, hora_normal: mano_plan.hora_normal, hora_50: mano_plan.hora_50,
                                    hora_100: mano_plan.hora_100, hora_neg: mano_plan.hora_neg, pasaje: mano_plan.pasaje,
                                    usuario: user
                                })
                            } else {*/

                                //traemos las planificaciones para mostrar en la tablita frente
                                datos = [];//datos de planificacion
                                datos_ot = [];
                                conn.query('SELECT * FROM mano_obra WHERE id = ' + req.params.id, function(err, rows) {
                                    if (err) {console.log(err);}
                                    else{
                                        rows.forEach(function(row) {    
                                            datos_ot.push(row);
                                        });
                                        //console.log(datos_ot);//debug de datos de MANO OBRA
                                        conn.query('SELECT * FROM mano_obra order by fecha desc',function(err, rows) {
                                            if (err) {console.log(err);}
                                            else{
                                                rows.forEach(function(row) {    
                                                    datos.push(row);
                                                });
                                                //console.log(datos);//debug de datos de MANO OBRA
                                                //traemos los personales para mostrar en el modal
                                                datos_rrhh = [];
                                                conn.query('SELECT * FROM empleados ORDER BY codigo DESC',function(err, rows) {
                                                    if (err) {console.log(err);}
                                                    else{
                                                        rows.forEach(function(row) {    
                                                            datos_rrhh.push(row);
                                                        });
                                                        //console.log(datos_rrhh);//debug de datos de RRHH
                                                        //dibujamos la tabla con los datos que consultamos
                                                        var date1 = new Date(formatear_fecha_yyyymmdd(req.body.fecha));//traemos la fecha de carga de la planificacion.
                                                        var date2 = new Date(hoy());//de hoy
                                                        date1.setDate(date1.getDate() + 1);//sumamos 1 siempre a las fechas cuando se declara new date
                                                        date2.setDate(date2.getDate() + 1);//sumamos 1 siempre a las fechas cuando se declara new date
                                                        //antes de pasar la info, tenemos que ver que usuario/rol y que fecha es para restringir
                                                        

                                                        //REGLAS
                                                        //REAL DE AYER PUEDE EDITARSE TODO MENOS FECHA (rol: 1)
                                                        //REAL DE ANTEAYER PARA ATRAS NO  PUEDE EDITARSE TODO (rol: 2)
                                                        //ROL = 0 es usuario sin restriccion
                                                        rol=0;
                                                        if(user == "cibanez" || user == "prueba")//[cambiar a asignar para probar la logica]
                                                        {   //vemos cuantos dias pasaron para ver la restriccion
                                                            //var dias_dif = Math.ceil(Math.abs(date2.getTime() - date1.getTime())/ (1000 * 3600 * 24)); 
                                                            var dias_dif = Math.ceil((date1.getTime()- date2.getTime())/ (1000 * 3600 * 24)); 
                                                            if(dias_dif < -1)//para el caso de lo real mas anteayer para atr[as ya no se puede modificar nada
                                                            {rol = 2;}
                                                            if(dias_dif == -1)//para el caso de real, si es la planificacion de ayer, se puede modificar todo menos la fecha
                                                            {rol = 1;}
                                                        }
                                                        /*if(user == "cibanez")
                                                        { rol=0}*/

                                                        res.render('mano/editar_real', {
                                                            title: 'Editar Plan Laboral',
                                                            id: req.params.id,
                                                            fecha: req.body.fecha,
                                                            codigo: req.body.codigo,
                                                            empleado: req.body.empleado,
                                                            cliente_plan_m: req.body.cliente_plan_m,
                                                            cliente_real_m: req.body.cliente_real_m,
                                                            cliente_plan_t: req.body.cliente_plan_t,
                                                            cliente_real_t: req.body.cliente_real_t,
                                                            cliente_real_n: req.body.cliente_real_n,
                                                            obra_plan_m: req.body.obra_plan_m,
                                                            obra_real_m: req.body.obra_real_m,
                                                            obra_plan_t: req.body.obra_plan_t,
                                                            obra_real_t: req.body.obra_real_t,
                                                            obra_real_n: req.body.obra_real_n,
                                                            encargado: req.body.encargado,
                                                            trato_cliente: req.body.trato_cliente,
                                                            encargado2: req.body.encargado2,
                                                            trato_cliente2: req.body.trato_cliente2,
                                                            encargado_real: req.body.encargado_real,
                                                            trato_cliente_real: req.body.trato_cliente_real,
                                                            encargado_real2: req.body.encargadr_real2,
                                                            trato_cliente_real2: req.body.trato_cliente_real2,
                                                            h_entrada: req.body.h_entrada,
                                                            h_salida: req.body.h_salida,
                                                            monto: req.body.monto,
                                                            subtotal: req.body.subtotal,
                                                            hora_50: req.body.hora_50,
                                                            hora_100: req.body.hora_100,
                                                            hora_normal: req.body.hora_normal,
                                                            hora_neg: req.body.hora_neg,
                                                            ot_plan_m: req.body.ot_plan_m,
                                                            ot_real_m: req.body.ot_real_m,
                                                            ot_plan_t: req.body.ot_plan_t,
                                                            ot_real_t: req.body.ot_real_t,
                                                            ot_real_n: req.body.ot_real_n,
                                                            pasaje: req.body.pasaje,
                                                            restri: rol,
                                                            jornal: req.body.jornal,
                                                            usuario_insert: user, usuario: user, data_ot: datos_ot, data: datos, data_rrhh: datos_rrhh
                                                        })
                                                    }              
                                                })
                                            }             
                                        })
                                    }
                                })
                            /*}
                        })*/
                    }
                })
            })
        }
    }else {//SI NO ESTA LOGADO CHAU
        res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

/* GENERACION EXCEL */
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
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
});

// DELETE USER
app.get('/eliminar/(:id)', function(req, res, next) {

    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
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
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

app.get('/copiar_plan', function(req, res, next) {

    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
        //insertamos el valor 
        req.getConnection(function(error, conn) {
            /*var sql_str = "insert into mano_obra (fecha, mano_obra. empleado, codigo, cliente_plan_m, cliente_real_m, cliente_plan_t, cliente_real_t,obra_plan_m,obra_real_m,obra_plan_t,obra_real_t, " +
                "encargado, trato_cliente, h_entrada,h_salida,monto,subtotal,hora_50,hora_100,hora_normal,hora_neg,pasaje, usuario_insert, ot_plan_m,ot_real_m,ot_plan_t, ot_real_t, " + 
                "jornal, cliente_real_n, obra_real_n, ot_real_n, encargado2, trato_cliente2) " + 
                "select DATE_ADD(fecha, INTERVAL 1 DAY), mano_obra. empleado, codigo, cliente_plan_m, cliente_real_m, cliente_plan_t, cliente_real_t,obra_plan_m,obra_real_m,obra_plan_t,obra_real_t, " + 
                "encargado, trato_cliente, h_entrada,h_salida,monto,subtotal,hora_50,hora_100,hora_normal,hora_neg,pasaje, 'SYSTEM', ot_plan_m,ot_real_m,ot_plan_t, ot_real_t , " + 
                "jornal, cliente_real_n, obra_real_n, ot_real_n, encargado2, trato_cliente2 " + 
                "from mano_obra where fecha = (select max(fecha) from mano_obra)";*/

            /* FALTABA AGREGAR LOS ENCARGADOS Y LOS VALORES DE HORARIOS y HS EXTRAS */
            var sql_str = "insert into mano_obra (fecha, mano_obra.empleado, codigo, cliente_plan_m, cliente_real_m, cliente_plan_t,cliente_real_t,obra_plan_m,obra_real_m,obra_plan_t,obra_real_t, " +
                "encargado, trato_cliente, h_entrada,h_salida,monto,subtotal, plus,hora_50,hora_100,hora_normal,hora_neg,pasaje, usuario_insert, ot_plan_m,ot_real_m, ot_plan_t, ot_real_t , " +
                "jornal, cliente_real_n, obra_real_n, ot_real_n, encargado2, trato_cliente2, encargado_real, trato_cliente_real, encargado_real2, trato_cliente_real2) " +
                "select DATE_ADD(mo.fecha, INTERVAL 1 DAY), mo.empleado, mo.codigo, mo.cliente_plan_m, mo.cliente_plan_m, mo.cliente_plan_t, mo.cliente_plan_t, mo.obra_plan_m, mo.obra_plan_m, mo.obra_plan_t, mo.obra_plan_t, " +
                "mo.encargado, mo.trato_cliente, '07:30', '16:30', (case when IFNULL(em.jornal, 0) >0 then IFNULL(em.jornal, 0)*8 else 0 end) as monto, " +
                "((case when cast(mo.ot_plan_m as UNSIGNED) < 900000 and cast(mo.ot_plan_m as UNSIGNED) > 0 then 0.5 else 0 end)+ " +
                "(case when cast(mo.ot_plan_t as UNSIGNED) < 900000 and cast(mo.ot_plan_t as UNSIGNED) > 0 then 0.5 else 0 end))*(case when IFNULL(em.jornal, 0) >0 then IFNULL(em.jornal, 0)*8 else 0 end) as subtotal, " +
                "0, 0, 0, 0, 0, 0, 'SYSTEM', mo.ot_plan_m, mo.ot_plan_m, mo.ot_plan_t, mo.ot_plan_t, IFNULL(em.jornal, 0) as jornal, mo.cliente_real_n, mo.obra_real_n, mo.ot_real_n, " +
                "mo.encargado2, mo.trato_cliente2, mo.encargado, mo.trato_cliente, mo.encargado2, mo.trato_cliente2 " +
                "from mano_obra mo inner join empleados em on em.codigo = mo.codigo where mo.fecha = (select max(fecha) from mano_obra) and em.estado = 'ACTIVO' ";
                //solamente copiamos e insertamos aquellos empleados que esten en estado activo.

            conn.query(sql_str, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    //redireccionar al listado de ingresos
                    res.redirect('/mano')
                } else {
                    req.flash('success', 'PLANIFICACION LABORAL COPIADA EXITOSAMENTE');
                    //redireccionar al listado de ingresos
                    res.redirect('/mano');

                    //insertar log de uso de sistema en caso de suceso de insercion
                }
            })
        })
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

module.exports = app;
