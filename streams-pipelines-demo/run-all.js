// ============================================
// Run All Examples
// ============================================

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const examples = [
  '01-basic-streams.js',
  '02-pipelines.js',
  '03-file-streaming.js',
  '04-transform-streams.js',
  '05-csv-processing.js',
  '06-http-streaming.js',
  '07-large-file-handling.js',
  '08-log-processing.js',
  '09-backpressure-handling.js'
];

async function runAll() {
  console.log('🚀 Running All Streams & Pipelines Examples\n');
  console.log('='.repeat(60) + '\n');
  
  for (let i = 0; i < examples.length; i++) {
    const example = examples[i];
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running: ${example}`);
    console.log('='.repeat(60) + '\n');
    
    await runExample(example);
    
    // Small delay between examples
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All examples completed!');
  console.log('='.repeat(60));
}

function runExample(filename) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [filename], {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code === 0 || code === 1) {
        resolve();
      } else {
        reject(new Error(`Example ${filename} exited with code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

// Run all examples
runAll().catch(console.error);

