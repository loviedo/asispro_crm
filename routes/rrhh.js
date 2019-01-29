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
    worksheet.cell(1,1).string('CODIGO').style(style);
    worksheet.cell(1,2).string('FECHA INGRESO').style(style);
    worksheet.cell(1,3).string('NOMBRES').style(style);
    worksheet.cell(1,4).string('APELLIDOS').style(style);
    worksheet.cell(1,5).string('SEXO').style(style);
    worksheet.cell(1,6).string('CI').style(style);
    worksheet.cell(1,7).string('FECHA NACIMIENTO').style(style);
    worksheet.cell(1,8).string('EDAD').style(style);
    worksheet.cell(1,9).string('NACIONALIDAD').style(style);
    worksheet.cell(1,10).string('MANO DIESTRA').style(style);
    worksheet.cell(1,11).string('ESTADO CIVIL').style(style);
    worksheet.cell(1,12).string('OCUPACION').style(style);
    worksheet.cell(1,13).string('NRO HIJOS').style(style);
    worksheet.cell(1,14).string('EMAILS').style(style);
    worksheet.cell(1,15).string('CARGO').style(style);
    worksheet.cell(1,16).string('TALLA CALZADO').style(style);
    worksheet.cell(1,17).string('TALLA PANTALON').style(style);
    worksheet.cell(1,18).string('TALLA CAMISA').style(style);
    worksheet.cell(1,19).string('NIVEL EDUCATIVO').style(style);
    worksheet.cell(1,20).string('GRADO ACADEMICO APROBADO').style(style);
    worksheet.cell(1,21).string('ANTIGUEDAD AÑO').style(style);
    worksheet.cell(1,22).string('ANTIGUEDAD MES').style(style);
    worksheet.cell(1,23).string('HORARIO ENTRADA').style(style);
    worksheet.cell(1,24).string('HORARIO SALIDA').style(style);
    worksheet.cell(1,25).string('DEPARTAMENTO TRABAJO').style(style);
    worksheet.cell(1,26).string('DIRECCION').style(style);
    worksheet.cell(1,27).string('CIUDAD').style(style);
    worksheet.cell(1,28).string('BARRIO').style(style);
    worksheet.cell(1,29).string('TELEFONO MOVIL').style(style);
    worksheet.cell(1,30).string('TELEFONO EMERGENCIA').style(style);
    worksheet.cell(1,31).string('TIPO EMPLEADO').style(style);
    worksheet.cell(1,32).string('JORNAL').style(style);
    worksheet.cell(1,33).string('MOTIVO SALIDA').style(style);
    //worksheet.cell(1,1).string('').style(style);

    //luego los datos
    var i = 1;
    rows.forEach(function(row) {
        worksheet.cell(i+1,1).string(String(row.codigo)).style(style);
        worksheet.cell(i+1,2).string(String(formatear_fecha(row.fecha_ingreso))).style(style);
        worksheet.cell(i+1,3).string(String(row.nombres)).style(style);
        worksheet.cell(i+1,4).string(String(row.apellidos)).style(style);
        worksheet.cell(i+1,5).string(String(row.sexo)).style(style);
        worksheet.cell(i+1,6).string(String(row.ci)).style(style);
        worksheet.cell(i+1,7).string(String(formatear_fecha(row.fecha_nac))).style(style);
        worksheet.cell(i+1,8).number(Number(row.edad)).style(style);
        worksheet.cell(i+1,9).string(String(row.nacionalidad)).style(style);
        worksheet.cell(i+1,10).string(String(row.mano_diestra)).style(style);
        worksheet.cell(i+1,11).string(String(row.estado_civil)).style(style);
        worksheet.cell(i+1,12).string(String(row.ocupacion)).style(style);
        worksheet.cell(i+1,13).number(Number(row.n_hijos)).style(style);
        worksheet.cell(i+1,14).string(String(row.email)).style(style);
        worksheet.cell(i+1,15).string(String(row.cargo)).style(style);
        worksheet.cell(i+1,16).number(Number(row.calzado)).style(style);
        worksheet.cell(i+1,17).number(Number(row.pantalon)).style(style);
        worksheet.cell(i+1,18).number(Number(row.camisa)).style(style);
        worksheet.cell(i+1,19).string(String(row.nivel_educativo)).style(style);
        worksheet.cell(i+1,20).string(String(row.g_a_aprobado)).style(style);
        worksheet.cell(i+1,21).number(Number(row.ant_ano)).style(style);
        worksheet.cell(i+1,22).number(Number(row.ant_mes)).style(style);
        worksheet.cell(i+1,23).string(String(row.horario_e)).style(style);
        worksheet.cell(i+1,24).string(String(row.horario_s)).style(style);
        worksheet.cell(i+1,25).string(String(row.dep_trabajo)).style(style);
        worksheet.cell(i+1,26).string(String(row.direccion)).style(style);
        worksheet.cell(i+1,27).string(String(row.ciudad)).style(style);
        worksheet.cell(i+1,28).string(String(row.barrio)).style(style);
        worksheet.cell(i+1,29).string(String(row.tel_movil)).style(style);
        worksheet.cell(i+1,30).string(String(row.tel_emergencia)).style(style);
        worksheet.cell(i+1,31).string(String(row.tipo_empleado)).style(style);
        worksheet.cell(i+1,32).number(Number(row.jornal)).style(style);
        worksheet.cell(i+1,33).string(String(row.motivo_salida)).style(style);
        i=i+1;
        //console.log(row.descripcion);//debug
    });
    workbook.write('Listado_EMPLEADOS.xlsx');
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
        // renderear views/user/add.ejs
        res.render('rrhh/add', {
            title: 'Cargar nuevo EMPLEADO', codigo:'', fecha_ingreso :'', nombres: '', apellidos: '', sexo:'',ci:'',fecha_nac:'',edad:0, nacionalidad:'',mano_diestra:'',
            estado_civil:'',ocupacion:'',n_hijos:0, email:'',cargo:'',calzado:0, pantalon:0, camisa:0, nivel_educativo:'',g_a_aprobado:'',ant_ano:0, ant_mes:'0',
            horario_e:'',horario_s:'',dep_trabajo:'',direccion:'',ciudad:'',barrio:'',tel_movil:'',tel_emergencia:'', motivo_salida:'',
            tipo_empleado:'',jornal:0, usuario_insert: user, usuario: user})
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
        var recurso = {
            codigo: req.sanitize('codigo').trim(),
            fecha_ingreso: formatear_fecha_yyyymmdd(req.sanitize('fecha_ingreso').trim()),
            nombres: req.sanitize('nombres').trim(),
            apellidos: req.sanitize('apellidos').trim(),
            sexo: req.sanitize('sexo').trim(),
            ci: req.sanitize('ci').trim(),
            apellidos: req.sanitize('apellidos').trim(),
            fecha_nac: formatear_fecha_yyyymmdd(req.sanitize('fecha_nac').trim()),
            edad: Number(req.sanitize('edad').trim()),
            nacionalidad: req.sanitize('nacionalidad').trim(),
            mano_diestra: req.sanitize('mano_diestra').trim(),
            estado_civil: req.sanitize('estado_civil').trim(),
            ocupacion: req.sanitize('ocupacion').trim(),
            n_hijos: Number(req.sanitize('n_hijos').trim()),
            email: req.sanitize('email').trim(),
            cargo: req.sanitize('cargo').trim(),
            calzado: Number(req.sanitize('calzado').trim()),
            pantalon: Number(req.sanitize('pantalon').trim()),
            camisa: Number(req.sanitize('camisa').trim()),
            nivel_educativo: req.sanitize('nivel_educativo').trim(),
            g_a_aprobado: req.sanitize('g_a_aprobado').trim(),
            cargo: req.sanitize('cargo').trim(),
            ant_ano: Number(req.sanitize('ant_ano').trim()),
            ant_mes: Number(req.sanitize('ant_mes').trim()),
            horario_e: req.sanitize('horario_e').trim(),
            horario_s: req.sanitize('horario_s').trim(),
            dep_trabajo: req.sanitize('dep_trabajo').trim(),
            direccion: req.sanitize('direccion').trim(),
            ciudad: req.sanitize('ciudad').trim(),
            barrio: req.sanitize('barrio').trim(),
            tel_movil: req.sanitize('tel_movil').trim(),
            tel_emergencia: req.sanitize('tel_emergencia').trim(),
            tipo_empleado: req.sanitize('tipo_empleado').trim(),
            jornal: Number(req.sanitize('jornal').trim()),
            motivo_salida: req.sanitize('motivo_salida').trim(),
            usuario_insert: user
        }   
        
        //conectamos a la base de datos
        req.getConnection(function(error, conn) {
            conn.query('INSERT INTO empleados SET ?', recurso, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    
                    // render to views/factura/add.ejs
                    res.render('rrhh/add', {
                        title: 'Agregar Nuevo EMPLEADO',
                        codigo: recurso.codigo,
                        fecha_ingreso : recurso.fecha_ingreso,
                        nombres: recurso.nombres,
                        apellidos: recurso.apellidos,
                        sexo: recurso.sexo,
                        ci: recurso.ci,
                        apellidos: recurso.apellidos,
                        fecha_nac: recurso.fecha_nac,
                        edad: recurso.edad,
                        nacionalidad: recurso.nacionalidad,
                        mano_diestra: recurso.mano_diestra,
                        estado_civil: recurso.estado_civil,
                        ocupacion: recurso.ocupacion,
                        n_hijos: recurso.n_hijos,
                        email: recurso.email,
                        cargo: recurso.cargo,
                        calzado: recurso.calzado,
                        pantalon: recurso.pantalon,
                        camisa: recurso.camisa,
                        nivel_educativo: recurso.nivel_educativo,
                        g_a_aprobado: recurso.g_a_aprobado,
                        cargo: recurso.cargo,
                        ant_ano: recurso.ant_ano,
                        ant_mes: recurso.ant_mes,
                        horario_e: recurso.horario_e,
                        horario_s: recurso.horario_s,
                        dep_trabajo: recurso.dep_trabajo,
                        direccion: recurso.direccion,
                        ciudad: recurso.ciudad,
                        barrio: recurso.barrio,
                        tel_movil: recurso.tel_movil,
                        tel_emergencia: recurso.tel_emergencia,
                        tipo_empleado: recurso.tipo_empleado,
                        jornal: recurso.jornal,
                        motivo_salida: recurso.motivo_salida,
                        usuario: user
                    })
                } else {                
                    req.flash('success', 'Datos agregados correctamente!')
                    
                    // render to views/ot/add.ejs
                    res.render('rrhh/add', {
                        title: 'Agregar nuevo EMPLEADO',
                        codigo: recurso.codigo,
                        fecha_ingreso: recurso.fecha_ingreso,
                        nombres: recurso.nombres,
                        apellidos: recurso.apellidos,
                        sexo: recurso.sexo,
                        ci: recurso.ci,
                        apellidos: recurso.apellidos,
                        fecha_nac: recurso.fecha_nac,
                        edad: recurso.edad,
                        nacionalidad: recurso.nacionalidad,
                        mano_diestra: recurso.mano_diestra,
                        estado_civil: recurso.estado_civil,
                        ocupacion: recurso.ocupacion,
                        n_hijos: recurso.n_hijos,
                        email: recurso.email,
                        cargo: recurso.cargo,
                        calzado: recurso.calzado,
                        pantalon: recurso.pantalon,
                        camisa: recurso.camisa,
                        nivel_educativo: recurso.nivel_educativo,
                        g_a_aprobado: recurso.g_a_aprobado,
                        cargo: recurso.cargo,
                        ant_ano: recurso.ant_ano,
                        ant_mes: recurso.ant_mes,
                        horario_e: recurso.horario_e,
                        horario_s: recurso.horario_s,
                        dep_trabajo: recurso.dep_trabajo,
                        direccion: recurso.direccion,
                        ciudad: recurso.ciudad,
                        barrio: recurso.barrio,
                        tel_movil: recurso.tel_movil,
                        tel_emergencia: recurso.tel_emergencia,
                        tipo_empleado: recurso.tipo_empleado,
                        jornal: recurso.jornal,
                        motivo_salida: recurso.motivo_salida,
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
            codigo: recurso.codigo,
            fecha_ingreso: recurso.fecha_ingreso,
            nombres: recurso.nombres,
            apellidos: recurso.apellidos,
            sexo: recurso.sexo,
            ci: recurso.ci,
            apellidos: recurso.apellidos,
            fecha_nac: recurso.fecha_nac,
            edad: recurso.edad,
            nacionalidad: recurso.nacionalidad,
            mano_diestra: recurso.mano_diestra,
            estado_civil: recurso.estado_civil,
            ocupacion: recurso.ocupacion,
            n_hijos: recurso.n_hijos,
            email: recurso.email,
            cargo: recurso.cargo,
            calzado: recurso.calzado,
            pantalon: recurso.pantalon,
            camisa: recurso.camisa,
            nivel_educativo: recurso.nivel_educativo,
            g_a_aprobado: recurso.g_a_aprobado,
            cargo: recurso.cargo,
            ant_ano: recurso.ant_ano,
            ant_mes: recurso.ant_mes,
            horario_e: recurso.horario_e,
            horario_s: recurso.horario_s,
            dep_trabajo: recurso.dep_trabajo,
            direccion: recurso.direccion,
            ciudad: recurso.ciudad,
            barrio: recurso.barrio,
            tel_movil: recurso.tel_movil,
            tel_emergencia: recurso.tel_emergencia,
            tipo_empleado: recurso.tipo_empleado,
            jornal: recurso.jornal,
            motivo_salida: recurso.motivo_salida,
            usuario: user
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
                    id: rows[0].id,
                    codigo: rows[0].codigo,
                    fecha_ingreso: formatear_fecha_yyyymmdd(rows[0].fecha_ingreso),
                    nombres: rows[0].nombres,
                    apellidos: rows[0].apellidos,
                    sexo: rows[0].sexo,
                    ci: rows[0].ci,
                    apellidos: rows[0].apellidos,
                    fecha_nac: formatear_fecha_yyyymmdd(rows[0].fecha_nac),
                    edad: rows[0].edad,
                    nacionalidad: rows[0].nacionalidad,
                    mano_diestra: rows[0].mano_diestra,
                    estado_civil: rows[0].estado_civil,
                    ocupacion: rows[0].ocupacion,
                    n_hijos: rows[0].n_hijos,
                    email: rows[0].email,
                    cargo: rows[0].cargo,
                    calzado: rows[0].calzado,
                    pantalon: rows[0].pantalon,
                    camisa: rows[0].camisa,
                    nivel_educativo: rows[0].nivel_educativo,
                    g_a_aprobado: rows[0].g_a_aprobado,
                    cargo: rows[0].cargo,
                    ant_ano: rows[0].ant_ano,
                    ant_mes: rows[0].ant_mes,
                    horario_e: rows[0].horario_e,
                    horario_s: rows[0].horario_s,
                    dep_trabajo: rows[0].dep_trabajo,
                    direccion: rows[0].direccion,
                    ciudad: rows[0].ciudad,
                    barrio: rows[0].barrio,
                    tel_movil: rows[0].tel_movil,
                    tel_emergencia: rows[0].tel_emergencia,
                    tipo_empleado: rows[0].tipo_empleado,
                    jornal: rows[0].jornal,
                    motivo_salida: rows[0].motivo_salida,
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
    
    if( !errors ) {//No errors were found.  Passed Validation!

        var emple = {
            codigo: req.sanitize('codigo').trim(),
            fecha_ingreso: formatear_fecha_yyyymmdd(req.sanitize('fecha_ingreso').trim()),
            nombres: req.sanitize('nombres').trim(),
            apellidos: req.sanitize('apellidos').trim(),
            sexo: req.sanitize('sexo').trim(),
            ci: req.sanitize('ci').trim(),
            apellidos: req.sanitize('apellidos').trim(),
            fecha_nac: formatear_fecha_yyyymmdd(req.sanitize('fecha_nac').trim()),
            edad: req.sanitize('edad').trim(),
            nacionalidad: req.sanitize('nacionalidad').trim(),
            mano_diestra: req.sanitize('mano_diestra').trim(),
            estado_civil: req.sanitize('estado_civil').trim(),
            ocupacion: req.sanitize('ocupacion').trim(),
            n_hijos: Number(req.sanitize('n_hijos').trim()),
            email: req.sanitize('email').trim(),
            cargo: req.sanitize('cargo').trim(),
            calzado: req.sanitize('calzado').trim(),
            pantalon: req.sanitize('pantalon').trim(),
            camisa: req.sanitize('camisa').trim(),
            nivel_educativo: req.sanitize('nivel_educativo').trim(),
            g_a_aprobado: req.sanitize('g_a_aprobado').trim(),
            cargo: req.sanitize('cargo').trim(),
            ant_ano: Number(req.sanitize('ant_ano').trim()),
            ant_mes: Number(req.sanitize('ant_mes').trim()),
            horario_e: req.sanitize('horario_e').trim(),
            horario_s: req.sanitize('horario_s').trim(),
            dep_trabajo: req.sanitize('dep_trabajo').trim(),
            direccion: req.sanitize('direccion').trim(),
            ciudad: req.sanitize('ciudad').trim(),
            barrio: req.sanitize('barrio').trim(),
            tel_movil: req.sanitize('tel_movil').trim(),
            tel_emergencia: req.sanitize('tel_emergencia').trim(),
            tipo_empleado: req.sanitize('tipo_empleado').trim(),
            jornal: Number(req.sanitize('jornal').trim()),
            motivo_salida: req.sanitize('motivo_salida').trim(),
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
                        id: req.params.id,
                        codigo: req.params.codigo,
                        fecha_ingreso: req.params.fecha_ingreso,
                        nombres: req.params.nombres,
                        apellidos: req.params.apellidos,
                        sexo: req.params.sexo,
                        ci: req.params.ci,
                        apellidos: req.params.apellidos,
                        fecha_nac: req.params.fecha_nac,
                        edad: req.params.edad,
                        nacionalidad: req.params.nacionalidad,
                        mano_diestra: req.params.mano_diestra,
                        estado_civil: req.params.estado_civil,
                        ocupacion: req.params.ocupacion,
                        n_hijos: req.params.n_hijos,
                        email: req.params.email,
                        cargo: req.params.cargo,
                        calzado: req.params.calzado,
                        pantalon: req.params.pantalon,
                        camisa: req.params.camisa,
                        nivel_educativo: req.params.nivel_educativo,
                        g_a_aprobado: req.params.g_a_aprobado,
                        cargo: req.params.cargo,
                        ant_ano: req.params.ant_ano,
                        ant_mes: req.params.ant_mes,
                        horario_e: req.params.horario_e,
                        horario_s: req.params.horario_s,
                        dep_trabajo: req.params.dep_trabajo,
                        direccion: req.params.direccion,
                        ciudad: req.params.ciudad,
                        barrio: req.params.barrio,
                        tel_movil: req.params.tel_movil,
                        tel_emergencia: req.params.tel_emergencia,
                        tipo_empleado: req.params.tipo_empleado,
                        jornal: req.params.jornal,
                        motivo_salida: req.params.motivo_salida,
                        usuario_insert: user,
                        usuario: user
                    })
                } else {                
                    req.flash('success', 'Datos actualizados correctamente!');
                    
                    // render to views/rrhh/add.ejs
                    res.render('rrhh/editar', {
                        title: 'Editar EMPLEADO',
                        id: req.params.id,
                        codigo: req.params.codigo,
                        fecha_ingreso: req.params.fecha_ingreso,
                        nombres: req.params.nombres,
                        apellidos: req.params.apellidos,
                        sexo: req.params.sexo,
                        ci: req.params.ci,
                        apellidos: req.params.apellidos,
                        fecha_nac: req.params.fecha_nac,
                        edad: req.params.edad,
                        nacionalidad: req.params.nacionalidad,
                        mano_diestra: req.params.mano_diestra,
                        estado_civil: req.params.estado_civil,
                        ocupacion: req.params.ocupacion,
                        n_hijos: req.params.n_hijos,
                        email: req.params.email,
                        cargo: req.params.cargo,
                        calzado: req.params.calzado,
                        pantalon: req.params.pantalon,
                        camisa: req.params.camisa,
                        nivel_educativo: req.params.nivel_educativo,
                        g_a_aprobado: req.params.g_a_aprobado,
                        cargo: req.params.cargo,
                        ant_ano: req.params.ant_ano,
                        ant_mes: req.params.ant_mes,
                        horario_e: req.params.horario_e,
                        horario_s: req.params.horario_s,
                        dep_trabajo: req.params.dep_trabajo,
                        direccion: req.params.direccion,
                        ciudad: req.params.ciudad,
                        barrio: req.params.barrio,
                        tel_movil: req.params.tel_movil,
                        tel_emergencia: req.params.tel_emergencia,
                        tipo_empleado: req.params.tipo_empleado,
                        jornal: req.params.jornal,
                        motivo_salida: req.params.motivo_salida,
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
            codigo: req.params.codigo,
            fecha_ingreso: req.params.fecha_ingreso,
            nombres: req.params.nombres,
            apellidos: req.params.apellidos,
            sexo: req.params.sexo,
            ci: req.params.ci,
            apellidos: req.params.apellidos,
            fecha_nac: req.params.fecha_nac,
            edad: req.params.edad,
            nacionalidad: req.params.nacionalidad,
            mano_diestra: req.params.mano_diestra,
            estado_civil: req.params.estado_civil,
            ocupacion: req.params.ocupacion,
            n_hijos: req.params.n_hijos,
            email: req.params.email,
            cargo: req.params.cargo,
            calzado: req.params.calzado,
            pantalon: req.params.pantalon,
            camisa: req.params.camisa,
            nivel_educativo: req.params.nivel_educativo,
            g_a_aprobado: req.params.g_a_aprobado,
            cargo: req.params.cargo,
            ant_ano: req.params.ant_ano,
            ant_mes: req.params.ant_mes,
            horario_e: req.params.horario_e,
            horario_s: req.params.horario_s,
            dep_trabajo: req.params.dep_trabajo,
            direccion: req.params.direccion,
            ciudad: req.params.ciudad,
            barrio: req.params.barrio,
            tel_movil: req.params.tel_movil,
            tel_emergencia: req.params.tel_emergencia,
            tipo_empleado: req.params.tipo_empleado,
            jornal: req.params.jornal,
            motivo_salida: req.params.motivo_salida,
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