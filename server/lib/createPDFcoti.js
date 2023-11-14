import { DateTime } from "luxon";
import PdfPrinter from "pdfmake";

const fonts = {
  Courier: {
    normal: "Courier",
    bold: "Courier-Bold",
    italics: "Courier-Oblique",
    bolditalics: "Courier-BoldOblique",
  },
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
  Times: {
    normal: "Times-Roman",
    bold: "Times-Bold",
    italics: "Times-Italic",
    bolditalics: "Times-BoldItalic",
  },
  Symbol: {
    normal: "Symbol",
  },
  ZapfDingbats: {
    normal: "ZapfDingbats",
  },
};

const printer = new PdfPrinter(fonts);

const cotiDoc = {
  pageMargins: [40, 40, 40, 50],
  content: [
    {
      style: "tableEnviar",
      table: {
        widths: ["*", "*"],
        body: [
          [
            {
              image: "",
              width: 100,
              border: [false, false, false, false],
              style: "headerTitle",
            },
            {
              text: [
                { text: "", fontSize: 18, bold: true },
                {
                  text: "\nSirio Dinar - RUC: 20605746587",
                  color: "darkblue",
                  fontSize: 12,
                },
                {
                  text: "\ninventario.siriodinar.com",
                  color: "orange",
                  fontSize: 12,
                },
              ],
              rowSpan: 2,
              alignment: "center",
              style: "headerTitlePrinc",
              border: [true, true, true, false],
            },
          ],
          [
            {
              text: "Jr. Pardo y Aliaga Nro. 207. Trujillo - Perú \n +51 977 426 349 | +51 922 412 404",
              width: 100,
              height: 100,
              border: [false, false, false, false],
              style: "headerTitle",
            },
          ],
        ],
      },
    },

    {
      style: "tableEnviar",
      table: {
        heights: [15, 60],
        widths: [165, 331],
        body: [
          [
            {
              text: "Enviar a:",
              fillColor: "#005087",
              bold: true,
              color: "#EAF6FF",
              style: "tableMargin",
            },
            {
              text: "Observaciones:",
              fillColor: "#005087",
              bold: true,
              color: "#EAF6FF",
              style: "tableMargin",
            },
          ],
          [
            {
              text: "",
              border: [true, true, true, false],
              style: "tableMargin",
            },
            {
              text: "RR",
              border: [true, true, true, false],
              style: "tableMargin",
            },
          ],
        ],
      },
    },

    {
      style: "tableHeader",
      table: {
        heights: [15],
        widths: [15, 97, 35, 70, 120, 35, 35, 35],
        body: [
          [
            { text: "Nº", style: "tableMarginSH" },
            { text: "IMAGÉN", style: "tableMarginSH" },
            { text: "UDM", style: "tableMarginSH" },
            { text: "NOMBRE", style: "tableMarginSH" },
            { text: "DESCRIPCIÓN", style: "tableMarginSH" },
            { text: "CANT.", style: "tableMarginSH" },
            { text: "P/CU", style: "tableMarginSH" },
            { text: "TOTAL", style: "tableMarginSH" },
          ],
        ],
      },
    },
    {
      layout: {
        paddingTop: (index, node) => {
          applyVerticalAlignment(node, index, "center");
          return 0;
        },
      },
      style: { fontSize: 10, bold: false, alignment: "center" },
      table: {
        dontBreakRows: true,
        heights: 40,
        widths: [15, 97, 35, 70, 120, 35, 35, 35],
        body: [],
      },
    },

    {
      style: "totales",
      table: {
        dontBreakRows: true,
        heights: 15,
        widths: [79, 79],
        body: [
          [
            {
              text: "Sub Total:",
              border: [true, false, false, true],
              fillColor: "#E87100",
              color: "white",
              style: "totalesMargin",
            },
            {
              text: "S/ 111.00",
              border: [true, false, true, true],
              alignment: "right",
              style: "totalesMargin",
            },
          ],
          [
            { text: "IGV:", color: "grey", style: "totalesMargin" },
            {
              text: "S/ 111.00",
              alignment: "right",
              color: "grey",
              style: "totalesMargin",
            },
          ],
          [
            { text: "Envio:", color: "grey", style: "totalesMargin" },
            {
              text: "S/ 111.00",
              alignment: "right",
              color: "grey",
              style: "totalesMargin",
            },
          ],
          [
            { text: "Otro:", color: "grey", style: "totalesMargin" },
            {
              text: "S/ 111.00",
              alignment: "right",
              color: "grey",
              style: "totalesMargin",
            },
          ],
          [
            {
              text: "Total:",
              fillColor: "#005087",
              color: "white",
              style: "totalesMargin",
            },
            { text: "S/ 111.00", alignment: "right", style: "totalesMargin" },
          ],
        ],
      },
    },
  ],

  styles: {
    totalesMargin: {
      margin: [0, 5, 0, 0],
    },
    tableMarginSH: {
      margin: [0, 5, 0, 0],
      fillColor: "#E87100",
      color: "#EAF6FF",
    },
    tableMargin: {
      fontSize: 10,
      margin: [2, 5, 2, 2],
    },
    headerTitlePrinc: {
      margin: [0, 40, 0, 0],
      fontSize: 14,
    },
    headerTitle: {
      margin: [0, 0, 0, 5],
    },
    header: {
      fontSize: 18,
      bold: true,
      margin: [10, 10, 10, 10],
    },
    subheader: {
      fontSize: 16,
      bold: true,
      margin: [0, 10, 10, 10],
    },
    tableEnviar: {
      margin: [0, 0, 0, 0],
    },

    tableHeader: {
      bold: true,
      fontSize: 10,
      alignment: "center",
    },
    totales: {
      margin: [338, 0, 0, 0],
    },
    marginSN: {
      margin: [2, 12, 2, 6],
    },
  },
  defaultStyle: {
    font: "Helvetica",
    lineHeight: 1.2,
  },
};

