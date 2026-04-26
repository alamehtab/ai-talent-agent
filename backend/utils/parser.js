function parseJD(jd) {
  const text = jd.toLowerCase()

  // 🔹 Skills list (you can expand)
  const skillPool = [
    "react", "node", "mongodb", "express",
    "python", "django", "aws", "docker",
    "kubernetes", "java", "sql"
  ]

  const skills = skillPool.filter(skill => text.includes(skill))

  // 🔹 Experience extraction (simple regex)
  const expMatch = text.match(/(\d+)\+?\s*(years|yrs)/)
  const experience = expMatch ? parseInt(expMatch[1]) : 0

  return {
    skills,
    experience
  }
}

module.exports = parseJD