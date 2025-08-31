A complete, responsive web app for a personal trainer to collect client profiles via questionnaires.

## Tech stack
- Vue 3 + Vite + Vue Router + Pinia
- Tailwind CSS
- Firebase: Auth + Realtime Database + Hosting
- PDF generation: jsPDF + html2canvas (client-side)

## High-level features
1) Public/client area
   - Auth: email+password or magic-link; allow anonymous start then upgrade to email on submit.
   - “Start Questionnaire” page: list available questionnaires.
   - Questionnaire runner: render sections and questions (text-only answers). Save progress (autosave).
   - Submit responses; generate a PDF of the completed answers.
   - PDF includes branding header, questionnaire title, client name/email, date, each section and answers.

2) Admin area (role=admin)
   - Dashboard with counts (questionnaires, responses, clients).
   - Questionnaire Builder:
     - Create/edit questionnaire: title, description, status (draft/published).
     - Add/remove/reorder sections; add/remove/reorder questions (text type only).
     - Section-level flag `adminOnly: boolean` – if true, section is visible/editable **only** in admin fill view, not to clients.
     - Publish/unpublish questionnaire.
   - Responses management:
     - View list of responses by user/questionnaire; filter/search.
     - Open a response and fill/edit **adminOnly** sections after client submission.
     - Regenerate/download PDF including admin-only fields.
   - User management: list users, view their responses.

## Data model (Firebase Realtime Database)
- `/questionnaires/{qid}`:
  {
    "title": "Initial Assessment",
    "description": "Base intake",
    "status": "published" | "draft",
    "createdAt": 1710000000000,
    "updatedAt": 1710000000000
  }
- `/sections/{sid}`:
  {
    "questionnaireId": "{qid}",
    "title": "Medical History",
    "order": 1,
    "adminOnly": false
  }
- `/questions/{qid_}`:
  {
    "sectionId": "{sid}",
    "prompt": "Do you have any injuries?",
    "order": 1,
    "type": "text"
  }
- `/responses/{responseId}`:
  {
    "questionnaireId": "{qid}",
    "userId": "{uid}",
    "createdAt": 1710000000000,
    "submittedAt": 1710000000000 | null,
    "answers": {
      "{questionId}": { "value": "text answer", "updatedAt": 1710000000000 }
    },
    "adminAnswers": {
      // for questions inside adminOnly sections
      "{questionId}": { "value": "text answer", "updatedAt": 1710000000000 }
    }
  }
- `/users/{uid}`: { "email": "...", "name": "...", "createdAt": 1710..., "role": "admin" | "client" }