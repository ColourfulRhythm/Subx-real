import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

const CoOwnershipNigeria = () => {
  useEffect(() => {
    document.title = "Co-Ownership in Nigeria: How Square-Meter Land Ownership is Changing Real Estate | Subx";
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
                Co-Ownership in Nigeria: How Square-Meter Land Ownership is Changing Real Estate
              </h1>
              <p className="text-lg text-gray-600 mt-3">
                Discover how Nigerians can now own land in square meters. Co-ownership makes real estate affordable, safe, and a better alternative to betting.
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
              Discover how Nigerians can now own land in square meters. Co-ownership makes real estate affordable, safe, and a better alternative to betting.
            </p>

            <hr className="my-8 border-gray-200" />

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Why Traditional Real Estate Leaves Most Nigerians Behind
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              For decades, real estate has been the strongest symbol of wealth in Nigeria. Owning land or property is tied to prestige, financial security, and legacy. Yet, the sad reality is that most Nigerians are locked out of this opportunity.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Here's why:
            </p>

            <ul className="list-disc list-inside text-lg text-gray-700 leading-relaxed mb-6 space-y-2">
              <li>Less than 10% of Nigerians earn more than ₦500,000 monthly.</li>
              <li>The majority of workers earn ₦100,000 or less per month.</li>
              <li>Average land prices in emerging areas range from ₦2 million to ₦10 million per plot, while prime city plots cost far more.</li>
            </ul>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              For a typical worker, buying land means tying down years of savings. Many stretch themselves to buy, only to remain unable to develop the land for years. Others simply give up, assuming real estate is only for the wealthy.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              This exclusivity has created an imbalance in the market — one where developers also depend too heavily on a small pool of high-income buyers.
            </p>

            <hr className="my-8 border-gray-200" />

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              The Diaspora Dependency Trap
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              For years, Nigerian developers marketed estates almost exclusively to Nigerians abroad. And with good reason: diaspora Nigerians often have access to dollars, pounds, and euros, making them better positioned to buy land and houses outright.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              But this model has proven fragile.
            </p>

            <ul className="list-disc list-inside text-lg text-gray-700 leading-relaxed mb-6 space-y-2">
              <li>When the dollar weakened, many couldn't keep up payments.</li>
              <li>Projects stalled, leaving developers stranded.</li>
              <li>Meanwhile, millions of Nigerians at home remained spectators in their own land market.</li>
            </ul>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Relying solely on diaspora funds creates risk. It excludes the domestic market, leaving developers vulnerable to global economic shocks.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              The solution? A model that empowers Nigerians at home to participate — no matter their income.
            </p>

            <hr className="my-8 border-gray-200" />

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              What is Square-Meter Land Ownership?
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              This is where Co-Ownership, also called Square-Meter Land Ownership, enters the picture.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Instead of saving endlessly to buy a full plot, Nigerians can now:
            </p>

            <ul className="list-disc list-inside text-lg text-gray-700 leading-relaxed mb-6 space-y-2">
              <li>Purchase as little as one square meter of land.</li>
              <li>Acquire more units over time, at their own pace.</li>
              <li>Build a portfolio across multiple estates instead of being locked to one plot.</li>
              <li>Receive legal documentation for every square meter owned.</li>
            </ul>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              It's not an "investment scheme." It doesn't promise ROI. It's simply land ownership, broken down into smaller, affordable units.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              This changes the game entirely.
            </p>

            <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Key Innovation
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Square-meter ownership democratizes real estate by breaking land into affordable units, allowing Nigerians to start small and grow their portfolio gradually.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-8 border-gray-200" />

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Why Co-Ownership Works for Nigerians and Developers
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Co-ownership is powerful because it solves problems for both buyers and developers.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-4">
              1. Affordability for Nigerians
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              With co-ownership, anyone can start. Even a student or entry-level worker can afford a square meter.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-4">
              2. Flexibility
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Buyers can grow their portfolio slowly, instead of making a huge one-time payment.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-4">
              3. Diversification
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Just like stocks, Nigerians can spread risk by owning sqm in Lagos, Ogun, Abuja, and beyond.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-4">
              4. Developer Sustainability
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Developers can raise money from a larger pool of domestic buyers, reducing dependency on diaspora inflows.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-6">
              5. SEC Compliance
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Unlike shady "real estate investment schemes," co-ownership is legal and compliant because buyers are purchasing tangible land, not promised returns.
            </p>

            <hr className="my-8 border-gray-200" />

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Betting vs Real Estate: A Nigerian Wealth Mindset Shift
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Nigeria has one of the biggest sports betting industries in Africa. Studies show Nigerians spend over ₦975 million daily on betting — that's about ₦350 billion annually.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Now compare that with land ownership.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              A bettor spends ₦5,000 every week hoping for a win. By year's end, that's ₦260,000 gone — with nothing to show for it.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              If the same ₦5,000 was directed into square-meter ownership:
            </p>

            <ul className="list-disc list-inside text-lg text-gray-700 leading-relaxed mb-6 space-y-2">
              <li>Year 1: That person could own several square meters.</li>
              <li>Year 5: They could own a significant portion of land.</li>
              <li>Year 10: They could consolidate into full plots across different estates.</li>
            </ul>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Betting drains. Real estate builds. Co-ownership allows Nigerians to redirect small, regular expenses into lasting wealth.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Mindset Shift
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Instead of spending ₦5,000 weekly on betting with no guaranteed returns, redirect that money into square-meter land ownership and build lasting wealth.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-8 border-gray-200" />

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              How Co-Ownership Democratizes Wealth in Nigeria
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Traditionally, wealth from real estate has been the reserve of the elite. But co-ownership is shifting the landscape.
            </p>

            <ul className="list-disc list-inside text-lg text-gray-700 leading-relaxed mb-6 space-y-2">
              <li>Students can begin buying square meters with pocket money.</li>
              <li>Salary earners can steadily grow portfolios without financial strain.</li>
              <li>Families can secure land gradually without going broke.</li>
            </ul>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              The long-term implications are huge:
            </p>

            <ul className="list-disc list-inside text-lg text-gray-700 leading-relaxed mb-6 space-y-2">
              <li>More Nigerians can own property before they turn 30.</li>
              <li>Wealth is no longer restricted to those with access to millions upfront.</li>
              <li>The mindset of "land is too expensive" begins to fade.</li>
            </ul>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              By spreading ownership, co-ownership reduces inequality and democratizes access to one of the safest assets in Nigeria.
            </p>

            <hr className="my-8 border-gray-200" />

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Case Study: From Betting to Building
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Take Chinedu, a 28-year-old who spends ₦5,000 monthly on betting.
            </p>

            <ul className="list-disc list-inside text-lg text-gray-700 leading-relaxed mb-6 space-y-2">
              <li>Over 12 months, that's ₦60,000 spent with no guaranteed return.</li>
              <li>Over 5 years, it's ₦300,000 wasted.</li>
            </ul>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Now let's flip the script.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              If Chinedu invested that same ₦5,000 monthly into square-meter ownership:
            </p>

            <ul className="list-disc list-inside text-lg text-gray-700 leading-relaxed mb-6 space-y-2">
              <li>Year 1: He owns 6 sqm.</li>
              <li>Year 5: He owns 30 sqm.</li>
              <li>Year 10: He owns 60 sqm, which could equal half a plot or more, depending on location.</li>
            </ul>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              And in Nigeria, land appreciates. Even in semi-urban areas, land can double or triple in 10 years. By Year 10, Chinedu could be sitting on property worth millions — all from redirection of betting money.
            </p>

            <hr className="my-8 border-gray-200" />

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Co-Ownership as the Future of Nigerian Real Estate
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              We've seen this story before in other industries.
            </p>

            <ul className="list-disc list-inside text-lg text-gray-700 leading-relaxed mb-6 space-y-2">
              <li>Fintech disrupted banking by allowing Nigerians to open wallets with just a phone number.</li>
              <li>Telecoms disrupted communication by making airtime and data affordable to all.</li>
              <li>Co-ownership is set to disrupt real estate by making land ownership possible one square meter at a time.</li>
            </ul>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              It's the natural evolution of property in Nigeria: moving from exclusivity to inclusivity, from privilege to participation.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              This is why developers who adopt co-ownership early will not only survive but thrive.
            </p>

            <hr className="my-8 border-gray-200" />

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Conclusion: Bet on Land, Not Luck
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Nigeria does not lack money — it lacks systems that channel small, consistent spending into long-term wealth creation.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Every day, Nigerians pour billions into betting, consumption, and depreciating assets. Yet millions believe real estate is "out of reach."
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Co-ownership fixes this. By breaking land into square meters, it allows Nigerians to:
            </p>

            <ul className="list-disc list-inside text-lg text-gray-700 leading-relaxed mb-6 space-y-2">
              <li>Own property without breaking the bank.</li>
              <li>Build wealth gradually, one unit at a time.</li>
              <li>Secure their future with tangible, appreciating assets.</li>
            </ul>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              For developers, it's a way to raise funds sustainably. For Nigerians, it's a chance to own without stress. For the economy, it's the beginning of a new wealth era.
            </p>

            <p className="text-xl text-gray-700 leading-relaxed mb-8 font-semibold">
              The choice is clear: Keep betting on luck, or start owning land — one square meter at a time.
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
                    Take Action Today
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Start your land ownership journey with Subx. Buy your first square meter today and begin building wealth through affordable real estate ownership.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg p-8 text-center text-white mb-8">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Land Ownership Journey?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Join thousands of Nigerians who are already building wealth through square-meter land ownership.
          </p>
          <Link
            to="/"
            className="inline-flex items-center bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors"
          >
            Get Started Today
            <FaArrowRight className="ml-2" />
          </Link>
        </section>
      </main>

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

export default CoOwnershipNigeria;
