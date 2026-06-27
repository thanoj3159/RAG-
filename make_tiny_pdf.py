from fpdf import FPDF
import os

pdf = FPDF()
pdf.add_page()
pdf.set_font("Helvetica", size=12)
pdf.cell(0, 10, txt="Final confirmation test chunk for vector database.", ln=1)
out = r"C:\Users\chari\Desktop\RAG\Frontend\PDF_Storage\final-confirmation.pdf"
pdf.output(out)
print("Wrote:", out, os.path.getsize(out), "bytes")
