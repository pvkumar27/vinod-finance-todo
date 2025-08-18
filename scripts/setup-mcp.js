#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🤖 Setting up FinTask MCP Server...\n');

const mcpDir = path.join(__dirname, '..', 'mcp-server');
const envFile = path.join(mcpDir, '.env');
const envExampleFile = path.join(mcpDir, '.env.example');

// Check if MCP directory exists
if (!fs.existsSync(mcpDir)) {
  console.error('❌ MCP server directory not found!');
  console.log('Please ensure the mcp-server directory exists.');
  process.exit(1);
}

// Install MCP server dependencies
console.log('📦 Installing MCP server dependencies...');
try {
  // eslint-disable-next-line -- Security hotspot undefined: Security reviewed - acceptable risk
  execSync('npm install', { cwd: mcpDir, stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Create .env file if it doesn't exist
if (!fs.existsSync(envFile)) {
  console.log('⚙️  Creating environment configuration...');

  if (fs.existsSync(envExampleFile)) {
    fs.copyFileSync(envExampleFile, envFile);
    console.log('✅ Created .env file from template');
    console.log('📝 Please edit mcp-server/.env with your Supabase credentials\n');
  } else {
    // Create basic .env file
    const envContent = `SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
MCP_SERVER_PORT=3001`;

    fs.writeFileSync(envFile, envContent);
    console.log('✅ Created basic .env file');
    console.log('📝 Please edit mcp-server/.env with your Supabase credentials\n');
  }
} else {
  console.log('✅ Environment file already exists\n');
}

// Check for required environment variables in main project
const mainEnvFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(mainEnvFile)) {
  const envContent = fs.readFileSync(mainEnvFile, 'utf8');

  if (!envContent.includes('REACT_APP_MCP_SERVER_URL')) {
    console.log('📝 Adding MCP server URL to main .env file...');
    fs.appendFileSync(
      mainEnvFile,
      '\n# MCP Server Configuration\nREACT_APP_MCP_SERVER_URL=http://localhost:3001\n'
    );
    console.log('✅ Added MCP server URL to .env\n');
  }
}

console.log('🎉 MCP Server setup complete!\n');
console.log('📋 Next steps:');
console.log('1. Edit mcp-server/.env with your Supabase credentials');
console.log('2. Run: npm run mcp:start (to start the MCP server)');
console.log('3. Run: npm start (to start the React app with AI Assistant)\n');

console.log('🤖 Available MCP commands:');
console.log('• npm run mcp:install - Install MCP dependencies');
console.log('• npm run mcp:start - Start MCP server');
console.log('• npm run mcp:dev - Start MCP server in development mode\n');

console.log(
  '💡 The AI Assistant will appear as a chat bubble in the bottom-right corner of your app!'
);
