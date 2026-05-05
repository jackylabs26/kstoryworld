# JAC-2007: admin.kstoryworld.com Vercel + Supabase Auth 설정

## 이번 하트비트 산출물 (2026-05-05)

- `admin/app/admin` 접근 보호를 로컬 비밀번호 게이트에서 Supabase magic link 인증으로 전환.
- `/admin/login` 로그인 화면 및 서버 액션 추가.
- `/auth/callback` 코드 교환 라우트 추가.
- Next.js 16 `admin/proxy.ts`로 `/admin/:path*` 보호 적용.

## 필요한 Vercel 환경변수

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_ADMIN_SITE_URL` 예: `https://admin.kstoryworld.com`
- `ADMIN_ALLOWED_EMAILS` 예: `jackylabs26@gmail.com` (미설정 시 코드 기본값도 동일)

## Vercel 프로젝트 생성/연결 절차

1. Vercel CLI 로그인

```bash
vercel login
```

2. admin 전용 프로젝트 링크 (`admin/` 디렉토리에서 실행)

```bash
cd admin
vercel link --yes --project kstoryworld-admin --scope jackylabs26
```

3. 환경변수 등록 (Production/Preview 모두)

```bash
printf "%s" "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
printf "%s" "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL preview

printf "%s" "$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production
printf "%s" "$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY preview

printf "%s" "https://admin.kstoryworld.com" | vercel env add NEXT_PUBLIC_ADMIN_SITE_URL production
printf "%s" "https://admin-kstoryworld.vercel.app" | vercel env add NEXT_PUBLIC_ADMIN_SITE_URL preview

printf "%s" "$ADMIN_ALLOWED_EMAILS" | vercel env add ADMIN_ALLOWED_EMAILS production
printf "%s" "$ADMIN_ALLOWED_EMAILS" | vercel env add ADMIN_ALLOWED_EMAILS preview
```

4. 도메인 연결

```bash
vercel domains add admin.kstoryworld.com
```

5. 배포

```bash
vercel --prod
```

## Supabase Dashboard 체크포인트

1. Authentication > URL Configuration
- Site URL: `https://admin.kstoryworld.com`
- Redirect URLs:
  - `https://admin.kstoryworld.com/auth/callback`
  - `https://admin-kstoryworld.vercel.app/auth/callback`

2. Authentication > Providers > Email
- Magic Link 활성화
- Confirm email 정책 팀 정책에 맞게 확인

3. 사용자 온보딩
- `shouldCreateUser: false` 이므로 관리자는 Supabase Auth 사용자로 사전 생성 필요

## 검증 체크리스트

1. 비로그인 상태에서 `/admin` 접근 시 `/admin/login` 리다이렉트
2. 허용 이메일로 매직 링크 수신/클릭 후 `/admin` 진입
3. 미허용 이메일 입력 시 에러 노출
4. 로그인 후 `/admin/login` 접근 시 `/admin` 리다이렉트

## 다음 액션

- Supabase Auth에 관리자 계정 시드(초기 사용자 등록) 자동화 스크립트 추가
- 로그아웃 버튼 및 세션 만료 UX 추가
