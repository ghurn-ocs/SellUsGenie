import React, { useState } from 'react'
import { GenieMascot } from '../ui/GenieMascot'

interface Tutorial {
  id: string
  title: string
  description: string
  duration: string
  category: string
  thumbnail: string
  embedUrl: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
}

const VideoTutorials: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null)

  const tutorials: Tutorial[] = [
    {
      id: '1',
      title: 'Getting Started with StreamSell',
      description: 'Learn the basics of setting up your store and adding your first products.',
      duration: '5:30',
      category: 'Getting Started',
      thumbnail: '/api/placeholder/320/180',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      difficulty: 'Beginner'
    },
    {
      id: '2',
      title: 'Adding Products Like a Pro',
      description: 'Master product creation with professional photos, descriptions, and pricing strategies.',
      duration: '8:15',
      category: 'Products',
      thumbnail: '/api/placeholder/320/180',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      difficulty: 'Beginner'
    },
    {
      id: '3',
      title: 'Setting Up Stripe Payments',
      description: 'Complete guide to configuring secure payment processing with Stripe.',
      duration: '6:45',
      category: 'Payments',
      thumbnail: '/api/placeholder/320/180',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      difficulty: 'Intermediate'
    },
    {
      id: '4',
      title: 'Customizing Your Store Design',
      description: 'Use the Page Builder to create a unique, branded shopping experience.',
      duration: '12:20',
      category: 'Design',
      thumbnail: '/api/placeholder/320/180',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      difficulty: 'Intermediate'
    },
    {
      id: '5',
      title: 'Understanding Analytics & Metrics',
      description: 'Deep dive into your store analytics to optimize performance and increase sales.',
      duration: '10:30',
      category: 'Analytics',
      thumbnail: '/api/placeholder/320/180',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      difficulty: 'Advanced'
    },
    {
      id: '6',
      title: 'Order Management Best Practices',
      description: 'Efficiently process orders, communicate with customers, and handle fulfillment.',
      duration: '7:25',
      category: 'Orders',
      thumbnail: '/api/placeholder/320/180',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      difficulty: 'Intermediate'
    },
    {
      id: '7',
      title: 'SEO Optimization for Your Store',
      description: 'Improve your store\'s search engine visibility and attract more organic traffic.',
      duration: '9:15',
      category: 'Marketing',
      thumbnail: '/api/placeholder/320/180',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      difficulty: 'Advanced'
    },
    {
      id: '8',
      title: 'Mobile Optimization Techniques',
      description: 'Ensure your store looks perfect and functions smoothly on all mobile devices.',
      duration: '6:50',
      category: 'Design',
      thumbnail: '/api/placeholder/320/180',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      difficulty: 'Advanced'
    }
  ]

  const categories = ['all', ...Array.from(new Set(tutorials.map(t => t.category)))]
  
  const filteredTutorials = selectedCategory === 'all' 
    ? tutorials 
    : tutorials.filter(t => t.category === selectedCategory)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-500/20'
      case 'Intermediate': return 'text-yellow-400 bg-yellow-500/20'
      case 'Advanced': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-[#1E1E1E] text-white">
      <div className="mb-8">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center text-[#9B51E0] hover:text-[#A051E0] transition-colors mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Help
        </button>
        
        <div className="flex items-center mb-4">
          <GenieMascot mood="thinking" size="lg" className="mr-4" />
          <h1 className="text-3xl font-bold">Video Tutorials</h1>
        </div>
        <p className="text-[#A0A0A0] text-lg">
          Step-by-step video guides to help you master every aspect of your StreamSell store.
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                selectedCategory === category
                  ? 'bg-[#9B51E0] text-white'
                  : 'bg-[#2A2A2A] text-[#A0A0A0] hover:bg-[#3A3A3A] hover:text-white'
              }`}
            >
              {category === 'all' ? 'All Tutorials' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedTutorial && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#2A2A2A] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#3A3A3A]">
              <h3 className="text-lg font-semibold">{selectedTutorial.title}</h3>
              <button 
                onClick={() => setSelectedTutorial(null)}
                className="text-[#A0A0A0] hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="aspect-video bg-[#1E1E1E] rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-[#9B51E0] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[#A0A0A0]">Video player would be embedded here</p>
                  <p className="text-sm text-[#A0A0A0] mt-2">
                    In a real implementation, this would show the actual video from {selectedTutorial.embedUrl}
                  </p>
                </div>
              </div>
              <p className="text-[#A0A0A0]">{selectedTutorial.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tutorials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutorials.map(tutorial => (
          <div 
            key={tutorial.id}
            className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] overflow-hidden hover:border-[#9B51E0]/50 transition-colors group cursor-pointer"
            onClick={() => setSelectedTutorial(tutorial)}
          >
            {/* Thumbnail */}
            <div className="aspect-video bg-[#1E1E1E] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#9B51E0]/20 to-[#00AEEF]/20 flex items-center justify-center">
                <div className="w-16 h-16 bg-[#9B51E0]/80 rounded-full flex items-center justify-center group-hover:bg-[#9B51E0] transition-colors">
                  <svg className="w-8 h-8 text-white ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {tutorial.duration}
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#9B51E0] font-medium">{tutorial.category}</span>
                <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(tutorial.difficulty)}`}>
                  {tutorial.difficulty}
                </span>
              </div>
              
              <h3 className="font-semibold text-white mb-2 group-hover:text-[#9B51E0] transition-colors">
                {tutorial.title}
              </h3>
              
              <p className="text-sm text-[#A0A0A0] line-clamp-2">
                {tutorial.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Learning Path Suggestion */}
      <div className="mt-12 bg-gradient-to-r from-[#9B51E0]/10 to-[#00AEEF]/10 rounded-lg border border-[#9B51E0]/20 p-6">
        <h2 className="text-xl font-semibold mb-4 text-[#9B51E0]">🎯 Recommended Learning Path</h2>
        <p className="text-[#A0A0A0] mb-4">
          New to StreamSell? Follow this suggested order to get up to speed quickly:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-white mb-2">Week 1: Foundation</h3>
            <ol className="text-sm text-[#A0A0A0] space-y-1 list-decimal list-inside">
              <li>Getting Started with StreamSell</li>
              <li>Adding Products Like a Pro</li>
              <li>Setting Up Stripe Payments</li>
            </ol>
          </div>
          <div>
            <h3 className="font-medium text-white mb-2">Week 2: Optimization</h3>
            <ol className="text-sm text-[#A0A0A0] space-y-1 list-decimal list-inside">
              <li>Customizing Your Store Design</li>
              <li>Order Management Best Practices</li>
              <li>Understanding Analytics & Metrics</li>
            </ol>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-[#2A2A2A] rounded-lg">
          <p className="text-sm text-[#A0A0A0]">
            <strong className="text-white">Pro Tip:</strong> Complete each tutorial and implement what you learn before moving to the next one. Practice makes perfect!
          </p>
        </div>
      </div>
    </div>
  )
}

export default VideoTutorials