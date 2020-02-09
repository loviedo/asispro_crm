var express = require('express');
var app = express();
var path = require('path');//para las direcciones locales
var mysql = require('mysql');//instaciamos mysql


 
/**
 * middleware que provee API consistente para conns mysql mientras hacemos el ciclo request/response 
 */ 
var myConnection  = require('express-myconnection');

/**
 * Guardamos las credenciales de bbdd en ./config/config.js
 * CArgamos el archivo/modulo y sus valores
 */ 
var config = require('./config/config.js')
var dbOptions = {
    host:      config.database.host,
    user:       config.database.user,
    password: config.database.password,
    port:       config.database.port, 
    database: config.database.db
}
/**
 * 3 strategies can be used
 * single: Creates single database connection which is never closed.
 * pool: Creates pool of connections. Connection is auto release when response ends.
 * request: Creates new connection per new request. Connection is auto close when response ends.
 */ 
app.use(myConnection(mysql, dbOptions, 'pool'));
 
//setting up the templating view engine
app.set('view engine', 'ejs');
 
/**
 * import routes/index.js
 * import routes/users.js
 */ 
var index = require('./routes/index');
var users = require('./routes/users');
var facturas = require('./routes/facturas');
var ots = require('./routes/ot');
var gastos = require('./routes/gastos');
var prov = require('./routes/proveedor');
var rrhh = require('./routes/rrhh');
var clientes = require('./routes/clientes');
var ingresos = require('./routes/ingresos');
var planmano = require('./routes/mano');
var manoobra = require('./routes/manoobra');
var cajas = require('./routes/cajas');
 
/**
 * Express Validator Middleware for Form Validation
 */ 
var expressValidator = require('express-validator');
app.use(expressValidator());
 
 
/**
 * body-parser module is used to read HTTP POST data
 * it's an express middleware that reads form's input 
 * and store it as javascript object
 */ 
var bodyParser = require('body-parser');
/**
 * bodyParser.urlencoded() parses the text as URL encoded data 
 * (which is how browsers tend to send form data from regular forms set to POST) 
 * and exposes the resulting object (containing the keys and values) on req.body.
 */ 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
 
 
/**
 * This module let us use HTTP verbs such as PUT or DELETE 
 * in places where they are not supported
 */ 
var methodOverride = require('method-override');
 
/**
 * using custom logic to override method
 * 
 * there are other ways of overriding as well
 * like using header & using query value
 */ 
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}));
 
/**
 * This module shows flash messages
 * generally used to show success or error messages
 * 
 * Flash messages are stored in session
 * So, we also have to install and use 
 * cookie-parser & session modules
 */ 
var flash = require('express-flash')
var cookieParser = require('cookie-parser');
/*modulos de sesion */
var session = require('express-session');
app.use(cookieParser('keyboard cat'))
app.use(session({ 
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    /*cookie: { maxAge: 60000 }*//* DEBUG */
    cookie: { expires: false }/* con esto indicamos que la sesion dura solamente mientras este abierta la ventana del browser */
}))
app.use(flash())

//cargamos los lugares en donde tenemos los archivos de vistas del proyecto
app.use('/', index);//el home
app.use('/users', users);//gestión de usuarios
app.use('/facturas', facturas);//gestion de facturas
app.use('/ot', ots);//gestion de OT
app.use('/gastos', gastos);//gestion de GASTOS
app.use('/proveedor', prov);//gestion de proveedores
app.use('/rrhh', rrhh);//gestion de proveedores
app.use('/clientes', clientes);//gestion de clientes
app.use('/ingresos', ingresos);//gestion de ingresos
app.use('/mano', planmano);//gestion de planificacion laboral
app.use('/manoobra', manoobra);//gestion de mano de obra, pago de trabajos
app.use('/cajas', cajas);//gestion de mano de obra, pago de trabajos

/*
app.get('/login', index);//pagina de login usuario
app.get('/signup', users);//pagina de alta usuario
*/

//hacemos que la carpeta public sea accesible
app.use("/public", express.static(path.join(__dirname, 'public')));
 
app.listen(4000, function(){
    console.log('Server iniciado en el puerto 4000: http://127.0.0.1:4000')
})