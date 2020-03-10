var express = require('express');
var app = express();
var path = require('path');
var excel = require('excel4node');//para generar excel
var user = '';//global para ver el usuario
var userId = '';//global para userid
var datos = []; 
var datos_pro = []; //datos de proveedores

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
    var workbook = new excel.Workbook({numberFormat: 'dd/mm/yyyy'});
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
    worksheet.cell(1,1).string('ID').style(style);
    worksheet.cell(1,2).string('FECHA').style(style);
    worksheet.cell(1,3).string('MONTO').style({style});
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
    worksheet.cell(1,15).string('CLIENTE').style(style);
    worksheet.cell(1,16).string('OBRA').style(style);
    worksheet.cell(1,17).string('IMPUTADO').style(style);
    worksheet.cell(1,18).string('ORIGEN PAGO').style(style);
    if(user == "admin" || user == "ksanabria" || user == "josorio")
    {    worksheet.cell(1,19).string('TIPO').style(style);}
    //worksheet.cell(1,1).string('').style(style);

    //luego los datos
    var i = 1;
    rows.forEach(function(row) {
        //worksheet.cell(i+1,1).string(String(i)).style(style);//numeracion
        worksheet.cell(i+1,1).number(Number(row.id)).style(style);//cambiamos por el ID de insercion
        console.log(row.id)
        worksheet.cell(i+1,2).date(formatear_fecha_yyyymmdd(row.fecha)).style({dateFormat: 'dd/mm/yyyy'});//ver formato fecha
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
        worksheet.cell(i+1,15).string(String(row.cliente)).style(style);
        worksheet.cell(i+1,16).string(String(row.obra)).style(style);
        worksheet.cell(i+1,17).string(String(row.imputado)).style(style);
        worksheet.cell(i+1,18).string(String(row.origen_pago)).style(style);
        if(user == "admin" || user == "ksanabria" || user == "josorio")
        {    worksheet.cell(i+1,19).string(String(row.tipo)).style(style);}
        //worksheet.cell(i+1,2).string(String(row.)).style(style);//debug
        i=i+1;
        //console.log(row.descripcion);//debug
    });
    workbook.write('Listado_GASTOS.xlsx');
}

