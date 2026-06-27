import fs from 'fs';

// Known-good minimal PDF with proper xref offsets
// Generates exactly one page with a short text
const lines = [];
const objs = new Map();

function startObj(num, body) {
  objs.set(num, { offset: 0, body });
}

startObj(1, '<< /Type /Catalog /Pages 2 0 R >>');
startObj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
startObj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>');
const text = 'Final confirmation test chunk for vector database.';
const stream = `BT /F1 12 Tf 50 740 Td (${text}) Tj ET`;
startObj(4, `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
startObj(5, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

let pdf = '%PDF-1.4\n';
// Binary marker to signal PDF readers this is binary
pdf += Buffer.from([0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A]).toString('latin1');

for (const [num, o] of objs) {
  o.offset = Buffer.byteLength(pdf, 'latin1');
  pdf += `${num} 0 obj\n${o.body}\nendobj\n`;
}

const xrefOffset = Buffer.byteLength(pdf, 'latin1');
pdf += `xref\n0 6\n0000000000 65535 f \n`;
for (const [num, o] of objs) {
  pdf += String(o.offset).padStart(10, '0') + ' 00000 n \n';
}
pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

fs.writeFileSync('../Frontend/PDF_Storage/final-confirmation.pdf', pdf, 'latin1');
console.log('Wrote', fs.statSync('../Frontend/PDF_Storage/final-confirmation.pdf').size, 'bytes');
