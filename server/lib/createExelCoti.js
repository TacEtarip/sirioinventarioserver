import xl from "excel4node";

export const createExcelCoti = async (
  wsName,
  excelHeader,
  arrayOfSubHeaders,
  coti,
  dataIMG,
  extra,
  image,
  bufferArrays = []
) => {
  try {
    const wb = new xl.Workbook();

    // --VALORES PREDETERMINADOS--//

    const ws = wb.addWorksheet(wsName, {
      sheetFormat: {
        defaultRowHeight: 20,
        defaultColWidth: 20,
      },
      pageSetup: {
        orientation: "portrait",
      },
    });

    const styleNormal = wb.createStyle({
      font: {
        color: "black",
        size: 12,
        bold: true,
      },
      border: {
        right: {
          style: "thin",
          color: "#15181C",
        },
        left: {
          style: "thin",
          color: "#15181C",
        },
        bottom: {
          style: "thin",
          color: "#15181C",
        },
        top: {
          style: "thin",
          color: "#15181C",
        },
      },
      alignment: {
        vertical: "center",
        wrapText: true,
      },
      numberFormat: "[$S/-es-PE]#,##0.00",
    });
    const styleNormalSecond = wb.createStyle({
      font: {
        color: "black",
        size: 12,
        bold: true,
      },
      border: {
        right: {
          style: "thin",
          color: "#15181C",
        },
        left: {
          style: "thin",
          color: "#15181C",
        },
        bottom: {
          style: "thin",
          color: "#15181C",
        },
      },
      alignment: {
        vertical: "center",
        wrapText: true,
      },
      numberFormat: "[$S/-es-PE]#,##0.00",
      fill: {
        type: "pattern",
        patternType: "solid",
        fgColor: "#e2f3ff",
      },
    });

    // --VALORES PREDETERMINADOS FOR STYLE--//
    ws.column(1).setWidth(5);
    ws.column(2).setWidth(15);
    ws.column(3).setWidth(15);
    ws.column(4).setWidth(15);
    ws.column(5).setWidth(60);
    ws.column(6).setWidth(15);
    ws.column(7).setWidth(15);
    ws.column(8).setWidth(15);

    const offset = 15;

    const current = createTableCtn(
      ws,
      coti.itemsVendidos,
      offset,
      styleNormal,
      styleNormalSecond,
      offset,
      image
    );

    createSubHeader(wb, ws, arrayOfSubHeaders, offset - 1);
    createHeader(wb, ws, excelHeader, coti, extra.observaciones);
    ws.cell(current, 7)
      .string("Sub Total")
      .style(styleNormal)
      .style({
        font: { size: 14, bold: true, color: "white" },
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "#e87200",
        },
      });
    ws.cell(current, 8)
      .formula(`SUBTOTAL(9,H5:H${current - 1})`)
      .style(styleNormal)
      .style({
        font: { size: 14, bold: true, color: "black" },
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "white",
        },
      });
    ws.cell(current + 1, 7)
      .string("IGV")
      .style(styleNormal);
    ws.cell(current + 1, 8)
      .formula(`H${current} * ${0.18}`)
      .style(styleNormal);

    ws.cell(current + 2, 7)
      .string("Envio")
      .style(styleNormal)
      .style({
        font: { size: 14, bold: true, color: "black" },
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "white",
        },
      });
    ws.cell(current + 2, 8)
      .number(extra.envio || 0)
      .style(styleNormal)
      .style({
        font: { size: 12, bold: false, color: "black" },
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "white",
        },
      });

    ws.cell(current + 3, 7)
      .string("Otro")
      .style(styleNormal)
      .style({
        font: { size: 14, bold: true, color: "black" },
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "white",
        },
      });
    ws.cell(current + 3, 8)
      .number(extra.otro || 0)
      .style(styleNormal)
      .style({
        font: { size: 12, bold: false, color: "black" },
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "white",
        },
      });

    ws.cell(current + 4, 7)
      .string("Total")
      .style(styleNormal)
      .style({
        font: { size: 14, bold: true, color: "white" },
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "#005087",
        },
      });
    ws.cell(current + 4, 8)
      .formula(
        `H${current} + H${current + 1} + H${current + 2} + H${current + 3}`
      )
      .style(styleNormal)
      .style({
        font: { size: 14, bold: true, color: "black" },
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "white",
        },
      });

    ws.cell(current + 1, 1, current + 1, 5, true)
      .style(styleNormal)
      .string("BCP - SOLES: 570-2650880-0-39")
      .style({
        font: { size: 12, bold: true, color: "black" },
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "#e2f3ff",
        },
      });

    ws.cell(current + 2, 1, current + 2, 5, true)
      .style(styleNormal)
      .string("C.C.I. - SOLES: 002-57000265088003903")
      .style({
        font: { size: 12, bold: true, color: "black" },
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "#e2f3ff",
        },
      });
    if (extra.porPagar) {
      ws.cell(current + 3, 1, current + 3, 5, true)
        .style(styleNormal)
        .string("SALDO A CANCELAR S/" + (extra.porPagar.toString() || ""))
        .style({
          font: { size: 12, bold: true, color: "black" },
          fill: {
            type: "pattern",
            patternType: "solid",
            fgColor: "#f1a054",
          },
        });
    }

    ws.row(current).setHeight(20);
    ws.row(current + 1).setHeight(20);
    ws.row(current + 2).setHeight(20);
    ws.row(current + 3).setHeight(20);
    ws.row(current + 4).setHeight(20);

    for (let index = 1; index < offset - 1; index++) {
      ws.row(index).setHeight(20);
    }

    ws.setPrintArea(1, 1, current + 4, 8);

    ws.addImage({
      image: dataIMG,
      type: "picture",
      position: {
        type: "absoluteAnchor",
        x: "1.5mm",
        y: "1.5mm",
      },
    });
    if (image) {
      bufferArrays.forEach((buff, index) => {
        ws.addImage({
          image: buff.Body,
          type: "picture",
          position: {
            type: "twoCellAnchor",
            from: {
              col: 2,
              colOff: "1mm",
              row: offset + index,
              rowOff: "1mm",
            },
            to: {
              col: 2,
              colOff: "35mm",
              row: offset + index,
              rowOff: "35mm",
            },
          },
        });
      });
    }

    const buffer = await wb.writeToBuffer();
    return buffer;
  } catch (error) {
    throw new Error(error);
  }
};