// MOSTRAR LISTADO DE GASTOS HISTORICO --------------------------
app.get('/historico', function(req, res, next) {
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
        //si el usuario es cristina entonces solo ve lo de ella, si no, se ve todo
        var sql_con ="";
        var sql_lis = "";
        //como estaba originalmente

        //cada usuario puede ver solamente su carga, y solamente los administradores pueden ver todo.
        //verificar si los usuarios bajo karen pueden ver los tipos de carga "NO CONFIDENCIALES".
        if(user == "rsanabria" || user == "cibanez" || user == "prueba" || user == "jlopez" || user == "jguerrero" || user == "fduarte" || user == "ogonzalez")
        {sql_con = "SELECT t1.id,t1.fecha,t1.monto,t1.exentas,t1.iva_10,t1.iva_5,t1.gasto_real,t1.concepto,t1.fact_condicion, t1.proveedor,t1.fact_nro, t1.encargado,t1.codigo, " + 
        "t1.nro_ot, t1.imputado, t1.usuario_insert, t1.origen_pago, t1.tipo, t1.id_proveedor, t2.ot_nro, t2.cliente, t2.obra FROM gastos t1 left join ot t2 on t2.ot_nro = t1.nro_ot " + 
        "left join cajas c1 on c1.id = t1.id_caja " +
        "WHERE ( /* month(t1.fecha) >= month(current_date())-1 and year(t1.fecha) = year(current_date()) and */ t1.usuario_insert = '" + user + "' /*and (c1.estado= 'C' or c1.estado is null) */)  order by t1.fecha desc";
        sql_lis = "SELECT t1.id,t1.fecha,t1.monto,t1.exentas,t1.iva_10,t1.iva_5,t1.gasto_real,t1.concepto,t1.fact_condicion, t1.proveedor,t1.fact_nro, t1.encargado,t1.codigo, " + 
        "t1.nro_ot, t1.imputado, t1.usuario_insert, t1.origen_pago, t1.tipo, t1.id_proveedor, t2.ot_nro, t2.cliente, t2.obra FROM gastos t1 left join ot t2 on t2.ot_nro = t1.nro_ot " +
        "left join cajas c1 on c1.id = t1.id_caja " + 
        "WHERE t1.usuario_insert = '" + user + "' and (c1.estado= 'C' or c1.estado is null) order by t1.fecha desc"; 
        }
        else
        //traemos los datos (OBRA y CLIENTE) de la OT asociada a ese gasto. SOLO TRAEMOS LOS DATOS DEL MES ACTUAL
        {sql_con = "SELECT t1.id,t1.fecha,t1.monto,t1.exentas,t1.iva_10,t1.iva_5,t1.gasto_real,t1.concepto,t1.fact_condicion, t1.proveedor,t1.fact_nro, t1.encargado,t1.codigo, " + 
        "t1.nro_ot, t1.imputado, t1.usuario_insert, t1.origen_pago, t1.tipo, t1.id_proveedor, t2.ot_nro, t2.cliente, t2.obra FROM gastos t1 left join ot t2 on t2.ot_nro = t1.nro_ot " + 
        "left join cajas c1 on c1.id = t1.id_caja /*where (c1.estado= 'C' or c1.estado is null) */ " +
        " /* where month(t1.fecha) = month(current_date())-1 and year(t1.fecha) = year(current_date()) */ order by t1.fecha desc";
        sql_lis= "SELECT t1.id,t1.fecha,t1.monto,t1.exentas,t1.iva_10,t1.iva_5,t1.gasto_real,t1.concepto,t1.fact_condicion, t1.proveedor,t1.fact_nro, t1.encargado,t1.codigo, " + 
        "t1.nro_ot, t1.imputado, t1.usuario_insert, t1.origen_pago, t1.tipo, t1.id_proveedor, t2.ot_nro, t2.cliente, t2.obra FROM gastos t1 left join ot t2 on t2.ot_nro = t1.nro_ot " +
        "left join cajas c1 on c1.id = t1.id_caja where (c1.estado= 'C' or c1.estado is null) " + //esta parte trae solamente las cajas cerradas/
        "order by t1.fecha desc";
        }
        req.getConnection(function(error, conn) {
            conn.query(sql_con,function(err, rows) {
                if (err) {
                    req.flash('error', err)
                    res.render('gastos/listar', {title: 'Histórico de GASTOS', data: '',usuario: user})
                } else {
                    //traemos las cajas asignadas para esa persona
                    req.getConnection(function(error, conn) {
                        conn.query("select * from cajas c inner join users u on u.codigo = c.codigo where u.user_name = '" + user + "'",function(err, rows2) {
                            //if(err) throw err
                            if (err) {
                                req.flash('error', err)
                                res.render('gastos/listar', {title: 'Histórico de GASTOS', data: '',usuario: user})
                            } else {
                                //TRAEMOS LOS DATOS REALES PARA EL LISTADO EXCEL --- TODOS LOS DATOS CORRESPONDIENTES
                                req.getConnection(function(error, conn) {
                                    conn.query(sql_lis,function(err, rows3) {
                                        //if(err) throw err
                                        if (err) {
                                            req.flash('error', err)
                                            res.render('gastos/listar', {title: 'Histórico de GASTOS', data: '',usuario: user})
                                        } else {
                                            generar_excel_gastos(rows3);//generamos excel gastos segun el usuario que sea claro
                                            //pasamos los datos y los datos de las cajas en rows2
                                            res.render('gastos/listar', {title: 'Histórico de GASTOS', usuario: user, data: rows, data_cajas: rows2})
                                        }
                                    })
                                })
                            }
                        })
                    })
                }
            })
        })
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

// MOSTRAR LISTADO DE GASTOS SOLO MES ANTERIOR Y MES ACTUAL
app.get('/', function(req, res, next) {
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
        //si el usuario es cristina entonces solo ve lo de ella, si no, se ve todo
        var sql_con ="";
        var sql_lis = "";
        //como estaba originalmente
        /*if(user == "rsanabria" || user == "cibanez" || user == "prueba")
        {   sql_con = "SELECT t1.id,t1.fecha,t1.monto,t1.exentas,t1.iva_10,t1.iva_5,t1.gasto_real,t1.concepto,t1.fact_condicion, t1.proveedor,t1.fact_nro, t1.encargado,t1.codigo, " + 
        "t1.nro_ot, t1.imputado, t1.usuario_insert, t1.origen_pago, t1.tipo, t1.id_proveedor, t2.ot_nro, t2.cliente, t2.obra FROM gastos t1 left join ot t2 on t2.ot_nro = t1.nro_ot " + 
        "WHERE t1.usuario_insert in ('rsanabria','cibanez','prueba') or t1.tipo = 'NO_CONF' order by t1.fecha desc";}
        else*/

        //cada usuario puede ver solamente su carga, y solamente los administradores pueden ver todo.
        //verificar si los usuarios bajo karen pueden ver los tipos de carga "NO CONFIDENCIALES".
        if(user == "rsanabria" || user == "cibanez" || user == "prueba" || user == "jlopez" || user == "jguerrero" || user == "fduarte" || user == "ogonzalez")
        {sql_con = "SELECT t1.id,t1.fecha,t1.monto,t1.exentas,t1.iva_10,t1.iva_5,t1.gasto_real,t1.concepto,t1.fact_condicion, t1.proveedor,t1.fact_nro, t1.encargado,t1.codigo, " + 
        "t1.nro_ot, t1.imputado, t1.usuario_insert, t1.origen_pago, t1.tipo, t1.id_proveedor, t2.ot_nro, t2.cliente, t2.obra FROM gastos t1 left join ot t2 on t2.ot_nro = t1.nro_ot " + 
        "left join cajas c1 on c1.id = t1.id_caja " +
        "WHERE (month(t1.fecha) >= month(current_date())-1 and year(t1.fecha) = year(current_date()) and t1.usuario_insert = '" + user + "' /*and (c1.estado= 'C' or c1.estado is null)*/ )  order by t1.fecha desc";
        sql_lis = "SELECT t1.id,t1.fecha,t1.monto,t1.exentas,t1.iva_10,t1.iva_5,t1.gasto_real,t1.concepto,t1.fact_condicion, t1.proveedor,t1.fact_nro, t1.encargado,t1.codigo, " + 
        "t1.nro_ot, t1.imputado, t1.usuario_insert, t1.origen_pago, t1.tipo, t1.id_proveedor, t2.ot_nro, t2.cliente, t2.obra FROM gastos t1 left join ot t2 on t2.ot_nro = t1.nro_ot " + 
        "left join cajas c1 on c1.id = t1.id_caja " +
        "WHERE t1.usuario_insert = '" + user + "' and (c1.estado= 'C' or c1.estado is null) order by t1.fecha desc"; 
        }
        else
        //traemos los datos (OBRA y CLIENTE) de la OT asociada a ese gasto. SOLO TRAEMOS LOS DATOS DEL MES ACTUAL
        {sql_con = "SELECT t1.id,t1.fecha,t1.monto,t1.exentas,t1.iva_10,t1.iva_5,t1.gasto_real,t1.concepto,t1.fact_condicion, t1.proveedor,t1.fact_nro, t1.encargado,t1.codigo, " + 
        "t1.nro_ot, t1.imputado, t1.usuario_insert, t1.origen_pago, t1.tipo, t1.id_proveedor, t2.ot_nro, t2.cliente, t2.obra FROM gastos t1 left join ot t2 on t2.ot_nro = t1.nro_ot " + 
        "left join cajas c1 on c1.id = t1.id_caja " +
        "where month(t1.fecha) >= month(current_date())-1 and year(t1.fecha) = year(current_date()) /*and (c1.estado= 'C' or c1.estado is null)*/ " +
        "order by t1.fecha desc";
        sql_lis= "SELECT t1.id,t1.fecha,t1.monto,t1.exentas,t1.iva_10,t1.iva_5,t1.gasto_real,t1.concepto,t1.fact_condicion, t1.proveedor,t1.fact_nro, t1.encargado,t1.codigo, " + 
        "t1.nro_ot, t1.imputado, t1.usuario_insert, t1.origen_pago, t1.tipo, t1.id_proveedor, t2.ot_nro, t2.cliente, t2.obra FROM gastos t1 left join ot t2 on t2.ot_nro = t1.nro_ot " + 
        "left join cajas c1 on c1.id = t1.id_caja where (c1.estado= 'C' or c1.estado is null) " +
        "order by t1.fecha desc";
        }
        req.getConnection(function(error, conn) {
            conn.query(sql_con,function(err, rows) {
                if (err) {
                    req.flash('error', err)
                    res.render('gastos/listar', {title: 'Listado de GASTOS', data: '',usuario: user})
                } else {
                    //traemos las cajas asignadas para esa persona
                    req.getConnection(function(error, conn) {
                        conn.query("select * from cajas c inner join users u on u.codigo = c.codigo where u.user_name = '" + user + "'",function(err, rows2) {
                            //if(err) throw err
                            if (err) {
                                req.flash('error', err)
                                res.render('gastos/listar', {title: 'Listado de GASTOS', data: '',usuario: user})
                            } else {
                                //TRAEMOS LOS DATOS REALES PARA EL LISTADO EXCEL --- TODOS LOS DATOS CORRESPONDIENTES
                                req.getConnection(function(error, conn) {
                                    conn.query(sql_lis,function(err, rows3) {
                                        //if(err) throw err
                                        if (err) {
                                            req.flash('error', err)
                                            res.render('gastos/listar', {title: 'Listado de GASTOS', data: '',usuario: user})
                                        } else {
                                            generar_excel_gastos(rows3);//generamos excel gastos segun el usuario que sea claro
                                            //pasamos los datos y los datos de las cajas en rows2
                                            res.render('gastos/listar', {title: 'Listado de GASTOS', usuario: user, data: rows, data_cajas: rows2})
                                        }
                                    })
                                })
                            }
                        })
                    })
                }
            })
        })
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//RESPONSE PARA CARGA DE GASTOS -- FORMULARIO 
app.get('/add', function(req, res, next){
   
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        req.getConnection(function(error, conn) {
            //cualquier usuario puede ver todas las OTs listadas
            conn.query('SELECT * FROM ot ORDER BY ot_nro DESC',function(err, rows) {
                if (err) {console.log(err);}
                else{
                    datos = [];
                    rows.forEach(function(row) {    
                        datos.push(row);
                    });
                    //console.log(datos);//debug
                    req.getConnection(function(error, conn) {
                        //Cualquier usuario puede ver todos los proveedores listados
                        conn.query('SELECT * FROM proveedor ORDER BY id ASC',function(err, rows2) {
                            if (err) {console.log(err); }
                            else{
                                datos_pro = [];
                                rows2.forEach(function(row) {    
                                    datos_pro.push(row);
                                });

                                //traemos las cajas asignadas para esa persona
                                req.getConnection(function(error, conn) {
                                    conn.query("select c.* from cajas c inner join users u on u.codigo = c.codigo where u.user_name = '" + user + "'",function(err, rows3) {
                                        //if(err) throw err
                                        if (err) {
                                            req.flash('error', err)
                                            res.render('gastos/listar', {title: 'Listado de GASTOS', data: '',usuario: user})
                                        } else {
                                            datos_caja = [];
                                            rows3.forEach(function(row) {    
                                                datos_caja.push(row);
                                            });
                                            //pasamos los datos y los datos de las cajas en rows2
                                            //console.log(datos_pro);//debug
                                            res.render('gastos/add', {
                                                title: 'Cargar nuevo GASTO', id_proveedor: '0', id_caja: '0' ,fecha: '', monto: '0',exentas: '0',iva_10: '0',iva_5: '0',gasto_real: '0',gasto_real1: '0',concepto: '', 
                                                fact_condicion: '',proveedor: '',fact_nro: '', encargado: '', codigo: '',nro_ot:'0',imputado:'', origen_pago:'',tipo:'', caja:'', 
                                                usuario_insert: user, usuario: user, data: datos, data_pro: datos_pro, data_cajas: datos_caja});
                                        }
                                    })
                                })
                            }
                        })
                    })
                }
            })
        })
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
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


            //mysql acepta solos YYYY-MM-DD
            var date1 = req.sanitize('fecha').escape().trim();
            var mon = Number(req.sanitize('monto').escape().trim()); 
            var exe = Number(req.sanitize('exentas').escape().trim());
            var calcu_iva = req.sanitize('calcu_iva').escape().trim();
            var fact_cond= req.sanitize('fact_condicion').trim();
            var cod = Number(req.sanitize('codigo').escape().trim());

            if(calcu_iva == "IVA_10"){
                var iva10 = Number(req.sanitize('iva_10').escape().trim());
                var iva5 = 0;
            }
            if(calcu_iva == "IVA_5"){
                var iva10 = 0;
                var iva5 = Number(req.sanitize('iva_5').escape().trim());
            }
            /*if()
            {}*/
            var gasreal = ''
            if(cod == 4 || fact_cond == "CREDITO")
            //si el cod = 4 O es credito entonces tenemos que leer gasto_real, porque gasto_real1 esta anulado
            {gasreal = Number(req.sanitize('gasto_real').escape().trim());}
            else{gasreal = Number(req.sanitize('gasto_real1').escape().trim());}

            
            //para el caso del codigo 4 y factura no son credito  y NO SON CODIGO 4
            if(gasreal == 0 && fact_cond !== "CREDITO" && cod !== 4)
            {   if(cod !== 4){gasreal = Number(req.sanitize('gasto_real').escape().trim());}
                else{gasreal = Number(req.sanitize('gasto_real1').escape().trim());}//el otro valor}
            }

            //si es la cond es contado y el codigo = 4 // agregado (16/01/2020)
            if(cod == 4 && fact_cond == "CONTADO / NOTA DE CREDITO")
            //si el cod = 4 O y  es contado, entonces gastoreal = 0 
            {gasreal = 0;}

            var tipov = '';
            if(user == "admin" || user == "ksanabria" || user == "josorio")
            {   tipov = req.sanitize('tipo').escape().trim();}

            /*if(gasreal == 0 && fact_cond !== "CREDITO" && cod == 4)
            {   gasreal = 0;}*///el otro valor

            var ot = Number(req.sanitize('nro_ot').escape().trim());
            var origen_pago = req.sanitize('origen_pago').escape().trim();


            //para discriminar los valores que vienen relativos a caja
            var cajita = req.sanitize('caja').trim();
            var id_cajita= req.sanitize('id_caja').trim();



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
                proveedor: req.sanitize('proveedor').trim(),//se sacó el escape()
                fact_nro: req.sanitize('fact_nro').trim(),
                encargado: req.sanitize('encargado').trim(),
                codigo: cod,
                nro_ot: ot,
                origen_pago:origen_pago,
                imputado: req.sanitize('imputado').trim(),
                tipo: tipov,
                id_proveedor: req.sanitize('id_proveedor').trim(),
                id_caja: id_cajita,//vemos si existe o no entonces le cargamos
                //caja: cajita,//si no se cargo nada va vacio
                usuario_insert: user
                //usuario_insert: req.sanitize('usuario_insert').escape().trim()//no usamos en la pagina.
            }   
            
            //conectamos a la base de datos
            req.getConnection(function(error, conn) {
                conn.query('INSERT INTO gastos SET ?', gasto, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err)
                        
                        //si hay error debemos completar luego con la página
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
                            tipo: gasto.tipo,//se carga si es admin/josorio/ksanabria, sino va vacio a la tabla
                            id_proveedor: gasto.id_proveedor,
                            id_caja: gasto.id_caja,
                            caja: gasto.caja,
                            usuario: user,
                            data: datos, data_pro: datos_pro
                        })
                    } else {                
                        req.flash('success', 'Datos agregados correctamente!')
                        
                        //pasamos los datos como si nada
                        req.getConnection(function(error, conn) {
                            //cualquier usuario puede ver todas las OTs listadas
                            conn.query('SELECT * FROM ot ORDER BY ot_nro DESC',function(err, rows) {
                                if (err) {console.log(err);}
                                else{
                                    datos = [];
                                    rows.forEach(function(row) {    
                                        datos.push(row);
                                    });
                                    //console.log(datos);//debug
                                    req.getConnection(function(error, conn) {
                                        //Cualquier usuario puede ver todos los proveedores listados
                                        conn.query('SELECT * FROM proveedor ORDER BY id ASC',function(err, rows2) {
                                            if (err) {console.log(err); }
                                            else{
                                                datos_pro = [];
                                                rows2.forEach(function(row) {    
                                                    datos_pro.push(row);
                                                });
                
                                                //traemos las cajas asignadas para esa persona
                                                req.getConnection(function(error, conn) {
                                                    conn.query("select c.* from cajas c inner join users u on u.codigo = c.codigo where u.user_name = '" + user + "'",function(err, rows3) {
                                                        //if(err) throw err
                                                        if (err) {
                                                            req.flash('error', err)
                                                            res.render('gastos/listar', {title: 'Listado de GASTOS', data: '',usuario: user})
                                                        } else {
                                                            datos_caja = [];
                                                            rows3.forEach(function(row) {    
                                                                datos_caja.push(row);
                                                            });
                                                            //pasamos los datos y los datos de las cajas en rows2
                                                            //console.log(datos_pro);//debug
                                                            res.render('gastos/add', {
                                                                title: 'Cargar nuevo GASTO', id_proveedor: '0', id_caja: '0' ,fecha: '', monto: '0',exentas: '0',iva_10: '0',iva_5: '0',gasto_real: '0',gasto_real1: '0',concepto: '', 
                                                                fact_condicion: '',proveedor: '',fact_nro: '', encargado: '', codigo: '',nro_ot:'0',imputado:'', origen_pago:'',tipo:'', caja:'', 
                                                                usuario_insert: user, usuario: user, data: datos, data_pro: datos_pro, data_cajas: datos_caja});
                                                        }
                                                    })
                                                })
                                            }
                                        })
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
                id_caja: req.body.id_caja,
                caja: req.body.caja,
                usuario_insert: user
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
            conn.query('SELECT * FROM gastos WHERE id = ' + req.params.id, function(err, rows, fields) {
                if(err) throw err
                
                // if user not found
                if (rows.length <= 0) {
                    req.flash('error', 'GASTO con id = ' + req.params.id + ' no encontrada')
                    res.redirect('/gastos')
                }
                else { // Si existe la factura
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

                                req.getConnection(function(error, conn) {
                                    conn.query('SELECT * FROM proveedor ORDER BY id ASC',function(err, rows3) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        else{
                                            datos_pro = [];
                                            rows3.forEach(function(row) {    
                                                datos_pro.push(row);
                                            });
                                            //console.log(datos_pro);//debug
                                //traemos las cajas asignadas para esa persona
                                req.getConnection(function(error, conn) {
                                    conn.query("select * from cajas c inner join users u on u.codigo = c.codigo where u.user_name = '" + user + "'",function(err, rows4) {
                                        //if(err) throw err
                                        if (err) {
                                            req.flash('error', err)
                                            res.render('gastos/listar', {title: 'Listado de GASTOS', data: '',usuario: user})
                                        } else {
                                            datos_caja = [];
                                            rows4.forEach(function(row) {    
                                                datos_caja.push(row);
                                            });
                                            //pasamos los datos y los datos de las cajas en rows2
                                            //console.log(datos_pro);//debug
                                            var date1 = rows[0].fecha;
                                            res.render('gastos/editar', {title: 'Editar GASTO', id_caja: rows[0].id_caja, caja: rows[0].concepto, id: rows[0].id, fecha: formatear_fecha_yyyymmdd(date1), monto: rows[0].monto, exentas: rows[0].exentas,
                                            iva_10: rows[0].iva_10, iva_5: rows[0].iva_5, gasto_real: rows[0].gasto_real, concepto: rows[0].concepto, fact_condicion: rows[0].fact_condicion,
                                            proveedor: rows[0].proveedor, fact_nro: rows[0].fact_nro, encargado: rows[0].encargado, codigo: rows[0].codigo, nro_ot: rows[0].nro_ot, id_proveedor: rows[0].id_proveedor,
                                            imputado: rows[0].imputado, origen_pago: rows[0].origen_pago, tipo: rows[0].tipo, usuario: user, data: datos, data_pro: datos_pro, data_cajas: datos_caja })
                                        }
                                    })
                                })
                                        }
                                    })
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
            var exe1 = Number(req.sanitize('exentas1').escape().trim());
            var calcu_iva = req.sanitize('calcu_iva').escape().trim();
            var fact_cond= req.sanitize('fact_condicion').trim();
            var cod = Number(req.sanitize('codigo').escape().trim());


            /* EN TODOS LOS CASOS CARGAMOS LAS EXENTAS, SIN IMPORTAR EL CLiCK*/
            /*if(fact_cond == "CONTADO"){
                exe = exe1;
            }*/
            exe = exe1;

            if(calcu_iva == "IVA_10"){
                var iva10 = Number(req.sanitize('iva_10').escape().trim());
                var iva5 = 0;
            }
            if(calcu_iva == "IVA_5"){
                var iva10 = 0;
                var iva5 = Number(req.sanitize('iva_5').escape().trim());
            }
            /*if()
            {}*/
            var gasreal = ''
            if(cod == 4 || fact_cond == "CREDITO")
            //si el cod = 4 O es credito entonces tenemos que leer gasto_real, porque gasto_real1 esta anulado
            {gasreal = Number(req.sanitize('gasto_real').escape().trim());}
            else{gasreal = Number(req.sanitize('gasto_real1').escape().trim());}

            
            //para el caso del codigo 4 y factura no son credito  y NO SON CODIGO 4
            if(gasreal == 0 && fact_cond !== "CREDITO" && cod !== 4)
            {   if(cod !== 4){gasreal = Number(req.sanitize('gasto_real').escape().trim());}
                else{gasreal = Number(req.sanitize('gasto_real1').escape().trim());}//el otro valor}
            }

            var tipov = '';
            if(user == "admin" || user == "ksanabria" || user == "josorio")
            {   tipov = req.sanitize('tipo').escape().trim();}

            /*if(gasreal == 0 && fact_cond !== "CREDITO" && cod == 4)
            {   gasreal = 0;}*///el otro valor

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
                tipo: tipov,
                id_proveedor: req.sanitize('id_proveedor').trim(),
                id_caja: req.sanitize('id_caja').trim(),
                usuario_insert: user
                //usuario_insert: req.sanitize('usuario_insert').escape().trim()//no usamos en la pagina.
            }  
            
            /*var gasto = {
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
                origen_pago: req.sanitize('origen_pago').escape().trim(),
                tipo: tipov,
                id_proveedor: Number(req.sanitize('id_proveedor').escape().trim()),
                usuario_insert: user
                //usuario_insert: req.sanitize('usuario_insert').escape().trim()//no usamos en la pagina.
            }  */
            
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
                            tipo: req.body.tipo,
                            id_proveedor: req.body.id_proveedor,
                            id_caja: req.body.id_caja,
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
                                    //onsole.log(datos);//debug

                                    req.getConnection(function(error, conn) {
                                        conn.query("select * from cajas c inner join users u on u.codigo = c.codigo where u.user_name = '" + user + "'",function(err, rows4) {
                                            //if(err) throw err
                                            if (err) {
                                                req.flash('error', err)
                                                res.render('gastos/listar', {title: 'Listado de GASTOS', data: '',usuario: user})
                                            } else {
                                                datos_caja = [];
                                                rows4.forEach(function(row) {    
                                                    datos_caja.push(row);
                                                });
                                                //pasamos los datos y los datos de las cajas en rows2
                                                res.render('gastos/editar', { title: 'Editar GASTO', id_caja: req.body.id_caja, caja: req.body.concepto, id: req.params.id,fecha: req.body.fecha,monto: req.body.monto, exentas: gasto.exentas,
                                                iva_10: req.body.iva_10, iva_5: req.body.iva_5, gasto_real: req.body.gasto_real, concepto: req.body.concepto, fact_condicion: req.body.fact_condicion,
                                                proveedor: req.body.proveedor, fact_nro: req.body.fact_nro, encargado: req.body.encargado, codigo: req.body.codigo, nro_ot: req.body.nro_ot, id_proveedor: req.body.id_proveedor, 
                                                imputado: req.body.imputado, origen_pago: req.body.origen_pago, tipo: req.body.tipo, usuario_insert: user, usuario: user, data: datos, data_pro: datos_pro, data_cajas: datos_caja})
                                            }
                                        })
                                    }) 

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
                tipo: req.body.tipo,
                id_proveedor: req.body.id_proveedor,
                usuario_insert: user
            })
        }
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
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
app.get('/eliminar/(:id)', function(req, res, next) {
    //primero traemos los datos de la tabla
    if(req.session.loggedIn)
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
                    //verificar si es desde donde se le invoca al eliminar para redireccionar (listar o historial)
                    res.redirect('/gastos')
                } else {
                    req.flash('success', 'Gasto eliminado exitosamente! ID = ' + req.params.id)
                    //verificar si es desde donde se le invoca al eliminar para redireccionar (listar o historial)
                    res.redirect('/gastos')

                    //insertar log de uso de sistema en caso de suceso de insercion
                }
            })
        })
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

module.exports = app;