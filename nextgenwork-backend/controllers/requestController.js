const Request = require('../models/Request');
const Opportunity = require('../models/Opportunity');
const mongoose = require('mongoose');

// Add request to an opportunity
const addRequest = async (req, res, next) => {
  try {
    const { opportunityId } = req.params;
    const { description } = req.body;
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({ message: 'Resume upload is required.' });
    }

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    const existingRequest = await Request.findOne({
      opportunity: new mongoose.Types.ObjectId(opportunityId),
      requestedBy: req.user._id
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You have already requested this opportunity' });
    }

    const request = new Request({
      opportunity: new mongoose.Types.ObjectId(opportunityId),
      requestedBy: req.user._id,
      description,
      resumePath: resumeFile ? resumeFile.path : null
    });

    await request.save();
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
};

const getMyRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({ requestedBy: req.user._id })
      .populate('opportunity')
      .populate('requestedBy', 'username email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    next(err);
  }
};

const getOpportunityRequests = async (req, res) => {
  const { id } = req.params;
  let requests = [];
  try {
    try {
      requests = await Request.find({ opportunity: new mongoose.Types.ObjectId(id) }).populate('requestedBy', 'username email');
    } catch (e) {}
    if (!requests || requests.length === 0) {
      requests = await Request.find({ opportunity: id }).populate('requestedBy', 'username email');
    }
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
};

const deleteRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (request.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }
    await Request.findByIdAndDelete(requestId);
    res.json({ message: 'Request deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addRequest,
  getMyRequests,
  getOpportunityRequests,
  deleteRequest
};