const createHeader = (wb, ws, excelHeader, coti, observaciones) => {
  const styleHeader = wb.createStyle({
    font: {
      color: "white",
      size: 16,
      bold: true,
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
    },
    fill: {
      type: "pattern",
      patternType: "solid",
      fgColor: "#005087",
    },
  });

  ws.cell(4, 5, 4, 8, true)
    .string(coti.codigo)
    .style(styleHeader)
    .style({
      font: {
        color: "black",
        size: 12,
        bold: false,
      },
      fill: {
        fgColor: "white",
      },
    });

  const datePre = new Date(coti.date);

  ws.cell(5, 5, 5, 8, true)
    .date(datePre.toLocaleDateString())
    .style(styleHeader)
    .style({
      font: {
        color: "black",
        size: 14,
        bold: false,
      },
      fill: {
        fgColor: "white",
      },
    })
    .style({ numberFormat: "dd-mm-yyy" });

  ws.cell(6, 5, 6, 8, true)
    .string("Sirio Dinar - RUC: 20605746587")
    .style(styleHeader)
    .style({
      font: {
        color: "#005087",
        size: 12,
        bold: true,
      },
      fill: {
        fgColor: "white",
      },
    });

  ws.cell(7, 5, 7, 8, true)
    .link("https://inventario.siriodinar.com")
    .style(styleHeader)
    .style({
      font: {
        color: "#e87200",
        size: 12,
        bold: true,
      },
      fill: {
        fgColor: "white",
      },
    });

  ws.cell(9, 5, 9, 8, true)
    .string("Observaciones:")
    .style(styleHeader)
    .style({
      font: {
        color: "white",
        size: 12,
        bold: true,
      },
      alignment: {
        horizontal: "left",
      },
      fill: {
        fgColor: "#005087",
      },
      border: {
        right: {
          style: "thin",
          color: "#15181C",
        },
        left: {
          style: "thin",
          color: "#15181C",
        },
        bottom: {
          style: "thin",
          color: "#15181C",
        },
        top: {
          style: "thin",
          color: "#15181C",
        },
      },
    });

  ws.cell(10, 5, 13, 8, true)
    .string(observaciones || "")
    .style(styleHeader)
    .style({
      font: {
        color: "black",
        size: 12,
        bold: false,
      },
      fill: {
        fgColor: "white",
      },
      alignment: {
        horizontal: "left",
        vertical: "center",
      },
      border: {
        right: {
          style: "thin",
          color: "#15181C",
        },
        left: {
          style: "thin",
          color: "#15181C",
        },
        bottom: {
          style: "thin",
          color: "#15181C",
        },
        top: {
          style: "thin",
          color: "#15181C",
        },
      },
    });

  ws.cell(10, 1, 10, 4, true)
    .string("Enviar a:")
    .style(styleHeader)
    .style({
      font: {
        color: "white",
        size: 12,
        bold: true,
      },
      alignment: {
        horizontal: "left",
      },
      fill: {
        fgColor: "#005087",
      },
      border: {
        right: {
          style: "thin",
          color: "#15181C",
        },
        left: {
          style: "thin",
          color: "#15181C",
        },
        bottom: {
          style: "thin",
          color: "#15181C",
        },
        top: {
          style: "thin",
          color: "#15181C",
        },
      },
    });

  ws.cell(11, 1, 13, 4, true)
    .string(
      `${coti.documento.name} | ${coti.documento.codigo} ${
        coti.cliente_email ? "\nemail: " + coti.cliente_email : ""
      } ${coti.celular_cliente ? "\nCelular: " + coti.celular_cliente : ""}`
    )
    .style(styleHeader)
    .style({
      font: {
        color: "black",
        size: 12,
        bold: false,
      },
      fill: {
        fgColor: "white",
      },
      alignment: {
        horizontal: "left",
        vertical: "center",
        wrapText: true,
      },
      border: {
        right: {
          style: "thin",
          color: "#15181C",
        },
        left: {
          style: "thin",
          color: "#15181C",
        },
        bottom: {
          style: "thin",
          color: "#15181C",
        },
        top: {
          style: "thin",
          color: "#15181C",
        },
      },
    });

  ws.cell(7, 1, 7, 4, true)
    .string("Jr. Pardo y Aliaga Nro. 207. Trujillo - Perú")
    .style(styleHeader)
    .style({
      font: {
        color: "black",
        size: 12,
        bold: true,
      },
      fill: {
        fgColor: "white",
      },
      alignment: {
        horizontal: "left",
      },
    });

  ws.cell(8, 1, 8, 4, true)
    .string("+51 977 426 349 | +51 922 412 404")
    .style(styleHeader)
    .style({
      font: {
        color: "black",
        size: 12,
        bold: true,
      },
      fill: {
        fgColor: "white",
      },
      alignment: {
        horizontal: "left",
      },
    });
};

