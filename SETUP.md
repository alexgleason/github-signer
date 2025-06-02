# Setup Guide

## 1. Configure Repository Secret

To use this Nostr event publisher, you need to configure your Nostr private key as a repository secret:

### Step-by-step:

1. **Generate or get your Nostr private key in nsec format:**
   - If you don't have one, you can generate it using any Nostr client
   - Your private key should look like: `nsec1...` (starts with nsec1)

2. **Add the secret to your GitHub repository:**
   - Go to your repository on GitHub
   - Click on **Settings** (in the repository menu)
   - In the left sidebar, click **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `NOSTR_NSEC`
   - Value: Your private key (e.g., `nsec1abc123...`)
   - Click **Add secret**

## 2. Test the Setup

1. **Create a test event:**
   ```bash
   echo '{
     "kind": 1,
     "content": "Testing my GitHub Actions Nostr publisher! 🚀",
     "tags": [["t", "test"]]
   }' > events/test-event.json
   ```

2. **Validate the event (optional):**
   ```bash
   node validate-event.js events/test-event.json
   ```

3. **Commit and push:**
   ```bash
   git add events/test-event.json
   git commit -m "Add test Nostr event"
   git push
   ```

4. **Check the Actions tab:**
   - Go to the **Actions** tab in your repository
   - You should see the "Publish Nostr Event" workflow running
   - Click on it to see the logs and verify it published successfully

## 3. Directory Structure

The workflow monitors these directories for JSON files:
```
your-repo/
├── events/           # Recommended for general events
├── nostr-events/     # Alternative directory name
├── templates/        # Alternative directory name
└── .github/
    └── workflows/
        └── publish-nostr-event.yml
```

## 4. Security Best Practices

- ✅ **DO**: Keep your NOSTR_NSEC secret secure
- ✅ **DO**: Use repository secrets (never commit private keys)
- ✅ **DO**: Test with a dedicated key first
- ❌ **DON'T**: Share your private key
- ❌ **DON'T**: Commit private keys to the repository
- ❌ **DON'T**: Use your main identity key for testing

## 5. Troubleshooting

### Common Issues:

1. **"NOSTR_NSEC environment variable is required"**
   - Make sure you've added the `NOSTR_NSEC` secret to your repository
   - Check the secret name is exactly `NOSTR_NSEC` (case-sensitive)

2. **"Invalid nsec format"**
   - Ensure your private key starts with `nsec1`
   - Make sure there are no extra spaces or characters

3. **"Failed to publish to any relays"**
   - Check if the relays in your template are online
   - Try using the default relays (remove the "relays" field from your template)

4. **Workflow doesn't trigger**
   - Make sure your JSON files are in the monitored directories
   - Check that you're pushing to the main/master branch
   - Verify the file paths match the workflow configuration

### Getting Help:

- Check the Actions logs for detailed error messages
- Validate your event templates using `node validate-event.js <file>`
- Test with a simple event first before trying complex ones