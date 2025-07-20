# Node.js Runtime Upgrade Plan

## Current Status
- Firebase Functions is using Node.js 18 runtime
- This runtime will be deprecated on 2025-04-30
- It will be decommissioned on 2025-10-30

## Upgrade Steps

### 1. Update package.json in functions directory
```json
{
  "engines": {
    "node": "20"
  }
}
```

### 2. Update dependencies
```bash
cd functions
npm install firebase-functions@latest firebase-admin@latest
```

### 3. Test locally
```bash
firebase emulators:start --only functions
```

### 4. Deploy with new runtime
```bash
firebase deploy --only functions
```

### 5. Verify functionality
- Test push notifications
- Test email notifications
- Check function logs for any errors

## Timeline
- Plan to complete this upgrade by Q1 2025
- Schedule a maintenance window for the upgrade
- Notify users of potential brief service interruption

## Potential Issues
- Breaking changes in firebase-functions API
- Compatibility issues with other dependencies
- Need to update code to match new API requirements

## Resources
- [Firebase Functions Runtime Support](https://cloud.google.com/functions/docs/runtime-support)
- [Firebase Functions Migration Guide](https://firebase.google.com/docs/functions/beta/migrate)