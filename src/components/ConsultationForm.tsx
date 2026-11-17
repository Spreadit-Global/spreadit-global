import { ArrowUpRight } from 'lucide-react'

type Props = { formUrl: string }

export function ConsultationForm({ formUrl }: Props) {
  return (
    <section className="assessment-section section-dark" id="assessment">
      <div className="page-wrap">
        <div className="assessment-content">
          <div className="assessment-heading">
            <div className="eyebrow eyebrow-dark"><span className="eyebrow-dot" /> YOUR FIRST CONVERSATION</div>
            <h2>Let?s map your<br /><em>next move.</em></h2>
            <p>Complete our Google Form, then choose a time for your strategy call using the Calendly link shown after submission.</p>
          </div>
          <div className="strategy-call-action">
            <a className="button button-gold" href={formUrl}>Book a strategy call <ArrowUpRight size={16} /></a>
          </div>
        </div>
      </div>
    </section>
  )
}
