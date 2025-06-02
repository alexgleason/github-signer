#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function validateEventTemplate(filePath) {
  try {
    console.log(`Validating: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File does not exist');
    }
    
    // Parse JSON
    const content = fs.readFileSync(filePath, 'utf8');
    const event = JSON.parse(content);
    
    // Validate required fields
    if (typeof event.content !== 'string') {
      throw new Error('Missing or invalid "content" field (must be string)');
    }
    
    // Validate optional fields
    if (event.kind !== undefined && (!Number.isInteger(event.kind) || event.kind < 0)) {
      throw new Error('Invalid "kind" field (must be non-negative integer)');
    }
    
    if (event.tags !== undefined) {
      if (!Array.isArray(event.tags)) {
        throw new Error('Invalid "tags" field (must be array)');
      }
      
      event.tags.forEach((tag, index) => {
        if (!Array.isArray(tag)) {
          throw new Error(`Invalid tag at index ${index} (must be array)`);
        }
        if (tag.length === 0) {
          throw new Error(`Empty tag at index ${index}`);
        }
        if (typeof tag[0] !== 'string') {
          throw new Error(`Invalid tag type at index ${index} (first element must be string)`);
        }
      });
    }
    
    if (event.relays !== undefined) {
      if (!Array.isArray(event.relays)) {
        throw new Error('Invalid "relays" field (must be array)');
      }
      
      event.relays.forEach((relay, index) => {
        if (typeof relay !== 'string') {
          throw new Error(`Invalid relay at index ${index} (must be string)`);
        }
        if (!relay.startsWith('wss://') && !relay.startsWith('ws://')) {
          console.warn(`Warning: Relay at index ${index} should use wss:// or ws:// protocol`);
        }
      });
    }
    
    console.log('✅ Event template is valid!');
    console.log(`   Kind: ${event.kind || 1}`);
    console.log(`   Content length: ${event.content.length} characters`);
    console.log(`   Tags: ${event.tags ? event.tags.length : 0}`);
    console.log(`   Relays: ${event.relays ? event.relays.length : 'default'}`);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Validation failed: ${error.message}`);
    return false;
  }
}

// Command line usage
if (require.main === module) {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('Usage: node validate-event.js <event-template.json>');
    process.exit(1);
  }
  
  const isValid = validateEventTemplate(filePath);
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateEventTemplate };