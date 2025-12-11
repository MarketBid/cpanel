import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLink, ArrowRight, Instagram, Twitter, Facebook, Linkedin, Youtube, Globe, Check, MapPin, Mail } from 'lucide-react';
import { apiClient } from '../utils/api';

interface SocialLink {
    id: string;
    label: string;
    url: string;
    type: 'instagram' | 'twitter' | 'facebook' | 'linkedin' | 'youtube' | 'custom';
}

interface SiteConfig {
    unique_name: string;
    bio: string;
    links: SocialLink[];
    theme: 'light' | 'dark' | 'blue' | 'purple';
    cover_image?: string;
    logo_image?: string;
    services?: Array<{
        id: string;
        title: string;
        description: string;
        price: number;
        currency: string;
    }>;
    business_info?: {
        verified: boolean;
        email: string;
        location: string;
    };
}

const LinkSite: React.FC = () => {
    const { unique_name } = useParams<{ unique_name: string }>();
    const navigate = useNavigate();
    const [config, setConfig] = useState<SiteConfig | null>(null);
    const [ownerId, setOwnerId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            if (unique_name) {
                try {
                    const response = await apiClient.get<SiteConfig & { user_id: number }>(`/build-site/${unique_name}`, true);
                    if (response.data) {
                        setConfig(response.data);
                        setOwnerId(response.data.user_id.toString());
                    }
                } catch (error) {
                    console.error('Failed to fetch site config:', error);
                    setConfig(null);
                }
            }
            setLoading(false);
        };

        fetchConfig();
    }, [unique_name]);

    const handlePay = (amount?: number, title?: string) => {
        if (ownerId) {
            let url = `/transactions/create?receiver=${ownerId}`;
            if (amount) url += `&amount=${amount}`;
            if (title) url += `&title=${encodeURIComponent(title)}`;
            navigate(url);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!config) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Site Not Found</h1>
            <p className="text-neutral-600">The link site you are looking for does not exist.</p>
        </div>
    );

    const getThemeClasses = () => {
        switch (config.theme) {
            case 'dark': return 'bg-neutral-900 text-white';
            case 'blue': return 'bg-blue-50 text-neutral-900';
            case 'purple': return 'bg-purple-50 text-neutral-900';
            default: return 'bg-neutral-50 text-neutral-900';
        }
    };

    const getButtonClasses = () => {
        switch (config.theme) {
            case 'dark': return 'bg-white text-neutral-900 hover:bg-neutral-200';
            case 'blue': return 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200';
            case 'purple': return 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200';
            default: return 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-lg shadow-neutral-200';
        }
    };

    const getLinkClasses = () => {
        switch (config.theme) {
            case 'dark': return 'bg-neutral-800 text-white hover:bg-neutral-700 border-neutral-700';
            default: return 'bg-white text-neutral-900 hover:bg-neutral-50 border-neutral-200 shadow-sm';
        }
    };

    const getIcon = (type: SocialLink['type']) => {
        switch (type) {
            case 'instagram': return Instagram;
            case 'twitter': return Twitter;
            case 'facebook': return Facebook;
            case 'linkedin': return Linkedin;
            case 'youtube': return Youtube;
            default: return Globe;
        }
    };

    return (
        <div className={`min-h-screen py-12 px-4 transition-colors duration-300 ${getThemeClasses()}`}>
            <div className="max-w-md mx-auto space-y-8 animate-fade-in relative z-10">
                <div className="flex flex-col items-center text-center space-y-6">
                    {/* Branding Section */}
                    <div className="relative w-full flex flex-col items-center">
                        {config.cover_image && (
                            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[120%] h-48 bg-cover bg-center opacity-50 mask-gradient-b pointer-events-none"
                                style={{ backgroundImage: `url(${config.cover_image})`, maskImage: 'linear-gradient(to bottom, black, transparent)' }}></div>
                        )}

                        <div className={`relative w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold shadow-2xl border-4 overflow-hidden ${config.theme === 'dark' ? 'bg-neutral-800 text-white border-neutral-800' : 'bg-white text-neutral-900 border-white'
                            }`}>
                            {config.logo_image ? (
                                <img src={config.logo_image} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                config.unique_name.charAt(0).toUpperCase()
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <h1 className="text-2xl font-bold">{config.unique_name}</h1>
                            {config.business_info?.verified && (
                                <div className="bg-blue-500 rounded-full p-0.5" title="Verified Business">
                                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                                </div>
                            )}
                        </div>
                        {config.bio && <p className={`text-sm max-w-xs mx-auto mb-3 ${config.theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>{config.bio}</p>}

                        <div className={`flex items-center justify-center gap-4 text-xs ${config.theme === 'dark' ? 'text-neutral-500' : 'text-neutral-500'}`}>
                            {config.business_info?.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {config.business_info.location}
                                </span>
                            )}
                            {config.business_info?.email && (
                                <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" /> {config.business_info.email}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => handlePay()}
                        className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${getButtonClasses()}`}
                    >
                        Create Transaction <ArrowRight className="h-5 w-5" />
                    </button>



                    <div className="w-full space-y-4">
                        {config.links.map(link => {
                            const Icon = getIcon(link.type);
                            return (
                                <a
                                    key={link.id}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`block w-full py-4 px-6 rounded-2xl font-medium border transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-4 group ${getLinkClasses()}`}
                                >
                                    <Icon className={`h-5 w-5 ${config.theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}`} />
                                    <span className="flex-1 text-center">{link.label}</span>
                                    <ExternalLink className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ${config.theme === 'dark' ? 'text-neutral-400' : 'text-neutral-400'}`} />
                                </a>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-12 text-center">
                    <p className={`text-xs ${config.theme === 'dark' ? 'text-neutral-600' : 'text-neutral-400'}`}>
                        Powered by Clarsix
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LinkSite;
