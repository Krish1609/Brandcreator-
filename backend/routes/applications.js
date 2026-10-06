const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const formatApplication = (app) => {
  if (!app) return null;
  const plain = app.get({ plain: true });
  if (plain.campaign) {
    plain.campaign.budget = {
      min: plain.campaign.budgetMin,
      max: plain.campaign.budgetMax,
      currency: plain.campaign.budgetCurrency
    };
  }
  return plain;
};

// Apply to campaign
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'creator') {
      return res.status(403).json({ error: 'Only creators can apply' });
    }

    const { campaignId, proposal, proposedRate, deliverables, timeline } = req.body;

    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (campaign.status !== 'active') return res.status(400).json({ error: 'Campaign is not active' });

    // Check if already applied
    const existingApp = await Application.findOne({
      where: {
        campaignId,
        creatorId: req.user.id
      }
    });
    if (existingApp) return res.status(400).json({ error: 'Already applied to this campaign' });

    const application = await Application.create({
      campaignId,
      creatorId: req.user.id,
      brandId: campaign.brandId,
      proposal,
      proposedRate,
      deliverables: deliverables || [],
      timeline
    });

    // Update creator collaboration count
    const user = await User.findByPk(req.user.id, {
      include: [{ model: User.CreatorProfile, as: 'creatorProfile' }]
    });
    if (user && user.creatorProfile) {
      await user.creatorProfile.increment('collaborationCount', { by: 1 });
    }

    res.status(201).json({ message: 'Application submitted', application: formatApplication(application) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get creator's applications
router.get('/my', auth, async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { creatorId: req.user.id },
      include: [
        {
          model: Campaign,
          as: 'campaign',
          attributes: ['title', 'budgetMin', 'budgetMax', 'budgetCurrency', 'status', 'niche']
        },
        {
          model: User,
          as: 'brand',
          attributes: ['name', 'avatar'],
          include: [{ model: User.BrandProfile, as: 'brandProfile' }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ applications: applications.map(formatApplication) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get campaign applications (for brand)
router.get('/campaign/:campaignId', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      where: {
        id: req.params.campaignId,
        brandId: req.user.id
      }
    });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const applications = await Application.findAll({
      where: { campaignId: req.params.campaignId },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['name', 'avatar', 'email'],
          include: [{ model: User.CreatorProfile, as: 'creatorProfile' }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ applications: applications.map(formatApplication) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update application status (brand only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, dealAmount } = req.body;

    const application = await Application.findOne({
      where: {
        id: req.params.id,
        brandId: req.user.id
      }
    });
    if (!application) return res.status(404).json({ error: 'Application not found' });

    application.status = status;
    if (dealAmount) application.dealAmount = dealAmount;
    if (status === 'completed') application.completedAt = new Date();

    await application.save();
    res.json({ message: 'Status updated', application: formatApplication(application) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single application
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [
        { model: Campaign, as: 'campaign' },
        {
          model: User,
          as: 'creator',
          attributes: { exclude: ['password'] },
          include: [{ model: User.CreatorProfile, as: 'creatorProfile' }]
        },
        {
          model: User,
          as: 'brand',
          attributes: { exclude: ['password'] },
          include: [{ model: User.BrandProfile, as: 'brandProfile' }]
        }
      ]
    });

    if (!application) return res.status(404).json({ error: 'Not found' });

    // Only allow participants to view
    const isParticipant =
      application.creatorId === req.user.id ||
      application.brandId === req.user.id;

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ application: formatApplication(application) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
