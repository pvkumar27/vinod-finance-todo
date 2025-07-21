/**
 * Script to update the Cloud Function to connect to Supabase
 * 
 * This script will:
 * 1. Add the Supabase client to the Cloud Function
 * 2. Update the query to use Supabase instead of Firestore
 */
const fs = require('fs');
const path = require('path');

// Path to the index.js file
const indexPath = path.join(__dirname, 'index.js');

// Read the current file
let content = fs.readFileSync(indexPath, 'utf8');

// Add Supabase client to the imports
const importsRegex = /const functions = require\('firebase-functions'\);\nconst admin = require\('firebase-admin'\);/;
const newImports = `const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');`;

// Replace the imports
let updatedContent = content.replace(importsRegex, newImports);

// Add Supabase client initialization after admin.initializeApp()
const initRegex = /admin\.initializeApp\(\);/;
const newInit = `admin.initializeApp();

// Initialize Supabase client
const initSupabase = () => {
  const supabaseUrl = functions.config().supabase.url;
  const supabaseKey = functions.config().supabase.key;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or key not configured');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
};`;

// Replace the initialization
updatedContent = updatedContent.replace(initRegex, newInit);

// Find the query section
const queryRegex = /\/\/ Query for incomplete tasks due today or earlier[\s\S]*?\.get\(\);/;

// New query that uses Supabase
const newQuery = `// Query for incomplete tasks due today or earlier
    // Get the user email from the config
    const userEmail = functions.config().app.email || 'pvkumar27@gmail.com';
    console.log(\`Filtering tasks for user: \${userEmail}\`);
    
    // Initialize Supabase client
    const supabase = initSupabase();
    if (!supabase) {
      console.error('Failed to initialize Supabase client');
      return res.status(500).send('Failed to initialize Supabase client');
    }
    
    // Convert timestamps to ISO strings for Supabase
    const endDateISO = endOfDay.toISOString();
    
    // Query Supabase for incomplete tasks due today or earlier
    const { data: tasks, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_email', userEmail)
      .eq('completed', false)
      .lte('due_date', endDateISO)
      .order('due_date', { ascending: true });
    
    if (error) {
      console.error('Error querying Supabase:', error);
      return res.status(500).send(\`Error: \${error.message}\`);
    }
    
    // Create a mock snapshot for compatibility with the rest of the function
    const tasksSnapshot = {
      empty: tasks.length === 0,
      size: tasks.length,
      forEach: (callback) => tasks.forEach(callback),
      docs: tasks.map(task => ({
        id: task.id,
        data: () => task
      }))
    };
      
    console.log(\`Searching for tasks due on or before \${endDateISO}\`);`;

// Replace the query
updatedContent = updatedContent.replace(queryRegex, newQuery);

// Update the package.json to add Supabase dependency
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
packageJson.dependencies['@supabase/supabase-js'] = '^2.39.7';
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Write the updated content back to the file
fs.writeFileSync(indexPath, updatedContent);

console.log('✅ Updated index.js to connect to Supabase!');
console.log('\nTo set the Supabase configuration:');
console.log('firebase functions:config:set supabase.url="YOUR_SUPABASE_URL" supabase.key="YOUR_SUPABASE_SERVICE_ROLE_KEY"');
console.log('\nTo deploy the updated function:');
console.log('cd functions && npm install && cd .. && firebase deploy --only functions');