const createSubHeader = (wb, ws, arrayOfSubHeaders, at) => {
  const styleSub = wb.createStyle({
    font: {
      color: "white",
      size: 12,
      bold: true,
    },
    border: {
      right: {
        style: "thin",
        color: "#15181C",
      },
      left: {
        style: "thin",
        color: "#15181C",
      },
      bottom: {
        style: "thin",
        color: "#15181C",
      },
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
      wrapText: true,
    },
    fill: {
      type: "pattern",
      patternType: "solid",
      fgColor: "#e87200",
    },
  });

  let startColumn = 1;

  for (const subH of arrayOfSubHeaders) {
    ws.cell(at, startColumn).string(subH).style(styleSub);

    startColumn++;
  }

  ws.row(at).filter({
    firstColumn: 1,
    lastColumn: arrayOfSubHeaders.length,
  });

  ws.row(at).setHeight(40);
};

const createTableCtn = (ws, items, startRow, sn, sns, offset, image) => {
  // let startRow = 5;
  // let startColumn = 2;
  const current = startRow - offset;

  if (current >= items.length) {
    return offset;
  } else {
    if (image) {
      ws.row(startRow).setHeight(85);
    } else {
      ws.row(startRow).setHeight(35);
    }
    let style;
    if (startRow % 2 === 0) {
      style = sns;
    } else {
      style = sn;
    }

    ws.cell(startRow, 1)
      .number(current + 1)
      .style(style)
      .style({ numberFormat: "0" })
      .style({
        alignment: {
          horizontal: "center",
        },
      });

    ws.cell(startRow, 2)
      .string("")
      .style(style)
      .style({
        alignment: {
          wrapText: true,
        },
      });

    ws.cell(startRow, 3)
      .string(items[current].unidadDeMedida || "UND")
      .style(style)
      .style({
        alignment: {
          wrapText: true,
          horizontal: "center",
        },
      });

    ws.cell(startRow, 4)
      .string(items[current].name)
      .style(style)
      .style({
        alignment: {
          horizontal: "center",
          wrapText: true,
        },
      });

    let descrpString = items[current].descripcion || "";

    if (items[current].cantidadSC && items[current].cantidadSC.length > 0) {
      descrpString = descrpString + ". Detalle:";
      for (let index = 0; index < items[current].cantidadSC.length; index++) {
        if (items[current].cantidadSC[index].cantidadVenta > 0) {
          descrpString =
            descrpString +
            ` ${items[current].cantidadSC[index].name} ${
              items[current].cantidadSC[index].nameSecond
                ? `- ${items[current].cantidadSC[index].nameSecond}: `
                : ": "
            }` +
            items[current].cantidadSC[index].cantidadVenta +
            `${items[current].cantidadSC.length + 1 < index ? "," : "."}`;
        }
      }
    }

    ws.cell(startRow, 5)
      .string(descrpString)
      .style(style)
      .style({
        alignment: {
          wrapText: true,
        },
      });

    ws.cell(startRow, 6)
      .number(items[current].cantidad)
      .style(style)
      .style({ numberFormat: "0" })
      .style({
        alignment: {
          horizontal: "center",
        },
      });

    ws.cell(startRow, 7).number(items[current].priceNoIGV).style(style);

    ws.cell(startRow, 8).formula(`F${startRow} * G${startRow}`).style(style);

    return 1 + createTableCtn(ws, items, startRow + 1, sn, sns, offset, image);
  }
};
