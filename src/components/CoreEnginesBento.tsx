import { googleFormUrl } from '../intake'
import { motion } from 'framer-motion'
import { ArrowUpRight, Award, BriefcaseBusiness, FileCheck2, Landmark, ShieldCheck, UsersRound } from 'lucide-react'

const reveal = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.48 } }

export function CoreEnginesBento() {
  return (
    <section className="engines-section section-dark" id="engines">
      <div className="page-wrap">
        <motion.div className="section-heading engines-heading" {...reveal}>
          <div><div className="eyebrow eyebrow-dark"><span className="eyebrow-dot" /> THE DELIVERY MODEL</div><h2>Three engines.<br /><em>Working as one.</em></h2></div>
          <p>Specialists who work together around your next move, so the details don’t get lost between teams.</p>
        </motion.div>
        <div className="engine-grid">
          <motion.article className="engine-card engine-mentor" {...reveal}>
            <div className="engine-card-header"><span className="engine-number">01 / THE HUMAN EDGE</span><span className="engine-icon"><UsersRound size={18} /></span></div>
            <div className="mentor-visual" aria-hidden="true"><div className="mentor-orbit orbit-one"/><div className="mentor-orbit orbit-two"/><div className="mentor-center"><span>01:1</span><small>MENTORING</small></div><span className="orbit-tag orbit-tag-a">SYSTEM DESIGN</span><span className="orbit-tag orbit-tag-b">CODE REVIEW</span><span className="orbit-tag orbit-tag-c">CAREER CLARITY</span></div>
            <div className="engine-card-copy"><span className="card-kicker">ENGINEERING MENTORSHIP</span><h3>Get sharper with<br />people who build it.</h3><p>One-on-one coding drills, architecture reviews, and behavioral prep with senior engineers from Bank of America and leading tech firms.</p><a href="#mentorship" className="engine-link">Meet your mentor network <ArrowUpRight size={15} /></a></div>
          </motion.article>
          <motion.article className="engine-card engine-marketing" {...reveal} transition={{ ...reveal.transition, delay: 0.08 }}>
            <div className="engine-card-header"><span className="engine-number">02 / THE MARKET REACH</span><span className="engine-icon"><BriefcaseBusiness size={18} /></span></div>
            <div className="profile-preview"><div className="profile-top"><span className="profile-avatar">JD</span><span className="profile-status"><i/> PROFILE IN REVIEW</span></div><div className="profile-lines"><b/><i/><i/></div><div className="profile-tags"><span>BACKEND</span><span>JAVA</span><span>FINTECH</span></div><div className="profile-outreach"><span>RECRUITER OUTREACH</span><strong>12 <small>targeted teams</small></strong><div className="reach-bars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div></div>
            <div className="engine-card-copy"><span className="card-kicker">DEDICATED TALENT MARKETING</span><h3>Be seen by the<br />right people.</h3><p>Resume engineering, LinkedIn positioning, and thoughtful outreach to hiring managers and Tier-1 vendors.</p><a href={googleFormUrl} className="engine-link">Explore candidate marketing <ArrowUpRight size={15} /></a></div>
          </motion.article>
          <motion.article className="engine-card engine-visa" {...reveal} transition={{ ...reveal.transition, delay: 0.16 }}>
            <div className="engine-card-header"><span className="engine-number">03 / THE CLEAR PATH</span><span className="engine-icon"><ShieldCheck size={18} /></span></div>
            <div className="visa-visual"><div className="visa-head"><span><Landmark size={17}/></span><div><b>Authorization desk</b><small>YOUR WORKFLOW, MADE CLEAR</small></div><span className="visa-check"><FileCheck2 size={15}/></span></div><div className="visa-items"><div className="visa-item done"><span>01</span><b>OPT / STEM OPT</b><small>Guidance & timelines</small><i>READY</i></div><div className="visa-item current"><span>02</span><b>H-1B transfer</b><small>Specialist review</small><i>IN VIEW</i></div><div className="visa-item"><span>03</span><b>Global pathways</b><small>Authorization planning</small><i>PLANNED</i></div></div></div>
            <div className="engine-card-copy"><span className="card-kicker">VISA & IMMIGRATION DESK</span><h3>Clarity through<br />the paperwork.</h3><p>Dedicated legal and compliance specialists for OPT, STEM OPT, H-1B transfers, and sponsorship workflows.</p><a href={googleFormUrl} className="engine-link">Understand your options <ArrowUpRight size={15} /></a></div>
          </motion.article>
        </div>
        <motion.div className="trust-ribbon" {...reveal}><div className="trust-label"><Award size={17}/><span>BUILT FOR HIGH-STAKES CAREERS</span></div><div><strong>01</strong><span>Senior engineering mentors</span></div><div><strong>02</strong><span>Focused talent marketing</span></div><div><strong>03</strong><span>Work authorization support</span></div></motion.div>
      </div>
    </section>
  )
}
