
/*
16) routes/users.js is responsible for handling CRUD operations like adding, 
editing, deleting and viewing users from database. Database queries, form validation and template rendering is done here.
 */
var express = require('express')
var app = express()
var user = '';//global para ver el usuario
var userId = '';
 
// MOSTRAR LISTA DE FACTURAS
app.get('/', function(req, res, next) {
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }

    //controlamos quien se loga.
	if(user.length >0){
        //vemos los datos en la base
        req.getConnection(function(error, conn) {
            conn.query('SELECT * FROM facturas ORDER BY id DESC',function(err, rows, fields) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    res.render('factura/listar', {title: 'Listado de Facturas', data: '',usuario: user})
                } else {
                    // render views/facturas/listar.ejs
                    res.render('factura/listar', {title: 'Listado de Facturas',usuario: user, data: rows})
                }
            })
        })
    }
    else {
        // render to views/index.ejs template file
        res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});
    }
    

})
 
// SHOW ADD USER FORM
app.get('/add', function(req, res, next){    
    if(req.session.user)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        // render to views/user/add.ejs
        res.render('factura/add', {
            title: 'Cargar nueva Factura', usuario: user, fecha: '',monto: '',exentas: '',iva_10: '',iva_5: '',gasto_real: '', 
            concepto: '',tipo_fact: '', proveedor: '', detalle: '',encargado: '',codigo: '', cliente: '',imputado_a: '',imputado_a_2: ''      
        })
    }
    else {
        // render to views/index.ejs template file
        res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});
    }


})
 
