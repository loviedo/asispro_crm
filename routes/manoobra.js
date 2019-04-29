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

function generar_excel_mano_obra(rows){
    var workbook = new excel.Workbook();
    //Add Worksheets to the workbook
    var worksheet = workbook.addWorksheet('MANO OBRA');
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
    worksheet.cell(1,3).string('CLIENTE MAÑANA').style(style);
    worksheet.cell(1,4).string('%').style(style);
    worksheet.cell(1,5).string('CLIENTE TARDE').style(style);
    worksheet.cell(1,6).string('%').style(style);
    worksheet.cell(1,7).string('DIA').style(style);
    worksheet.cell(1,8).string('MONTO').style(style);
    worksheet.cell(1,9).string('SUBTOTAL').style(style);
    worksheet.cell(1,10).string('PLUS').style(style);
    worksheet.cell(1,11).string('HS 50%').style(style);
    worksheet.cell(1,12).string('HS 100%').style(style);
    worksheet.cell(1,13).string('HS NORMAL').style(style);
    worksheet.cell(1,14).string('HS NEGATIVAS').style(style);
    worksheet.cell(1,15).string('PASAJE / OTROS').style(style);
    worksheet.cell(1,16).string('JORNAL').style(style);


    //luego los datos
    var i = 1;
    rows.forEach(function(row) {
        worksheet.cell(i+1,1).date(formatear_fecha_yyyymmdd(row.fecha)).style({dateFormat: 'dd/mm/yyyy'});//ver formato fecha
        worksheet.cell(i+1,2).string(String(row.empleado)).style(style);
        worksheet.cell(i+1,3).string(String(row.cliente_real_m)).style(style);
        worksheet.cell(i+1,4).number(Number(row.por_m.toString().replace(",","."))).style(style);
        worksheet.cell(i+1,5).string(String(row.cliente_real_t)).style(style);
        worksheet.cell(i+1,6).number(Number(row.por_t.toString().replace(",","."))).style(style);
        worksheet.cell(i+1,7).number(Number(row.dia.toString().replace(",","."))).style(style);
        worksheet.cell(i+1,8).number(Number(row.monto.toString().replace(",","."))).style(style);
        worksheet.cell(i+1,9).number(Number(row.subtotal.toString().replace(",","."))).style(style);
        worksheet.cell(i+1,10).number(Number(row.plus.toString().replace(",","."))).style(style);
        worksheet.cell(i+1,11).number(Number(row.hora_50.toString().replace(",","."))).style(style);
        worksheet.cell(i+1,12).number(Number(row.hora_100.toString().replace(",","."))).style(style);
        worksheet.cell(i+1,13).number(Number(row.hora_normal.toString().replace(",","."))).style(style);
        worksheet.cell(i+1,14).number(Number(row.hora_neg.toString().replace(",","."))).style(style);
        worksheet.cell(i+1,15).number(Number(row.pasaje.toString().replace(",","."))).style(style);
        worksheet.cell(i+1,16).number(Number(row.jornal.toString().replace(",","."))).style(style);

        //worksheet.cell(i+1,2).string(String(row.)).style(style);//debug
        i=i+1;
        //console.log(row.descripcion);//debug
    });
    workbook.write('Listado_MANOOBRA.xlsx');
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
                        conn.query('select id,fecha, empleado, case when cast(ot_real_m as unsigned) >= 900000 then 0 else 0.5 end as por_m, IFNULL(cliente_real_m, 0) as cliente_real_m, ' +
                        'cliente_real_t, case when cast(ot_real_t as unsigned) >= 900000 then 0 else 0.5 end as por_t, ' +
                        'IFNULL(monto, 0) as monto, IFNULL(subtotal, 0) as subtotal, IFNULL(plus, 0) as plus, ((case when cast(ot_real_m as unsigned) >= 900000 then 0 else 0.5 end)+(case when cast(ot_real_t as unsigned) >= 900000 then 0 else 0.5 end)) as dia, ' +
                        'IFNULL(hora_50, 0) as hora_50, IFNULL(hora_100, 0) as hora_100, IFNULL(hora_normal, 0) as hora_normal, IFNULL(hora_neg, 0) as hora_neg, IFNULL(pasaje, 0) as pasaje, IFNULL(jornal, 0) as jornal from mano_obra order by fecha desc',function(err, rows) {
                            //if(err) throw err
                            if (err) {
                                req.flash('error', err)
                                res.render('manoobra/listar', {title: 'Listado de Trabajos', data: '',usuario: user})
                            } else {
                                generar_excel_mano_obra(rows);//generamos excel PLAN LABORAL / MANO OBRA
                                res.render('manoobra/listar', {title: 'Listado de Trabajos', usuario: user, data: rows})
                            }
                        })
                    })
                }
            })
        })
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

