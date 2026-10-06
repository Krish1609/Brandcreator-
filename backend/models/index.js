const sequelize = require('../config/database');
const User = require('./User');
const Campaign = require('./Campaign');
const Application = require('./Application');
const ContentSubmission = require('./ContentSubmission');
const Message = require('./Message');
const Payment = require('./Payment');

module.exports = {
  sequelize,
  User,
  CreatorProfile: User.CreatorProfile,
  BrandProfile: User.BrandProfile,
  Campaign,
  CampaignShortlist: Campaign.CampaignShortlist,
  Application,
  ContentSubmission,
  Message,
  Payment
};
