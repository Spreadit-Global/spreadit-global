# spread-global

A responsive corporate website for SPREAD GLOBAL, presenting its end-to-end technology career lifecycle through an interactive S.P.R.E.A.D. journey, candidate lifecycle tracker, service engines, mentor network, founder profiles, and a four-step strategy call intake for contact details, role/status, resume, and pre-call notes.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Create a production build with `npm run build`; preview it with `npm run preview`.

## Stack

- React + Vite + TypeScript (strict)
- Tailwind CSS v4 through its Vite plugin
- Framer Motion for transform/opacity reveals and state transitions
- Lucide React icons

The primary visual system and responsive layout rules live in `src/site.css`; reusable page sections are in `src/components/`.

## Candidate intake integration

The form collects name, phone, email, current location, experience/status, target role, years of experience, optional notes, and an optional resume. Date of birth is not collected. Local file/workbook persistence has been removed. Until Google Sheets and Drive are configured, submissions are rejected with a clear message and no candidate information is saved. Do not put candidate data, credentials, or service-account keys in GitHub.

Once connected, the intended resume name is `name-location-job-title-years-of-experience.ext` (for example, `nachiketh_joshi-dallas-software_engineer-4.pdf`). Calendly receives the candidate name and email after the external submission succeeds.

To configure the external integration, provide the Google Sheet URL and Drive folder URL, and confirm the sheet tab name (default: `Candidates`). The Sheet and Drive folder must be shared with a Google service account as an editor. The service-account email can be shared here so you can grant access; keep its JSON private key out of chat and Git, and configure it as a secret file/environment credential on the backend host. The hosting platform must run the Express API and securely store credentials and uploaded resumes.

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds and deploys the site whenever changes are pushed to `main`. The project Pages URL is `https://spreadit-global.github.io/spreadit-global/`. In repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The production build uses `/spreadit-global/` as its base path so JavaScript, CSS, and image assets load from the project Pages URL.

GitHub Pages is static hosting and does not run the Express API. The candidate intake therefore cannot submit to Google Sheets or upload resumes to Drive from this deployment until a secure backend/API integration is configured. The page displays an error instead of claiming a submission was saved. Use a host that runs the Express server and configure the Google integration there.
