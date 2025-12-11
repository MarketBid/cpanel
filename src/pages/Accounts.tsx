import React, { useState } from 'react';
import { Plus, CreditCard, Banknote, ChevronRight, Wallet, X, Trash2 } from 'lucide-react';
import { Account, AccountType } from '../types';
import { useAccounts, useAddAccount, useUpdateAccount, useDeleteAccount } from '../hooks/queries/useAccounts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface AddAccountForm {
  name: string;
  number: string;
  type: AccountType;
  service_provider: string;
}

const Accounts: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<AddAccountForm>({
    name: '',
    number: '',
    type: AccountType.BANK,
    service_provider: ''
  });

  // Use React Query to fetch accounts with caching
  const { data: accounts = [], isLoading: loading } = useAccounts();
  const addAccountMutation = useAddAccount();
  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAccountMutation.mutateAsync(formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        number: '',
        type: AccountType.BANK,
        service_provider: ''
      });
    } catch (error) {
      console.error('Error adding account:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    
    try {
      await updateAccountMutation.mutateAsync({
        accountId: editingAccount.id,
        accountData: formData
      });
      resetEditForm();
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      number: account.number,
      type: account.type,
      service_provider: account.service_provider
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      number: '',
      type: AccountType.BANK,
      service_provider: ''
    });
    setShowAddModal(false);
  };

  const openDeleteModal = (account: Account) => {
    setDeletingAccount(account);
    setShowDeleteModal(true);
  };

  const handleDeleteAccount = async () => {
    if (!deletingAccount) return;

    try {
      await deleteAccountMutation.mutateAsync(deletingAccount.id);
      setShowDeleteModal(false);
      setDeletingAccount(null);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };
  
  const submitting = addAccountMutation.isPending || updateAccountMutation.isPending || deleteAccountMutation.isPending;

  const resetEditForm = () => {
    setFormData({
      name: '',
      number: '',
      type: AccountType.BANK,
      service_provider: ''
    });
    setShowEditModal(false);
    setEditingAccount(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading accounts..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900">Payment Methods</h1>
          <p className="mt-0.5 sm:mt-1 text-sm sm:text-base text-neutral-600">Manage your bank and mobile money accounts.</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          onClick={() => setShowAddModal(true)}
          className="text-xs sm:text-sm w-full sm:w-auto"
        >
          Add Account
        </Button>
      </div>

      {accounts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {accounts.map((account) => {
            const isBank = account.type === AccountType.BANK;
            const isMTN = account.service_provider.toLowerCase().includes('mtn');
            const isVodafone = account.service_provider.toLowerCase().includes('vodafone');
            const isAirtelTigo = account.service_provider.toLowerCase().includes('airtel');

            return (
              <div key={account.id} className="relative group">
                {/* Card Container with 3D effect */}
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 aspect-[1.7/1] sm:aspect-[1.586/1]">
                  {/* Background Gradient based on type */}
                  {isBank ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black"></div>
                  ) : isMTN ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600"></div>
                  ) : isVodafone ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800"></div>
                  ) : isAirtelTigo ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-orange-600"></div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800"></div>
                  )}

                  {/* Decorative patterns */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24"></div>

                  {/* Card Content */}
                  <div className="relative h-full p-4 sm:p-6 flex flex-col justify-between text-white">
                    {/* Top Section - Logo and Actions */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* Chip */}
                        <div className="w-9 h-7 sm:w-12 sm:h-10 relative">
                          <svg viewBox="0 0 48 40" className="w-full h-full drop-shadow-md">
                            <defs>
                              <linearGradient id="chipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                                <stop offset="50%" style={{ stopColor: '#FDB931', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#C5A028', stopOpacity: 1 }} />
                              </linearGradient>
                            </defs>
                            <rect x="0" y="0" width="48" height="40" rx="3" fill="url(#chipGradient)"/>
                            <rect x="4" y="4" width="10" height="12" rx="1" fill="#C5A028" opacity="0.5"/>
                            <rect x="17" y="4" width="10" height="12" rx="1" fill="#C5A028" opacity="0.5"/>
                            <rect x="30" y="4" width="10" height="12" rx="1" fill="#C5A028" opacity="0.5"/>
                            <rect x="4" y="19" width="10" height="12" rx="1" fill="#C5A028" opacity="0.5"/>
                            <rect x="17" y="19" width="10" height="12" rx="1" fill="#C5A028" opacity="0.5"/>
                            <rect x="30" y="19" width="10" height="12" rx="1" fill="#C5A028" opacity="0.5"/>
                            <line x1="14" y1="0" x2="14" y2="40" stroke="#B8941F" strokeWidth="0.5"/>
                            <line x1="27" y1="0" x2="27" y2="40" stroke="#B8941F" strokeWidth="0.5"/>
                            <line x1="0" y1="16" x2="48" y2="16" stroke="#B8941F" strokeWidth="0.5"/>
                          </svg>
                        </div>
                        {/* Provider Name */}
                        <div className="text-xs font-semibold uppercase tracking-wide">
                          {account.service_provider}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openDeleteModal(account)}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(account)}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Middle Section - Card Number */}
                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-wider opacity-80">
                        {isBank ? 'Account Number' : 'Mobile Number'}
                      </div>
                      <div className="text-xl font-mono tracking-widest">
                        {account.number.replace(/(\d{4})(?=\d)/g, '$1 ')}
                      </div>
                    </div>

                    {/* Bottom Section - Name and Logo */}
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-wider opacity-80 mb-1">
                          Account Holder
                        </div>
                        <div className="text-base font-semibold uppercase tracking-wide">
                          {account.name}
                        </div>
                      </div>

                      {/* Logo */}
                      <div className="flex items-center">
                        {isBank ? (
                          // Clarsix Logo
                          <div className="text-right">
                            <div className="px-4 py-2 bg-white rounded-md">
                              <div className="text-2xl font-black tracking-tight text-slate-900">
                                CLARSIX
                              </div>
                            </div>
                          </div>
                        ) : isMTN ? (
                          // MTN Logo
                          <div className="text-right">
                            <div className="text-2xl font-black tracking-tight" style={{ color: '#000' }}>
                              MTN
                            </div>
                            <div className="text-xs font-bold -mt-1" style={{ color: '#000' }}>
                              Mobile Money
                            </div>
                          </div>
                        ) : isVodafone ? (
                          // Vodafone Logo
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <div className="w-6 h-6 rounded-full bg-white"></div>
                              <div className="text-xl font-bold text-white">
                                Vodafone
                              </div>
                            </div>
                            <div className="text-xs font-semibold text-white text-right">
                              Cash
                            </div>
                          </div>
                        ) : isAirtelTigo ? (
                          // AirtelTigo Logo
                          <div className="text-right">
                            <div className="text-xl font-black text-white">
                              AirtelTigo
                            </div>
                            <div className="text-xs font-bold text-white">
                              Money
                            </div>
                          </div>
                        ) : (
                          // Generic Mobile Money
                          <div className="text-right">
                            <Wallet className="h-8 w-8 text-white" />
                            <div className="text-xs font-semibold text-white mt-1">
                              Mobile Money
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-3xl flex items-center justify-center mb-6">
              <CreditCard className="h-10 w-10 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No payment methods yet</h3>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
              Add your first bank or mobile money account to start accepting payments securely.
            </p>
            <Button 
              variant="primary" 
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowAddModal(true)}
            >
              Add Account
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl border border-neutral-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900">Add Payment Method</h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="p-6">
              {/* Card Preview */}
              <div className="mb-6">
                <div className="relative overflow-hidden rounded-2xl shadow-xl aspect-[1.586/1] max-w-md mx-auto">
                  {/* Background Gradient */}
                  {formData.type === AccountType.BANK ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black"></div>
                  ) : formData.service_provider.toLowerCase().includes('mtn') ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600"></div>
                  ) : formData.service_provider.toLowerCase().includes('vodafone') ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800"></div>
                  ) : formData.service_provider.toLowerCase().includes('airtel') ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-orange-600"></div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800"></div>
                  )}

                  {/* Decorative patterns */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24"></div>

                  {/* Card Content */}
                  <div className="relative h-full p-6 flex flex-col justify-between text-white">
                    {/* Top Section */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 relative">
                        <svg viewBox="0 0 48 40" className="w-full h-full drop-shadow-md">
                          <defs>
                            <linearGradient id="chipGradientAdd" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                              <stop offset="50%" style={{ stopColor: '#FDB931', stopOpacity: 1 }} />
                              <stop offset="100%" style={{ stopColor: '#C5A028', stopOpacity: 1 }} />
                            </linearGradient>
                          </defs>
                          <rect x="0" y="0" width="48" height="40" rx="3" fill="url(#chipGradientAdd)"/>
                          <rect x="4" y="4" width="10" height="12" rx="1" fill="#C5A028" opacity="0.5"/>
                          <rect x="17" y="4" width="10" height="12" rx="1" fill="#C5A028" opacity="0.5"/>
                          <rect x="30" y="4" width="10" height="12" rx="1" fill="#C5A028" opacity="0.5"/>
                          <rect x="4" y="19" width="10" height="12" rx="1" fill="#C5A028" opacity="0.5"/>
                          <rect x="17" y="19" width="10" height="12" rx="1" fill="#C5A028" opacity="0.5"/>
                          <rect x="30" y="19" width="10" height="12" rx="1" fill="#C5A028" opacity="0.5"/>
                          <line x1="14" y1="0" x2="14" y2="40" stroke="#B8941F" strokeWidth="0.5"/>
                          <line x1="27" y1="0" x2="27" y2="40" stroke="#B8941F" strokeWidth="0.5"/>
                          <line x1="0" y1="16" x2="48" y2="16" stroke="#B8941F" strokeWidth="0.5"/>
                        </svg>
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-wide">
                        {formData.service_provider || 'Service Provider'}
                      </div>
                    </div>

                    {/* Middle Section - Card Number */}
                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-wider opacity-80">
                        {formData.type === AccountType.BANK ? 'Account Number' : 'Mobile Number'}
                      </div>
                      <div className="text-xl font-mono tracking-widest">
                        {formData.number ? formData.number.replace(/(\d{4})(?=\d)/g, '$1 ') : '•••• •••• •••• ••••'}
                      </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-wider opacity-80 mb-1">
                          Account Holder
                        </div>
                        <div className="text-base font-semibold uppercase tracking-wide">
                          {formData.name || 'Your Name'}
                        </div>
                      </div>

                      {/* Logo */}
                      <div className="flex items-center">
                        {formData.type === AccountType.BANK ? (
                          <div className="px-4 py-2 bg-white rounded-md">
                            <div className="text-xl font-black tracking-tight text-slate-900">
                              CLARSIX
                            </div>
                          </div>
                        ) : formData.service_provider.toLowerCase().includes('mtn') ? (
                          <div className="text-right">
                            <div className="text-2xl font-black tracking-tight" style={{ color: '#000' }}>MTN</div>
                            <div className="text-xs font-bold -mt-1" style={{ color: '#000' }}>Mobile Money</div>
                          </div>
                        ) : formData.service_provider.toLowerCase().includes('vodafone') ? (
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <div className="w-6 h-6 rounded-full bg-white"></div>
                              <div className="text-xl font-bold text-white">Vodafone</div>
                            </div>
                            <div className="text-xs font-semibold text-white text-right">Cash</div>
                          </div>
                        ) : formData.service_provider.toLowerCase().includes('airtel') ? (
                          <div className="text-right">
                            <div className="text-xl font-black text-white">AirtelTigo</div>
                            <div className="text-xs font-bold text-white">Money</div>
                          </div>
                        ) : (
                          <div className="text-right">
                            <Wallet className="h-8 w-8 text-white" />
                            <div className="text-xs font-semibold text-white mt-1">Mobile Money</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Main Savings Account"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Account Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={AccountType.BANK}>Bank Account</option>
                  <option value={AccountType.MOMO}>Mobile Money</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={formData.type === AccountType.BANK ? "Account number" : "Mobile number"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Service Provider
                </label>
                <input
                  type="text"
                  name="service_provider"
                  value={formData.service_provider}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={formData.type === AccountType.BANK ? "e.g., GTBank, Ecobank" : "e.g., MTN, Vodafone, AirtelTigo"}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={submitting}
                >
                  {submitting ? 'Adding...' : 'Add Account'}
                </Button>
              </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {showEditModal && editingAccount && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl border border-neutral-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900">Edit Payment Method</h2>
              <button
                onClick={resetEditForm}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleEditAccount} className="p-6">
              {/* Card Preview */}
              <div className="mb-6">
                <div className="relative overflow-hidden rounded-2xl shadow-xl aspect-[1.586/1] max-w-md mx-auto">
                  {/* Background Gradient */}
                  {formData.type === AccountType.BANK ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black"></div>
                  ) : formData.service_provider.toLowerCase().includes('mtn') ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600"></div>
                  ) : formData.service_provider.toLowerCase().includes('vodafone') ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800"></div>
                  ) : formData.service_provider.toLowerCase().includes('airtel') ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-orange-600"></div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800"></div>
                  )}

                  {/* Decorative patterns */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24"></div>

                  {/* Card Content */}
                  <div className="relative h-full p-6 flex flex-col justify-between text-white">
                    {/* Top Section */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 relative">
                        <svg viewBox="0 0 48 40" className="w-full h-full drop-shadow-md">
                          <defs>
                            <linearGradient id="chipGradientEdit" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                              <stop offset="50%" style={{ stopColor: '#FDB931', stopOpacity: 1 }} />
                              <stop offset="100%" style={{ stopColor: '#C5A028', stopOpacity: 1 }} />
                            </linearGradient>
                          </defs>
                          <rect x="0" y="0" width="48" height="40" rx="3" fill="url(#chipGradientEdit)"/>
                          <rect x="4" y="4" width="10" height="12" rx="1" fill="#C5A028" opacity="0.5"/>
                          <rect x="17" y="4" width="10" height="12" rx="1" fill="#C5A028" opacity="0.5"/>
                          <rect x="30" y="4" width="10" height="12" rx="1" fill="#C5A028" opacity="0.5"/>
                          <rect x="4" y="19" width="10" height="12" rx="1" fill="#C5A028" opacity="0.5"/>
                          <rect x="17" y="19" width="10" height="12" rx="1" fill="#C5A028" opacity="0.5"/>
                          <rect x="30" y="19" width="10" height="12" rx="1" fill="#C5A028" opacity="0.5"/>
                          <line x1="14" y1="0" x2="14" y2="40" stroke="#B8941F" strokeWidth="0.5"/>
                          <line x1="27" y1="0" x2="27" y2="40" stroke="#B8941F" strokeWidth="0.5"/>
                          <line x1="0" y1="16" x2="48" y2="16" stroke="#B8941F" strokeWidth="0.5"/>
                        </svg>
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-wide">
                        {formData.service_provider || 'Service Provider'}
                      </div>
                    </div>

                    {/* Middle Section - Card Number */}
                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-wider opacity-80">
                        {formData.type === AccountType.BANK ? 'Account Number' : 'Mobile Number'}
                      </div>
                      <div className="text-xl font-mono tracking-widest">
                        {formData.number ? formData.number.replace(/(\d{4})(?=\d)/g, '$1 ') : '•••• •••• •••• ••••'}
                      </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-wider opacity-80 mb-1">
                          Account Holder
                        </div>
                        <div className="text-base font-semibold uppercase tracking-wide">
                          {formData.name || 'Your Name'}
                        </div>
                      </div>

                      {/* Logo */}
                      <div className="flex items-center">
                        {formData.type === AccountType.BANK ? (
                          <div className="px-4 py-2 bg-white rounded-md">
                            <div className="text-xl font-black tracking-tight text-slate-900">
                              CLARSIX
                            </div>
                          </div>
                        ) : formData.service_provider.toLowerCase().includes('mtn') ? (
                          <div className="text-right">
                            <div className="text-2xl font-black tracking-tight" style={{ color: '#000' }}>MTN</div>
                            <div className="text-xs font-bold -mt-1" style={{ color: '#000' }}>Mobile Money</div>
                          </div>
                        ) : formData.service_provider.toLowerCase().includes('vodafone') ? (
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <div className="w-6 h-6 rounded-full bg-white"></div>
                              <div className="text-xl font-bold text-white">Vodafone</div>
                            </div>
                            <div className="text-xs font-semibold text-white text-right">Cash</div>
                          </div>
                        ) : formData.service_provider.toLowerCase().includes('airtel') ? (
                          <div className="text-right">
                            <div className="text-xl font-black text-white">AirtelTigo</div>
                            <div className="text-xs font-bold text-white">Money</div>
                          </div>
                        ) : (
                          <div className="text-right">
                            <Wallet className="h-8 w-8 text-white" />
                            <div className="text-xs font-semibold text-white mt-1">Mobile Money</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Main Savings Account"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Account Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={AccountType.BANK}>Bank Account</option>
                  <option value={AccountType.MOMO}>Mobile Money</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={formData.type === AccountType.BANK ? "Account number" : "Mobile number"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Service Provider
                </label>
                <input
                  type="text"
                  name="service_provider"
                  value={formData.service_provider}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={formData.type === AccountType.BANK ? "e.g., GTBank, Ecobank" : "e.g., MTN, Vodafone, AirtelTigo"}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetEditForm}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={submitting}
                >
                  {submitting ? 'Updating...' : 'Update Account'}
                </Button>
              </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingAccount && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-md w-full shadow-2xl transform animate-scaleIn">
            {/* Icon Header */}
            <div className="flex flex-col items-center pt-8 pb-4 px-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <Trash2 className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Delete Payment Method?</h3>
              <p className="text-sm text-neutral-600 text-center leading-relaxed">
                Are you sure you want to remove this account? This action cannot be undone.
              </p>
            </div>

            {/* Account Preview */}
            <div className="mx-6 mb-6">
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-lg flex items-center justify-center flex-shrink-0">
                    {deletingAccount.type === AccountType.BANK ? (
                      <CreditCard className="h-6 w-6 text-neutral-600" />
                    ) : (
                      <Wallet className="h-6 w-6 text-neutral-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{deletingAccount.name}</p>
                    <p className="text-xs text-neutral-500 font-mono">
                      {deletingAccount.number.replace(/(\d{4})(?=\d)/g, '$1 ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingAccount(null);
                }}
                disabled={submitting}
                className="flex-1 px-4 py-3 text-sm font-semibold text-neutral-700 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={submitting}
                className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  'Yes, Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
