import { useEffect, useState } from 'react'
import { AdminAccess } from './components/AdminAccess'
import { ConsultationForm } from './components/ConsultationForm'
import { AboutUs } from './components/AboutUs'
import { CoreEnginesBento } from './components/CoreEnginesBento'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { MentorRoster } from './components/MentorRoster'
import { Navbar } from './components/Navbar'
import { SpreadJourney } from './components/SpreadJourney'
import { googleFormUrl } from './intake'
import './site.css'
import './hero-tweaks.css'
import './responsive.css'
import './about-intake.css'
import './contact-fields.css'
import './brand-theme.css'
import './storage-intake.css'
import './brand-polish.css'
import './admin-access.css'

function App() {
  const [dashboardOpen, setDashboardOpen] = useState(window.location.hash === '#dashboard')
  useEffect(() => {
    const updateRoute = () => {
      const isDashboard = window.location.hash === '#dashboard'
      setDashboardOpen(isDashboard)
      if (isDashboard) window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  useEffect(() => {
    if (dashboardOpen) return
    const target = window.location.hash.slice(1)
    if (target) document.getElementById(target)?.scrollIntoView()
  }, [dashboardOpen])

  return (
    <>
      <Navbar formUrl={googleFormUrl} />
      <main>
        {dashboardOpen ? <AdminAccess /> : <>
          <Hero formUrl={googleFormUrl} />
          <SpreadJourney />
          <CoreEnginesBento />
          <MentorRoster />
          <AboutUs />
          <ConsultationForm formUrl={googleFormUrl} />
        </>}
      </main>
      <Footer />
    </>
  )
}

export default App
