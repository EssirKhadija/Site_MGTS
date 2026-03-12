const PDFDocument = require('pdfkit');

const generateInvoicePDF = (order) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const primaryColor  = '#009189';
    const darkColor     = '#1a1a2e';
    const lightGray     = '#f5f5f5';
    const currency      = order.currency || 'MAD';

    // ── HEADER ────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 90).fill(primaryColor);

    doc.fillColor('white')
       .fontSize(26).font('Helvetica-Bold')
       .text('MGTS', 50, 25)
       .fontSize(11).font('Helvetica')
       .text('From Factory To Market', 50, 55)
       .fontSize(11)
       .text(`FACTURE N° INV-${String(order.id).padStart(6, '0')}`, 350, 30, { align: 'right' })
       .text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 350, 50, { align: 'right' });

    doc.fillColor(darkColor);

    // ── CLIENT INFO ───────────────────────────────────────────
    doc.moveDown(3)
       .fontSize(11).font('Helvetica-Bold')
       .text('FACTURÉ À :', 50, 115);

    doc.rect(50, 130, 240, 75).fill(lightGray);
    doc.fillColor(darkColor).font('Helvetica')
       .fontSize(10)
       .text(order.clientName,  60, 140)
       .text(order.clientEmail, 60, 155)
       .text(order.clientPhone, 60, 170);

    // ── ORDER INFO ────────────────────────────────────────────
    doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(11)
       .text('DÉTAILS DE LA COMMANDE :', 320, 115);

    doc.rect(320, 130, 225, 75).fill(lightGray);
    doc.fillColor(darkColor).font('Helvetica').fontSize(10)
       .text(`Commande # : ${order.id}`,            330, 140)
       .text(`Type : ${order.type}`,                330, 155)
       .text(`Incoterm : ${order.incoterm || '-'}`, 330, 170)
       .text(`Réf. virement : ${order.transferReference || '-'}`, 330, 185);

    // ── TABLE HEADER ──────────────────────────────────────────
    const tableTop = 230;
    doc.rect(50, tableTop, 495, 25).fill(primaryColor);
    doc.fillColor('white').font('Helvetica-Bold').fontSize(10)
       .text('Description',  60, tableTop + 7)
       .text('Montant',     470, tableTop + 7, { width: 70, align: 'right' });

    // ── TABLE ROWS ────────────────────────────────────────────
    const rows = [
      ['Coût de production (Fournisseur)', order.productionCost],
      ['Frais de transport',               order.transportCost],
      ['Frais douaniers (Transitaire)',    order.customsCost],
      ['Commission MGTS',                  order.mgtsMargin],
    ];

    let y = tableTop + 30;
    rows.forEach(([label, amount], i) => {
      if (i % 2 === 0) doc.rect(50, y - 4, 495, 22).fill('#f9f9f9');
      doc.fillColor(darkColor).font('Helvetica').fontSize(10)
         .text(label, 60, y)
         .text(`${parseFloat(amount).toFixed(2)} ${currency}`, 400, y, { width: 140, align: 'right' });
      y += 22;
    });

    // ── TOTAL ─────────────────────────────────────────────────
    doc.rect(50, y + 5, 495, 30).fill(primaryColor);
    doc.fillColor('white').font('Helvetica-Bold').fontSize(12)
       .text('TOTAL', 60, y + 12)
       .text(`${parseFloat(order.totalAmount).toFixed(2)} ${currency}`, 400, y + 12, { width: 140, align: 'right' });

    // ── PAYMENT STATUS ────────────────────────────────────────
    y += 55;
    const statusLabel = order.paymentStatus === 'validated' ? '✓ PAYÉ' : 'EN ATTENTE';
    const statusColor = order.paymentStatus === 'validated' ? '#27ae60' : '#e67e22';
    doc.rect(50, y, 495, 28).fill(statusColor);
    doc.fillColor('white').font('Helvetica-Bold').fontSize(11)
       .text(`Statut du paiement : ${statusLabel}`, 60, y + 8);

    // ── FOOTER ────────────────────────────────────────────────
    doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill(primaryColor);
    doc.fillColor('white').font('Helvetica').fontSize(9)
       .text(
         'MGTS Platform — contact@mgts.com — www.mgts.com',
         50,
         doc.page.height - 32,
         { align: 'center' }
       );

    doc.end();
  });
};

module.exports = { generateInvoicePDF };