import React, { useCallback, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { plaidConfig, storePlaidToken, fetchPlaidAccounts, convertPlaidAccountToCreditCard } from '../services/plaid';
import { addCreditCard } from '../services/creditCards';

const PlaidLink = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  const onPlaidSuccess = useCallback(async (publicToken, metadata) => {
    setLoading(true);
    try {
      // In production, exchange public token for access token via your backend
      // For now, we'll simulate this process
      const mockAccessToken = `access-sandbox-${publicToken.slice(-10)}`;
      
      // Store token (in production, this would be done securely on backend)
      await storePlaidToken(
        mockAccessToken,
        metadata.link_session_id,
        metadata.institution?.institution_id
      );

      // Fetch accounts from Plaid
      const accountsResponse = await fetchPlaidAccounts(mockAccessToken);
      
      // Filter for credit card accounts and add to our database
      const creditCards = accountsResponse.accounts
        .filter(account => account.type === 'credit')
        .map(account => convertPlaidAccountToCreditCard(account, metadata.institution?.name));

      // Add each credit card to database
      for (const card of creditCards) {
        await addCreditCard(card);
      }

      onSuccess && onSuccess(creditCards);
    } catch (error) {
      console.error('Plaid integration error:', error);
      onError && onError(error);
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  const { open, ready } = usePlaidLink({
    token: null, // We'll use public_key mode for simplicity
    publicKey: plaidConfig.publicKey,
    env: plaidConfig.env,
    product: plaidConfig.products,
    countryCodes: plaidConfig.countryCodes,
    onSuccess: onPlaidSuccess,
    onExit: (err, metadata) => {
      if (err) {
        console.error('Plaid Link exit error:', err);
        onError && onError(err);
      }
    },
  });

  return (
    <button
      onClick={() => open()}
      disabled={!ready || loading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        loading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <span>Syncing Cards...</span>
        </>
      ) : (
        <>
          <span>🏦</span>
          <span>Connect Bank Account</span>
        </>
      )}
    </button>
  );
};

export default PlaidLink;