const findInlineHeight = (cell, maxWidth, usedWidth = 0) => {
  const calcLines = (inlines) => {
    if (inlines === undefined) {
      return {
        height: 0,
        width: 0,
      };
    }
    let currentMaxHeight = 0;
    for (const currentNode of inlines) {
      usedWidth += currentNode.width;
      if (usedWidth > maxWidth) {
        currentMaxHeight += currentNode.height;
        usedWidth = currentNode.width;
      } else {
        currentMaxHeight = Math.max(currentNode.height, currentMaxHeight);
      }
    }
    return {
      height: currentMaxHeight,
      width: usedWidth,
    };
  };
  if (cell._offsets) {
    usedWidth += cell._offsets.total;
  }
  if (cell._inlines && cell._inlines.length) {
    return calcLines(cell._inlines);
  } else if (cell.stack && cell.stack[0]) {
    return cell.stack
      .map((item) => {
        return calcLines(item._inlines);
      })
      .reduce((prev, next) => {
        return {
          height: prev.height + next.height,
          width: Math.max(prev.width + next.width),
        };
      });
  } else if (cell.table) {
    let currentMaxHeight = 0;
    for (const currentTableBodies of cell.table.body) {
      const innerTableHeights = currentTableBodies.map((innerTableCell) => {
        const findInlineHeightVar = this.findInlineHeight(
          innerTableCell,
          maxWidth,
          usedWidth
        );

        usedWidth = findInlineHeightVar.width;
        return findInlineHeightVar.height;
      });
      currentMaxHeight = Math.max(...innerTableHeights, currentMaxHeight);
    }
    return {
      height: currentMaxHeight,
      width: usedWidth,
    };
  } else if (cell._height) {
    usedWidth += cell._width;
    return {
      height: cell._height,
      width: usedWidth,
    };
  }

  return {
    height: null,
    width: usedWidth,
  };
};

const applyVerticalAlignment = (node, rowIndex, align) => {
  const allCellHeights = node.table.body[rowIndex].map(
    (innerNode, columnIndex) => {
      const mFindInlineHeight = findInlineHeight(
        innerNode,
        node.table.widths[columnIndex]._calcWidth
      );
      return mFindInlineHeight.height;
    }
  );
  const maxRowHeight = Math.max(...allCellHeights);
  node.table.body[rowIndex].forEach((cell, ci) => {
    if (allCellHeights[ci] && maxRowHeight > allCellHeights[ci]) {
      let topMargin;
      if (align === "bottom") {
        topMargin = maxRowHeight - allCellHeights[ci];
      } else if (align === "center") {
        topMargin = (maxRowHeight - allCellHeights[ci]) / 2;
      }
      if (cell._margin) {
        cell._margin[1] = topMargin;
      } else {
        cell._margin = [0, topMargin, 0, 0];
      }
    }
  });
};

