# Nostr Event Publisher

This repository automatically publishes Nostr events when event templates are merged into the main branch.

## Setup

1. **Configure the NOSTR_NSEC secret:**
   - Go to your repository's Settings → Secrets and variables → Actions
   - Add a new repository secret named `NOSTR_NSEC`
   - Set the value to your Nostr private key in nsec format (e.g., `nsec1...`)

2. **Create event templates:**
   - Place JSON event templates in one of these directories:
     - `events/`
     - `nostr-events/`
     - `templates/`

## Event Template Format

Event templates should be JSON files with the following structure:

```json
{
  "kind": 1,
  "content": "Your event content here",
  "tags": [
    ["t", "tag1"],
    ["t", "tag2"],
    ["p", "pubkey_to_mention"]
  ],
  "relays": [
    "wss://relay.damus.io",
    "wss://nos.lol",
    "wss://relay.nostr.band"
  ]
}
```

### Fields:

- **kind** (optional): Nostr event kind (defaults to 1 for text notes)
- **content** (required): The text content of your event
- **tags** (optional): Array of tags in Nostr format
- **relays** (optional): Array of relay URLs to publish to (uses defaults if not specified)

## How it works

1. When you push changes to the main branch or merge a PR that includes changes to event template files
2. The GitHub Action automatically:
   - Detects changed JSON files in the specified directories
   - Signs each event using the configured NOSTR_NSEC
   - Publishes the signed events to the specified Nostr relays
   - Reports success/failure for each relay

## Default Relays

If no relays are specified in the template, events will be published to:
- wss://relay.damus.io
- wss://nos.lol
- wss://relay.nostr.band
- wss://nostr-pub.wellorder.net
- wss://relay.current.fyi

## Example Usage

1. Create a new event template:
   ```bash
   echo '{
     "kind": 1,
     "content": "Hello from GitHub Actions!",
     "tags": [["t", "automation"]]
   }' > events/my-event.json
   ```

2. Commit and push:
   ```bash
   git add events/my-event.json
   git commit -m "Add new Nostr event"
   git push
   ```

3. The event will be automatically signed and published to Nostr relays!

## Security Notes

- Keep your NOSTR_NSEC secret secure and never commit it to the repository
- The workflow only runs on the main branch to prevent unauthorized publishing
- Event templates are validated before signing and publishing