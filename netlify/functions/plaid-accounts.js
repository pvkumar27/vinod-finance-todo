exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
    
    const configuration = new Configuration({
      basePath: PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.REACT_APP_PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.REACT_APP_PLAID_SECRET,
        },
      },
    });

    const client = new PlaidApi(configuration);

    const { access_token } = JSON.parse(event.body);
    
    const response = await client.accountsGet({
      access_token: access_token,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ accounts: response.data.accounts }),
    };
  } catch (error) {
    console.error('Plaid error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};