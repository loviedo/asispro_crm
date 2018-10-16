
/*
16) routes/users.js is responsible for handling CRUD operations like adding, 
editing, deleting and viewing users from database. Database queries, form validation and template rendering is done here.
 */
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
            conn.query('SELECT * FROM ot ORDER BY id DESC',function(err, rows) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    res.render('ot/listar', {title: 'Listado de OTs', data: '',usuario: user})
                } else {
                    // render views/ot/listar.ejs
                    res.render('ot/listar', {title: 'Listado de Facturas',usuario: user, data: rows})
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
        res.render('ot/add', {
            title: 'Cargar nueva OT', ot_nro: '', fec_emision: '',fec_ini_ejecucion: '',fec_fin_ejecucion: '',fact_nro: '',recibo_nro: '',remision_nro: '', 
            fact_tipo: '',fact_estado: '',cliente: '', obra: '', descripcion: '', usuario_insert: user, usuario: user})
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

        //mysql acepta solos YYYY-MM-DD
        var date1 = new Date(req.sanitize('fec_emision').escape().trim()).toDateString("YYYY-MM-DD");
        var date2 = new Date(req.sanitize('fec_ini_ejecucion').escape().trim()).toDateString("YYYY-MM-DD");
        var date3 = new Date(req.sanitize('fec_fin_ejecucion').escape().trim()).toDateString("YYYY-MM-DD");
        var fact_nro = Number(req.sanitize('fact_nro').escape().trim());
        var recibo_nro = Number(req.sanitize('recibo_nro').escape().trim());
        var remision_nro = Number(req.sanitize('remision_nro').escape().trim());

        var ot = {
            ot_nro: req.sanitize('ot_nro').escape().trim(),
            fec_emision: formatear_fecha_yyyymmdd(date1),
            fec_ini_ejecucion: formatear_fecha_yyyymmdd(date2),
            fec_fin_ejecucion: formatear_fecha_yyyymmdd(date3),
            fact_nro: fact_nro,
            recibo_nro: recibo_nro,
            remision_nro: remision_nro,
            fact_tipo: req.sanitize('fact_tipo').escape().trim(),
            fact_estado: req.sanitize('fact_estado').escape().trim(),
            cliente: req.sanitize('cliente').escape().trim(),
            obra: req.sanitize('obra').escape().trim(),
            descripcion: req.sanitize('descripcion').escape().trim(),
            usuario_insert: user
            //usuario_insert: req.sanitize('usuario_insert').escape().trim()//no usamos en la pagina.
        }   
        
        //conectamos a la base de datos
        req.getConnection(function(error, conn) {
            conn.query('INSERT INTO ot SET ?', ot, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    
                    // render to views/factura/add.ejs
                    res.render('ot/add', {
                        title: 'Agregar Nueva OT',
                        ot_nro: ot.ot_nro,
                        fec_emision: ot.fec_emision,
                        fec_ini_ejecucion: ot.fec_ini_ejecucion,
                        fec_fin_ejecucion: ot.fec_fin_ejecucion,
                        fact_nro: ot.fact_nro,
                        recibo_nro: ot.recibo_nro,
                        remision_nro: ot.remision_nro,
                        fact_tipo: ot.fact_tipo,
                        fact_estado: ot.fact_estado,
                        cliente: ot.cliente,
                        obra: ot.obra,
                        descripcion: ot.descripcion,
                        usuario: user
                    })
                } else {                
                    req.flash('success', 'Datos agregados correctamente!')
                    
                    // render to views/ot/add.ejs
                    res.render('ot/add', {
                        title: 'Agregar nueva Factura',
                        ot_nro: '',
                        fec_emision: '',
                        fec_ini_ejecucion: '',
                        fec_fin_ejecucion: '',
                        fact_nro: '',
                        recibo_nro: '',
                        remision_nro: '',
                        fact_tipo: '',
                        fact_estado: '',
                        cliente: '',
                        obra: '',
                        descripcion: '',
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
        res.render('ot/add', { 
            title: 'Agregar Nueva OT',
            ot_nro: req.body.ot_nro,
            fec_emision: req.body.fec_emision,
            fec_ini_ejecucion: req.body.fec_ini_ejecucion,
            fec_fin_ejecucion: req.body.fec_fin_ejecucion,
            fact_nro: req.body.fact_nro,
            recibo_nro: req.body.recibo_nro,
            remision_nro: req.body.remision_nro,
            fact_tipo: req.body.fact_tipo,
            fact_estado: req.body.fact_estado,
            remision_nro: req.body.remision_nro,
            cliente: req.body.cliente,
            obra: req.body.obra,
            descripcion: req.body.descripcion,
            usuario_insert: user
        })
    }
})
 
// SHOW EDIT USER FORM
app.get('/editar/:id', function(req, res, next){
    req.getConnection(function(error, conn) {
        conn.query('SELECT * FROM ot WHERE id = ' + req.params.id, function(err, rows, fields) {
            if(err) throw err
            
            // if user not found
            if (rows.length <= 0) {
                req.flash('error', 'OT con id = ' + req.params.id + ' no encontrada')
                res.redirect('/ot')
            }
            else { // Si existe la factura
                // render to views/factura/edit.ejs template file

                var date1 = rows[0].fec_emision;
                var date2 = rows[0].fec_ini_ejecucion;
                var date3 = rows[0].fec_fin_ejecucion;

                res.render('ot/editar', {
                    title: 'Editar OT', 
                    //data: rows[0],
                    id: rows[0].id,
                    ot_nro: rows[0].ot_nro,
                    fec_emision: formatear_fecha_yyyymmdd(date1),
                    fec_ini_ejecucion: formatear_fecha_yyyymmdd(date2),
                    fec_fin_ejecucion: formatear_fecha_yyyymmdd(date3),
                    fact_nro: rows[0].fact_nro,
                    recibo_nro: rows[0].recibo_nro,
                    remision_nro: rows[0].remision_nro,
                    fact_tipo: rows[0].fact_tipo,
                    fact_estado: rows[0].fact_estado,
                    cliente: rows[0].cliente,
                    obra: rows[0].obra,
                    descripcion: rows[0].descripcion,
                    usuario_insert: user,
                    usuario: user
                })
            }            
        })
    })
})
 
// EDIT USER POST ACTION
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
        //console.log(req.sanitize('fec_emision').escape().trim());//debug
        var date1 = req.sanitize('fec_emision').escape().trim();
        var date2 = req.sanitize('fec_ini_ejecucion').escape().trim();
        var date3 = req.sanitize('fec_fin_ejecucion').escape().trim();

        var fact_nro = Number(req.sanitize('fact_nro').escape().trim());
        var recibo_nro = Number(req.sanitize('recibo_nro').escape().trim());
        var remision_nro = Number(req.sanitize('remision_nro').escape().trim());

       var ot = {
            ot_nro: req.sanitize('ot_nro').escape().trim(),
            fec_emision: formatear_fecha_yyyymmdd(date1),
            fec_ini_ejecucion: formatear_fecha_yyyymmdd(date2),
            fec_fin_ejecucion: formatear_fecha_yyyymmdd(date3),
            fact_nro: fact_nro,
            recibo_nro: recibo_nro,
            remision_nro: remision_nro,
            fact_tipo: req.sanitize('fact_tipo').escape().trim(),
            fact_estado: req.sanitize('fact_estado').escape().trim(),
            cliente: req.sanitize('cliente').escape().trim(),
            obra: req.sanitize('obra').escape().trim(),
            descripcion: req.sanitize('descripcion').escape().trim(),
            usuario_insert: user
            //usuario_insert: req.sanitize('usuario_insert').escape().trim()//no usamos en la pagina.
        }
        
        req.getConnection(function(error, conn) {
            conn.query('UPDATE ot SET ? WHERE id = ' + req.params.id, ot, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    
                    // render to views/user/add.ejs
                    res.render('ot/editar', {
                        title: 'Editar OT',
                        id: req.params.id, 
                        ot_nro: req.body.ot_nro,
                        fec_emision: req.body.fec_emision, 
                        fec_ini_ejecucion: req.body.fec_ini_ejecucion, 
                        fec_fin_ejecucion: req.body.fec_fin_ejecucion,
                        fact_nro: req.body.fact_nro,
                        recibo_nro: req.body.recibo_nro,
                        remision_nro: req.body.remision_nro,
                        fact_tipo: req.body.fact_tipo,
                        fact_estado: req.body.fact_estado,
                        cliente: req.body.cliente,
                        obra: req.body.obra,
                        descripcion: req.body.descripcion,
                        usuario_insert: user,
                        usuario: user
                    })
                } else {
                    req.flash('success', 'OT actualizada exitosamente!')
                    
                    // render ot/editar
                    res.render('ot/editar', {
                        title: 'Editar OT',
                        id: req.params.id, 
                        ot_nro: req.body.ot_nro,
                        fec_emision: req.body.fec_emision,
                        fec_ini_ejecucion: req.body.fec_ini_ejecucion, 
                        fec_fin_ejecucion: req.body.fec_fin_ejecucion,
                        fact_nro: req.body.fact_nro,
                        recibo_nro: req.body.recibo_nro,
                        remision_nro: req.body.remision_nro,
                        fact_tipo: req.body.fact_tipo,
                        fact_estado: req.body.fact_estado,
                        cliente: req.body.cliente,
                        obra: req.body.obra,
                        descripcion:req.body.descripcion,
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
        
        /**
         * Using req.body.name 
         * because req.param('name') is deprecated
         */ 
        res.render('ot/editar', { 
            title: 'Editar OT',            
            ot_nro: req.body.ot_nro,
            fec_emision: req.body.fec_emision,
            fec_ini_ejecucion: req.body.fec_ini_ejecucion,
            fec_fin_ejecucion: req.body.fec_fin_ejecucion,
            fact_nro: req.body.fact_nro,
            recibo_nro: req.body.recibo_nro,
            remision_nro: req.body.remision_nro,
            fact_tipo: req.body.fact_tipo,
            fact_estado: req.body.fact_estado,
            remision_nro: req.body.remision_nro,
            cliente: req.body.cliente,
            obra: req.body.obra,
            descripcion: req.body.descripcion,
            usuario_insert: user,
            usuario: user
        })
    }
})
 
// DELETE USER
app.delete('/eliminar/(:id)', function(req, res, next) {
    var ot = { id: req.params.id }
    
    req.getConnection(function(error, conn) {
        conn.query('DELETE FROM ot WHERE id = ' + req.params.id, ot, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                //redireccionar al listado de OTs
                res.redirect('/ot')
            } else {
                req.flash('success', 'Orden de Trabajo eliminado exitosamente! ID = ' + req.params.id)
                //redireccionar al listado de OTs
                res.redirect('/ot')

                //insertar log de uso de sistema en caso de suceso de insercion
            }
        })
    })
})
 
module.exports = app