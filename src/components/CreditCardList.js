import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { api } from '../services/api';
import CreditCardForm from './CreditCardForm';
import ReminderForm from './ReminderForm';
import CreditCardTable from './CreditCardTable';
import CreditCardDetailModal from './CreditCardDetailModal';
import AppleWalletCard from './ui/AppleWalletCard';
import AppleWalletButton from './ui/AppleWalletButton';

/* eslint-disable react/prop-types */
const ReminderItem = ({ reminder, onDelete, formatDate }) => (
  <div className="flex items-start justify-between mb-2 text-sm last:mb-0">
    <div>
      <span className="font-medium text-gray-800">{reminder.type}</span>
      <span className="text-yellow-600"> – {formatDate(reminder.date)}</span>
      {reminder.note && <p className="mt-1 text-xs text-yellow-700">{reminder.note}</p>}
    </div>
    <button
      onClick={() => onDelete(reminder.id)}
      className="ml-2 text-yellow-400 transition-colors duration-200 hover:text-red-400"
      title="Delete reminder"
    >
      ×
    </button>
  </div>
);
/* eslint-enable react/prop-types */

const CreditCardList = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('card_name');
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [message, setMessage] = useState('');
  const [reminders, setReminders] = useState([]);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderCard, setReminderCard] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('creditCardViewMode') || 'cards';
  });
  const [selectedCards, setSelectedCards] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const fetchReminders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('credit_card_reminders')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (err) {
      console.error('Failed to fetch reminders:', err.message);
    }
  }, []);

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getCreditCards();
      setCards(data || []);
      await fetchReminders();
    } catch (err) {
      setError(`Failed to fetch cards: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [fetchReminders]);

  const handleCreditCardUpdate = useCallback(
    event => {
      const { detail } = event;
      if (detail?.deleted && detail?.cardId) {
        setCards(prev => prev.filter(c => c.id !== detail.cardId));
        setSelectedCards(prev => prev.filter(id => id !== detail.cardId));
      } else {
        fetchCards();
      }
    },
    [fetchCards]
  );

  const handleViewSwitch = useCallback(event => {
    const { detail } = event;
    if (detail?.viewMode && detail?.source === 'ai') {
      handleViewModeChange(detail.viewMode);
    }
  }, []);

  const handleSortCards = useCallback(event => {
    const { detail } = event;
    if (detail?.sortBy && detail?.source === 'ai') {
      const sortMapping = {
        name: 'card_name',
        days_inactive: 'days_inactive',
        promo_count: 'promo_count',
        last_used_newest: 'last_used_newest',
        last_used_oldest: 'last_used_oldest',
        last_used: 'last_used_newest',
      };
      setSortBy(sortMapping[detail.sortBy] || detail.sortBy);
    }
  }, []);

  useEffect(() => {
    fetchCards();

    window.addEventListener('creditCardAdded', handleCreditCardUpdate);
    window.addEventListener('switchView', handleViewSwitch);
    window.addEventListener('sortCards', handleSortCards);

    return () => {
      window.removeEventListener('creditCardAdded', handleCreditCardUpdate);
      window.removeEventListener('switchView', handleViewSwitch);
      window.removeEventListener('sortCards', handleSortCards);
    };
  }, [fetchCards, handleCreditCardUpdate, handleViewSwitch, handleSortCards]);

  const handleAddCard = () => {
    setEditingCard(null);
    setShowForm(true);
  };

  const handleEditCard = card => {
    setEditingCard(card);
    setShowForm(true);
  };

  const handleDeleteCard = async card => {
    if (!window.confirm(`Delete card ${card.bank_name} ${card.last_four_digits}?`)) return;

    try {
      await api.deleteCreditCard(card.id);
      setCards(prev => prev.filter(c => c.id !== card.id));
      setSelectedCards(prev => prev.filter(id => id !== card.id));
      setMessage('✅ Card deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`❌ Failed to delete card: ${err.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCards([]);
      setSelectAll(false);
    } else {
      setSelectedCards(sortedCards.map(card => card.id));
      setSelectAll(true);
    }
  };

  const handleDeselectAll = () => {
    setSelectedCards([]);
    setSelectAll(false);
  };

  const handleCardSelect = cardId => {
    setSelectedCards(prev => {
      const newSelected = prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId];
      setSelectAll(newSelected.length === sortedCards.length);
      return newSelected;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedCards.length === 0) return;
    if (!window.confirm(`Delete ${selectedCards.length} selected cards?`)) return;

    try {
      await Promise.all(selectedCards.map(id => api.deleteCreditCard(id)));
      setCards(prev => prev.filter(c => !selectedCards.includes(c.id)));
      setSelectedCards([]);
      setSelectAll(false);
      setMessage(`✅ ${selectedCards.length} cards deleted successfully`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`❌ Failed to delete cards: ${err.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleFormSave = savedCard => {
    if (editingCard) {
      setCards(prev => prev.map(c => (c.id === savedCard.id ? savedCard : c)));
      setMessage('✅ Card updated successfully');
    } else {
      setCards(prev => [savedCard, ...prev]);
      setMessage('✅ Card added successfully');
    }
    setShowForm(false);
    setEditingCard(null);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCard(null);
  };

  const handleSetReminder = card => {
    setReminderCard(card);
    setShowReminderForm(true);
  };

  const handleReminderSave = savedReminder => {
    setReminders(prev => [...prev, savedReminder]);
    setShowReminderForm(false);
    setReminderCard(null);
    setMessage('🔔 Reminder set successfully');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleReminderCancel = () => {
    setShowReminderForm(false);
    setReminderCard(null);
  };

  const handleViewCard = card => {
    setSelectedCard(card);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedCard(null);
  };

  const handleEditFromModal = card => {
    setShowDetailModal(false);
    handleEditCard(card);
  };

  const handleDeleteReminder = async reminderId => {
    try {
      const { error } = await supabase.from('credit_card_reminders').delete().eq('id', reminderId);

      if (error) throw error;

      setReminders(prev => prev.filter(r => r.id !== reminderId));
      setMessage('🗑️ Reminder deleted');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`❌ Failed to delete reminder: ${err.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const getCardReminders = cardId => {
    return reminders.filter(r => r.card_id === cardId);
  };

  const handleViewModeChange = mode => {
    setViewMode(mode);
    localStorage.setItem('creditCardViewMode', mode);
  };

  const getInactivityBadge = (daysInactive, lastUsedDate) => {
    if (daysInactive) return daysInactive > 90;
    if (!lastUsedDate) return true;
    const daysSince = Math.floor((new Date() - new Date(lastUsedDate)) / (1000 * 60 * 60 * 24));
    return daysSince > 90;
  };

  const isPromoExpiringSoon = promo => {
    if (!promo.promo_expiry_date) return false;
    const expiryDate = new Date(promo.promo_expiry_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    const daysUntil = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30 && daysUntil >= 0;
  };

  const getPromoExpiryBadge = currentPromos => {
    if (!currentPromos || !Array.isArray(currentPromos)) return false;
    return currentPromos.some(isPromoExpiringSoon);
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

  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortBy === 'card_name') {
      return ((a.bank_name || '') + ' ' + (a.last_four_digits || '')).localeCompare(
        (b.bank_name || '') + ' ' + (b.last_four_digits || '')
      );
    }
    if (sortBy === 'days_inactive') {
      return (b.days_inactive || 0) - (a.days_inactive || 0);
    }
    if (sortBy === 'promo_count') {
      const aCount = a.promo_end_date ? 1 : 0;
      const bCount = b.promo_end_date ? 1 : 0;
      return bCount - aCount;
    }
    if (sortBy === 'last_used_newest') {
      return (
        new Date(b.last_used_date || '1900-01-01') - new Date(a.last_used_date || '1900-01-01')
      );
    }
    if (sortBy === 'last_used_oldest') {
      return (
        new Date(a.last_used_date || '9999-12-31') - new Date(b.last_used_date || '9999-12-31')
      );
    }
    return 0;
  });

  const formatCurrency = amount => {
    return amount ? `$${amount.toLocaleString()}` : '-';
  };

  const formatDate = date => {
    if (!date || date === '1970-01-01') return '-';
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? '-' : parsedDate.toLocaleDateString();
  };

  const getInactivityText = lastUsedDate => {
    return lastUsedDate ? 'Inactive' : 'Never Used';
  };

  const getPromoUsedClass = promoUsed => {
    return promoUsed ? 'text-green-600' : 'text-gray-500';
  };

  const getCardClassName = card => {
    if (selectedCards.includes(card.id)) {
      return 'finbot-glow border-purple-500/50';
    }
    const hasAlert =
      getInactivityBadge(card.days_inactive, card.last_used_date) ||
      getPromoExpiryBadge(card.current_promos);
    return hasAlert ? 'border-red-500/50 bg-red-500/10' : '';
  };

  const renderTableView = () => (
    <div className="overflow-hidden finbot-card">
      <div className="max-h-[600px] overflow-y-auto">
        <CreditCardTable
          cards={sortedCards}
          reminders={reminders}
          onEditCard={handleEditCard}
          onDeleteCard={handleDeleteCard}
          onSetReminder={handleSetReminder}
          onViewCard={handleViewCard}
          getInactivityBadge={getInactivityBadge}
          getPromoExpiryBadge={getPromoExpiryBadge}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          selectedCards={selectedCards}
          onCardSelect={handleCardSelect}
          selectAll={selectAll}
          onSelectAll={handleSelectAll}
          onBulkDelete={handleBulkDelete}
        />
      </div>
    </div>
  );

  const renderCardView = () => (
    <div className="h-[600px] overflow-y-auto">
      <div
        data-cy="card-grid"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
      >
        {sortedCards.map(card => (
          <div
            key={card.id}
            className={`finbot-card p-6 transition-all duration-300 ease-in-out hover:transform hover:scale-105 relative ${getCardClassName(card)}`}
          >
            {/* Attention indicator */}
            {(getInactivityBadge(card.days_inactive, card.last_used_date) ||
              getPromoExpiryBadge(card.current_promos)) && (
              <div className="absolute flex items-center justify-center w-4 h-4 bg-red-500 rounded-full -top-2 -right-2">
                <span className="text-xs font-bold text-white">!</span>
              </div>
            )}
            {/* Card Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedCards.includes(card.id)}
                  onChange={() => handleCardSelect(card.id)}
                  className="w-4 h-4 mt-1 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <h3 className="mb-2 text-xl font-bold text-gray-800">
                    {card.bank_name && card.last_four_digits
                      ? `${card.bank_name} ${card.last_four_digits}`
                      : 'Unknown Card'}
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      {card.days_inactive ? `${card.days_inactive} days inactive` : 'Active'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {card.last_used_date
                        ? `Last used: ${formatDate(card.last_used_date)}`
                        : '❌ Never Used'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Array.isArray(card.current_promos) ? card.current_promos.length : 0} active
                      promos
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-1">
                  {getInactivityBadge(card.days_inactive, card.last_used_date) && (
                    <span className="px-3 py-1 text-xs font-bold text-red-400 border rounded-full bg-red-500/20 border-red-500/50">
                      ⚠️ {getInactivityText(card.last_used_date)}
                    </span>
                  )}
                  {getPromoExpiryBadge(card.current_promos) && (
                    <span className="px-3 py-1 text-xs text-yellow-400 border rounded-full bg-yellow-500/20 border-yellow-500/50">
                      ⏳ Promo Soon
                    </span>
                  )}
                  {card.new_promo_available && (
                    <span className="px-3 py-1 text-xs text-green-400 border rounded-full bg-green-500/20 border-green-500/50">
                      🏷️ New Promo
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleSetReminder(card)}
                    className="p-2 text-gray-400 transition-all duration-200 rounded-lg hover:text-yellow-400 hover:bg-yellow-500/20"
                    title="Set reminder"
                  >
                    🔔
                  </button>
                  <button
                    onClick={() => handleEditCard(card)}
                    className="p-2 text-gray-400 transition-all duration-200 rounded-lg hover:text-purple-400 hover:bg-purple-500/20"
                    title="Edit card"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteCard(card)}
                    className="p-2 text-gray-400 transition-all duration-200 rounded-lg hover:text-red-400 hover:bg-red-500/20"
                    title="Delete card"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>

            {/* Card Info */}
            <div className="p-4 mb-5 space-y-3 border bg-white/5 backdrop-blur-sm rounded-xl border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Days Inactive:</span>
                <span className="font-semibold text-gray-800">{card.days_inactive || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Used:</span>
                <span className="font-semibold text-gray-800">
                  {formatDate(card.last_used_date)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Promo Used:</span>
                <span className={`font-semibold ${getPromoUsedClass(card.promo_used)}`}>
                  {card.promo_used ? 'Yes' : 'No'}
                </span>
              </div>
              {card.interest_after_promo && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Interest After Promo:</span>
                  <span className="font-semibold text-gray-800">{card.interest_after_promo}%</span>
                </div>
              )}
            </div>

            {/* Current Promos */}
            {card.promo_end_date && (
              <div className="p-4 mb-4 border bg-purple-500/20 border-purple-500/50 rounded-xl">
                <h4 className="mb-2 text-sm font-semibold text-purple-700">🎯 Current Promo</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-600">Expires:</span>
                  <span className="font-medium text-gray-800">
                    {formatDate(card.promo_end_date)}
                  </span>
                </div>
              </div>
            )}

            {/* Reminders */}
            {getCardReminders(card.id).length > 0 && (
              <div className="p-4 mb-4 border bg-yellow-500/20 border-yellow-500/50 rounded-xl">
                <h4 className="mb-2 text-sm font-semibold text-yellow-700">🔔 Active Reminders</h4>
                {getCardReminders(card.id).map(reminder => (
                  <ReminderItem
                    key={reminder.id}
                    reminder={reminder}
                    onDelete={handleDeleteReminder}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderMainContent = () => {
    return viewMode === 'table' ? renderTableView() : renderCardView();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-b-2 border-purple-500 rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading cards...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-400 border finbot-card bg-red-500/20 border-red-500/50">
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 'var(--aw-space-xl)',
        background: 'var(--aw-background)',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <AppleWalletCard className="mb-6 aw-fade-in">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--aw-space-lg)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--aw-space-md)',
            }}
          >
            <div>
              <h2
                data-cy="credit-cards-heading"
                className="aw-heading-xl"
                style={{ display: 'flex', alignItems: 'center', margin: 0 }}
              >
                <span style={{ marginRight: 'var(--aw-space-md)' }}>💳</span>
                Credit Cards
              </h2>
              <p className="aw-text-body" style={{ marginTop: 'var(--aw-space-sm)' }}>
                {sortedCards.length} cards in your wallet
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--aw-space-md)', flexWrap: 'wrap' }}>
              <AppleWalletButton
                variant="primary"
                data-cy="card-add-button"
                onClick={handleAddCard}
              >
                <span style={{ marginRight: 'var(--aw-space-sm)' }}>💳</span>
                Add Card
              </AppleWalletButton>
              <AppleWalletButton variant="secondary" onClick={fetchCards}>
                <span style={{ marginRight: 'var(--aw-space-sm)' }}>🔄</span>
                Refresh
              </AppleWalletButton>
            </div>
          </div>
        </div>
      </AppleWalletCard>

      {/* Message */}
      {message && (
        <AppleWalletCard
          className={`mb-6 aw-fade-in ${
            message.includes('❌') ? 'aw-badge-error' : 'aw-badge-success'
          }`}
        >
          <div className="aw-text-body" style={{ fontWeight: 'var(--aw-font-weight-medium)' }}>
            {message}
          </div>
        </AppleWalletCard>
      )}

      {/* Tabs */}
      <AppleWalletCard className="mb-6 aw-fade-in">
        <div className="aw-tabs">
          <button
            onClick={() => setActiveTab('all')}
            className={`aw-tab ${activeTab === 'all' ? 'active' : ''}`}
          >
            <span className="hidden sm:inline">All Cards</span>
            <span className="sm:hidden">All</span> ({cards.length})
          </button>
          <button
            onClick={() => setActiveTab('promo')}
            className={`aw-tab ${activeTab === 'promo' ? 'active' : ''}`}
          >
            <span className="hidden sm:inline">⏳ Promo Expiring</span>
            <span className="sm:hidden">⏳ Promo</span> (
            {cards.filter(c => getPromoExpiryBadge(c.current_promos)).length})
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`aw-tab ${activeTab === 'inactive' ? 'active' : ''}`}
          >
            ⚠️ Inactive (
            {cards.filter(c => getInactivityBadge(c.days_inactive, c.last_used_date)).length})
          </button>
        </div>
      </AppleWalletCard>

      {/* Search, Sort, and View Toggle */}
      <div className="flex flex-col gap-3 mb-4 lg:flex-row lg:items-center">
        <div className="flex-1">
          <div className="relative">
            <input
              data-cy="card-search-input"
              type="text"
              placeholder="Search by card name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-[#8B4513]/60">🔍</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
          >
            <option value="card_name">Sort by Card Name</option>
            <option value="days_inactive">Sort by Days Inactive</option>
            <option value="promo_count">Sort by Promo Count</option>
            <option value="last_used_newest">Last Used (Newest First)</option>
            <option value="last_used_oldest">Last Used (Oldest First)</option>
          </select>
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              data-cy="view-cards-button"
              onClick={() => handleViewModeChange('cards')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              📋 Cards
            </button>
            <button
              data-cy="view-table-button"
              onClick={() => handleViewModeChange('table')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              📊 Table
            </button>
          </div>
        </div>
      </div>

      {/* Selection Toolbar */}
      {sortedCards.length > 0 && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            selectedCards.length > 0 ? 'max-h-20 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'
          }`}
        >
          <div className="flex items-center justify-between p-4 finbot-card">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-800">
                ✅ {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={handleDeselectAll}
                className="text-sm font-medium text-purple-400 underline transition-colors duration-200 hover:text-purple-300"
              >
                Deselect All
              </button>
            </div>
            <button
              onClick={handleBulkDelete}
              className="transition-all duration-300 finbot-button-secondary hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400"
              title="Delete selected cards"
            >
              🗑️ Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Content View */}
      <div className="min-h-[600px]">
        {sortedCards.length === 0 ? (
          <div className="py-12 text-center text-gray-600">
            <div className="mb-4 text-6xl finbot-animate-float">💳</div>
            <p className="text-xl">No cards found matching your criteria</p>
          </div>
        ) : (
          renderMainContent()
        )}
      </div>

      {/* Form Modal */}
      <CreditCardForm
        card={editingCard}
        isOpen={showForm}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
      />

      {/* Reminder Form Modal */}
      <ReminderForm
        card={reminderCard}
        isOpen={showReminderForm}
        onSave={handleReminderSave}
        onCancel={handleReminderCancel}
      />

      {/* Detail Modal */}
      <CreditCardDetailModal
        card={selectedCard}
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        onEdit={handleEditFromModal}
      />
    </div>
  );
};

export default CreditCardList;
