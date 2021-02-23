import xl from 'excel4node';
import path from 'path';


export const createExcelCoti = async (wsName, excelHeader, arrayOfSubHeaders, coti) => {

    try {
        const wb = new xl.Workbook();

        //--VALORES PREDETERMINADOS--//

        const ws = wb.addWorksheet(wsName, {
        sheetFormat: {
            defaultRowHeight: 20,
            defaultColWidth: 20,
        },
        pageSetup: {
            orientation: 'portrait',
        },
        });

        const styleNormal = wb.createStyle({
            font: {
              color: 'black',
              size: 12,
            },
            border: {
                right: {
                    style: 'thin',
                    color: '#15181C'
                },
                left: {
                    style: 'thin',
                    color: '#15181C'
                },
                bottom: {
                    style: 'thin',
                    color: '#15181C'
                },
                top: {
                    style: 'thin',
                    color: '#15181C'
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
                    color: '#15181C'
                },
                left: {
                    style: 'thin',
                    color: '#15181C'
                },
                bottom: {
                    style: 'thin',
                    color: '#15181C'
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
        ws.column(1).setWidth(5);
        ws.column(2).setWidth(35);
        ws.column(3).setWidth(70);
        ws.column(4).setWidth(15);
        ws.column(5).setWidth(15);
        ws.column(6).setWidth(15);
    
        const offset = 15;

        const current = createTableCtn(ws, coti.itemsVendidos, offset, styleNormal, styleNormalSecond, offset);

        createSubHeader(wb, ws, arrayOfSubHeaders, offset - 1);
        createHeader(wb, ws, excelHeader, coti);
        ws.cell(current, 5).string(`Sub Total`).style(styleNormal)
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
        } });
        ws.cell(current + 1, 5).string(`IGV`).style(styleNormal);
        ws.cell(current + 1, 6).formula(`F${current} * ${0.18}`).style(styleNormal);

        ws.cell(current + 2, 5).string(`Sub Total`).style(styleNormal)
        .style(
            { 
            font: { size: 14, bold: true, color: 'white' }, fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '#005087',
        } });
        ws.cell(current + 2, 6).formula(`F${current} + F${current + 1}`).style(styleNormal).style(
            { 
            font: { size: 14, bold: true, color: 'black' }, fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'white',
        } });

        ws.row(current).setHeight(20);
        ws.row(current + 1).setHeight(20);
        ws.row(current + 2).setHeight(20);

        for (let index = 1; index < offset; index++) {
            ws.row(index).setHeight(20);
        }

        ws.setPrintArea(1, 1, current + 2, 6);

        ws.addImage({
            path: path.resolve(__dirname, '../uploads/images/sirio-logo-small.png'),
            type: 'picture',
            position: {
              type: 'absoluteAnchor',
              x: '1.5mm',
              y: '1.5mm',
            },
          });
        
        const buffer = await wb.writeToBuffer();
        return buffer;
    } catch (error) {
        throw new Error(error);
    }
    



};

