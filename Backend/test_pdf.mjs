import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
pdfParse(fs.readFileSync('../Frontend/PDF_Storage/final-confirmation.pdf'), { max: 0 })
  .then(d => console.log('OK | text:', d.text))
  .catch(e => { console.error('FAIL:', e.message); console.error('Stack:', e.stack); });
