#!/usr/bin/env node

// Test script to verify nostr-tools functionality
async function testNostrTools() {
  try {
    console.log('Testing nostr-tools functionality...');
    
    // Import required functions using the correct module paths
    const { finalizeEvent, generateSecretKey, getPublicKey } = require('nostr-tools/pure');
    const nip19 = require('nostr-tools/nip19');
    
    // Generate a test private key
    const privateKey = generateSecretKey();
    const publicKey = getPublicKey(privateKey);
    
    console.log('✅ Successfully imported nostr-tools');
    console.log(`Generated public key: ${publicKey}`);
    
    // Create a test event
    const eventTemplate = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['t', 'test']],
      content: 'Test event from nostr-tools',
    };
    
    // Finalize the event
    const event = finalizeEvent(eventTemplate, privateKey);
    
    console.log('✅ Successfully created and signed event');
    console.log(`Event ID: ${event.id}`);
    console.log(`Event signature: ${event.sig.substring(0, 20)}...`);
    
    // Test nsec encoding/decoding
    const nsec = nip19.nsecEncode(privateKey);
    const decoded = nip19.decode(nsec);
    
    console.log('✅ Successfully encoded/decoded nsec');
    console.log(`nsec: ${nsec.substring(0, 20)}...`);
    
    console.log('\n🎉 All tests passed! nostr-tools is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  testNostrTools();
}

module.exports = { testNostrTools };