import React, { useState } from 'react';
import { Search, Filter, Clock, MapPin, DollarSign, Briefcase, TrendingUp, Star, ChevronDown, X, CheckCircle, Award, Users } from 'lucide-react';
import { useSensitiveInfo } from '../hooks/useSensitiveInfo';

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: {
    min: number;
    max: number;
    type: 'fixed' | 'hourly';
  };
  duration: string;
  experienceLevel: 'Entry' | 'Intermediate' | 'Expert';
  skills: string[];
  posted: string;
  location: string;
  remote: boolean;
  proposals: number;
  client: {
    name: string;
    rating: number;
    reviews: number;
    spent: number;
    verified: boolean;
    jobs: number;
  };
}

const DUMMY_JOBS: Job[] = [
  {
    id: '1',
    title: 'Full Stack Developer for E-commerce Platform',
    description: 'Looking for an experienced full-stack developer to build a modern e-commerce platform with React and Node.js. The project includes user authentication, product management, shopping cart, and payment integration.',
    category: 'Web Development',
    budget: { min: 5000, max: 8000, type: 'fixed' },
    duration: '3-6 months',
    experienceLevel: 'Expert',
    skills: ['React', 'Node.js', 'MongoDB', 'Express', 'TypeScript'],
    posted: '2 hours ago',
    location: 'Accra, Ghana',
    remote: true,
    proposals: 15,
    client: {
      name: 'TechCorp Ghana',
      rating: 4.9,
      reviews: 127,
      spent: 45000,
      verified: true,
      jobs: 32
    }
  },
  {
    id: '2',
    title: 'Mobile App UI/UX Designer Needed',
    description: 'We need a creative UI/UX designer to redesign our mobile banking app. Must have experience with financial apps and understand modern design principles. Figma proficiency required.',
    category: 'Design',
    budget: { min: 2500, max: 4000, type: 'fixed' },
    duration: '1-2 months',
    experienceLevel: 'Intermediate',
    skills: ['Figma', 'UI Design', 'UX Design', 'Mobile Design', 'Prototyping'],
    posted: '5 hours ago',
    location: 'Kumasi, Ghana',
    remote: true,
    proposals: 23,
    client: {
      name: 'FinTech Solutions',
      rating: 4.7,
      reviews: 89,
      spent: 28000,
      verified: true,
      jobs: 18
    }
  },
  {
    id: '3',
    title: 'Content Writer for Tech Blog',
    description: 'Seeking a talented content writer to create engaging articles about technology trends, software development, and digital innovation. Must have excellent English writing skills.',
    category: 'Writing',
    budget: { min: 20, max: 40, type: 'hourly' },
    duration: 'Ongoing',
    experienceLevel: 'Intermediate',
    skills: ['Content Writing', 'SEO', 'Research', 'Technical Writing'],
    posted: '1 day ago',
    location: 'Remote',
    remote: true,
    proposals: 42,
    client: {
      name: 'Digital Media Hub',
      rating: 4.8,
      reviews: 156,
      spent: 15000,
      verified: false,
      jobs: 24
    }
  },
  {
    id: '4',
    title: 'Data Analyst for Market Research',
    description: 'Need a data analyst to analyze customer behavior data and provide insights. Experience with Python, SQL, and data visualization tools required. Will provide training data.',
    category: 'Data Science',
    budget: { min: 3000, max: 5000, type: 'fixed' },
    duration: '1 month',
    experienceLevel: 'Expert',
    skills: ['Python', 'SQL', 'Data Analysis', 'Tableau', 'Statistics'],
    posted: '3 hours ago',
    location: 'Takoradi, Ghana',
    remote: false,
    proposals: 8,
    client: {
      name: 'Market Insights Ltd',
      rating: 4.6,
      reviews: 67,
      spent: 32000,
      verified: true,
      jobs: 15
    }
  },
  {
    id: '5',
    title: 'Social Media Manager for Fashion Brand',
    description: 'Looking for a creative social media manager to handle Instagram, Facebook, and TikTok accounts. Must create engaging content and grow our audience.',
    category: 'Marketing',
    budget: { min: 1500, max: 2500, type: 'fixed' },
    duration: '3 months',
    experienceLevel: 'Intermediate',
    skills: ['Social Media', 'Content Creation', 'Instagram', 'Facebook', 'TikTok'],
    posted: '6 hours ago',
    location: 'Accra, Ghana',
    remote: true,
    proposals: 31,
    client: {
      name: 'Fashion Forward GH',
      rating: 4.5,
      reviews: 43,
      spent: 12000,
      verified: false,
      jobs: 9
    }
  },
  {
    id: '6',
    title: 'Video Editor for YouTube Channel',
    description: 'Seeking an experienced video editor for our tech YouTube channel. Need to edit 4-6 videos per month with motion graphics, transitions, and engaging thumbnails.',
    category: 'Video & Animation',
    budget: { min: 30, max: 50, type: 'hourly' },
    duration: 'Ongoing',
    experienceLevel: 'Intermediate',
    skills: ['Premiere Pro', 'After Effects', 'Motion Graphics', 'Color Grading'],
    posted: '12 hours ago',
    location: 'Remote',
    remote: true,
    proposals: 19,
    client: {
      name: 'TechTalks Media',
      rating: 4.9,
      reviews: 203,
      spent: 54000,
      verified: true,
      jobs: 47
    }
  },
  {
    id: '7',
    title: 'WordPress Developer for Business Website',
    description: 'Need a WordPress developer to create a professional business website with custom theme, contact forms, and SEO optimization. Experience with Elementor preferred.',
    category: 'Web Development',
    budget: { min: 1200, max: 2000, type: 'fixed' },
    duration: '2-4 weeks',
    experienceLevel: 'Entry',
    skills: ['WordPress', 'PHP', 'CSS', 'Elementor', 'SEO'],
    posted: '1 day ago',
    location: 'Cape Coast, Ghana',
    remote: true,
    proposals: 27,
    client: {
      name: 'Business Solutions Inc',
      rating: 4.3,
      reviews: 28,
      spent: 8000,
      verified: false,
      jobs: 5
    }
  },
  {
    id: '8',
    title: 'AI/ML Engineer for Recommendation System',
    description: 'Building a recommendation engine for our e-learning platform. Need expertise in machine learning, Python, and experience with collaborative filtering algorithms.',
    category: 'AI & Machine Learning',
    budget: { min: 8000, max: 12000, type: 'fixed' },
    duration: '4-6 months',
    experienceLevel: 'Expert',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Neural Networks', 'AWS'],
    posted: '4 hours ago',
    location: 'Remote',
    remote: true,
    proposals: 11,
    client: {
      name: 'EduTech Platform',
      rating: 4.8,
      reviews: 94,
      spent: 78000,
      verified: true,
      jobs: 21
    }
  }
];

