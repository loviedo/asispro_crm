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
    worksheet.cell(1,17).string('IMPUTACION').style(style);
    worksheet.cell(1,18).string('IMPUTACION').style(style);
    worksheet.cell(1,19).string('OTs').style(style);


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
        worksheet.cell(i+1,17).string(String(row.obra_real_m)).style(style);
        worksheet.cell(i+1,18).string(String(row.obra_real_t)).style(style);
        worksheet.cell(i+1,19).string(String(row.ot)).style(style);

        //worksheet.cell(i+1,2).string(String(row.)).style(style);//debug
        i=i+1;
        //console.log(row.descripcion);//debug
    });
    
    workbook.write('Listado_MANOOBRA.xlsx');
}

//completar funcion
function generar_excel_emp_liq(rows){
    var workbook = new excel.Workbook();
    var worksheet = workbook.addWorksheet('LIQUIDACIONES');
    //
    const style = workbook.createStyle({
    font: {color: '#000000',size: 12},
    numberFormat: '#,##0.00; (#,##0.00); -'
    });

    //prueba estilo 2
    const style1 = workbook.createStyle({
        font: {color: '#000000',fgColor:'#EF820D',size: 12},
        numberFormat: '#,##0; (#,##0); -'
    });

    const bgStyle = workbook.createStyle({
        fill: {type: 'pattern',patternType: 'solid',
          //bgColor: '#EF820D',
          //fgColor: '#EF820D', //color fondo de la celda.
        }
    });

    //dibujamos el excel
    //primero la cabecera
    worksheet.cell(3,1).string('NRO').style(style);
    worksheet.cell(3,2).string('NOMBRE Y APELLIDO').style(style);
    worksheet.cell(3,3).string('EPP').style(style);
    worksheet.cell(3,4).string('ANTICIPO').style(style);
    worksheet.cell(3,5).string('PRESTAMO').style(style);
    worksheet.cell(3,6).string('IPS').style(style);
    worksheet.cell(3,7).string('SALDO A FAVOR').style(style);
    worksheet.cell(3,8).string('ME DEBE').style(style);
    worksheet.cell(3,9).string('LO QUE DEBO').style(style);
    worksheet.cell(3,10).string('PASAJE').style(style);
    worksheet.cell(3,11).string('MO').style(style);
    worksheet.cell(3,12).string('SALDO A PAGAR').style(style);
    worksheet.cell(3,13).string('OTROS').style(style);
    worksheet.cell(3,14).string('TOTAL A PAGAR').style(style);

    /*SELECT el.codigo, concat(em.nombres,' ',em.apellidos) as nombre , el.mes, el.anho, el. quincena, el.epp, el.anticipo, el.prestamo, el.ips, el.saldo_favor, el.debe, el.debo, 
    el.pasaje, el.manoobra, el.saldo_pagar, el.otros, 
    el.total, el.dias_t, el.h_50_total, el.h_100_total, el.h_neg_total, el.usuario_insert FROM empleados_liq el
    inner join empleados em on el.codigo = em.codigo
    where el.mes = month(current_date()) and el.anho = year(current_date()) order by convert(el.codigo,unsigned integer)*/

    //luego los datos
    var i = 1;
    rows.forEach(function(row) {
        worksheet.cell(i+3,1).string(String(row.codigo)).style(style);//codigo del empleado
        worksheet.cell(i+3,2).string(String(row.nombre)).style(style); //nombre y apellido
        worksheet.cell(i+3,3).string(String(row.epp)).style(style);//equipos de proteccion personal
        worksheet.cell(i+3,4).number(Number(row.anticipo.toString().replace(",","."))).style(style);
        worksheet.cell(i+3,5).string(String(row.prestamo)).style(style);
        worksheet.cell(i+3,6).number(Number(row.ips.toString().replace(",","."))).style(style);
        worksheet.cell(i+3,7).number(Number(row.saldo_favor.toString().replace(",","."))).style(style);
        worksheet.cell(i+3,8).number(Number(row.debe.toString().replace(",","."))).style(style);
        worksheet.cell(i+3,9).number(Number(row.debo.toString().replace(",","."))).style(style);
        worksheet.cell(i+3,10).number(Number(row.pasaje.toString().replace(",","."))).style(style);
        worksheet.cell(i+3,11).number(Number(row.manoobra.toString().replace(",","."))).style(style);
        worksheet.cell(i+3,12).number(Number(row.saldo_pagar.toString().replace(",","."))).style(style);
        worksheet.cell(i+3,13).number(Number(row.otros.toString().replace(",","."))).style(style);
        worksheet.cell(i+3,14).number(Number(row.total.toString().replace(",","."))).style(style);

        //worksheet.cell(i+1,2).string(String(row.)).style(style);//debug
        i=i+1;
        //console.log(row.descripcion);//debug
    });
    
    workbook.write('Listado_LIQUIDACION.xlsx');
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
                        conn.query('select id, fecha, empleado, case when cast(ot_real_m as unsigned) >= 900000 then 0 else 0.5 end as por_m, IFNULL(cliente_real_m, 0) as cliente_real_m, ' +
                        'cliente_real_t, case when cast(ot_real_t as unsigned) >= 900000 then 0 else 0.5 end as por_t, ' +
                        'IFNULL(monto, 0) as monto, IFNULL(subtotal, 0) as subtotal, IFNULL(plus, 0) as plus, ((case when cast(ot_real_m as unsigned) >= 900000 then 0 else 0.5 end)+(case when cast(ot_real_t as unsigned) >= 900000 then 0 else 0.5 end)) as dia, ' +
                        'IFNULL(hora_50, 0) as hora_50, IFNULL(hora_100, 0) as hora_100, IFNULL(hora_normal, 0) as hora_normal, IFNULL(hora_neg, 0) as hora_neg, IFNULL(pasaje, 0) as pasaje, IFNULL(jornal, 0) as jornal, ' +
                        'obra_real_m, obra_real_t, concat(ot_real_m,"/",ot_real_t) as ot from mano_obra order by fecha desc',function(err, rows) {
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
            conn.query('select id, fecha, empleado, ot_real_m, ot_real_t, case when cast(ot_real_m as unsigned) >= 900000 then 0 else 0.5 end as por_m, cliente_real_m, ' +
            'cliente_real_t, case when cast(ot_real_t as unsigned) >= 900000 then 0 else 0.5 end as por_t, ' +
            'monto, subtotal, IFNULL(plus, 0) as plus, ((case when cast(ot_real_m as unsigned) >= 900000 then 0 else 0.5 end)+(case when cast(ot_real_t as unsigned) >= 900000 then 0 else 0.5 end)) as dia, ' +
            'hora_50, hora_100, hora_normal, hora_neg, pasaje, jornal, obra_real_m, obra_real_t, concat(ot_real_m,"/",ot_real_t) as ot from mano_obra WHERE id = ' + req.params.id, function(err, rows, fields) {
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
                plus: Number(req.sanitize('plus').toString().replace(",",".").trim()),
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
                            id: req.params.id, fecha: mano.fecha, empleado: mano.empleado, cliente_real_m: mano.cliente_real_m, cliente_real_t: mano.cliente_real_t, por_m: req.body.por_m,
                            por_t: req.body.por_t, dia: req.body.dia, monto: mano.monto, plus: mano.plus, subtotal: mano.subtotal, hora_50: mano.hora_50, hora_100: mano.hora_100,
                            hora_normal: mano.hora_normal, hora_neg: mano.hora_neg, pasaje: mano.pasaje, jornal: mano.jornal, usuario: user
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


// MOSTRAR LISTADO ACUMULATIVO DE LIQUIDACIONES MES
app.get('/liquidaciones', function(req, res, next) {
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){

        //actualizamos los valores, la consulta es:
        /*
        */
        req.getConnection(function(error, conn) {
            conn.query('insert into empleados_liq (anho, mes, codigo, quincena, id, manoobra, usuario_insert) ' + 
            'select t1.anho, t1.mes, t1.codigo, t1.quincena, round(rand(t1.codigo)*100000,0) as id, t1.manoobra, t1.usuario_insert from ' + 
            '(select distinct year(fecha) as anho, month(fecha) as mes, codigo, ' + 
            'case when day(fecha) >= 1 and day(fecha) <= 15 then 1 when day(fecha) >= 16 and day(fecha) <= 31 then 2 end as quincena, ' + 
            'IFNULL(sum(subtotal), 0) as manoobra, "admin" as usuario_insert from mano_obra ' + 
            'group by year(fecha), month(fecha), codigo, case when day(fecha) >= 1 and day(fecha) <= 15 then 1 when day(fecha) >= 16 and day(fecha) <= 31 then 2 end ' + 
            'order by year(fecha) desc, month(fecha) desc, codigo asc) t1 ' + 
            'on duplicate key update manoobra = ( select sum(t2.manoobra) as manoobra from ' + 
            '(select distinct year(fecha) as anho, month(fecha) as mes, codigo, ' + 
            'case when day(fecha) >= 1 and day(fecha) <= 15 then 1 when day(fecha) >= 16 and day(fecha) <= 31 then 2 end as quincena, ' + 
            'IFNULL(sum(subtotal), 0) as manoobra from mano_obra ' + 
            'group by year(fecha), month(fecha), codigo, case when day(fecha) >= 1 and day(fecha) <= 15 then 1 when day(fecha) >= 16 and day(fecha) <= 31 then 2 end ' + 
            'order by year(fecha) desc, month(fecha) desc, codigo asc) t2 where t1.anho=t2.anho and t2.mes = t2.mes and t1.codigo = t2.codigo and t1.quincena = t2.quincena)',function(err, rows) {
                if (err) {
                    req.flash('error', err)
                    res.render('manoobra/listar_liq', {title: 'Listado de Trabajos', data: '',usuario: user})
                } else {

                    //TRAEMOS DATOS DE LA BASE
                    req.getConnection(function(error, conn) {
                        conn.query('SELECT el.id, el.codigo, concat(em.nombres," ",em.apellidos) as nombre , el.mes, el.anho, el.quincena, IFNULL(el.epp,0) epp, IFNULL(el.anticipo,0) anticipo, IFNULL(el.prestamo,0) prestamo, IFNULL(el.ips,0) ips, IFNULL(el.saldo_favor,0) saldo_favor,  ' +
                        'IFNULL(el.debe,0) debe, IFNULL(el.debo,0) debo, IFNULL(el.pasaje,0) pasaje, IFNULL(el.manoobra,0) manoobra, IFNULL(el.saldo_pagar,0) saldo_pagar, IFNULL(el.otros,0) otros, IFNULL(el.total,0) total, IFNULL(el.dias_t,0) dias_t, IFNULL(el.h_50_total,0) h_50_total, IFNULL(el.h_100_total,0) h_100_total,  ' +
                        'IFNULL(el.h_neg_total,0) h_neg_total, IFNULL(el.usuario_insert,0) usuario_insert FROM empleados_liq el inner join empleados em on el.codigo = em.codigo ' +
                        'where el.mes = month(current_date()) and el.anho = year(current_date()) order by convert(el.codigo,unsigned integer) ',function(err, rows) {
                            if (err) {
                                req.flash('error', err)
                                res.render('manoobra/listar_liq', {title: 'Listado de Trabajos', data: '',usuario: user})
                            } else {

                                generar_excel_emp_liq(rows);//generamos excel LIQUIDACIONES
                                res.render('manoobra/listar_liq', {title: 'Listado de Liquidaciones', usuario: user, data: rows})
                            }
                        })
                    })

                }
            })
        })
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

app.get('/editar_liq/:id', function(req, res, next){
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){ 
        req.getConnection(function(error, conn) {
            conn.query('select el.*, concat(em.nombres," ",em.apellidos) as nombre from empleados_liq el inner join empleados em on el.codigo = em.codigo  where el.id =' + req.params.id, function(err, rows, fields) {
                if(err) throw err
                
                //Si no se encuentra la planificacion laboral
                if (rows.length <= 0) {
                    req.flash('error', 'LIQUIDACION con id = ' + req.params.id + ' no encontrado')
                    res.redirect('/liquidaciones')
                }
                else { // Si existe el plan
                    //traemos los valores que preguntamos
                    res.render('manoobra/editar_liq', {
                        title: 'Editar Liquidacion', 
                        id: rows[0].id,
                        codigo: rows[0].codigo,//codigo empleado
                        nombre: rows[0].nombre,//nombre empleado
                        mes: rows[0].mes,
                        anho: rows[0].anho,
                        quincena: rows[0].quincena,
                        epp: rows[0].epp,
                        anticipo: rows[0].anticipo,
                        prestamo: rows[0].prestamo,
                        ips: rows[0].ips,
                        saldo_pagar: rows[0].saldo_pagar,
                        debe: rows[0].debe,
                        debo: rows[0].debo,
                        pasaje: rows[0].pasaje,
                        manoobra: rows[0].manoobra,
                        saldo_favor: rows[0].saldo_favor,
                        otros: rows[0].otros,
                        total: rows[0].total,
                        dias_t: rows[0].dias_t,//cantidad de dias 
                        h_50_total: rows[0].h_50_total, //total de horas 50%
                        h_100_total: rows[0].h_100_total,//total de horas 100%
                        h_neg_total: rows[0].h_neg_total,//total de horas negativas
                        usuario: user
                    })
                }            
            })
        })
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

app.post('/editar_liq/:id', function(req, res, next) {
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
        var liqui = {
                //codigo: req.sanitize('codigo').trim(),
                //empleado: req.sanitize('empleado').trim(),
                epp: req.sanitize('epp').trim(),
                anticipo: req.sanitize('anticipo').trim(),
                prestamo: Number(req.sanitize('prestamo').trim()),
                ips: Number(req.sanitize('ips').trim()),
                saldo_favor: Number(req.sanitize('saldo_favor').trim()),
                debe: Number(req.sanitize('debe').trim()),
                debo: Number(req.sanitize('debo').trim()),
                pasaje: Number(req.sanitize('pasaje').trim()),
                manoobra: Number(req.sanitize('manoobra').trim()),
                saldo_pagar: Number(req.sanitize('saldo_pagar').trim()),
                otros: Number(req.sanitize('otros').trim()),
                total: Number(req.sanitize('total').trim()),
                usuario_insert: user
            } 
            
            req.getConnection(function(error, conn) {
                conn.query('UPDATE empleados_liq SET ? WHERE id = ' + req.params.id, liqui, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err)
                        
                        //si hay error
                        res.render('manoobra/editar_liq', {
                            title: 'Editar Mano de Obra',
                            id: req.params.id,
                            codigo: req.body.codigo,
                            nombre: req.body.nombre,
                            epp: liqui.epp,
                            anticipo: liqui.anticipo,
                            prestamo: liqui.prestamo,
                            ips: liqui.ips,
                            saldo_favor: liqui.saldo_favor,
                            debe: liqui.debe,
                            debo: liqui.debo,
                            pasaje: liqui.pasaje,
                            manoobra: liqui.manoobra,
                            saldo_pagar: liqui.saldo_pagar,
                            otros: liqui.otros,
                            total: liqui.total,
                            usuario_insert: user, usuario: user
                        })
                    } else {                
                        req.flash('success', 'Datos actualizados correctamente!')

                        //traemos las planificaciones para mostrar en la tablita frente
                        res.render('manoobra/editar_liq', {
                            title: 'Editar Mano de Obra',
                            id: req.params.id,
                            codigo: req.body.codigo,
                            nombre: req.body.nombre,
                            epp: liqui.epp,
                            anticipo: liqui.anticipo,
                            prestamo: liqui.prestamo,
                            ips: liqui.ips,
                            saldo_favor: liqui.saldo_favor,
                            debe: liqui.debe,
                            debo: liqui.debo,
                            pasaje: liqui.pasaje,
                            manoobra: liqui.manoobra,
                            saldo_pagar: liqui.saldo_pagar,
                            otros: liqui.otros,
                            total: liqui.total,
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

/* EXCEL DE LIQUIDACIONES */
app.post('/descargar_liq', function(req, res, next) {
    //primero traemos los datos de la tabla
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
        //vemos los datos en la base
        //DESCARGAR PDF CON DATOS DEL ESTUDIO
        var file = path.resolve("Listado_LIQUIDACION.xlsx");
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