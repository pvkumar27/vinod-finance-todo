# Check API Key Restrictions

The 403 "unregistered callers" error suggests API key restrictions.

## Steps to check:

1. **Go to Google Cloud Console** → **APIs & Services** → **Credentials**
2. **Find your API key**: AIzaSyD7aka6dAL8A-YWW4mxkD_9WsWUlh9dqrM
3. **Click on the API key** to edit it
4. **Check "API restrictions"**:
   - Should have "Firebase Cloud Messaging API" enabled
   - Should have "Firebase Installations API" enabled
5. **Check "Application restrictions"**:
   - Should be "None" OR
   - Should include your domain: fintask.netlify.app

If there are restrictions, either:
- Remove them (set to "None")
- Add your domain to the allowed list

This should fix the 403 error.