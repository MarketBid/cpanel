import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Building, Star, CreditCard as Edit, Save, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.tsx';
import { BUSINESS_CATEGORIES } from '../types';
import { apiClient } from '../utils/api';
import StarRating from '../components/StarRating';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [convertingToBusiness, setConvertingToBusiness] = useState(false);

  // Convert social_links from API to form format
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert social links array to API format
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSocialLinkChange = (index: number, field: 'name' | 'value' | 'customName', value: string) => {
    const updatedLinks = [...formData.social_media_links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setFormData({
      ...formData,
      social_media_links: updatedLinks
    });
  };

  const addSocialLink = () => {
    setFormData({
      ...formData,
      social_media_links: [...formData.social_media_links, { name: 'instagram', value: '' }]
    });
  };

  const removeSocialLink = (index: number) => {
    const updatedLinks = formData.social_media_links.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      social_media_links: updatedLinks
    });
  };

  const handleConvertToBusiness = async () => {
    setConvertingToBusiness(true);

    try {
      await apiClient.put('/auth/user/add-business', {});
      // Refresh user data after successful conversion
      window.location.reload(); // Simple way to refresh user data
    } catch (error) {
      console.error('Failed to convert to business account:', error);
    } finally {
      setConvertingToBusiness(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      contact: user?.contact || '',
      date_of_birth: user?.date_of_birth || '',
      location: user?.location || '',
      business_category: user?.business_category || '',
      social_media_links: initializeSocialLinks()
    });
    setEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <Card>
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text-primary)] truncate">{user.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-0.5 sm:mt-1">
                  <p className="text-sm sm:text-base text-[var(--text-secondary)]">
                    {user.is_business ? 'Business Account' : 'Personal Account'}
                  </p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${user.verified
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                    }`}>
                    {user.verified ? (
                      <>
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-3 w-3" />
                        Not Verified
                      </>
                    )}
                  </span>
                </div>
                {user.rating > 0 && (
                  <div className="flex items-center mt-1.5 sm:mt-2">
                    <StarRating
                      rating={user.rating}
                      readonly
                      size="sm"
                      showCount
                      count={user.total_ratings}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {editing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    leftIcon={<X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                    onClick={cancelEdit}
                    className="text-xs sm:text-sm w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    leftIcon={<Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                    loading={loading}
                    onClick={handleSubmit}
                    className="text-xs sm:text-sm w-full sm:w-auto"
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  {!user.verified && (
                    <Button
                      variant="primary"
                      leftIcon={<ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                      onClick={() => {
                        localStorage.setItem('pending_verification_email', user.email);
                        window.location.href = '/verify-email';
                      }}
                      className="text-xs sm:text-sm w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
                    >
                      Verify Account
                    </Button>
                  )}

                  {!user.is_business && (
                    <Button
                      variant="primary"
                      leftIcon={<Building className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                      onClick={handleConvertToBusiness}
                      loading={convertingToBusiness}
                      disabled={convertingToBusiness}
                      className="text-xs sm:text-sm w-full sm:w-auto"
                    >
                      {convertingToBusiness ? 'Converting...' : 'Switch to Business'}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    leftIcon={<Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                    onClick={() => setEditing(true)}
                    className="text-xs sm:text-sm w-full sm:w-auto"
                  >
                    Edit Profile
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--color-primary-light)] rounded-lg sm:rounded-xl flex items-center justify-center">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-primary)]" />
                </div>
                <CardTitle>Personal Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {editing ? (
                <>
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    leftIcon={<User className="h-5 w-5" />}
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    leftIcon={<Mail className="h-5 w-5" />}
                  />
                  <Input
                    label="Phone Number"
                    name="contact"
                    type="tel"
                    value={formData.contact}
                    onChange={handleInputChange}
                    leftIcon={<Phone className="h-5 w-5" />}
                  />
                  <Input
                    label="Date of Birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    leftIcon={<Calendar className="h-5 w-5" />}
                  />
                  <Input
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    leftIcon={<MapPin className="h-5 w-5" />}
                    placeholder="City, Country"
                  />
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[var(--text-tertiary)]">Full Name</label>
                    <p className="text-[var(--text-primary)] font-medium">{user.name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[var(--text-tertiary)]">Email Address</label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[var(--text-tertiary)]" />
                      <p className="text-[var(--text-primary)]">{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[var(--text-tertiary)]">Phone Number</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[var(--text-tertiary)]" />
                      <p className="text-[var(--text-primary)]">{user.contact}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[var(--text-tertiary)]">Date of Birth</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[var(--text-tertiary)]" />
                      <p className="text-[var(--text-primary)]">
                        {user.date_of_birth
                          ? new Date(user.date_of_birth).toLocaleDateString()
                          : 'Not specified'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[var(--text-tertiary)]">Location</label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[var(--text-tertiary)]" />
                      <p className="text-[var(--text-primary)]">{user.location || 'Not specified'}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Business Information */}
          {user.is_business && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-[var(--text-primary)]" />
                  </div>
                  <CardTitle>Business Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">
                    Business Category
                  </label>
                  {editing ? (
                    <select
                      name="business_category"
                      value={formData.business_category}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="">Select category</option>
                      {BUSINESS_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-[var(--text-primary)] font-medium">{user.business_category || 'Not specified'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-[var(--text-primary)] font-semibold">
                      {user.rating.toFixed(1)}
                    </span>
                    <span className="text-[var(--text-tertiary)]">
                      ({user.total_ratings} reviews)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add spacing before social media links card */}
        {user.is_business && (
          <div className="mb-8" />
        )}

        {/* Social Media Links */}
        {user.is_business && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Media Links</CardTitle>
                {editing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSocialLink}
                  >
                    Add Link
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="space-y-4">
                  {formData.social_media_links.map((link, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          Platform
                        </label>
                        <select
                          value={link.name}
                          onChange={(e) => handleSocialLinkChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--bg-card)] text-[var(--text-primary)]"
                        >
                          {SOCIAL_MEDIA_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {link.name === 'other' && (
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                            Custom Name
                          </label>
                          <input
                            type="text"
                            value={link.customName || ''}
                            onChange={(e) => handleSocialLinkChange(index, 'customName', e.target.value)}
                            className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--bg-card)] text-[var(--text-primary)]"
                            placeholder="Platform name"
                          />
                        </div>
                      )}

                      <div className="flex-2">
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          {link.name === 'whatsapp' ? 'Phone Number' : 'URL/Username'}
                        </label>
                        <input
                          type="text"
                          value={link.value}
                          onChange={(e) => handleSocialLinkChange(index, 'value', e.target.value)}
                          className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--bg-card)] text-[var(--text-primary)]"
                          placeholder={
                            link.name === 'whatsapp'
                              ? '+233541234567'
                              : `https://${link.name === 'other' ? 'example' : link.name}.com/username or @username`
                          }
                        />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSocialLink(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {formData.social_media_links.length === 0 && (
                    <div className="text-center py-8 text-[var(--text-tertiary)]">
                      <p>No media links added yet.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addSocialLink}
                        className="mt-2"
                      >
                        Add Your First Link
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.social_links && user.social_links.length > 0 ? (
                    user.social_links.map((link, index) => (
                      <div key={index} className="space-y-1">
                        <label className="text-sm font-medium text-[var(--text-tertiary)] capitalize">
                          {link.name}
                        </label>
                        <p className="text-[var(--text-primary)] break-all">{link.value}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[var(--text-tertiary)] col-span-2">No media links specified</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </form>
    </div>
  );
};

export default Settings;
