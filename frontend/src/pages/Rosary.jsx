import { useState, useEffect } from 'react'
import BackButton from '../components/BackButton'
import { MYSTERIES, PRAYERS, getTodaysMysteries, buildRosarySteps } from '../data/rosary'

const HOW_TO_STEPS = [
  {
    step: "1",
    title: "Begin with the Sign of the Cross",
    desc: "Hold the crucifix and make the Sign of the Cross. Then pray the Apostles' Creed."
  },
  {
    step: "2",
    title: "Pray the Our Father",
    desc: "On the first large bead after the crucifix, pray the Our Father."
  },
  {
    step: "3",
    title: "Pray 3 Hail Marys",
    desc: "On the next three small beads, pray a Hail Mary for each — offering them for an increase of Faith, Hope, and Charity."
  },
  {
    step: "4",
    title: "Pray the Glory Be",
    desc: "After the three Hail Marys, pray the Glory Be."
  },
  {
    step: "5",
    title: "Announce the Mystery",
    desc: "Announce the First Mystery and spend a moment meditating on the event in the life of Jesus or Mary."
  },
  {
    step: "6",
    title: "Pray the Our Father",
    desc: "On the large bead before the decade, pray the Our Father."
  },
  {
    step: "7",
    title: "Pray 10 Hail Marys",
    desc: "On each of the ten small beads, pray a Hail Mary while meditating on the mystery."
  },
  {
    step: "8",
    title: "Pray the Glory Be and Fatima Prayer",
    desc: "After the ten Hail Marys, pray the Glory Be. Then pray the Fatima Prayer: 'O my Jesus, forgive us our sins...'"
  },
  {
    step: "9",
    title: "Repeat for Each Mystery",
    desc: "Announce the next mystery and repeat steps 6 through 8 for all five mysteries."
  },
  {
    step: "10",
    title: "Close with the Hail Holy Queen",
    desc: "After the fifth decade, pray the Hail Holy Queen and the closing prayers to complete the Rosary."
  },
]

// Where you were, so an interrupted rosary can be picked up. Only the
// mystery name and step index are stored; the steps themselves are rebuilt,
// so a change to the step data can never leave someone resuming into a
// position that no longer exists.
function readSaved() {
  try {
    const name = localStorage.getItem('rosary_mystery')
    const step = parseInt(localStorage.getItem('rosary_step'), 10)
    if (!name || !MYSTERIES[name] || Number.isNaN(step)) return null
    return { name, step }
  } catch {
    return null
  }
}

function clearSaved() {
  try {
    localStorage.removeItem('rosary_mystery')
    localStorage.removeItem('rosary_step')
  } catch {
    // Storage blocked. Nothing to clear.
  }
}

