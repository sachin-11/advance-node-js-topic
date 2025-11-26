// ============================================
// Run All Examples
// ============================================

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const examples = [
  {
    file: '01-blocking-vs-nonblocking.js',
    name: 'Blocking vs Non-Blocking',
    timeout: 30000
  },
  {
    file: '02-1000-concurrent-requests.js',
    name: '1000 Concurrent Requests',
    timeout: 60000
  },
  {
    file: '03-event-loop-phases.js',
    name: 'Event Loop Phases',
    timeout: 5000
  },
  {
    file: '04-microtask-vs-macrotask.js',
    name: 'Microtask vs Macrotask',
    timeout: 5000
  },
  {
    file: '05-throughput-comparison.js',
    name: 'Throughput Comparison',
    timeout: 120000
  }
];

async function runAll() {
  console.log('🚀 Running All Event Loop Performance Examples\n');
  console.log('='.repeat(60) + '\n');
  
  for (let i = 0; i < examples.length; i++) {
    const example = examples[i];
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running: ${example.name}`);
    console.log(`File: ${example.file}`);
    console.log('='.repeat(60) + '\n');
    
    await runExample(example);
    
    // Small delay between examples
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All examples completed!');
  console.log('='.repeat(60));
}

function runExample({ file, name, timeout }) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [file], {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    // Auto-kill after timeout
    const timeoutHandle = setTimeout(() => {
      console.log(`\n⏰ Timeout reached for ${name}, stopping...`);
      child.kill('SIGINT');
    }, timeout);
    
    child.on('close', (code) => {
      clearTimeout(timeoutHandle);
      if (code === 0 || code === 1 || code === null) {
        resolve();
      } else {
        reject(new Error(`Example ${file} exited with code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

// Run all examples
runAll().catch(console.error);