export const createDocument = (buffer, coti, extra, arrayBuffers, imagen) => {
  preInfoDocCoti(buffer, coti, extra);
  if (imagen) {
    cotiDoc.content[2].table = {
      heights: [15],
      widths: [15, 97, 35, 70, 120, 35, 35, 35],
      body: [
        [
          { text: "Nº", style: "tableMarginSH" },
          { text: "IMAGÉN", style: "tableMarginSH" },
          { text: "UDM", style: "tableMarginSH" },
          { text: "NOMBRE", style: "tableMarginSH" },
          { text: "DESCRIPCIÓN", style: "tableMarginSH" },
          { text: "CANT.", style: "tableMarginSH" },
          { text: "P/CU", style: "tableMarginSH" },
          { text: "TOTAL", style: "tableMarginSH" },
        ],
      ],
    };
    cotiDoc.content[3].table = {
      dontBreakRows: true,
      heights: 40,
      widths: [15, 97, 35, 70, 120, 35, 35, 35],
      body: [],
    };
  } else {
    cotiDoc.content[2].table = {
      heights: [15],
      widths: [20, 35, 83, 193, 40, 40, 40],
      body: [
        [
          { text: "Nº", style: "tableMarginSH" },
          { text: "UDM", style: "tableMarginSH" },
          { text: "NOMBRE", style: "tableMarginSH" },
          { text: "DESCRIPCIÓN", style: "tableMarginSH" },
          { text: "CANT.", style: "tableMarginSH" },
          { text: "P/CU", style: "tableMarginSH" },
          { text: "TOTAL", style: "tableMarginSH" },
        ],
      ],
    };
    cotiDoc.content[3].table = {
      heights: 50,
      dontBreakRows: true,
      widths: [20, 35, 83, 193, 40, 40, 40],
      body: [],
    };
  }
  agregarItems(coti, arrayBuffers, imagen);
  let envioR = 0;
  if (extra.envio) {
    envioR = extra.envio;
  }
  let otroR = 0;
  if (extra.otro) {
    otroR = extra.otroR;
  }
  cotiDoc.content[4].table.body[0][1].text =
    "S/ " + coti.totalPriceNoIGV.toFixed(2);
  cotiDoc.content[4].table.body[1][1].text =
    "S/ " +
    (Math.round((coti.totalPrice - coti.totalPriceNoIGV) * 100) / 100).toFixed(
      2
    );
  cotiDoc.content[4].table.body[2][1].text = "S/ " + envioR.toFixed(2);
  cotiDoc.content[4].table.body[3][1].text = "S/ " + otroR.toFixed(2);
  cotiDoc.content[4].table.body[4][1].text =
    "S/ " +
    ((extra.otro || 0) + (extra.envio || 0) + coti.totalPrice).toFixed(2);
  const doc = printer.createPdfKitDocument(cotiDoc);
  return doc;
};

const preInfoDocCoti = (buffer, coti, extra) => {
  const d2 = DateTime.fromJSDate(coti.date)
    .toFormat("c LL yyyy")
    .toLocaleString();
  cotiDoc.content[0].table.body[0][0].image = buffer;
  cotiDoc.content[0].table.body[0][1].text[0].text = `${coti.codigo}\n${d2
    .split(" ")
    .join("/")}`;
  cotiDoc.content[1].table.body[1][1].text = extra.observaciones;
  cotiDoc.content[1].table.body[1][0].text = `${coti.documento.name} | ${
    coti.documento.codigo
  }${coti.cliente_email ? `\nemail: ${coti.cliente_email}` : ""}${
    coti.celular_cliente === "+51" ? "" : `\nCelular:${coti.celular_cliente}`
  }`;
};

const agregarItems = (coti, arrayBuffers, imagen) => {
  const temporalArray = [];
  coti.itemsVendidos.forEach((item, index) => {
    let descrpString = item.descripcion || "";
    if (item.cantidadSC && item.cantidadSC.length > 0) {
      descrpString = descrpString + ". Detalle:";
      for (let indexS = 0; indexS < item.cantidadSC.length; indexS++) {
        if (item.cantidadSC[indexS].cantidadVenta > 0) {
          descrpString =
            descrpString +
            ` ${item.cantidadSC[indexS].name} ${
              item.cantidadSC[indexS].nameSecond
                ? `- ${item.cantidadSC[indexS].nameSecond}: `
                : ": "
            }` +
            item.cantidadSC[indexS].cantidadVenta +
            `${item.cantidadSC.length + 1 < indexS ? "," : "."}`;
        }
      }
    }
    if (imagen) {
      temporalArray.push([
        { text: index + 1, style: "tableMarginN" },
        { image: arrayBuffers[index].Body, width: 95, height: 95 },
        { text: item.unidadDeMedida, style: "tableMarginN" },
        { text: item.name, style: "tableMarginN" },
        { text: descrpString, alignment: "justify" },
        { text: item.cantidad.toString(), style: "tableMarginN" },
        { text: "S/" + item.priceNoIGV.toString(), style: "tableMarginN" },
        { text: "S/" + item.totalPriceNoIGV.toString(), style: "tableMarginN" },
      ]);
    } else {
      temporalArray.push([
        { text: index + 1, style: "marginSN" },
        { text: item.unidadDeMedida, style: "marginSN" },
        { text: item.name, style: "marginSN" },
        { text: descrpString, alignment: "justify", style: "marginSN" },
        { text: item.cantidad.toString(), style: "marginSN" },
        { text: "S/" + item.priceNoIGV.toString(), style: "marginSN" },
        { text: "S/" + item.totalPriceNoIGV.toString(), style: "marginSN" },
      ]);
    }
    cotiDoc.content[3].table.body = temporalArray;
  });
};
