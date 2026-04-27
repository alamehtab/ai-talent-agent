const express = require("express")
const cors = require("cors")

const app = express()
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ai-talent-agent-bmgfn4ua8-mehtab-alams-projects-b6c495d4.vercel.app"
  ]
}))
app.use(express.json())

const candidates = require("./candidates.json")

function parseJD(jd) {
  const skills = []

  const lower = jd.toLowerCase()

  if (lower.includes("node")) skills.push("Node.js")
  if (lower.includes("mongo")) skills.push("MongoDB")
  if (lower.includes("react")) skills.push("React")
  if (lower.includes("python")) skills.push("Python")

  return {
    skills,
    experience: jd.includes("2") ? 2 : 1,
  }
}

function calculateMatch(candidate, jdData) {
  let skillMatch = 0

  jdData.skills.forEach((skill) => {
    if (candidate.skills.includes(skill)) {
      skillMatch++
    }
  })

  const skillScore =
    jdData.skills.length > 0
      ? (skillMatch / jdData.skills.length) * 70
      : 0

  const expScore = candidate.experience >= jdData.experience ? 30 : 10

  return Math.round(skillScore + expScore)
}

app.post("/match", (req, res) => {
  const { jd } = req.body

  const jdData = parseJD(jd)

  const results = candidates.map((c) => {
    let skillMatch = 0
    const explanation = []

    jdData.skills.forEach((skill) => {
      if (c.skills.includes(skill)) {
        skillMatch++
        explanation.push(`✔ Has ${skill}`)
      } else {
        explanation.push(`✖ Missing ${skill}`)
      }
    })

    if (c.experience >= jdData.experience) {
      explanation.push("✔ Experience matches")
    } else {
      explanation.push("✖ Less experience")
    }

    const skillScore =
      jdData.skills.length > 0
        ? (skillMatch / jdData.skills.length) * 70
        : 0

    const expScore = c.experience >= jdData.experience ? 30 : 10

    const matchScore = Math.round(skillScore + expScore)

    return {
      ...c,
      match: matchScore,
      interest: 50,
      explanation,
    }
  })

  const sorted = results.sort(
    (a, b) =>
      (b.match * 0.6 + b.interest * 0.4) -
      (a.match * 0.6 + a.interest * 0.4)
  )

  res.json({
    candidates: sorted,
    parsedJD: jdData,
  })
})

app.post("/chat", (req, res) => {
  const { message } = req.body
  const msg = message.toLowerCase()

  let reply = ""
  let interestScore = 50

  if (msg.includes("open") || msg.includes("availability")) {
    const rand = Math.random()

    if (rand > 0.6) {
      reply = "Yes, I am open to new opportunities."
      interestScore = 85
    } else if (rand > 0.3) {
      reply = "Not actively looking, but open to good roles."
      interestScore = 65
    } else {
      reply = "Currently not looking to switch."
      interestScore = 30
    }
  }

  else if (msg.includes("interested")) {
    const rand = Math.random()

    if (rand > 0.6) {
      reply = "Yes, I am interested in this role."
      interestScore = 90
    } else if (rand > 0.3) {
      reply = "Maybe, can you share more details?"
      interestScore = 60
    } else {
      reply = "Not interested currently."
      interestScore = 20
    }
  }

  else if (msg.includes("call")) {
    reply = "Sure, we can schedule a call."
    interestScore = 80
  }

  else {
    reply = "Can you tell me more about the role?"
    interestScore = 50
  }

  res.json({ reply, interestScore })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on ${PORT}`))