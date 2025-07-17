exports.handler = async (event, context) => {
  console.log('Function called with method:', event.httpMethod);
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Check environment variables
    console.log('Environment check:', {
      hasClientId: !!process.env.REACT_APP_PLAID_CLIENT_ID,
      hasSecret: !!process.env.REACT_APP_PLAID_SECRET,
      env: process.env.REACT_APP_PLAID_ENV
    });

    if (!process.env.REACT_APP_PLAID_CLIENT_ID || !process.env.REACT_APP_PLAID_SECRET) {
      throw new Error('Missing Plaid credentials');
    }

    console.log('Loading Plaid SDK...');
    const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
    
    console.log('Creating Plaid configuration...');
    const configuration = new Configuration({
      basePath: PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.REACT_APP_PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.REACT_APP_PLAID_SECRET,
        },
      },
    });

    console.log('Creating Plaid client...');
    const client = new PlaidApi(configuration);
    
    console.log('Calling Plaid API...');
    const response = await client.linkTokenCreate({
      user: { client_user_id: 'user-id' },
      client_name: 'FinTask',
      products: ['auth'],
      country_codes: ['US'],
      language: 'en',
    });

    console.log('Plaid API success');
    return {
      statusCode: 200,
      body: JSON.stringify({ link_token: response.data.link_token }),
    };
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      response: error.response?.data
    });
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message,
        details: error.response?.data || 'No additional details'
      }),
    };
  }
};