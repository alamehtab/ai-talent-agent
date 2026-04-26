# 🚀 Talent Agent – AI-Powered Candidate Matching & Chat System

An intelligent recruitment assistant that helps recruiters find the best candidates from a pool and interact with them using AI-driven conversations.

---

## ✨ Features

* 🔍 **Job Description Parsing**

  * Extracts skills and experience from JD
* 🎯 **Smart Candidate Matching**

  * Match score based on relevance to JD
* 💬 **AI Chat with Candidates**

  * Simulates real candidate responses
* 📊 **Dynamic Interest Scoring**

  * Candidate interest updates based on conversation
* ⚡ **Quick Recruiter Actions**

  * Ask availability, gauge interest, schedule calls
* 🎨 **Clean & Minimal UI**

  * Responsive card-based layout

---

## 🧠 How It Works

1. Paste a Job Description
2. System extracts:

   * Required skills
   * Experience level
3. Candidates are ranked based on match score
4. Recruiter can initiate chat
5. AI simulates candidate responses
6. Interest score updates dynamically

---

## 🛠 Tech Stack

### Frontend

* React.js (Hooks)
* Axios
* Inline CSS (Custom UI)

### Backend

* Node.js
* Express.js
* AI logic for:

  * JD parsing
  * Candidate matching
  * Chat simulation

---

## 📸 Screenshots

> Add screenshots here (important for portfolio)

* Candidate Cards UI
* Chat Interface
* JD Parsing Output

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/talent-agent.git
cd talent-agent
```

### 2. Install dependencies

#### Frontend

```bash
npm install
npm run dev
```

#### Backend

```bash
cd backend
npm install
node server.js
```

---

## 🔌 API Endpoints

### POST /match

* Input: Job Description
* Output: Matched candidates + parsed JD

### POST /chat

* Input: Candidate ID + Message
* Output: AI reply + updated interest score

---

## 💡 Future Improvements

* ⭐ Save / shortlist candidates
* 🧠 Context-aware AI conversations
* 📈 Advanced ranking algorithm
* 💾 Persistent database integration
* 🔔 Real-time notifications

---

## 👨‍💻 Author

**Mehtab Alam**

* Passionate Full Stack Developer
* Focused on building scalable and intelligent web applications

---

## 📌 Note

This project is a simulation of an AI-powered recruitment system and is intended for learning and demonstration purposes.
