# 🤝 HelpingHands | Personalized Virtual Reality Learning for Special Students

**HelpingHands** is a full-stack educational web application built to provide tailored, accessible support for neurodiverse students—specifically those with Autism, Down Syndrome, and Dyslexia. The platform seamlessly connects students with specialized mentors through adaptive interfaces and features an integrated AI-driven video call system for real-time emotional and educational support.

---

## ✨ Key Features

*   **Adaptive Dashboards:** Personalized UI/UX environments dynamically adjusted based on the student's specific cognitive profile.
*   **AI Video Mentoring:** Real-time AI interaction utilizing the **Web Speech API** for seamless Speech-to-Text (STT) and Text-to-Speech (TTS) communication.
*   **Secure Booking System:** An intuitive scheduling interface allowing students to book sessions with specialized mentors matching their exact needs.
*   **Gamified Progress Tracking:** A rewarding evaluation system where mentors award 'Star Ratings' and constructive notes after completing a session.
*   **Comprehensive Admin Hub:** A centralized control panel for managing user registrations, monitoring contact messages, and tracking overall student performance.

---

## 🛠️ Tech Stack

*   **Frontend:** HTML5, CSS3, JavaScript (Vanilla UI architecture)
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB
*   **Security & Auth:** JSON Web Tokens (JWT) & Bcrypt.js
*   **Real-Time Integrations:** Web Speech API (Browser-native) & Jitsi Meet WebRTC (Video Streaming)

---

## 📊 System Architecture & Flow

The flowchart below illustrates the role-based routing (Student, Mentor, Admin) and the internal logic of the AI session loop:

![System Flowchart](https://raw.githubusercontent.com/Heetakshi20/HelpingHands-Special-Needs-Platform/main/system-flowchart.png)

---

## 🚀 Getting Started (Local Setup)

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
*   [Node.js](https://nodejs.org/) installed on your machine.
*   A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or a local MongoDB instance).
