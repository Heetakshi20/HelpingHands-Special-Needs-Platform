const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    studentCondition: { type: String, required: true },
    mentorName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    goal: { type: String },
    bookingType: { type: String, default: 'Normal Text' },
    status: { type: String, default: 'Pending' },
    roomName: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);