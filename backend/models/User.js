const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('creator', 'brand', 'admin'),
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isBanned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 12);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

User.prototype.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const CreatorProfile = sequelize.define('CreatorProfile', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  bio: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  niche: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  location: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  // Instagram details
  instagramUsername: { type: DataTypes.STRING, defaultValue: '' },
  instagramFollowers: { type: DataTypes.INTEGER, defaultValue: 0 },
  instagramUrl: { type: DataTypes.STRING, defaultValue: '' },
  // YouTube details
  youtubeUsername: { type: DataTypes.STRING, defaultValue: '' },
  youtubeSubscribers: { type: DataTypes.INTEGER, defaultValue: 0 },
  youtubeUrl: { type: DataTypes.STRING, defaultValue: '' },
  // overall stats
  totalFollowers: { type: DataTypes.INTEGER, defaultValue: 0 },
  engagementRate: { type: DataTypes.FLOAT, defaultValue: 0 },
  aiScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  fakeFollowerPercentage: { type: DataTypes.FLOAT, defaultValue: 0 },
  contentConsistency: { type: DataTypes.FLOAT, defaultValue: 0 },
  audienceLocations: { type: DataTypes.JSON, defaultValue: [] },
  audienceTypes: { type: DataTypes.JSON, defaultValue: [] },
  genderSplit: { type: DataTypes.JSON, defaultValue: [] },
  lastPosts: { type: DataTypes.JSON, defaultValue: [] },
  mlBreakdown: { type: DataTypes.JSON, defaultValue: {} },
  mlLabel: { type: DataTypes.STRING, defaultValue: '' },
  mlAnalysis: { type: DataTypes.TEXT, defaultValue: '' },
  lastAnalyzedAt: { type: DataTypes.DATE },
  // Rate Card
  postRate: { type: DataTypes.FLOAT, defaultValue: 0 },
  storyRate: { type: DataTypes.FLOAT, defaultValue: 0 },
  videoRate: { type: DataTypes.FLOAT, defaultValue: 0 },
  isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
  collaborationCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  portfolio: { type: DataTypes.JSON, defaultValue: [] },
  tags: { type: DataTypes.JSON, defaultValue: [] }
});

const BrandProfile = sequelize.define('BrandProfile', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  companyName: { type: DataTypes.STRING, defaultValue: '' },
  industry: { type: DataTypes.STRING, defaultValue: '' },
  website: { type: DataTypes.STRING, defaultValue: '' },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  location: { type: DataTypes.STRING, defaultValue: '' },
  budgetMin: { type: DataTypes.FLOAT, defaultValue: 0 },
  budgetMax: { type: DataTypes.FLOAT, defaultValue: 0 },
  campaignCount: { type: DataTypes.INTEGER, defaultValue: 0 }
});

// Associations
User.hasOne(CreatorProfile, { foreignKey: 'userId', as: 'creatorProfile' });
CreatorProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(BrandProfile, { foreignKey: 'userId', as: 'brandProfile' });
BrandProfile.belongsTo(User, { foreignKey: 'userId' });

// We attach them to User object for direct imports
User.CreatorProfile = CreatorProfile;
User.BrandProfile = BrandProfile;

module.exports = User;
