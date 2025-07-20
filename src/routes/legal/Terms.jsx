import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Terms() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link to="/" className="flex items-center">
              <img src="/subx-logo/header-logo.png" alt="Subx Logo" className="h-20 w-auto" />
            </Link>
          </div>
        </div>
      </motion.nav>

      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => {
              if (window.history.length > 2) {
                navigate(-1);
              } else {
                navigate('/');
              }
            }}
            className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded shadow"
          >
            ← Back
          </button>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl font-bold mb-6">Subx Terms and Conditions</h1>
            <p className="mb-6">Operated by: Focal Point Property Development & Management Services Ltd.</p>
            <ol className="list-decimal pl-6 space-y-4">
              <li>
                <strong>Introduction</strong><br/>
                Subx is a real estate Sub-ownership and digital land banking platform, operated and managed by Focal Point Property Development & Management Services Ltd. ("Focal Point", "we", "our", "us"). By subscribing to any Subx project, you agree to these Terms and Conditions.
              </li>
              <li>
                <strong>Eligibility</strong><br/>
                You must be at least 18 years of age and legally capable of entering into a binding agreement to subscribe to any Subx land project.
              </li>
              <li>
                <strong>Ownership Structure</strong><br/>
                Subx allows users to subscribe to fractional units of land, starting from as low as one square meter.<br/>
                Each subscription represents a proportional interest in a defined parcel of land under the Subx platform.<br/>
                The full land parcel is held in trust by Focal Point on behalf of all verified Sub-owners until maturity or agreed resale.
              </li>
              <li>
                <strong>Minimum Holding Period</strong><br/>
                All Subx ownership is subject to a mandatory 2-year holding period from the date of subscription confirmation.<br/>
                During this period, owners cannot initiate withdrawals or resell their shares outside the terms defined by Subx.<br/>
                At the end of the 2 years, owners may:
                <ul className="list-disc pl-6">
                  <li>Vote to sell the land collectively and receive proportional returns</li>
                  <li>Renew the ownership period (if offered)</li>
                  <li>Transfer ownership (subject to approval and internal procedures)</li>
                </ul>
              </li>
              <li>
                <strong>Documentation & Allocation</strong><br/>
                Upon successful subscription and full payment, users will receive:
                <ul className="list-disc pl-6">
                  <li>A digital receipt of payment</li>
                  <li>A Sub-ownership deed indicating their share</li>
                  <li>A digital allocation confirmation (if applicable for that project)</li>
                </ul>
                Physical allocation or site access may be made available based on group agreement and project-specific guidelines.
              </li>
              <li>
                <strong>Management Rights</strong><br/>
                Focal Point remains the sole manager and operator of all land under Subx until maturity or resale.<br/>
                We reserve the right to:
                <ul className="list-disc pl-6">
                  <li>Handle all legal, physical, and administrative management of the property</li>
                  <li>Make operational decisions in the best interest of the Sub-owners</li>
                  <li>Deduct agreed management fees (disclosed before subscription)</li>
                </ul>
              </li>
              <li>
                <strong>Exit and Returns</strong><br/>
                Upon maturity (2 years), Focal Point will:
                <ul className="list-disc pl-6">
                  <li>Facilitate sale or exit options</li>
                  <li>Distribute returns based on the final sale value, after management and operational deductions</li>
                </ul>
                Returns are not guaranteed and depend on market value appreciation and group decisions.
              </li>
              <li>
                <strong>No Financial Advisory Role</strong><br/>
                Subx and Focal Point do not offer investment, tax, or legal advice. All users are advised to make informed decisions and seek independent counsel if necessary.
              </li>
              <li>
                <strong>Risk Disclosure</strong><br/>
                Real estate investments carry risk. Values may fluctuate due to market conditions. Subx users should be aware of and accept these risks when subscribing.
              </li>
              <li>
                <strong>Amendments</strong><br/>
                We reserve the right to update or amend these terms at any time. Updates will be communicated via the platform and take effect immediately unless otherwise stated.
              </li>
              <li>
                <strong>Governing Law</strong><br/>
                These terms are governed by the laws of the Federal Republic of Nigeria. Disputes shall be resolved under Nigerian jurisdiction.
              </li>
              <li>
                <strong>VAT (Value Added Tax)</strong><br/>
                Subx’s platform service charge of 2% is subject to VAT as required by Nigerian tax law. The VAT is calculated on the service charge and is deducted from the developer’s payout, not the buyer’s payment.<br/>
                Buyers will not be charged VAT directly on land purchases unless required by law.
              </li>
              <li>
                <strong>Contact</strong><br/>
                For inquiries or complaints, please contact:<br/>
                📧 contact@focalpointprop.com<br/>
                Focal Point Property Development and Management Services Ltd., Nigeria.
              </li>
            </ol>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 