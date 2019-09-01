/* LOGICA DEL FLUJO DE CAJA */
var express = require('express');
var app = express();
var path = require('path');
var excel = require('excel4node');//para generar excel
var user = '';//global para ver el usuario
var userId = '';//global para userid
var deta_cajas = []; //datos de empleados

/* funciones de ayuda */


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
    worksheet.cell(3,3).string('AÑO').style(style);
    worksheet.cell(3,3).string('MES').style(style);
    worksheet.cell(3,3).string('QUINCENA').style(style);
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
        worksheet.cell(i+3,3).string(String(row.anho)).style(style);
        worksheet.cell(i+3,3).string(String(row.mes)).style(style);
        worksheet.cell(i+3,3).string(String(row.quincena)).style(style);
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

//recibimos los datos de cabecera de cajas, y el detalle de facturas que se quieren observar.
function genera_detalle_caja(rows, rows2){
    var workbook = new excel.Workbook();
    var worksheet = workbook.addWorksheet('DETALLE CAJAS');
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
    worksheet.cell(1,3).string('ID').style(style);
    worksheet.cell(2,3).string('FECHA').style(style);
    worksheet.cell(3,3).string('SALIDA').style(style);
    worksheet.cell(4,3).string('RESPONSABLE').style(style);
    worksheet.cell(5,3).string('CONCEPTO').style(style);
    worksheet.cell(6,3).string('SALDO').style(style);
    worksheet.cell(7,3).string('GASTO').style(style);

    /* DATOS CABECERA */
    worksheet.cell(1,4).number(Number(rows[0].id)).style(style);
    worksheet.cell(2,4).date(formatear_fecha_yyyymmdd(rows[0].fecha)).style({dateFormat: 'dd/mm/yyyy'});//ver formato fecha
    worksheet.cell(3,4).number(Number(rows[0].salida)).style(style);
    worksheet.cell(4,4).string(String(rows[0].responsable)).style(style);
    worksheet.cell(5,4).string(String(rows[0].concepto)).style(style);
    worksheet.cell(6,4).number(Number(rows[0].saldo)).style(style);
    worksheet.cell(7,4).number(Number(rows[0].gasto)).style(style);

    /* DATOS DETALLE */
    worksheet.cell(9,2).string('DETALLE DE GASTOS').style(style);
    worksheet.cell(10,2).string('FECHA').style(style);
    worksheet.cell(10,3).string('CONDICION').style(style);
    worksheet.cell(10,4).string('MONTO').style(style);
    worksheet.cell(10,5).string('EXENTAS').style(style);
    worksheet.cell(10,6).string('IVA 10%').style(style);
    worksheet.cell(10,7).string('IVA 5%').style(style);
    worksheet.cell(10,8).string('GASTO REAL').style(style);
    worksheet.cell(10,9).string('CONCEPTO').style(style);
    worksheet.cell(10,10).string('PROVEEDOR').style(style);

    //luego los datos
    var i = 1;
    rows2.forEach(function(row) {

        worksheet.cell(i+10,2).date(formatear_fecha_yyyymmdd(row.fecha)).style({dateFormat: 'dd/mm/yyyy'});//codigo del empleado
        worksheet.cell(i+10,3).string(String(row.fact_condicion)).style(style); //nombre y apellido
        worksheet.cell(i+10,4).number(Number(row.monto.toString().replace(",","."))).style(style);
        worksheet.cell(i+10,5).number(Number(row.exentas.toString().replace(",","."))).style(style);
        worksheet.cell(i+10,6).number(Number(row.iva_10.toString().replace(",","."))).style(style);
        worksheet.cell(i+10,7).number(Number(row.iva_5.toString().replace(",","."))).style(style);
        worksheet.cell(i+10,8).number(Number(row.gasto_real.toString().replace(",","."))).style(style);
        worksheet.cell(i+10,9).string(String(row.concepto)).style(style);
        worksheet.cell(i+10,10).string(String(row.proveedor)).style(style);
        /*worksheet.cell(i+10,9).number(Number(rows2.ips.toString().replace(",","."))).style(style);
        worksheet.cell(i+10,10).number(Number(rows2.saldo_favor.toString().replace(",","."))).style(style);*/


        /*
        worksheet.cell(i+3,8).number(Number(row.debe.toString().replace(",","."))).style(style);
        worksheet.cell(i+3,9).number(Number(row.debo.toString().replace(",","."))).style(style);
        worksheet.cell(i+3,10).number(Number(row.pasaje.toString().replace(",","."))).style(style);
        worksheet.cell(i+3,11).number(Number(row.manoobra.toString().replace(",","."))).style(style);
        worksheet.cell(i+3,12).number(Number(row.saldo_pagar.toString().replace(",","."))).style(style);
        worksheet.cell(i+3,13).number(Number(row.otros.toString().replace(",","."))).style(style);
        worksheet.cell(i+3,14).number(Number(row.total.toString().replace(",","."))).style(style);
*/
        //worksheet.cell(i+1,2).string(String(row.)).style(style);//debug
        i=i+1;
        //console.log(row.descripcion);//debug
    });
    
    workbook.write('DETALLE_CAJA_ID'+ rows[0].id +'.xlsx');
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


// MOSTRAR CAJAS ASIGNADAS AL USUARIO ACTUAL
app.get('/', function(req, res, next) {
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        //
        //DATOS DE CAJAS, SE VEN SOLAMENTE LAS CAJAS ASIGNADAS AL USUARIO ACTUAL
        //REVISAR POR QUE SE NECESITA CRUZAR CON CODIGO DE EMPLEADO! -->
        var con_sql = "select c.* from cajas c inner join users u on u.codigo = c.codigo where u.user_name = '" + user + "'";
        //Karen solamente puede ver las cajas que delega.
        if (user =="ksanabria")
        {con_sql = "select c.* from cajas c inner join users u on u.codigo = c.codigo order by fecha desc";}
        //si es el usuario admin/jose, puede ver solamente lo que cargo el.
        if (user=="josorio" || user =="admin")
        {   con_sql = "select c.* from cajas c where codigo = 22 order by fecha desc"; 
            /*con_sql = "select c.* from cajas c inner join users u on u.codigo = c.codigo";*/}


        //calculamos la suma de los gastos asignados para esa caja.
        var sql_act = 'update cajas t1 set t1.gasto = (select IFNULL(sum(t2.gasto_real), 0) from gastos t2 where t2.id_caja= t1.id), ' +
                    't1.saldo = t1.salida - (select IFNULL(sum(t2.gasto_real), 0) from gastos t2 where t2.id_caja= t1.id)';
        
        req.getConnection(function(error, conn) {
            conn.query(sql_act,function(err, rows) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    res.render('cajas/listar', {title: 'Listado de Cajas', data: '',usuario: user})
                } else {
                    //si se actualizan correctamente los gastos y sumas de saldos de las cajas, entonces mostramos.
                    req.getConnection(function(error, conn) {
                        conn.query(con_sql,function(err, rows) {
                            if (err) {
                                req.flash('error', err)
                                res.render('cajas/listar', {title: 'Listado de Cajas', data: '',usuario: user})
                            } else {
                                //generar_excel_mano_obra(rows);
                                res.render('cajas/listar', {title: 'Listado de Cajas', usuario: user, data: rows})
                            }
                        })
                    })
                }
            })
        })
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//CARGA DE NUEVA CAJA
app.get('/add', function(req, res, next){
   
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        req.getConnection(function(error, conn) {
            conn.query('select codigo, concat(nombres," ",apellidos) as nombre, ocupacion, tel_movil from empleados ORDER BY codigo',function(err, rows) {
                if (err) {console.log(err); }
                else{
                    datos_emple = [];
                    rows.forEach(function(row) { datos_emple.push(row); });

                    //si el usuario es KAREN entonces debe ver si tiene caja asignada en estado abierta. SINO TIENE NO PUEDE CREAR CAJA
                    if(user == "ksanabria")
                    {
                        conn.query("select id, fecha, salida, codigo, responsable, concepto, saldo, gasto, estado, usuario_insert, id_caja " + 
                        " from cajas where codigo = 22 and estado = 'A' ORDER BY fecha asc",function(err, rows1) {
                            if (err) {console.log(err); }
                            else{
                                //si hay datos, entonces cargamos los datos y habilitamos el alta.
                                if(rows1.length >=1)
                                {   datos_caja = [];
                                    rows1.forEach(function(row) { datos_caja.push(row); });
                                    //console.log(datos_pro);//debug
                                    res.render('cajas/add', {
                                    title: 'AGREGAR CAJA', fecha: '', concepto: '', salida: '0', responsable: '', saldo: '0', gasto: '0', id_caja: '0', caja:'',
                                    codigo: '0', usuario_insert: user, usuario: user,  data_emple: datos_emple, data_caja: datos_caja});}
                                else
                                {   //avisar que no hay caja habilitada
                                    req.flash('NO EXISTEN CAJAS HABILITADAS PARA CARGAR, SOLICITAR ALTA AL ADMINISTRADOR')
                                    res.render('cajas/listar', {title: 'Listado de Cajas', data: '',usuario: user})
                                }
                            }
                        })
                    }
                    else
                    {   //ACA SOLAMENTE DEBERIA PODER ENTRAR EL USUARIO ADMIN O JOSE
                        //console.log(datos_pro); //debug
                        datos_caja = [];
                        res.render('cajas/add', {
                        title: 'AGREGAR CAJA', fecha: '', concepto: '', salida: '0', responsable: '', saldo: '0', gasto: '0', id_caja: '0', caja:'',
                        codigo: '0', usuario_insert: user, usuario: user,  data_emple: datos_emple, data_caja: datos_caja});}
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
            var codigo = Number(req.sanitize('codigo').escape().trim()); 
            var fecha = req.sanitize('fecha').escape().trim();
            var concepto = req.sanitize('concepto').escape().trim();
            var salida = Number(req.sanitize('salida').escape().trim()); 
            var responsable = req.sanitize('responsable').escape().trim();
            var saldo = Number(req.sanitize('saldo').escape().trim());
            var gasto = Number(req.sanitize('gasto').escape().trim());
            var caje = '';//no usamos
            var id_cajita= 0;
            if(user= 'ksanabria')
            {   caje = req.sanitize('caja').trim();
                id_cajita= Number(req.sanitize('id_caja').trim());
            }

            //traemos datos del post.
            var cajita = {
                fecha: formatear_fecha_yyyymmdd(fecha),
                codigo: codigo,
                concepto: concepto,
                salida: salida,
                responsable: responsable,
                saldo: saldo,
                gasto: gasto,
                id_caja: id_cajita, //usamos para el caso de una caja asignada a una caja general. en otro caso va 0
                usuario_insert: user
            }   
            
            //conectamos a la base de datos
            req.getConnection(function(error, conn) {
                conn.query('INSERT INTO cajas SET ?', cajita, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err)
                        
                        // render to views/factura/add.ejs
                        res.render('cajas/add', {
                            title: 'Agregar Nueva CAJA',
                            codigo: cajita.codigo,
                            fecha: cajita.fecha,
                            monto: cajita.monto,
                            exentas: cajita.exentas,
                            iva_10: cajita.iva_10,
                            iva_5: cajita.iva_5,
                            gasto_real: cajita.gasto_real,
                            caja: caje,
                            id_caja: id_cajita,
                            concepto: cajita.concepto,
                            usuario: user,
                            //ver de cargar data_pro: datos_pro
                        })
                    } else {                
                        req.flash('success', 'Datos agregados correctamente!')
                        
                        // render to views/ot/add.ejs
                        conn.query('select codigo, concat(nombres," ",apellidos) as nombre, ocupacion, tel_movil from empleados ORDER BY codigo',function(err, rows) {
                            if (err) {
                                console.log(err);
                            }
                            else{
                                datos_emple = [];
                                rows.forEach(function(row) { datos_emple.push(row); });
                                
                                //si el usuario es KAREN entonces debe ver si tiene caja asignada en estado abierta. SINO TIENE NO PUEDE CREAR CAJA
                                if(user = "ksanabria")
                                {
                                    conn.query("select id, fecha, salida, codigo, responsable, concepto, saldo, gasto, estado, usuario_insert " + 
                                     "from cajas where codigo = 22 and estado = 'A' ORDER BY fecha asc",function(err, rows1) {
                                        if (err) {console.log(err); }
                                        else{
                                            //si hay datos, entonces cargamos los datos y habilitamos el alta.
                                            if(rows1.length >=1)
                                            {   datos_caja = [];
                                                rows1.forEach(function(row) { datos_caja.push(row); });
                                                //console.log(datos_pro);//debug
                                                res.render('cajas/add', {
                                                title: 'AGREGAR CAJA', fecha: '', concepto: '', salida: '0', responsable: '', saldo: '0', gasto: '0',id_caja: '0', caja:'', 
                                                codigo: '0', usuario_insert: user, usuario: user,  data_emple: datos_emple, data_caja: datos_caja});}
                                            else
                                            {   //avisar que no hay caja habilitada
                                                req.flash('NO EXISTEN CAJAS HABILITADAS PARA CARGAR, SOLICITAR ALTA AL ADMINISTRADOR')
                                                res.render('cajas/listar', {title: 'Listado de Cajas', data: '',usuario: user})
                                            }
                                        }
                                    })
                                }
                                else
                                {   //ACA SOLAMENTE DEBERIA PODER ENTRAR EL USUARIO ADMIN O JOSE
                                    //console.log(datos_pro); //debug
                                    res.render('cajas/add', {
                                    title: 'AGREGAR CAJA', fecha: '', concepto: '', salida: '0', responsable: '', saldo: '0', gasto: '0', 
                                    codigo: '0', usuario_insert: user, usuario: user,  data_emple: datos_emple});}
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
                tipo: req.body.tipo,
                id_proveeedor: req.body.id_proveeedor,
                usuario_insert: user
            })
        }
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//DETALLE DE LA CAJA SELECCIONADA
app.get('/detalle/:id', function(req, res, next){
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    if(user.length >0){


        req.getConnection(function(error, conn) {
            conn.query('SELECT * FROM cajas WHERE id = ' + req.params.id, function(err, rows, fields) {
                if(err) throw err
                
                // if user not found
                if (rows.length <= 0) {
                    req.flash('error', 'CAJA con id = ' + req.params.id + ' no encontrado')
                    res.redirect('/cajas')
                }
                else {
                    req.getConnection(function(error, conn) {
                        //traemos el detalle de las cajas, asignadas segun sea el tipo, si el usuario es normal traemos el datos de la caja
                        var sql_consulta='select * from gastos where id_caja = ' + req.params.id + ' order by fecha desc';
                        //si el usuario es especial, entonces traemos los gastos asociados a sus cajas bajo la caja general creada.
                        if(user == 'josorio' || user == 'admin')
                        {   sql_consulta = 'select * from gastos where id_caja in (select id from cajas where id_caja = ' + req.params.id + ') order by id, fecha desc'}
                        conn.query(sql_consulta,function(err, rows2) {
                            if (err) {console.log(err); }
                            else{
                                deta_cajas = [];
                                rows2.forEach(function(row) { deta_cajas.push(row); });

                                //generamos el excel de la caja
                                genera_detalle_caja(rows, rows2);
                                //console.log(datos_pro);//debug
                                res.render('cajas/detalle', {
                                title: 'EDITAR CAJA', id: req.params.id, fecha: formatear_fecha_yyyymmdd(rows[0].fecha), concepto: rows[0].concepto, salida: rows[0].salida, responsable: rows[0].responsable, 
                                saldo: rows[0].saldo, gasto: rows[0].gasto, codigo: rows[0].codigo, usuario_insert: user, usuario: user,  deta_cajas: deta_cajas});
                            }
                        })
                    })
                }            
            })
        })
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//PARA EDITAR LOS DATOS - GET
app.get('/editar/:id', function(req, res, next){
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    if(user.length >0){
        req.getConnection(function(error, conn) {
            conn.query('SELECT * FROM cajas WHERE id = ' + req.params.id, function(err, rows, fields) {
                if(err) throw err
                
                // if user not found
                if (rows.length <= 0) {
                    req.flash('error', 'CAJA con id = ' + req.params.id + ' no encontrado')
                    res.redirect('/cajas')
                }
                else {
                    //primero generamos el excel de la caja
                    //genera_detalle_caja(rows);

                    req.getConnection(function(error, conn) {
                        conn.query('select codigo, concat(nombres," ",apellidos) as nombre, ocupacion, tel_movil from empleados ORDER BY codigo',function(err, rows2) {
                            if (err) {console.log(err); }
                            else{
                                datos_emple = [];
                                rows2.forEach(function(row) { datos_emple.push(row); });
                                
                                //console.log(datos_pro);//debug
                                res.render('cajas/editar', {
                                title: 'EDITAR CAJA', id: req.params.id, fecha: formatear_fecha_yyyymmdd(rows[0].fecha), estado: rows[0].estado, concepto: rows[0].concepto, salida: rows[0].salida, responsable: rows[0].responsable, 
                                saldo: rows[0].saldo, gasto: rows[0].gasto, codigo: rows[0].codigo, usuario_insert: user, usuario: user,  data_emple: datos_emple});
                            }
                        })
                    })
                }            
            })
        })
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//PARA EDITAR LOS DATOS 
app.post('/editar/:id', function(req, res, next){
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    if(user.length >0){

        var caja=
        {
            fecha: formatear_fecha_yyyymmdd(req.sanitize('fecha').trim()),
            codigo: req.sanitize('codigo').trim(),
            concepto: req.sanitize('concepto').trim(),
            salida: req.sanitize('salida').trim(),
            responsable: req.sanitize('responsable').trim(),
            estado: req.sanitize('estado').trim(),
            saldo: req.sanitize('saldo').trim(),
            gasto: req.sanitize('gasto').trim()
        }
        var errors = req.validationErrors()

        if( !errors ) {
            
            req.getConnection(function(error, conn) {
                conn.query('UPDATE cajas SET ? WHERE id = ' + req.params.id, caja, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', error_msg)
                        
                        // render to views/clientes/add.ejs
                        res.render('cajas/editar', { title: 'Editar CAJAS', id: req.params.id, codigo: req.body.codigo, fecha: req.body.fecha, concepto: req.body.concepto, salida: req.body.salida, 
                            responsable: req.body.responsable, saldo: req.body.saldo, gasto: req.body.gasto, estado: req.body.estado, usuario_insert: user, usuario: user })
                    } else {                
                        req.flash('success', 'Datos actualizados correctamente!')

                        req.getConnection(function(error, conn) {
                            conn.query('select codigo, concat(nombres," ",apellidos) as nombre, ocupacion, tel_movil from empleados ORDER BY codigo',function(err, rows2) {
                                if (err) {console.log(err); }
                                else{
                                    datos_emple = [];
                                    rows2.forEach(function(row) { datos_emple.push(row); });
                                    
                                    //console.log(datos_pro);//debug
                                    res.render('cajas/editar', { title: 'Editar CAJAS', id: req.params.id, codigo: req.body.codigo, fecha: req.body.fecha, concepto: req.body.concepto, salida: req.body.salida, 
                                    responsable: req.body.responsable, saldo: req.body.saldo, gasto: req.body.gasto, estado: req.body.estado, usuario_insert: user, usuario: user,  data_emple: datos_emple })
                                }
                            })
                        })
                    }
                })
            })
        }
        else {//mostramos error
            var error_msg = ''
            errors.forEach(function(error) { error_msg += error.msg + '<br>' })
            req.flash('error', error_msg)
            res.render('cajas/editar', { title: 'Editar CAJAS', id: req.params.id, codigo: req.body.codigo, fecha: req.body.fecha, concepto: req.body.concepto, salida: req.body.salida, 
            responsable: req.body.responsable, saldo: req.body.saldo, gasto: req.body.gasto, estado: req.body.estado, usuario_insert: user, usuario: user })
        }
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

/* GENERACION Y EXPORTACION EXCEL */
app.post('/descargar/:id', function(req, res, next) {
    //primero traemos los datos de la tabla
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
        //vemos los datos en la base
        //DESCARGAR PDF CON DATOS DEL ESTUDIO
        var file = path.resolve('DETALLE_CAJA_ID'+ req.params.id +'.xlsx');
        res.contentType('Content-Type',"application/pdf");
        res.download(file, function (err) {
            if (err) {
                console.log("ERROR AL DESCARGAR EL ARCHIVO:");
                console.log(err);
            } else {
                console.log("ARCHIVO ENVIADO!");
            }
        });
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
});

app.post('/descargar_caja', function(req, res, next) {
    //primero traemos los datos de la tabla
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
        //vemos los datos en la base
        //DESCARGAR PDF CON DATOS DEL ESTUDIO
        var file = path.resolve("CAJA.xlsx");
        res.contentType('Content-Type',"application/pdf");
        res.download(file, function (err) {
            if (err) {
                console.log("ERROR AL DESCARGAR EL ARCHIVO:");
                console.log(err);
            } else {
                console.log("ARCHIVO ENVIADO!");
            }
        });
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
});

//BORRAR CAJA
app.get('/eliminar/(:id)', function(req, res, next) {

    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
        var mano_plan = { id: req.params.id }
        
        req.getConnection(function(error, conn) {
            conn.query('DELETE FROM cajas WHERE id = ' + req.params.id, mano_plan, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    //redireccionar al listado de ingresos
                    res.redirect('/cajas')
                } else {
                    req.flash('success', 'CAJA eliminada / ID = ' + req.params.id)
                    //redireccionar al listado de cajas
                    res.redirect('/cajas')
                    //insertar log de uso de sistema en caso de suceso de insercion
                }
            })
        })
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

module.exports = app;