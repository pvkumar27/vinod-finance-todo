#!/bin/bash
# Script to update notification email address

# Check if email is provided
if [ -z "$1" ]; then
  echo "Please provide your email address"
  echo "Usage: ./update-notification-email.sh your-email@example.com"
  exit 1
fi

# Update Firebase Functions configuration
echo "Updating notification email to: $1"
firebase functions:config:set app.email="$1"

# Deploy the updated configuration
echo "Deploying updated configuration..."
firebase deploy --only functions

echo "Done! Notifications will now be sent to: $1"