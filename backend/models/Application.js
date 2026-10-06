const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Campaign = require('./Campaign');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  campaignId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Campaigns', key: 'id' },
    onDelete: 'CASCADE'
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
    onDelete: 'CASCADE'
  },
  brandId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
    onDelete: 'CASCADE'
  },
  proposal: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  proposedRate: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  deliverables: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  timeline: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('pending', 'shortlisted', 'accepted', 'rejected', 'completed'),
    defaultValue: 'pending'
  },
  dealAmount: {
    type: DataTypes.FLOAT
  },
  completedAt: {
    type: DataTypes.DATE
  },
  ratingBrandScore: { type: DataTypes.FLOAT },
  ratingBrandReview: { type: DataTypes.TEXT },
  ratingCreatorScore: { type: DataTypes.FLOAT },
  ratingCreatorReview: { type: DataTypes.TEXT }
});

// Associations
Application.belongsTo(Campaign, { foreignKey: 'campaignId', as: 'campaign' });
Campaign.hasMany(Application, { foreignKey: 'campaignId', as: 'applications' });

Application.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });
Application.belongsTo(User, { foreignKey: 'brandId', as: 'brand' });

module.exports = Application;
