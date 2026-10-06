const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Campaign = require('./Campaign');
const Application = require('./Application');

const ContentSubmission = sequelize.define('ContentSubmission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  applicationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Applications', key: 'id' },
    onDelete: 'CASCADE'
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
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  contentLinks: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  files: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  screenshots: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  deliverable: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('submitted', 'under_review', 'approved', 'revision_requested', 'rejected'),
    defaultValue: 'submitted'
  },
  brandFeedback: {
    type: DataTypes.TEXT
  },
  revisionNote: {
    type: DataTypes.TEXT
  },
  approvedAt: {
    type: DataTypes.DATE
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Associations
ContentSubmission.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });
ContentSubmission.belongsTo(Campaign, { foreignKey: 'campaignId', as: 'campaign' });
ContentSubmission.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });
ContentSubmission.belongsTo(User, { foreignKey: 'brandId', as: 'brand' });

module.exports = ContentSubmission;
