import xl from 'excel4node';


export const createExcelItemReport = async (item) => {

    try {
        const wb = new xl.Workbook();

        //--VALORES PREDETERMINADOS--//
        const wsOptions = {
            'sheetFormat': {
                'defaultRowHeight': 20,
                'defaultColWidth': 20,
            }
        };

        const ws = wb.addWorksheet('Gastos', wsOptions);

        const ws2 = wb.addWorksheet('Ventas', wsOptions);

        const ws3 = wb.addWorksheet('Balance', wsOptions);

        const styleNormal = wb.createStyle({
            font: {
              color: 'black',
              size: 12,
            },
            border: {
                right: {
                    style: 'thin',
                    color: 'white'
                },
                left: {
                    style: 'thin',
                    color: 'white'
                },
                bottom: {
                    style: 'thin',
                    color: 'white'
                }
            },
            alignment: {
                vertical: 'center',
            },
            numberFormat: '[$S/-es-PE]#,##0.00',
        });

        const styleNormalSecond = wb.createStyle({
            font: {
              color: 'black',
              size: 12,
            },
            border: {
                right: {
                    style: 'thin',
                    color: 'white'
                },
                left: {
                    style: 'thin',
                    color: 'white'
                },
                bottom: {
                    style: 'thin',
                    color: 'white'
                }
            },
            alignment: {
                vertical: 'center',
            },
            numberFormat: '[$S/-es-PE]#,##0.00',
            fill: {
                type: 'pattern',
                patternType: 'solid',
                fgColor: '#e2f3ff',
            }
        });
    
        //--VALORES PREDETERMINADOS FOR STYLE--//
        ws.row(2).setHeight(40);
        ws.column(1).setWidth(10);
        ws.column(5).setWidth(60);

        ws2.row(2).setHeight(40);
        ws2.column(1).setWidth(10);
        ws2.column(5).setWidth(60);

        ws3.row(2).setHeight(40);
        ws3.column(1).setWidth(10);
        ws3.column(5).setWidth(60);

        createHeaders(wb, ws, ws2, ws3, item.name);

        createSubHeaderWS(wb, ws, ws2);


        const current = createTableCtnWS(ws, item, 5, styleNormal, styleNormalSecond, 0);

        const currentSecond = createTableCtnWS2(ws2, item, 5, styleNormal, styleNormalSecond, 0);


        /*ws.cell(current, 5).string(`Total`).style(styleNormal)
        .style(
            { 
            font: { size: 14, bold: true, color: 'white' }, fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '#e87200',
        } });

        ws.cell(current, 6).formula(`SUBTOTAL(9,F5:F${current-1})`).style(styleNormal).style(
            { 
            font: { size: 14, bold: true, color: 'black' }, fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'white',
        } });*/
        
        const buffer = await wb.writeToBuffer();

        return buffer;
    } catch (error) {
        throw new Error(error);
    }
    



};

const createHeaders = (wb, ws, ws2, ws3, name) => {

    const styleHeader = wb.createStyle({
        font: {
          color: 'white',
          size: 16,
          bold: true,
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center',
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '#005087',
        }
    });

    ws.cell(2, 2, 2, 6, true)
    .string(`Gastos | ${name}`)
    .style(styleHeader);

    ws2.cell(2, 2, 2, 6, true)
    .string(`Ganancias | ${name}`)
    .style(styleHeader);

    ws3.cell(2, 2, 2, 6, true)
    .string(`Balance | ${name}`)
    .style(styleHeader);

    ws.row(3).setHeight(10);
    ws2.row(3).setHeight(10);
    ws3.row(3).setHeight(10);

};



const createSubHeaderWS = (wb, ws, ws2) => {
    const styleSub = wb.createStyle({
        font: {
          color: 'white',
          size: 14,
        },
        border: {
            right: {
                style: 'thin',
                color: 'white'
            },
            left: {
                style: 'thin',
                color: 'white'
            },
            bottom: {
                style: 'thin',
                color: 'white'
            },
        },
        alignment: {
            horizontal: 'left',
            vertical: 'center',
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '#e87200',
        }
      });

    let startColumn = 2;
    const arrayOfSubHeaders = ['Fecha', 'Comentario', 'Cantidad', 'Sub Cantidad', 'Costo'];
    for (const subH of arrayOfSubHeaders) {
        ws.cell(4, startColumn)
        .string(subH)
        .style(styleSub);
        ws2.cell(4, startColumn)
        .string(subH)
        .style(styleSub);
        startColumn++;
    }

    ws.row(4).filter({
        firstColumn: 2,
        lastColumn: 3,
      });

    ws2.row(4).filter({
        firstColumn: 2,
        lastColumn: 3,
      });

};



