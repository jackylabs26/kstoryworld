This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Content Pipeline

KStoryWorld의 일일 콘텐츠는 카테고리별 n8n 워크플로가 생성하고, Paperclip routine이 매일 04:00 KST에 kickoff합니다.

| 디렉터리 | 설명 |
|----------|------|
| [`n8n-workflows/`](./n8n-workflows) | 카테고리별 n8n 워크플로 JSON + dry-run 샘플. 현재 K-Beauty 1종 commit. |
| [`board-routine/`](./board-routine) | Paperclip routine이 호출하는 `*-kickoff.sh` + 공용 `lib.sh` (키워드 풀, n8n webhook 호출). |

발행 게이트는 [`npm run check:no-ai-copy`](./package.json) + 워크플로 내부 12-check + 의료·효능 단정 가드를 모두 통과해야 합니다.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
