function matchCandidates(candidates, jdData) {
  return candidates.map(candidate => {
    const matchedSkills = candidate.skills.filter(skill =>
      jdData.skills.includes(skill)
    )

    const skillScore = (matchedSkills.length / jdData.skills.length) * 70
    const expScore = candidate.experience >= jdData.experience ? 30 : 10

    return {
      ...candidate,
      matchedSkills,
      matchScore: Math.round(skillScore + expScore)
    }
  })
}

module.exports = matchCandidates