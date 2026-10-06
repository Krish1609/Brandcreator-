const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Application = require('../models/Application');
const { adminAuth } = require('../middleware/auth');

const formatCampaign = (c) => {
  if (!c) return null;
  const plain = c.get({ plain: true });
  return {
    ...plain,
    budget: {
      min: plain.budgetMin,
      max: plain.budgetMax,
      currency: plain.budgetCurrency
    },
    requirements: {
      minFollowers: plain.reqMinFollowers,
      minEngagement: plain.reqMinEngagement,
      location: plain.reqLocation
    }
  };
};

// Platform overview stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.count({ where: { role: { [Op.ne]: 'admin' } } });
    const totalCreators = await User.count({ where: { role: 'creator' } });
    const totalBrands = await User.count({ where: { role: 'brand' } });
    const totalCampaigns = await Campaign.count();
    const activeCampaigns = await Campaign.count({ where: { status: 'active' } });
    const totalApplications = await Application.count();
    const completedDeals = await Application.count({ where: { status: 'completed' } });
    const bannedUsers = await User.count({ where: { isBanned: true } });

    res.json({
      totalUsers, totalCreators, totalBrands, totalCampaigns,
      activeCampaigns, totalApplications, completedDeals, bannedUsers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const total = await User.count({ where });
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      include: [
        { model: User.CreatorProfile, as: 'creatorProfile' },
        { model: User.BrandProfile, as: 'brandProfile' }
      ],
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit)
    });

    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ban / Unban user
router.put('/users/:id/ban', adminAuth, async (req, res) => {
  try {
    const { isBanned } = req.body;
    await User.update({ isBanned }, { where: { id: req.params.id } });

    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: User.CreatorProfile, as: 'creatorProfile' },
        { model: User.BrandProfile, as: 'brandProfile' }
      ]
    });
    res.json({ message: `User ${isBanned ? 'banned' : 'unbanned'}`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify user
router.put('/users/:id/verify', adminAuth, async (req, res) => {
  try {
    await User.update({ isVerified: true }, { where: { id: req.params.id } });
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: User.CreatorProfile, as: 'creatorProfile' },
        { model: User.BrandProfile, as: 'brandProfile' }
      ]
    });
    res.json({ message: 'User verified', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Feature creator
router.put('/users/:id/feature', adminAuth, async (req, res) => {
  try {
    const { isFeatured } = req.body;
    await User.CreatorProfile.update({ isFeatured }, { where: { userId: req.params.id } });

    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: User.CreatorProfile, as: 'creatorProfile' },
        { model: User.BrandProfile, as: 'brandProfile' }
      ]
    });
    res.json({ message: `Creator ${isFeatured ? 'featured' : 'unfeatured'}`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all campaigns
router.get('/campaigns', adminAuth, async (req, res) => {
  try {
    const campaignsRaw = await Campaign.findAll({
      include: [{ model: User, as: 'brand', attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json({ campaigns: campaignsRaw.map(formatCampaign) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
