import React, { useCallback, useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { createLinkToken, storePlaidToken, fetchPlaidAccounts } from '../services/plaid';
import { supabase } from '../supabaseClient';
import { syncPlaidCreditCards } from '../services/creditCards';

const PlaidLink = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  const onPlaidSuccess = useCallback(
    async (publicToken, metadata) => {
      setLoading(true);
      try {
        let accessToken;

        // Exchange public token for access token via backend
        const response = await fetch('/.netlify/functions/plaid-exchange-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({ public_token: publicToken }),
        });
        const data = await response.json();
        accessToken = data.access_token;

        // Store token securely
        await storePlaidToken(
          accessToken,
          metadata.link_session_id,
          metadata.institution?.institution_id
        );

        // Fetch accounts from Plaid
        const accountsResponse = await fetchPlaidAccounts(accessToken);

        // Sync credit cards using the new service function
        const creditCards = await syncPlaidCreditCards({
          accounts: accountsResponse.accounts,
          institution: metadata.institution,
        });

        onSuccess && onSuccess(creditCards);
      } catch (error) {
        console.error('Plaid integration error:', error);
        onError && onError(error);
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const [linkToken, setLinkToken] = useState(null);

  // Create link token on component mount
  useEffect(() => {
    const initializePlaid = async () => {
      try {
        const token = await createLinkToken();
        setLinkToken(token);
      } catch (error) {
        console.error('Failed to create link token:', error);
        onError && onError(error);
      }
    };
    initializePlaid();
  }, [onError]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
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
      className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-colors ${
        loading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <span className="hidden sm:inline">Syncing Cards...</span>
          <span className="sm:hidden">Syncing...</span>
        </>
      ) : (
        <>
          <span>🏦</span>
          <span className="hidden sm:inline">Connect Bank Account</span>
          <span className="sm:hidden">Connect Bank</span>
        </>
      )}
    </button>
  );
};

export default PlaidLink;
