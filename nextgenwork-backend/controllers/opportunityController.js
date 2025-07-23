const Opportunity = require('../models/Opportunity');
const { createNotification } = require('./notificationController');

// Create Opportunity
exports.createOpportunity = async (req, res, next) => {
  try {
    console.log('REQ.BODY:', req.body);
    const {
      type, jobType, title, description, domain, tags, date, externalLink,
      salary, companyName, companyAddress, contactInfo,
      organizer, prize, speaker, platform, registrationFee, contestDateTime,
      webinarDateTime
    } = req.body;

    if (type === 'job' && !req.body.applicationDeadline) {
      return res.status(400).json({ message: 'Application Deadline is required for jobs.' });
    }

    let logo = null, pic = null;
    if (req.files) {
      if (req.files['logo'] && req.files['logo'][0]) {
        logo = `/public/logos/${req.files['logo'][0].filename}`;
      }
      if (req.files['pic'] && req.files['pic'][0]) {
        pic = `/public/pics/${req.files['pic'][0].filename}`;
      }
    }

    const opportunity = new Opportunity({
      type,
      jobType: type === 'job' ? jobType : undefined,
      title,
      description,
      domain,
      tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()),
      date,
      externalLink,
      salary: type === 'job' ? salary : undefined,
      companyName: type === 'job' ? companyName : undefined,
      companyAddress: type === 'job' ? companyAddress : undefined,
      contactInfo: type === 'job' ? contactInfo : undefined,
      organizer: type === 'contest' ? organizer : undefined,
      prize: type === 'contest' ? prize : undefined,
      speaker: type === 'webinar' ? speaker : undefined,
      platform: type === 'webinar' ? platform : undefined,
      registrationFee: (type === 'contest' || type === 'webinar') ? Number(registrationFee) || 0 : 0,
      contestDateTime: type === 'contest' ? contestDateTime : undefined,
      webinarDateTime: type === 'webinar' ? webinarDateTime : undefined,
      applicationDeadline: type === 'job' ? req.body.applicationDeadline : undefined,
      logo,
      pic,
      postedBy: req.user._id
    });

    await opportunity.save();
    await createNotification({
      message: `New ${type.charAt(0).toUpperCase() + type.slice(1)} posted: ${title}`,
      opportunity: opportunity._id
    });
    res.status(201).json(opportunity);
  } catch (err) {
    next(err);
  }
};

// Get All Opportunities (with filters/search/type)
exports.getOpportunities = async (req, res, next) => {
  try {
    const { domain, companyName, organizer, speaker, search, type } = req.query;
    let filter = {};

    if (domain) filter.domain = { $regex: domain, $options: 'i' };
    // Enhanced third field search logic
    if (companyName) {
      if (!type || type === '') {
        // If type is not set, search all three fields
        filter.$or = [
          { companyName: { $regex: companyName, $options: 'i' } },
          { organizer: { $regex: companyName, $options: 'i' } },
          { speaker: { $regex: companyName, $options: 'i' } }
        ];
      } else if (type === 'job') {
        filter.companyName = { $regex: companyName, $options: 'i' };
      } else if (type === 'contest') {
        filter.organizer = { $regex: companyName, $options: 'i' };
      } else if (type === 'webinar') {
        filter.speaker = { $regex: companyName, $options: 'i' };
      }
    }
    if (organizer && type === 'contest') filter.organizer = { $regex: organizer, $options: 'i' };
    if (speaker && type === 'webinar') filter.speaker = { $regex: speaker, $options: 'i' };
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (type) filter.type = type;

    const opportunities = await Opportunity.find(filter)
      .populate('postedBy', 'username email')
      .sort({ createdAt: -1 });
    res.json(opportunities);
  } catch (err) {
    next(err);
  }
};

// Get Single Opportunity
exports.getOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('postedBy', 'username email');
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });

    res.json(opportunity);
  } catch (err) {
    next(err);
  }
};

// Update Opportunity
exports.updateOpportunity = async (req, res, next) => {
  try {
    const {
      type, jobType, title, description, domain, tags, date, externalLink,
      salary, companyName, companyAddress, contactInfo,
      organizer, prize, speaker, platform, registrationFee, contestDateTime,
      webinarDateTime
    } = req.body;

    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });
    if (opportunity.postedBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    if (type === 'job' && !req.body.applicationDeadline && !opportunity.applicationDeadline) {
      return res.status(400).json({ message: 'Application Deadline is required for jobs.' });
    }

    opportunity.type = type || opportunity.type;
    opportunity.jobType = opportunity.type === 'job' ? (jobType || opportunity.jobType) : undefined;
    opportunity.title = title || opportunity.title;
    opportunity.description = description || opportunity.description;
    opportunity.domain = domain || opportunity.domain;
    opportunity.tags = tags || opportunity.tags;
    opportunity.date = date || opportunity.date;
    opportunity.externalLink = externalLink || opportunity.externalLink;
    opportunity.salary = opportunity.type === 'job' ? (salary || opportunity.salary) : undefined;
    opportunity.companyName = opportunity.type === 'job' ? (companyName || opportunity.companyName) : undefined;
    opportunity.companyAddress = opportunity.type === 'job' ? (companyAddress || opportunity.companyAddress) : undefined;
    opportunity.contactInfo = opportunity.type === 'job' ? (contactInfo || opportunity.contactInfo) : undefined;
    opportunity.organizer = opportunity.type === 'contest' ? (organizer || opportunity.organizer) : undefined;
    opportunity.prize = opportunity.type === 'contest' ? (prize || opportunity.prize) : undefined;
    opportunity.speaker = opportunity.type === 'webinar' ? (speaker || opportunity.speaker) : undefined;
    opportunity.platform = opportunity.type === 'webinar' ? (platform || opportunity.platform) : undefined;
    if (typeof registrationFee !== 'undefined' && (opportunity.type === 'contest' || opportunity.type === 'webinar')) {
      opportunity.registrationFee = Number(registrationFee) || 0;
    }
    if (typeof contestDateTime !== 'undefined' && opportunity.type === 'contest') {
      opportunity.contestDateTime = contestDateTime;
    }
    if (typeof webinarDateTime !== 'undefined' && opportunity.type === 'webinar') {
      opportunity.webinarDateTime = webinarDateTime;
    }
    if (typeof req.body.applicationDeadline !== 'undefined' && opportunity.type === 'job') {
      opportunity.applicationDeadline = req.body.applicationDeadline;
    }
    if (req.files) {
      if (req.files['logo'] && req.files['logo'][0]) {
        opportunity.logo = `/public/logos/${req.files['logo'][0].filename}`;
      }
      if (req.files['pic'] && req.files['pic'][0]) {
        opportunity.pic = `/public/pics/${req.files['pic'][0].filename}`;
      }
    }

    await opportunity.save();
    res.json(opportunity);
  } catch (err) {
    next(err);
  }
};

// Delete Opportunity
exports.deleteOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });
    if (opportunity.postedBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    await opportunity.deleteOne();
    res.json({ message: 'Opportunity deleted' });
  } catch (err) {
    next(err);
  }
};