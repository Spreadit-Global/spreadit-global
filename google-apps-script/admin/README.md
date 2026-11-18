# Admin dashboard setup

This dashboard is a **separate Google Apps Script web app**, linked from the public site's **Dashboard** tab. Google handles sign-in. No applicant data or passwords are included in the public website build.

## 1. Create the admin project

1. Sign into Google as `spreadittech@gmail.com` and create a new **standalone** project at <https://script.google.com/>. Name it `SPREAD GLOBAL Admin`.
2. Replace its default script with `Admin.gs` from this directory. Add an HTML file named exactly `Dashboard` and paste `Dashboard.html` into it.
3. In **Project Settings**, enable **Show appsscript.json manifest file in editor**. Replace that manifest with the supplied `appsscript.json`.
4. The server is already configured with the confirmed response spreadsheet `1F-IlBo8Gb84TpGWGjsK0WS3NC3N_vvoFPOenJ_i4HfI` and response tab ID `178026769`. No Script Properties are needed for this spreadsheet. If these resources change later, optional overrides in **Project Settings > Script Properties** are:

   | Property | Value |
   | --- | --- |
   | `RESPONSE_SPREADSHEET_ID` | The ID between `/d/` and `/edit` in the replacement response spreadsheet URL. |
   | `RESPONSE_SHEET_ID` | The numeric `gid` from the replacement response tab URL. |
   | `RESPONSE_SHEET_NAME` | Optional exact response tab name instead of its ID. When present, this takes precedence over `RESPONSE_SHEET_ID`. |

Do not put this code into the resume-upload project. Keeping the admin project separate also keeps unrelated upload/setup functions out of the dashboard's callable API.

## 2. Grant admin access

The server allowlist contains exactly the requested accounts:

- `spreadittech@gmail.com`
- `admin@spreadglobal.us`
- `hr@spreadglobal.us`
- `info@spreadglobal.us`
- `manager@spreadglobal.us`
- `recruitment@spreadglobal.us`

Share the response spreadsheet with these accounts as **Editors**. Share the resume Drive folder with the same accounts using the permissions they need to review resumes. Google Workspace accounts must be actual Google accounts associated with those email addresses.

Every server read and mutation checks the signed-in email. A missing identity or an account outside this list is rejected before opening the spreadsheet. Updating the list requires changing `ADMIN_EMAILS` in the server script and redeploying.

## 3. Deploy the Google sign-in dashboard

1. Choose **Deploy > New deployment > Web app**.
2. Set **Execute as** to **User accessing the web app**. This is required for reliable identity and ensures each admin uses their own spreadsheet access.
3. Set **Who has access** to **Anyone with Google account**. Anonymous access must remain disabled. The server allowlist further limits access to the six accounts above, including the Gmail account outside the company domain.
4. Deploy, authorize requested permissions, and copy the URL ending in `/exec`.
5. Open that URL with an approved account and authorize access to email identity and spreadsheets. Google may show an unverified internal app warning until the app's OAuth consent setup is complete. Workspace policy may require the organization's Google administrator to allow it. For missing permissions or account-policy failures, fix the Google settings; do not remove the server allowlist.
6. Test a non-admin Google account: it must see **Admin access unavailable** and no application details.

Google web-app execution settings: <https://developers.google.com/apps-script/guides/web>.

## 4. Connect the website's Dashboard tab

For local development, add this to `.env.local` and restart Vite:

```dotenv
VITE_ADMIN_DASHBOARD_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

For GitHub Pages, open repository **Settings > Secrets and variables > Actions > Variables**, add repository variable `ADMIN_DASHBOARD_URL` with the `/exec` URL, then rerun the Pages deployment workflow (or push a new commit). The workflow passes this public URL into the website build. It is a location, not a credential; the deployed admin app enforces access independently.

The Dashboard tab opens a sign-in landing page. Its **Sign in with Google** action opens the protected Google web app. Until a valid deployment URL is configured, the landing page accurately reports sign-in as unavailable.

## Application data and behavior

- Every nonempty response row becomes one application. All original question titles and answers, including future additional questions, appear in **View**. Resume URLs can be opened from the detail view if the admin has Drive access.
- The first load appends a `SPREAD Application ID` column and assigns stable UUIDs to existing responses. Future responses receive IDs when next loaded. Do not edit or duplicate these IDs.
- A separate `_SPREAD_Applicant_Management` sheet stores progress stage, starred flag, removed flag, last admin email, timestamp, and record version. Applicant answers remain unchanged. Do not rename its headers. The configured numeric response tab ID continues to work if the response tab is renamed.
- Stages: New application, Resume review, LinkedIn optimization, Interview preparation, Applying, Interviewing, Offer received, Placed, and On hold.
- Stars, stage changes, and **Mark placed** persist across reloads. Refresh retrieves new form responses and other admins' edits. Search checks every response field; filters and pagination operate on the loaded application list.
- **Remove** requires confirmation and hides the application from the dashboard. It does not delete the response from Google Forms/Sheets or remove resumes from Drive. To restore it, an administrator can set its `Deleted` cell to `FALSE` in the management sheet and increment its `Version` cell, then refresh.
- Conflicting admin updates are rejected instead of overwriting each other. Refresh and retry when notified.
- **Lock dashboard** clears displayed application data from the current page. It does not sign out of Google; close the tab or sign out through Google on a shared device.
- No sample candidate data, browser storage of applications, API keys, or client-side password checks are used.

## Validation before staff use

Use a test Form response to verify: Google login, all answer fields and resume links, star persistence, every stage, Mark placed, search/filter results, conflicting updates in two tabs, removal confirmation, disappearance after refresh, and denied access for an unapproved account. Test permissions with each of the six accounts.

Local automated checks: `npm run test:admin` and `npm run build`. Browser and live Google authorization checks require the deployed web app.
