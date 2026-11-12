import { useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { ArrowRight, BriefcaseBusiness, CheckCircle2, GraduationCap, Laptop2, Megaphone, Shield, TrendingUp } from 'lucide-react'

const phases = [
  { letter: 'S', name: 'Skills', color: 'gold', team: 'Learning & development team', milestone: 'A role-ready technical foundation', summary: 'Close the distance between what you know and what the role asks for.', deliverables: ['Role-aligned skill assessment', 'Personalized upskilling plan', 'Portfolio and project guidance'], icon: Laptop2 },
  { letter: 'P', name: 'Preparation', color: 'blue', team: 'Tier-1 SDE mentor network', milestone: 'Confidence in the interview room', summary: 'Build interview fluency through practical, high-signal preparation.', deliverables: ['1:1 coding drills', 'System design mock interviews', 'Behavioral interview practice'], icon: GraduationCap },
  { letter: 'R', name: 'Recruitment', color: 'gold', team: 'Dedicated marketing desk', milestone: 'A profile in front of the right teams', summary: 'Turn preparation into a focused search, not another application queue.', deliverables: ['Resume engineering', 'LinkedIn profile optimization', 'Direct recruiter and vendor outreach'], icon: Megaphone },
  { letter: 'E', name: 'Empowerment', color: 'blue', team: 'Candidate success team', milestone: 'Clear decisions and strong negotiations', summary: 'Get an experienced partner through conversations and critical choices.', deliverables: ['Interview scheduling and coaching', 'Offer comparison guidance', 'Negotiation preparation'], icon: TrendingUp },
  { letter: 'A', name: 'Advancement', color: 'gold', team: 'Immigration legal team', milestone: 'A compliant path to your next role', summary: 'Make work authorization a planned part of your career, not a surprise.', deliverables: ['OPT and STEM OPT guidance', 'H-1B transfer workflows', 'Work authorization coordination'], icon: Shield },
  { letter: 'D', name: 'Development', color: 'blue', team: 'Career growth partners', milestone: 'Momentum beyond the first offer', summary: 'Keep growing your skills, impact, and options after you land.', deliverables: ['First-90-day planning', 'Ongoing mentor access', 'Long-term career checkpoints'], icon: BriefcaseBusiness },
]

export function SpreadJourney() {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = phases[activeIndex]
  const ActiveIcon = active.icon

  function moveSelection(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex((index) => (index + 1) % phases.length) }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((index) => (index - 1 + phases.length) % phases.length) }
    if (event.key === 'Home') { event.preventDefault(); setActiveIndex(0) }
    if (event.key === 'End') { event.preventDefault(); setActiveIndex(phases.length - 1) }
  }

  return (
    <section className="journey-section section-light" id="journey">
      <div className="page-wrap">
        <motion.div className="section-heading journey-heading" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }}>
          <div><div className="eyebrow"><span className="eyebrow-dot" /> THE METHOD</div><h2>Six phases.<br /><em>One bigger picture.</em></h2></div>
          <p>Progress isn’t one big leap. It’s a series of deliberate moves, with the right specialist beside you at each one.</p>
        </motion.div>
        <LayoutGroup>
          <div className="journey-layout">
            <div className="phase-list" role="tablist" aria-label="S.P.R.E.A.D. journey phases" onKeyDown={moveSelection}>
              {phases.map((phase, index) => {
                const selected = activeIndex === index
                return <button className={`phase-tab${selected ? ' selected' : ''}`} id={`phase-tab-${phase.letter}`} role="tab" aria-selected={selected} aria-controls="phase-panel" tabIndex={selected ? 0 : -1} key={phase.letter} onClick={() => setActiveIndex(index)}>
                  <span className={`phase-letter phase-${phase.color}`}>{phase.letter}</span><span className="phase-label"><strong>{phase.name}</strong><small>0{index + 1} / 06</small></span>{selected && <motion.span className="phase-active-line" layoutId="phase-active-line" />}
                </button>
              })}
            </div>
            <AnimatePresence mode="wait">
              <motion.div className="phase-panel" id="phase-panel" role="tabpanel" aria-labelledby={`phase-tab-${active.letter}`} key={active.letter} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
                <div className="phase-panel-top"><div className={`phase-icon phase-${active.color}`}><ActiveIcon size={20} /></div><div><span className="card-kicker">PHASE 0{activeIndex + 1} / 06</span><h3>{active.name}<span>.</span></h3></div><span className={`phase-watermark phase-${active.color}`}>{active.letter}</span></div>
                <p className="phase-summary">{active.summary}</p>
                <div className="phase-content-grid"><div><span className="content-label">WHAT YOU GET</span><ul className="deliverable-list">{active.deliverables.map((item) => <li key={item}><CheckCircle2 size={15} />{item}</li>)}</ul></div><div className="phase-outcome"><span className="content-label">YOUR SPECIALIST TEAM</span><strong>{active.team}</strong><span className="outcome-rule" /><span className="content-label">EXPECTED MILESTONE</span><strong>{active.milestone}</strong></div></div>
                <a className="text-link" href="#assessment">See your roadmap <ArrowRight size={15} /></a>
              </motion.div>
            </AnimatePresence>
          </div>
        </LayoutGroup>
        <div className="journey-acronym" aria-label="Skills, Preparation, Recruitment, Empowerment, Advancement, Development">S<span>kills</span><i>·</i>P<span>reparation</span><i>·</i>R<span>ecruitment</span><i>·</i>E<span>mpowerment</span><i>·</i>A<span>dvancement</span><i>·</i>D<span>evelopment</span></div>
      </div>
    </section>
  )
}
