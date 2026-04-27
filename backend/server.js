const express = require("express")
const cors = require("cors")
const OpenAI = require("openai")

const app = express()

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ai-talent-agent-bmgfn4ua8-mehtab-alams-projects-b6c495d4.vercel.app"
  ]
}))

app.use(express.json())

const openai = new OpenAI({
  apiKey: "secret_key"
})

const candidates = require("./candidates.json")

// 🔥 AI JD PARSER
async function parseJDWithAI(jd) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Extract structured data from job descriptions."
        },
        {
          role: "user",
          content: `
Extract skills and experience from this JD:

"${jd}"

Return ONLY JSON in this format:
{
  "skills": ["React", "Node.js"],
  "experience": number
}
`
        }
      ],
      temperature: 0
    })

    const text = completion.choices[0].message.content

    return JSON.parse(text.replace(/```json|```/g, "").trim())
  } catch (err) {
    console.error("AI parsing failed, fallback used")

    // fallback (your old logic)
    const lower = jd.toLowerCase()
    const skills = []

    if (lower.includes("node")) skills.push("Node.js")
    if (lower.includes("mongo")) skills.push("MongoDB")
    if (lower.includes("react")) skills.push("React")
    if (lower.includes("python")) skills.push("Python")

    return {
      skills,
      experience: jd.includes("2") ? 2 : 1
    }
  }
}

// 🔥 MATCH API
app.post("/match", async (req, res) => {
  const { jd } = req.body

  const jdData = await parseJDWithAI(jd)

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

// 🔥 AI CHAT
app.post("/chat", async (req, res) => {
  const { message, candidateId } = req.body

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are a job candidate chatting with a recruiter.

- Respond naturally like a human
- Keep answers short
- Sometimes show interest, sometimes not
- Be realistic
`
        },
        {
          role: "user",
          content: message
        }
      ]
    })

    const reply = completion.choices[0].message.content

    // simple AI-like interest scoring
    let interestScore = 50

    if (reply.toLowerCase().includes("yes")) interestScore = 85
    else if (reply.toLowerCase().includes("maybe")) interestScore = 60
    else if (reply.toLowerCase().includes("not")) interestScore = 25

    res.json({ reply, interestScore })

  } catch (err) {
    console.error("AI chat failed:", err)

    res.json({
      reply: "Sorry, something went wrong.",
      interestScore: 50
    })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on ${PORT}`))