const CATEGORIES = [
  'All Categories',
  'Web Development',
  'Mobile Development',
  'Design',
  'Writing',
  'Marketing',
  'Data Science',
  'AI & Machine Learning',
  'Video & Animation'
];

const EXPERIENCE_LEVELS = ['All Levels', 'Entry', 'Intermediate', 'Expert'];

const Marketplace: React.FC = () => {
  const [jobs] = useState<Job[]>(DUMMY_JOBS);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(DUMMY_JOBS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedExperience, setSelectedExperience] = useState('All Levels');
  const [showFilters, setShowFilters] = useState(false);
  const { maskAmount } = useSensitiveInfo();

  React.useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    if (selectedExperience !== 'All Levels') {
      filtered = filtered.filter(job => job.experienceLevel === selectedExperience);
    }

    setFilteredJobs(filtered);
  }, [searchTerm, selectedCategory, selectedExperience, jobs]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setSelectedExperience('All Levels');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">Find Your Next Project</h1>
          <p className="text-sm sm:text-base text-neutral-600 mt-1">Discover opportunities that match your skills and expertise</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for jobs, skills, or keywords..."
              className="w-full pl-12 pr-4 py-3 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center justify-center px-6 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {(selectedCategory !== 'All Categories' || selectedExperience !== 'All Levels') && (
              <span className="ml-2 px-2 py-0.5 bg-neutral-900 text-white text-xs rounded-full">
                {(selectedCategory !== 'All Categories' ? 1 : 0) + (selectedExperience !== 'All Levels' ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 text-sm"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Experience Level</label>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 text-sm"
                >
                  {EXPERIENCE_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-neutral-600">
        <span>{filteredJobs.length} jobs found</span>
        <div className="flex items-center gap-2">
          <span className="text-xs">Sort by:</span>
          <select className="px-2 py-1 border border-neutral-300 rounded text-xs focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900">
            <option>Most Recent</option>
            <option>Best Match</option>
            <option>Budget: High to Low</option>
            <option>Budget: Low to High</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white border border-neutral-200 rounded-lg p-6 hover:border-neutral-900 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2 className="text-lg font-semibold text-neutral-900 hover:text-neutral-700 transition-colors">
                      {job.title}
                    </h2>
                    {job.client.verified && (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" title="Verified Client" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {job.posted}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                    {job.remote && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                        Remote
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-neutral-700 line-clamp-2">{job.description}</p>

                <div className="flex flex-wrap gap-2">
                  {job.skills.slice(0, 5).map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-full hover:bg-neutral-200 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 5 && (
                    <span className="px-3 py-1 text-neutral-600 text-xs font-medium">
                      +{job.skills.length - 5} more
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-neutral-600" />
                    <span className="font-semibold text-neutral-900">
                      ₵{maskAmount(job.budget.min)} - ₵{maskAmount(job.budget.max)}
                    </span>
                    <span className="text-neutral-600">
                      {job.budget.type === 'fixed' ? 'Fixed' : '/hr'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-neutral-600" />
                    <span className="text-neutral-600">{job.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-neutral-600" />
                    <span className="text-neutral-600">{job.experienceLevel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-3 border-t border-neutral-200">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-neutral-900 flex items-center justify-center text-white font-semibold text-sm">
                      {job.client.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{job.client.name}</p>
                      <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{job.client.rating}</span>
                          <span>({job.client.reviews})</span>
                        </div>
                        <span>•</span>
                        <span>₵{maskAmount(job.client.spent)}+ spent</span>
                        <span>•</span>
                        <span>{job.client.jobs} jobs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 lg:gap-4">
                <button className="flex-1 lg:flex-none px-6 py-2.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm font-medium whitespace-nowrap">
                  Apply Now
                </button>
                <div className="flex flex-col items-center lg:items-end">
                  <div className="flex items-center gap-1 text-neutral-600">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">{job.proposals}</span>
                  </div>
                  <span className="text-xs text-neutral-500">proposals</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-10 w-10 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No jobs found</h3>
            <p className="text-neutral-600 mb-6">
              Try adjusting your search or filters to find more opportunities.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
