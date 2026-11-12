import { ArrowUpRight, MoveUpRight } from 'lucide-react'
import brandLogo from '../images/logo.jpg'

const footerLinks = [
  { label: 'The journey', href: '#journey' },
  { label: 'Mentorship', href: '#mentorship' },
  { label: 'About us', href: '#about' },
  { label: 'Candidate services', href: '#engines' },
]

export function Footer() {
  return (
    <footer className="site-footer section-dark">
      <div className="page-wrap">
        <div className="footer-main"><div className="footer-brand"><a className="wordmark" href="#top" aria-label="SPREAD GLOBAL home"><img className="brand-logo footer-logo" src={brandLogo} alt="SPREAD GLOBAL" /></a><p>A complete career lifecycle for ambitious technology professionals.</p><a className="footer-contact" href="mailto:spreadittech@gmail.com">spreadittech@gmail.com <MoveUpRight size={15}/></a><a className="footer-phone" href="tel:+13316435771">331 643 5771</a></div><div className="footer-links"><span className="card-kicker">EXPLORE</span>{footerLinks.map((link) => <a key={link.href} href={link.href}>{link.label}<ArrowUpRight size={13}/></a>)}</div><div className="footer-note"><span className="card-kicker">OUR POINT OF VIEW</span><p>Good careers aren’t built alone. They’re built with the right people, at the right moment.</p><span className="footer-coordinate">SKILLS · PREPARATION · RECRUITMENT</span></div></div>
        <div className="footer-bottom"><span>© 2026 SPREAD GLOBAL</span><span>SKILLS · PREPARATION · RECRUITMENT · EMPOWERMENT · ADVANCEMENT · DEVELOPMENT</span><a href="#top">BACK TO TOP ↑</a></div>
      </div>
    </footer>
  )
}
