import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDownRight, ArrowRight, Check, CircleCheck, Clock3, FileText, ShieldCheck, Sparkles } from 'lucide-react'

const stages = [
  { title: 'System design mock', team: 'Tier-1 SDE mentor', date: 'TODAY · 10:30 AM', icon: Sparkles, detail: 'Practice a real-world architecture prompt with an active senior engineer.' },
  { title: 'Profile marketing', team: 'Dedicated marketing desk', date: 'UP NEXT · 2 DAYS', icon: FileText, detail: 'Your profile is being positioned for relevant hiring teams and vendor partners.' },
  { title: 'Work authorization', team: 'Immigration legal team', date: 'IN PROGRESS', icon: ShieldCheck, detail: 'A specialist reviews your OPT, STEM OPT, or transfer timeline and documents.' },
  { title: 'Offer signed', team: 'Your next chapter', date: 'THE MILESTONE', icon: CircleCheck, detail: 'Move into a role that matches your goals, with your team beside you.' },
]

export function Hero({ onStart }: { onStart: () => void }) {
  const [activeStage, setActiveStage] = useState(0)
  const selected = stages[activeStage]
  const SelectedIcon = selected.icon

  return (
    <section className="hero-section" id="top">
      <div className="hero-grain" aria-hidden="true" />
      <div className="hero-wrap page-wrap">
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          <div className="eyebrow eyebrow-dark"><span className="eyebrow-dot" /> A FULL-LIFECYCLE CAREER PARTNER</div>
          <h1>Build the career<br />you <em>came here for.</em></h1>
          <p className="hero-lede">Tier-1 engineering mentorship. A dedicated team behind your profile. Visa support that sees the whole picture.</p>
          <div className="hero-actions">
            <button className="button button-gold" onClick={onStart}>Start your journey <ArrowRight size={16} /></button>
            <a className="button button-quiet" href="#engines">Explore candidate pipeline <ArrowDownRight size={16} /></a>
          </div>
          <div className="hero-proof">
            <div className="avatar-stack" aria-hidden="true"><span>JS</span><span>MK</span><span>AR</span><b>+</b></div>
            <div><strong>One team. Every next step.</strong><small>From first prep session to signed offer.</small></div>
          </div>
        </motion.div>

        <motion.div className="lifecycle-card" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.18 }}>
          <div className="lifecycle-topline"><div><span className="card-kicker">CANDIDATE LIFECYCLE</span><h2>Your progress, in motion.</h2></div><span className="live-badge"><i /> LIVE TRACKER</span></div>
          <div className="lifecycle-body">
            <div className="lifecycle-steps" role="tablist" aria-label="Candidate lifecycle stages">
              {stages.map((stage, index) => {
                const StageIcon = stage.icon
                const isActive = activeStage === index
                return <button key={stage.title} className={`lifecycle-step${isActive ? ' active' : ''}${index < activeStage ? ' complete' : ''}`} role="tab" aria-selected={isActive} onClick={() => setActiveStage(index)}>
                  <span className="step-marker">{index < activeStage ? <Check size={13} /> : <StageIcon size={14} />}</span>
                  <span className="step-copy"><strong>{stage.title}</strong><small>{stage.team}</small></span>
                  <span className="step-date">{stage.date}</span>
                </button>
              })}
            </div>
            <div className="lifecycle-detail" aria-live="polite">
              <div className="detail-symbol"><SelectedIcon size={17} /></div>
              <div><span className="card-kicker">YOUR NEXT MILESTONE</span><AnimatePresence mode="wait"><motion.p key={selected.title} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>{selected.detail}</motion.p></AnimatePresence></div>
              <Clock3 size={15} className="detail-clock" />
            </div>
          </div>
          <div className="lifecycle-footer"><span><i className="status-dot" /> YOUR ROADMAP IS ACTIVE</span><span>01 — 04</span></div>
        </motion.div>
      </div>
      <div className="hero-bottom page-wrap"><span>BUILT FOR AMBITIOUS TECH PROFESSIONALS</span><span className="hero-bottom-line" /><span>EST. FOR WHAT'S NEXT</span></div>
    </section>
  )
}
