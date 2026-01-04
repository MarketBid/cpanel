import React, { useState } from 'react';
import {
  User,
  Shield,
  Bell,
  Moon,
  Sun,
  Mail,
  Phone,
  X,
  Smartphone,
  MapPin,
  Calendar,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { apiClient } from '../utils/api';
import { BUSINESS_CATEGORIES, TransactionStatus } from '../types';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useTransactions } from '../hooks/queries/useTransactions';

// --- Components ---

const Switch = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`
      relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2
      ${checked ? 'bg-[var(--color-primary)]' : 'bg-gray-200 dark:bg-gray-700'}
    `}
  >
    <span
      className={`
        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
        ${checked ? 'translate-x-5' : 'translate-x-0'}
      `}
    />
  </button>
);

interface SocialLink {
  name: string;
  value: string;
  customName?: string;
}

const SOCIAL_MEDIA_OPTIONS = [
  'whatsapp',
  'instagram',
  'tiktok',
  'facebook',
  'twitter',
  'other'
];

// --- Sections ---

const ProfileSection = () => {
  const { user, updateUser } = useAuth();
  const { data: transactions = [] } = useTransactions();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [convertingToBusiness, setConvertingToBusiness] = useState(false);

  const completedCount = transactions.filter(t => t.status === TransactionStatus.COMPLETED).length;
  const disputes = transactions.filter(t =>
    t.status === TransactionStatus.DISPUTED ||
    t.status === TransactionStatus.DISPUTE_RESOLVED
  );
  const totalDisputes = disputes.length;
  const resolvedDisputes = disputes.filter(t => t.status === TransactionStatus.DISPUTE_RESOLVED).length;

  const initializeSocialLinks = (): SocialLink[] => {
    if (!user?.social_links) return [];
    return user.social_links.map(link => ({
      name: SOCIAL_MEDIA_OPTIONS.includes(link.name) ? link.name : 'other',
      value: link.value,
      customName: SOCIAL_MEDIA_OPTIONS.includes(link.name) ? undefined : link.name
    }));
  };

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    contact: user?.contact || '',
    date_of_birth: user?.date_of_birth || '',
    location: user?.location || '',
    business_category: user?.business_category || '',
    social_media_links: initializeSocialLinks()
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSocialLinkChange = (index: number, field: 'name' | 'value' | 'customName', value: string) => {
    const updatedLinks = [...formData.social_media_links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setFormData({ ...formData, social_media_links: updatedLinks });
  };

  const addSocialLink = () => {
    setFormData({
      ...formData,
      social_media_links: [...formData.social_media_links, { name: 'instagram', value: '' }]
    });
  };

  const removeSocialLink = (index: number) => {
    const updatedLinks = formData.social_media_links.filter((_, i) => i !== index);
    setFormData({ ...formData, social_media_links: updatedLinks });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const socialLinksArray = formData.social_media_links
        .filter(link => link.value.trim())
        .map(link => ({
          name: link.name === 'other' ? (link.customName || 'other') : link.name,
          value: link.value.trim()
        }));

      const updateData = {
        name: formData.name,
        email: formData.email,
        contact: formData.contact,
        date_of_birth: formData.date_of_birth,
        location: formData.location,
        business_category: formData.business_category,
        social_links: socialLinksArray
      };

      await updateUser(updateData);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToBusiness = async () => {
    setConvertingToBusiness(true);
    try {
      await apiClient.put('/auth/user/add-business', {});
      window.location.reload();
    } catch (error) {
      console.error('Failed to convert to business account:', error);
    } finally {
      setConvertingToBusiness(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-10">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-8 border-b border-[var(--border-default)]">
        <div className="w-24 h-24 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-full flex items-center justify-center shadow-lg text-white text-4xl font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">{user.name}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
              {user.is_business ? 'Business Account' : 'Personal Account'}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${user.verified
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
              }`}>
              <ShieldCheck className="h-4 w-4" />
              {user.verified ? 'Verified' : 'Not Verified'}
            </span>
          </div>

          <div className="flex items-center gap-6 mt-4">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[var(--text-primary)]">{completedCount}</span>
              <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Completed Transactions</span>
            </div>
            <div className="w-px h-10 bg-[var(--border-default)]"></div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[var(--text-primary)]">
                {resolvedDisputes}/{totalDisputes}
              </span>
              <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Disputes Resolved</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          {!user.verified && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                localStorage.setItem('pending_verification_email', user.email);
                window.location.href = '/verify-email';
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Verify
            </Button>
          )}
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          )}
          {!user.is_business && !editing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleConvertToBusiness}
              loading={convertingToBusiness}
            >
              Switch to Business
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="pb-8 border-b border-[var(--border-default)]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">Personal Information</h3>
            {editing && (
              <div className="flex gap-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" loading={loading}>Save Changes</Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {editing ? (
              <>
                <Input label="Full Name" name="name" value={formData.name} onChange={handleInputChange} leftIcon={<User className="h-4 w-4" />} />
                <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} leftIcon={<Mail className="h-4 w-4" />} />
                <Input label="Phone Number" name="contact" type="tel" value={formData.contact} onChange={handleInputChange} leftIcon={<Phone className="h-4 w-4" />} />
                <Input label="Date of Birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleInputChange} leftIcon={<Calendar className="h-4 w-4" />} />
                <Input label="Location" name="location" value={formData.location} onChange={handleInputChange} leftIcon={<MapPin className="h-4 w-4" />} placeholder="City, Country" />
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-tertiary)]">Full Name</label>
                  <p className="text-base text-[var(--text-primary)]">{user.name}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-tertiary)]">Email Address</label>
                  <p className="text-base text-[var(--text-primary)]">{user.email}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-tertiary)]">Phone Number</label>
                  <p className="text-base text-[var(--text-primary)]">{user.contact || 'Not specified'}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-tertiary)]">Date of Birth</label>
                  <p className="text-base text-[var(--text-primary)]">
                    {user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'Not specified'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-tertiary)]">Location</label>
                  <p className="text-base text-[var(--text-primary)]">{user.location || 'Not specified'}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {user.is_business && (
          <div className="pb-8 border-b border-[var(--border-default)]">
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-8">Business Information</h3>
            <div className="max-w-md">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Business Category</label>
                {editing ? (
                  <select
                    name="business_category"
                    value={formData.business_category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--bg-card)] text-[var(--text-primary)]"
                  >
                    <option value="">Select category</option>
                    {BUSINESS_CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-base text-[var(--text-primary)]">{user.business_category || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {user.is_business && (
          <div className="pb-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">Media Links</h3>
              {editing && <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>Add Link</Button>}
            </div>

            {editing ? (
              <div className="space-y-6">
                {formData.social_media_links.map((link, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="w-1/4">
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Platform</label>
                      <select
                        value={link.name}
                        onChange={(e) => handleSocialLinkChange(index, 'name', e.target.value)}
                        className="w-full px-4 py-2.5 border border-[var(--border-default)] rounded-lg bg-[var(--bg-card)] text-[var(--text-primary)] text-sm"
                      >
                        {SOCIAL_MEDIA_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    {link.name === 'other' && (
                      <div className="w-1/4">
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Custom Name</label>
                        <input
                          type="text"
                          value={link.customName || ''}
                          onChange={(e) => handleSocialLinkChange(index, 'customName', e.target.value)}
                          className="w-full px-4 py-2.5 border border-[var(--border-default)] rounded-lg bg-[var(--bg-card)] text-[var(--text-primary)] text-sm"
                          placeholder="Platform name"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">{link.name === 'whatsapp' ? 'Phone Number' : 'URL/Username'}</label>
                      <input
                        type="text"
                        value={link.value}
                        onChange={(e) => handleSocialLinkChange(index, 'value', e.target.value)}
                        className="w-full px-4 py-2.5 border border-[var(--border-default)] rounded-lg bg-[var(--bg-card)] text-[var(--text-primary)] text-sm"
                        placeholder={link.name === 'whatsapp' ? '+233...' : 'https://...'}
                      />
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeSocialLink(index)} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-[42px] px-3">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {user.social_links && user.social_links.length > 0 ? (
                  user.social_links.map((link, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)]">
                      <Globe className="h-5 w-5 text-[var(--text-tertiary)]" />
                      <div>
                        <span className="block text-xs font-medium text-[var(--text-secondary)] capitalize mb-0.5">{link.name}</span>
                        <span className="block text-sm text-[var(--text-primary)] truncate">{link.value}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[var(--text-tertiary)] text-sm">No media links specified</p>
                )}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

const SecuritySection = () => {
  const { user } = useAuth();
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Security</h3>

      <div className="space-y-8">
        <div className="flex items-start justify-between pb-8 border-b border-[var(--border-default)]">
          <div className="space-y-1">
            <label className="text-base font-medium text-[var(--text-primary)]">Email address</label>
            <p className="text-sm text-[var(--text-secondary)]">The email address associated with your account.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-medium text-[var(--text-primary)]">{user?.email}</p>
              {!user?.verified && <p className="text-xs text-red-500 font-medium mt-0.5">Unverified</p>}
            </div>
          </div>
        </div>

        <div className="flex items-start justify-between pb-8 border-b border-[var(--border-default)]">
          <div className="space-y-1">
            <label className="text-base font-medium text-[var(--text-primary)]">Password</label>
            <p className="text-sm text-[var(--text-secondary)]">Set a unique password to protect your account.</p>
          </div>
          <Button variant="outline" size="sm">Change Password</Button>
        </div>

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <label className="text-base font-medium text-[var(--text-primary)]">2-step verification</label>
            <p className="text-sm text-[var(--text-secondary)]">Make your account extra secure. Along with your password, you'll need to enter a code.</p>
          </div>
          <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
        </div>
      </div>
    </div>
  );
};

const NotificationsSection = () => {
  const { user } = useAuth();
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Notifications</h3>

      <div className="space-y-8">
        {/* Email Notifications */}
        <div className="flex items-start justify-between pb-8 border-b border-[var(--border-default)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 mb-1">
              <Mail className="h-4 w-4 text-[var(--text-secondary)]" />
              <label className="text-base font-medium text-[var(--text-primary)]">Email Notifications</label>
            </div>
            <p className="text-sm text-[var(--text-secondary)] pl-6.5">Receive updates and alerts via email.</p>
            {emailNotif && (
              <div className="flex items-center gap-3 mt-3 pl-6.5">
                <span className="text-sm text-[var(--text-primary)] bg-[var(--bg-tertiary)] px-2.5 py-1 rounded-md">{user?.email}</span>
                <button className="text-xs font-medium text-[var(--color-primary)] hover:underline">Edit</button>
              </div>
            )}
          </div>
          <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
        </div>

        {/* SMS Notifications */}
        <div className="flex items-start justify-between pb-8 border-b border-[var(--border-default)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 mb-1">
              <Smartphone className="h-4 w-4 text-[var(--text-secondary)]" />
              <label className="text-base font-medium text-[var(--text-primary)]">SMS Notifications</label>
            </div>
            <p className="text-sm text-[var(--text-secondary)] pl-6.5">Receive important alerts via SMS.</p>
            {smsNotif && (
              <div className="flex items-center gap-3 mt-3 pl-6.5">
                <span className="text-sm text-[var(--text-primary)] bg-[var(--bg-tertiary)] px-2.5 py-1 rounded-md">{user?.contact || 'No number added'}</span>
                <button className="text-xs font-medium text-[var(--color-primary)] hover:underline">Edit</button>
              </div>
            )}
          </div>
          <Switch checked={smsNotif} onCheckedChange={setSmsNotif} />
        </div>

        {/* Push Notifications */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 mb-1">
              <Bell className="h-4 w-4 text-[var(--text-secondary)]" />
              <label className="text-base font-medium text-[var(--text-primary)]">App Push Notifications</label>
            </div>
            <p className="text-sm text-[var(--text-secondary)] pl-6.5">Receive push notifications on your device.</p>
          </div>
          <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
        </div>
      </div>
    </div>
  );
};

const AppearanceSection = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Appearance</h3>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 mb-1">
            {theme === 'dark' ? <Moon className="h-4 w-4 text-[var(--text-secondary)]" /> : <Sun className="h-4 w-4 text-[var(--text-secondary)]" />}
            <label className="text-base font-medium text-[var(--text-primary)]">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </label>
          </div>
          <p className="text-sm text-[var(--text-secondary)] pl-6.5">Toggle between light and dark themes.</p>
        </div>
        <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
      </div>
    </div>
  );
};

// --- Main Settings Page ---

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'appearance'>('profile');
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Moon },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-10">Account Settings</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 lg:border-r lg:border-[var(--border-default)] lg:pr-6">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-[rgba(11,138,110,0.1)] dark:bg-[rgba(11,138,110,0.2)] text-[rgb(11,138,110)] dark:text-[rgb(16,185,129)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-[rgb(11,138,110)] dark:text-[rgb(16,185,129)]' : 'text-[var(--text-tertiary)]'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && <ProfileSection />}
          {activeTab === 'security' && <SecuritySection />}
          {activeTab === 'notifications' && <NotificationsSection />}
          {activeTab === 'appearance' && <AppearanceSection />}
        </div>
      </div>
    </div>
  );
};

export default Settings;
