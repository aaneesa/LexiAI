import { PDFParse } from 'pdf-parse';
import { readFile } from 'node:fs/promises';

export const extractTextFromPDF = async (filePath) => {
    let parser;
    try {
        // Read the file into a buffer
        const buffer = await readFile(filePath);
        
        // Initialize the parser with the buffer data
        // According to your docs: new PDFParse({ data: buffer })
        parser = new PDFParse({ data: buffer });

        // Extract text and metadata
        const textResult = await parser.getText();
        const infoResult = await parser.getInfo({ parsePageInfo: true });

        // Return the structure your processPDF function expects
        return {
            text: textResult.text,
            numPages: infoResult.total,
            info: infoResult.info
        };
    } catch (error) {
        throw new Error('Error extracting text from PDF: ' + error.message);
    } finally {
        // Always destroy the parser to free up memory as shown in your docs
        if (parser) {
            await parser.destroy();
        }
    }
};
