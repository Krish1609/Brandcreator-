const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Application = require('../models/Application');
const { auth } = require('../middleware/auth');
const sequelize = require('../config/database');

// Creator analytics
router.get('/creator', auth, async (req, res) => {
  try {
    const creator = await User.findByPk(req.user.id, {
      include: [{ model: User.CreatorProfile, as: 'creatorProfile' }]
    });

    const totalApplications = await Application.count({ where: { creatorId: req.user.id } });
    const acceptedApplications = await Application.count({
      where: {
        creatorId: req.user.id,
        status: 'accepted'
      }
    });
    const completedCollabs = await Application.count({
      where: {
        creatorId: req.user.id,
        status: 'completed'
      }
    });

    const totalEarnings = await Application.sum('dealAmount', {
      where: { creatorId: req.user.id, status: 'completed' }
    }) || 0;

    // Monthly application trend (MySQL)
    const monthlyData = await Application.findAll({
      where: { creatorId: req.user.id },
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('YEAR', sequelize.col('createdAt')), 'year'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('YEAR', sequelize.col('createdAt')), sequelize.fn('MONTH', sequelize.col('createdAt'))],
      order: [
        [sequelize.fn('YEAR', sequelize.col('createdAt')), 'ASC'],
        [sequelize.fn('MONTH', sequelize.col('createdAt')), 'ASC']
      ],
      limit: 6,
      raw: true
    });

    const formattedMonthlyData = monthlyData.map(m => ({
      _id: {
        month: parseInt(m.month),
        year: parseInt(m.year)
      },
      count: parseInt(m.count)
    }));

    res.json({
      stats: {
        totalApplications,
        acceptedApplications,
        completedCollabs,
        totalEarnings,
        successRate: totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0
      },
      profile: creator ? creator.creatorProfile : null,
      monthlyData: formattedMonthlyData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Brand analytics
router.get('/brand', auth, async (req, res) => {
  try {
    const totalCampaigns = await Campaign.count({ where: { brandId: req.user.id } });
    const activeCampaigns = await Campaign.count({ where: { brandId: req.user.id, status: 'active' } });
    const totalApplications = await Application.count({ where: { brandId: req.user.id } });
    const acceptedApplications = await Application.count({
      where: {
        brandId: req.user.id,
        status: 'accepted'
      }
    });

    const totalSpend = await Application.sum('dealAmount', {
      where: {
        brandId: req.user.id,
        status: ['accepted', 'completed']
      }
    }) || 0;

    // Monthly application trend for Brand campaigns
    const monthlyData = await Application.findAll({
      where: { brandId: req.user.id },
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('YEAR', sequelize.col('createdAt')), 'year'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('YEAR', sequelize.col('createdAt')), sequelize.fn('MONTH', sequelize.col('createdAt'))],
      order: [
        [sequelize.fn('YEAR', sequelize.col('createdAt')), 'ASC'],
        [sequelize.fn('MONTH', sequelize.col('createdAt')), 'ASC']
      ],
      limit: 6,
      raw: true
    });

    const formattedMonthlyData = monthlyData.map(m => ({
      _id: {
        month: parseInt(m.month),
        year: parseInt(m.year)
      },
      count: parseInt(m.count)
    }));

    // Campaign performance (limit 5)
    const campaignsRaw = await Campaign.findAll({
      where: { brandId: req.user.id },
      include: [{ model: Application, as: 'applications', attributes: ['id', 'status', 'dealAmount'] }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    const campaigns = campaignsRaw.map(c => {
      const plain = c.get({ plain: true });
      return {
        _id: plain.id,
        id: plain.id,
        title: plain.title,
        views: plain.views || 0,
        applications: plain.applications || [],
        applicationCount: plain.applications ? plain.applications.length : 0,
        status: plain.status,
        budgetMin: plain.budgetMin,
        budgetMax: plain.budgetMax
      };
    });

    res.json({
      stats: {
        totalCampaigns,
        activeCampaigns,
        totalApplications,
        acceptedApplications,
        totalSpend
      },
      monthlyData: formattedMonthlyData,
      recentCampaigns: campaigns
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin analytics
router.get('/admin', auth, async (req, res) => {
  try {
    const totalUsers = await User.count({ where: { role: { [Op.ne]: 'admin' } } });
    const totalCreators = await User.count({ where: { role: 'creator' } });
    const totalBrands = await User.count({ where: { role: 'brand' } });
    const totalCampaigns = await Campaign.count();
    const activeCampaigns = await Campaign.count({ where: { status: 'active' } });
    const totalApplications = await Application.count();
    const completedDeals = await Application.count({ where: { status: 'completed' } });
    const totalPlatformSpend = await Application.sum('dealAmount', {
      where: { status: ['accepted', 'completed'] }
    }) || 0;

    const monthlyData = await Application.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('YEAR', sequelize.col('createdAt')), 'year'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('YEAR', sequelize.col('createdAt')), sequelize.fn('MONTH', sequelize.col('createdAt'))],
      order: [
        [sequelize.fn('YEAR', sequelize.col('createdAt')), 'ASC'],
        [sequelize.fn('MONTH', sequelize.col('createdAt')), 'ASC']
      ],
      limit: 6,
      raw: true
    });

    const formattedMonthlyData = monthlyData.map(m => ({
      _id: {
        month: parseInt(m.month),
        year: parseInt(m.year)
      },
      count: parseInt(m.count)
    }));

    res.json({
      stats: {
        totalUsers,
        totalCreators,
        totalBrands,
        totalCampaigns,
        activeCampaigns,
        totalApplications,
        completedDeals,
        totalSpend: totalPlatformSpend
      },
      monthlyData: formattedMonthlyData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
