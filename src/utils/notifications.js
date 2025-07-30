import { getToken, onMessage } from 'firebase/messaging';
import { signInAnonymously } from 'firebase/auth';
import { messaging, auth } from '../firebase-config';
import { supabase } from '../supabaseClient';

export const requestNotificationPermission = async () => {
  // Check if we're in a test environment
  if (
    typeof window === 'undefined' ||
    window.navigator.userAgent.includes('Playwright')
  ) {
    console.log('Messaging not supported in test environment');
    return null;
  }
  
  // Check if basic notifications are supported
  if (!('Notification' in window)) {
    console.log('Notifications not supported in this browser');
    return null;
  }
  
  // If Firebase messaging is not available, fall back to basic notifications
  if (!messaging || !navigator.serviceWorker) {
    console.log('Firebase messaging not available - using basic notifications');
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Basic notification permission granted');
      return 'basic-notifications-enabled';
    }
    return null;
  }

  try {
    // First, register service worker if needed
    if ('serviceWorker' in navigator) {
      try {
        // Check if firebase-messaging-sw.js is registered
        const registrations = await navigator.serviceWorker.getRegistrations();
        const hasFirebaseMessagingSW = registrations.some(
          reg => reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')
        );

        if (!hasFirebaseMessagingSW) {
          console.log('Registering Firebase messaging service worker...');
          await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('Firebase messaging service worker registered');
        }
      } catch (swError) {
        console.error('Error registering service worker:', swError);
      }
    }

    // Now request permission
    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log('Permission result:', permission);

    if (permission === 'granted') {
      console.log('Notification permission granted.');

      // VAPID key for web push notifications
      const vapidKey =
        process.env.REACT_APP_FIREBASE_VAPID_KEY ||
        process.env.VITE_FIREBASE_VAPID_KEY ||
        'BJbhCDjg0hLxllQlzsveswOa1s5wN0sqRG7opcfI9UAP4UPMeztPd5gI1t1chiHpYbc0cmFB7ZvqvF02we4FSug';

      console.log('Using VAPID key:', vapidKey);

      try {
        // Use Supabase user session for Firebase authentication
        if (auth) {
          try {
            // Get current Supabase session with access token
            const { data: { session } } = await supabase.auth.getSession();
            console.log('Supabase session check:', { session: !!session, user: !!session?.user, email: session?.user?.email });
            
            if (session && session.user) {
              console.log('Using Supabase user for Firebase auth:', session.user.email);
              
              // Try to use Supabase JWT as Firebase custom token
              const { signInWithCustomToken } = await import('firebase/auth');
              
              try {
                // Try signing in with email (using a dummy password)
                const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');
                
                try {
                  // Try to sign in with email and a default password
                  await signInWithEmailAndPassword(auth, session.user.email, 'defaultPassword123');
                  console.log('Signed in to Firebase with email/password');
                  
                  // Get ID token for FCM authentication
                  const user = auth.currentUser;
                  if (user) {
                    const idToken = await user.getIdToken();
                    console.log('Got Firebase ID token for FCM:', idToken.substring(0, 20) + '...');
                  }
                } catch (signInError) {
                  console.log('Email sign-in failed, trying to create user:', signInError.message);
                  
                  try {
                    // If sign-in fails, try to create the user
                    await createUserWithEmailAndPassword(auth, session.user.email, 'defaultPassword123');
                    console.log('Created and signed in to Firebase with email/password');
                    
                    // Get ID token for FCM authentication
                    const user = auth.currentUser;
                    if (user) {
                      const idToken = await user.getIdToken();
                      console.log('Got Firebase ID token for FCM:', idToken.substring(0, 20) + '...');
                    }
                  } catch (createError) {
                    console.log('User creation failed, using anonymous:', createError.message);
                    await signInAnonymously(auth);
                    console.log('Signed in anonymously to Firebase');
                  }
                }
              } catch (authError) {
                console.log('Firebase email auth failed, using anonymous:', authError.message);
                await signInAnonymously(auth);
                console.log('Signed in anonymously to Firebase');
              }
            } else {
              await signInAnonymously(auth);
              console.log('Signed in anonymously to Firebase');
            }
          } catch (authError) {
            console.log('Firebase auth failed:', authError.message);
          }
        }
        
        // Special handling for iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           window.navigator.standalone === true;
        
        console.log('Device info:', { isIOS, isStandalone });
        
        // For iOS PWA, we need to pass the service worker registration
        const registration = await navigator.serviceWorker.ready;
        console.log('Using service worker registration for FCM token');
        
        // Get token with VAPID key and service worker registration
        const token = await getToken(messaging, {
          vapidKey: vapidKey,
          serviceWorkerRegistration: registration
        });

        if (token && typeof token === 'string' && token.length > 20) {
          console.log(
            'FCM Token:',
            token.substring(0, 10) + '...' + token.substring(token.length - 5)
          );

          // Send a test notification to verify it's working
          new Notification('FinTask Notifications Enabled', {
            body: 'You will now receive notifications from FinTask!',
            icon: '/icons/official-logo.png',
          });

          return token;
        } else {
          console.log('No valid registration token available.');
          return null;
        }
      } catch (tokenError) {
        console.error('Error getting FCM token:', tokenError);
        console.error('FCM Error details:', {
          code: tokenError.code,
          message: tokenError.message,
          customData: tokenError.customData,
          stack: tokenError.stack
        });
        
        // If FCM token fails, still show basic notification support
        console.log('FCM token generation failed, but basic notifications are enabled');
        new Notification('FinTask Notifications Enabled', {
          body: 'Basic notifications are working! (FCM token generation failed)',
          icon: '/icons/official-logo.png',
        });
        
        // Return a placeholder token so the app knows notifications are enabled
        return 'basic-notifications-enabled';
      }
    } else {
      console.log('Unable to get permission to notify:', permission);
      return null;
    }
  } catch (error) {
    console.error('An error occurred while setting up notifications:', error);
    return null;
  }
};

export const setupForegroundMessageListener = () => {
  // Check if we're in a test environment
  if (
    typeof window === 'undefined' ||
    window.navigator.userAgent.includes('Playwright')
  ) {
    console.log('Messaging not supported in test environment');
    return;
  }
  
  // If Firebase messaging is not available, just log it
  if (!messaging || !navigator.serviceWorker) {
    console.log('Firebase messaging not available - foreground messages will use basic notifications');
    return;
  }

  onMessage(messaging, payload => {
    console.log('Message received in foreground:', payload);

    const title = payload.notification?.title || 'FinTask';
    const body = payload.notification?.body || 'You have a new notification';

    // Show custom toast or alert
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/icons/official-logo.png',
        badge: '/icons/official-logo.png',
        tag: 'fintask-foreground',
      });
    } else {
      // Fallback to alert
      alert(`${title}: ${body}`);
    }
  });
};
