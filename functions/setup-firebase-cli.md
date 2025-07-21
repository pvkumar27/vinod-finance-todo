# Setting Up Firebase CLI

Since we can't perform interactive login in this environment, follow these steps to set up Firebase CLI:

## 1. Install Firebase CLI (already done)
```bash
npm install -g firebase-tools
```

## 2. Login to Firebase
Run this command in your terminal:
```bash
firebase login
```

## 3. Check Firebase Functions Logs
After logging in, run:
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