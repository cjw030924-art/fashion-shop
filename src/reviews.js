// 상품마다 고정된 예시 리뷰 만들기 (상품 id 로 시드를 정해서 새로고침해도 같은 리뷰)
const rand = (seed) => { let s = seed % 2147483647 || 1; return () => (s = (s * 48271) % 2147483647) / 2147483647; };
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

const NICK = ['cjw', 'minji', 'hoon', 'sora', 'jyp', 'daeun', 'kimss', 'leehj', 'parkmk', 'yuna', 'seoyeon', 'jiho', 'hana', 'woo', 'mint', 'byul', 'dlwl', 'tjdn', 'gkdl', 'rlaa', 'qwer', 'ssong', 'yoon', 'chae', 'haru', 'nana', 'jun', 'sky', 'bom', 'gyul'];
const mask = (r) => { const n = pick(r, NICK); return n.slice(0, Math.min(3, n.length)) + '***'; };

const APPAREL = ['상의', '하의', '트레이닝', '원피스', '아우터', '커플룩'];
const TEXT = {
  옷: {
    5: ['재질이 생각보다 훨씬 좋아요. 두께감도 적당하고 비침도 없어요.', '핏이 너무 예뻐요. 같은 거 다른 색으로 하나 더 샀어요 ㅎㅎ', '사진이랑 색감 거의 똑같아요. 세탁 한 번 했는데 줄어들지도 않았어요.', '가격 대비 퀄리티 최고입니다. 박음질도 꼼꼼해요.', '평소 입던 사이즈로 샀는데 딱 맞아요. 데일리로 잘 입을 것 같아요.', '친구가 어디서 샀냐고 물어봤어요. 대만족!', '촉감이 부드러워서 맨살에 닿아도 안 따가워요.'],
    4: ['전체적으로 만족하는데 배송이 하루 늦었어요.', '예쁜데 생각보다 살짝 커요. 한 치수 작게 사도 될 듯해요.', '색은 사진보다 조금 더 어두워요. 그래도 예뻐요.', '무난하게 입기 좋아요. 보풀은 좀 지켜봐야 할 것 같아요.', '핏은 좋은데 기장이 살짝 길어요.'],
    3: ['나쁘진 않은데 가격 생각하면 그냥 그래요.', '실밥이 좀 나와 있었어요. 잘라서 입고 있어요.', '생각했던 핏이랑 달라서 아쉬워요.'],
    2: ['사이즈가 너무 작게 나왔어요. 교환 신청했습니다.', '세탁 후 조금 줄었어요.'],
    1: ['색이 사진이랑 완전 달라요. 반품했어요.'],
  },
  신발: {
    5: ['발볼 넓은 편인데 편하게 잘 맞아요.', '하루 종일 신고 걸어도 발이 안 아파요!', '쉐입이 예뻐서 어디에나 잘 어울려요.', '정사이즈로 주문했는데 딱 맞아요. 쿠션감 좋아요.'],
    4: ['예쁜데 처음엔 뒤꿈치가 살짝 까졌어요. 길들이면 괜찮아요.', '반 치수 크게 나온 것 같아요. 깔창 넣고 신어요.', '전체적으로 만족해요. 박스가 좀 찌그러져서 왔어요.'],
    3: ['발볼이 좁아서 오래 신으면 좀 불편해요.', '디자인은 좋은데 생각보다 무거워요.'],
    2: ['한 달 신었는데 밑창이 벌써 닳았어요.'],
    1: ['사이즈가 너무 작아서 못 신어요.'],
  },
  가방: {
    5: ['수납 공간이 생각보다 넉넉해요. 노트북도 들어가요.', '가죽 냄새도 안 나고 마감이 깔끔해요.', '어떤 옷에도 잘 어울려서 매일 들고 다녀요.'],
    4: ['예쁜데 스트랩 길이 조절이 조금 불편해요.', '사진보다 살짝 작아요. 그래도 만족!'],
    3: ['무게가 좀 있는 편이에요.'],
    2: ['지퍼가 조금 뻑뻑해요.'],
    1: ['모서리에 흠집이 있었어요.'],
  },
  주얼리: {
    5: ['광택이 너무 예뻐요. 선물했는데 엄청 좋아했어요.', '피부 트러블 없이 잘 하고 다녀요.', '포장이 고급스러워서 선물용으로 딱이에요.', '실물이 사진보다 훨씬 반짝여요.'],
    4: ['예쁜데 생각보다 조금 작아요.', '마음에 들어요. 잠금이 조금 빡빡해요.'],
    3: ['사진보다 큐빅 반짝임이 덜해요.'],
    2: ['한 달 만에 살짝 변색됐어요.'],
    1: ['배송 중 파손돼서 왔어요.'],
  },
  기타: {
    5: ['딱 원하던 디자인이에요. 만족합니다.', '마감이 깔끔하고 튼튼해요.', '선물용으로 샀는데 반응 최고였어요.'],
    4: ['괜찮아요. 배송이 조금 늦었어요.', '생각보다 크기가 살짝 작아요.'],
    3: ['그냥 무난해요.'],
    2: ['기대보다 퀄리티가 아쉬워요.'],
    1: ['불량이라 교환했어요.'],
  },
};
const COUPLE_EXTRA = ['남자친구랑 같이 입었는데 사진 너무 잘 나왔어요 💑', '여행 갈 때 맞춰 입으려고 샀어요. 둘 다 사이즈 딱 맞아요!', '커플룩 촌스러울까 걱정했는데 은근하게 맞춘 느낌이라 좋아요.'];
const LUX_EXTRA = ['고가라 고민 많이 했는데 실물 보니 후회 없어요.', '정품 보증서랑 케이스 다 잘 왔어요. 퀄리티가 확실히 달라요.', '매장보다 저렴하게 샀어요. 마감이 정말 완벽합니다.'];

