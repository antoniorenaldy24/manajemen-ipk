
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

export class ReportGenerator {

    /**
     * Generates an Excel file buffer from data.
     * @param data Array of objects to be written
     * @param _columns (Optional) Ordered list of column keys - currently using data keys directly for simplicity
     */
    static async generateExcelReport(data: any[]): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const worksheet = XLSX.utils.json_to_sheet(data);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

                const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
                resolve(buffer);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Generates a PDF file buffer with a simple table and optional QR Code.
     * @param title Title of the report
     * @param data Array of objects (rows)
     * @param columns Ordered list of keys to display
     * @param qrData (Optional) String data to embed as QR Code (e.g., Report ID or Verification URL)
     */
    static async generatePDFReport(title: string, data: any[], columns: string[], qrData?: string): Promise<Buffer> {
        let qrImage: string | null = null;

        if (qrData) {
            try {
                qrImage = await QRCode.toDataURL(qrData);
            } catch (err) {
                console.error("Failed to generate QR Code:", err);
            }
        }

        return new Promise((resolve) => {
            const doc = new jsPDF();

            // Title
            doc.setFontSize(18);
            doc.text(title, 14, 22);
            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

            // QR Code Embedding (Top Right)
            if (qrImage) {
                // x: 170, y: 10, width: 25, height: 25
                doc.addImage(qrImage, 'PNG', 170, 10, 25, 25);
                doc.setFontSize(8);
                doc.text("Scan to Verify", 170, 38);
            }

            // Table Body
            // Transform data to array of arrays based on columns
            const tableBody = data.map(row => columns.map(col => String(row[col] ?? '')));

            // Using autoTable to draw
            autoTable(doc, {
                startY: 40,
                head: [columns.map(c => c.toUpperCase())],
                body: tableBody,
                theme: 'striped',
                headStyles: { fillColor: [41, 128, 185] }
            });

            // Return as Buffer
            // jsPDF output('arraybuffer') returns ArrayBuffer, we convert to Buffer for Node usage
            const arrayBuffer = doc.output('arraybuffer');
            resolve(Buffer.from(arrayBuffer));
        });
    }
}
