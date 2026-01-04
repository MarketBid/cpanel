import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building, User as UserIcon, Mail, Phone, X, CheckCircle, Scale } from 'lucide-react';
import { User } from '../types';
import { apiClient } from '../utils/api';
import { Card, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

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
    <>
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

                  <div className="pt-4 border-t border-[var(--border-default)]">
                    <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 text-center">Transaction Stats</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center p-3 bg-[var(--bg-tertiary)] rounded-lg">
                        <div className="flex items-center gap-1.5 mb-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-xs font-medium text-[var(--text-secondary)]">Completed</span>
                        </div>
                        <span className="text-lg font-bold text-[var(--text-primary)]">
                          {user.completed_transactions ?? 0}
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-[var(--bg-tertiary)] rounded-lg">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Scale className="h-4 w-4 text-blue-500" />
                          <span className="text-xs font-medium text-[var(--text-secondary)]">Disputes Resolved</span>
                        </div>
                        <span className="text-lg font-bold text-[var(--text-primary)]">
                          {user.resolved_disputes ? `${user.resolved_disputes[0]}/${user.resolved_disputes[1]}` : '0/0'}
                        </span>
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Users;