const createTableCtnWS = (ws, item, startRow, sn, sns, cDesv) => {

    // let startRow = 5;
    // let startColumn = 2;
    let current = startRow - 5;
    current = current + cDesv;

    if (current >= item.variaciones.length) {
        return 5;
    } 
    else if (item.variaciones[current].tipo === false) {
        return 0 + createTableCtnWS(ws, item, startRow, sn, sns, cDesv + 1);
    }
    else {
        let style;
        if (startRow % 2 === 0) {
            style = sns;
        } 
        else {
            style = sn;
        }

        const currentVar = item.variaciones[current];

        const datePre = new Date(currentVar.date);

        ws.cell(startRow, 2)
        .date(datePre.toLocaleDateString())
        .style(style)
        .style(
            {numberFormat: 'dd-mm-yyy', alignment: {
            horizontal: 'left',
            vertical: 'center',
            },});

        ws.cell(startRow, 4)
        .string(currentVar.cantidad.toString())
        .style(style);

        let subC = '';
        if (currentVar.cantidadSC) {
            currentVar.cantidadSC.forEach(sc => {
                let cantidadSc = sc.cantidadVenta;
                if (currentVar.comentario === 'new item') {
                    cantidadSc = sc.cantidadDisponible;
                }
                let secondName = '';
                if (sc.nameSecond) {
                    secondName = '-' + sc.nameSecond;
                }
                subC = subC + sc.name +  secondName  + ': ' + cantidadSc + ', ';
            });
            if (subC.length > 1) {
                subC = subC.slice(0, -2);
            }
        }

        ws.cell(startRow, 5)
        .string(subC)
        .style(style);

        const  costo = currentVar.costoVar;


        ws.cell(startRow, 6)
        .number(costo)
        .style(style);

        let comentariParse = currentVar.comentario;

        if (currentVar.comentario === 'new item') {
            comentariParse = 'Nuevo Item';
        } 
        else if (currentVar.comentario.split('|')[0] === 'anular') {
            comentariParse = 'Anulada ' + currentVar.comentario.split('|')[1];
        }

        ws.cell(startRow, 3)
        .string(comentariParse)
        .style(style);

        return 1 + createTableCtnWS(ws, item, startRow + 1, sn, sns, cDesv);
    }

};

const createTableCtnWS2 = (ws, item, startRow, sn, sns, cDesv) => {

    // let startRow = 5;
    // let startColumn = 2;
    let current = startRow - 5;
    current = current + cDesv;

    if (current >= item.variaciones.length) {
        return 5;
    } 
    else if (item.variaciones[current].tipo === true) {
        return 0 + createTableCtnWS2(ws, item, startRow, sn, sns, cDesv + 1);
    }
    else {
        let style;
        if (startRow % 2 === 0) {
            style = sns;
        } 
        else {
            style = sn;
        }

        const currentVar = item.variaciones[current];

        const datePre = new Date(currentVar.date);

        ws.cell(startRow, 2)
        .date(datePre.toLocaleDateString())
        .style(style)
        .style(
            {numberFormat: 'dd-mm-yyy', alignment: {
            horizontal: 'left',
            vertical: 'center',
            },});

        ws.cell(startRow, 4)
        .string(currentVar.cantidad.toString())
        .style(style);

        let subC = '';
        if (currentVar.cantidadSC) {
            currentVar.cantidadSC.forEach(sc => {
                let cantidadSc = sc.cantidadVenta;
                if (currentVar.comentario === 'new item') {
                    cantidadSc = sc.cantidadDisponible;
                }
                let secondName = '';
                if (sc.nameSecond) {
                    secondName = '-' + sc.nameSecond;
                }
                subC = subC + sc.name +  secondName  + ': ' + cantidadSc + ', ';
            });
            if (subC.length > 1) {
                subC = subC.slice(0, -2);
            }
        }

        ws.cell(startRow, 5)
        .string(subC)
        .style(style);

        const costo = currentVar.costoVar;

        ws.cell(startRow, 6)
        .number(costo)
        .style(style);

        let comentariParse = currentVar.comentario;

        if (currentVar.comentario.split('|')[0] === 'venta') {
            comentariParse = 'Venta ' + currentVar.comentario.split('|')[1];
        }

        ws.cell(startRow, 3)
        .string(comentariParse)
        .style(style);

        return 1 + createTableCtnWS2(ws, item, startRow + 1, sn, sns, cDesv);
    }

};
