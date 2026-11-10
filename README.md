# LOOKBOOK — 패션 쇼핑몰 (포트폴리오용 데모)

React + Vite로 만든 패션 쇼핑몰 데모 사이트입니다. 실제 결제는 이루어지지 않습니다.

## 기능

- 상품 약 1,000개 · 카테고리 8개 · 세부 분류 40여 개 (상의, 하의, 트레이닝, 커플룩, 원피스, 아우터, 신발, 가방/액세서리)
- 검색 · 브랜드 필터 · 정렬(신상품/인기/가격/할인율) · 40개씩 더 보기
- 상품 상세: 색상·사이즈·수량 선택, 리뷰(별점 분포, 사이즈 평가, 포토 리뷰, 정렬)
- 장바구니 → 주문/결제(데모) → 주문 완료
- 회원가입·로그인(Firebase Authentication), 마이페이지(주문내역·좋아요)
- 장바구니·좋아요·주문내역·리뷰는 Firestore에 저장
- 커플룩(남녀 사이즈 조합), 럭셔리 컬렉션

## 실행

```bash
npm install
npm run dev
```

## 구성

| 파일 | 내용 |
|---|---|
| `src/App.jsx` | 화면(메인, 목록, 상세, 장바구니, 결제, 로그인, 마이페이지) |
| `src/store.jsx` | 로그인·장바구니·좋아요·주문 상태와 Firestore 저장 |
| `src/Reviews.jsx`, `src/reviews.js` | 리뷰 화면, 상품별 예시 리뷰 생성 |
| `src/data.js` | 카테고리·세부 분류 규칙, 직접 고른 상품 |
| `src/generated.js`, `src/korean.js` | Unsplash API로 모은 상품 (사진 작가 정보 포함) |
| `firestore.rules` | Firestore 보안 규칙 (같은 Firebase 프로젝트를 쓰는 다른 프로젝트와 공용) |

## 사진 · 이름

- 상품 사진은 모두 [Unsplash](https://unsplash.com/?utm_source=lookbook_portfolio&utm_medium=referral) 사진입니다 (Unsplash License). API로 가져온 사진은 상품 상세에 작가 이름을 표시합니다.
- 브랜드 이름(NORDLINE, ORVELLE ATELIER 등)은 모두 가상의 이름이며, 실제 브랜드 로고가 보이는 사진은 제외했습니다.
- 리뷰 중 '구매 확인' 표시가 없는 리뷰는 데모용 예시입니다.
