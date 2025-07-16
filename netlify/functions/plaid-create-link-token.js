const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const configuration = new Configuration({
  basePath: PlaidEnvironments.development,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.REACT_APP_PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.REACT_APP_PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const response = await client.linkTokenCreate({
      user: { client_user_id: 'user-id' },
      client_name: 'Finance To-Dos PWA',
      products: ['accounts'],
      country_codes: ['US'],
      language: 'en',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ link_token: response.data.link_token }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};