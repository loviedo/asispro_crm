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
    worksheet.cell(1,1).string('FECHA').style(style);
    worksheet.cell(1,2).string('EMPLEADO').style(style);
    worksheet.cell(1,3).string('CLIENTE PLAN MAÑANA').style(bgStyle);
    worksheet.cell(1,4).string('OBRA PLAN MAÑANA').style(bgStyle);
    worksheet.cell(1,5).string('ENCARGADO').style(bgStyle);
    worksheet.cell(1,6).string('TRATO CLIENTE').style(bgStyle);
    worksheet.cell(1,7).string('CLIENTE PLAN TARDE').style(style);
    worksheet.cell(1,8).string('OBRA PLAN TARDE').style(style);
    worksheet.cell(1,9).string('ENCARGADO').style(style);
    worksheet.cell(1,10).string('TRATO CLIENTE').style(style);

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
        worksheet.cell(i+1,1).date(formatear_fecha_yyyymmdd(row.fecha)).style({dateFormat: 'dd/mm/yyyy'});//ver formato fecha
        worksheet.cell(i+1,2).string(String(row.empleado)).style(style);
        worksheet.cell(i+1,3).string(String(row.cliente_plan_m)).style(style);
        worksheet.cell(i+1,4).string(String(row.obra_plan_m)).style(style);
        worksheet.cell(i+1,5).string(String(row.encargado)).style(style);
        worksheet.cell(i+1,6).string(String(row.trato_cliente)).style(style);
        worksheet.cell(i+1,7).string(String(row.cliente_plan_t)).style(style);
        worksheet.cell(i+1,8).string(String(row.obra_plan_t)).style(style);
        worksheet.cell(i+1,9).string(String(row.encargado2)).style(style);
        worksheet.cell(i+1,10).string(String(row.trato_cliente2)).style(style);


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
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        //vemos los datos en la base
        req.getConnection(function(error, conn) {
            conn.query('SELECT * FROM mano_obra ORDER BY fecha DESC',function(err, rows1) {
                if (err) {
                    req.flash('error', err)
                    res.render('mano/listar', {title: 'Listado de Trabajos', data: '',usuario: user})
                } else {
                    req.getConnection(function(error, conn) {
                        conn.query('select id,fecha, empleado, ot_real_m, case when cast(ot_real_m as integer) >= 900000 then 0.5 else 0 end as por_m, cliente_real_m, ' +
                        'ot_real_t, case when cast(ot_real_t as integer) >= 900000 then 0.5 else 0 end as por_t, ' +
                        '0 as dia, monto, subtotal, 0 as plus, ((case when cast(ot_real_m as integer) >= 900000 then 0.5 else 0 end)+(case when cast(ot_real_t as integer) >= 900000 then 0.5 else 0 end)) as dia, ' +
                        'monto, subtotal, 0 as plus, hora_50, hora_100, hora_normal, hora_neg, pasaje, jornal from mano_obra order by fecha desc',function(err, rows) {
                            //if(err) throw err
                            if (err) {
                                req.flash('error', err)
                                res.render('manoobra/listar', {title: 'Listado de Trabajos', data: '',usuario: user})
                            } else {
                                generar_excel_plan_laboral(rows1);//generamos excel PLAN LABORAL / MANO OBRA
                                res.render('manoobra/listar', {title: 'Listado de Trabajos', usuario: user, data: rows})
                            }
                        })
                    })
                }
            })
        })
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})



// DELETE USER --CREO QUE NO USAMOS AQUI
app.get('/eliminar/(:id)', function(req, res, next) {

    if(req.session.user)
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

module.exports = app;