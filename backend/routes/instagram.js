const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { analyzeInstagramProfile } = require('../utils/instagramML');

const formatUser = (user) => {
  if (!user) return null;
  const plain = user.get({ plain: true });
  if (plain.creatorProfile) {
    plain.creatorProfile.socialLinks = {
      instagram: {
        username: plain.creatorProfile.instagramUsername,
        followers: plain.creatorProfile.instagramFollowers,
        url: plain.creatorProfile.instagramUrl
      },
      youtube: {
        username: plain.creatorProfile.youtubeUsername,
        subscribers: plain.creatorProfile.youtubeSubscribers,
        url: plain.creatorProfile.youtubeUrl
      }
    };
    plain.creatorProfile.rateCard = {
      postRate: plain.creatorProfile.postRate,
      storyRate: plain.creatorProfile.storyRate,
      videoRate: plain.creatorProfile.videoRate
    };
  }
  return plain;
};

router.post('/analyze', auth, async (req, res) => {
  try {
    const { username } = req.body;
    if (!username?.trim()) return res.status(400).json({ error: 'Username required' });
    const clean = username.trim().replace(/^@/, '').replace(/\s/g, '');
    console.log(`Analyzing @${clean}`);

    const result = await analyzeInstagramProfile(clean);
    const { instagramData: ig, mlScore } = result;

    const existing = await User.findByPk(req.user.id, {
      include: [{ model: User.CreatorProfile, as: 'creatorProfile' }]
    });
    if (!existing) return res.status(404).json({ error: 'User not found' });

    const cp = existing.creatorProfile;

    // Save crawl details
    await cp.update({
      instagramUsername: ig.username || '',
      instagramFollowers: ig.followers || 0,
      instagramUrl: `https://www.instagram.com/${ig.username}/`,

      totalFollowers: ig.followers || 0,
      engagementRate: parseFloat(((ig.avgER || 0) * 100).toFixed(2)),
      fakeFollowerPercentage: parseFloat((ig.fakeFollowerPct || 0).toFixed(1)),
      contentConsistency: (mlScore.breakdown.contentScore || 0) * 10,
      aiScore: mlScore.aiScore || 0,

      audienceLocations: (ig.countries || []).slice(0, 5).map(c => ({
        country: c.name,
        percentage: parseFloat(c.percent.toFixed(1))
      })),

      audienceTypes: ig.audienceTypes || [],
      genderSplit: ig.genders || [],
      lastPosts: ig.lastPosts || [],
      mlBreakdown: mlScore.breakdown || {},
      mlLabel: mlScore.label || '',
      mlAnalysis: mlScore.analysis || '',
      lastAnalyzedAt: new Date(),

      bio: cp.bio || ig.bio || '',
      location: cp.location || ig.countryCode || ''
    });

    const updated = await User.findByPk(req.user.id, {
      include: [{ model: User.CreatorProfile, as: 'creatorProfile' }]
    });

    res.json({
      success: true,
      message: `@${clean} analyzed! AI Score: ${mlScore.aiScore}/100`,
      result,
      user: formatUser(updated)
    });

  } catch (err) {
    console.error('Instagram error:', err.message);
    if (err.response?.status === 404 || err.message?.includes('No data'))
      return res.status(404).json({ error: `Account @${req.body.username} not found or private.` });
    if (err.response?.status === 429)
      return res.status(429).json({ error: 'API rate limit. Wait a minute and retry.' });
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT')
      return res.status(504).json({ error: 'API timed out. Try again.' });
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

router.get('/profile/:userId', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      include: [{ model: User.CreatorProfile, as: 'creatorProfile' }]
    });
    if (!user || user.role !== 'creator') return res.status(404).json({ error: 'Creator not found' });

    const cp = user.creatorProfile || {};
    const audienceTypes = cp.audienceTypes || [];
    const genderSplit = cp.genderSplit || [];
    const lastPosts = cp.lastPosts || [];
    const mlBreakdown = cp.mlBreakdown || {};

    res.json({
      creator: formatUser(user),
      analysis: {
        aiScore: cp.aiScore || 0,
        engagementRate: cp.engagementRate || 0,
        fakeFollowerPct: cp.fakeFollowerPercentage || 0,
        totalFollowers: cp.totalFollowers || 0,
        mlLabel: cp.mlLabel || '',
        mlAnalysis: cp.mlAnalysis || '',
        mlBreakdown,
        audienceTypes,
        genderSplit,
        lastPosts,
        audienceLocations: cp.audienceLocations || [],
        lastAnalyzedAt: cp.lastAnalyzedAt || null,
        instagramUsername: cp.instagramUsername || ''
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
