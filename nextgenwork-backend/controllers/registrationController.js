const Razorpay = require('razorpay');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
const createOrder = async (req, res) => {
  const { amount } = req.body;
  const options = {
    amount: amount * 100, // in paise
    currency: 'INR',
    receipt: `receipt_order_${Date.now()}`
  };
  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Razorpay order creation failed' });
  }
};

// Register for contest/webinar
const register = async (req, res) => {
  const { id } = req.params;
  const { name, college, email, mobile, paymentId, paid } = req.body;
  const userId = req.user._id.toString();
  try {
    const opportunity = await Opportunity.findById(id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });

    // Prevent duplicate registration
    if (opportunity.registrations.some(r => r.user.toString() === userId)) {
      return res.status(400).json({ message: 'Already registered' });
    }

    const emailToSave = email || req.user.email || '';
    opportunity.registrations.push({
      user: req.user._id,
      name,
      college,
      email: emailToSave,
      mobile,
      paymentId,
      paid
    });
    await opportunity.save();

    // Send confirmation email
    try {
      await sendRegistrationEmail(emailToSave, opportunity, opportunity.externalLink);
    } catch (e) {
      console.error('Failed to send registration email:', e);
    }

    res.json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Get my registrations
const getMyRegistrations = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ 'registrations.user': req.user._id });
    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch registrations' });
  }
};

// Get registrations for a contest (poster only)
const getRegistrationsForOpportunity = async (req, res) => {
  const { id } = req.params;
  try {
    const opportunity = await Opportunity.findById(id).populate('registrations.user', 'username email');
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });
    res.json(opportunity.registrations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch registrations' });
  }
};

const sendRegistrationEmail = async (to, opportunity, joinLink) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  let details = `
    <h2>Thank you for registering!</h2>
    <p>Dear Participant,</p>
    <p>We are excited to confirm your registration for the following event:</p>
    <ul>
      <li><strong>Title:</strong> ${opportunity.title}</li>
      <li><strong>Type:</strong> ${opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}</li>
      ${opportunity.type === 'webinar' ? `<li><strong>Speaker:</strong> ${opportunity.speaker}</li><li><strong>Platform:</strong> ${opportunity.platform}</li><li><strong>Date & Time:</strong> ${opportunity.webinarDateTime ? new Date(opportunity.webinarDateTime).toLocaleString() : 'N/A'}</li>` : ''}
      ${opportunity.type === 'contest' ? `<li><strong>Organizer:</strong> ${opportunity.organizer}</li><li><strong>Prize:</strong> ${opportunity.prize}</li><li><strong>Date & Time:</strong> ${opportunity.contestDateTime ? new Date(opportunity.contestDateTime).toLocaleString() : 'N/A'}</li>` : ''}
      <li><strong>Registration Fee:</strong> ${opportunity.registrationFee > 0 ? `₹${opportunity.registrationFee}` : 'Free'}</li>
    </ul>
    <p><strong>Joining/Details Link:</strong> <a href="${opportunity.externalLink || joinLink}">${opportunity.externalLink || joinLink || 'N/A'}</a></p>
    <p>We look forward to your participation!<br/>Best regards,<br/>NextGenWork Team</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: `Registration Confirmation: ${opportunity.title}`,
    html: details
  });
};

module.exports = {
  createOrder,
  register,
  getMyRegistrations,
  getRegistrationsForOpportunity
};
