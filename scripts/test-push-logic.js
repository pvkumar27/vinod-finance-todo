#!/usr/bin/env node

/**
 * Test script to verify push notification logic
 */

// Simulate the workflow parameter parsing
function testPushLogic() {
  console.log('Testing push notification logic...\n');

  // Test case 1: sendPush=true (from workflow)
  const sendPush1 = 'true' === 'true';
  console.log('Case 1: sendPush=true from workflow');
  console.log(`  sendPush value: ${sendPush1}`);
  console.log(`  Will send push: ${sendPush1 === true}`);
  
  // Test case 2: sendPush not provided
  const sendPush2 = undefined === 'true';
  console.log('\nCase 2: sendPush not provided');
  console.log(`  sendPush value: ${sendPush2}`);
  console.log(`  Will send push: ${sendPush2 === true}`);
  
  // Test case 3: sendPush=false
  const sendPush3 = 'false' === 'true';
  console.log('\nCase 3: sendPush=false');
  console.log(`  sendPush value: ${sendPush3}`);
  console.log(`  Will send push: ${sendPush3 === true}`);
  
  console.log('\n✅ Logic test complete');
}

testPushLogic();