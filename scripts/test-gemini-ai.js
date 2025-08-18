#!/usr/bin/env node

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGeminiAI() {
  console.log('🤖 Testing Gemini AI integration...');

  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

  if (!apiKey) {
    console.log('❌ REACT_APP_GEMINI_API_KEY not found in .env');
    return;
  }

  console.log('✅ API key found, testing AI...');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt =
      'Generate a good night message for FinTask users who have 3 pending tasks. Keep it under 70 characters, include emoji, be appreciative and hopeful for tomorrow.';

    const result = await model.generateContent(prompt);
    const aiMessage = result.response.text().trim();

    console.log('🎯 AI Generated Message:', aiMessage);
    console.log('📏 Length:', aiMessage.length, 'characters');

    if (aiMessage.length < 100) {
      console.log('✅ AI is working correctly!');
    } else {
      console.log('⚠️ Message too long, will use fallback');
    }
  } catch (error) {
    console.log('❌ AI Error:', error.message);
  }
}

testGeminiAI();
