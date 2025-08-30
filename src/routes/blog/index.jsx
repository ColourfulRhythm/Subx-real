import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCalendar, FaClock, FaUser } from 'react-icons/fa';

const BlogIndex = () => {
  const blogPosts = [
    {
      id: 'co-ownership-nigeria',
      title: 'Co-Ownership in Nigeria: How Square-Meter Land Ownership is Changing Real Estate',
      excerpt: 'Discover how Nigerians can now own land in square meters. Co-ownership makes real estate affordable, safe, and a better alternative to betting.',
      author: 'Subx Team',
      date: 'August 25, 2025',
      readTime: '12 min read',
      category: 'Co-Ownership',
      featured: true,
      image: '/2-seasons/2seasons-logo.jpg'
    },
    {
      id: 'land-investment-nigeria',
      title: 'Why Buying Land Can Make You Broke — and How Subx is Changing the Game',
      excerpt: 'Discover why traditional land buying leaves people broke and how Subx\'s revolutionary 1 sqm land ownership model is democratizing real estate ownership in Nigeria.',
      author: 'Subx Team',
      date: 'August 24, 2025',
      readTime: '8 min read',
      category: 'Land Ownership',
      featured: false,
      image: '/2-seasons/2seasons-logo.jpg'
    },
    {
      id: 'real-estate-strategies',
      title: '5 Real Estate Ownership Strategies for Beginners in Nigeria',
      excerpt: 'Discover proven strategies to start your real estate ownership journey, even with limited capital.',
      author: 'Subx Team',
      date: 'August 20, 2025',
      readTime: '6 min read',
      category: 'Ownership Tips',
      featured: false,
      image: '/2-seasons/2seasons-logo.jpg'
    },
    {
      id: 'ogun-state-opportunity',
      title: 'Why Land in Ogun State is the Next Big Ownership Opportunity',
      excerpt: 'Learn why Ogun State is becoming Nigeria\'s fastest-growing real estate market and how to capitalize on it.',
      author: 'Subx Team',
      date: 'August 15, 2025',
      readTime: '7 min read',
      category: 'Market Analysis',
      featured: false,
      image: '/2-seasons/2seasons-logo.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
            <FaArrowRight className="mr-2 rotate-180" />
            Back to Subx
          </Link>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Subx Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Expert insights on land ownership, real estate strategies, and building wealth through affordable property ownership in Nigeria.
            </p>
          </div>
        </div>
      </header>

      {/* Featured Post */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        {blogPosts.filter(post => post.featured).map(post => (
          <div key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8">
                <div className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
                  {post.category}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  <Link to={`/blog/${post.id}`} className="hover:text-green-600 transition-colors">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <FaUser className="mr-2" />
                  <span className="mr-4">{post.author}</span>
                  <FaCalendar className="mr-2" />
                  <span className="mr-4">{post.date}</span>
                  <FaClock className="mr-2" />
                  <span>{post.readTime}</span>
                </div>
                <Link
                  to={`/blog/${post.id}`}
                  className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Read Full Article
                  <FaArrowRight className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* All Posts */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          All Articles
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map(post => (
            <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full mb-3">
                  {post.category}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  <Link to={`/blog/${post.id}`} className="hover:text-green-600 transition-colors">
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <FaUser className="mr-2" />
                  <span className="mr-4">{post.author}</span>
                  <FaCalendar className="mr-2" />
                  <span>{post.date}</span>
                </div>
                <Link
                  to={`/blog/${post.id}`}
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold"
                >
                  Read More
                  <FaArrowRight className="ml-2" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Stay Updated with Subx
          </h2>
          <p className="text-lg mb-6 opacity-90">
                            Get the latest insights on land ownership, real estate trends, and wealth-building strategies delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-8">
            <img 
              src="/2-seasons/2seasons-logo.jpg" 
              alt="Subx Logo" 
              className="w-16 h-16 rounded-lg mx-auto mb-4 object-cover"
            />
            <h3 className="text-xl font-bold mb-2">Subx</h3>
            <p className="text-gray-400">
              Democratizing land ownership in Nigeria, one square meter at a time.
            </p>
          </div>
          <div className="flex justify-center space-x-6 mb-6">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <Link to="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>
            <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link>
            <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
          </div>
          <p className="text-gray-500 text-sm">
            © 2025 Subx. All rights reserved. | 
            <Link to="/privacy" className="ml-2 hover:text-gray-400">Privacy Policy</Link> | 
            <Link to="/terms" className="ml-2 hover:text-gray-400">Terms of Service</Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BlogIndex;
