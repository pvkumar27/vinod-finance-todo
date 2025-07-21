# Setting Up Firebase CLI

Follow these steps to set up Firebase CLI and fix the email notification issue:

## 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

## 2. Login to Firebase
```bash
firebase login
```

## 3. Check Firebase Functions Logs
```bash
cd c:\Users\pvkum\vinod-pwa
firebase functions:log
```

## 4. Check Current Configuration
```bash
firebase functions:config:get
```

## 5. Set Email Configuration
Replace with your actual email:
```bash
firebase functions:config:set app.email="your-actual-email@example.com"
```

## 6. Deploy Updated Configuration
```bash
firebase deploy --only functions
```

## 7. Test the Function
Manually trigger the function to test:
```bash
curl -X POST "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/sendDailyTaskReminders?key=YOUR_API_KEY&sendPush=true"
```

## Alternative: Use the Helper Scripts

1. Set your email:
```bash
cd functions
node set-email-config.js your-email@example.com
```

2. Check email configuration (requires service account):
```bash
node check-email-config.js
```