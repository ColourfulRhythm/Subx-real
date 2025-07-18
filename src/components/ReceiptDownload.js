import jsPDF from 'jspdf';

export function generateReceipt({ user, project, amount, date, reference }) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Payment Receipt', 20, 20);
  doc.setFontSize(12);
  doc.text(`Date: ${date}`, 20, 35);
  doc.text(`Reference: ${reference}`, 20, 45);
  doc.text(`Name: ${user.name}`, 20, 55);
  doc.text(`Email: ${user.email}`, 20, 65);
  doc.text(`Project: ${project.title}`, 20, 75);
  doc.text(`Amount: ${amount}`, 20, 85);
  doc.text('Thank you for your payment!', 20, 105);
  doc.save(`SubX_Receipt_${reference}.pdf`);
}

export function generateOwnershipCertificate({ user, project, sqm, date, certificateId }) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Certificate of Ownership', 20, 20);
  doc.setFontSize(12);
  doc.text(`Certificate ID: ${certificateId}`, 20, 30);
  doc.text(`Date Issued: ${date}`, 20, 40);
  doc.text(`Owner: ${user.name}`, 20, 50);
  doc.text(`Email: ${user.email}`, 20, 60);
  doc.text(`Plot: ${project.title}`, 20, 70);
  doc.text(`Location: ${project.location}`, 20, 80);
  doc.text(`Size: ${sqm} sqm (of 500 sqm)`, 20, 90);
  doc.text('This certifies that the above-named individual is a co-owner of the specified plot in the 2 Seasons development.', 20, 110, { maxWidth: 170 });
  doc.text('Focal Point Property Development and Management Services Ltd.', 20, 130);
  doc.save(`SubX_Certificate_${certificateId}.pdf`);
}

export function generateDeedPDF({ user, project, sqm, date, deedId, signatureDataUrl }) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Deed of Assignment', 20, 20);
  doc.setFontSize(12);
  doc.text(`Deed ID: ${deedId}`, 20, 30);
  doc.text(`Date Signed: ${date}`, 20, 40);
  doc.text(`Assignee: ${user.name}`, 20, 50);
  doc.text(`Email: ${user.email}`, 20, 60);
  doc.text(`Plot: ${project.title}`, 20, 70);
  doc.text(`Location: ${project.location}`, 20, 80);
  doc.text(`Size: ${sqm} sqm (of 500 sqm)`, 20, 90);
  doc.text('This deed assigns the above plot to the assignee, subject to the terms and conditions of the 2 Seasons development.', 20, 110, { maxWidth: 170 });
  doc.text('Focal Point Property Development and Management Services Ltd.', 20, 130);
  if (signatureDataUrl) {
    doc.text('Signature:', 20, 150);
    doc.addImage(signatureDataUrl, 'PNG', 50, 140, 60, 30);
  }
  doc.save(`SubX_Deed_${deedId}.pdf`);
} 