app.get('/editar/:id', function(req, res, next){
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){ 
        req.getConnection(function(error, conn) {
            conn.query('select id,fecha, empleado, ot_real_m, case when cast(ot_real_m as unsigned) >= 900000 then 0 else 0.5 end as por_m, cliente_real_m, ' +
            'cliente_real_t, case when cast(ot_real_t as unsigned) >= 900000 then 0 else 0.5 end as por_t, ' +
            'monto, subtotal, IFNULL(plus, 0) as plus, ((case when cast(ot_real_m as unsigned) >= 900000 then 0 else 0.5 end)+(case when cast(ot_real_t as unsigned) >= 900000 then 0 else 0.5 end)) as dia, ' +
            'hora_50, hora_100, hora_normal, hora_neg, pasaje, jornal from mano_obra WHERE id = ' + req.params.id, function(err, rows, fields) {
                if(err) throw err
                
                //Si no se encuentra la planificacion laboral
                if (rows.length <= 0) {
                    req.flash('error', 'PLAN LABORAL con id = ' + req.params.id + ' no encontrado')
                    res.redirect('/manoobra')
                }
                else { // Si existe el plan
                    //traemos los valores que preguntamos
                    res.render('manoobra/editar', {
                        title: 'Editar Plan Laboral', 
                        //data: rows[0],
                        id: rows[0].id,
                        fecha: formatear_fecha_yyyymmdd(rows[0].fecha),//recibimos de 
                        //codigo: rows[0].codigo,
                        empleado: rows[0].empleado,
                        cliente_real_m: rows[0].cliente_real_m,
                        cliente_real_t: rows[0].cliente_real_t,
                        por_m: rows[0].por_m,
                        por_t: rows[0].por_t,
                        dia: rows[0].dia,
                        monto: rows[0].monto,
                        plus: rows[0].plus,
                        subtotal: rows[0].subtotal,
                        hora_50: rows[0].hora_50,
                        hora_100: rows[0].hora_100,
                        hora_neg: rows[0].hora_neg,
                        hora_normal: rows[0].hora_normal,
                        pasaje: rows[0].pasaje,
                        jornal: rows[0].jornal,
                        usuario: user
                    })
                }            
            })
        })
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
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
        
        if( !errors ) {//sin errores
        var mano = {
                fecha: formatear_fecha_yyyymmdd(req.sanitize('fecha').trim()),//fecha se mantiene nomas ya
                //codigo: req.sanitize('codigo').trim(),
                empleado: req.sanitize('empleado').trim(),
                cliente_real_m: req.sanitize('cliente_real_m').trim(),
                cliente_real_t: req.sanitize('cliente_real_t').trim(),
                monto: Number(req.sanitize('monto').trim()),
                plus: Number(req.sanitize('plus').trim()),
                subtotal: Number(req.sanitize('subtotal').trim()),
                hora_50: req.sanitize('hora_50').trim(),
                hora_100: req.sanitize('hora_100').trim(),
                hora_normal: req.sanitize('hora_normal').trim(),
                hora_neg: req.sanitize('hora_neg').trim(),
                pasaje: Number(req.sanitize('pasaje').trim()),
                jornal: Number(req.sanitize('jornal').trim()),
                usuario_insert: user
            } 
            
            req.getConnection(function(error, conn) {
                conn.query('UPDATE mano_obra SET ? WHERE id = ' + req.params.id, mano, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err)
                        
                        //si hay error
                        res.render('manoobra/editar', {
                            title: 'Editar Mano de Obra',
                            id: req.params.id,
                            fecha: mano.fecha,
                            empleado: mano.empleado,
                            cliente_real_m: mano.cliente_real_m,
                            cliente_real_t: mano.cliente_real_t,
                            monto: mano.monto,
                            plus: mano.plus,
                            subtotal: mano.subtotal,
                            hora_50: mano.hora_50,
                            hora_100: mano.hora_100,
                            hora_normal: mano.hora_normal,
                            hora_neg: mano.hora_neg,
                            pasaje: mano.pasaje,
                            jornal: mano.jornal,
                            usuario: user
                        })
                    } else {                
                        req.flash('success', 'Datos actualizados correctamente!')

                        //traemos las planificaciones para mostrar en la tablita frente
                        res.render('manoobra/editar', {
                            title: 'Editar Mano de Obra',
                            id: req.params.id,
                            fecha: req.body.fecha,
                            empleado: req.body.empleado,
                            cliente_real_m: req.body.cliente_real_m,
                            cliente_real_t: req.body.cliente_real_t,
                            por_m: req.body.por_m,
                            por_t: req.body.por_t,
                            dia: req.body.dia,
                            monto: req.body.monto,
                            plus: req.body.plus,
                            subtotal: req.body.subtotal,
                            hora_50: req.body.hora_50,
                            hora_100: req.body.hora_100,
                            hora_normal: req.body.hora_normal,
                            hora_neg: req.body.hora_neg,
                            pasaje: req.body.pasaje,
                            jornal: req.body.jornal,
                            usuario_insert: user, usuario: user})
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
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
        //vemos los datos en la base
        //DESCARGAR PDF CON DATOS DEL ESTUDIO
        var file = path.resolve("Listado_MANOOBRA.xlsx");
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