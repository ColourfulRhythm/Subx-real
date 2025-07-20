import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function FAQ() {
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions (FAQ)</h1>
            <ol className="list-decimal pl-6 space-y-4">
              <li><strong>What is Subx?</strong><br/>Subx is a digital platform by Focal Point Property Development and Management Services Ltd. that allows individuals to co-own land starting from a square meter, or buy full plots, all tracked digitally. It simplifies land ownership for everyday people.</li>
              <li><strong>How does Subowning work?</strong><br/>Subowning means you and others subscribe to own fractional units of a land parcel. Each person owns a portion (e.g., 5 sqm, 50 sqm, etc.), and at the end of the 2-year holding period, the land may be sold, renewed, or developed — depending on the group’s decision.</li>
              <li><strong>Can I buy a full plot on Subx?</strong><br/>Yes. Subx allows full plot purchases in addition to fractional ownership. You can choose to buy 600 sqm (or the defined plot size in the project) and get allocated accordingly.</li>
              <li><strong>Is the land registered and verifiable?</strong><br/>Yes. All land on Subx is sourced and managed by Focal Point Prop. Every parcel is verified, documented, and processed with professional surveyors, lawyers, and land authorities before it’s offered on the platform.</li>
              <li><strong>What documents will I receive after payment?</strong><br/>Once payment is confirmed, you’ll receive:
                <ul className="list-disc pl-6">
                  <li>A digital receipt</li>
                  <li>A co-ownership deed (or full deed if you bought a full plot)</li>
                  <li>A digital allocation certificate</li>
                  <li>A physical survey and letter of allocation (if you bought a full plot)</li>
                </ul>
              </li>
              <li><strong>How long do I have to hold the land?</strong><br/>Subx ownership comes with a mandatory 2-year holding period. After this, you may:
                <ul className="list-disc pl-6">
                  <li>Sell your share (if the group agrees)</li>
                  <li>Renew your holding for more years</li>
                  <li>Opt into development (if available)</li>
                </ul>
              </li>
              <li><strong>Why can't I sell my share before 2 years?</strong><br/>The 2-year lock-in gives the land time to appreciate in value and ensures project stability. This also protects all co-owners and avoids short-term speculation.</li>
              <li><strong>What happens at the end of the 2 years?</strong><br/>Once the 2 years is complete, the group will vote on what to do with the land:
                <ul className="list-disc pl-6">
                  <li>Sell and share profits</li>
                  <li>Extend the holding period</li>
                </ul>
              </li>
              <li><strong>Do I have to pay any extra charges when I buy?</strong><br/>No. Buyers do not pay any additional charges. Subx charges a 2% service fee, but this is deducted from the developer’s payout — not from your payment.</li>
              <li><strong>Is VAT included in my payment?</strong><br/>No. The buyer doesn’t pay VAT. The VAT on the 2% service charge is handled between Subx and the developer. You pay exactly what you see.</li>
              <li><strong>Is my ownership secure if I buy only 1 square meter?</strong><br/>Yes. Every square meter is recorded, documented, and legally protected. Whether you own 1 sqm or 1,000 sqm, your stake is secure.</li>
              <li><strong>Can I visit the land?</strong><br/>Yes. Site visitations are scheduled periodically for each project. You’ll be notified ahead of time via email, WhatsApp, or inside the app.</li>
              <li><strong>Can I transfer my land share to someone else?</strong><br/>Transfers are not allowed during the 2-year period. After maturity, you may request a transfer, resale, or reassignment — subject to group agreement and platform policies.</li>
              <li><strong>What if the group disagrees on selling after 2 years?</strong><br/>Each project has its own decision threshold (e.g., 80% agreement). If the threshold is not met, the holding may be extended until a decision is reached, other subs will be allowed to buy you out.</li>
              <li><strong>What if Subx shuts down? Will I lose my land?</strong><br/>No. Your land ownership is backed by legal documentation from Focal Point Property Development and registered with relevant authorities. Even if Subx goes offline, your land remains yours.</li>
              <li><strong>Do I pay VAT when I buy land on Subx?</strong><br/>No, buyers are not charged VAT on land purchases through Subx. Land is generally VAT-exempt under Nigerian tax law. However, the 2% platform service fee charged by Subx to the developer is subject to 7.5% VAT, which is already deducted from Focal Point's payout — not passed to you.</li>
            </ol>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 