function Rosary() {
  const todaysMysteries = getTodaysMysteries()

  const [selectedMystery, setSelectedMystery] = useState(null)
  const [steps, setSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  function startRosary(mysteryName, atStep = 0) {
    const mysterySet = { name: mysteryName, ...MYSTERIES[mysteryName] }
    const rosarySteps = buildRosarySteps(mysterySet)
    setSelectedMystery(mysterySet)
    setSteps(rosarySteps)
    setCurrentStep(Math.min(Math.max(atStep, 0), rosarySteps.length - 1))
    setFinished(false)

    mysterySet.mysteries.forEach(mystery => {
      if (mystery.image) {
        const img = new Image()
        img.src = mystery.image
      }
    })
  }

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Completed, so there is nothing left to resume.
      clearSaved()
      setFinished(true)
    }
  }

  // Leaves the praying view but keeps the saved position. Being interrupted
  // partway through is the normal case, so Exit should not throw the rosary
  // away.
  function exitToMenu() {
    setSelectedMystery(null)
    setSteps([])
    setCurrentStep(0)
    setFinished(false)
    setShowGuide(false)
  }

  function startOver() {
    clearSaved()
    exitToMenu()
  }

  useEffect(() => {
    if (!selectedMystery || finished) return
    try {
      localStorage.setItem('rosary_mystery', selectedMystery.name)
      localStorage.setItem('rosary_step', String(currentStep))
    } catch {
      // Storage blocked. Resuming just will not be offered.
    }
  }, [selectedMystery, currentStep, finished])

  // Fired by NavBar when the Rosary tab is tapped while already on /rosary.
  useEffect(() => {
    window.addEventListener('rosary:reset', exitToMenu)
    return () => window.removeEventListener('rosary:reset', exitToMenu)
  }, [])

  function renderStep(step) {
    if (step.type === 'prayer') {
      const prayer = PRAYERS[step.prayer]
      return (
        <div className="rosary-step">
          <p className="rosary-step-label">{prayer.name}</p>
          <p className="rosary-step-text">{prayer.text}</p>
        </div>
      )
    }

    if (step.type === 'hailMary') {
      const prayer = PRAYERS.hailMary
      return (
        <div className="rosary-step">
          <p className="rosary-step-label">
            {step.total === 3
              ? `Hail Mary — for ${step.intention}`
              : `Hail Mary (10×)`
            }
          </p>
          <p className="rosary-step-text">{prayer.text}</p>
        </div>
      )
    }

    if (step.type === 'mystery') {
      return (
        <div className="rosary-step">
          <p className="rosary-step-eyebrow">The {step.decadeNum === 1 ? 'First' : step.decadeNum === 2 ? 'Second' : step.decadeNum === 3 ? 'Third' : step.decadeNum === 4 ? 'Fourth' : 'Fifth'} Mystery</p>
          <p className="rosary-step-mystery-name">{step.mystery.name}</p>
          <p className="rosary-step-meditation">{step.mystery.meditation}</p>
          {step.mystery.scripture && (
            <p className="rosary-step-scripture">{step.mystery.scripture}</p>
          )}
          {step.mystery.image && (
            <div className="rosary-mystery-image-block">
              <img
                src={step.mystery.image}
                alt={step.mystery.name}
                className="rosary-mystery-image"
              />
              {step.mystery.imageCaption && (
                <p className="rosary-mystery-image-caption">{step.mystery.imageCaption}</p>
              )}
            </div>
          )}
        </div>
      )
    }
  }

  function getProgress() {
    if (steps.length === 0) return 0
    return Math.round((currentStep / (steps.length - 1)) * 100)
  }

  // How to pray guide
  if (showGuide) {
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={() => setShowGuide(false)} />
          <p className="readings-eyebrow">The Holy Rosary</p>
          <h1 className="rosary-title">How to Pray the Rosary</h1>
        </div>
        <div className="page-content">
          <div className="rosary-guide-list">
            {HOW_TO_STEPS.map(item => (
              <div key={item.step} className="rosary-guide-item">
                <div className="rosary-guide-step-num">{item.step}</div>
                <div className="rosary-guide-step-body">
                  <p className="rosary-guide-step-title">{item.title}</p>
                  <p className="rosary-guide-step-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Mystery selection
  if (!selectedMystery) {
    const resume = readSaved()
    const resumeTotal = resume
      ? buildRosarySteps({ name: resume.name, ...MYSTERIES[resume.name] }).length
      : 0

    return (
      <div className="page">
        <div className="page-header">
          <p className="readings-eyebrow">The Holy Rosary</p>
          <h1 className="rosary-title">Choose your mysteries</h1>
        </div>

        <div className="page-content">
          {resume && (
            <button
              className="rosary-continue-btn"
              onClick={() => startRosary(resume.name, resume.step)}
            >
              <span className="rosary-continue-text">
                <span className="rosary-continue-label">Continue</span>
                <span className="rosary-continue-value">
                  {resume.name} Mysteries, {resume.step + 1} of {resumeTotal}
                </span>
              </span>
              <span className="rosary-continue-arrow">&rarr;</span>
            </button>
          )}

          <div className="rosary-today">
            <p className="rosary-today-label">Suggested for today</p>
            <button
              className="rosary-today-btn"
              onClick={() => startRosary(todaysMysteries.name)}
            >
              {todaysMysteries.name} Mysteries
            </button>
          </div>

          <p className="rosary-or">— or choose —</p>

          <div className="rosary-mystery-list">
            {Object.keys(MYSTERIES).map(name => (
              <button
                key={name}
                className="rosary-mystery-btn"
                onClick={() => startRosary(name)}
              >
                <span className="rosary-mystery-name">{name} Mysteries</span>
                <span className="rosary-mystery-days">
                  {name === 'Joyful' ? 'Mon, Sat' :
                   name === 'Sorrowful' ? 'Tue, Fri' :
                   name === 'Glorious' ? 'Wed, Sun' : 'Thu'}
                </span>
              </button>
            ))}
          </div>

          <button
            className="rosary-guide-btn"
            onClick={() => setShowGuide(true)}
          >
            How to pray the Rosary
          </button>
        </div>
      </div>
    )
  }

  // Finished
  if (finished) {
    return (
      <div className="page">
        <div className="page-header">
          <p className="readings-eyebrow">The Holy Rosary</p>
          <h1 className="rosary-title">{selectedMystery.name} Mysteries</h1>
        </div>

        <div className="page-content">
          <div className="rosary-finished">
            {/* An SVG rather than U+271D. macOS renders that character as a
                text glyph, iOS substitutes Apple Color Emoji and you get a
                sticker instead of the gold cross. No font, no substitution. */}
            <div className="rosary-finished-title" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="56" height="56" fill="none"
                   stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="12" y1="2" x2="12" y2="22" />
                <line x1="6" y1="8" x2="18" y2="8" />
              </svg>
            </div>
            <p className="rosary-finished-text">
              You have completed the {selectedMystery.name} Mysteries of the Holy Rosary.
            </p>
            <p className="rosary-finished-sub">
              May Our Lady intercede for you and bring your prayers before her Son.
            </p>
            <button className="rosary-restart-btn" onClick={startOver}>
              Pray again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const step = steps[currentStep]
  const progress = getProgress()

  return (
    <div className="page">
      <div className="page-header">
        <div className="rosary-header-row">
          <p className="readings-eyebrow">{selectedMystery.name} Mysteries</p>
          <button className="rosary-exit-btn" onClick={exitToMenu}>✕ Exit</button>
        </div>
        <div className="rosary-progress-bar">
          <div className="rosary-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="rosary-progress-text">{currentStep + 1} of {steps.length}</p>
      </div>

      <div className="page-content">
        {renderStep(step)}
      </div>

      <div className="rosary-next-container">
        <div className="rosary-btn-row">
          {currentStep > 0 && (
            <button className="rosary-prev-btn" onClick={() => setCurrentStep(currentStep - 1)}>
              ← Prev
            </button>
          )}
          <button className="rosary-next-btn" onClick={handleNext}>
            {currentStep < steps.length - 1 ? 'Next →' : 'Complete ✝'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Rosary
