# FinTask Firebase Functions

This directory contains Firebase Cloud Functions for the FinTask application.

## Functions

### sendDailyTaskNotifications

A scheduled function that runs daily at 8:00 AM in each user's local timezone and sends push notifications for tasks due within the next 24 hours.

#### Features:
- Respects user's timezone (defaults to America/New_York if not set)
- Groups multiple tasks into a single notification
- Only sends notifications if tasks are due within 24 hours
- Handles errors gracefully for each user
- Supports both iOS and Android devices with platform-specific payloads
- Automatically cleans up invalid tokens

## Development

### Prerequisites
- Node.js 18 or later
- Firebase CLI: `npm install -g firebase-tools`

### Setup
1. Install dependencies: `npm install`
2. Login to Firebase: `firebase login`
3. Select project: `firebase use --add`

### Local Testing
```bash
npm run serve
```

### Deployment
```bash
npm run deploy
```

## Data Structure

### Required Collections

#### users
- `id`: User ID
- `timezone`: User's timezone (e.g., 'America/New_York')

#### todos
- `userId`: User ID
- `title`: Task title
- `dueDate`: Firestore timestamp
- `completed`: Boolean

#### userTokens
- `userId`: User ID
- `token`: FCM token for the user's device
- `deviceType`: Device type ('ios' or 'android')
- `createdAt`: Timestamp when the token was created