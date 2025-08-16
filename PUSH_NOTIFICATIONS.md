# 📱 Push Notifications for FinTask PWA

## Overview
FinTask now supports **Web Push Notifications** for iPhone 16 Pro Max and other modern devices. This implementation uses the native Web Push API (no Firebase required) and is completely **free**.

## ✅ Features Implemented

### 🔔 Core Notification System
- **Web Push API** integration for iOS 16.4+ and modern browsers
- **Service Worker** handling for background notifications
- **Permission management** with user-friendly UI
- **Local notifications** for immediate alerts

### 📱 FinTask-Specific Notifications
- **Daily reminders** (morning & evening financial check-ins)
- **Credit card alerts** (inactive cards, payment reminders)
- **Task notifications** (overdue todos, deadline alerts)
- **Expense tracking** reminders

### 🎯 Smart Scheduling
- **Daily reminders**: 9 AM & 7 PM
- **Weekly reviews**: Sunday 10 AM credit card check
- **Event-driven**: Overdue tasks, inactive cards
- **Background sync** for offline scenarios

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate VAPID Keys
```bash
npm run generate-vapid
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and add your VAPID keys:
```env
REACT_APP_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=your_email@example.com
```

### 4. Test on iPhone 16 Pro Max
1. Open FinTask in Safari
2. Add to Home Screen (required for notifications)
3. Go to Insights tab → Notifications section
4. Enable notifications
5. Test with "Test Notification" button

## 📋 Usage

### For Users
1. **Enable Notifications**: Go to Insights → Notifications → Enable
2. **Add to Home Screen**: Required for iOS push notifications
3. **Grant Permission**: Allow notifications when prompted
4. **Receive Reminders**: Get daily financial reminders

### For Developers
```javascript
import PushNotificationService from './services/pushNotifications';
import { useNotifications } from './hooks/useNotifications';

// Send custom notification
await PushNotificationService.showLocalNotification(
  '💰 Payment Due',
  { body: 'Your credit card payment is due tomorrow' }
);

// Use React hook
const { requestPermission, sendTestNotification } = useNotifications();
```

## 🔧 Technical Implementation

### Files Created/Modified
- `src/services/pushNotifications.js` - Core push service
- `src/components/NotificationSettings.js` - UI component
- `src/hooks/useNotifications.js` - React hook
- `src/utils/notificationScheduler.js` - Scheduling logic
- `src/service-worker.js` - Background handling
- `public/manifest.json` - PWA permissions

### Architecture
```
User Action → React Component → Push Service → Service Worker → iOS Notification
```

## 📱 iOS Compatibility

### Requirements
- **iOS 16.4+** (iPhone 16 Pro Max ✅)
- **Safari browser**
- **PWA installed** (Add to Home Screen)
- **User permission** granted

### Limitations
- Only works when PWA is installed to home screen
- Requires user interaction to enable
- Limited to Safari on iOS (no Chrome support)

## 🔒 Privacy & Security

### Data Handling
- **No third-party services** (no Firebase, OneSignal, etc.)
- **Local storage only** for subscription data
- **User consent required** for all notifications
- **No tracking** or analytics

### Security Features
- **VAPID authentication** for server verification
- **Origin validation** in service worker
- **Secure HTTPS** required for push notifications

## 🧪 Testing

### Manual Testing
1. Enable notifications in Insights tab
2. Use "Test Notification" button
3. Check notification appears in iOS notification center
4. Verify clicking opens FinTask

### Automated Testing
```bash
# Test notification service
npm test -- --testPathPattern=pushNotifications

# Test React components
npm test -- --testPathPattern=NotificationSettings
```

## 🚀 Deployment

### Production Checklist
- [ ] VAPID keys configured in environment
- [ ] HTTPS enabled (required for push notifications)
- [ ] Service worker registered correctly
- [ ] Manifest.json includes notification permissions
- [ ] PWA installable on iOS

### Environment Variables
```env
# Production
REACT_APP_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIUHI-lzSAAmhBhiQHHWHMrMqpXXXXXXXXXXXXXXXXXXXXXXXXXXX
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=notifications@fintask.app
```

## 🔮 Future Enhancements

### Planned Features
- **Smart timing** based on user behavior
- **Rich notifications** with action buttons
- **Notification history** and analytics
- **Custom reminder schedules**
- **Integration with calendar** for payment due dates

### Potential Integrations
- **Supabase functions** for server-side push
- **AI-powered** notification content
- **Geolocation** for spending reminders
- **Biometric** authentication for sensitive alerts

## 🐛 Troubleshooting

### Common Issues

**Notifications not appearing on iPhone:**
- Ensure PWA is installed (Add to Home Screen)
- Check iOS Settings → FinTask → Notifications
- Verify Safari allows notifications

**Permission denied:**
- Clear browser data and try again
- Check Safari Settings → Websites → Notifications
- Ensure HTTPS is enabled

**Service worker not registering:**
- Check browser console for errors
- Verify service-worker.js is accessible
- Clear cache and reload

### Debug Commands
```bash
# Check service worker status
navigator.serviceWorker.getRegistrations()

# Check notification permission
Notification.permission

# Test notification manually
new Notification('Test', { body: 'Testing...' })
```

## 📞 Support

For issues with push notifications:
1. Check browser console for errors
2. Verify PWA installation on iOS
3. Test with simple notification first
4. Check environment variables are set

---

**FinTask v3.5.0** - Now with native iOS push notifications! 🎉