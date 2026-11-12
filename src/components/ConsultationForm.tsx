import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, ChevronDown, FileText, Upload, X } from 'lucide-react'

type Props = { modal?: boolean; onClose?: () => void }

const statuses = ['Student / OPT', 'Experienced developer', 'Visa transfer needed']
const roles = ['Software Engineer', 'Full-stack Engineer', 'Data Engineer', 'Cloud / DevOps', 'Product or other']

export function ConsultationForm({ modal = false, onClose }: Props) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('')
  const [role, setRole] = useState('')
  const [resume, setResume] = useState<File | null>(null)
  const [resumeError, setResumeError] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [consent, setConsent] = useState(false)
  const calendlyUrl = import.meta.env.VITE_CALENDLY_URL?.trim() ?? ''

  const reset = () => { setStep(1); setName(''); setPhone(''); setEmail(''); setLocation(''); setStatus(''); setRole(''); setResume(null); setResumeError(''); setNotes(''); setSaving(false); setSaved(false); setSaveError(''); setConsent(false) }
  const closeAndReset = () => { reset(); onClose?.() }
  const next = () => { if (step < 4) setStep(step + 1) }
  const canContinue = step === 1
    ? Boolean(name.trim() && phone.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && location.trim())
    : step === 2
      ? Boolean(status && role)
      : step === 3
        ? Boolean(resume)
        : false
  const handleResumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0] ?? null
    if (!file) return
    if (!/\.(pdf|doc|docx)$/i.test(file.name)) {
      setResume(null)
      setResumeError('Choose a PDF, DOC, or DOCX file.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setResume(null)
      setResumeError('Your resume must be 10 MB or smaller.')
      return
    }
    setResume(file)
    setResumeError('')
  }
  const calendlyBookingUrl = (() => {
    if (!calendlyUrl) return ''
    const url = new URL(calendlyUrl)
    url.searchParams.set('name', name.trim())
    url.searchParams.set('email', email.trim())
    return url.toString()
  })()
  const saveIntake = async () => {
    if (!resume || saving) return
    setSaving(true)
    setSaveError('')
    const formData = new FormData()
    formData.set('name', name.trim())
    formData.set('phone', phone.trim())
    formData.set('email', email.trim())
    formData.set('location', location.trim())
    formData.set('status', status)
    formData.set('role', role)
    formData.set('notes', notes.trim())
    formData.set('resume', resume)
    try {
      const response = await fetch('/api/intake', { method: 'POST', body: formData })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || 'We could not save your details. Please try again.')
      setSaved(true)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'We could not save your details. Please try again.')
    } finally {
      setSaving(false)
    }
  }
  const content = <div className={`assessment-content${modal ? ' assessment-modal-content' : ''}`}>
    <div className="assessment-heading"><div className="eyebrow eyebrow-dark"><span className="eyebrow-dot"/> START WITH A CONVERSATION</div><h2>Let’s map your<br/><em>next move.</em></h2><p>A few details help us make the first conversation about you, not a generic pitch.</p></div>
    <div className="assessment-form-panel">
        <div className="form-progress"><span>STRATEGY CALL INTAKE <b>0{step} / 04</b></span><div>{[1,2,3,4].map((number) => <i key={number} className={number <= step ? 'filled' : ''}/>)}</div></div>
        <AnimatePresence mode="wait"><motion.div className="form-step" key={step} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}>
          {step === 1 && <><h3>Let's get to know you.</h3><p className="form-helper">Share your contact details to get started. Your information is saved only when you submit the final step.</p><div className="personal-fields"><label className="field-label" htmlFor={modal ? 'candidate-name-modal' : 'candidate-name-section'}>FULL NAME<input id={modal ? 'candidate-name-modal' : 'candidate-name-section'} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" required/></label><label className="field-label" htmlFor={modal ? 'candidate-phone-modal' : 'candidate-phone-section'}>PHONE NUMBER<input id={modal ? 'candidate-phone-modal' : 'candidate-phone-section'} type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Your contact number" required/></label><label className="field-label" htmlFor={modal ? 'candidate-email-modal' : 'candidate-email-section'}>EMAIL ADDRESS<input id={modal ? 'candidate-email-modal' : 'candidate-email-section'} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required/></label><label className="field-label personal-location" htmlFor={modal ? 'candidate-location-modal' : 'candidate-location-section'}>CURRENT LOCATION<input id={modal ? 'candidate-location-modal' : 'candidate-location-section'} autoComplete="address-level2" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, State / Country" required/></label></div></>}
          {step === 2 && <><h3>Where are you today?</h3><p className="form-helper">Choose the option closest to your current situation.</p><div className="choice-stack" role="radiogroup" aria-label="Current professional status">{statuses.map((item) => <button key={item} role="radio" aria-checked={status === item} className={`choice-button${status === item ? ' chosen' : ''}`} onClick={() => setStatus(item)}><span className="choice-radio">{status === item && <i/>}</span>{item}{status === item && <Check size={15}/>}</button>)}</div><label className="field-label" htmlFor={modal ? 'target-role-modal' : 'target-role-section'}>TARGET ROLE</label><div className="select-wrap"><select id={modal ? 'target-role-modal' : 'target-role-section'} value={role} onChange={(event) => setRole(event.target.value)}><option value="">Select a role</option>{roles.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={16}/></div></>}
          {step === 3 && <><h3>Share your resume</h3><p className="form-helper">We’ll save your resume securely with your application details. Add anything you’d like us to know before the call.</p><label className={`resume-drop${resume ? ' has-file' : ''}`} htmlFor={modal ? 'resume-upload-modal' : 'resume-upload-section'}><span className="resume-drop-icon">{resume ? <FileText size={19}/> : <Upload size={19}/>}</span><strong>{resume ? resume.name : 'Choose your resume'}</strong><small>{resume ? `${(resume.size / 1024 / 1024).toFixed(2)} MB · Ready to upload` : 'PDF, DOC, or DOCX · 10 MB max'}</small><input id={modal ? 'resume-upload-modal' : 'resume-upload-section'} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleResumeChange}/></label>{resumeError && <p className="resume-error" role="alert">{resumeError}</p>}<label className="field-label" htmlFor={modal ? 'candidate-notes-modal' : 'candidate-notes-section'}>ANYTHING YOU'D LIKE US TO KNOW BEFORE OUR CALL?</label><textarea className="notes-input" id={modal ? 'candidate-notes-modal' : 'candidate-notes-section'} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Your goals, experience, questions, or anything else that would be helpful..." rows={3}/><p className="privacy-note">Your resume and details are sent only when you submit the final step.</p></>}
          {step === 4 && (saved ? <div className="intake-saved"><div className="success-icon"><Check size={23}/></div><span className="card-kicker">INTAKE SAVED</span><h3>Thanks, {name.split(' ')[0]}.</h3><p>Your details are in the candidate workbook and your resume is in the resumes folder.</p>{calendlyBookingUrl && <a className="button button-gold" href={calendlyBookingUrl} target="_blank" rel="noreferrer">Continue to Calendly <ArrowRight size={15}/></a>}</div> : <><h3>Review and submit</h3><p className="form-helper">We’ll save these details and your resume before you continue to Calendly.</p><div className="roadmap-preview"><div className="roadmap-preview-top"><span className="roadmap-icon"><FileText size={16}/></span><div><span>YOUR CONTACT DETAILS</span><strong>{name}</strong></div></div><div className="roadmap-row"><i>01</i><span>Phone / email</span><b>{phone} · {email}</b></div><div className="roadmap-row"><i>02</i><span>Current location</span><b>{location.toUpperCase()}</b></div><div className="roadmap-row"><i>03</i><span>Status / target role</span><b>{status.toUpperCase()} · {role.toUpperCase()}</b></div><div className="roadmap-row"><i>04</i><span>Resume / pre-call note</span><b>{resume?.name} · {notes ? 'NOTE INCLUDED' : 'OPTIONAL'}</b></div></div><label className="consent-check"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)}/><span>I agree to share these details and my resume with SPREAD GLOBAL for career support.</span></label>{saveError && <p className="resume-error" role="alert">{saveError}</p>}<div className="intake-actions"><button className="button button-gold" disabled={saving || !consent} onClick={saveIntake}>{saving ? 'Saving your details…' : 'Save details & continue'} <ArrowRight size={15}/></button></div><p className="privacy-note">Your resume is named using your name, location, and target role, then stored with your intake record.</p></>)}
        </motion.div></AnimatePresence>
        {step < 4 && <div className="form-controls">{step > 1 ? <button className="form-back" onClick={() => setStep(step - 1)}><ArrowLeft size={15}/> Back</button> : <span className="form-back-hint">YOUR DETAILS STAY IN THIS INTAKE.</span>}<button className="button button-gold" disabled={!canContinue} onClick={next}>Continue <ArrowRight size={15}/></button></div>}
    </div>
  </div>

  if (modal) return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeAndReset() }}><motion.div className="assessment-modal" role="dialog" aria-modal="true" aria-label="Career roadmap assessment" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}><button className="modal-close" onClick={closeAndReset} aria-label="Close assessment"><X size={19}/></button>{content}</motion.div></div>
  return <section className="assessment-section section-dark" id="assessment"><div className="page-wrap">{content}</div></section>
}
