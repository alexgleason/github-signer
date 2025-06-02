#!/usr/bin/env node

const fs = require('fs');

async function publishNostrEvent(templatePath, nsec) {
  try {
    console.log(`Processing template: ${templatePath}`);
    
    // Dynamic import to handle potential module issues
    let nostrTools;
    try {
      nostrTools = require('nostr-tools');
    } catch (error) {
      console.error('Failed to import nostr-tools:', error.message);
      console.log('Trying to install nostr-tools...');
      const { execSync } = require('child_process');
      execSync('npm install nostr-tools@^2.5.0', { stdio: 'inherit' });
      nostrTools = require('nostr-tools');
    }
    
    const { SimplePool, finalizeEvent, nip19, getPublicKey } = nostrTools;
    
    // Import WebSocket
    const WebSocket = require('ws');
    global.WebSocket = WebSocket;
    
    // Read the event template
    const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    
    // Decode the private key
    const { type, data } = nip19.decode(nsec);
    if (type !== 'nsec') {
      throw new Error('Invalid nsec format');
    }
    const privateKey = data;
    
    // Create the event template
    const eventTemplate = {
      kind: template.kind || 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: template.tags || [],
      content: template.content || '',
    };
    
    console.log('Event template:', JSON.stringify(eventTemplate, null, 2));
    
    // Finalize the event (this will add pubkey, id, and sig)
    const event = finalizeEvent(eventTemplate, privateKey);
    
    console.log('Finalized event:', JSON.stringify(event, null, 2));
    
    // Default relays (can be overridden in template)
    const defaultRelays = [
      'wss://relay.damus.io',
      'wss://nos.lol',
      'wss://relay.nostr.band',
      'wss://nostr-pub.wellorder.net',
      'wss://relay.current.fyi'
    ];
    
    const relays = template.relays || defaultRelays;
    
    // Publish to relays
    const pool = new SimplePool();
    
    console.log(`Publishing to ${relays.length} relays...`);
    
    const publishPromises = relays.map(async (relay) => {
      try {
        console.log(`Publishing to ${relay}...`);
        
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`Timeout publishing to ${relay}`));
          }, 15000); // Increased timeout
          
          try {
            const pub = pool.publish([relay], event);
            
            pub.on('ok', () => {
              clearTimeout(timeout);
              console.log(`✅ Successfully published to ${relay}`);
              resolve(relay);
            });
            
            pub.on('failed', (reason) => {
              clearTimeout(timeout);
              console.log(`❌ Failed to publish to ${relay}: ${reason}`);
              reject(new Error(`Failed to publish to ${relay}: ${reason}`));
            });
            
          } catch (error) {
            clearTimeout(timeout);
            reject(error);
          }
        });
        
      } catch (error) {
        console.log(`❌ Error with ${relay}: ${error.message}`);
        throw error;
      }
    });
    
    // Wait for all publications (with some tolerance for failures)
    const results = await Promise.allSettled(publishPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`\nPublication summary:`);
    console.log(`✅ Successful: ${successful}/${relays.length}`);
    console.log(`❌ Failed: ${failed}/${relays.length}`);
    
    // Log failed relays for debugging
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.log(`❌ ${relays[index]}: ${result.reason.message}`);
      }
    });
    
    if (successful === 0) {
      throw new Error('Failed to publish to any relays');
    }
    
    console.log(`\n🎉 Event published successfully to ${successful} relay(s)!`);
    console.log(`Event ID: ${event.id}`);
    console.log(`Public key: ${event.pubkey}`);
    
    // Close the pool
    pool.close(relays);
    
    // Give some time for connections to close
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    console.error('Error publishing Nostr event:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Get command line arguments
const templatePath = process.argv[2];
const nsec = process.env.NOSTR_NSEC;

if (!templatePath) {
  console.error('Usage: node publish-nostr-standalone.js <template-path>');
  console.error('Environment variable NOSTR_NSEC must be set');
  process.exit(1);
}

if (!nsec) {
  console.error('NOSTR_NSEC environment variable is required');
  process.exit(1);
}

publishNostrEvent(templatePath, nsec);