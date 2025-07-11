# Sora Fullstack Project

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Code Quality Tools

This project uses both TypeScript and ESLint to ensure code quality:

### TypeScript Type Checking

Run the TypeScript compiler to check for type errors:

```bash
pnpm type-check
```

### ESLint Code Quality Checks

Run ESLint to check for code quality issues:

```bash
pnpm lint
```

### Combined Check

Run both TypeScript and ESLint checks at once:

```bash
pnpm check
```

### Pre-commit Hook

A pre-commit hook is configured using Husky to run both TypeScript and ESLint checks before each commit. This ensures that code quality is maintained throughout the development process.

## Database Management

This project uses Drizzle ORM for database management:

```bash
# Generate database schema
pnpm db:generate

# Push schema changes to the database
pnpm db:push

# Revert schema changes
pnpm db:revert
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
