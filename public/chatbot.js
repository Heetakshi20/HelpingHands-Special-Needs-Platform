const studentName = "Student"; 
let greeted = false; // track greeting

window.addEventListener("load", function () {
  greetUser();
});

function greetUser() {
  if (!greeted) {
    const chatBody = document.getElementById("chat-body");
    document.getElementById("chat-box").style.display = "flex";
    chatBody.innerHTML += `<div class="message bot"><b>Bot:</b> Hi ${studentName}! How can I help you today with HelpingHands or your childs future?</div>`;
    greeted = true;
  }
}

function toggleChat() {
  const chatBox = document.getElementById("chat-box");
  chatBox.style.display = (chatBox.style.display === "none") ? "flex" : "none";
  
  // Greeting if not done yet
  greetUser();
}

function toggleChat() {
  const chatBox = document.getElementById("chat-box");
  const chatBody = document.getElementById("chat-body");
  chatBox.style.display = (chatBox.style.display === "none") ? "flex" : "none";

  if (isFirstClick) {
    chatBody.innerHTML += `<div class="message bot"><b>Bot:</b> HelpingHands virtual assistant. Ask me anything related to kids, studies, courses, or skill-building!</div>`;
    chatBody.scrollTop = chatBody.scrollHeight;
    isFirstClick = false;
  }
}

function handleKey(event) {
  if (event.key === "Enter") {
    const input = document.getElementById("user-input");
    const msg = input.value.trim();
    if (!msg) return;

    const chatBody = document.getElementById("chat-body");
    chatBody.innerHTML += `<div class="message user"><b>You:</b> ${msg}</div>`;

    const response = getResponse(msg.toLowerCase());
    chatBody.innerHTML += `<div class="message bot"><b>Bot:</b> ${response}</div>`;

    input.value = "";
    chatBody.scrollTop = chatBody.scrollHeight;
  }
}

function getResponse(msg) {
  msg = msg.toLowerCase();

  // ===== Kids Mode =====

  if (msg.includes("career guidance")) {
  return "🎯 I can help you explore career paths based on your interests and skills. Tell me your favorite subject or skill area.";
}

if (msg.includes("data analyst")) {
  return "📊 To become a Data Analyst, learn Excel, SQL, Python, and Power BI. Build strong projects.";
}

if (msg.includes("assignment")) {
  return "📝 Break your assignment into small tasks and start with the easiest part.";
}

if (msg.includes("blog")) {
  return "✍️ Posting blogs builds your personal brand and improves communication skills.";
}

if (msg.includes("stories")) {
  return "👀 Watch Bright-Minds success stories for motivation and guidance.";
}

if (msg.includes("mentor") || msg.includes("doubt")) {
  return "❓ You can connect with your mentor through the dashboard for guidance.";
}

if (msg.includes("i feel lazy")) {
    return "💪 Small steps matter! Study for just 25 minutes using the Pomodoro technique. Progress > Perfection.";
  }

  if (msg.includes("remind me to study")) {
    return "📚 Sure! Set a fixed study time daily. Consistency builds success.";
  }

  // 📝 Assignments
  if (msg.includes("i have assignment pending")) {
    return "📝 Break it into smaller tasks and start with the easiest part. Completing one section builds momentum.";
  }

  // ✍️ Blog / Portfolio
  if (msg.includes("why should i post blog")) {
    return "✍️ Writing blogs improves your communication skills and builds your personal brand. Recruiters love candidates who share knowledge.";
  }

  if (msg.includes("how to improve resume")) {
    return "📄 Customize your resume for each job. Highlight skills, tools, and measurable achievements.";
  }

  // 👀 Watch Stories
  if (msg.includes("what are stories")) {
    return "👀 Bright-Minds Stories showcase student success journeys. Watching them can inspire and guide your career path.";
  }

  // ❓ Ask Mentor
  if (msg.includes("i have doubts")) {
    return "❓ Great! Asking doubts shows growth mindset. You can connect with your mentor through the dashboard.";
  }

  // 📊 Skill Tracking
  if (msg.includes("check my progress")) {
    return "📊 You’ve completed 3 learning modules and 2 practice assignments this week. Keep going!";
  }

  // 🚀 Motivation
  if (msg.includes("i feel confused about career")) {
    return "🤔 It’s normal to feel confused. Let’s start with your strengths. What subjects or activities excite you the most?";
  }

  // 💼 Jobs & Internships
  if (msg.includes("how to get internship")) {
    return "💼 Build projects, update LinkedIn, apply on Internshala / LinkedIn, and customize your resume for each role.";
  }

  // 🧠 AI Feature
  if (msg.includes("how does bright minds work")) {
    return "🧠 Bright-Minds analyzes your interests, skills, and goals to recommend personalized career pathways and learning resources.";
  }



  // ===== Default fallback =====
  return "🤗 I can help you learn 📚, play 🎲, read stories 📖, or sing songs 🎵. What would you like to do today?";
}