import PDFDocument from 'pdfkit';

export interface CertificatePdfData {
  learnerName: string;
  courseTitle: string;
  certificateNo: string;
  issuedAt: Date;
  platformName?: string;
}

const PLATFORM = 'Siaya Community Digital Hub';

export function generateCertificatePdf(data: CertificatePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 48 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const { width, height } = doc.page;
    const platform = data.platformName ?? PLATFORM;
    const dateStr = data.issuedAt.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Decorative border
    doc.rect(24, 24, width - 48, height - 48).strokeColor('#0b6b3a').lineWidth(4).stroke();
    doc.rect(34, 34, width - 68, height - 68).strokeColor('#cda434').lineWidth(1).stroke();

    doc
      .fontSize(16)
      .fillColor('#0b6b3a')
      .text(platform, 0, 70, { align: 'center', width });

    doc
      .fontSize(13)
      .fillColor('#555555')
      .text('Certificate of Completion', 0, 100, { align: 'center', width });

    doc
      .fontSize(14)
      .fillColor('#333333')
      .text('This is to certify that', 0, 150, { align: 'center', width });

    doc
      .fontSize(34)
      .fillColor('#0b6b3a')
      .font('Helvetica-Bold')
      .text(data.learnerName, 0, 185, { align: 'center', width });

    doc
      .font('Helvetica')
      .fontSize(14)
      .fillColor('#333333')
      .text('has successfully completed the course', 0, 250, { align: 'center', width });

    doc
      .fontSize(22)
      .fillColor('#cda434')
      .font('Helvetica-Bold')
      .text(data.courseTitle, 0, 285, { align: 'center', width });

    // Certificate number + date
    doc
      .font('Helvetica')
      .fontSize(11)
      .fillColor('#666666')
      .text(`Certificate No: ${data.certificateNo}`, 60, height - 90, { align: 'left' })
      .text(`Issued: ${dateStr}`, width - 320, height - 90, { align: 'right' });

    // Signature line
    doc
      .moveTo(width / 2 - 120, height - 110)
      .lineTo(width / 2 + 120, height - 110)
      .strokeColor('#333333')
      .lineWidth(1)
      .stroke();
    doc
      .fontSize(10)
      .fillColor('#333333')
      .text('Authorized Signature', width / 2 - 120, height - 105, {
        align: 'center',
        width: 240,
      });

    doc.end();
  });
}
