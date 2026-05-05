require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const Activity = require('./models/Activity');
const Feedback = require('./models/Feedback');
const ExamResult = require('./models/ExamResult');
const Booking = require('./models/Booking');
const MentorEvaluation = require('./models/MentorEvaluation');
const multer = require('multer');
const fs = require('fs');
const Work = require('./models/Work');
const Contact = require('./models/Contact');
const Registration = require('./models/Registration');

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// --- SECURE MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- SECURITY MIDDLEWARE (Must be defined before routes) ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; 
        next(); 
    } catch (err) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};



// ==========================================
// --- AUTHENTICATION ROUTES ---
// ==========================================
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password, role, condition } = req.body;
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!gmailRegex.test(email)) {
            return res.status(400).json({ error: 'Only @gmail.com addresses are allowed.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            // 👇 Updated to save condition for BOTH students and mentors
            condition: (role === 'student' || role === 'mentor') ? condition : '' 
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!gmailRegex.test(email)) {
            return res.status(400).json({ error: 'Only @gmail.com addresses are allowed.' });
        }
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role, condition: user.condition },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 👇 Updated Routing Logic 👇
        let redirectUrl = '/';
        if (user.role === 'admin') {
            redirectUrl = '/admin.html';
        } else if (user.role === 'student') {
            if (user.condition === 'autism') redirectUrl = '/dashboard1.html';
            else if (user.condition === 'down_syndrome') redirectUrl = '/dashboard2.html';
            else if (user.condition === 'dyslexia') redirectUrl = '/dashboard3.html';
        } else if (user.role === 'mentor') {
            if (user.condition === 'autism') redirectUrl = '/mentor1.html';
            else if (user.condition === 'down_syndrome') redirectUrl = '/mentor2.html';
            else if (user.condition === 'dyslexia') redirectUrl = '/mentor3.html';
        }

        res.json({ success: true, token, redirectUrl, name: user.name });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});



// ==========================================
// --- DASHBOARD DATA ROUTES ---
// ==========================================

// 1. Get User Profile Data
app.get('/api/getUserProfile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        res.json({ 
            fullName: user.name, 
            condition: user.condition,
            parentName: 'Pending Setup' 
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// 2. Submit Parents Feedback (Now saves to MongoDB!)
app.post('/api/submitFeedback', verifyToken, async (req, res) => {
    try {
        const { parentName, childName, contact, message } = req.body;
        
        // 1. Create a new database document
        const newFeedback = new Feedback({
            parentName,
            childName,
            contact,
            message
        });

        // 2. Save it permanently to MongoDB
        await newFeedback.save();
        
        console.log(`✅ Feedback saved to database from ${parentName}`);
        res.json({ success: true, message: 'Feedback saved successfully!' });
        
    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).json({ error: 'Failed to save feedback' });
    }
});



// ==========================================
// --- ADMIN ROUTES ---
// ==========================================
app.get('/api/admin/users', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }
        const users = await User.find().select('-password');
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});



// ==========================================
// --- ACTIVITY ROUTES ---
// ==========================================

// 1. Get All Activities (For both Admin and Students)
app.get('/api/getActivities', verifyToken, async (req, res) => {
    try {
        // Fetch activities from DB, oldest first
        const activities = await Activity.find().sort({ createdAt: 1 });
        res.json({ success: true, activities });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

// 2. Create New Activity (Admin Only)
app.post('/api/createActivity', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can create activities' });
        }
        
        const newActivity = new Activity({ title: req.body.title });
        await newActivity.save();
        
        res.json({ success: true, activity: newActivity });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create activity' });
    }
});

// 3. Delete Activity (Admin Only)
app.delete('/api/deleteActivity/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can delete activities' });
        }

        await Activity.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Activity deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete activity' });
    }
});



// ==========================================
// --- FEEDBACK ADMIN ROUTES ---
// ==========================================

// 1. Get all feedbacks (Admin Only)
app.get('/api/getAllFeedbacks', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can view feedbacks' });
        }
        // Fetch feedbacks, sorting by newest first (-1)
        const feedbacks = await Feedback.find().sort({ createdAt: -1 }); 
        res.json({ success: true, feedbacks });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch feedbacks' });
    }
});

// 2. Delete a feedback (Admin Only)
app.delete('/api/deleteFeedback/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can delete feedbacks' });
        }
        await Feedback.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Feedback deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete feedback' });
    }
});



// ==========================================
// --- ASSIGNMENT / EXAM ROUTES ---
// ==========================================

// 1. Submit Exam (Students Only)
app.post('/api/submitExam', verifyToken, async (req, res) => {
    try {
        // Ensure only students can submit
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Access denied. Students only.' });
        }

        const { score, total, className } = req.body;

        // Fetch the student's name from the DB using the secure token ID
        const student = await User.findById(req.user.userId);

        const newResult = new ExamResult({
            studentId: req.user.userId, // Secured via JWT
            studentName: student.name,  // Pulled directly from the secure DB
            className: className,
            score: score,
            total: total
        });

        await newResult.save();

        res.json({
            success: true,
            message: "Exam submitted successfully 🎉"
        });

    } catch (err) {
        console.error('Error saving exam:', err);
        res.status(500).json({ error: "Server error" });
    }
});

