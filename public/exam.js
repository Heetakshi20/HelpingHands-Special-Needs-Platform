let currentQuestion = 0;
let score = 0;
let selectedClass = "";

// 1. Grab secure credentials from localStorage
const token = localStorage.getItem('token');
const studentName = localStorage.getItem('userName');

// 2. Security Check & Setup
if (!token) {
    alert("You must be logged in to take an exam!");
    window.location.href = "login.html"; // Kick out unauthorized users
} else {
    // Set the name instantly from local storage (no need for a separate fetch call!)
    document.getElementById("studentName").innerText = "👩‍🎓 Student: " + studentName;
}

// QUESTIONS DATABASE (Kept exactly as you wrote it)
const examData = {
    LKG: [
        {question:"Choose letter A 😊", options:["A","B","C"], answer:"A"},
        {question:"1 + 1 = ? ➕", options:["1","2","3"], answer:"2"},
        {question:"What comes after 3? 🔢", options:["2","3","4"], answer:"4"},
        {question:"Choose letter B 🅱️", options:["A","B","D"], answer:"B"},
        {question:"2 + 1 = ?", options:["2","3","4"], answer:"3"},
        {question:"Identify number 5️⃣", options:["3","5","7"], answer:"5"},
        {question:"Choose letter C 🐱", options:["C","D","E"], answer:"C"},
        {question:"3 + 1 = ?", options:["3","4","5"], answer:"4"},
        {question:"Which is number 2?", options:["1","2","4"], answer:"2"},
        {question:"Choose letter D 🐶", options:["A","D","F"], answer:"D"}
    ],
    UKG: [
        {question:"A for ? 🍎", options:["Apple","Ball","Cat"], answer:"Apple"},
        {question:"2 + 2 = ?", options:["3","4","5"], answer:"4"},
        {question:"B for ? ⚽", options:["Ball","Dog","Fish"], answer:"Ball"},
        {question:"3 + 2 = ?", options:["4","5","6"], answer:"5"},
        {question:"Which is number 6?", options:["6","4","3"], answer:"6"},
        {question:"C for ?", options:["Cat","Hat","Rat"], answer:"Cat"},
        {question:"5 + 1 = ?", options:["6","7","8"], answer:"6"},
        {question:"Which letter comes after A?", options:["B","C","D"], answer:"B"},
        {question:"4 + 1 = ?", options:["4","5","6"], answer:"5"},
        {question:"D for ?", options:["Dog","Egg","Fan"], answer:"Dog"}
    ],
    Class1: [
        {question:"5 + 3 = ?", options:["7","8","9"], answer:"8"},
        {question:"Opposite of BIG", options:["Small","Tall","Fat"], answer:"Small"},
        {question:"7 + 2 = ?", options:["8","9","10"], answer:"9"},
        {question:"Plural of Cat", options:["Cats","Cates","Catss"], answer:"Cats"},
        {question:"10 - 3 = ?", options:["6","7","8"], answer:"7"},
        {question:"Sun rises in ?", options:["East","West","North"], answer:"East"},
        {question:"6 + 4 = ?", options:["9","10","11"], answer:"10"},
        {question:"Which is a fruit?", options:["Car","Chair","Apple"], answer:"Apple"},
        {question:"9 - 5 = ?", options:["3","4","5"], answer:"4"},
        {question:"Color of sky?", options:["Blue","Green","Red"], answer:"Blue"}
    ],
    Class2: [
        {question:"12 + 5 = ?", options:["17","16","18"], answer:"17"},
        {question:"Opposite of HOT", options:["Warm", "Cold","Cool"], answer:"Cold"},
        {question:"15 - 5 = ?", options:["10","9","8"], answer:"10"},
        {question:"Plural of Boy", options:["Boyes","Boies", "Boys"], answer:"Boys"},
        {question:"20 - 7 = ?", options:["13","12","14"], answer:"13"},
        {question:"Which is an animal?", options:["Tiger","Table","Bag"], answer:"Tiger"},
        {question:"8 + 9 = ?", options:["17","18","16"], answer:"17"},
        {question:"Capital letter of a?", options:["A","B","C"], answer:"A"},
        {question:"30 - 10 = ?", options:["2","21","20"], answer:"20"},
        {question:"Which is a vegetable?", options:["Ball","Carrot","Pen"], answer:"Carrot"}
    ],
    Class3: [
        {question:"5 × 2 = ?", options:["10","8","12"], answer:"10"},
        {question:"Synonym of HAPPY", options:["Joyful","Sad","Angry"], answer:"Joyful"},
        {question:"12 ÷ 3 = ?", options:["3","4","5"], answer:"4"},
        {question:"Opposite of FAST", options:["Slow","Quick","Speed"], answer:"Slow"},
        {question:"9 × 3 = ?", options:["27","21","24"], answer:"27"},
        {question:"Plural of Child", options:["Children","Childs","Childes"], answer:"Children"},
        {question:"15 ÷ 5 = ?", options:["2","3","4"], answer:"3"},
        {question:"Which is a noun?", options:["Dog","Run","Quickly"], answer:"Dog"},
        {question:"7 × 4 = ?", options:["28","24","32"], answer:"28"},
        {question:"Opposite of UP", options:["Down","Over","Under"], answer:"Down"}
    ],
    Class4: [
        {question:"25 + 15 = ?", options:["40","35","45"], answer:"40"},
        {question:"Opposite of BRAVE", options:["Coward","Strong","Bold"], answer:"Coward"},
        {question:"30 ÷ 5 = ?", options:["6","5","7"], answer:"6"},
        {question:"Synonym of QUICK", options:["Fast","Slow","Late"], answer:"Fast"},
        {question:"9 × 6 = ?", options:["54","45","48"], answer:"54"},
        {question:"Plural of Leaf", options:["Leaves","Leafs","Leavs"], answer:"Leaves"},
        {question:"50 - 20 = ?", options:["30","25","35"], answer:"30"},
        {question:"Which is a verb?", options:["Run","Ball","Tree"], answer:"Run"},
        {question:"8 × 7 = ?", options:["56","49","63"], answer:"56"},
        {question:"Opposite of LIGHT", options:["Dark","Bright","Glow"], answer:"Dark"}
    ]
}

