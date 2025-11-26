// ============================================
// Run All Examples
// ============================================

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const examples = [
  '01-basic-clustering.js',
  '02-http-server-cluster.js',
  '03-load-balancing-demo.js',
  '04-zero-downtime-restart.js',
  '05-cpu-intensive-tasks.js',
  '06-shared-state-management.js',
  '07-performance-comparison.js',
  '08-real-world-api-server.js',
  '09-graceful-shutdown.js'
];

async function runAll() {
  console.log('🚀 Running All Clustering Examples\n');
  console.log('='.repeat(60) + '\n');
  
  for (let i = 0; i < examples.length; i++) {
    const example = examples[i];
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running: ${example}`);
    console.log('='.repeat(60) + '\n');
    
    await runExample(example);
    
    // Small delay between examples
    await new Promise(resolve => setTimeout(resolve, 2000));
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
    
    // Auto-kill after 10 seconds for examples that run servers
    const timeout = setTimeout(() => {
      child.kill('SIGINT');
    }, 10000);
    
    child.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0 || code === 1 || code === null) {
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

