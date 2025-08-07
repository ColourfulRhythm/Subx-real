import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Badge definitions with criteria and rewards
export const BADGE_TYPES = {
  TOP_SUB_OWNER: {
    id: 'top_sub_owner',
    name: '🏆 Top Sub-owner',
    description: 'Highest land ownership in the platform',
    criteria: { type: 'land_ownership', threshold: 1000, rank: 1 },
    color: 'bg-yellow-500',
    icon: '🏆'
  },
  TOP_INVESTOR: {
    id: 'top_investor',
    name: '💰 Top Investor',
    description: 'Highest portfolio value',
    criteria: { type: 'portfolio_value', threshold: 5000000, rank: 1 },
    color: 'bg-green-500',
    icon: '💰'
  },
  EARLY_ADOPTER: {
    id: 'early_adopter',
    name: '🚀 Early Adopter',
    description: 'One of the first 100 users',
    criteria: { type: 'user_rank', threshold: 100 },
    color: 'bg-blue-500',
    icon: '🚀'
  },
  LAND_BARON: {
    id: 'land_baron',
    name: '👑 Land Baron',
    description: 'Owns more than 1000 sqm of land',
    criteria: { type: 'land_ownership', threshold: 1000 },
    color: 'bg-purple-500',
    icon: '👑'
  },
  DIVERSIFIED: {
    id: 'diversified',
    name: '📊 Diversified',
    description: 'Investments in 3+ different projects',
    criteria: { type: 'project_count', threshold: 3 },
    color: 'bg-indigo-500',
    icon: '📊'
  },
  MILLIONAIRE: {
    id: 'millionaire',
    name: '💎 Millionaire',
    description: 'Portfolio value exceeds ₦1,000,000',
    criteria: { type: 'portfolio_value', threshold: 1000000 },
    color: 'bg-pink-500',
    icon: '💎'
  },
  ACTIVE_INVESTOR: {
    id: 'active_investor',
    name: '⚡ Active Investor',
    description: 'Made 5+ investments',
    criteria: { type: 'investment_count', threshold: 5 },
    color: 'bg-orange-500',
    icon: '⚡'
  },
  GROWTH_CHAMPION: {
    id: 'growth_champion',
    name: '📈 Growth Champion',
    description: 'Portfolio growth rate > 20%',
    criteria: { type: 'growth_rate', threshold: 20 },
    color: 'bg-emerald-500',
    icon: '📈'
  }
};

// Achievement milestones
export const ACHIEVEMENT_MILESTONES = {
  FIRST_INVESTMENT: {
    id: 'first_investment',
    name: 'First Investment',
    description: 'Made your first land investment',
    reward: 'Unlock advanced analytics',
    icon: '🎯'
  },
  LAND_OWNER: {
    id: 'land_owner',
    name: 'Land Owner',
    description: 'Own 100 sqm of land',
    reward: 'Access to premium properties',
    icon: '🏠'
  },
  PORTFOLIO_BUILDER: {
    id: 'portfolio_builder',
    name: 'Portfolio Builder',
    description: 'Portfolio value reaches ₦500,000',
    reward: 'Priority customer support',
    icon: '💼'
  },
  DIVERSIFICATION_MASTER: {
    id: 'diversification_master',
    name: 'Diversification Master',
    description: 'Invest in 5 different projects',
    reward: 'Exclusive investment opportunities',
    icon: '🎲'
  },
  WEALTH_BUILDER: {
    id: 'wealth_builder',
    name: 'Wealth Builder',
    description: 'Portfolio value reaches ₦2,000,000',
    reward: 'VIP investment consultation',
    icon: '💎'
  }
};

// Badge assignment logic
export const checkBadgeEligibility = (userData, allUsersData = []) => {
  const earnedBadges = [];
  const userStats = calculateUserStats(userData);
  
  // Check each badge type
  Object.values(BADGE_TYPES).forEach(badge => {
    if (isEligibleForBadge(badge, userStats, allUsersData)) {
      earnedBadges.push(badge);
    }
  });
  
  return earnedBadges;
};

// Achievement milestone checking
export const checkAchievementMilestones = (userData) => {
  const earnedAchievements = [];
  const userStats = calculateUserStats(userData);
  
  Object.values(ACHIEVEMENT_MILESTONES).forEach(achievement => {
    if (hasAchievedMilestone(achievement, userStats)) {
      earnedAchievements.push(achievement);
    }
  });
  
  return earnedAchievements;
};

