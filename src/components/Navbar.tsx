import { useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import brandLogo from '../images/logo.jpg'

const links = [
  { label: 'The S.P.R.E.A.D. Journey', href: '#journey' },
  { label: 'Mentorship', href: '#mentorship' },
  { label: 'Visa & Marketing', href: '#engines' },
  { label: 'About us', href: '#about' },
]

export function Navbar({ onStart }: { onStart: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-nav">
      <div className="nav-inner">
        <a className="wordmark" href="#top" aria-label="SPREAD GLOBAL home" onClick={closeMenu}>
          <img className="brand-logo" src={brandLogo} alt="SPREAD GLOBAL" />
        </a>
        <nav className={`nav-links${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={closeMenu}>{link.label}</a>
          ))}
          <button className="nav-mobile-cta" onClick={() => { closeMenu(); onStart() }}>
            Book a strategy call <ArrowUpRight size={15} />
          </button>
        </nav>
        <button className="nav-cta" onClick={onStart}>
          <span>Book a strategy call</span><ArrowUpRight size={15} />
        </button>
        <button className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  )
}
