import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env.local variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Error: GEMINI_API_KEY is missing from .env.local');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function uploadCorpus() {
  const filePath = path.join(__dirname, '../docs/UU_Ketenagakerjaan_Embedding.pdf');
  console.log(`Uploading file: ${filePath}`);

  try {
    const uploadResult = await ai.files.upload({
        file: filePath,
        mimeType: 'application/pdf',
        displayName: 'UU_Ketenagakerjaan_Corpus',
    });
    
    console.log(`File uploaded successfully.`);
    console.log(`File URI: ${uploadResult.uri}`);
    console.log(`File Name: ${uploadResult.name}`);
    console.log(`Please add this URI/Name to your environment variables if needed.`);
    
    // Save to a local json for reference
    const infoPath = path.join(__dirname, '../docs/corpus-info.json');
    fs.writeFileSync(infoPath, JSON.stringify({
      uri: uploadResult.uri,
      name: uploadResult.name,
      displayName: uploadResult.displayName
    }, null, 2));
    
    console.log(`Saved corpus info to ${infoPath}`);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

uploadCorpus();
