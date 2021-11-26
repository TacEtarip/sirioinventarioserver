import xl from "excel4node";

export const createExcelReport = async (
  wsName,
  excelHeader,
  arrayOfSubHeaders,
  arrayVentas
) => {
  try {
    const wb = new xl.Workbook();

    // --VALORES PREDETERMINADOS--//

    const ws = wb.addWorksheet(wsName, {
      sheetFormat: {
        defaultRowHeight: 20,
        defaultColWidth: 20,
      },
    });

    const styleNormal = wb.createStyle({
      font: {
        color: "black",
        size: 12,
      },
      border: {
        right: {
          style: "thin",
          color: "white",
        },
        left: {
          style: "thin",
          color: "white",
        },
        bottom: {
          style: "thin",
          color: "white",
        },
      },
      alignment: {
        vertical: "center",
      },
      numberFormat: "[$S/-es-PE]#,##0.00",
    });
    const styleNormalSecond = wb.createStyle({
      font: {
        color: "black",
        size: 12,
      },
      border: {
        right: {
          style: "thin",
          color: "white",
        },
        left: {
          style: "thin",
          color: "white",
        },
        bottom: {
          style: "thin",
          color: "white",
        },
      },
      alignment: {
        vertical: "center",
      },
      numberFormat: "[$S/-es-PE]#,##0.00",
      fill: {
        type: "pattern",
        patternType: "solid",
        fgColor: "#e2f3ff",
      },
    });

    // --VALORES PREDETERMINADOS FOR STYLE--//
    ws.row(2).setHeight(40);
    ws.row(4).setHeight(20);
    ws.column(1).setWidth(10);
    ws.column(4).setWidth(60);

    createHeader(wb, ws, excelHeader);
    createSubHeader(wb, ws, arrayOfSubHeaders);
    const current = createTableCtn(
      ws,
      arrayVentas,
      5,
      styleNormal,
      styleNormalSecond
    );

    ws.cell(current, 6)
      .string("Total")
      .style(styleNormal)
      .style({
        font: { size: 14, bold: true, color: "white" },
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "#e87200",
        },
      });
    ws.cell(current, 7)
      .formula(`SUBTOTAL(9,F5:F${current - 1})`)
      .style(styleNormal)
      .style({
        font: { size: 14, bold: true, color: "black" },
        fill: {
          type: "pattern",
          patternType: "solid",
          fgColor: "white",
        },
      });

    const buffer = await wb.writeToBuffer();

    return buffer;
  } catch (error) {
    throw new Error(error);
  }
};

const createHeader = (wb, ws, excelHeader) => {
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

  ws.cell(2, 2, 2, 7, true).string(excelHeader).style(styleHeader);

  ws.row(3).setHeight(10);
};

const createSubHeader = (wb, ws, arrayOfSubHeaders) => {
  const styleSub = wb.createStyle({
    font: {
      color: "white",
      size: 14,
    },
    border: {
      right: {
        style: "thin",
        color: "white",
      },
      left: {
        style: "thin",
        color: "white",
      },
      bottom: {
        style: "thin",
        color: "white",
      },
    },
    alignment: {
      horizontal: "left",
      vertical: "center",
    },
    fill: {
      type: "pattern",
      patternType: "solid",
      fgColor: "#e87200",
    },
  });

  let startColumn = 2;

  for (const subH of arrayOfSubHeaders) {
    ws.cell(4, startColumn).string(subH).style(styleSub);

    startColumn++;
  }

  ws.row(4).filter({
    firstColumn: 2,
    lastColumn: 7,
  });
};

const createTableCtn = (ws, ventas, startRow, sn, sns) => {
  // let startRow = 5;
  // let startColumn = 2;
  const current = startRow - 5;

  if (current >= ventas.length) {
    return 5;
  } else {
    ws.row(startRow).setHeight(20);
    let style;
    if (startRow % 2 === 0) {
      style = sns;
    } else {
      style = sn;
    }

    const datePre = new Date(ventas[current].date);

    ws.cell(startRow, 2)
      .date(datePre.toLocaleDateString())
      .style(style)
      .style({
        numberFormat: "dd-mm-yyy",
        alignment: {
          horizontal: "left",
          vertical: "center",
        },
      });

    ws.cell(startRow, 3).string(ventas[current].codigo).style(style);

    let doc = "";
    if (ventas[current].documento.name) {
      doc =
        ventas[current].documento.name +
        " | " +
        ventas[current].documento.codigo;
    }
    ws.cell(startRow, 4).string(doc).style(style);

    ws.cell(startRow, 5).string(ventas[current].vendedor).style(style);

    ws.cell(startRow, 6).number(ventas[current].totalPriceNoIGV).style(style);

    ws.cell(startRow, 7).number(ventas[current].totalPrice).style(style);

    return 1 + createTableCtn(ws, ventas, startRow + 1, sn, sns);
  }
};
