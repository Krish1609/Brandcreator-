const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

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

// Create campaign
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'brand') {
      return res.status(403).json({ error: 'Only brands can create campaigns' });
    }

    const { title, description, niche, platforms, budget, requirements, deliverables, deadline, tags } = req.body;
    const campaign = await Campaign.create({
      brandId: req.user.id,
      title,
      description,
      niche: niche || [],
      platforms: platforms || [],
      budgetMin: budget?.min || 0,
      budgetMax: budget?.max || 0,
      budgetCurrency: budget?.currency || 'INR',
      reqMinFollowers: requirements?.minFollowers || 1000,
      reqMinEngagement: requirements?.minEngagement || 1.0,
      reqLocation: requirements?.location || [],
      deliverables: deliverables || [],
      deadline,
      tags: tags || []
    });

    // Update brand campaign count
    const brand = await User.findByPk(req.user.id, {
      include: [{ model: User.BrandProfile, as: 'brandProfile' }]
    });
    if (brand && brand.brandProfile) {
      await brand.brandProfile.increment('campaignCount', { by: 1 });
    }

    res.status(201).json({ message: 'Campaign created', campaign: formatCampaign(campaign) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all active campaigns (for creators to browse)
router.get('/', auth, async (req, res) => {
  try {
    const { niche, platform, minBudget, maxBudget, search, page = 1, limit = 12 } = req.query;

    const where = { status: 'active' };
    if (niche) {
      where.niche = {
        [Op.or]: niche.split(',').map(n => ({ [Op.like]: `%"${n}"%` }))
      };
    }
    if (platform) {
      where.platforms = {
        [Op.or]: platform.split(',').map(p => ({ [Op.like]: `%"${p}"%` }))
      };
    }
    if (minBudget) {
      where.budgetMin = { [Op.gte]: parseInt(minBudget) };
    }
    if (maxBudget) {
      where.budgetMax = { [Op.lte]: parseInt(maxBudget) };
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const total = await Campaign.count({ where });
    const campaignsRaw = await Campaign.findAll({
      where,
      include: [
        {
          model: User,
          as: 'brand',
          attributes: ['name', 'avatar'],
          include: [{ model: User.BrandProfile, as: 'brandProfile' }]
        }
      ],
      order: [
        ['isBoosted', 'DESC'],
        ['createdAt', 'DESC']
      ],
      offset: (page - 1) * limit,
      limit: parseInt(limit)
    });

    const campaigns = campaignsRaw.map(formatCampaign);
    res.json({ campaigns, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get brand's own campaigns
router.get('/my', auth, async (req, res) => {
  try {
    const campaignsRaw = await Campaign.findAll({
      where: { brandId: req.user.id },
      include: ['applications'],
      order: [['createdAt', 'DESC']]
    });
    const campaigns = campaignsRaw.map(formatCampaign);
    res.json({ campaigns });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single campaign
router.get('/:id', auth, async (req, res) => {
  try {
    const campaignRaw = await Campaign.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'brand',
          attributes: ['name', 'avatar'],
          include: [{ model: User.BrandProfile, as: 'brandProfile' }]
        },
        {
          association: 'applications',
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['name', 'avatar'],
              include: [{ model: User.CreatorProfile, as: 'creatorProfile' }]
            }
          ]
        }
      ]
    });

    if (!campaignRaw) return res.status(404).json({ error: 'Campaign not found' });

    campaignRaw.views += 1;
    await campaignRaw.save();

    res.json({ campaign: formatCampaign(campaignRaw) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update campaign
router.put('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      where: { id: req.params.id, brandId: req.user.id }
    });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const { title, description, niche, platforms, budget, requirements, deliverables, deadline, status, tags } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (niche !== undefined) updateData.niche = niche;
    if (platforms !== undefined) updateData.platforms = platforms;
    if (budget?.min !== undefined) updateData.budgetMin = budget.min;
    if (budget?.max !== undefined) updateData.budgetMax = budget.max;
    if (budget?.currency !== undefined) updateData.budgetCurrency = budget.currency;
    if (requirements?.minFollowers !== undefined) updateData.reqMinFollowers = requirements.minFollowers;
    if (requirements?.minEngagement !== undefined) updateData.reqMinEngagement = requirements.minEngagement;
    if (requirements?.location !== undefined) updateData.reqLocation = requirements.location;
    if (deliverables !== undefined) updateData.deliverables = deliverables;
    if (deadline !== undefined) updateData.deadline = deadline;
    if (status !== undefined) updateData.status = status;
    if (tags !== undefined) updateData.tags = tags;

    await campaign.update(updateData);
    res.json({ message: 'Campaign updated', campaign: formatCampaign(campaign) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete campaign
router.delete('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      where: { id: req.params.id, brandId: req.user.id }
    });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    await campaign.destroy();
    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
