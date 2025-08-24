import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

const LandInvestmentNigeria = () => {
  useEffect(() => {
    document.title = "Why Buying Land Can Make You Broke — and How Subx is Changing the Game | Subx";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <FaArrowRight className="mr-2 rotate-180" />
            Back to Subx
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Why Buying Land Can Make You Broke — and How Subx is Changing the Game
              </h1>
              <p className="text-lg text-gray-600 mt-3">
                The revolutionary approach to land ownership that's democratizing real estate investment in Nigeria
              </p>
            </div>
            <div className="hidden md:block">
              <img 
                src="/2-seasons/2seasons-logo.jpg" 
                alt="Subx Logo" 
                className="w-16 h-16 rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Article Content */}
        <article className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              For years we have heard it said that land never depreciates, that the best investment you can make is land. And that is true. But it is only true if you can actually afford the land that you are buying.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              The reality is that many people rush into land purchases they cannot sustain. Instead of building wealth, they end up broke. And sometimes they even lose the land altogether.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Let's take a closer look at the pain point.
            </p>

            <hr className="my-8 border-gray-200" />

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              The Pain Point of Buying Land
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Some people pay beyond their means. A full plot of land in Lagos or Ogun State can go for millions of naira. People stretch themselves financially to buy it. After paying, they are empty. No liquidity. No emergency funds. No savings. Just land.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              The challenge is that land banking does not pay you immediately. When you buy land for banking, you are not collecting rent. You are not running a business. You are simply keeping it until it appreciates. That means the land is not putting food on your table in the short term. If you tie down all your money and you cannot afford it, you feel the weight.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Then there are the additional costs. Buying land is just step one. You still need to process your documents. You need your Certificate of Occupancy, your Deed of Assignment, your survey plan. You may need to fence the property to secure it. Sometimes there are development levies. If you cannot afford these extra steps, you may lose the land. And when you lose it, you lose your investment.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Some people do not even get that far. They cannot even start because they don't have enough to buy a full plot. They want to invest. They know land appreciates. But they are cut off from the opportunity.
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Key Takeaway
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Traditional land buying requires massive upfront capital, ongoing maintenance costs, and ties up all your liquidity. This approach leaves many investors broke and unable to sustain their investment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Missing Out on Capital Gains
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              When you cannot buy land, you miss out. You miss out on capital appreciation. Land in growing areas doubles and triples in value within a few years. You miss out on stability. Land is tangible and secure compared to volatile assets like stocks or crypto. You miss out on generational wealth, because families pass land down to their children.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              So whether you buy land and go broke, or you cannot buy at all, the result is the same. You lose the chance that land gives.
            </p>

            <hr className="my-8 border-gray-200" />

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Subx: A Smarter Way to Own Land
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              This is where Subx comes in.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              For the very first time in Nigeria, Africa and possibly the world, you don't need to buy a full plot of 500 square meters. With Subx, you can buy from as little as <strong className="text-green-600">one square meter</strong>.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              You can start small. One square meter. Ten square meters. Fifty square meters. As your finances grow, you can scale up to one hundred, two hundred, even five hundred square meters.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              This means you can own land without going broke. You can diversify your portfolio. You can balance between stocks, crypto, business and land, without overstretching yourself.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              And you are not cut off from the normal documents. You still get your Certificate of Ownership. You still get your Deed of Sale. You still get your receipts. Just like every other landowner.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                🎯 Subx's Revolutionary Approach
              </h3>
              <ul className="space-y-3 text-green-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Start with just <strong>1 square meter</strong> at ₦5,000</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Scale up gradually as your finances grow</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Full legal documentation included</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Professional land management and security</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Capital appreciation on your terms</span>
                </li>
              </ul>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              The difference is that you are buying within your reach. And when the land appreciates and is sold after the agreed years, you enjoy the capital gain. You enjoy it without the fear of losing the land. And without risking all your money.
            </p>

            <hr className="my-8 border-gray-200" />

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Why This Matters
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              This is revolutionary because it solves the affordability problem. You no longer need to wait years until you can gather enough for a full plot.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              It solves the sustainability problem. You no longer need to go broke just to own land.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              It opens the door for millions of Nigerians who have been excluded from land banking for too long.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Subx is not just an app. It is a new way of thinking about wealth. It makes land ownership possible for everyone, not just the privileged few.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                💡 The Subx Advantage
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Traditional Land Buying</h4>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• Requires millions of naira</li>
                    <li>• Ties up all liquidity</li>
                    <li>• High maintenance costs</li>
                    <li>• Risk of losing investment</li>
                    <li>• Limited to wealthy few</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Subx Land Ownership</h4>
                  <ul className="text-sm text-green-600 space-y-1">
                    <li>• Start with ₦5,000</li>
                    <li>• Maintains liquidity</li>
                    <li>• No maintenance costs</li>
                    <li>• Secure investment</li>
                    <li>Accessible to everyone</li>
                  </ul>
                </div>
              </div>
            </div>

            <hr className="my-8 border-gray-200" />

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Final Thoughts
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Buying land is smart. But buying land you cannot afford is not. Too many people have lost money, lost properties, or missed out completely because the entry barrier was too high.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              With Subx, you can finally invest in land on your own terms. Start with as little as one square meter. Build wealth slowly, securely, and wisely.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              If you want to stop missing out on the gains of land ownership and start your journey in a way that fits your finances, visit <strong className="text-green-600">subxhq.com</strong> today.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Your future in land banking can start small. But it does not have to wait.
            </p>
          </div>
        </article>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-8 text-center text-white mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Start Your Land Investment Journey?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Join thousands of Nigerians who are already building wealth through affordable land ownership with Subx.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center"
            >
              Start Investing Now
              <FaArrowRight className="ml-2" />
            </Link>
            <Link
              to="/about"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Learn More About Subx
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
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

export default LandInvestmentNigeria;
