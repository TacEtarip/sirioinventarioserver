import PDFDocument from "pdfkit";

export const createTicketVoucher = (invoice) => {
  // Adjusted document size for a ticket voucher
  const doc = new PDFDocument({ size: [226.772, 566.929], margin: 20 }); // 80mm x 200mm in points
  doc.moveDown();
  generateHeader(doc);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice); // Adjusted for content fitting
  generateFooter(doc);

  return doc;
};

const generateHeader = (doc) => {
  // Header content adjusted to exclude logo
  doc
    .fontSize(10)
    .fillColor("#444444")
    .font("Helvetica-Bold")
    .text("Sirio Dinar 20605746587", 113, 15, { align: "right" })
    .text("Venta Ticket", 20, 15, { align: "left" }) // Event name as an example
    .moveDown();
};

const generateCustomerInformation = (doc, invoice) => {
  const customerInformationTop = 50;

  doc
    .fontSize(8)
    .fillColor("#444444")
    .font("Helvetica-Bold")
    .text("Código de venta:", 20, customerInformationTop)
    .font("Helvetica")
    .text(invoice.codigo, 90, customerInformationTop)
    .font("Helvetica-Bold")
    .text("Fecha de venta:", 20, customerInformationTop + 15)
    .font("Helvetica")
    .text(formatDate(new Date()), 90, customerInformationTop + 15)
    .moveDown();

  generateHr(doc, 85);
};

const generateInvoiceTable = (doc, invoice) => {
  const invoiceTableTop = 100;
  const lineSpacing = 18; // You can adjust line spacing if needed

  // Define column positions and widths
  const columnPositions = {
    codigo: { x: 20, width: 40 },
    name: { x: 60, width: 85 }, // Adjust if needed
    cantidad: { x: 145, width: 15 }, // 'cantidad' takes the old 'price' position
    priceNoIGV: { x: 160, width: 45 }, // 'price' takes the old 'cantidad' position
  };

  // Set the font size for the table
  doc.fontSize(7);

  // Generate table rows
  invoice.itemsVendidos.forEach((item, index) => {
    const position = invoiceTableTop + index * lineSpacing;

    // Draw item code, name, price, and quantity
    doc
      .text(item.codigo, columnPositions.codigo.x, position, {
        width: columnPositions.codigo.width,
      })
      .text(item.name, columnPositions.name.x, position, {
        width: columnPositions.name.width,
      })

      .text(item.cantidad.toString(), columnPositions.cantidad.x, position, {
        width: columnPositions.cantidad.width,
        align: "right",
      })
      .text(
        formatCurrency(item.priceNoIGV),
        columnPositions.priceNoIGV.x,
        position,
        {
          width: columnPositions.priceNoIGV.width,
          align: "right",
        }
      );

    // The generateHr calls have been removed so no horizontal lines will be drawn
  });
};

const generateFooter = (doc) => {
  // Simplified footer for a ticket voucher
  doc.fontSize(8).text("Gracias por tu compra!", 20, 520, {
    align: "center",
    width: 186.772,
  }); // Adjusted width to fit ticket
};

const generateHr = (doc, y) => {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(0.5)
    .moveTo(20, y)
    .lineTo(206.772, y)
    .stroke();
};

const formatCurrency = (cents) => {
  return "S/" + cents.toFixed(2);
};

const formatDate = (date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${year}/${month.toString().padStart(2, "0")}/${day
    .toString()
    .padStart(2, "0")}`;
};

// Note: This code assumes `invoice` object structure is known and consistent with your previous example.
