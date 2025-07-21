# Deployment script for FinTask Cloud Functions

Write-Host "Deploying FinTask Cloud Functions..."

# Set the Supabase URL and key if not already set
$supabaseUrl = Read-Host -Prompt "Enter your Supabase URL (press Enter to skip if already configured)"
if ($supabaseUrl) {
  Write-Host "Setting Supabase URL..."
  firebase functions:config:set supabase.url="$supabaseUrl"
}

$supabaseKey = Read-Host -Prompt "Enter your Supabase service role key (press Enter to skip if already configured)"
if ($supabaseKey) {
  Write-Host "Setting Supabase key..."
  firebase functions:config:set supabase.key="$supabaseKey"
}

# Set the user ID and email if not already set
$userId = Read-Host -Prompt "Enter your user ID (press Enter to skip if already configured)"
if ($userId) {
  Write-Host "Setting user ID..."
  firebase functions:config:set app.user_id="$userId"
}

$email = Read-Host -Prompt "Enter your email (press Enter to skip if already configured)"
if ($email) {
  Write-Host "Setting email..."
  firebase functions:config:set app.email="$email"
}

# Set the API key if not already set
$apiKey = Read-Host -Prompt "Enter your API key (press Enter to skip if already configured)"
if ($apiKey) {
  Write-Host "Setting API key..."
  firebase functions:config:set app.key="$apiKey"
}

# Deploy the functions
Write-Host "Deploying functions..."
firebase deploy --only functions

Write-Host "Deployment complete!"
Write-Host "You can test the function by running: node simple-test.js"