import { NextRequest, NextResponse } from 'next/server';
const pdfParse = require('pdf-parse');

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        let extractedText = '';

        if (file.type === 'application/pdf') {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const data = await pdfParse(buffer);
            extractedText = data.text;
        } else if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.csv') || file.name.endsWith('.json')) {
            extractedText = await file.text();
        } else {
            return NextResponse.json({ error: 'Unsupported file type. Please upload a PDF or text document.' }, { status: 400 });
        }

        // Limit the text to avoid hitting LLM token limits (approx 15,000 chars)
        const MAX_CHARS = 15000;
        if (extractedText.length > MAX_CHARS) {
            extractedText = extractedText.substring(0, MAX_CHARS) + '\n\n...[Document Truncated]';
        }

        return NextResponse.json({ text: extractedText, filename: file.name });
    } catch (error) {
        console.error('File Upload API Error:', error);
        return NextResponse.json({ error: 'Failed to process the document.' }, { status: 500 });
    }
}
