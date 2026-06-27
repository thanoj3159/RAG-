import { ChromaClient } from 'chromadb';

const client = new ChromaClient({ path: 'http://localhost:8000' });
const collection = await client.getOrCreateCollection({ name: 'pdf-collection' });

const target = process.argv[2];

if (!target) {
  const all = await collection.get({ include: ['metadatas'] });
  const sources = [...new Set(all.metadatas.map(m => m.source))];
  console.log('Files in pdf-collection:');
  for (const s of sources) {
    const count = all.metadatas.filter(m => m.source === s).length;
    console.log(`  ${count} chunks  -  ${s}`);
  }
} else if (target === '--all') {
  await collection.delete({ where: {} });
  console.log('Deleted ALL chunks.');
} else {
  await collection.delete({ where: { source: target } });
  console.log(`Deleted chunks where source = "${target}"`);
}

const after = await collection.count();
console.log(`Remaining: ${after}`);
