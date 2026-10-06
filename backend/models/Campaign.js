const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Campaign = sequelize.define('Campaign', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  brandId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  niche: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  platforms: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  budgetMin: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  budgetMax: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  budgetCurrency: {
    type: DataTypes.STRING,
    defaultValue: 'INR'
  },
  reqMinFollowers: {
    type: DataTypes.INTEGER,
    defaultValue: 1000
  },
  reqMinEngagement: {
    type: DataTypes.FLOAT,
    defaultValue: 1.0
  },
  reqLocation: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  deliverables: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  deadline: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'closed', 'completed'),
    defaultValue: 'active'
  },
  isBoosted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  }
});

// Associations
Campaign.belongsTo(User, { foreignKey: 'brandId', as: 'brand' });
User.hasMany(Campaign, { foreignKey: 'brandId', as: 'campaigns' });

// Shortlist Junction Table
const CampaignShortlist = sequelize.define('CampaignShortlist', {
  campaignId: {
    type: DataTypes.INTEGER,
    references: { model: Campaign, key: 'id' },
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.INTEGER,
    references: { model: User, key: 'id' },
    onDelete: 'CASCADE'
  }
});

Campaign.belongsToMany(User, { through: CampaignShortlist, as: 'shortlistedCreators', foreignKey: 'campaignId' });
User.belongsToMany(Campaign, { through: CampaignShortlist, as: 'shortlistedCampaigns', foreignKey: 'userId' });

Campaign.CampaignShortlist = CampaignShortlist;

module.exports = Campaign;