const kind = (p) => (APPAREL.includes(p.category) ? '옷' : p.category === '신발' ? '신발' : p.sub === '주얼리' || p.sub === '시계' ? '주얼리' : p.sub === '가방' ? '가방' : '기타');

// 평균 별점에 맞는 별점 하나 뽑기
// 5점 비율 p5, 나머지는 4점 60% · 3점 25% · 2점 10% · 1점 5% → 기대 평균 = 3.4 + 1.6 × p5 = avg
const starFor = (r, avg) => {
  const p5 = Math.min(0.97, Math.max(0.05, (avg - 3.4) / 1.6));
  const x = r();
  if (x < p5) return 5;
  const y = (x - p5) / (1 - p5);
  return y < 0.6 ? 4 : y < 0.85 ? 3 : y < 0.95 ? 2 : 1;
};
// 리뷰 내용에 사이즈 얘기가 있으면 사이즈 평가도 그에 맞춤
const fitFromText = (t) => (/커요|크게|커서|작게 사도/.test(t) ? '커요' : /작게 나왔|너무 작|작아서|작아요/.test(t) ? '작아요' : /딱 맞|정사이즈|사이즈 딱/.test(t) ? '정사이즈' : null);

export function sampleReviews(p) {
  const r = rand(p.id * 7919 + 13);
  const k = kind(p);
  const n = Math.min(p.reviews, 30);
  const today = new Date('2026-11-10');
  const list = [];
  for (let i = 0; i < n; i++) {
    const rating = starFor(r, +p.rating);
    let text = pick(r, TEXT[k][rating]);
    if (p.couple && rating >= 4 && r() < 0.7) text = pick(r, COUPLE_EXTRA) + ' ' + text;
    if (p.price >= 1000000 && rating >= 4 && r() < 0.7) text = pick(r, LUX_EXTRA) + ' ' + text;
    const day = new Date(today - Math.floor(r() * 400) * 86400000);
    const fit = k === '옷' || k === '신발' ? (fitFromText(text) || pick(r, ['정사이즈', '정사이즈', '정사이즈', '작아요', '커요'])) : null;
    const female = r() < 0.55;
    const height = female ? 155 + Math.floor(r() * 18) : 168 + Math.floor(r() * 18);
    list.push({
      id: `s${i}`,
      user: mask(r),
      rating,
      text,
      date: day.toISOString().slice(0, 10),
      option: `${pick(r, p.colors)} / ${pick(r, p.sizes)}`,
      fit,
      body: k === '옷' ? `${female ? '여' : '남'} · ${height}cm · ${height - (female ? 108 : 104) + Math.floor(r() * 12)}kg · 평소 ${pick(r, female ? ['S', 'M'] : ['M', 'L', 'XL'])}` : null,
      photo: r() < 0.3,
      helpful: Math.floor(r() * r() * 60),
    });
  }
  return list;
}

// 전체 리뷰 수(p.reviews) 기준 별점 분포와 사이즈 평가 비율
export function reviewSummary(p, samples) {
  const dist = [5, 4, 3, 2, 1].map((s) => samples.filter((x) => x.rating === s).length / (samples.length || 1));
  const fits = samples.filter((x) => x.fit);
  const fit = fits.length ? ['작아요', '정사이즈', '커요'].map((f) => [f, Math.round((fits.filter((x) => x.fit === f).length / fits.length) * 100)]) : null;
  return { dist, fit };
}
