function finalScore(matchScore, interestScore) {
  return Math.round((matchScore + interestScore) / 2)
}

module.exports = finalScore