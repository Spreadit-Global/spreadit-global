# SPREAD GLOBAL

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

The form collects name, phone, email, current location, experience/status, target role, optional notes, and a resume. Date of birth is not collected. After consent and submission, the Express API stores all entered details in the single worksheet in `src/data/candidates.xlsx` and saves the matching resume under `src/resumes/`.

Resume names use `name-location-role.ext`; for example, `alex-candidate-dallas-tx-software-engineer.pdf`. If a filename already exists, a numeric suffix is added to avoid overwriting the earlier resume. Each workbook row includes the resume filename and relative path. The workbook is created with one `Candidates` worksheet when the server starts, and Vite ignores both storage directories to avoid reloads when files are added.

Candidate data and resumes are excluded from Git by `.gitignore`. Keep the local folders backed up securely and restrict access because they contain personal information. Local filesystem storage is suitable only when the server runs on persistent storage; ephemeral hosting may delete these files when an instance is replaced. Calendly opens after a successful save and receives the supported `name` and `email` URL parameters.

The API accepts PDF/DOC/DOCX resumes up to 10 MB, applies per-IP rate limiting, sanitizes filenames, serializes workbook writes, and removes a saved resume if its workbook row cannot be written.
