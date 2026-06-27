import fs from 'fs';
import { loadAndSplitPDFs } from './VectorDatabase/injectFile_splitter.js';

async function main() {
    const chunks = await loadAndSplitPDFs();
    let totalWords = 0;

    let output = '=== CHUNKS SUMMARY ===\n';

    chunks.forEach((chunk, i) => {
        // Count words by splitting on whitespace
        const words = chunk.content.split(/\s+/).filter(w => w.length > 0).length;
        totalWords += words;

        // Add to our text file output
        output += `\n------------------------------------------------------------\n`;
        output += `Chunk ${i + 1} | Source: ${chunk.metadata.source} | Words: ${words}\n`;
        output += `------------------------------------------------------------\n`;
        output += chunk.content + '\n';
    });

    // Prepend the totals at the top of the file
    output = `Total Chunks: ${chunks.length}\nTotal Words: ${totalWords}\n======================\n\n` + output;

    fs.writeFileSync('chunks_output.txt', output);
    console.log(`\n✅ Done! Summary saved to chunks_output.txt`);
    console.log(`Total Chunks: ${chunks.length}`);
    console.log(`Total Words: ${totalWords}`);
}

main().catch(console.error);