// Calculate user statistics
const calculateUserStats = (userData) => {
  const investments = userData.investments || [];
  const totalLandOwned = investments.reduce((sum, inv) => sum + (inv.sqmOwned || 0), 0);
  const totalPortfolioValue = investments.reduce((sum, inv) => sum + (inv.amountInvested || 0), 0);
  const uniqueProjects = new Set(investments.map(inv => inv.projectId)).size;
  const investmentCount = investments.length;
  
  return {
    totalLandOwned,
    totalPortfolioValue,
    uniqueProjects,
    investmentCount,
    growthRate: userData.growthRate || 0,
    userRank: userData.userRank || 999
  };
};

// Check if user is eligible for a specific badge
const isEligibleForBadge = (badge, userStats, allUsersData) => {
  switch (badge.criteria.type) {
    case 'land_ownership':
      if (badge.criteria.rank) {
        // Check if user is in top rank
        const sortedUsers = allUsersData
          .filter(user => user.totalLandOwned > 0)
          .sort((a, b) => b.totalLandOwned - a.totalLandOwned);
        const userRank = sortedUsers.findIndex(user => user.userId === userStats.userId) + 1;
        return userRank <= badge.criteria.rank;
      }
      return userStats.totalLandOwned >= badge.criteria.threshold;
    
    case 'portfolio_value':
      if (badge.criteria.rank) {
        const sortedUsers = allUsersData
          .filter(user => user.totalPortfolioValue > 0)
          .sort((a, b) => b.totalPortfolioValue - a.totalPortfolioValue);
        const userRank = sortedUsers.findIndex(user => user.userId === userStats.userId) + 1;
        return userRank <= badge.criteria.rank;
      }
      return userStats.totalPortfolioValue >= badge.criteria.threshold;
    
    case 'user_rank':
      return userStats.userRank <= badge.criteria.threshold;
    
    case 'project_count':
      return userStats.uniqueProjects >= badge.criteria.threshold;
    
    case 'investment_count':
      return userStats.investmentCount >= badge.criteria.threshold;
    
    case 'growth_rate':
      return userStats.growthRate >= badge.criteria.threshold;
    
    default:
      return false;
  }
};

// Check if user has achieved a milestone
const hasAchievedMilestone = (achievement, userStats) => {
  switch (achievement.id) {
    case 'first_investment':
      return userStats.investmentCount >= 1;
    case 'land_owner':
      return userStats.totalLandOwned >= 100;
    case 'portfolio_builder':
      return userStats.totalPortfolioValue >= 500000;
    case 'diversification_master':
      return userStats.uniqueProjects >= 5;
    case 'wealth_builder':
      return userStats.totalPortfolioValue >= 2000000;
    default:
      return false;
  }
};

// Badge display component
export const BadgeDisplay = ({ badges, achievements, showNotification = false }) => {
  const [showNotificationBadge, setShowNotificationBadge] = useState(false);
  
  useEffect(() => {
    if (showNotification && (badges.length > 0 || achievements.length > 0)) {
      setShowNotificationBadge(true);
      setTimeout(() => setShowNotificationBadge(false), 5000);
    }
  }, [badges, achievements, showNotification]);
  
  return (
    <div className="space-y-4">
      {/* Badges Section */}
      {badges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">🏆 Badges Earned</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {badges.map((badge) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`${badge.color} text-white rounded-lg p-4 shadow-lg`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <h4 className="font-semibold">{badge.name}</h4>
                    <p className="text-sm opacity-90">{badge.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* Achievements Section */}
      {achievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">🎯 Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <h4 className="font-semibold">{achievement.name}</h4>
                    <p className="text-sm opacity-90">{achievement.description}</p>
                    <p className="text-xs opacity-75 mt-1">Reward: {achievement.reward}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* Notification Badge */}
      <AnimatePresence>
        {showNotificationBadge && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">🎉</span>
              <div>
                <p className="font-semibold">New Badges Earned!</p>
                <p className="text-sm opacity-90">Check your achievements</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Leaderboard component
export const Leaderboard = ({ users, currentUserId }) => {
  const sortedUsers = users
    .filter(user => user.totalLandOwned > 0 || user.totalPortfolioValue > 0)
    .sort((a, b) => b.totalLandOwned - a.totalLandOwned)
    .slice(0, 10);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🏆 Top Sub-owners</h3>
      <div className="space-y-3">
        {sortedUsers.map((user, index) => (
          <motion.div
            key={user.userId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-lg ${
              user.userId === currentUserId 
                ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500' 
                : 'bg-gray-50 dark:bg-gray-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                index === 0 ? 'bg-yellow-500' :
                index === 1 ? 'bg-gray-400' :
                index === 2 ? 'bg-orange-500' : 'bg-blue-500'
              }`}>
                {index + 1}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {user.name || 'Anonymous'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.totalLandOwned.toLocaleString()} sqm owned
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">
                ₦{user.totalPortfolioValue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Portfolio Value
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BadgeSystem; 