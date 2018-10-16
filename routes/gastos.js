var express = require('express')
var app = express()
var user = '';//global para ver el usuario
var userId = '';//global para userid
 

function formatear_fecha_yyyymmdd(date) {
    var d;
    //hay que ver si es string o date el objeto que viene
    if(date.constructor == String)
    {   
        var arr = date.split("-");
        d = new Date(arr[0],arr[1],arr[2],0,0,0,0);
        month = '' + (d.getMonth());
        day = '' + (d.getDate());
        year = d.getFullYear();
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
            conn.query('SELECT * FROM gastos ORDER BY id DESC',function(err, rows) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    res.render('gastos/listar', {title: 'Listado de GASTOS', data: '',usuario: user})
                } else {
                    // render views/ot/listar.ejs
                    res.render('gastos/listar', {title: 'Listado de GASTOS', usuario: user, data: rows})
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
        res.render('gastos/add', {
            title: 'Cargar nuevo GASTO', fecha: '', monto: '',exentas: '',iva_10: '',iva_5: '',gasto_real: '',concepto: '', 
            fact_estado: '',proveedor: '',fact_nro: '', encargado: '', codigo: '',nro_ot:'', usuario_insert: user, usuario: user})
    }
    else {
        // render to views/index.ejs template file
        res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});
    }
})

//NUEVO GASTO - POST DE INSERT
app.post('/add', function(req, res, next){   
    
    /*req.assert('name', 'Nombre es requerido').notEmpty()           //Validar nombre
    req.assert('age', 'Edad es requerida').notEmpty()             //Validar edad
    req.assert('email', 'SE requiere un email valido').isEmail()  //Validar email
 */
    var errors = req.validationErrors()
    
    if(!errors) {//Si no hay errores, entonces conitnuamos

        //mysql acepta solos YYYY-MM-DD
        var date1 = req.sanitize('fecha').escape().trim();
        var mon = Number(req.sanitize('monto').escape().trim()); 
        var exe = Number(req.sanitize('exentas').escape().trim());
        var iva10 = Number(req.sanitize('iva_10').escape().trim());
        var iva5 = Number(req.sanitize('iva_5').escape().trim());
        var gasreal = Number(req.sanitize('gasto_real').escape().trim());
        var cod = Number(req.sanitize('codigo').escape().trim());
        var ot = Number(req.sanitize('nro_ot').escape().trim());

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
            concepto: req.sanitize('concepto').escape().trim(),
            fact_estado: req.sanitize('fact_estado').escape().trim(),
            proveedor: req.sanitize('proveedor').escape().trim(),
            fact_nro: req.sanitize('fact_nro').escape().trim(),
            encargado: req.sanitize('encargado').escape().trim(),
            codigo: cod,
            nro_ot: ot,
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
                        fact_estado: gasto.fact_estado,
                        proveedor: gasto.proveedor,
                        fact_nro: gasto.fact_nro,
                        encargado: gasto.encargado,
                        codigo: gasto.codigo,
                        nro_ot: gasto.nro_ot,
                        usuario: user
                    })
                } else {                
                    req.flash('success', 'Datos agregados correctamente!')
                    
                    // render to views/ot/add.ejs
                    res.render('gastos/add', {
                        title: 'Agregar nuevo Gasto',
                        fecha: '',
                        monto: '',
                        exentas: '',
                        iva_10: '',
                        iva_5: '',
                        gasto_real: '',
                        concepto: '',
                        fact_estado: '',
                        proveedor: '',
                        fact_nro: '',
                        encargado: '',
                        codigo: '',
                        nro_ot: '',
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
        res.render('gastos/add', { 
            title: 'Agregar Nuevo GASTO',
            fecha: req.body.fecha,
            monto: req.body.monto,
            exentas: req.body.exentas,
            iva_10: req.body.iva_10,
            iva_5: req.body.iva_5,
            gasto_real: req.body.gasto_real,
            concepto: req.body.concepto,
            fact_estado: req.body.fact_estado,
            proveedor: req.body.proveedor,
            fact_nro: req.body.fact_nro,
            encargado: req.body.encargado,
            codigo: req.body.codigo,
            nro_ot: req.body.nro_ot,
            usuario_insert: user
        })
    }
})

//FORMULARIO DE EDICION DE DATOS
app.get('/editar/:id', function(req, res, next){
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
                    fact_estado: rows[0].fact_estado,
                    proveedor: rows[0].proveedor,
                    fact_nro: rows[0].fact_nro,
                    encargado: rows[0].encargado,
                    codigo: rows[0].codigo,
                    nro_ot: rows[0].nro_ot,
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
            fact_estado: req.sanitize('fact_estado').escape().trim(),
            proveedor: req.sanitize('proveedor').escape().trim(),
            fact_nro: req.sanitize('fact_nro').escape().trim(),
            encargado: req.sanitize('encargado').escape().trim(),
            codigo: cod,
            nro_ot: ot,
            usuario_insert: user
            //usuario_insert: req.sanitize('usuario_insert').escape().trim()//no usamos en la pagina.
        }  
        
        req.getConnection(function(error, conn) {
            conn.query('UPDATE gastos SET ? WHERE id = ' + req.params.id, gasto, function(err, result) {
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
                        fact_estado: gasto.fact_estado,
                        proveedor: gasto.proveedor,
                        fact_nro: gasto.fact_nro,
                        encargado: gasto.encargado,
                        codigo: gasto.codigo,
                        nro_ot: gasto.nro_ot,
                        usuario: user
                    })
                } else {                
                    req.flash('success', 'Datos agregados correctamente!')
                    
                    // render to views/ot/add.ejs
                    res.render('gastos/add', {
                        title: 'Agregar nuevo Gasto',
                        fecha: '',
                        monto: '',
                        exentas: '',
                        iva_10: '',
                        iva_5: '',
                        gasto_real: '',
                        concepto: '',
                        fact_estado: '',
                        proveedor: '',
                        fact_nro: '',
                        encargado: '',
                        codigo: '',
                        nro_ot: '',
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
        
        /**
         * Using req.body.name 
         * because req.param('name') is deprecated
         */ 
        res.render('gastos/editar', { 
            title: 'Agregar Nuevo GASTO',
            fecha: req.body.fecha,
            monto: req.body.monto,
            exentas: req.body.exentas,
            iva_10: req.body.iva_10,
            iva_5: req.body.iva_5,
            gasto_real: req.body.gasto_real,
            concepto: req.body.concepto,
            fact_estado: req.body.fact_estado,
            proveedor: req.body.proveedor,
            fact_nro: req.body.fact_nro,
            encargado: req.body.encargado,
            codigo: req.body.codigo,
            nro_ot: req.body.nro_ot,
            usuario_insert: user
        })
    }
})

// DELETE USER
app.delete('/eliminar/(:id)', function(req, res, next) {
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
})

module.exports = app