import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Search, MapPin, Building, User as UserIcon, Mail, Phone, X, CheckCircle, Scale, DollarSign, ArrowRight, ArrowLeft, ShieldCheck, ChevronDown, ArrowUpDown } from 'lucide-react';
import { User, BUSINESS_CATEGORIES } from '../types';
import { apiClient } from '../utils/api';
import { Card, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showVerificationDropdown, setShowVerificationDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [transactionSelectUser, setTransactionSelectUser] = useState<User | null>(null);
  const [showMessageConfirmation, setShowMessageConfirmation] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const verificationDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, categoryFilters, verificationFilter, sortOrder]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (verificationDropdownRef.current && !verificationDropdownRef.current.contains(event.target as Node)) {
        setShowVerificationDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get<User[]>('/auth/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.business_category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilters.length > 0) {
      filtered = filtered.filter(user =>
        user.business_category && categoryFilters.includes(user.business_category)
      );
    }

    if (verificationFilter !== 'all') {
      filtered = filtered.filter(user =>
        verificationFilter === 'verified' ? user.verified : !user.verified
      );
    }

    if (sortOrder) {
      filtered.sort((a, b) => {
        const aCount = a.completed_transactions || 0;
        const bCount = b.completed_transactions || 0;
        return sortOrder === 'asc' ? aCount - bCount : bCount - aCount;
      });
    }

    setFilteredUsers(filtered);
  };

  const toggleCategoryFilter = (category: string) => {
    setCategoryFilters(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearCategoryFilters = () => {
    setCategoryFilters([]);
  };

  const allCategories = BUSINESS_CATEGORIES;



  const handleUserCardClick = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setShowUserModal(false);
  };

  const handleCreateTransaction = () => {
    setTransactionSelectUser(selectedUser);
    setShowUserModal(false);
  };

  const handleMessageUser = () => {
    if (!selectedUser) return;
    setShowUserModal(false);
    setShowMessageConfirmation(true);
  };

  const executeMessageUser = async () => {
    if (!selectedUser) return;

    try {
      // Create or get existing conversation
      const response = await apiClient.post<{ id: number }>('/chat/conversations', {
        type: 'direct',
        participant_ids: [selectedUser.id]
      });

      const conversationId = response.data.id;

      // Invalidate conversations query to ensure the new conversation shows up
      await queryClient.invalidateQueries({ queryKey: ['conversations'] });

      navigate(`/chats?conversationId=${conversationId}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      // You might want to show an error toast here
    } finally {
      setShowMessageConfirmation(false);
      setSelectedUser(null);
    }
  };

  const handleRoleSelect = (role: 'pay' | 'receive') => {
    if (!transactionSelectUser) return;

    if (role === 'pay') {
      // I am paying -> I am Sender -> User is Receiver
      navigate(`/transactions/create?receiver=${transactionSelectUser.id}`);
    } else {
      // I am receiving -> I am Receiver -> User is Sender
      navigate(`/transactions/create?sender=${transactionSelectUser.id}`);
    }
    setTransactionSelectUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading users..." />
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col space-y-6 pt-6 animate-fade-in">
        <div className="flex-none space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Users</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Browse and connect with other users on the platform.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--text-primary)] transition-all"
              />
            </div>
          </div>

          {/* Filter Row */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">

              {/* Category Filter */}
              <div className="relative" ref={categoryDropdownRef}>
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors min-w-[100px] justify-between"
                >
                  <span>{categoryFilters.length > 0 ? `${categoryFilters.length} Categories` : 'All Categories'}</span>
                  <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
                </button>
                {showCategoryDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-xl z-50 p-2">
                    <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                      <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Category</span>
                      {categoryFilters.length > 0 && (
                        <button
                          onClick={clearCategoryFilters}
                          className="text-xs text-[var(--color-primary)] hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="space-y-0.5 max-h-60 overflow-y-auto">
                      {allCategories.length > 0 ? allCategories.map(category => {
                        const isChecked = categoryFilters.includes(category);
                        return (
                          <label
                            key={category}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-[var(--bg-tertiary)] rounded-lg cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCategoryFilter(category)}
                              className="w-3.5 h-3.5 rounded border-[var(--border-medium)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                            />
                            <span className="text-sm text-[var(--text-primary)] capitalize">
                              {category}
                            </span>
                          </label>
                        );
                      }) : (
                        <div className="px-2 py-2 text-sm text-[var(--text-secondary)]">No categories found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Verification Filter */}
              <div className="relative" ref={verificationDropdownRef}>
                <button
                  onClick={() => setShowVerificationDropdown(!showVerificationDropdown)}
                  className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors min-w-[100px] justify-between"
                >
                  <span>
                    {verificationFilter === 'all' ? 'All Users' :
                      verificationFilter === 'verified' ? 'Verified Only' : 'Unverified Only'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
                </button>
                {showVerificationDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-xl z-50 p-2">
                    <div className="space-y-0.5">
                      <button
                        onClick={() => { setVerificationFilter('all'); setShowVerificationDropdown(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${verificationFilter === 'all' ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'}`}
                      >
                        All Users
                      </button>
                      <button
                        onClick={() => { setVerificationFilter('verified'); setShowVerificationDropdown(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${verificationFilter === 'verified' ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'}`}
                      >
                        Verified Only
                      </button>
                      <button
                        onClick={() => { setVerificationFilter('unverified'); setShowVerificationDropdown(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${verificationFilter === 'unverified' ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'}`}
                      >
                        Unverified Only
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className={`flex items-center gap-2 px-3 py-2 bg-[var(--bg-card)] border rounded-lg text-sm font-medium transition-colors ${sortOrder
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                    }`}
                >
                  <ArrowUpDown className="h-4 w-4" />
                  <span>
                    {sortOrder === 'asc' ? 'Least Completed' : sortOrder === 'desc' ? 'Most Completed' : 'Sort'}
                  </span>
                </button>
                {showSortDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-xl z-50 p-2">
                    <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                      <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Completed Transactions</span>
                      {sortOrder && (
                        <button
                          onClick={() => { setSortOrder(null); setShowSortDropdown(false); }}
                          className="text-xs text-[var(--color-primary)] hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <button
                        onClick={() => { setSortOrder('desc'); setShowSortDropdown(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${sortOrder === 'desc' ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'}`}
                      >
                        Most Completed
                      </button>
                      <button
                        onClick={() => { setSortOrder('asc'); setShowSortDropdown(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${sortOrder === 'asc' ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'}`}
                      >
                        Least Completed
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} onClick={() => handleUserCardClick(user)} className="cursor-pointer hover:shadow-md transition-all duration-200 group border border-[var(--border-default)] hover:border-[var(--color-primary)]/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm text-white font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      {user.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-[var(--bg-card)] rounded-full p-0.5 shadow-sm z-10 ring-2 ring-[var(--bg-card)]">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate pr-2">{user.name}</h3>
                        {user.is_business && user.business_category && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-800 flex-shrink-0">
                            {user.business_category}
                          </span>
                        )}
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5" title="Completed Transactions">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-xs font-medium text-[var(--text-secondary)]">
                            {user.completed_transactions ?? 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Disputes Resolved">
                          <Scale className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-xs font-medium text-[var(--text-secondary)]">
                            {user.resolved_disputes ? `${user.resolved_disputes[0]}/${user.resolved_disputes[1]}` : '0/0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 mx-auto bg-[var(--bg-tertiary)] rounded-3xl flex items-center justify-center mb-6">
                <UserIcon className="h-10 w-10 text-[var(--text-tertiary)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No users found</h3>
              <p className="text-[var(--text-secondary)]">Try adjusting your search terms</p>
            </CardContent>
          </Card>
        )}



      </div>
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--text-inverse)]/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] max-w-md w-full overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)] bg-[var(--bg-tertiary)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">User Profile</h2>
              <button onClick={closeUserModal} className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors">
                <X className="h-5 w-5 text-[var(--text-secondary)]" />
              </button>
            </div>
            <div className="px-6 py-8 space-y-6">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-20 h-20 bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-lg mb-2">
                    <span className="text-4xl font-bold text-[var(--color-primary-text)]">{selectedUser.name.charAt(0).toUpperCase()}</span>
                  </div>
                  {selectedUser.verified && (
                    <div className="absolute bottom-2 right-0 bg-white dark:bg-[var(--bg-card)] rounded-full p-1 shadow-sm z-10">
                      <ShieldCheck className="w-5 h-5 text-blue-500 fill-blue-500/10" />
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{selectedUser.name}</h3>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
                    <Mail className="h-4 w-4 text-[var(--text-tertiary)]" /> {selectedUser.email}
                  </span>
                  {selectedUser.contact && (
                    <span className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
                      <Phone className="h-4 w-4 text-[var(--text-tertiary)]" /> {selectedUser.contact}
                    </span>
                  )}
                  {selectedUser.location && (
                    <span className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-[var(--text-tertiary)]" /> {selectedUser.location}
                    </span>
                  )}
                </div>
                {selectedUser.is_business && selectedUser.business_category && (
                  <Badge variant="info" className="mt-2">
                    <Building className="h-3 w-3 mr-1" />
                    {selectedUser.business_category}
                  </Badge>
                )}
                <div className="w-full mt-4">
                  <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 text-center">Transaction Stats</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center p-3 bg-[var(--bg-tertiary)] rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-xs font-medium text-[var(--text-secondary)]">Completed</span>
                      </div>
                      <span className="text-lg font-bold text-[var(--text-primary)]">
                        {selectedUser.completed_transactions ?? 0}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-[var(--bg-tertiary)] rounded-lg">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Scale className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-medium text-[var(--text-secondary)]">Disputes Resolved</span>
                      </div>
                      <span className="text-lg font-bold text-[var(--text-primary)]">
                        {selectedUser.resolved_disputes ? `${selectedUser.resolved_disputes[0]}/${selectedUser.resolved_disputes[1]}` : '0/0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {selectedUser.social_links && selectedUser.social_links.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Social Links</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedUser.social_links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.value.startsWith('http') ? link.value : `https://${link.value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium text-sm transition-colors shadow-sm"
                      >
                        <span className="capitalize">{link.name}</span>
                        <span className="truncate max-w-[120px]">{link.value}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-[var(--border-default)] grid grid-cols-2 gap-3">
                <Button
                  onClick={handleMessageUser}
                  variant="secondary"
                  className="w-full"
                  leftIcon={<Mail className="h-4 w-4" />}
                >
                  Message
                </Button>
                <Button
                  onClick={handleCreateTransaction}
                  className="w-full"
                  leftIcon={<DollarSign className="h-4 w-4" />}
                >
                  Create Transaction
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {transactionSelectUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--text-inverse)]/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] max-w-md w-full overflow-hidden animate-fade-in p-6">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Create Transaction</h3>
            <p className="text-[var(--text-secondary)] mb-6">
              How would you like to transact with <span className="font-semibold text-[var(--text-primary)]">{transactionSelectUser.name}</span>?
            </p>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => handleRoleSelect('pay')}
                className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-default)] hover:border-[var(--color-primary)] hover:bg-[var(--bg-tertiary)] transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--text-primary)]">Pay {transactionSelectUser.name}</div>
                    <div className="text-xs text-[var(--text-secondary)]">I want to send money</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('receive')}
                className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-default)] hover:border-[var(--color-primary)] hover:bg-[var(--bg-tertiary)] transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <ArrowLeft className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--text-primary)]">Receive from {transactionSelectUser.name}</div>
                    <div className="text-xs text-[var(--text-secondary)]">I want to request money</div>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setTransactionSelectUser(null)}
              className="mt-6 w-full py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {showMessageConfirmation && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--text-inverse)]/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] max-w-md w-full overflow-hidden animate-fade-in p-6">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Start Conversation</h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Are you sure you want to start a conversation with <span className="font-semibold text-[var(--text-primary)]">{selectedUser.name}</span>?
            </p>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowMessageConfirmation(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={executeMessageUser}
                className="flex-1"
                leftIcon={<Mail className="h-4 w-4" />}
              >
                Start Chat
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Users;
