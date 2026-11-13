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

## Candidate intake storage

The form collects name, phone, email, current location, experience/status, target role, optional notes, and an optional resume. Date of birth is not collected. After consent and submission, the Express API stores all entered details in the single worksheet in `src/data/candidates.xlsx` and saves a resume under `src/resumes/` only when one is provided.

Resume names use `name-location-role.ext`; for example, `alex-candidate-dallas-tx-software-engineer.pdf`. If a filename already exists, a numeric suffix is added to avoid overwriting the earlier resume. Workbook resume filename/path cells are left blank when no resume is provided. The workbook is created with one `Candidates` worksheet when the server starts, and Vite ignores both storage directories to avoid reloads when files are added.

Candidate data and resumes are excluded from Git by `.gitignore`. Keep the local folders backed up securely and restrict access because they contain personal information. Local filesystem storage is suitable only when the server runs on persistent storage; ephemeral hosting may delete these files when an instance is replaced. Calendly opens after a successful save and receives the supported `name` and `email` URL parameters.

The API accepts PDF/DOC/DOCX resumes up to 10 MB, applies per-IP rate limiting, sanitizes filenames, serializes workbook writes, and removes a saved resume if its workbook row cannot be written.

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds and deploys the site whenever changes are pushed to `main`. The project Pages URL is `https://spreadit-global.github.io/Spreadit-Global/`. In repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The production build uses `/Spreadit-Global/` as its base path so JavaScript, CSS, and image assets load from the project Pages URL.

GitHub Pages is static hosting and does not run the Express API. The candidate intake therefore cannot save to `src/data/candidates.xlsx` or `src/resumes/` on Pages; it displays a contact fallback instead of claiming the submission was saved. Use a host that runs the Express server with persistent storage to enable resume and workbook submissions.
