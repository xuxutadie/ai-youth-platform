# AI Youth Platform

[简体中文](README.md) · [Deployment](docs/deployment.md) · [Contributing](CONTRIBUTING.md) · [Roadmap](ROADMAP.md)

A web platform for youth AI education: organize student projects, competitions, honors, and course content, with student, teacher, and administrator roles.

> Open-source preparation is in progress; v1.0.0 has not been released. Outstanding dependency and application security work blocks a production-ready release. Do not deploy publicly with real student data before completing the [release checklist](docs/releases/v1.0.0-checklist.md).

## Implemented areas

- Student projects: image, video, and HTML uploads, project details, and personal work lists.
- Competition and honor listings, detail pages, and content management.
- Course listings, details, and uploads.
- Registration, login, profile editing, password changes, and email password reset.
- Student, teacher, and administrator roles, enforced by individual API routes.
- Administration pages for content, users, website settings, and storage configuration.
- Search and homepage content presentation.

AI describes the education context. This repository does not currently implement an LLM chat or AI generation service. The presence of an administration page does not establish that every operational feature is complete.

## Stack and persistence

Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, MongoDB / Mongoose, JWT, bcrypt, and Nodemailer. MongoDB stores account and content records; some upload metadata and settings are local JSON files. Uploads primarily use local disk. Existing Cloudinary image-domain settings do not implement a cloud upload backend.

## Local development

Prepare Node.js, npm, and an isolated MongoDB database. The locked Next.js package declares Node.js 18.17 as its minimum; this is a compatibility floor, not a production runtime recommendation. This preparation was checked with Node.js 24.11.1 and npm 11.6.2.

```bash
git clone https://github.com/xuxutadie/ai-youth-platform.git
cd ai-youth-platform
npm ci
```

Create your own `.env.local` at the repository root:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/ai-youth-platform-dev
JWT_SECRET=REPLACE_WITH_A_RANDOM_SECRET_AT_LEAST_32_CHARACTERS
JWT_RESET_SECRET=REPLACE_WITH_ANOTHER_RANDOM_SECRET_AT_LEAST_32_CHARACTERS
USE_MOCK_DB=false
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Replace both placeholder secrets with independent random values, at least 32 characters each. Generate a value with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
npm run dev
```

Visit [localhost:3000](http://localhost:3000). Registration creates students only. Bootstrap the first administrator by manually assigning the role to a verified account in the isolated database; archived registration scripts are not an administrator provisioning workflow.

Mock authentication requires both development mode and explicit `USE_MOCK_DB=true`. It accepts demo passwords and must never be exposed publicly. SMTP configuration, persistence requirements, and deployment limitations are documented in the [deployment guide](docs/deployment.md).

## Verification

```bash
npm run type-check
npm run lint
node --test tests/security/auth.test.cjs
npm run build
npm audit --registry=https://registry.npmjs.org
```

Security regression tests use isolated database and mail doubles. Archived scripts under `tests/manual/` may mutate or delete data and are not an automated test suite.

## Repository layout

- `src/`: application pages, APIs, components, and models.
- `public/`: static application assets.
- `tests/security/`: executable authentication regression tests.
- `tests/manual/`: historical debugging scripts and browser fixtures.
- `docs/development-history/`: archived reports, not current verification evidence.
- `docs/releases/`: release draft and readiness checklist.
- `.github/`: issue and pull request templates.

## Community and scope

Intended uses include teaching showcases, competition archives, and educational customization. No school adoption, user counts, downloads, or maintenance history are claimed without evidence. No verified public demo or classroom screenshots are currently provided.

Use [Issues](https://github.com/xuxutadie/ai-youth-platform/issues) for ordinary bugs and suggestions; see [CONTRIBUTING](CONTRIBUTING.md), [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md), and [SECURITY](SECURITY.md). Maintainer: [xuxutadie](https://github.com/xuxutadie).

Licensed under [MIT](LICENSE). Third-party dependencies and assets retain their own licenses; see [asset notes](docs/third-party-assets.md).
