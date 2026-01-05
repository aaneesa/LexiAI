import { promises as fs } from 'fs';
import { PDFParse } from 'pdf-parse';

export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const parser = new PDFParse(new Uint8Array(dataBuffer));
        const data = await parser.getText();

        return {
            data: data.text,
            numPages: data.numpages,
            info: data.info
        }
    }catch(error){
        throw new Error('Error extracting text from PDF: ' + error.message);
    }
}