const createHeader = (wb, ws, excelHeader, coti) => {

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

    ws.cell(5, 4, 5, 6, true)
    .string(coti.codigo)
    .style(styleHeader)
    .style({
        font: {
          color: 'black',
          size: 12,
          bold: false,
        },
        fill: {
            fgColor: 'white',
        }
    });

    const datePre = new Date(coti.date);

    ws.cell(6, 4, 6, 6, true)
    .date(datePre.toLocaleDateString())
    .style(styleHeader)
    .style({
        font: {
          color: 'black',
          size: 14,
          bold: false,
        },
        fill: {
            fgColor: 'white',
        }
    }).style(
        {numberFormat: 'dd-mm-yyy'});

    ws.cell(7, 4, 7, 6, true)
    .string('Sirio Dinar - RUC: 20605746587')
    .style(styleHeader)
    .style({
        font: {
          color: '#005087',
          size: 12,
          bold: true,
        },
        fill: {
            fgColor: 'white',
        }
    });

    ws.cell(9, 4, 9, 6, true)
    .string('Observaciones:')
    .style(styleHeader)
    .style({
        font: {
          color: 'white',
          size: 12,
          bold: true,
        },
        alignment: {
            horizontal: 'left',
        },
        fill: {
            fgColor: '#005087',
        },
        border: {
            right: {
                style: 'thin',
                color: '#15181C'
            },
            left: {
                style: 'thin',
                color: '#15181C'
            },
            bottom: {
                style: 'thin',
                color: '#15181C'
            },
            top: {
                style: 'thin',
                color: '#15181C'
            }
        },
    });

    ws.cell(10, 4, 13, 6, true)
    .string('')
    .style(styleHeader)
    .style({
        font: {
          color: 'black',
          size: 12,
          bold: false,
        },
        fill: {
            fgColor: 'white',
        },
        alignment: {
            horizontal: 'left',
        },
        border: {
            right: {
                style: 'thin',
                color: '#15181C'
            },
            left: {
                style: 'thin',
                color: '#15181C'
            },
            bottom: {
                style: 'thin',
                color: '#15181C'
            },
            top: {
                style: 'thin',
                color: '#15181C'
            }
        },
    });

    ws.cell(10, 1, 10, 3, true)
    .string('Enviar a:')
    .style(styleHeader)
    .style({
        font: {
          color: 'white',
          size: 12,
          bold: true,
        },
        alignment: {
            horizontal: 'left',
        },
        fill: {
            fgColor: '#005087',
        },
        border: {
            right: {
                style: 'thin',
                color: '#15181C'
            },
            left: {
                style: 'thin',
                color: '#15181C'
            },
            bottom: {
                style: 'thin',
                color: '#15181C'
            },
            top: {
                style: 'thin',
                color: '#15181C'
            }
        },
    });

    ws.cell(11, 1, 13, 3, true)
    .formula(`"${coti.documento.name} | ${coti.documento.codigo}" &CHAR(10)& 
    "${coti.cliente_email ? `email: ` + coti.cliente_email : ''} ${coti.celular_cliente ? `Celular: ` + coti.celular_cliente : ''}"`)
    .style(styleHeader)
    .style({
        font: {
          color: 'black',
          size: 12,
          bold: false,
        },
        fill: {
            fgColor: 'white',
        },
        alignment: {
            horizontal: 'left',
        },
        border: {
            right: {
                style: 'thin',
                color: '#15181C'
            },
            left: {
                style: 'thin',
                color: '#15181C'
            },
            bottom: {
                style: 'thin',
                color: '#15181C'
            },
            top: {
                style: 'thin',
                color: '#15181C'
            }
        },
    });

    ws.cell(7, 1, 7, 2, true)
    .string('Jr. Pardo y Aliaga Nro. 207. Trujillo - Perú')
    .style(styleHeader)
    .style({
        font: {
          color: 'black',
          size: 12,
          bold: true,
        },
        fill: {
            fgColor: 'white',
        },
        alignment: {
            horizontal: 'left',
        },
    });

    ws.cell(8, 1, 8, 2, true)
    .string('+51 977 426 349 | inventario.siriodinar.com')
    .style(styleHeader)
    .style({
        font: {
          color: 'black',
          size: 12,
          bold: true,
        },
        fill: {
            fgColor: 'white',
        },
        alignment: {
            horizontal: 'left',
        },
    });

};

const createSubHeader = (wb, ws, arrayOfSubHeaders, at) => {
    const styleSub = wb.createStyle({
        font: {
          color: 'white',
          size: 14,
        },
        border: {
            right: {
                style: 'thin',
                color: '#15181C'
            },
            left: {
                style: 'thin',
                color: '#15181C'
            },
            bottom: {
                style: 'thin',
                color: '#15181C'
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

    let startColumn = 1;

    for (const subH of arrayOfSubHeaders) {
        ws.cell(at, startColumn)
        .string(subH)
        .style(styleSub);

        startColumn++;
    }

    ws.row(at).filter({
        firstColumn: 1,
        lastColumn: arrayOfSubHeaders.length,
      });

    ws.row(at).setHeight(20);

};

const createTableCtn = (ws, items, startRow, sn, sns, offset) => {


    // let startRow = 5;
    // let startColumn = 2;
    const current = startRow - offset;


    if (current >= items.length) {
        return offset;
    } 
    else {
        ws.row(startRow).setHeight(45);
        let style;
        if (startRow % 2 === 0) {
            style = sns;
        } 
        else {
            style = sn;
        }

        ws.cell(startRow, 1)
        .number(current + 1)
        .style(style)
        .style(
            { numberFormat: '0' });

        ws.cell(startRow, 2)
        .string(items[current].name)
        .style(style)
        .style({
            alignment:{
            wrapText:true
            }
            });

        let descrpString = items[current].descripcion || '';
        
        if (items[current].cantidadSC && items[current].cantidadSC.length > 0) {
            descrpString = descrpString + '. Detalle:';
            for (let index = 0; index < items[current].cantidadSC.length; index++) {
                if (items[current].cantidadSC[index].cantidadVenta > 0) {
                    descrpString = descrpString + 
                    ` ${items[current].cantidadSC[index].name} ${items[current].cantidadSC[index].nameSecond ? `- ${items[current].cantidadSC[index].nameSecond}: ` : ': '}` +
                     items[current].cantidadSC[index].cantidadVenta + `${items[current].cantidadSC.length + 1 < index ? ',' : '.'}` ;
                }
            }
        }

        ws.cell(startRow, 3)
        .string(descrpString)
        .style(style)
        .style({
            alignment:{
            wrapText:true
            }
            });

        ws.cell(startRow, 4)
        .number(items[current].cantidad)
        .style(style)
        .style(
            { numberFormat: '0' });

        ws.cell(startRow, 5)
        .number(items[current].priceNoIGV)
        .style(style);

        ws.cell(startRow, 6)
        .formula(`D${startRow} * E${startRow}`)
        .style(style);

        return 1 + createTableCtn(ws, items, startRow + 1, sn, sns, offset);
    }

};
