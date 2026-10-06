const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Campaign = require('./Campaign');
const Application = require('./Application');

const Payment = sequelize.define('Payment', {
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
  brandId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
    onDelete: 'CASCADE'
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
    onDelete: 'CASCADE'
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  platformFee: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  creatorAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'held', 'released', 'refunded', 'disputed'),
    defaultValue: 'pending'
  },
  // Flattened paymentMethod object:
  paymentMethodType: {
    type: DataTypes.ENUM('card', 'upi', 'netbanking'),
    defaultValue: 'card'
  },
  paymentMethodLast4: { type: DataTypes.STRING },
  paymentMethodUpiId: { type: DataTypes.STRING },
  paymentMethodBank: { type: DataTypes.STRING },
  // Unique transactionId
  transactionId: {
    type: DataTypes.STRING,
    unique: true
  },
  paidAt: { type: DataTypes.DATE },
  heldAt: { type: DataTypes.DATE },
  releasedAt: { type: DataTypes.DATE },
  refundedAt: { type: DataTypes.DATE },
  // Flattened creatorBankDetails object:
  creatorBankAccountName: { type: DataTypes.STRING },
  creatorBankAccountNumber: { type: DataTypes.STRING },
  creatorBankIfsc: { type: DataTypes.STRING },
  creatorBankUpiId: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT }
}, {
  hooks: {
    beforeCreate: (payment) => {
      if (!payment.transactionId) {
        payment.transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
      }
    }
  }
});

// Associations
Payment.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });
Payment.belongsTo(Campaign, { foreignKey: 'campaignId', as: 'campaign' });
Payment.belongsTo(User, { foreignKey: 'brandId', as: 'brand' });
Payment.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

module.exports = Payment;
