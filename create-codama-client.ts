// Inspired from https://github.com/quiknode-labs/anchor-election-2025/blob/main/create-codama-client.ts
// Based on https://solana.stackexchange.com/questions/16703/can-anchor-client-be-used-with-solana-web3-js-2-0rc
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { createFromRoot } from 'codama';
import { type AnchorIdl, rootNodeFromAnchor } from '@codama/nodes-from-anchor';
import { renderJavaScriptVisitor } from '@codama/renderers';

// Find the Anchor IDL file and return the JSON object
const basePath = path.join('target', 'idl');
const dirPath = path.join(basePath);

const parseCodama = async (jsonFile: string) => {
  const filePath = path.join(dirPath, jsonFile);
  const parsedIdl = JSON.parse(
    await fs.readFile(filePath, 'utf8')
  ) as AnchorIdl;

  // Instantiate Codama
  const codama = createFromRoot(rootNodeFromAnchor(parsedIdl));

  // Render JavaScript.
  const programName = jsonFile.replace('.json', '');
  const generatedPath = path.join('dist', programName);
  await codama.accept(renderJavaScriptVisitor(generatedPath));
  console.log(`Generated codama for ${programName} at ${generatedPath}`);
};

try {
  // Read the directory contents
  const files = await fs.readdir(dirPath);
  const jsonFiles = files.filter((file) => file.endsWith('.json'));

  if (jsonFiles.length === 0) {
    throw new Error(`No JSON files found in ${dirPath}`);
  }

  const parsePromises: Array<Promise<void>> = [];

  for (const jsonFile of jsonFiles) {
    parsePromises.push(parseCodama(jsonFile));
  }

  await Promise.all(parsePromises);
} catch (error) {
  if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
    throw new Error(`Failed to load IDL: ${dirPath} does not exist`);
  }

  throw error;
}
