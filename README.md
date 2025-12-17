Here is the **correct, clean `README.md` content** with **no comments, no extra text, nothing removed or added**.
You can **directly copy-paste this** into your `README.md`.

````md
## Firebase Setup (Quick Start)

This project uses Firebase Authentication and Firestore.  
Firebase SDK is centrally configured for easy reuse across the application.

### 1. Create environment file

Create `.env.local` using the provided template:

```bash
cp .env.local.example .env.local
````

Add Firebase credentials from:
Firebase Console → Project Settings → General → Web App

Do not commit `.env.local`
`.env.local.example` is committed for reference

---

### 2. Firebase initialization

Firebase SDK is initialized in:

```
src/lib/firebase.ts
```

This file:

* Uses environment variables
* Contains no hardcoded values
* Exports Firebase Auth and Firestore
* Includes error handling

---

### 3. Import Firebase services

Import Firebase only in files where authentication or database access is required:

```ts
import { auth, db } from "@/lib/firebase";
```

* `auth` → Firebase Authentication
* `db` → Firestore Database

---

### 4. Run the project

```bash
npm run dev
```

```

This is **final, correct, and ticket-ready**.  
If you want, paste your **entire README** and I’ll verify placement and formatting line-by-line.
```
