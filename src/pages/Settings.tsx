import React, { useState } from 'react';
import { FaWhatsapp, FaInstagram, FaTiktok, FaFacebook, FaTwitter, FaUserCircle, FaLock, FaBell, FaPalette, FaCreditCard } from 'react-icons/fa';

const SocialIcon = ({ name }: { name: string }) => {
  const n = name.toLowerCase();
  if (n.includes('whatsapp')) return <FaWhatsapp size={16} color="#25D366" />;
  if (n.includes('instagram')) return <FaInstagram size={16} color="#E1306C" />;
  if (n.includes('tiktok')) return <FaTiktok size={16} color="#000" />;
  if (n.includes('facebook')) return <FaFacebook size={16} color="#1877F2" />;
  if (n.includes('twitter')) return <FaTwitter size={16} color="#1DA1F2" />;
  return <Globe className="h-4 w-4 text-[var(--text-tertiary)]" />;
};
import {
  Bell,
  Moon,
  Sun,
  Mail,
  X,
  Smartphone,
  MapPin,
  Calendar,
  ShieldCheck,
  Globe,
  UploadCloud,
  Star
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { apiClient } from '../utils/api';
import { BUSINESS_CATEGORIES } from '../types';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Toast from '../components/ui/Toast';
import { useTransactions } from '../hooks/queries/useTransactions';
import Accounts from './Accounts';

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
  useTransactions();
  const [loading, setLoading] = useState(false);
  const [convertingToBusiness, setConvertingToBusiness] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
    social_media_links: initializeSocialLinks(),
    bio: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

      const updateData: Record<string, any> = {};

      if (formData.name !== (user?.name || '')) updateData.name = formData.name;
      if (formData.email !== (user?.email || '')) updateData.email = formData.email;
      if (formData.contact !== (user?.contact || '')) updateData.contact = formData.contact;
      if (formData.date_of_birth !== (user?.date_of_birth || '')) updateData.date_of_birth = formData.date_of_birth;
      if (formData.location !== (user?.location || '')) updateData.location = formData.location;
      if (formData.business_category !== (user?.business_category || '')) updateData.business_category = formData.business_category;

      const currentSocialLinks = user?.social_links || [];
      const hasSocialLinksChanged =
        currentSocialLinks.length !== socialLinksArray.length ||
        !currentSocialLinks.every((link, index) =>
          link.name === socialLinksArray[index].name &&
          link.value === socialLinksArray[index].value
        );

      if (hasSocialLinksChanged) {
        updateData.social_links = socialLinksArray;
      }

      if (Object.keys(updateData).length > 0) {
        await updateUser(updateData);
        setToast({ message: 'Profile updated successfully', type: 'success' });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setToast({ message: 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      contact: user?.contact || '',
      date_of_birth: user?.date_of_birth || '',
      location: user?.location || '',
      business_category: user?.business_category || '',
      social_media_links: initializeSocialLinks(),
      bio: ''
    });
    setIsEditing(false);
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
    <div className="space-y-8">
      {/* Header with Actions */}
      {/* Header with Actions */}
      <div className="flex items-center justify-between pb-6 border-b border-[var(--border-default)]">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Personal info</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Update your photo and personal details here.</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button variant="primary" onClick={handleSubmit} loading={loading}>Save</Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Photo Section */}
        <div className="flex flex-col md:flex-row gap-8 pb-8 border-b border-[var(--border-default)]">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-[var(--text-primary)]">Your photo</label>
            <p className="text-sm text-[var(--text-secondary)] mt-1">This will be displayed on your profile.</p>
          </div>
          <div className="flex-1 flex items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {user.verified && (
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[var(--bg-card)] rounded-full p-0.5 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-blue-500 fill-blue-500/10" />
                </div>
              )}
            </div>
            <div className="flex-1 border border-dashed border-[var(--border-default)] rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer group">
              <div className="p-2 bg-[var(--bg-tertiary)] rounded-full mb-2 group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
                <UploadCloud className="h-5 w-5 text-[var(--text-tertiary)]" />
              </div>
              <div className="text-sm text-[var(--text-primary)]">
                <span className="font-semibold text-[var(--color-primary)]">Click to upload</span> or drag and drop
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-8 border-b border-[var(--border-default)]">
          <label htmlFor="profile-name" className="text-sm font-medium text-[var(--text-primary)] pt-2">Name</label>
          <div className="md:col-span-2">
            <Input id="profile-name" name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} className="bg-white dark:bg-[var(--bg-card)]" />
          </div>
        </div>

        {/* Email */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-8 border-b border-[var(--border-default)]">
          <label htmlFor="profile-email" className="text-sm font-medium text-[var(--text-primary)] pt-2">Email address</label>
          <div className="md:col-span-2">
            <Input id="profile-email" name="email" type="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} leftIcon={<Mail className="h-4 w-4" />} className="bg-white dark:bg-[var(--bg-card)]" />
          </div>
        </div>

        {/* Phone */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-8 border-b border-[var(--border-default)]">
          <label htmlFor="profile-contact" className="text-sm font-medium text-[var(--text-primary)] pt-2">Phone</label>
          <div className="md:col-span-2">
            <Input id="profile-contact" name="contact" type="tel" value={formData.contact} onChange={handleInputChange} disabled={!isEditing} className="bg-white dark:bg-[var(--bg-card)]" />
          </div>
        </div>

        {/* Date of Birth */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-8 border-b border-[var(--border-default)]">
          <label htmlFor="profile-dob" className="text-sm font-medium text-[var(--text-primary)] pt-2">Date of Birth</label>
          <div className="md:col-span-2">
            <Input id="profile-dob" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleInputChange} disabled={!isEditing} leftIcon={<Calendar className="h-4 w-4" />} className="bg-white dark:bg-[var(--bg-card)]" />
          </div>
        </div>

        {/* Bio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-8 border-b border-[var(--border-default)]">
          <div className="space-y-1">
            <label htmlFor="profile-bio" className="text-sm font-medium text-[var(--text-primary)]">Bio</label>
            <p className="text-xs text-[var(--text-secondary)]">Write a short introduction.</p>
          </div>
          <div className="md:col-span-2">
            {isEditing ? (
              <textarea
                id="profile-bio"
                name="bio"
                className="w-full px-4 py-3 rounded-lg border border-[var(--border-default)] bg-white dark:bg-[var(--bg-card)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all resize-none min-h-[120px]"
                placeholder="I'm a UI/UX Designer based in..."
                value={formData.bio}
                onChange={handleInputChange}
              />
            ) : (
              <p className="text-base text-[var(--text-primary)]">{formData.bio || 'Not specified'}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-8 border-b border-[var(--border-default)]">
          <label htmlFor="profile-location" className="text-sm font-medium text-[var(--text-primary)] pt-2">Location</label>
          <div className="md:col-span-2 pt-2">
            {isEditing ? (
              <Input id="profile-location" name="location" value={formData.location} onChange={handleInputChange} leftIcon={<MapPin className="h-4 w-4" />} placeholder="City, Country" className="bg-white dark:bg-[var(--bg-card)]" />
            ) : (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--text-tertiary)]" />
                <p className="text-base text-[var(--text-primary)]">{user.location || 'Not specified'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Business Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-8 border-b border-[var(--border-default)]">
          <label htmlFor="profile-business-category" className="text-sm font-medium text-[var(--text-primary)] pt-2">Business Category</label>
          <div className="md:col-span-2 pt-2">
            {isEditing ? (
              <select
                id="profile-business-category"
                name="business_category"
                value={formData.business_category}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-white dark:bg-[var(--bg-card)] text-[var(--text-primary)]"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-8 border-b border-[var(--border-default)]">
          <label className="text-sm font-medium text-[var(--text-primary)] pt-2">Rating</label>
          <div className="md:col-span-2 flex items-center gap-2 pt-2">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span className="text-base font-semibold text-[var(--text-primary)]">{(user.rating ?? 0).toFixed(1)}</span>
            <span className="text-sm text-[var(--text-secondary)]">({user.total_ratings ?? 0} reviews)</span>
          </div>
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--text-primary)]">Social Profiles</label>
          </div>
          <div className="md:col-span-2 space-y-4">
            {isEditing ? (
              <>
                {formData.social_media_links.map((link, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label htmlFor={`social-platform-${index}`} className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Platform</label>
                      <select
                        id={`social-platform-${index}`}
                        value={link.name}
                        onChange={(e) => handleSocialLinkChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg bg-white dark:bg-[var(--bg-card)] text-[var(--text-primary)] text-sm"
                      >
                        {SOCIAL_MEDIA_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    {link.name === 'other' && (
                      <div className="flex-1">
                        <label htmlFor={`social-custom-${index}`} className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Custom Name</label>
                        <input
                          id={`social-custom-${index}`}
                          type="text"
                          value={link.customName || ''}
                          onChange={(e) => handleSocialLinkChange(index, 'customName', e.target.value)}
                          className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg bg-white dark:bg-[var(--bg-card)] text-[var(--text-primary)] text-sm"
                          placeholder="Platform name"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <label htmlFor={`social-value-${index}`} className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">{link.name === 'whatsapp' ? 'Phone Number' : 'URL/Username'}</label>
                      <input
                        id={`social-value-${index}`}
                        type="text"
                        value={link.value}
                        onChange={(e) => handleSocialLinkChange(index, 'value', e.target.value)}
                        className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg bg-white dark:bg-[var(--bg-card)] text-[var(--text-primary)] text-sm"
                        placeholder={link.name === 'whatsapp' ? '+233...' : 'https://...'}
                      />
                    </div>
                    <button type="button" onClick={() => removeSocialLink(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mb-0.5">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>Add Profile</Button>
              </>
            ) : (
              <>
                {user.social_links && user.social_links.length > 0 ? (
                  user.social_links.map((link, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <SocialIcon name={link.name} />
                      <div>
                        <span className="block text-xs font-medium text-[var(--text-secondary)] capitalize">{link.name}</span>
                        <span className="block text-sm text-[var(--text-primary)]">{link.value}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-base text-[var(--text-primary)]">No social profiles added.</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Convert to Business Option */}
      {!user.is_business && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleConvertToBusiness}
            loading={convertingToBusiness}
            className="text-[var(--text-secondary)]"
          >
            Switch to Business Account
          </Button>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun, description: 'Light theme' },
    { value: 'dark' as const, label: 'Dark', icon: Moon, description: 'Dark theme' },
    { value: 'system' as const, label: 'System', icon: Globe, description: 'Follow system preference' },
  ];

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Appearance</h3>

      <div className="space-y-4">
        <div className="space-y-1 mb-4">
          <label className="text-base font-medium text-[var(--text-primary)]">Theme</label>
          <p className="text-sm text-[var(--text-secondary)]">Select your preferred theme</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.value;

            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${isSelected
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] ring-1 ring-[var(--color-primary)]'
                    : 'border-[var(--border-default)] bg-[var(--bg-card)] hover:border-[var(--border-medium)]'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={`font-semibold ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--text-primary)]'}`}>
                      {option.label}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{option.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Main Settings Page ---

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'appearance' | 'payments'>('profile');
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: FaUserCircle },
    { id: 'security', label: 'Security', icon: FaLock },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'appearance', label: 'Appearance', icon: FaPalette },
    { id: 'payments', label: 'Payments', icon: FaCreditCard },
  ];

  return (
    <div className="animate-fade-in pt-6 pb-12">
        <div className="mb-7">
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Settings</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your account, security and preferences</p>
        </div>

        <div className="grid grid-cols-[240px_1fr] gap-7 items-start">
          {/* Left: Vertical tab sidebar */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-2.5 sticky top-20 self-start">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2.5 w-full px-3.5 py-3 rounded-xl text-sm transition-colors text-left mb-0.5
                    ${isActive
                      ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold'
                      : 'text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-tertiary)]'
                    }
                  `}
                >
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right: Content panel */}
          <div>
            {activeTab === 'profile' && <ProfileSection />}
            {activeTab === 'security' && <SecuritySection />}
            {activeTab === 'notifications' && <NotificationsSection />}
            {activeTab === 'appearance' && <AppearanceSection />}
            {activeTab === 'payments' && <Accounts />}
          </div>
        </div>
    </div>
  );
};

export default Settings;
