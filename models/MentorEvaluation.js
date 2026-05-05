const mongoose = require('mongoose');

const mentorEvaluationSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentName: { type: String, required: true },
    mentorName: { type: String, required: true },
    stars: { type: Number, required: true },
    notes: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MentorEvaluation', mentorEvaluationSchema);