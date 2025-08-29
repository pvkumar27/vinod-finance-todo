import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { api } from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import useSoundEffects from '../hooks/useSoundEffects';

const CreditCardList = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  const { success, error: errorSound, buttonPress } = useSoundEffects();

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getCreditCards();
      setCards(data || []);
    } catch (err) {
      setError(`Failed to fetch cards: ${err.message}`);
      errorSound();
    } finally {
      setLoading(false);
    }
  }, [errorSound]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const getInactivityBadge = (daysInactive, lastUsedDate) => {
    if (daysInactive) return daysInactive > 90;
    if (!lastUsedDate) return true;
    const daysSince = Math.floor((new Date() - new Date(lastUsedDate)) / (1000 * 60 * 60 * 24));
    return daysSince > 90;
  };

  const getPromoExpiryBadge = currentPromos => {
    if (!currentPromos || !Array.isArray(currentPromos)) return false;
    return currentPromos.some(promo => {
      if (!promo.promo_expiry_date) return false;
      const expiryDate = new Date(promo.promo_expiry_date);
      const today = new Date();
      const daysUntil = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
      return daysUntil <= 30 && daysUntil >= 0;
    });
  };

  const filteredCards = cards.filter(card => {
    const matchesSearch = (card.bank_name + ' ' + card.last_four_digits)
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (activeTab === 'promo') {
      return matchesSearch && getPromoExpiryBadge(card.current_promos);
    }
    if (activeTab === 'inactive') {
      return matchesSearch && getInactivityBadge(card.days_inactive, card.last_used_date);
    }
    return matchesSearch;
  });

  const formatDate = date => {
    if (!date || date === '1970-01-01') return '-';
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? '-' : parsedDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div className="loading" style={{ margin: '0 auto var(--space-4)' }}></div>
            <div className="text-secondary">Loading cards...</div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <Card className="border-error">
          <div className="text-error font-medium">{error}</div>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      className="container"
      style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>💳 Credit Cards</CardTitle>
              <CardDescription>{filteredCards.length} cards in your wallet</CardDescription>
            </div>
            <Button
              onClick={() => {
                buttonPress();
                fetchCards();
              }}
            >
              🔄 Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', duration: 0.3 }}
          >
            <Card className={`mb-6 ${message.includes('❌') ? 'border-error' : 'border-success'}`}>
              <div
                className={`font-medium ${message.includes('❌') ? 'text-error' : 'text-success'}`}
              >
                {message}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <Card className="mb-6">
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All Cards', count: cards.length },
            {
              key: 'promo',
              label: '⏳ Expiring',
              count: cards.filter(c => getPromoExpiryBadge(c.current_promos)).length,
            },
            {
              key: 'inactive',
              label: '⚠️ Inactive',
              count: cards.filter(c => getInactivityBadge(c.days_inactive, c.last_used_date))
                .length,
            },
          ].map(tab => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'primary' : 'ghost'}
              onClick={() => {
                buttonPress();
                setActiveTab(tab.key);
              }}
              className="text-sm"
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </div>
      </Card>

      {/* Search */}
      <Card className="mb-6">
        <Input
          type="text"
          placeholder="Search by card name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* Cards Grid */}
      <div className="grid gap-6">
        {filteredCards.length === 0 ? (
          <Card>
            <div className="text-center" style={{ padding: 'var(--space-8)' }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>💳</div>
              <div className="text-lg font-semibold text-primary mb-2">No cards found</div>
              <div className="text-secondary">Try adjusting your search or filters</div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredCards.map((card, index) => {
                const isInactive = getInactivityBadge(card.days_inactive, card.last_used_date);
                const hasExpiringPromo = getPromoExpiryBadge(card.current_promos);

                return (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Card
                      className={`relative ${isInactive || hasExpiringPromo ? 'border-warning' : ''}`}
                      style={{
                        background:
                          isInactive || hasExpiringPromo
                            ? 'rgb(245 158 11 / 0.02)'
                            : 'var(--surface)',
                      }}
                    >
                      {(isInactive || hasExpiringPromo) && (
                        <div
                          className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: 'var(--warning)' }}
                        >
                          <span className="text-xs font-bold text-white">!</span>
                        </div>
                      )}

                      <CardHeader>
                        <CardTitle className="text-lg">
                          {card.bank_name && card.last_four_digits
                            ? `${card.bank_name} ${card.last_four_digits}`
                            : 'Unknown Card'}
                        </CardTitle>
                        <CardDescription>
                          {card.days_inactive ? `${card.days_inactive} days inactive` : 'Active'}
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-secondary">Last Used:</span>
                            <span className="font-medium">
                              {card.last_used_date ? formatDate(card.last_used_date) : 'Never'}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-secondary">Active Promos:</span>
                            <span className="font-medium">
                              {Array.isArray(card.current_promos) ? card.current_promos.length : 0}
                            </span>
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            {isInactive && <span className="badge badge-warning">⚠️ Inactive</span>}
                            {hasExpiringPromo && (
                              <span className="badge badge-warning">⏳ Promo Expiring</span>
                            )}
                            {card.new_promo_available && (
                              <span className="badge badge-success">🏷️ New Promo</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CreditCardList;