// START EXAM
function startExam(className){
    selectedClass = className;
    currentQuestion = 0;
    score = 0;
    document.getElementById("classSelection").style.display = "none";
    document.getElementById("quiz-container").style.display = "block";
    loadQuestion();
}

// LOAD QUESTION
function loadQuestion(){
    let questions = examData[selectedClass];
    if(!questions){ return; }

    let q = questions[currentQuestion];
    document.getElementById("question").innerText = "Q"+(currentQuestion+1)+": "+q.question;
    
    let optionsHTML = "";
    q.options.forEach(option => {
        optionsHTML += `<button onclick="checkAnswer('${option}')">${option}</button><br><br>`;
    });
    document.getElementById("options").innerHTML = optionsHTML;
}

// CHECK ANSWER
function checkAnswer(selected){
    let correct = examData[selectedClass][currentQuestion].answer;
    if(selected === correct){ score++; }
    currentQuestion++;

    if(currentQuestion < 10){
        loadQuestion();
    } else {
        finishExam();
    }
}

// FINISH EXAM & SUBMIT TO SECURE BACKEND
async function finishExam(){
    document.getElementById("quiz-container").style.display="none";
    document.getElementById("result").style.display="block";
    document.getElementById("scoreText").innerText = "🎉 Your Score: " + score + " / 10";

    try {
        // ADDED AUTHORIZATION HEADER HERE
        const response = await fetch("/api/submitExam", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // <--- THIS WAS MISSING!
            },
            body: JSON.stringify({
                score: score,
                total: 10,
                className: selectedClass
            })
        });

        const data = await response.json();
        
        if (data.success) {
            console.log("✅ Exam saved successfully:", data);
        } else {
            console.error("❌ Failed to save exam:", data.error);
        }

    } catch (err) {
        console.error("❌ Connection error:", err);
    }
}