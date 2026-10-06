const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { analyzeCreator } = require('../utils/aiAnalysis');

// Get all creators with filters
router.get('/creators', auth, async (req, res) => {
  try {
    const {
      niche, minFollowers, maxFollowers, minEngagement,
      location, search, sort, page = 1, limit = 12
    } = req.query;

    const where = {
      role: 'creator',
      isBanned: false,
      isActive: true
    };

    const includeWhere = {};

    if (niche) {
      const niches = niche.split(',');
      includeWhere.niche = {
        [Op.or]: niches.map(n => ({ [Op.like]: `%"${n}"%` }))
      };
    }
    if (minFollowers) {
      includeWhere.totalFollowers = { [Op.gte]: parseInt(minFollowers) };
    }
    if (maxFollowers) {
      includeWhere.totalFollowers = {
        ...(includeWhere.totalFollowers || {}),
        [Op.lte]: parseInt(maxFollowers)
      };
    }
    if (minEngagement) {
      includeWhere.engagementRate = { [Op.gte]: parseFloat(minEngagement) };
    }
    if (location) {
      includeWhere.location = { [Op.like]: `%${location}%` };
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { '$creatorProfile.bio$': { [Op.like]: `%${search}%` } }
      ];
    }

    let order = [['createdAt', 'DESC']];
    if (sort === 'followers') {
      order = [[{ model: User.CreatorProfile, as: 'creatorProfile' }, 'totalFollowers', 'DESC']];
    } else if (sort === 'engagement') {
      order = [[{ model: User.CreatorProfile, as: 'creatorProfile' }, 'engagementRate', 'DESC']];
    } else if (sort === 'aiScore') {
      order = [[{ model: User.CreatorProfile, as: 'creatorProfile' }, 'aiScore', 'DESC']];
    }

    const total = await User.count({
      where,
      include: [{ model: User.CreatorProfile, as: 'creatorProfile', where: includeWhere, required: true }]
    });

    const creators = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      include: [{ model: User.CreatorProfile, as: 'creatorProfile', where: includeWhere, required: true }],
      order,
      offset: (page - 1) * limit,
      limit: parseInt(limit)
    });

    res.json({ creators, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get creator by ID
router.get('/creators/:id', async (req, res) => {
  try {
    const creator = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: User.CreatorProfile, as: 'creatorProfile' }]
    });
    if (!creator || creator.role !== 'creator') {
      return res.status(404).json({ error: 'Creator not found' });
    }
    res.json({ creator });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: User.CreatorProfile, as: 'creatorProfile' },
        { model: User.BrandProfile, as: 'brandProfile' }
      ]
    });

    if (user.role === 'creator') {
      const creatorProfile = user.creatorProfile;
      const updatedProfileData = { ...updates.creatorProfile };

      if (updates.name) {
        user.name = updates.name;
        await user.save();
      }

      if (updates.creatorProfile?.socialLinks) {
        const links = updates.creatorProfile.socialLinks;
        const analysis = analyzeCreator(links);

        updatedProfileData.instagramUsername = links.instagram?.username || '';
        updatedProfileData.instagramFollowers = links.instagram?.followers || 0;
        updatedProfileData.instagramUrl = links.instagram?.url || '';

        updatedProfileData.youtubeUsername = links.youtube?.username || '';
        updatedProfileData.youtubeSubscribers = links.youtube?.subscribers || 0;
        updatedProfileData.youtubeUrl = links.youtube?.url || '';

        updatedProfileData.aiScore = analysis.aiScore;
        updatedProfileData.engagementRate = analysis.engagementRate;
        updatedProfileData.fakeFollowerPercentage = analysis.fakeFollowerPercentage;
        updatedProfileData.contentConsistency = analysis.contentConsistency;
        updatedProfileData.totalFollowers = analysis.totalFollowers;
        updatedProfileData.audienceLocations = analysis.audienceLocations;
        updatedProfileData.mlAnalysis = analysis.analysis;
      }

      await creatorProfile.update(updatedProfileData);
    } else if (user.role === 'brand') {
      const brandProfile = user.brandProfile;
      await brandProfile.update({ ...updates.brandProfile });
      if (updates.name) {
        user.name = updates.name;
        await user.save();
      }
    }

    // Fetch user details again to respond with correctly updated profile structures
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: User.CreatorProfile, as: 'creatorProfile' },
        { model: User.BrandProfile, as: 'brandProfile' }
      ]
    });

    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Run AI analysis manually
router.post('/analyze/:id', auth, async (req, res) => {
  try {
    const creator = await User.findByPk(req.params.id, {
      include: [{ model: User.CreatorProfile, as: 'creatorProfile' }]
    });
    if (!creator || creator.role !== 'creator') {
      return res.status(404).json({ error: 'Creator not found' });
    }

    const socialLinks = {
      instagram: {
        username: creator.creatorProfile.instagramUsername,
        followers: creator.creatorProfile.instagramFollowers,
        url: creator.creatorProfile.instagramUrl
      },
      youtube: {
        username: creator.creatorProfile.youtubeUsername,
        subscribers: creator.creatorProfile.youtubeSubscribers,
        url: creator.creatorProfile.youtubeUrl
      }
    };

    const analysis = analyzeCreator(socialLinks);
    await creator.creatorProfile.update({
      aiScore: analysis.aiScore,
      engagementRate: analysis.engagementRate,
      fakeFollowerPercentage: analysis.fakeFollowerPercentage,
      contentConsistency: analysis.contentConsistency,
      totalFollowers: analysis.totalFollowers,
      audienceLocations: analysis.audienceLocations,
      mlAnalysis: analysis.analysis
    });

    res.json({ message: 'Analysis complete', analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Shortlist creator
router.post('/shortlist/:creatorId', auth, async (req, res) => {
  try {
    const { campaignId } = req.body;
    const Campaign = require('../models/Campaign');

    const campaign = await Campaign.findOne({
      where: { id: campaignId, brandId: req.user.id }
    });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    await Campaign.CampaignShortlist.findOrCreate({
      where: { campaignId, userId: req.params.creatorId }
    });

    res.json({ message: 'Creator shortlisted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