// 2. Get All Exam Results (Admin and Mentor Access)
app.get('/api/getAllExamResults', verifyToken, async (req, res) => {
    try {
        // 👇 UPDATED SECURITY: Allow if the user is an Admin OR a Mentor
        if (req.user.role !== 'admin' && req.user.role !== 'mentor') {
            return res.status(403).json({ error: 'Access denied. Admins and Mentors only.' });
        }

        // Fetch all results, newest first
        const results = await ExamResult.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            results: results
        });

    } catch (err) {
        console.error('Error fetching exams:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. Get Logged In Student Details (Optional helper route)
app.get('/api/getStudent', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(401).json({ error: 'Not logged in as student' });
        }
        
        const student = await User.findById(req.user.userId);
        
        res.json({
            success: true,
            student: {
                id: student._id,
                name: student.name
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});



// ==========================================
// --- MENTOR & BOOKING ROUTES ---
// ==========================================

// 1. Student Requests a Mentor (UPDATED)
app.post('/api/bookMentor', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can book mentors' });
        
        const student = await User.findById(req.user.userId);
        const uniqueRoomName = `BrightMinds-${student.name.replace(/\s/g, '')}-${req.body.mentorName.replace(/\s/g, '')}-${Date.now()}`;
        
        const newBooking = new Booking({
            studentId: student._id,
            studentName: student.name,
            studentCondition: student.condition,
            mentorName: req.body.mentorName,
            date: req.body.date,
            time: req.body.time,
            goal: req.body.goal,
            bookingType: req.body.bookingType, // ✅ Save the type of session!
            roomName: uniqueRoomName
        });
        
        await newBooking.save();
        res.json({ success: true, message: 'Booking successful!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to book mentor' });
    }
});

// ✅ Mentor Accepts the Booking
app.put('/api/acceptBooking/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'mentor') {
            return res.status(403).json({ error: 'Only mentors can accept' });
        }
        
        // Find the booking and change status to 'Accepted'
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id, 
            { status: 'Accepted' },
            { returnDocument: 'after' } // ✅ The new, warning-free way!
        );

        if (!updatedBooking) {
            return res.status(404).json({ error: 'Booking not found in database' });
        }

        res.json({ success: true, message: 'Booking Accepted!' });
    } catch (error) {
        console.error("Backend Error Accepting Booking:", error);
        res.status(500).json({ error: 'Server error while accepting booking' });
    }
});

// ✅ Student Marks Session as Done / Deletes it
app.delete('/api/deleteBookingStudent/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can delete' });
        }
        
        const deletedBooking = await Booking.findOneAndDelete({ 
            _id: req.params.id, 
            studentId: req.user.userId 
        });

        if (!deletedBooking) {
            return res.status(404).json({ error: 'Booking not found or already deleted' });
        }

        res.json({ success: true, message: 'Session marked as Done!' });
    } catch (error) {
        console.error("Backend Error Deleting Booking:", error);
        res.status(500).json({ error: 'Server error while deleting booking' });
    }
});

// 2. Student Fetches their Latest Mentor Feedback
app.get('/api/getLatestFeedback', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can view this' });
        const feedback = await MentorEvaluation.findOne({ studentId: req.user.userId }).sort({ createdAt: -1 });
        
        if (feedback) res.json({ success: true, feedback });
        else res.json({ success: false, message: 'No evaluations yet.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
});

// 3. Mentor Fetches their Assigned Bookings (IMPROVED MATCHING)
app.get('/api/getMentorBookings', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'mentor') {
            return res.status(403).json({ error: 'Only mentors can view bookings' });
        }
        
        // 1. Get the current mentor's name from the DB
        const mentor = await User.findById(req.user.userId);
        if (!mentor) return res.status(404).json({ error: "Mentor not found" });

        // 2. Use a Case-Insensitive and Trimmed search
        // This handles "Nisha Sharma" vs "nisha sharma" vs " Nisha Sharma "
        const mentorNameRegex = new RegExp(`^\\s*${mentor.name.trim()}\\s*$`, 'i');
        
        const bookings = await Booking.find({ 
            mentorName: mentorNameRegex 
        }).sort({ date: 1 });

        console.log(`🔍 Found ${bookings.length} bookings for mentor: ${mentor.name}`);
        res.json({ success: true, bookings });
        
    } catch (error) {
        console.error("Error in getMentorBookings:", error);
        res.status(500).json({ error: 'Failed to fetch mentor bookings' });
    }
});

// 4. Mentor Completes Session & Awards Stars
app.post('/api/completeSession', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'mentor') return res.status(403).json({ error: 'Only mentors can evaluate' });
        
        const mentor = await User.findById(req.user.userId);
        const student = await User.findOne({ name: req.body.studentName, role: 'student' });
        
        const newEval = new MentorEvaluation({
            studentId: student ? student._id : null,
            studentName: req.body.studentName,
            mentorName: mentor.name,
            stars: req.body.stars,
            notes: req.body.notes
        });
        
        await newEval.save();

        // Optional: Remove the booking after evaluating so it clears from the mentor's schedule
        await Booking.findOneAndDelete({ mentorName: mentor.name, studentName: req.body.studentName });

        res.json({ success: true, message: 'Evaluation sent to student!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save evaluation' });
    }
});

