import PDFDocument from 'pdfkit';


export const createDocumento = (invoice, imageB) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    // const writeStream = fs.createWriteStream(path.resolve(__dirname, './test3.pdf'));

    generateHeader(doc, imageB);
    generateCustomerInformation(doc, invoice);
    generateInvoiceTable(doc, invoice);
    generateFooter(doc);

    return doc;
    // doc.end();
};

const generateHeader = (doc, imageB) => {
    doc
        .image(imageB, 50, 30, { width: 70 })
            .fillColor("#444444")
            .fontSize(20)
            .fontSize(10)
            .text('Sirio Dinar | RUC: 20605746587', 200, 50, { align: "right" })
            .text("Jr. Felipe Pardo Y Aliaga 213, Trujillo.", 200, 65, { align: "right" })
            .text("+51 977-426-349", 200, 80, { align: "right" })
            .moveDown();
};

const  generateCustomerInformation = (doc, invoice) => {
    doc
      .fillColor("#444444")
      .fontSize(20)
      .text("Comprobante", 50, 160);
  
    generateHr(doc, 185);
  
    const customerInformationTop = 200;
  
    doc
      .fontSize(10)
      .text("Codigo:", 50, customerInformationTop)
      .font("Helvetica-Bold")
      .text(invoice.codigo, 150, customerInformationTop)
      .font("Helvetica")
      .text("Fecha de emisión:", 50, customerInformationTop + 40)
      .text(formatDate(new Date()), 150, customerInformationTop + 40)
  
      .font("Helvetica-Bold")
      .text(invoice.documento.name, 300, customerInformationTop)
      .font("Helvetica")
      .text(invoice.documento.codigo, 300, customerInformationTop + 40)
      .moveDown();
  
    generateHr(doc, 260);
  };

const generateHr = (doc, y) => {
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
};

const formatCurrency = (cents) => {
    return "S/" + (cents).toFixed(2);
};
  
const formatDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
  
    return year + "/" + month + "/" + day;
};

const generateInvoiceTable = (doc, invoice) => {
    let i;
    const invoiceTableTop = 300;
    doc
        .fontSize(8)
        .font("Helvetica-Bold");
    generateTableRow(
      doc,
      invoiceTableTop,
      "Cod",
      "Nombre",
      "Descripcion",
      "Precio",
      "Cantidad",
      "Total"
    );
    generateHr(doc, invoiceTableTop + 25);
    doc.font("Helvetica");
  
    for (i = 0; i < invoice.itemsVendidos.length; i++) {
      const item = invoice.itemsVendidos[i];
      const position = invoiceTableTop + (i + 1) * 30;
      generateTableRow(
        doc,
        position,
        item.codigo,
        item.name,
        item.descripcion,
        formatCurrency(item.priceNoIGV),
        item.cantidad,
        formatCurrency(item.totalPriceNoIGV)
      );
  
      generateHr(doc, position + 25);
    }
  
    const subtotalPosition = invoiceTableTop + (i + 1) * 32;
    generateTableRow(
      doc,
      subtotalPosition,
      "",
      "",
      "",
      '',
      "Subtotal",
      formatCurrency(invoice.totalPriceNoIGV)
    );
  
    const paidToDatePosition = subtotalPosition + 15;
    generateTableRow(
      doc,
      paidToDatePosition,
      "",
      "",
      "",
      '',
      "IGV 18%",
      formatCurrency(invoice.totalPrice - invoice.totalPriceNoIGV)
    );
  
    const duePosition = paidToDatePosition + 15;
    doc.font("Helvetica-Bold");
    generateTableRow(
      doc,
      duePosition,
      "",
      "",
      "",
      '',
      "Total",
      formatCurrency(invoice.totalPrice)
    );
    doc.font("Helvetica");
  };
  
const generateFooter = (doc) => {
    doc
      .fontSize(10)
      .text(
        "siriodinar.com",
        50,
        780,
        { align: "center", width: 500 }
      );
};
  
const generateTableRow = (
    doc,
    y,
    item,
    description,
    superDescr,
    unitCost,
    quantity,
    lineTotal
  ) => {
    doc
      .fontSize(8)
      .text(item, 50, y, { width: 40 })
      .text(description, 100, y, { width: 100 })
      .text(superDescr, 210, y, { width: 180 })
      .text(unitCost, 400, y, { width: 35, align: "right" })
      .text(quantity, 460, y, { width: 35, align: "right" })
      .text(lineTotal, 0, y, { align: "right" });
  };
  