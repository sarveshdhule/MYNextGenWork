const Resource = require('../models/Resource');
const { createNotification } = require('./notificationController');

const getAllResources = async (req, res) => {
  try {
    let sort = req.query.sort || 'newest';
    let resources = await Resource.find();
    if (sort === 'top-rated') {
      resources = resources.sort((a, b) => {
        const aAvg = a.ratings && a.ratings.length > 0 ? a.ratings.reduce((acc, r) => acc + r.rating, 0) / a.ratings.length : 0;
        const bAvg = b.ratings && b.ratings.length > 0 ? b.ratings.reduce((acc, r) => acc + r.rating, 0) / b.ratings.length : 0;
        return bAvg - aAvg || new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else if (sort === 'most-viewed') {
      resources = resources.sort((a, b) => b.views - a.views || new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      resources = resources.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch resources.' });
  }
};

const getMyResources = async (req, res) => {
  try {
    const resources = await Resource.find({ userId: req.user.id });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your resources.' });
  }
};

const createResource = async (req, res) => {
  try {
    const { title, description, domain, resourceLinks, tags } = req.body;
    const resource = new Resource({
      title, description, domain, resourceLinks, tags,
      userId: req.user.id
    });
    await resource.save();
    // Create notification for new resource
    await createNotification({
      message: `New resource posted: ${title}`,
      resource: resource._id
    });
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create resource.' });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Not found' });
    if (resource.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    await resource.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete resource.' });
  }
};

const rateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating' });
    }
    const resource = await Resource.findById(id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    // Remove previous rating by this user if exists
    resource.ratings = resource.ratings.filter(r => r.userId.toString() !== req.user.id);
    // Add new rating
    resource.ratings.push({ userId: req.user.id, rating });
    await resource.save();
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: 'Failed to rate resource.' });
  }
};

const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, domain, resourceLinks, tags } = req.body;
    const resource = await Resource.findById(id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (resource.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    if (title) resource.title = title;
    if (description) resource.description = description;
    if (domain) resource.domain = domain;
    if (resourceLinks) resource.resourceLinks = resourceLinks;
    if (tags) resource.tags = tags;
    await resource.save();
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update resource.' });
  }
};

// Increment resource views
const incrementResourceViews = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: 'Failed to increment views.' });
  }
};

module.exports = {
  getAllResources,
  getMyResources,
  createResource,
  deleteResource,
  rateResource,
  updateResource,
  incrementResourceViews
};
