import vision from "@google-cloud/vision";
import fs from "fs";
import path from "path";

// Create a client
const client = new vision.ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

/**
 * Extract text from an image file using Google Vision OCR
 * @param {string} filePath - Path to the image file
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextFromImage(filePath) {
    try {
        const [result] = await client.textDetection(filePath);
        const detections = result.textAnnotations;
        
        if (detections && detections.length > 0) {
            return detections[0].description;
        }
        
        return "";
    } catch (error) {
        console.error("Error extracting text from image:", error);
        throw error;
    }
}

/**
 * Extract text from a PDF file using Google Vision OCR
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextFromPDF(filePath) {
    try {
        const inputConfig = {
            mimeType: "application/pdf",
            content: fs.readFileSync(filePath).toString("base64")
        };

        const features = [{ type: "DOCUMENT_TEXT_DETECTION" }];
        
        const request = {
            requests: [
                {
                    inputConfig: inputConfig,
                    features: features,
                    pages: [1, 2, 3, 4, 5] // Extract from first 5 pages
                }
            ]
        };

        const [result] = await client.batchAnnotateFiles(request);
        
        let extractedText = "";
        
        if (result.responses && result.responses[0].responses) {
            for (const response of result.responses[0].responses) {
                if (response.fullTextAnnotation) {
                    extractedText += response.fullTextAnnotation.text + "\n";
                }
            }
        }
        
        return extractedText.trim();
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        throw error;
    }
}

/**
 * Extract text from a file (image or PDF)
 * @param {string} filePath - Path to the file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} - Extracted text
 */
export async function extractText(filePath, mimeType) {
    if (mimeType === "application/pdf") {
        return await extractTextFromPDF(filePath);
    } else {
        return await extractTextFromImage(filePath);
    }
}

export default { extractText, extractTextFromImage, extractTextFromPDF };
