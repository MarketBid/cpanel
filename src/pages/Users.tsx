import React, { useState, useEffect } from 'react';
import { Search, Star, MessageCircle, Package, MapPin, Building, User as UserIcon, Mail, Phone, X } from 'lucide-react';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth.tsx';
import { apiClient } from '../utils/api';
import StarRating from '../components/StarRating';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRatingModal, setShowRatingModal] = useState<User | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

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
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.business_category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  };

  const submitRating = async () => {
    if (!showRatingModal) return;

    setSubmittingRating(true);
    try {
      await apiClient.post(`/users/${showRatingModal.id}/rate`, { rating: ratingValue });
      setShowRatingModal(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to submit rating:', error);
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleUserCardClick = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setShowUserModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Users</h1>
        <p className="mt-1 text-[var(--text-secondary)]">Browse and connect with other users on the platform.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name, email, or category..."
              className="w-full pl-10 pr-4 py-2.5 border border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all bg-[var(--bg-card)] text-[var(--text-primary)]"
            />
          </div>
        </CardContent>
      </Card>

      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} onClick={() => handleUserCardClick(user)} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <span className="text-3xl font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{user.name}</h3>
                  {user.is_business && user.business_category && (
                    <Badge variant="info" className="mb-3">
                      <Building className="h-3 w-3 mr-1" />
                      {user.business_category}
                    </Badge>
                  )}
                  {user.rating > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="font-semibold text-[var(--text-primary)]">{user.rating.toFixed(1)}</span>
                      <span className="text-sm text-[var(--text-secondary)]">({user.total_ratings})</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Mail className="h-4 w-4 text-[var(--text-tertiary)]" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.contact && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Phone className="h-4 w-4 text-[var(--text-tertiary)]" />
                      <span>{user.contact}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <MapPin className="h-4 w-4 text-[var(--text-tertiary)]" />
                      <span>{user.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-[var(--border-default)]">
                  {user.id !== currentUser?.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      leftIcon={<Star className="h-4 w-4" />}
                      onClick={e => { e.stopPropagation(); setShowRatingModal(user); }}
                    >
                      Rate
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    leftIcon={<MessageCircle className="h-4 w-4" />}
                    onClick={e => e.stopPropagation()}
                  >
                    Message
                  </Button>
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

      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--text-inverse)]/60 backdrop-blur-sm p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Rate {showRatingModal.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-white">
                    {showRatingModal.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-[var(--text-secondary)] mb-4">How would you rate your experience with this user?</p>
                <div className="flex justify-center">
                  <StarRating
                    rating={ratingValue}
                    onChange={setRatingValue}
                    size="lg"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRatingModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  loading={submittingRating}
                  onClick={submitRating}
                >
                  Submit Rating
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--text-inverse)]/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] max-w-md w-full overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)] bg-[var(--bg-tertiary)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">User Profile</h2>
              <button onClick={closeUserModal} className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors">
                <X className="h-5 w-5 text-[var(--text-secondary)]" />
              </button>
            </div>
            <div className="px-6 py-8 space-y-6">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-lg mb-2">
                  <span className="text-4xl font-bold text-[var(--color-primary-text)]">{selectedUser.name.charAt(0).toUpperCase()}</span>
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
                {selectedUser.rating > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="font-semibold text-[var(--text-primary)]">{selectedUser.rating.toFixed(1)}</span>
                    <span className="text-sm text-[var(--text-secondary)]">({selectedUser.total_ratings})</span>
                  </div>
                )}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
