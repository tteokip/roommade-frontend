# roommade-frontend

Roommade - 청년 자립 준비 지원 플랫폼 프론트엔드 서버

## 기술 스택

Vue 3 + Vite / Pinia / Vue Router / TanStack Query / Tailwind CSS / Zod / axios


## 디렉터리 구조

```text
src/
├── api/          # axios 인스턴스, 백엔드 API 호출 함수
├── assets/       # 이미지, 폰트 등 정적 자원
├── components/   # 페이지·기능 중심 컴포넌트
├── composables/  # Vue Composition 함수
├── constants/    # 상수
├── router/       # Vue Router 설정
├── shared/ui/    # 여러 화면에서 재사용하는 범용 UI
├── stores/       # Pinia 스토어
├── utils/        # 유틸리티 함수
├── views/        # 라우트에 매핑되는 페이지 컴포넌트
├── App.vue
├── main.js
└── style.css
```

## 로컬 실행 방법

1. 저장소를 clone 합니다.

2. 환경 변수 파일을 준비합니다 (로컬 전용 값이며 `.gitignore` 처리됨).

   ```bash
   cp .env.example .env
   ```

3. 의존성을 설치합니다 (`npm install` 시 `prepare` 스크립트가 `lefthook install`을 자동 실행합니다).

   ```bash
   npm install
   ```

4. 로컬 백엔드(Java 17 + Spring Legacy + MyBatis + MySQL)를 `http://localhost:8080`에서
   먼저 실행합니다. 백엔드 저장소의 실행 방법은 `roommade-backend`의 README를 참고하세요.

5. 개발 서버를 기동합니다.

   ```bash
   npm run dev
   ```

   Vite 개발 서버가 `http://localhost:5173`에서 뜨고, `/api` 요청은 vite proxy를 통해
   로컬 백엔드(`localhost:8080`)로 전달됩니다 (`vite.config.js` 참고). 별도 CORS 설정이
   필요 없습니다.

## 빌드 · 린트 · 포맷

- 빌드: `npm run build`
- 린트: `npm run lint` (`eslint . --fix`)
- 포맷: `npm run format` (`prettier . --write`)

## 기여 가이드

브랜치 전략, 커밋 컨벤션, PR 규칙, 코드 리뷰 규칙은
[CONTRIBUTING.md](./CONTRIBUTING.md)를 참고하세요.
