// ============================================
// Run All Examples
// ============================================
// This file runs all examples sequentially with delays

const { spawn } = require('child_process');
const path = require('path');

const examples = [
  '01-basic-flow.js',
  '02-event-loop-phases.js',
  '03-nexttick-vs-promise.js',
  '04-microtask-queue.js',
  '05-timers.js',
  '06-io-operations.js',
  '07-setimmediate-vs-settimeout.js',
  '08-advanced-scenarios.js',
  '09-microtask-vs-macrotask.js',
  '10-non-blocking-architecture.js'
];

async function runAll() {
  console.log('🚀 Running All Event Loop Examples\n');
  console.log('='.repeat(60) + '\n');
  
  for (let i = 0; i < examples.length; i++) {
    const example = examples[i];
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running: ${example}`);
    console.log('='.repeat(60) + '\n');
    
    await runExample(example);
    
    // Small delay between examples
    await new Promise(resolve => setTimeout(resolve, 500));
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
      if (code === 0) {
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

