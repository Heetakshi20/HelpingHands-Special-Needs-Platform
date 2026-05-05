const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    studentName: String,
    className: String,
    score: Number,
    total: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ExamResult', examResultSchema);