// ADD NEW factura POST ACTION
app.post('/add', function(req, res, next){   
    
    /*req.assert('name', 'Nombre es requerido').notEmpty()           //Validar nombre
    req.assert('age', 'Edad es requerida').notEmpty()             //Validar edad
    req.assert('email', 'SE requiere un email valido').isEmail()  //Validar email
 */
    var errors = req.validationErrors()
    
    if( !errors ) {//Si no hay errores, entonces conitnuamos
        
        /********************************************
         * Express-validator module
         
        req.body.comment = 'a <span>comment</span>';
        req.body.username = '   a user    ';
 
        req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
        req.sanitize('username').trim(); // returns 'a user'
        ********************************************/
        var factura = {
            fecha: req.sanitize('fecha').escape().trim(),
            monto: req.sanitize('monto').escape().trim(),
            exentas: req.sanitize('exentas').escape().trim(),
            iva_10: req.sanitize('iva_10').escape().trim(),
            iva_5: req.sanitize('iva_5').escape().trim(),
            gasto_real: req.sanitize('gasto_real').escape().trim(),
            concepto: req.sanitize('concepto').escape().trim(),
            tipo_fact: req.sanitize('tipo_fact').escape().trim(),
            proveedor: req.sanitize('proveedor').escape().trim(),
            detalle: req.sanitize('detalle').escape().trim(),
            encargado: req.sanitize('encargado').escape().trim(),
            codigo: req.sanitize('codigo').escape().trim(),
            cliente: req.sanitize('cliente').escape().trim(),
            imputado_a: req.sanitize('imputado_a').escape().trim(),
            imputado_a_2: req.sanitize('imputado_a_2').escape().trim()
        }
        
        //conectamos a la base de datos
        req.getConnection(function(error, conn) {
            conn.query('INSERT INTO facturas SET ?', factura, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    
                    // render to views/factura/add.ejs
                    res.render('factura/add', {
                        title: 'Agregar Nueva Factura',
                        fecha: factura.fecha,
                        monto: factura.monto,
                        exentas: factura.exentas,
                        iva_10: factura.iva_10,
                        iva_5: factura.iva_5,
                        gasto_real: factura.gasto_real,
                        concepto: factura.concepto,
                        tipo_fact: factura.tipo_fact,
                        proveedor: factura.proveedor,
                        detalle: factura.detalle,
                        encargado: factura.encargado,
                        codigo: factura.codigo,
                        cliente: factura.cliente,
                        imputado_a: factura.imputado_a,
                        imputado_a_2: factura.imputado_a_2
                    })
                } else {                
                    req.flash('success', 'Datos agregados correctamente!')
                    
                    // render to views/factura/add.ejs
                    res.render('factura/add', {
                        title: 'Agregar nueva Factura',
                        fecha: '',
                        monto: '',
                        exentas: '',
                        iva_10: '',
                        iva_5: '',
                        gasto_real: '',
                        concepto: '',
                        tipo_fact: '',
                        proveedor: '',
                        detalle: '',
                        encargado: '',
                        codigo: '',
                        cliente: '',
                        imputado_a: '',
                        imputado_a_2: ''                 
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
        res.render('facturas/add', { 
            title: 'Agregar Nueva Factura',
            fecha: req.body.fecha,
            monto: req.body.monto,
            exentas: req.body.exentas,
            iva_10: req.body.iva_10,
            iva_5: req.body.iva_5,
            gasto_real: req.body.gasto_real,
            concepto: req.body.concepto,
            tipo_fact: req.body.tipo_fact,
            proveedor: req.body.proveedor,
            detalle: req.body.detalle,
            encargado: req.body.encargado,
            codigo: req.body.codigo,
            cliente: req.body.cliente,
            imputado_a: req.body.imputado_a,
            imputado_a_2: req.body.imputado_a_2
        })
    }
})
 
// SHOW EDIT USER FORM
app.get('/editar/:id', function(req, res, next){
    req.getConnection(function(error, conn) {
        conn.query('SELECT * FROM facturas WHERE id = ' + req.params.id, function(err, rows, fields) {
            if(err) throw err
            
            // if user not found
            if (rows.length <= 0) {
                req.flash('error', 'Factura con id = ' + req.params.id + ' no encontrada')
                res.redirect('/factura')
            }
            else { // Si existe la factura
                // render to views/factura/edit.ejs template file
                res.render('factura/editar', {
                    title: 'Editar Factura', 
                    //data: rows[0],
                    id: rows[0].id,
                    fecha: rows[0].fecha,
                    monto: rows[0].monto,
                    exentas: rows[0].exentas,
                    iva_10: rows[0].iva_10,
                    iva_5: rows[0].iva_5,
                    gasto_real: rows[0].gasto_real,
                    concepto: rows[0].concepto,
                    tipo_fact: rows[0].tipo_fact,
                    proveedor: rows[0].proveedor,
                    detalle: rows[0].detalle,
                    encargado: rows[0].encargado,
                    codigo: rows[0].codigo,
                    cliente: rows[0].cliente,
                    imputado_a: rows[0].imputado_a,
                    imputado_a_2: rows[0].imputado_a_2
                })
            }            
        })
    })
})
 
// EDIT USER POST ACTION
app.put('/editar/:id', function(req, res, next) {
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
        var factura = {
            fecha: req.sanitize('fecha').escape().trim(),
            monto: req.sanitize('monto').escape().trim(),
            exentas: req.sanitize('exentas').escape().trim(),
            iva_10: req.sanitize('iva_10').escape().trim(),
            iva_5: req.sanitize('iva_5').escape().trim(),
            gasto_real: req.sanitize('gasto_real').escape().trim(),
            concepto: req.sanitize('concepto').escape().trim(),
            tipo_fact: req.sanitize('tipo_fact').escape().trim(),
            proveedor: req.sanitize('proveedor').escape().trim(),
            detalle: req.sanitize('detalle').escape().trim(),
            encargado: req.sanitize('encargado').escape().trim(),
            codigo: req.sanitize('codigo').escape().trim(),
            cliente: req.sanitize('cliente').escape().trim(),
            imputado_a: req.sanitize('imputado_a').escape().trim(),
            imputado_a_2: req.sanitize('imputado_a_2').escape().trim()
        }
        
        req.getConnection(function(error, conn) {
            conn.query('UPDATE facturas SET ? WHERE id = ' + req.params.id, factura, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    
                    // render to views/user/add.ejs
                    res.render('factura/editar', {
                        title: 'Editar Factura',
                        id: req.params.id, 
                        fecha: req.body.fecha,
                        monto: req.body.monto, 
                        exentas: req.body.exentas, 
                        iva_10: req.body.iva_10,
                        iva_5: req.body.iva_5,
                        gasto_real: req.body.gasto_real,
                        concepto: req.body.concepto,
                        tipo_fact: req.body.tipo_fact,
                        proveedor: req.body.proveedor,
                        detalle: req.body.detalle,
                        encargado: req.body.encargado,
                        codigo: req.body.codigo,
                        cliente: req.body.cliente,
                        imputado_a: req.body.imputado_a,
                        imputado_a_2: req.body.imputado_a_2
                    })
                } else {
                    req.flash('success', 'Factura actualizada exitosamente!')
                    
                    // render to views/user/add.ejs
                    res.render('factura/editar', {
                        title: 'Editar Factura',
                        id: req.params.id, 
                        fecha: req.body.fecha,
                        monto: req.body.monto,
                        exentas: req.body.exentas, 
                        iva_10: req.body.iva_10,
                        iva_5: req.body.iva_5,
                        gasto_real: req.body.gasto_real,
                        concepto: req.body.concepto,
                        tipo_fact: req.body.tipo_fact,
                        proveedor: req.body.proveedor,
                        detalle: req.body.detalle,
                        encargado: req.body.encargado,
                        codigo: req.body.codigo,
                        cliente: req.body.cliente,
                        imputado_a: req.body.imputado_a,
                        imputado_a_2: req.body.imputado_a_2
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
        res.render('factura/editar', { 
            title: 'Editar Factura',            
            id: req.params.id, 
            fecha: req.body.fecha,
            monto: req.body.monto,
            exentas: req.body.exentas, 
            iva_10: req.body.iva_10,
            iva_5: req.body.iva_5,
            gasto_real: req.body.gasto_real,
            concepto: req.body.concepto,
            tipo_fact: req.body.tipo_fact,
            proveedor: req.body.proveedor,
            detalle: req.body.detalle,
            encargado: req.body.encargado,
            codigo: req.body.codigo,
            cliente: req.body.cliente,
            imputado_a: req.body.imputado_a,
            imputado_a_2: req.body.imputado_a_2
        })
    }
})
 
// DELETE USER
app.delete('/eliminar/(:id)', function(req, res, next) {
    var factura = { id: req.params.id }
    
    req.getConnection(function(error, conn) {
        conn.query('DELETE FROM facturas WHERE id = ' + req.params.id, factura, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                // redirect to users list page
                res.redirect('/facturas')
            } else {
                req.flash('success', 'factura eliminada exitosamente! id = ' + req.params.id)
                // redirect to users list page
                res.redirect('/facturas')
            }
        })
    })
})
 
module.exports = app