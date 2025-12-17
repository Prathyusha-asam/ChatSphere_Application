# Firebase SDK Configuration (NT-5)

## Overview
Firebase SDK is configured centrally to provide authentication and
Firestore services across the application.

## Setup
- Firebase initialized using environment variables
- Auth and Firestore instances exported from a single module
- Prevents multiple app initializations during development

## Usage
```ts
import { auth, db } from "@/lib/firebase";
