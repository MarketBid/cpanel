import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Toast from '../components/ui/Toast';
import { Plus, Trash2, ExternalLink, Copy, Check, Instagram, Twitter, Facebook, Linkedin, Youtube, Globe } from 'lucide-react';

interface SocialLink {
    id: string;
    label: string;
    url: string;
    type: 'instagram' | 'twitter' | 'facebook' | 'linkedin' | 'youtube' | 'custom';
}

interface Service {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
}

interface SiteConfig {
    unique_name: string;
    bio: string;
    links: SocialLink[];
    theme: 'light' | 'dark' | 'blue' | 'purple';
    cover_image?: string;
    logo_image?: string;
    services: Service[];
    business_info?: {
        verified: boolean;
        email: string;
        location: string;
    };
}

const LINK_TYPES = [
    { value: 'custom', label: 'Custom Link', icon: Globe },
    { value: 'instagram', label: 'Instagram', icon: Instagram },
    { value: 'twitter', label: 'Twitter', icon: Twitter },
    { value: 'facebook', label: 'Facebook', icon: Facebook },
    { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
    { value: 'youtube', label: 'YouTube', icon: Youtube },
];

const BuildSite: React.FC = () => {
    const { user } = useAuth();
    const [config, setConfig] = useState<SiteConfig>({
        unique_name: '',
        bio: '',
        links: [],
        theme: 'light',
        services: [],
        business_info: {
            verified: false,
            email: '',
            location: ''
        }
    });
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'branding' | 'links'>('profile');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await apiClient.get<SiteConfig>('/build-site/me');
                if (response.data) {
                    setConfig(response.data);
                    if (response.data.unique_name) {
                        setGeneratedLink(`${window.location.origin}/linksite/${response.data.unique_name}`);
                    }
                }
            } catch (error) {
                // If 404 or other error, we just keep default state (new site)
                if (user?.name) {
                    setConfig(prev => ({ ...prev, unique_name: user.name.toLowerCase().replace(/\s+/g, '-') }));
                }
            }
        };

        if (user) {
            fetchConfig();
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const addLink = () => {
        setConfig(prev => ({
            ...prev,
            links: [...prev.links, { id: Date.now().toString(), label: '', url: '', type: 'custom' }]
        }));
    };

    const updateLink = (id: string, field: keyof SocialLink, value: string) => {
        setConfig(prev => ({
            ...prev,
            links: prev.links.map(link => {
                if (link.id !== id) return link;

                if (field === 'type') {
                    // If changing type to a known platform, pre-fill label if empty or if it was the default label of previous type
                    const newType = value as SocialLink['type'];
                    const typeOption = LINK_TYPES.find(t => t.value === newType);
                    const oldTypeOption = LINK_TYPES.find(t => t.value === link.type);

                    let newLabel = link.label;
                    if (newType !== 'custom') {
                        if (!link.label || link.label === oldTypeOption?.label) {
                            newLabel = typeOption?.label || '';
                        }
                    }
                    return { ...link, type: newType, label: newLabel };
                }

                return { ...link, [field]: value };
            })
        }));
    };

    const removeLink = (id: string) => {
        setConfig(prev => ({
            ...prev,
            links: prev.links.filter(link => link.id !== id)
        }));
    };



    const updateBusinessInfo = (field: string, value: string | boolean) => {
        setConfig(prev => ({
            ...prev,
            business_info: {
                verified: prev.business_info?.verified || false,
                email: prev.business_info?.email || '',
                location: prev.business_info?.location || '',
                ...prev.business_info,
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        if (!config.unique_name) {
            setToastMessage('Please enter a unique name for your site.');
            setToastType('error');
            setShowToast(true);
            return;
        }

        try {
            console.log(config);
            await apiClient.post('/build-site/', config);
            const link = `${window.location.origin}/linksite/${config.unique_name}`;
            setGeneratedLink(link);
            setToastMessage('Site generated successfully!');
            setToastType('success');
            setShowToast(true);
        } catch (error: any) {
            setToastMessage(error.message || 'Failed to save site configuration');
            setToastType('error');
            setShowToast(true);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900">Build Your Site</h1>
                    <p className="text-neutral-600 mt-1">Create a personalized page to share with your customers.</p>
                </div>
                {generatedLink && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
                        <a href={generatedLink} target="_blank" rel="noopener noreferrer" className="text-green-700 font-medium hover:underline flex items-center gap-1">
                            View Site <ExternalLink className="h-4 w-4" />
                        </a>
                        <div className="h-4 w-px bg-green-300 mx-2"></div>
                        <button onClick={copyToClipboard} className="text-green-700 hover:text-green-900 transition-colors" title="Copy Link">
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col h-full">
                    {/* Tabs Navigation */}
                    <div className="flex overflow-x-auto pb-2 mb-4 gap-2 scrollbar-hide">
                        {['profile', 'branding', 'links'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${activeTab === tab
                                    ? 'bg-neutral-900 text-white shadow-md'
                                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6 flex-1">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6 animate-fade-in">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Basic Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Input
                                            label="Unique Name (URL)"
                                            name="unique_name"
                                            value={config.unique_name}
                                            onChange={handleInputChange}
                                            placeholder="e.g. my-store"
                                            helperText={`Your site will be at: ${window.location.origin}/linksite/${config.unique_name || '...'}`}
                                        />
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">Bio</label>
                                            <textarea
                                                name="bio"
                                                value={config.bio}
                                                onChange={handleInputChange}
                                                rows={3}
                                                className="input-field resize-none"
                                                placeholder="Tell people about yourself or your business..."
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Business Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Input
                                                label="Public Email"
                                                value={config.business_info?.email || ''}
                                                onChange={(e) => updateBusinessInfo('email', e.target.value)}
                                                placeholder="contact@business.com"
                                            />
                                            <Input
                                                label="Location"
                                                value={config.business_info?.location || ''}
                                                onChange={(e) => updateBusinessInfo('location', e.target.value)}
                                                placeholder="Accra, Ghana"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="verified"
                                                checked={config.business_info?.verified || false}
                                                onChange={(e) => updateBusinessInfo('verified', e.target.checked)}
                                                className="h-4 w-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                                            />
                                            <label htmlFor="verified" className="text-sm text-neutral-700">Display Verified Badge</label>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Branding Tab */}
                        {activeTab === 'branding' && (
                            <div className="space-y-6 animate-fade-in">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Visual Identity</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Input
                                            label="Logo URL"
                                            value={config.logo_image || ''}
                                            onChange={(e) => setConfig(prev => ({ ...prev, logo_image: e.target.value }))}
                                            placeholder="https://example.com/logo.png"
                                        />
                                        <Input
                                            label="Cover Image URL"
                                            value={config.cover_image || ''}
                                            onChange={(e) => setConfig(prev => ({ ...prev, cover_image: e.target.value }))}
                                            placeholder="https://example.com/cover.jpg"
                                        />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Theme</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {['light', 'dark', 'blue', 'purple'].map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setConfig(prev => ({ ...prev, theme: t as any }))}
                                                    className={`p-4 rounded-xl border-2 transition-all ${config.theme === t ? 'border-neutral-900 ring-2 ring-neutral-900 ring-offset-2' : 'border-transparent hover:bg-neutral-100'
                                                        }`}
                                                >
                                                    <div className={`h-20 rounded-lg mb-2 ${t === 'light' ? 'bg-white border border-neutral-200' :
                                                        t === 'dark' ? 'bg-neutral-900' :
                                                            t === 'blue' ? 'bg-blue-600' :
                                                                'bg-purple-600'
                                                        }`}></div>
                                                    <span className="capitalize font-medium text-sm text-neutral-700">{t}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}



                        {/* Links Tab */}
                        {activeTab === 'links' && (
                            <div className="space-y-6 animate-fade-in">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Social Links</CardTitle>
                                            <Button size="sm" variant="outline" onClick={addLink} leftIcon={<Plus className="h-4 w-4" />}>
                                                Add Link
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {config.links.length === 0 && (
                                            <div className="text-center py-12 bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
                                                <p className="text-neutral-500 mb-2">No links added yet</p>
                                                <Button size="sm" variant="outline" onClick={addLink}>
                                                    Add Your First Link
                                                </Button>
                                            </div>
                                        )}
                                        {config.links.map((link) => {
                                            const TypeIcon = LINK_TYPES.find(t => t.value === link.type)?.icon || Globe;
                                            return (
                                                <div key={link.id} className="flex flex-col sm:flex-row gap-3 items-start p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                                                    <div className="w-full sm:w-auto">
                                                        <div className="relative">
                                                            <select
                                                                value={link.type || 'custom'}
                                                                onChange={(e) => updateLink(link.id, 'type', e.target.value)}
                                                                className="w-full sm:w-32 pl-9 pr-8 py-2 text-sm border border-neutral-300 rounded-lg appearance-none focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                                                            >
                                                                {LINK_TYPES.map(type => (
                                                                    <option key={type.value} value={type.value}>{type.label}</option>
                                                                ))}
                                                            </select>
                                                            <TypeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                                                        <Input
                                                            placeholder="Label"
                                                            value={link.label}
                                                            onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                                                        />
                                                        <Input
                                                            placeholder="URL (https://...)"
                                                            value={link.url}
                                                            onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => removeLink(link.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1 self-end sm:self-auto"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-neutral-200 mt-auto">
                            <Button size="lg" onClick={handleSave}>
                                Save & Publish
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Preview</h3>
                        <div className={`rounded-[2.5rem] border-[8px] border-neutral-900 overflow-hidden aspect-[9/19] shadow-2xl ${config.theme === 'dark' ? 'bg-neutral-900 text-white' :
                            config.theme === 'blue' ? 'bg-blue-50 text-neutral-900' :
                                config.theme === 'purple' ? 'bg-purple-50 text-neutral-900' :
                                    'bg-white text-neutral-900'
                            }`}>
                            <div className="h-full overflow-y-auto p-6 scrollbar-hide">
                                <div className="flex flex-col items-center text-center space-y-6">
                                    <div className="relative">
                                        {config.cover_image && (
                                            <div className="absolute -top-24 left-0 right-0 h-32 bg-cover bg-center" style={{ backgroundImage: `url(${config.cover_image})` }}></div>
                                        )}
                                        <div className={`relative w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg overflow-hidden ${config.theme === 'dark' ? 'bg-neutral-800 text-white border-neutral-800' : 'bg-white text-neutral-900'
                                            }`}>
                                            {config.logo_image ? (
                                                <img src={config.logo_image} alt="Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                user?.name?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-center gap-1">
                                            <h2 className={`font-bold text-xl ${config.theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>{user?.name}</h2>
                                            {config.business_info?.verified && (
                                                <Check className="h-4 w-4 text-blue-500 fill-blue-500 text-white" />
                                            )}
                                        </div>
                                        {config.bio && <p className={`mt-2 text-sm ${config.theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>{config.bio}</p>}
                                        {config.business_info?.location && (
                                            <p className={`mt-1 text-xs flex items-center justify-center gap-1 ${config.theme === 'dark' ? 'text-neutral-500' : 'text-neutral-500'}`}>
                                                <Globe className="h-3 w-3" /> {config.business_info.location}
                                            </p>
                                        )}
                                    </div>

                                    <div className="w-full space-y-3">
                                        <button className={`w-full py-3 px-4 rounded-xl font-medium transition-transform active:scale-95 mb-4 ${config.theme === 'dark' ? 'bg-white text-neutral-900' :
                                            config.theme === 'blue' ? 'bg-blue-600 text-white' :
                                                config.theme === 'purple' ? 'bg-purple-600 text-white' :
                                                    'bg-neutral-900 text-white'
                                            }`}>
                                            Create Transaction
                                        </button>


                                        {config.links.map(link => {
                                            const TypeIcon = LINK_TYPES.find(t => t.value === link.type)?.icon || Globe;
                                            return (
                                                <div key={link.id} className={`w-full py-3 px-4 rounded-xl font-medium border transition-all flex items-center gap-3 ${config.theme === 'dark' ? 'border-neutral-700 hover:bg-neutral-800' : 'border-neutral-200 bg-white hover:bg-neutral-50'
                                                    }`}>
                                                    <TypeIcon className={`h-5 w-5 ${config.theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}`} />
                                                    <span className="flex-1 text-center">{link.label || 'Link'}</span>
                                                    <div className="w-5" /> {/* Spacer for centering */}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showToast && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setShowToast(false)}
                />
            )}
        </div>
    );
};

export default BuildSite;
