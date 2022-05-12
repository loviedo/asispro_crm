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

//recibimos los datos de cabecera de cajas, y el detalle de facturas que se quieren observar.
function genera_detalle_caja(user, rows, rows2, rows3){
    var workbook = new excel.Workbook();
    var worksheet = workbook.addWorksheet('DETALLE CAJAS');
    var worksheet2 = workbook.addWorksheet('RESUMEN CAJAS');
    //
    const style = workbook.createStyle({
    font: {color: '#000000',size: 12},
    numberFormat: '#,##0; (#,##0); -'
    });

    //prueba estilo 2
    const style1 = workbook.createStyle({
        font: {bold: true, color: '#000000',fgColor:'#EF820D',size: 12},
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
    worksheet.cell(1,3).string('ID').style(style1);
    worksheet.cell(2,3).string('FECHA').style(style1);
    worksheet.cell(3,3).string('SALIDA').style(style1);
    worksheet.cell(4,3).string('RESPONSABLE').style(style1);
    worksheet.cell(5,3).string('CONCEPTO').style(style1);
    worksheet.cell(6,3).string('SALDO').style(style1);
    worksheet.cell(7,3).string('GASTO').style(style1);
    worksheet.cell(8,3).string('ESTADO').style(style1);

    /* DATOS CABECERA */
    worksheet.cell(1,4).number(Number(rows[0].id)).style(style);
    worksheet.cell(2,4).date(formatear_fecha_yyyymmdd(rows[0].fecha)).style({numberFormat: 'dd/mm/yyyy'});//ver formato fecha
    worksheet.cell(3,4).number(Number(rows[0].salida)).style(style);
    worksheet.cell(4,4).string(String(rows[0].responsable)).style(style);
    worksheet.cell(5,4).string(String(rows[0].concepto)).style(style);
    worksheet.cell(6,4).number(Number(rows[0].saldo)).style(style);
    worksheet.cell(7,4).number(Number(rows[0].gasto)).style(style);
    worksheet.cell(8,4).string(String(rows[0].estado)).style(style);

    /* DATOS DETALLE */
    worksheet.cell(11,2).string('DETALLE DE GASTOS').style(style1);
    worksheet.cell(12,2).string('ID').style(style1);
    worksheet.cell(12,3).string('FECHA').style(style1);
    worksheet.cell(12,4).string('MONTO').style(style1);
    worksheet.cell(12,5).string('EXENTAS').style(style1);
    worksheet.cell(12,6).string('IVA 10%').style(style1);
    worksheet.cell(12,7).string('IVA 5%').style(style1);
    worksheet.cell(12,8).string('GASTO REAL').style(style1);
    worksheet.cell(12,9).string('CONCEPTO').style(style1);
    worksheet.cell(12,10).string('CONDICION').style(style1);
    worksheet.cell(12,11).string('PROVEEDOR').style(style1);
    worksheet.cell(12,12).string('RUC').style(style1);
    worksheet.cell(12,13).string('NRO_FACTURA').style(style1);
    worksheet.cell(12,14).string('TIMBRADO NRO').style(style1);//agregado el 15/07/2020
    worksheet.cell(12,15).string('FECHA FIN TIMBRADO').style(style1);
    worksheet.cell(12,16).string('ENCARGADO').style(style1);//agregado 09/03/2020
    worksheet.cell(12,17).string('CODIGO').style(style1);//agregado 09/03/2020
    worksheet.cell(12,18).string('NRO OT').style(style1);//agregado 09/03/2020
    worksheet.cell(12,19).string('CLIENTE').style(style1);//agregado 09/03/2020
    worksheet.cell(12,20).string('OBRA').style(style1);//agregado 09/03/2020
    worksheet.cell(12,21).string('IMPUTADO').style(style1);//agregado 14/07/2020
    worksheet.cell(12,22).string('ORIGEN PAGO').style(style1);//agregado 14/07/2020
    worksheet.cell(12,23).string('TIPO').style(style1);//agregado 14/07/202
    if (user == "admin" || user == "josorio")
    {   worksheet.cell(12,24).string('ID_CAJA').style(style1);
        worksheet.cell(12,25).string('CONCEPTO').style(style1);
    }

    //luego los datos
    var i = 1;
    rows2.forEach(function(row) {

        worksheet.cell(i+12,2).number(Number(row.id.toString().replace(",","."))).style(style);
        worksheet.cell(i+12,3).date(formatear_fecha_yyyymmdd(row.fecha)).style({numberFormat: 'dd/mm/yyyy'});//codigo del empleado
        worksheet.cell(i+12,4).number(Number(row.monto.toString().replace(",","."))).style(style);
        worksheet.cell(i+12,5).number(Number(row.exentas.toString().replace(",","."))).style(style);
        worksheet.cell(i+12,6).number(Number(row.iva_10.toString().replace(",","."))).style(style);
        worksheet.cell(i+12,7).number(Number(row.iva_5.toString().replace(",","."))).style(style);
        worksheet.cell(i+12,8).number(Number(row.gasto_real.toString().replace(",","."))).style(style);
        worksheet.cell(i+12,9).string(String(row.concepto)).style(style);
        worksheet.cell(i+12,10).string(String(row.fact_condicion)).style(style); //condicion de la factura
        worksheet.cell(i+12,11).string(String(row.proveedor)).style(style); //proveedor
        worksheet.cell(i+12,12).string(String(row.ruc)).style(style); //ruc proveedor
        worksheet.cell(i+12,13).string(String(row.fact_nro)).style(style); //nro de factura
        worksheet.cell(i+12,14).string(String(row.tim_nro)).style(style); //nro de timbrado proveedor
        worksheet.cell(i+12,15).string(String(row.fecha_fin_tim)).style(style); //fecha fin de timbrado
        worksheet.cell(i+12,16).string(String(row.encargado)).style(style);//agregado 09/03/2020
        worksheet.cell(i+12,17).number(Number(row.codigo)).style(style);//agregado 09/03/2020
        worksheet.cell(i+12,18).number(Number(row.nro_ot)).style(style);//agregado 09/03/2020
        worksheet.cell(i+12,19).string(String(row.cliente)).style(style);//agregado 09/03/2020
        worksheet.cell(i+12,20).string(String(row.obra)).style(style);//agregado 09/03/2020
        worksheet.cell(i+12,21).string(String(row.imputado)).style(style);//agregado 14/07/2020 --
        worksheet.cell(i+12,22).string(String(row.origen_pago)).style(style);//agregado 14/07/2020 --
        worksheet.cell(i+12,23).string(String(row.tipo)).style(style);//agregado 14/07/2020 --
        if (user == "admin" || user == "josorio")
        {   worksheet.cell(i+12,24).string(String(row.id_caja)).style(style);
            worksheet.cell(i+12,25).string(String(row.concepto)).style(style);
        }
        /*worksheet.cell(i+10,9).number(Number(rows2.ips.toString().replace(",","."))).style(style);
        worksheet.cell(i+10,10).number(Number(rows2.saldo_favor.toString().replace(",","."))).style(style);*/

        //worksheet.cell(i+1,2).string(String(row.)).style(style);//debug
        i=i+1;
        //console.log(row.descripcion);//debug
    });
    //agregamos TOTAL
    worksheet.cell(i+1+12,2).string('TOTAL MONTO').style(style1);//agregado 09/03/2020
    worksheet.cell(i+1+12,4).formula('=SUM(D13:D'+(i+12)+')').style(style);//asumimos que si o si esta cargado el gasto
    worksheet.cell(i+1+12,5).formula('=SUM(E13:E'+(i+12)+')').style(style);//asumimos que si o si esta cargado exentas
    worksheet.cell(i+1+12,6).formula('=SUM(F13:F'+(i+12)+')').style(style);//asumimos que si o si esta cargado algo en iva10
    worksheet.cell(i+1+12,7).formula('=SUM(G13:G'+(i+12)+')').style(style);//asumimos que si o si esta cargado algo en iva5
    worksheet.cell(i+1+12,8).formula('=SUM(H13:H'+(i+12)+')').style(style);//asumimos que si o si esta cargado algo en gasto real

    /* SIGUIENTE HOJA / CARGAMOS EL RESUMEN DE LAS CAJAS */
    /* RESUMEN DE LAS CAJAS */
    worksheet.cell(2,19).string('RESUMEN SUBCAJAS').style(style1);
    worksheet.cell(3,19).string('ID').style(style1);
    worksheet.cell(3,20).string('FECHA').style(style1);
    worksheet.cell(3,21).string('SALIDA').style(style1);
    worksheet.cell(3,22).string('RESPONSABLE').style(style1);
    worksheet.cell(3,23).string('CONCEPTO').style(style1);
    worksheet.cell(3,24).string('SALDO').style(style1);
    worksheet.cell(3,25).string('GASTO').style(style1);
    worksheet.cell(3,26).string('ESTADO (ABIERTA/CERRADA)').style(style1);

    /* LISTADO DE CAJAS */
    var i = 1;
    var total_gasto = 0;
    var total_saldo = 0;
    var total_salida = 0;

    rows3.forEach(function(row) {

        worksheet.cell(3+i,19).number(Number(row.id)).style(style);
        worksheet.cell(3+i,20).date(formatear_fecha_yyyymmdd(row.fecha)).style({numberFormat: 'dd/mm/yyyy'});
        worksheet.cell(3+i,21).number(Number(row.salida.toString().replace(",","."))).style(style);
        worksheet.cell(3+i,22).string(String(row.responsable)).style(style);
        worksheet.cell(3+i,23).string(String(row.concepto)).style(style);
        worksheet.cell(3+i,24).number(Number(row.saldo.toString().replace(",","."))).style(style);
        worksheet.cell(3+i,25).number(Number(row.gasto.toString().replace(",","."))).style(style);
        worksheet.cell(3+i,26).string(String(row.estado)).style(style);

        //sumamos
        total_saldo = total_saldo + row.saldo;
        total_gasto = total_gasto + row.gasto;
        total_salida = total_salida + row.salida;
        i=i+1;
        //console.log(row.descripcion);//debug
    });
    //al final colocamos los totalizadores
    worksheet.cell(3+i,21).number(Number(total_salida)).style(style1);
    worksheet.cell(3+i,24).number(Number(total_saldo)).style(style1);
    worksheet.cell(3+i,25).number(Number(total_gasto)).style(style1);
    /* FIN CABECERA */

    workbook.write('DETALLE_CAJA_ID'+ rows[0].id +'.xlsx');
}

//recibimos los datos de .
function genera_total_gastos(rows,rows1){
    
    var workbook = new excel.Workbook();
    var worksheet = workbook.addWorksheet('RESUMEN CAJAS');
    var worksheet2 = workbook.addWorksheet('DETALLE GASTOS');
    //
    const style = workbook.createStyle({font: {color: '#000000',size: 12},numberFormat: '#,##0; (#,##0); -'});

    //prueba estilo 2
    const style1 = workbook.createStyle({font: {bold: true, color: '#000000',fgColor:'#EF820D',size: 12}, numberFormat: '#,##0; (#,##0); -'});

    const bgStyle = workbook.createStyle({
        fill: {type: 'pattern',patternType: 'solid',
          //bgColor: '#EF820D',
          //fgColor: '#EF820D', //color fondo de la celda.
        }
    });

    //dibujamos el excel
    /* LISTADO DE CAJAS */
    var i = 1;
    var total_gasto = 0;
    var total_saldo = 0;
    var total_salida = 0;

    /* RESUMEN DE LAS CAJAS */
    worksheet.cell(2,3).string('RESUMEN CAJAS').style(style1);
    worksheet.cell(4,3).string('ID CAJA').style(style1);
    worksheet.cell(4,4).string('ID CAJA PADRE').style(style1);
    worksheet.cell(4,5).string('FECHA').style(style1);
    worksheet.cell(4,6).string('SALIDA').style(style1);
    worksheet.cell(4,7).string('RESPONSABLE').style(style1);
    worksheet.cell(4,8).string('CONCEPTO').style(style1);
    worksheet.cell(4,9).string('SALDO').style(style1);
    worksheet.cell(4,10).string('GASTO').style(style1);
    worksheet.cell(4,11).string('ESTADO (ABIERTA/CERRADA)').style(style1);

    rows1.forEach(function(row) {
        worksheet.cell(5+i,3).number(Number(row.id)).style(style);
        worksheet.cell(5+i,4).number(Number(row.id_caja)).style(style);
        worksheet.cell(5+i,5).date(formatear_fecha_yyyymmdd(row.fecha)).style({numberFormat: 'dd/mm/yyyy'});
        worksheet.cell(5+i,6).number(Number(row.salida.toString().replace(",","."))).style(style);
        worksheet.cell(5+i,7).string(String(row.responsable)).style(style);
        worksheet.cell(5+i,8).string(String(row.concepto)).style(style);
        worksheet.cell(5+i,9).number(Number(row.saldo.toString().replace(",","."))).style(style);
        worksheet.cell(5+i,10).number(Number(row.gasto.toString().replace(",","."))).style(style);
        worksheet.cell(5+i,11).string(String(row.estado)).style(style);

        //totalizamos
        total_saldo = total_saldo + row.saldo;
        total_gasto = total_gasto + row.gasto;
        total_salida = total_salida + row.salida;
        i=i+1;
        //console.log(row.descripcion);//debug
    });
    //al final colocamos los totalizadores
    worksheet.cell(5+i+1,3).string('TOTALES').style(style1);
    worksheet.cell(5+i+1,6).number(Number(total_salida)).style(style1);
    worksheet.cell(5+i+1,9).number(Number(total_saldo)).style(style1);
    worksheet.cell(5+i+1,10).number(Number(total_gasto)).style(style1);


    /* DATOS DETALLE */    
    worksheet2.cell(2,2).string('DETALLE DE GASTOS POR CAJA').style(style1);
    worksheet2.cell(4,2).string('ID CAJA').style(style1);
    worksheet2.cell(4,3).string('ID GASTO').style(style1);
    worksheet2.cell(4,4).string('FECHA').style(style1);
    worksheet2.cell(4,5).string('MONTO').style(style1);
    worksheet2.cell(4,6).string('EXENTAS').style(style1);
    worksheet2.cell(4,7).string('IVA 10%').style(style1);
    worksheet2.cell(4,8).string('IVA 5%').style(style1);
    worksheet2.cell(4,9).string('GASTO REAL').style(style1);
    worksheet2.cell(4,10).string('CONCEPTO').style(style1);
    worksheet2.cell(4,11).string('CONDICION').style(style1);
    worksheet2.cell(4,12).string('PROVEEDOR').style(style1);
    worksheet2.cell(4,13).string('RUC').style(style1);
    worksheet2.cell(4,14).string('NRO_FACTURA').style(style1);
    worksheet2.cell(4,15).string('TIMBRADO NRO').style(style1);//agregado el 15/07/2020
    worksheet2.cell(4,16).string('FECHA FIN TIMBRADO').style(style1);
    worksheet2.cell(4,17).string('ENCARGADO').style(style1);//agregado 09/03/2020
    worksheet2.cell(4,18).string('CODIGO').style(style1);//agregado 09/03/2020
    worksheet2.cell(4,19).string('NRO OT').style(style1);//agregado 09/03/2020
    worksheet2.cell(4,20).string('CLIENTE').style(style1);//agregado 09/03/2020
    worksheet2.cell(4,21).string('OBRA').style(style1);//agregado 09/03/2020
    worksheet2.cell(4,22).string('IMPUTADO').style(style1);//agregado 14/07/2020
    worksheet2.cell(4,23).string('ORIGEN PAGO').style(style1);//agregado 14/07/2020
    worksheet2.cell(4,24).string('TIPO').style(style1);//agregado 14/07/202
    if (user == "admin" || user == "josorio")
    {   worksheet2.cell(4,26).string('CONCEPTO').style(style1);}

    //luego los datos de los gastos
    i = 1;
    rows.forEach(function(row) {

        worksheet2.cell(i+4,2).number(Number(row.id_caja.toString().replace(",","."))).style(style);//agregamos id caja 26/04/2021
        worksheet2.cell(i+4,3).number(Number(row.id.toString().replace(",","."))).style(style);
        worksheet2.cell(i+4,4).date(formatear_fecha_yyyymmdd(row.fecha)).style({numberFormat: 'dd/mm/yyyy'});//codigo del empleado
        worksheet2.cell(i+4,5).number(Number(row.monto.toString().replace(",","."))).style(style);
        worksheet2.cell(i+4,6).number(Number(row.exentas.toString().replace(",","."))).style(style);
        worksheet2.cell(i+4,7).number(Number(row.iva_10.toString().replace(",","."))).style(style);
        worksheet2.cell(i+4,8).number(Number(row.iva_5.toString().replace(",","."))).style(style);
        worksheet2.cell(i+4,9).number(Number(row.gasto_real.toString().replace(",","."))).style(style);
        worksheet2.cell(i+4,10).string(String(row.concepto)).style(style);
        worksheet2.cell(i+4,11).string(String(row.fact_condicion)).style(style); //condicion de la factura
        worksheet2.cell(i+4,12).string(String(row.proveedor)).style(style); //proveedor
        worksheet2.cell(i+4,13).string(String(row.ruc)).style(style); //ruc proveedor
        worksheet2.cell(i+4,14).string(String(row.fact_nro)).style(style); //nro de factura
        worksheet2.cell(i+4,15).string(String(row.tim_nro)).style(style); //nro de timbrado proveedor
        worksheet2.cell(i+4,16).date(formatear_fecha_yyyymmdd(row.fecha_fin_tim)).style({numberFormat: 'dd/mm/yyyy'});//fecha fin de timbrado
        worksheet2.cell(i+4,17).string(String(row.encargado)).style(style);//agregado 09/03/2020
        worksheet2.cell(i+4,18).number(Number(row.codigo)).style(style);//agregado 09/03/2020
        worksheet2.cell(i+4,19).number(Number(row.nro_ot)).style(style);//agregado 09/03/2020
        worksheet2.cell(i+4,20).string(String(row.cliente)).style(style);//agregado 09/03/2020
        worksheet2.cell(i+4,21).string(String(row.obra)).style(style);//agregado 09/03/2020
        worksheet2.cell(i+4,22).string(String(row.imputado)).style(style);//agregado 14/07/2020 --
        worksheet2.cell(i+4,23).string(String(row.origen_pago)).style(style);//agregado 14/07/2020 --
        worksheet2.cell(i+4,24).string(String(row.tipo)).style(style);//agregado 14/07/2020 --
        if (user == "admin" || user == "josorio")
        {   worksheet2.cell(i+4,25).string(String(row.id_caja)).style(style);
            worksheet2.cell(i+4,26).string(String(row.concepto)).style(style);
        }
        /*worksheet.cell(i+10,9).number(Number(rows2.ips.toString().replace(",","."))).style(style);
        worksheet.cell(i+10,10).number(Number(rows2.saldo_favor.toString().replace(",","."))).style(style);*/

        //worksheet.cell(i+1,2).string(String(row.)).style(style);//debug
        i=i+1;
        //console.log(row.descripcion);//debug
    });
    //agregamos TOTAL
    worksheet2.cell(i+1+4,2).string('TOTAL MONTO').style(style1);//agregado 09/03/2020
    worksheet2.cell(i+1+4,5).formula('=SUM(E5:E'+(i+4)+')').style(style);//asumimos que si o si esta cargado el gasto
    worksheet2.cell(i+1+4,6).formula('=SUM(F5:F'+(i+4)+')').style(style);//asumimos que si o si esta cargado exentas
    worksheet2.cell(i+1+4,7).formula('=SUM(G5:G'+(i+4)+')').style(style);//asumimos que si o si esta cargado algo en iva10
    worksheet2.cell(i+1+4,8).formula('=SUM(H5:H'+(i+4)+')').style(style);//asumimos que si o si esta cargado algo en iva5
    worksheet2.cell(i+1+4,9).formula('=SUM(I5:I'+(i+4)+')').style(style);//asumimos que si o si esta cargado algo en gasto real

    workbook.write('RESUMEN_CAJAS.xlsx');
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
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        //
        //DATOS DE CAJAS, SE VEN SOLAMENTE LAS CAJAS ASIGNADAS AL USUARIO ACTUAL
        //REVISAR POR QUE SE NECESITA CRUZAR CON CODIGO DE EMPLEADO! -->
        var con_sql = "select c.* from cajas c inner join users u on u.codigo = c.codigo where u.user_name = '" + user + "' and c.estado ='A'";
        //Karen solamente puede ver las cajas que delega.
        if (user == "ksanabria")
        {con_sql = "select c.* from cajas c inner join users u on u.codigo = c.codigo and c.estado ='A' order by fecha desc ";/* version vieja. */
         con_sql = "select c.id, c.fecha, c.salida, c.codigo, c.responsable, c.concepto, case when c.codigo <> 22 then (c.saldo*-1) else c.saldo end as saldo, c.gasto, c.usuario_insert, c.estado, c.id_caja, c.id_ori " +
         "from cajas c inner join users u on u.codigo = c.codigo and c.estado ='A' order by fecha desc"
        }
        //si es el usuario admin/jose, puede ver solamente lo que cargo el.
        if (user=="josorio" || user =="admin")
        {con_sql = "select c.* from cajas c where codigo = 22 and c.estado ='A' order by fecha desc"; 
            /*con_sql = "select c.* from cajas c inner join users u on u.codigo = c.codigo";*/}

        //actualizamos la suma de los gastos asignados para cada subcaja que le corresponda a esta caja // SE SUMA A LOS GASTOS ASIGNADOS A ESA CAJA ORIGINAL
        var sql_act = 'update cajas t1 set t1.gasto = (select IFNULL(sum(t2.gasto_real), 0) from gastos t2 where t2.id_caja= t1.id), ' +
        't1.saldo = t1.salida - (select IFNULL(sum(t2.gasto_real), 0) from gastos t2 where t2.id_caja= t1.id)';

        //actualiza los saldos sobre las subcajas -- esta version actualiza los valores de gastos de las subcajas.
        var sql_cajas_gen_act = 'update cajas t1 set ' +
        't1.gasto = t1.gasto /* + IFNULL((select c.gasto from (select distinct id_caja, IFNULL(sum(t2.gasto), 0) as gasto from cajas t2 where t2.id_caja >0 group by t2.id_caja) c where c.id_caja = t1.id),0)*/, ' +
        't1.saldo = t1.salida - (t1.gasto /*+ IFNULL((select c.gasto from (select distinct id_caja, IFNULL(sum(t2.gasto), 0) as gasto from cajas t2 where t2.id_caja >0 group by t2.id_caja) c where c.id_caja = t1.id),0)*/) ' +
        'where t1.codigo =22';

        //actualiza los saldos sobre las subcajas -- esta version le resta la salida de las subcajas. UTILIZAMOS ESTA VERSION!
        var sql_cajas_gen_act = 'update cajas t1 set ' +
        't1.gasto = t1.gasto /* + IFNULL((select c.gasto from (select distinct id_caja, IFNULL(sum(t2.gasto), 0) as gasto from cajas t2 where t2.id_caja >0 group by t2.id_caja) c where c.id_caja = t1.id),0)*/, ' +
        't1.saldo = t1.salida - (t1.gasto + IFNULL((select sum(c.gasto) from (select distinct id_caja, IFNULL(sum(t2.salida), 0) as gasto from cajas t2 where t2.id_caja >0 group by t2.id_caja) c where c.id_caja = t1.id),0)) ' +
        'where t1.codigo =22';        

        //tenemos que generar los gastos para el resumen de las cajas para el usuario de KAREN, finalmente ella nada mas va a rendir la caja a jose
        var sql_total_gastos = 'select c.id as id_caja, g.id, g.fecha, g.monto, g.concepto, g.exentas, g.iva_10, g.iva_5, g.gasto_real, g.tipo, g.proveedor, g.fact_condicion, p.nombre,p.ruc, g.fact_nro, ' +  
        'g.tim_nro, g.fecha_fin_tim, g.encargado, g.codigo, g.nro_ot, t.cliente, t.obra, g.imputado, g.origen_pago, g.id_caja  ' +  
        'from gastos g left join proveedor p on p.id = g.id_proveedor inner join cajas c on g.id_caja = c.id inner join ot t on g.nro_ot = t.ot_nro order by g.fecha asc';

        req.getConnection(function(error, conn) {
            conn.query(sql_act,function(err, rows) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    res.render('cajas/listar', {title: 'Listado de Cajas', data: '',usuario: user})
                } else {
                    req.getConnection(function(error, conn) {
                        conn.query(sql_cajas_gen_act,function(err, rows) {
                            //if(err) throw err
                            if (err) {
                                req.flash('error', err)
                                res.render('cajas/listar', {title: 'Listado de Cajas', data: '',usuario: user})
                            } else {
                                //si se actualizan correctamente los gastos y sumas de saldos de las cajas, entonces mostramos.
                                req.getConnection(function(error, conn) {
                                    conn.query(con_sql,function(err, rows) {
                                        if (err) {//error
                                            req.flash('error', err)
                                            res.render('cajas/listar', {title: 'Listado de Cajas', data: '',usuario: user})
                                        } else {
                                            //traemos los datos totales de caja y generamos la planilla para exportar.
                                            req.getConnection(function(error, conn) {
                                                conn.query(sql_total_gastos,function(err, rows_total) {
                                                    if (err) {//error
                                                        req.flash('error', err);
                                                        res.render('cajas/listar', {title: 'Listado de Cajas', data: '',usuario: user});
                                                    } else {
                                                        genera_total_gastos(rows_total,rows);//generamos el excel para exportar
                                                        res.render('cajas/listar', {title: 'Listado de Cajas', usuario: user, data: rows});
                                                    }
                                                });
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    });
                }
            });
        });
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//VER FLUJOS CERRADOS
app.get('/cerrados/', function(req, res, next) {
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        //
        //DATOS DE CAJAS, SE VEN SOLAMENTE LAS CAJAS ASIGNADAS AL USUARIO ACTUAL
        //REVISAR POR QUE SE NECESITA CRUZAR CON CODIGO DE EMPLEADO! -->
        var con_sql = "select c.* from cajas c inner join users u on u.codigo = c.codigo where u.user_name = '" + user + "' and c.estado ='C'";
        //Karen solamente puede ver las cajas que delega.
        if (user == "ksanabria")
        {con_sql = "select c.* from cajas c inner join users u on u.codigo = c.codigo and c.estado ='C' order by fecha desc ";}
        //si es el usuario admin/jose, puede ver solamente lo que cargo el.
        if (user=="josorio" || user =="admin")
        {   con_sql = "select c.* from cajas c where codigo = 22 and c.estado ='C' order by fecha desc"; 
            /*con_sql = "select c.* from cajas c inner join users u on u.codigo = c.codigo";*/}

        //actualizamos la suma de los gastos asignados para cada subcaja que le corresponda a esta caja // SE SUMA A LOS GASTOS ASIGNADOS A ESA CAJA ORIGINAL
        var sql_act = 'update cajas t1 set t1.gasto = (select IFNULL(sum(t2.gasto_real), 0) from gastos t2 where t2.id_caja= t1.id), ' +
                    't1.saldo = t1.salida - (select IFNULL(sum(t2.gasto_real), 0) from gastos t2 where t2.id_caja= t1.id)';

        //actualiza los saldos sobre las subcajas
        var sql_cajas_gen_act = 'update cajas t1 set ' +
        't1.gasto = t1.gasto + IFNULL((select c.gasto from (select distinct id_caja, IFNULL(sum(t2.gasto), 0) as gasto from cajas t2 where t2.id_caja >0 group by t2.id_caja) c where c.id_caja = t1.id),0), ' +
        't1.saldo = t1.salida - (t1.gasto + IFNULL((select c.gasto from (select distinct id_caja, IFNULL(sum(t2.gasto), 0) as gasto from cajas t2 where t2.id_caja >0 group by t2.id_caja) c where c.id_caja = t1.id),0)) ' +
        'where t1.codigo =22';
        
        req.getConnection(function(error, conn) {
            conn.query(sql_act,function(err, rows) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    res.render('cajas/listar', {title: 'Listado de Cajas', data: '',usuario: user})
                } else {
                    req.getConnection(function(error, conn) {
                        conn.query(sql_cajas_gen_act,function(err, rows) {
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
                }
            })
        })
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//CARGA DE NUEVO ORIGEN
app.get('/add_origen', function(req, res, next){
   
    if(req.session.loggedIn)
    {   
        
        user =  req.session.user;
        userId = req.session.userId;

        //si ya está logado no hace falta preguntar el user.length
        //}
        //controlamos quien se loga.
        //if(user.length >0){
    
        //traemos los datos de los empleados.
        req.getConnection(function(error, conn) {
            conn.query('select codigo, concat(nombres," ",apellidos) as nombre, ocupacion, tel_movil from empleados where codigo is not null ORDER BY codigo',function(err, rows) {
                if (err) {console.log(err); }
                else{
                    datos_emple = [];
                    rows.forEach(function(row) { datos_emple.push(row); });

                    //jose solamente a karen puede asignarle caja? lo siguiente no usamos hasta saber
                    var con = 'select e.codigo, concat(e.nombres," ",e.apellidos) as nombre, e.ocupacion, e.tel_movil ' +
                    'from empleados e inner join users u on u.codigo = e.codigo where u.codigo is not null ORDER BY e.codigo';

                    //console.log(datos_pro);//debug
                    //solamente jose, karen y admin deberian ver la pagina
                    res.render('cajas/add_origen', {title: 'AGREGAR ORIGEN', fecha: '', origen: '', salida: '0', responsable: '',usuario: user, data_emple: datos_emple});
                }
            });
        });

    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//NUEVO ORIGEN - POST DE INSERT
app.post('/add_origen', function(req, res, next){   
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;

        /*req.assert('name', 'Nombre es requerido').notEmpty()           //Validar nombre
        req.assert('age', 'Edad es requerida').notEmpty()             //Validar edad
        req.assert('email', 'SE requiere un email valido').isEmail()  //Validar email*/
        var errors = req.validationErrors();
        
        if(!errors) {//Si no hay errores, entonces conitnuamos

            //mysql acepta solos YYYY-MM-DD
            var fecha = req.sanitize('fecha').escape().trim();
            var origen = req.sanitize('origen').escape().trim();
            var salida = Number(req.sanitize('salida').escape().trim()); 
            var responsable = req.sanitize('responsable').escape().trim();
            

            //traemos datos del post.
            var cajita = {
                fecha: formatear_fecha_yyyymmdd(fecha),
                origen: origen,
                salida: salida,
                responsable: responsable,
                usuario_insert: user
            }   
            
            //conectamos a la base de datos
            req.getConnection(function(error, conn) {
                conn.query('INSERT INTO origenes SET ?', cajita, function(err, result) {
                    //if(err) throw err
                    if (err) {
                        req.flash('error', err) /* mostramos error y mostramos los campos */
                        
                        // render to views/factura/add.ejs
                        res.render('cajas/add_origen', {
                            title: 'Agregar Nuevo ORIGEN',
                            fecha: cajita.fecha,
                            origen: cajita.origen,
                            salida: cajita.salida,
                            responsable: cajita.responsable,
                            data_emple: req.body.datos_emple,
                            usuario: user
                            //ver de cargar data_pro: datos_pro
                        })
                    } else {                
                        req.flash('success', 'Datos agregados correctamente!');

                        //traemos los datos de los empleados.
                        req.getConnection(function(error, conn) {
                            conn.query('select codigo, concat(nombres," ",apellidos) as nombre, ocupacion, tel_movil from empleados where codigo is not null ORDER BY codigo',function(err, rows) {
                                if (err) {console.log(err); }
                                else{
                                    datos_emple = [];
                                    rows.forEach(function(row) { datos_emple.push(row); });

                                    //console.log(datos_pro);//debug
                                    //solamente jose, karen y admin deberian ver la pagina
                                    res.render('cajas/add_origen', {title: 'AGREGAR ORIGEN', fecha: '', origen: '', salida: '0', responsable: '',usuario: user, data_emple: datos_emple});
                                }
                            });
                        });
                    }
                })
            })
        }
        //tuvimos errores
        else {//Mostrar errores
            var error_msg = ''
            errors.forEach(function(error) {error_msg += error.msg + '<br>'})                
            req.flash('error', error_msg)        
            
            /**
             * Using req.body.name because req.param('name') is deprecated
             */ 
            res.render('cajas/add_origen', { 
                title: 'Agregar Nuevo ORIGEN',
                fecha: req.body.fecha,
                origen: req.body.origen,
                salida: req.body.salida,
                responsable: req.body.responsable,
                usuario_insert: user
            })
        }
    } else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//CARGA DE NUEVA CAJA
app.get('/add', function(req, res, next){
   
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;
    }
    //controlamos quien se loga.
	if(user.length >0){
        req.getConnection(function(error, conn) {
            conn.query('select codigo, concat(nombres," ",apellidos) as nombre, ocupacion, tel_movil from empleados where codigo is not null ORDER BY codigo',function(err, rows) {
                if (err) {console.log(err); }
                else{
                    datos_emple = [];
                    rows.forEach(function(row) { datos_emple.push(row); });

                    //jose solamente a karen puede asignarle caja? lo siguiente no usamos hasta saber
                    var con = 'select e.codigo, concat(e.nombres," ",e.apellidos) as nombre, e.ocupacion, e.tel_movil ' +
                    'from empleados e inner join users u on u.codigo = e.codigo where u.codigo is not null ORDER BY e.codigo';

                    //si el usuario es KAREN entonces debe ver si tiene caja asignada en estado abierta. SINO TIENE NO PUEDE CREAR CAJA
                    if(user == "ksanabria" || user == "josorio")
                    {
                        //asumimos que siempre hay origenes por cargar -- segun cliente, cambiar luego!
                        conn.query("select id, fecha, origen, salida, responsable from origenes ORDER BY fecha asc",function(err, rows4) {
                            if (err) {console.log(err);}//completar el manejo de errores.
                            else{
                                datos_ori = [];
                                rows4.forEach(function(row) { datos_ori.push(row); });
                                
                                //traemos datos de 
                                conn.query("select id, fecha, salida, codigo, responsable, concepto, saldo, gasto, estado, usuario_insert, id_caja " + 
                                " from cajas where codigo = 22 and estado = 'A' ORDER BY fecha asc",function(err, rows1) {
                                    if (err) {console.log(err); }
                                    else{
                                        //si hay datos en origenes, entonces es posible dar alta de cajas.
                                        if(rows4.length >=1)
                                        {   datos_caja = [];
                                            rows1.forEach(function(row) { datos_caja.push(row); });
                                            //console.log(datos_pro);//debug
                                            //render la pagina
                                            res.render('cajas/add', {
                                            title: 'AGREGAR CAJA', fecha: '', concepto: '', salida: '0', responsable: '', saldo: '0', gasto: '0', id_caja: '0', caja:'', 
                                            codigo: '0', id_ori:'0', usuario_insert: user, usuario: user,  data_emple: datos_emple, data_caja: datos_caja, data_ori: datos_ori});}
                                        else
                                        {   //avisar que no hay caja habilitada
                                            req.flash('NO EXISTEN CAJAS HABILITADAS PARA CARGAR, SOLICITAR ALTA AL ADMINISTRADOR')
                                            res.render('cajas/listar', {title: 'Listado de Cajas', data: '',usuario: user})
                                        }
                                    }
                                });
                            }
                        });

                    }
                    else
                    {   //ACA SOLAMENTE DEBERIA PODER ENTRAR EL USUARIO ADMIN O JOSE
                        //console.log(datos_pro); //debug
                        datos_caja = [];
                        res.render('cajas/add', {
                        title: 'AGREGAR CAJA', fecha: '', concepto: '', salida: '0', responsable: '', saldo: '0', gasto: '0', id_caja: '0', caja:'',
                        codigo: '0', id_ori:'0', usuario_insert: user, usuario: user,  data_emple: datos_emple, data_caja: datos_caja});
                    }
                }
            })
        })
    }else {res.render('index', {title: 'ASISPRO ERP', message: 'Debe estar logado para ver la pagina', usuario: user});}
})

//NUEVO CAJA - POST DE INSERT
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
            var codigo = Number(req.sanitize('codigo').escape().trim()); 
            var fecha = req.sanitize('fecha').escape().trim();
            var concepto = req.sanitize('concepto').escape().trim();
            var salida = Number(req.sanitize('salida').escape().trim()); 
            var responsable = req.sanitize('responsable').escape().trim();
            var saldo = Number(req.sanitize('saldo').escape().trim());
            var gasto = Number(req.sanitize('gasto').escape().trim());
            var id_origen = Number(req.sanitize('id_ori').escape().trim());
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
                id_ori: id_origen,
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
                            id_ori: cajita.id_ori,
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
                                //agregamos el usuario jose porque debe poder ver las cajas
                                if(user == "ksanabria" || user == "josorio")
                                {
                                    //modificado 04/04/2021
                                    //asumimos que siempre hay origenes por cargar -- segun cliente, cambiar luego!
                                    conn.query("select id, fecha, origen, salida, responsable from origenes ORDER BY fecha asc",function(err, rows4) {
                                        if (err) {console.log(err);}
                                        else{
                                            datos_ori = [];
                                            rows4.forEach(function(row) { datos_ori.push(row); });
                                            
                                            //traemos datos de 
                                            conn.query("select id, fecha, salida, codigo, responsable, concepto, saldo, gasto, estado, usuario_insert, id_caja " + 
                                            " from cajas where codigo = 22 and estado = 'A' ORDER BY fecha asc",function(err, rows1) {
                                                if (err) {console.log(err); }
                                                else{
                                                    //si hay datos, entonces cargamos los datos y habilitamos el alta.
                                                    if(rows1.length >=1)
                                                    {   datos_caja = [];
                                                        rows1.forEach(function(row) { datos_caja.push(row); });
                                                        //console.log(datos_pro);//debug
                                                        //render la pagina
                                                        res.render('cajas/add', {
                                                        title: 'AGREGAR CAJA', fecha: '', concepto: '', salida: '0', responsable: '', saldo: '0', gasto: '0', id_caja: '0', caja:'', 
                                                        codigo: '0', id_ori:'0', usuario_insert: user, usuario: user,  data_emple: datos_emple, data_caja: datos_caja, data_ori: datos_ori});}
                                                    else
                                                    {   //avisar que no hay caja habilitada
                                                        req.flash('NO EXISTEN CAJAS HABILITADAS PARA CARGAR, SOLICITAR ALTA AL ADMINISTRADOR')
                                                        res.render('cajas/listar', {title: 'Listado de Cajas', data: '',usuario: user})
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }
                                else
                                {   //ACA SOLAMENTE DEBERIA PODER ENTRAR EL USUARIO ADMIN O JOSE
                                    //console.log(datos_pro); //debug
                                    res.render('cajas/add', {
                                    title: 'AGREGAR CAJA', fecha: '', concepto: '', salida: '0', responsable: '', saldo: '0', gasto: '0', 
                                    codigo: '0',id_ori:'0', usuario_insert: user, usuario: user,  data_emple: datos_emple});}
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
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;


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
                        var sql_consulta=
                        'select g.id, g.fecha, g.monto, g.concepto, g.exentas, g.iva_10, g.iva_5, g.gasto_real, g.tipo, g.proveedor, g.fact_condicion, p.nombre,' +  
                        'p.ruc, g.fact_nro, g.tim_nro, g.fecha_fin_tim, g.encargado, g.codigo, g.nro_ot, t.cliente, t.obra, g.imputado, g.origen_pago, g.id_caja   from gastos g ' +  
                        'left join proveedor p on p.id = g.id_proveedor inner join ot t on g.nro_ot = t.ot_nro where id_caja = ' + req.params.id + ' order by fecha';
                        //si el usuario es especial, entonces traemos los gastos asociados a sus cajas bajo la caja general creada.
                        if(user == 'josorio' || user == 'admin')
                        {   //traemos todos los gastos asignados a las subcajas que haya habilitado a Karen + los gastos de esa caja.
                            sql_consulta = 
                            '(select g.*, p.ruc,p.nombre, t.cliente, t.obra from gastos g inner join ot t on g.nro_ot = t.ot_nro left join proveedor p on p.id = g.id_proveedor where g.id_caja = ' + req.params.id + ' ' + 
                            'union select g.*, p.ruc,p.nombre, t.cliente, t.obra from gastos g inner join ot t on g.nro_ot = t.ot_nro left join proveedor p on p.id = g.id_proveedor where g.id_caja = ' + req.params.id + ') t1 order by t1.fecha';
                            //pisamos lo de las subcajas y dejamos como estaba.
                            sql_consulta = 'select g.*, p.ruc,p.nombre, t.cliente, t.obra from gastos g inner join ot t on g.nro_ot = t.ot_nro left join proveedor p on p.id = g.id_proveedor where g.id_caja = ' + req.params.id;
                        }
                        conn.query(sql_consulta,function(err, rows2) {
                            if (err) {console.log(err); }
                            else{
                                deta_cajas = [];
                                rows2.forEach(function(row) { deta_cajas.push(row); console.log('rows2asdasds.id'); });

                                /* traemos el resumen de las cajas */
                                if(user == 'josorio' || user == 'admin')
                                {sql_cajas = 'select * from cajas where id in (select id from cajas where id_caja = ' + req.params.id + ') order by id, fecha desc';}
                                else{sql_cajas = 'select * from cajas where id = ' + req.params.id;}
                                conn.query(sql_cajas,function(err, rows3) {
                                    if (err) {console.log(err); }
                                    else{
                                        res_cajas = [];
                                        rows3.forEach(function(row) {res_cajas.push(row); });
                                        
                                        //generamos el excel de la caja
                                        genera_detalle_caja(user, rows, rows2, rows3);
                                        //console.log(datos_pro);//debug
                                        res.render('cajas/detalle', {
                                        title: 'DETALLE CAJA', id: req.params.id, fecha: formatear_fecha_yyyymmdd(rows[0].fecha), concepto1: rows[0].concepto, salida: rows[0].salida, responsable: rows[0].responsable, 
                                        saldo: rows[0].saldo, gasto: rows[0].gasto, codigo: rows[0].codigo, usuario_insert: user, usuario: user,  deta_cajas: deta_cajas});
                                    }
                                })
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
    if(req.session.loggedIn)
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
                    var con = 'select e.codigo, concat(e.nombres," ",e.apellidos) as nombre, e.ocupacion, e.tel_movil ' +
                    'from empleados e inner join users u on u.codigo = e.codigo where u.codigo is not null ORDER BY e.codigo';

                    req.getConnection(function(error, conn) {
                        conn.query(con,function(err, rows2) {
                            if (err) {console.log(err); }
                            else{
                                datos_emple = [];
                                rows2.forEach(function(row) { datos_emple.push(row); });

                                //en caso que sea la user karen, solamente ella ve las cajas asiganadas.
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
                                                res.render('cajas/editar', {
                                                title: 'EDITAR CAJA', id: req.params.id, fecha: formatear_fecha_yyyymmdd(rows[0].fecha), estado: rows[0].estado, concepto: rows[0].concepto, salida: rows[0].salida, responsable: rows[0].responsable, 
                                                id_caja: rows[0].id_caja, caja: rows[0].concepto, saldo: rows[0].saldo, gasto: rows[0].gasto, codigo: rows[0].codigo, usuario_insert: user, usuario: user, data_emple: datos_emple,data_caja: datos_caja});}
                                            else
                                            {   //avisar que no hay caja habilitada
                                                req.flash('ERROR')
                                                res.render('cajas/listar', {title: 'Listado de Cajas', data: '',usuario: user})
                                            }
                                        }
                                    })
                                }
                                else{
                                //console.log(datos_pro);//debug
                                res.render('cajas/editar', {
                                    title: 'EDITAR CAJA', id: req.params.id, fecha: formatear_fecha_yyyymmdd(rows[0].fecha), estado: rows[0].estado, concepto: rows[0].concepto, salida: rows[0].salida, responsable: rows[0].responsable, 
                                    saldo: rows[0].saldo, gasto: rows[0].gasto, codigo: rows[0].codigo, usuario_insert: user, usuario: user, data_emple: datos_emple});
                                }
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
    if(req.session.loggedIn)
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
            gasto: req.sanitize('gasto').trim(),
            id_caja: req.sanitize('id_caja').trim()
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
                                    
                                    //en caso que sea la user karen, solamente ella ve las cajas asiganadas.
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
                                                    res.render('cajas/editar', { title: 'Editar CAJAS', id: req.params.id, codigo: req.body.codigo, fecha: req.body.fecha, concepto: req.body.concepto, salida: req.body.salida, 
                                                    responsable: req.body.responsable, saldo: req.body.saldo, id_caja: req.body.id_caja, caja: req.body.caja, gasto: req.body.gasto, estado: req.body.estado, usuario_insert: user, usuario: user,  data_emple: datos_emple, data_caja: datos_caja });}
                                                else
                                                {   //avisar que no hay caja habilitada
                                                    req.flash('ERROR')
                                                    res.render('cajas/listar', {title: 'Listado de Cajas', data: '',usuario: user})
                                                }
                                            }
                                        })
                                    }
                                    else{
                                    //console.log(datos_pro);//debug
                                    res.render('cajas/editar', { title: 'Editar CAJAS', id: req.params.id, codigo: req.body.codigo, fecha: req.body.fecha, concepto: req.body.concepto, salida: req.body.salida, 
                                    responsable: req.body.responsable, saldo: req.body.saldo, id_caja: req.body.id_caja, caja: req.body.caja, gasto: req.body.gasto, estado: req.body.estado, usuario_insert: user, usuario: user,  data_emple: datos_emple });
                                    }
                                    //console.log(datos_pro);//debug
                                    //res.render('cajas/editar', { title: 'Editar CAJAS', id: req.params.id, codigo: req.body.codigo, fecha: req.body.fecha, concepto: req.body.concepto, salida: req.body.salida, 
                                    //responsable: req.body.responsable, saldo: req.body.saldo, gasto: req.body.gasto, estado: req.body.estado, usuario_insert: user, usuario: user,  data_emple: datos_emple })
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
    if(req.session.loggedIn)
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

app.post('/resumen_cajas', function(req, res, next) {
    //primero traemos los datos de la tabla
    if(req.session.loggedIn)
    {   user =  req.session.user;
        userId = req.session.userId;

        //vemos los datos en la base
        //DESCARGAR PDF CON DATOS DE LA CAJA
        var file = path.resolve("RESUMEN_CAJAS.xlsx");
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

    if(req.session.loggedIn)
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