// 5. Student Fetches their own Bookings
app.get('/api/getStudentBookings', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can view their bookings' });
        
        // Fetch bookings where the studentId matches the logged-in student
        const bookings = await Booking.find({ studentId: req.user.userId }).sort({ date: 1 });
        res.json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch student bookings' });
    }
});



// --- MULTER FILE UPLOAD SETUP ---
// 1. Make sure the "public/uploads" folder exists
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Tell Multer where to save files and how to name them
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Save to public/uploads/
    },
    filename: function (req, file, cb) {
        // Give the file a unique name so images don't overwrite each other
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'artwork-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage });



// ==========================================
// --- MY WORK / ARTWORK ROUTES ---
// ==========================================

// 1. Upload a new image
app.post('/api/uploadWork', verifyToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

        // The image is saved in public/uploads. We store the web path in the DB.
        const imageUrl = '/uploads/' + req.file.filename;

        const newWork = new Work({
            studentId: req.user.userId,
            imageUrl: imageUrl
        });
        
        await newWork.save();
        res.json({ success: true, work: newWork });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// 2. Get the logged-in student's artwork
app.get('/api/getMyWork', verifyToken, async (req, res) => {
    try {
        // Fetch only the artwork uploaded by this specific student
        const works = await Work.find({ studentId: req.user.userId }).sort({ createdAt: -1 });
        res.json({ success: true, works });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch works' });
    }
});

// 3. Delete an artwork
app.delete('/api/deleteWork/:id', verifyToken, async (req, res) => {
    try {
        const work = await Work.findOne({ _id: req.params.id, studentId: req.user.userId });
        if (!work) return res.status(404).json({ error: 'Work not found' });

        // Bonus: Delete the actual image file from your computer's hard drive!
        const filePath = path.join(__dirname, 'public', work.imageUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from Database
        await Work.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete work' });
    }
});



// ✅ NEW: Admin Route to get Mentors and their Students
app.get('/api/admin/mentors-info', verifyToken, async (req, res) => {
    try {
        // Strict Admin Security Check
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        // 1. Find all users who are mentors
        const mentors = await User.find({ role: 'mentor' }).select('name email condition');

        // 2. For each mentor, find all students who have booked them
        const mentorStats = await Promise.all(mentors.map(async (mentor) => {
            // Find bookings matching this mentor's exact name
            const bookings = await Booking.find({ mentorName: mentor.name })
                                          .select('studentName date time status bookingType')
                                          .sort({ date: -1 }); // Newest first
            
            return {
                id: mentor._id,
                name: mentor.name,
                email: mentor.email,
                condition: mentor.condition,
                studentBookings: bookings
            };
        }));

        res.json({ success: true, mentors: mentorStats });
    } catch (error) {
        console.error("Error fetching mentor stats:", error);
        res.status(500).json({ error: 'Server error' });
    }
});



// ==========================================
// --- PUBLIC CONTACT ROUTES ---
// ==========================================

// 1. Save a new contact message (Public - Anyone can use this)
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        
        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error("Contact form error:", error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// ==========================================
// --- ADMIN MESSAGE ROUTES ---
// ==========================================

// 2. Fetch all messages (Admin Only)
app.get('/api/admin/messages', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied. Admins only.' });
        
        // Fetch newest messages first
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. Delete a message (Admin Only)
app.delete('/api/admin/messages/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied. Admins only.' });
        
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Message deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});



// ==========================================
// --- REGISTRATION ROUTES ---
// ==========================================

// 1. Submit Registration Form (Public)
app.post('/api/submitRegistration', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'medicalReport', maxCount: 1 }]), async (req, res) => {
    try {
        const data = req.body;
        
        // Handle files if they were uploaded
        const photoUrl = req.files['photo'] ? '/uploads/' + req.files['photo'][0].filename : null;
        const medicalReportUrl = req.files['medicalReport'] ? '/uploads/' + req.files['medicalReport'][0].filename : null;

        const newRegistration = new Registration({
            ...data,
            // Ensure checkboxes are saved as arrays even if only one is selected
            interests: Array.isArray(data.interests) ? data.interests : (data.interests ? [data.interests] : []),
            therapy: Array.isArray(data.therapy) ? data.therapy : (data.therapy ? [data.therapy] : []),
            photoUrl: photoUrl,
            medicalReportUrl: medicalReportUrl
        });

        await newRegistration.save();
        res.json({ success: true, message: 'Registration submitted successfully!' });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: 'Failed to submit registration' });
    }
});

// 2. Get All Registrations (Admin Only)
app.get('/api/admin/registrations', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }
        
        const registrations = await Registration.find().sort({ createdAt: -1 });
        res.json({ success: true, registrations });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch registrations' });
    }
});


// --- START SERVER (Always put this at the very bottom) ---
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));