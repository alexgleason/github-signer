# Troubleshooting Guide

## Common Issues and Solutions

### 1. "getSignature is not a function" Error

**Problem**: This error occurs when using an older version of the workflow with newer versions of `nostr-tools`.

**Solution**: The workflow has been updated to use `finalizeEvent` instead of the deprecated `getSignature` function. Make sure you're using the latest version of the workflow.

**What changed**:
- Old API: `getSignature(event, privateKey)`
- New API: `finalizeEvent(eventTemplate, privateKey)`

### 2. "pub.on is not a function" Error

**Problem**: This error occurs when the `SimplePool.publish()` method returns a different object type than expected.

**Solution**: The workflow has been updated to use individual `Relay` connections instead of `SimplePool`. This provides more reliable publishing.

**What changed**:
- Old API: `pool.publish([relay], event)` returns object with `.on()` method
- New API: `relay.publish(event)` on individual relay connections

### 3. nostr-tools Import Errors

**Problem**: Module import failures or version conflicts.

**Solutions**:
1. **Update nostr-tools version**:
   ```bash
   npm install nostr-tools@^2.5.0
   ```

2. **Test the installation**:
   ```bash
   npm run test-nostr
   ```

3. **Clear npm cache if needed**:
   ```bash
   npm cache clean --force
   npm install
   ```

### 4. WebSocket Connection Issues

**Problem**: Relay connection failures or timeouts.

**Symptoms**:
- "Failed to publish to any relays"
- Connection timeout errors
- WebSocket errors

**Solutions**:
1. **Check relay status**: Some relays may be temporarily down
2. **Use different relays**: Try updating your event template with different relay URLs
3. **Increase timeout**: The workflow uses a 15-second timeout per relay

**Example of custom relays in event template**:
```json
{
  "content": "Your message",
  "relays": [
    "wss://relay.damus.io",
    "wss://nos.lol",
    "wss://relay.snort.social"
  ]
}
```

### 5. Invalid nsec Format

**Problem**: "Invalid nsec format" error.

**Solutions**:
1. **Check nsec format**: Must start with `nsec1`
2. **Remove extra characters**: No spaces, newlines, or quotes
3. **Verify in repository secrets**: Check the `NOSTR_NSEC` secret value

**Valid nsec example**: `nsec1abc123def456...` (64 characters after nsec1)

### 6. GitHub Actions Workflow Not Triggering

**Problem**: Workflow doesn't run when files are changed.

**Check these**:
1. **File location**: JSON files must be in `events/`, `nostr-events/`, or `templates/` directories
2. **Branch**: Must push to `main` or `master` branch
3. **File extension**: Must be `.json` files
4. **Repository secrets**: `NOSTR_NSEC` must be configured

### 7. Event Validation Errors

**Problem**: JSON parsing or validation errors.

**Solutions**:
1. **Validate JSON syntax**:
   ```bash
   node validate-event.js events/your-event.json
   ```

2. **Check required fields**:
   - `content` (string, required)
   - `kind` (number, optional, defaults to 1)
   - `tags` (array, optional)
   - `relays` (array, optional)

3. **Example valid event**:
   ```json
   {
     "kind": 1,
     "content": "Hello Nostr!",
     "tags": [["t", "test"]],
     "relays": ["wss://relay.damus.io"]
   }
   ```

## Testing Locally

### 1. Test nostr-tools Installation
```bash
npm install
npm run test-nostr
```

### 2. Validate Event Templates
```bash
# Single file
npm run validate events/example-event.json

# All files
npm run validate-all
```

### 3. Test Publishing (with your own nsec)
```bash
export NOSTR_NSEC="your_nsec_here"
npm run publish events/example-event.json
```

## Debug Mode

To get more detailed logs, you can modify the workflow or run locally with debug output:

```bash
# Enable debug logging
export DEBUG=1
node publish-nostr-standalone.js events/your-event.json
```

## Getting Help

1. **Check GitHub Actions logs**: Go to Actions tab → Click on failed workflow → View logs
2. **Validate locally first**: Use the validation and test scripts
3. **Check relay status**: Visit relay URLs in browser to see if they're responding
4. **Verify secrets**: Make sure `NOSTR_NSEC` is properly configured

## API Reference Changes

### nostr-tools v2.x Changes:
- ✅ Use `finalizeEvent(template, privateKey)` 
- ❌ Don't use `getSignature(event, privateKey)` (deprecated)
- ✅ Use `generateSecretKey()` for new keys
- ✅ Use `getPublicKey(privateKey)` for public keys
- ✅ Use `nip19.nsecEncode()` and `nip19.decode()` for key conversion

### Working Example:
```javascript
const { Relay, finalizeEvent, generateSecretKey, getPublicKey, nip19 } = require('nostr-tools');

// Create event template
const template = {
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: 'Hello Nostr!'
};

// Sign and finalize
const event = finalizeEvent(template, privateKey);

// Publish to relay
const relay = new Relay('wss://relay.damus.io');
await relay.connect();
const pub = relay.publish(event);

pub.on('ok', () => {
  console.log('Published successfully!');
  relay.close();
});

pub.on('failed', (reason) => {
  console.log('Failed to publish:', reason);
  relay.close();
});
```