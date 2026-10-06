const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Application = require('../models/Application');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const formatPayment = (p) => {
  if (!p) return null;
  const plain = p.get({ plain: true });
  return {
    ...plain,
    paymentMethod: {
      type: plain.paymentMethodType,
      last4: plain.paymentMethodLast4,
      upiId: plain.paymentMethodUpiId,
      bank: plain.paymentMethodBank
    },
    creatorBankDetails: {
      accountName: plain.creatorBankAccountName,
      accountNumber: plain.creatorBankAccountNumber,
      ifsc: plain.creatorBankIfsc,
      upiId: plain.creatorBankUpiId
    }
  };
};

// BRAND: Initiate payment (put money in escrow/hold)
router.post('/initiate', auth, async (req, res) => {
  try {
    if (req.user.role !== 'brand') {
      return res.status(403).json({ error: 'Only brands can initiate payment' });
    }

    const { applicationId, amount, paymentMethod } = req.body;

    const application = await Application.findOne({
      where: {
        id: applicationId,
        brandId: req.user.id,
        status: 'accepted'
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Accepted application not found' });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ where: { applicationId } });
    if (existingPayment) {
      return res.status(400).json({ error: 'Payment already initiated for this application' });
    }

    const platformFee = Math.round(amount * 0.10); // 10% platform fee
    const creatorAmount = amount - platformFee;

    // Simulate payment processing (Fake)
    const payment = await Payment.create({
      applicationId,
      campaignId: application.campaignId,
      brandId: req.user.id,
      creatorId: application.creatorId,
      amount,
      platformFee,
      creatorAmount,
      status: 'held',
      paymentMethodType: paymentMethod?.type || 'card',
      paymentMethodLast4: paymentMethod?.last4 || '4242',
      paymentMethodUpiId: paymentMethod?.upiId || '',
      paymentMethodBank: paymentMethod?.bank || '',
      paidAt: new Date(),
      heldAt: new Date(),
    });

    // Update application status
    application.dealAmount = amount;
    await application.save();

    res.status(201).json({
      message: 'Payment successful! Amount is held in escrow.',
      payment: formatPayment(payment),
      transactionId: payment.transactionId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BRAND: Release payment to creator (after content approval)
router.post('/release/:paymentId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'brand') {
      return res.status(403).json({ error: 'Only brands can release payment' });
    }

    const payment = await Payment.findOne({
      where: {
        id: req.params.paymentId,
        brandId: req.user.id,
        status: 'held'
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found or already released' });
    }

    payment.status = 'released';
    payment.releasedAt = new Date();
    await payment.save();

    // Mark application as completed
    await Application.update(
      { status: 'completed', completedAt: new Date() },
      { where: { id: payment.applicationId } }
    );

    res.json({
      message: `₹${payment.creatorAmount.toLocaleString()} released to creator successfully!`,
      payment: formatPayment(payment)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BRAND: Request refund (if creator didn't deliver)
router.post('/refund/:paymentId', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: {
        id: req.params.paymentId,
        brandId: req.user.id,
        status: 'held'
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    payment.status = 'refunded';
    payment.refundedAt = new Date();
    payment.notes = req.body.reason || 'Refund requested by brand';
    await payment.save();

    res.json({ message: 'Refund processed. Amount will be credited back.', payment: formatPayment(payment) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get payment by application
router.get('/application/:applicationId', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: { applicationId: req.params.applicationId },
      include: [
        { model: User, as: 'brand', attributes: ['name'], include: [{ model: User.BrandProfile, as: 'brandProfile' }] },
        { model: User, as: 'creator', attributes: ['name'], include: [{ model: User.CreatorProfile, as: 'creatorProfile' }] }
      ]
    });

    res.json({ payment: formatPayment(payment) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all payments for brand
router.get('/brand/all', auth, async (req, res) => {
  try {
    const paymentsRaw = await Payment.findAll({
      where: { brandId: req.user.id },
      include: [
        { model: User, as: 'creator', attributes: ['name', 'avatar'], include: [{ model: User.CreatorProfile, as: 'creatorProfile' }] },
        { model: Campaign, as: 'campaign', attributes: ['title'] },
        { model: Application, as: 'application' }
      ],
      order: [['createdAt', 'DESC']]
    });

    const payments = paymentsRaw.map(formatPayment);
    const totalHeld = payments.filter(p => p.status === 'held').reduce((s, p) => s + p.amount, 0);
    const totalReleased = payments.filter(p => p.status === 'released').reduce((s, p) => s + p.amount, 0);

    res.json({ payments, totalHeld, totalReleased });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all payments for creator
router.get('/creator/all', auth, async (req, res) => {
  try {
    const paymentsRaw = await Payment.findAll({
      where: { creatorId: req.user.id },
      include: [
        { model: User, as: 'brand', attributes: ['name', 'avatar'], include: [{ model: User.BrandProfile, as: 'brandProfile' }] },
        { model: Campaign, as: 'campaign', attributes: ['title'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const payments = paymentsRaw.map(formatPayment);
    const totalEarned = payments.filter(p => p.status === 'released').reduce((s, p) => s + p.creatorAmount, 0);
    const totalPending = payments.filter(p => p.status === 'held').reduce((s, p) => s + p.creatorAmount, 0);

    res.json({ payments, totalEarned, totalPending });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all payments
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const paymentsRaw = await Payment.findAll({
      include: [
        { model: User, as: 'brand', attributes: ['name', 'email'] },
        { model: User, as: 'creator', attributes: ['name', 'email'] },
        { model: Campaign, as: 'campaign', attributes: ['title'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const payments = paymentsRaw.map(formatPayment);
    const totalVolume = payments.reduce((s, p) => s + p.amount, 0);
    const totalFees = payments.reduce((s, p) => s + p.platformFee, 0);

    res.json({ payments, totalVolume, totalFees });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
