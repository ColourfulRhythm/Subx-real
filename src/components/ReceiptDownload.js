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