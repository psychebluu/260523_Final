# 업무 에이전트 (Day Secretary)

웹용 **업무 일정 · 리마인드** 프로토타입입니다.  
오늘 할 일 관리, 시간 지정, 미완료 알림 등을 브라우저에서 확인할 수 있습니다.

## 주요 기능

- 오늘 할 일 대시보드
- 전체 일정 목록 · 일정 추가/수정
- 시간 지정 · 우선순위 · 완료 처리
- 미완료 리마인드 토스트
- 알림 설정 (방해 금지 시간 등)
- 브라우저 localStorage 저장 (로그인·서버 DB 불필요)

## 데이터 저장 방식

업무 내역은 **서버가 아니라 브라우저 localStorage**에 저장됩니다. (`day-secretary-store` 키)

| 상황 | 데이터 유지 |
| --- | --- |
| 브라우저·탭 닫기 | 유지됨 |
| PC 재부팅 | 유지됨 |
| 같은 브라우저로 다시 접속 | 유지됨 |
| 시크릿/프라이빗 모드 | 창 닫으면 삭제됨 |
| 사이트 데이터·캐시 삭제 | 삭제됨 |
| 다른 브라우저·기기 | 공유되지 않음 |

즉, **일반 브라우저 사용 시 창을 닫아도 기록은 남습니다.**  
다만 기기 간 동기화나 서버 백업은 없습니다.

## 기술 스택

- Next.js 16 (App Router)
- TypeScript, Tailwind CSS
- Zustand (persist), date-fns
- Pretendard, shadcn/ui

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속 → `/secretary`로 이동

## 빌드

```bash
npm run build
npm run start
```

## GitHub + Vercel 배포

1. GitHub 저장소에 푸시
2. [Vercel](https://vercel.com) → **Add New Project** → 저장소 연결
3. Framework: **Next.js** (자동 감지)
4. Build Command: `npm run build` / Output: `.next` (기본값)
5. Node.js **20 이상** (package.json `engines` 참고)
6. (선택) Environment Variable: `NEXT_PUBLIC_APP_URL=https://your-app.vercel.app`

배포 후 `https://your-app.vercel.app/secretary` 로 접속합니다.

## 프로젝트 구조

```
src/
├── app/secretary/       # 페이지 (오늘, 전체 일정, 리포트, 설정)
├── components/secretary/
└── lib/secretary/       # 타입, store, 유틸
```
