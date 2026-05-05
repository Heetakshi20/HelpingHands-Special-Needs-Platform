const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String, required: true }, // This will store the path like "/uploads/my-drawing.jpg"
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Work', workSchema);