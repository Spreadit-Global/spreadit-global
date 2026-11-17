# spread-global

A responsive corporate website for SPREAD GLOBAL, presenting its end-to-end technology career lifecycle through an interactive S.P.R.E.A.D. journey, candidate lifecycle tracker, service engines, mentor network, founder profiles, and a direct link to Google Forms for strategy call details and optional resume upload.

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

The website's **Start your journey**, **Book a strategy call**, and **Get started** actions open the Google Form at `https://forms.gle/hbQazpkqBAuVyLaP7`. Google Forms writes form answers to the linked spreadsheet; Apps Script moves an optional uploaded resume into the Drive folder and renames it as `name-location-job-title-years-of-experience.ext`, for example `nachiketh_joshi-dallas-software_engineer-4.pdf`. Date of birth is not collected. There is no local workbook or resume storage in this repository.

All candidate intake actions open Google Forms directly in the same tab. There is no separate website questionnaire. After submission, candidates follow the Calendly link in the Google Form confirmation message. Google Forms does not provide a native automatic redirect after submission. Set the confirmation message in the Form editor under **Settings ? Presentation ? Confirmation message** to:

> Thank you. Your response has been recorded. Next, book your strategy call: https://calendly.com/spreadittech/30min

### One-time Google setup

1. Make sure the Google Form contains questions with these exact titles because the response trigger uses them: `Full name`, `Phone number`, `Email address`, `Current location`, `Current status`, `Target role`, `Years of experience`, and `Anything you would like us to know before our call?`.
2. In the Form editor, add an optional **File upload** question titled exactly `Resume (optional)`. Restrict it to PDF, DOC, and DOCX if those options are available. Google Forms requires respondents to sign in to a Google account to upload a file.
3. Open the response spreadsheet at `https://docs.google.com/spreadsheets/d/1F-IlBo8Gb84TpGWGjsK0WS3NC3N_vvoFPOenJ_i4Hf/edit`, choose **Extensions → Apps Script**, and paste `google-apps-script/Code.gs` into the project.
4. Confirm the spreadsheet ID and Drive folder ID in `SPREAD_CONFIG` match your resources. The Drive folder is `https://drive.google.com/drive/folders/161MAnEFYVdnVBSDDiLoE3CbcNrCVuvSk`.
5. In Apps Script, select and run `connectSpreadGlobalForm` once. Review the requested Google permissions and authorize it as the account that owns or can edit the Form, Sheet, and Drive folder. The script links the Form to the Sheet, installs the submit trigger, and sets the confirmation message to the Calendly link.
6. If `FormApp.openByUrl` rejects the short responder URL, replace `formUrl` in `SPREAD_CONFIG` with the Form editor URL (the URL ending in `/edit`) and run `connectSpreadGlobalForm` again.
7. In **Apps Script → Executions**, confirm the setup run succeeded. Submit a test response with a test resume and confirm the response row is added and the file appears in the Drive folder with the expected name.

The upload trigger adds `Stored resume filename`, `Stored resume Drive link`, and `Resume processing status` columns to the response sheet. Duplicate filenames receive a numeric suffix to avoid overwriting an earlier resume. Uploaded resumes are stored by Google Forms first, then moved by the authorized Apps Script trigger. Keep the spreadsheet and Drive folder shared only with staff who need candidate information.

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds and deploys the site whenever changes are pushed to `main`. The project Pages URL is `https://spreadit-global.github.io/spreadit-global/`. In repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The production build uses `/spreadit-global/` as its base path so JavaScript, CSS, and image assets load from the project Pages URL.

GitHub Pages is static hosting, but this intake works because the website opens Google Forms directly; responses and resume processing are handled by Google Forms and Apps Script, not by a local API.
