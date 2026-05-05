const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    parentName: { type: String, required: true },
    childName: { type: String, required: true },
    contact: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);