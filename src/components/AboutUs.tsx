import { motion } from 'framer-motion'
import { ArrowUpRight, BadgeCheck, BriefcaseBusiness, FileCheck2, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react'

const founderSlots = ['01', '02', '03']
const support = [
  { icon: FileCheck2, title: 'ATS-ready profile', text: 'Resume creation and profile marketing designed to help your experience reach the right hiring teams.' },
  { icon: BriefcaseBusiness, title: 'Job search support', text: 'Guided applications, targeted outreach, and coordination throughout the recruitment process.' },
  { icon: ShieldCheck, title: 'Visa handling', text: 'Dedicated support for work authorization planning, OPT, STEM OPT, H-1B transfers, and related workflows.' },
  { icon: BadgeCheck, title: 'Interview preparation', text: 'Practice with SDE mentors from Bank of America and other respected organizations, from coding to system design.' },
]

export function AboutUs() {
  return (
    <section className="about-section section-light" id="about">
      <div className="page-wrap">
        <motion.div className="about-intro" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }}>
          <div className="eyebrow"><span className="eyebrow-dot"/> ABOUT SPREAD GLOBAL</div>
          <div className="about-intro-grid"><h2>One team for<br/><em>the whole journey.</em></h2><p>We bring the pieces of a tech career move together. From an ATS-friendly resume and focused job applications to visa handling and interview coaching, our dedicated team supports candidates from preparation through placement and beyond.</p></div>
        </motion.div>
        <div className="about-support-grid">
          {support.map(({ icon: Icon, title, text }, index) => <motion.article className="about-support-item" key={title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.4, delay: index * 0.06 }}><span className="about-support-icon"><Icon size={17}/></span><div><h3>{title}</h3><p>{text}</p></div><span className="about-index">0{index + 1}</span></motion.article>)}
        </div>
        <div className="founders-heading"><div><span className="card-kicker">THE PEOPLE BEHIND SPREAD</span><h3>Our founders</h3></div><span className="founders-note">Meet the people building your next chapter.</span></div>
        <div className="founder-grid">
          {founderSlots.map((number) => <article className="founder-slot" key={number}><div className="founder-portrait"><span className="founder-number">FOUNDER / {number}</span><UserRound size={32} strokeWidth={1.2}/><span className="founder-portrait-caption">PROFILE PHOTO</span></div><div className="founder-details"><span className="card-kicker">FOUNDING TEAM</span><h4>Founder name</h4><p>Title and introduction to be added.</p></div><span className="founder-arrow" aria-hidden="true"><ArrowUpRight size={15}/></span></article>)}
        </div>
        <div className="about-contact"><div><span className="card-kicker">LET'S TALK ABOUT YOUR NEXT STEP</span><strong>Reach our team directly.</strong></div><a href="mailto:spreadittech@gmail.com"><Mail size={15}/> spreadittech@gmail.com <ArrowUpRight size={13}/></a><div className="about-phone-list"><a href="tel:+13316435771"><Phone size={14}/> 331 643 5771</a></div></div>
      </div>
    </section>
  )
}
