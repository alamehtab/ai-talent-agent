function simulateInterest(candidate) {
  const responses = [
    "Yes, I am interested",
    "Maybe, depends on salary",
    "Not interested"
  ]

  const random = responses[Math.floor(Math.random() * responses.length)]

  let score = 0
  if (random.includes("Yes")) score = 90
  else if (random.includes("Maybe")) score = 50
  else score = 10

  return {
    response: random,
    interestScore: score
  }
}

module.exports = simulateInterest