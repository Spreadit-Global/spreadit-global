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

function App() {
  return (
    <>
      <Navbar formUrl={googleFormUrl} />
      <main>
        <Hero formUrl={googleFormUrl} />
        <SpreadJourney />
        <CoreEnginesBento />
        <MentorRoster />
        <AboutUs />
        <ConsultationForm formUrl={googleFormUrl} />
      </main>
      <Footer />
    </>
  )
}

export default App
