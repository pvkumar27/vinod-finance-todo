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
    const { public_token } = JSON.parse(event.body);
    
    const response = await client.itemPublicTokenExchange({
      public_token: public_token,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ access_token: response.data.access_token }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};