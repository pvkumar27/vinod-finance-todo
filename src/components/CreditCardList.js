import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import CreditCardForm from './CreditCardForm';
import ReminderForm from './ReminderForm';
import CreditCardExport from './CreditCardExport';
import CreditCardTable from './CreditCardTable';
import CreditCardDashboardInsights from './CreditCardDashboardInsights';
import CreditCardDetailModal from './CreditCardDetailModal';

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
      const { data, error } = await supabase
        .from('credit_cards_simplified')
        .select('*')
        .order('card_name', { ascending: true });

      if (error) throw error;
      setCards(data || []);
      await fetchReminders();
    } catch (err) {
      setError(`Failed to fetch cards: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [fetchReminders]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleAddCard = () => {
    setEditingCard(null);
    setShowForm(true);
  };

  const handleEditCard = card => {
    setEditingCard(card);
    setShowForm(true);
  };

  const handleDeleteCard = async card => {
    if (!window.confirm(`Delete card ${card.card_name}?`)) return;

    try {
      const { error } = await supabase.from('credit_cards_simplified').delete().eq('id', card.id);

      if (error) throw error;

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
      const { error } = await supabase
        .from('credit_cards_simplified')
        .delete()
        .in('id', selectedCards);

      if (error) throw error;

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

  const getPromoExpiryBadge = currentPromos => {
    if (!currentPromos || !Array.isArray(currentPromos)) return false;
    return currentPromos.some(promo => {
      if (!promo.promo_expiry_date) return false;
      const daysUntil = Math.floor(
        (new Date(promo.promo_expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
      );
      return daysUntil <= 30 && daysUntil >= 0;
    });
  };

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.card_name?.toLowerCase().includes(searchTerm.toLowerCase());

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
      return (a.card_name || '').localeCompare(b.card_name || '');
    }
    if (sortBy === 'days_inactive') {
      return (b.days_inactive || 0) - (a.days_inactive || 0);
    }
    if (sortBy === 'promo_count') {
      const aCount = Array.isArray(a.current_promos) ? a.current_promos.length : 0;
      const bCount = Array.isArray(b.current_promos) ? b.current_promos.length : 0;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading cards...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Insights */}
      <CreditCardDashboardInsights cards={cards} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">💳 Credit Cards ({sortedCards.length})</h2>
        <div className="flex flex-wrap gap-2">
          <CreditCardExport
            cards={sortedCards}
            reminders={reminders}
            activeTab={activeTab}
            onMessage={setMessage}
          />
          <button
            onClick={handleAddCard}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            ➕ Add Card
          </button>
          <button
            onClick={fetchCards}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Cards ({cards.length})
        </button>
        <button
          onClick={() => setActiveTab('promo')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'promo'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ⏳ Promo Expiring ({cards.filter(c => getPromoExpiryBadge(c.current_promos)).length})
        </button>
        <button
          onClick={() => setActiveTab('inactive')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'inactive'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ⚠️ Inactive (
          {cards.filter(c => getInactivityBadge(c.days_inactive, c.last_used_date)).length})
        </button>
      </div>

      {/* Search, Sort, and View Toggle */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by card name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="card_name">Sort by Card Name</option>
            <option value="days_inactive">Sort by Days Inactive</option>
            <option value="promo_count">Sort by Promo Count</option>
            <option value="last_used_newest">Last Used (Newest First)</option>
            <option value="last_used_oldest">Last Used (Oldest First)</option>
          </select>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('cards')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Cards
            </button>
            <button
              onClick={() => handleViewModeChange('table')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Table
            </button>
          </div>
        </div>
      </div>

      {/* Selection Toolbar */}
      {sortedCards.length > 0 && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            selectedCards.length > 0 ? 'max-h-20 opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'
          }`}
        >
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-green-800">
                ✅ {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={handleDeselectAll}
                className="text-sm text-green-700 hover:text-green-900 underline"
              >
                Deselect All
              </button>
            </div>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 text-red-600 border border-red-300 rounded-md hover:border-red-600 hover:bg-red-50 text-sm font-medium transition-colors flex items-center gap-1"
              title="Delete selected cards"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      )}

      {/* Content View */}
      <div className="min-h-[600px]">
        {sortedCards.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">💳</div>
            <p>No cards found matching your criteria</p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
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
        ) : (
          <div className="h-[600px] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {sortedCards.map(card => (
                <div
                  key={card.id}
                  className={`bg-white rounded-lg shadow-md border p-6 transition-all duration-200 ease-in-out ${selectedCards.includes(card.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedCards.includes(card.id)}
                        onChange={() => handleCardSelect(card.id)}
                        className="mt-1"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {card.card_name || 'Unknown Card'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {card.days_inactive ? `${card.days_inactive} days inactive` : 'Active'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {card.last_used_date
                            ? `Last used: ${formatDate(card.last_used_date)}`
                            : '❌ Never Used'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Array.isArray(card.current_promos)
                            ? `${card.current_promos.length} active promos`
                            : '0 active promos'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col gap-1">
                        {getInactivityBadge(card.days_inactive, card.last_used_date) && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold">
                            ⚠️ {card.last_used_date ? 'Inactive' : 'Never Used'}
                          </span>
                        )}
                        {getPromoExpiryBadge(card.current_promos) && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            ⏳ Promo Soon
                          </span>
                        )}
                        {card.new_promo_available && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            🏷️ New Promo
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleSetReminder(card)}
                          className="p-1 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                          title="Set reminder"
                        >
                          🔔
                        </button>
                        <button
                          onClick={() => handleEditCard(card)}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit card"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete card"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Days Inactive:</span>
                      <span className="font-medium">{card.days_inactive || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">New Promo Available:</span>
                      <span className="font-medium">{card.new_promo_available ? 'Yes' : 'No'}</span>
                    </div>
                    {card.interest_after_promo && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Interest After Promo:</span>
                        <span className="font-medium">{card.interest_after_promo}%</span>
                      </div>
                    )}
                  </div>

                  {/* Current Promos */}
                  {Array.isArray(card.current_promos) && card.current_promos.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">
                        🎯 Current Promos ({card.current_promos.length})
                      </h4>
                      {card.current_promos.map((promo, index) => (
                        <div
                          key={index}
                          className="mb-2 last:mb-0 pb-2 last:pb-0 border-b last:border-b-0 border-blue-200"
                        >
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-700">APR:</span>
                            <span className="font-medium text-blue-900">{promo.promo_apr}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-700">Amount:</span>
                            <span className="font-medium text-blue-900">
                              {formatCurrency(promo.promo_amount)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-700">Expires:</span>
                            <span className="font-medium text-blue-900">
                              {formatDate(promo.promo_expiry_date)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reminders */}
                  {getCardReminders(card.id).length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                        🔔 Active Reminders
                      </h4>
                      {getCardReminders(card.id).map(reminder => (
                        <div
                          key={reminder.id}
                          className="flex justify-between items-start text-sm mb-2 last:mb-0"
                        >
                          <div>
                            <span className="font-medium text-yellow-900">{reminder.type}</span>
                            <span className="text-yellow-700"> – {formatDate(reminder.date)}</span>
                            {reminder.note && (
                              <p className="text-xs text-yellow-600 mt-1">{reminder.note}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteReminder(reminder.id)}
                            className="text-yellow-400 hover:text-red-600 ml-2"
                            title="Delete reminder"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
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
