const express = require('express');
const router = express.Router();
const ContentSubmission = require('../models/ContentSubmission');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup file upload
const uploadDir = 'uploads/content';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|mp4|mov|avi|pdf|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) cb(null, true);
    else cb(new Error('Only images and videos allowed'));
  }
});

// CREATOR: Submit content for a campaign
router.post('/submit', auth, upload.array('files', 5), async (req, res) => {
  try {
    if (req.user.role !== 'creator') {
      return res.status(403).json({ error: 'Only creators can submit content' });
    }

    const { applicationId, title, description, contentLinks, deliverable } = req.body;

    const application = await Application.findOne({
      where: {
        id: applicationId,
        creatorId: req.user.id
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Active application not found' });
    }

    // Parse content links
    let parsedLinks = [];
    try {
      parsedLinks = typeof contentLinks === 'string' ? JSON.parse(contentLinks) : (contentLinks || []);
    } catch { parsedLinks = []; }

    // Process uploaded files
    const files = (req.files || []).map(f => ({
      filename: f.originalname,
      fileType: f.mimetype,
      fileSize: f.size,
      filePath: f.path,
    }));

    const submission = await ContentSubmission.create({
      applicationId,
      campaignId: application.campaignId,
      creatorId: req.user.id,
      brandId: application.brandId,
      title,
      description,
      contentLinks: parsedLinks,
      files,
      deliverable,
      status: 'submitted',
      submittedAt: new Date(),
    });

    // Update application to mark content submitted (Sequelize syntax)
    // Note: since the schema has contentSubmitted field (Mongoose version line 85), we should make sure that if the MySQL schema doesn't have it explicitly stored as a column, it doesn't crash.
    // Wait, did Application model have contentSubmitted column? Let's check: in Application.js Sequelize model, we didn't add it because Mongoose schema didn't have it defined in applicationSchema of Application.js! Let's check: in the mongoose code, they did application.contentSubmitted = true; which is an ad-hoc field! Since they didn't define it in the mongoose schema either, we can safely just save or update if it exists.
    // Wait, let's see. If the frontend relies on `application.contentSubmitted` being checked in database, let's look at Application.js mongoose schema. It had no "contentSubmitted" defined, but mongoose allows schema-free ad-hoc fields. In SQL, you cannot store ad-hoc fields. Let's verify if `contentSubmitted` was in Application.js Mongoose schema: NO (lines 1-22 in Step 43 showed it was not defined).
    // If it's not defined, does the database need it? We can safely query ContentSubmissions by Application ID to see if one exists. But let's check: did they use a save? If we do `await Application.update({ contentSubmitted: true }, { where: { id: applicationId } })`, if the column doesn't exist, it will throw an SQL error!
    // Since SQL model doesn't have `contentSubmitted` column, we shouldn't attempt to save it to Application table. Running queries for ContentSubmissions where applicationId is X is the standard relational way. But let's be safe: we can just check if saving it fails or if we shouldn't do it. We won't run `application.contentSubmitted = true` if it's not in the model columns.

    res.status(201).json({
      message: 'Content submitted successfully! Brand will review it.',
      submission
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BRAND: Get all submissions for their campaigns
router.get('/brand/all', auth, async (req, res) => {
  try {
    const submissions = await ContentSubmission.findAll({
      where: { brandId: req.user.id },
      include: [
        { model: User, as: 'creator', attributes: ['name', 'avatar'], include: [{ model: User.CreatorProfile, as: 'creatorProfile' }] },
        { model: Campaign, as: 'campaign', attributes: ['title'] },
        { model: Application, as: 'application' }
      ],
      order: [['submittedAt', 'DESC']]
    });

    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BRAND: Approve content →  payment release 
router.put('/approve/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'brand') {
      return res.status(403).json({ error: 'Only brands can approve content' });
    }

    const submission = await ContentSubmission.findOne({
      where: {
        id: req.params.id,
        brandId: req.user.id
      }
    });

    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    submission.status = 'approved';
    submission.approvedAt = new Date();
    submission.brandFeedback = req.body.feedback || 'Great work!';
    await submission.save();

    // Check if payment exists and is held
    const payment = await Payment.findOne({
      where: {
        applicationId: submission.applicationId,
        status: 'held'
      }
    });

    res.json({
      message: 'Content approved!',
      submission,
      paymentReady: !!payment,
      paymentId: payment?.id,
      hint: payment ? 'You can now release payment to the creator.' : 'No payment held yet.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BRAND: Request revision
router.put('/revision/:id', auth, async (req, res) => {
  try {
    const submission = await ContentSubmission.findOne({
      where: {
        id: req.params.id,
        brandId: req.user.id
      }
    });

    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    submission.status = 'revision_requested';
    submission.revisionNote = req.body.note;
    submission.brandFeedback = req.body.feedback;
    await submission.save();

    res.json({ message: 'Revision requested. Creator will be notified.', submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BRAND: Reject content
router.put('/reject/:id', auth, async (req, res) => {
  try {
    const submission = await ContentSubmission.findOne({
      where: {
        id: req.params.id,
        brandId: req.user.id
      }
    });

    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    submission.status = 'rejected';
    submission.brandFeedback = req.body.feedback;
    await submission.save();

    res.json({ message: 'Content rejected.', submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATOR: Get my submissions
router.get('/creator/all', auth, async (req, res) => {
  try {
    const submissions = await ContentSubmission.findAll({
      where: { creatorId: req.user.id },
      include: [
        { model: User, as: 'brand', attributes: ['name', 'avatar'], include: [{ model: User.BrandProfile, as: 'brandProfile' }] },
        { model: Campaign, as: 'campaign', attributes: ['title'] }
      ],
      order: [['submittedAt', 'DESC']]
    });

    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get submission by application ID
router.get('/application/:applicationId', auth, async (req, res) => {
  try {
    const submissions = await ContentSubmission.findAll({
      where: { applicationId: req.params.applicationId },
      include: [
        { model: User, as: 'creator', attributes: ['name', 'avatar'] }
      ],
      order: [['submittedAt', 'DESC']]
    });

    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
