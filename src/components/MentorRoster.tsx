import { motion } from 'framer-motion'
import { ArrowUpRight, BadgeCheck, Code2, MessageSquareText, Network } from 'lucide-react'

const mentors = [
  { initials: 'SD', role: 'Staff Software Engineer', focus: 'SYSTEM DESIGN', mark: 'FINANCIAL TECHNOLOGY' },
  { initials: 'EM', role: 'Senior Engineering Manager', focus: 'CAREER STRATEGY', mark: 'FORTUNE 500' },
  { initials: 'PL', role: 'Principal Engineer', focus: 'BACKEND SYSTEMS', mark: 'LEADING TECH' },
]

export function MentorRoster() {
  return (
    <section className="mentors-section section-light" id="mentorship">
      <div className="page-wrap mentor-wrap">
        <motion.div className="mentor-intro" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }}>
          <div className="eyebrow"><span className="eyebrow-dot"/> A NETWORK THAT SHOWS UP</div>
          <h2>Learn from the<br />people <em>in the room.</em></h2>
          <p>Active senior engineers bring the context you can’t get from another course: how teams make decisions, design systems, and evaluate candidates.</p>
          <div className="mentor-proof-points"><span><Code2 size={16}/> Real engineering practice</span><span><Network size={16}/> System design, together</span><span><MessageSquareText size={16}/> Honest interview feedback</span></div>
          <a className="text-link" href="#assessment">Find your fit <ArrowUpRight size={15}/></a>
        </motion.div>
        <div className="mentor-roster">
          <div className="roster-top"><span>MENTOR NETWORK</span><span>SELECT SPECIALTIES <i>↘</i></span></div>
          {mentors.map((mentor, index) => <motion.article className="mentor-row" key={mentor.initials} initial={{ opacity: 0, x: 14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45, delay: index * 0.08 }}>
            <div className={`mentor-initials mentor-tone-${index}`}>{mentor.initials}</div><div className="mentor-person"><strong>{mentor.role}</strong><span><BadgeCheck size={13}/> SPREAD MENTOR</span></div><div className="mentor-specialty"><span>{mentor.focus}</span><small>{mentor.mark}</small></div><ArrowUpRight size={15} className="mentor-arrow"/>
          </motion.article>)}
          <div className="roster-note"><span className="roster-note-mark">*</span><p>Mentors are practicing professionals. Your match is based on role, goals, and the skills you want to strengthen.</p></div>
        </div>
      </div>
    </section>
  )
}
