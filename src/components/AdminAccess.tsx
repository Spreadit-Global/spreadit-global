import { ArrowUpRight, LockKeyhole } from 'lucide-react'

const configuredUrl = import.meta.env.VITE_ADMIN_DASHBOARD_URL?.trim() || ''
const dashboardUrl = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(configuredUrl)
  ? configuredUrl
  : ''

export function AdminAccess() {
  return (
    <section className="admin-access section-dark" aria-labelledby="dashboard-title">
      <div className="page-wrap">
        <a className="text-link" href="#top">← Back to website</a>
        <div className="admin-access-card">
          <LockKeyhole size={30} aria-hidden="true" />
          <div className="eyebrow eyebrow-dark">SPREAD GLOBAL · ADMIN</div>
          <h1 id="dashboard-title">Your candidate dashboard.</h1>
          <p>Manage applications, track progress, and celebrate placements. Sign in with your approved Google account to continue.</p>
          {dashboardUrl
            ? <a className="button button-gold" href={dashboardUrl}>Sign in with Google <ArrowUpRight size={16} /></a>
            : <p className="admin-access-notice" role="status">Admin sign-in is not available yet. Please contact the site administrator.</p>}
          <small>Access is restricted to approved administrators.</small>
        </div>
      </div>
    </section>
  )
}
