const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: String, required: true },
    age: { type: Number, required: true },
    address: { type: String, required: true },
    cityState: { type: String, required: true },
    learningLevel: { type: String, required: true },
    language: { type: String, required: true },
    school: { type: String },
    interests: [{ type: String }], // Array for multiple checkboxes
    
    diagnosis: { type: String },
    severity: { type: String },
    therapy: [{ type: String }], // Array for multiple checkboxes
    fitness: { type: String },
    
    parentName: { type: String, required: true },
    relation: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    occupation: { type: String },
    emergency: { type: String },
    
    photoUrl: { type: String },         // Path to uploaded photo
    medicalReportUrl: { type: String }, // Path to uploaded report
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Registration', registrationSchema);