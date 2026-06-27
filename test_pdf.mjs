import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
pdfParse(fs.readFileSync('Frontend/PDF_Storage/final-confirmation.pdf'))
  .then(d => console.log('Text length:', d.text.length, '| Text:', JSON.stringify(d.text)))
  .catch(e => console.error('FAIL:', e.message));
