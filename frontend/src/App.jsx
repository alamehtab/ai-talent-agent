

import axios from "axios"
import { useState, useRef, useEffect } from "react"

const AVATARS = [
  { bg: "#E6F1FB", color: "#0C447C" },
  { bg: "#EAF3DE", color: "#27500A" },
  { bg: "#FAEEDA", color: "#633806" },
  { bg: "#FBEAF0", color: "#72243E" },
  { bg: "#E1F5EE", color: "#085041" },
]

function initials(name = "") {
  return name
    ?.split(" ")
    ?.map((w) => w[0])
    ?.join("")
    ?.slice(0, 2)
    ?.toUpperCase() || "NA"
}

function avatarFor(idx) {
  return AVATARS[idx % AVATARS.length]
}

function finalScore(match = 0, interest = 0) {
  return Math.round((match || 0) * 0.6 + (interest || 0) * 0.4)
}

function barColor(v = 0) {
  if (v >= 85) return "#639922"
  if (v >= 70) return "#185FA5"
  return "#BA7517"
}

function ScoreBar({ label, value = 0 }) {
  const safeValue = Math.max(0, Math.min(100, value))

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
      <span style={{ fontSize: 11, color: "#888", minWidth: 44 }}>{label}</span>
      <div style={{ flex: 1, height: 4, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
        <div
          style={{
            width: `${safeValue}%`,
            height: "100%",
            background: barColor(safeValue),
            borderRadius: 4,
            transition: "width 0.6s ease",
          }}
        />
      </div>
      <span style={{ fontSize: 11, fontWeight: 500, color: "#555", minWidth: 28, textAlign: "right" }}>
        {safeValue}%
      </span>
    </div>
  )
}

function CandidateCard({ candidate, idx, onChat }) {
  const av = avatarFor(idx)
  const fs = finalScore(candidate.match, candidate.interest)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        background: "#fff",
        border: `0.5px solid ${hovered ? "#aaa" : "#e0e0e0"}`,
        borderRadius: 12,
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: av.bg,
          color: av.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: "0.75rem",
        }}
      >
        {initials(candidate.name)}
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 2 }}>
        {candidate.name}
      </div>

      {candidate.role && (
        <div style={{ fontSize: 12, color: "#888", marginBottom: "0.75rem" }}>
          {candidate.role}
        </div>
      )}

      <div style={{ marginBottom: "0.75rem" }}>
        <ScoreBar label="Match" value={candidate.match} />
        <ScoreBar label="Interest" value={candidate.interest} />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "0.5rem",
          borderTop: "0.5px solid #ececec",
          marginBottom: "0.75rem",
        }}
      >
        <span style={{ fontSize: 11, color: "#666", fontWeight: 500 }}>Final score</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#185FA5" }}>{fs}%</span>
      </div>

      {candidate.skills && candidate.skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: "0.75rem" }}>
          {candidate.skills.map((s) => (
            <span
              key={s}
              style={{
                fontSize: 10,
                padding: "2px 8px",
                background: "#f4f4f4",
                color: "#555",
                borderRadius: 20,
                fontWeight: 500,
              }}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {candidate.explanation && (
        <div style={{ marginBottom: "0.75rem" }}>
          {candidate.explanation.map((line, i) => (
            <div
              key={i}
              style={{
                fontSize: 11,
                color: line.startsWith("✔") ? "#639922" : "#BA7517",
              }}
            >
              {line}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => onChat(candidate, idx)}
        style={{
          width: "100%",
          background: "#E6F1FB",
          color: "#0C447C",
          border: "0.5px solid #B5D4F4",
          borderRadius: 8,
          padding: "7px 12px",
          fontFamily: "inherit",
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
          transition: "background 0.15s",
          marginTop: "auto",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#B5D4F4")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#E6F1FB")}
      >
        Open chat
      </button>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        alignItems: "center",
        padding: "6px 10px",
        background: "#f4f4f4",
        borderRadius: 12,
        borderBottomLeftRadius: 3,
        width: "fit-content",
      }}
    >
      {[0, 0.2, 0.4].map((delay, i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#aaa",
            animation: "blink 1.2s infinite",
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  )
}

function ChatPanel({ candidate, idx, onClose, updateCandidate }) {
  const [messages, setMessages] = useState([])
  const [typing, setTyping] = useState(false)
  const [chatEnded, setChatEnded] = useState(false)
  const messagesEndRef = useRef(null)
  const av = avatarFor(idx)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typing])

  useEffect(() => {
    setMessages([{ sender: "candidate", text: "Hi! Happy to connect." }])
    setChatEnded(false)
  }, [candidate.id])

  const sendMsg = async (text) => {
    if (typing || chatEnded) return

    setMessages((prev) => [...prev, { sender: "recruiter", text }])
    setTyping(true)

    try {
      const res = await axios.post("http://localhost:5000/chat", {
        candidateId: candidate.id,
        message: text,
      })

      const reply = res?.data?.reply || "Okay 👍"
      const interestScore = res?.data?.interestScore ?? candidate.interest ?? 50

      const lower = reply.toLowerCase()

      const isRejected =
        interestScore <= 30 ||
        lower.includes("not interested") ||
        lower.includes("not looking") ||
        lower.includes("no thanks")

      setMessages((prev) => [...prev, { sender: "candidate", text: reply }])

      updateCandidate(candidate.id, interestScore)

      if (isRejected) {
        setChatEnded(true)
        setMessages((prev) => [
          ...prev,
          { sender: "system", text: "❌ Candidate not interested. Chat ended." },
        ])
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "candidate", text: "⚠️ Failed to get a response." },
      ])
    }

    setTyping(false)
  }

  const QUICK_ACTIONS = [
    { label: "Ask availability", msg: "Hi! Are you open to new opportunities?" },
    { label: "Gauge interest", msg: "Would you be interested in this role?" },
    { label: "Request call", msg: "Can we schedule a quick call?" },
  ]

  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid #e0e0e0",
        borderRadius: 12,
        overflow: "hidden",
        marginTop: "1rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.875rem 1rem",
          borderBottom: "0.5px solid #ececec",
          background: "#fafafa",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: av.bg,
              color: av.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {initials(candidate.name)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
              {candidate.name}
            </span>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#639922",
                display: "inline-block",
              }}
            />
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "0.5px solid #e0e0e0",
            borderRadius: 8,
            padding: "4px 12px",
            fontSize: 12,
            color: "#666",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          Close
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          height: 200,
          overflowY: "auto",
          padding: "0.875rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#bbb", fontSize: 13, margin: "auto" }}>
            Start the conversation below
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent:
                msg.sender === "recruiter"
                  ? "flex-end"
                  : msg.sender === "system"
                    ? "center"
                    : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "78%",
                padding: "7px 12px",
                borderRadius: 12,
                fontSize: 13,
                lineHeight: 1.5,

                ...(msg.sender === "recruiter"
                  ? { background: "#185FA5", color: "#fff" }
                  : msg.sender === "system"
                    ? {
                      background: "#ffecec",
                      color: "#a33",
                      border: "0.5px solid #f5c2c2",
                      fontWeight: 500,
                    }
                    : { background: "#f4f4f4", color: "#1a1a1a" }),
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "0.75rem 1rem",
          borderTop: "0.5px solid #ececec",
          background: "#fafafa",
          flexWrap: "wrap",
        }}
      >
        {QUICK_ACTIONS.map(({ label, msg }) => (
          <button
            key={label}
            onClick={() => sendMsg(msg)}
            disabled={typing || chatEnded}
            style={{
              flex: 1,
              minWidth: 100,
              background: "#fff",
              border: "0.5px solid #e0e0e0",
              borderRadius: 8,
              padding: "7px 10px",
              fontFamily: "inherit",
              fontSize: 12,
              color: "#555",
              opacity: typing || chatEnded ? 0.5 : 1,
              cursor: typing || chatEnded ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!typing) {
                e.currentTarget.style.borderColor = "#378ADD"
                e.currentTarget.style.color = "#185FA5"
                e.currentTarget.style.background = "#E6F1FB"
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e0e0e0"
              e.currentTarget.style.color = "#555"
              e.currentTarget.style.background = "#fff"
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [jd, setJd] = useState("")
  const [candidates, setCandidates] = useState(null)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [selectedIdx, setSelectedIdx] = useState(null)
  const [loading, setLoading] = useState(false)
  const [parsedJD, setParsedJD] = useState(null)

  const handleSearch = async () => {
    if (!jd.trim()) return
    setLoading(true)
    setSelectedCandidate(null)

    try {
      const res = await axios.post("http://localhost:5000/match", { jd })
      setCandidates(res?.data?.candidates || [])
      setParsedJD(res?.data?.parsedJD || null)
    } catch (err) {
      setCandidates([])
    }

    setLoading(false)
  }

  const openChat = (candidate, idx) => {
    setSelectedCandidate(candidate)
    setSelectedIdx(idx)
  }

  const updateCandidate = (id, newInterest) => {
    setCandidates((prev) =>
      prev?.map((c) =>
        c.id === id ? { ...c, interest: newInterest } : c
      )
    )

    setSelectedCandidate((prev) =>
      prev?.id === id ? { ...prev, interest: newInterest } : prev
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@600&display=swap');
        @keyframes blink { 0%,80%,100%{opacity:.2} 40%{opacity:1} }
        * { box-sizing: border-box; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#f7f7f5",
          padding: "1.5rem",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ maxWidth: 740, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: "1.5rem" }}>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 26,
                fontWeight: 600,
                color: "#1a1a1a",
                margin: 0,
              }}
            >
              Talent Agent
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                background: "#E6F1FB",
                color: "#0C447C",
                padding: "3px 8px",
                borderRadius: 20,
                letterSpacing: "0.4px",
              }}
            >
              AI-powered
            </span>
          </div>

          {/* JD Input */}
          <div
            style={{
              background: "#fff",
              border: "0.5px solid #e0e0e0",
              borderRadius: 12,
              padding: "1.25rem",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#999",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
              }}
            >
              Job Description
            </div>
            <textarea
              rows={4}
              placeholder="Paste a job description to find best-fit candidates..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              style={{
                width: "100%",
                border: "0.5px solid #ddd",
                borderRadius: 8,
                padding: "10px 12px",
                fontFamily: "inherit",
                fontSize: 14,
                color: "#1a1a1a",
                background: "#fafafa",
                resize: "none",
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#378ADD")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            />
            {parsedJD && (
              <div
                style={{
                  marginTop: "0.75rem",
                  fontSize: 13,
                  color: "#333",
                  background: "#fff",
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  fontWeight: 500,
                }}
              >
                <strong>Detected:</strong>{" "}
                Skills: {parsedJD.skills.length ? parsedJD.skills.join(", ") : "None"} |{" "}
                Experience: {parsedJD.experience} yrs
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.75rem" }}>
              <button
                onClick={handleSearch}
                disabled={loading || !jd.trim()}
                style={{
                  background: loading || !jd.trim() ? "#aaa" : "#185FA5",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "9px 18px",
                  fontFamily: "inherit",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: loading || !jd.trim() ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!loading && jd.trim()) e.currentTarget.style.background = "#0C447C"
                }}
                onMouseLeave={(e) => {
                  if (!loading && jd.trim()) e.currentTarget.style.background = "#185FA5"
                }}
              >
                {loading ? "Searching..." : "Find Candidates"}
              </button>
            </div>
          </div>

          {/* Candidates grid */}
          {candidates !== null && candidates.length > 0 && (
            <>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#aaa",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                }}
              >
                Matched candidates
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: 12,
                  marginBottom: "1.25rem",
                }}
              >
                {candidates.map((c, i) => (
                  <CandidateCard key={c.id} candidate={c} idx={i} onChat={openChat} />
                ))}
              </div>
            </>
          )}

          {/* Empty state */}
          {candidates !== null && candidates.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "2.5rem 1rem",
                color: "#bbb",
                fontSize: 14,
                border: "0.5px dashed #ddd",
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: "0.5rem" }}>🔍</div>
              No candidates matched. Try refining the job description.
            </div>
          )}

          {/* Chat panel */}
          {selectedCandidate && (
            <ChatPanel
              candidate={selectedCandidate}
              idx={selectedIdx}
              onClose={() => setSelectedCandidate(null)}
              updateCandidate={updateCandidate}
            />
          )}

        </div>
      </div>
    </>
  )
}