import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from './firebase.js';
import { useStore } from './store.jsx';
import { reviewSummary, sampleReviews } from './reviews.js';

const Stars = ({ n, size = 14 }) => (
  <span className="stars" style={{ fontSize: size }}>
    {'★★★★★'.slice(0, n)}<span className="off-star">{'★★★★★'.slice(n)}</span>
  </span>
);

// 실제 리뷰(Firestore reviews 컬렉션)는 '구매 확인'으로 맨 위에, 그 아래 예시 리뷰
export default function Reviews({ p }) {
  const { user, orders } = useStore();
  const samples = useMemo(() => sampleReviews(p), [p]);
  const summary = useMemo(() => reviewSummary(p, samples), [p, samples]);
  const [real, setReal] = useState([]);
  const [sort, setSort] = useState('best');
  const [photoOnly, setPhotoOnly] = useState(false);
  const [shown, setShown] = useState(5);
  const [liked, setLiked] = useState({});
  const [form, setForm] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    getDocs(query(collection(db, 'reviews'), where('productId', '==', p.id)))
      .then((s) => setReal(s.docs.map((d) => ({ id: d.id, ...d.data(), real: true }))))
      .catch(() => setReal([]));
  }, [p.id]);

  const bought = orders.some((o) => o.items.some((it) => it.id === p.id));
  const mine = user && real.find((x) => x.uid === user.uid);
  const total = p.reviews + real.length;

  const list = useMemo(() => {
    let l = [...real.map((x) => ({ ...x, date: x.createdAt?.toDate?.().toISOString().slice(0, 10) || '방금' })), ...samples];
    if (photoOnly) l = l.filter((x) => x.photo);
    const by = {
      best: (a, b) => (b.real - a.real) || b.helpful - a.helpful,
      new: (a, b) => (b.date > a.date ? 1 : -1),
      high: (a, b) => b.rating - a.rating,
      low: (a, b) => a.rating - b.rating,
    }[sort];
    return l.sort(by);
  }, [real, samples, sort, photoOnly]);

  const submit = async (e) => {
    e.preventDefault();
    if (form.text.trim().length < 10) return setErr('리뷰는 10자 이상 써주세요.');
    const order = orders.find((o) => o.items.some((it) => it.id === p.id));
    const it = order.items.find((x) => x.id === p.id);
    const data = {
      productId: p.id, uid: user.uid, user: user.name.slice(0, 1) + '**', rating: form.rating, text: form.text.trim().slice(0, 500),
      option: `${it.color} / ${it.size}`, fit: form.fit || null, helpful: 0, createdAt: serverTimestamp(),
    };
    try {
      const ref = await addDoc(collection(db, 'reviews'), data);
      setReal([{ id: ref.id, ...data, real: true, createdAt: null }, ...real]);
      setForm(null); setErr('');
    } catch (e2) { setErr('저장에 실패했습니다: ' + e2.message); }
  };
  const remove = async (r) => {
    if (!confirm('리뷰를 삭제할까요?')) return;
    await deleteDoc(doc(db, 'reviews', r.id));
    setReal(real.filter((x) => x.id !== r.id));
  };

  const isApparel = summary.fit != null;

  return (
    <section className="reviews">
      <h2 className="section-title">리뷰 <span className="muted">{total.toLocaleString()}</span></h2>

      <div className="rv-summary">
        <div className="rv-score">
          <b>{p.rating}</b>
          <Stars n={Math.round(p.rating)} size={20} />
          <span className="muted">{total.toLocaleString()}개 리뷰</span>
        </div>
        <div className="rv-bars">
          {summary.dist.map((v, k) => (
            <div key={k} className="rv-bar"><span>{5 - k}점</span><div><i style={{ width: `${v * 100}%` }} /></div><em>{Math.round(v * 100)}%</em></div>
          ))}
        </div>
        {isApparel && (
          <div className="rv-fit">
            <p>사이즈</p>
            {summary.fit.map(([f, v]) => <div key={f} className={`rv-bar ${f === '정사이즈' ? 'main' : ''}`}><span>{f}</span><div><i style={{ width: `${v}%` }} /></div><em>{v}%</em></div>)}
          </div>
        )}
      </div>

      <div className="rv-write">
        {!user ? <p className="muted">로그인 후 구매한 상품에 리뷰를 쓸 수 있어요.</p>
          : mine ? <p className="muted">이 상품에 리뷰를 작성했어요.</p>
          : !bought ? <p className="muted">이 상품을 구매하면 리뷰를 쓸 수 있어요.</p>
          : !form ? <button className="btn outline" onClick={() => setForm({ rating: 5, text: '', fit: '' })}>리뷰 쓰기</button>
          : (
            <form onSubmit={submit} className="rv-form">
              <div className="rv-pick">{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} className={n <= form.rating ? 'on' : ''} onClick={() => setForm({ ...form, rating: n })}>★</button>)}</div>
              {isApparel && <div className="chips">{['작아요', '정사이즈', '커요'].map((f) => <button type="button" key={f} className={form.fit === f ? 'on' : ''} onClick={() => setForm({ ...form, fit: f })}>{f}</button>)}</div>}
              <textarea value={form.text} maxLength={500} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="착용감, 사이즈, 색감 등을 알려주세요 (10자 이상)" />
              {err && <p className="msg">{err}</p>}
              <div className="actions"><button type="button" className="btn outline" onClick={() => setForm(null)}>취소</button><button className="btn">등록</button></div>
            </form>
          )}
      </div>

      <div className="rv-tools">
        <div className="chips">
          {[['best', '추천순'], ['new', '최신순'], ['high', '별점 높은순'], ['low', '별점 낮은순']].map(([v, l]) => <button key={v} className={sort === v ? 'on' : ''} onClick={() => setSort(v)}>{l}</button>)}
        </div>
        <label className="rv-photo-only"><input type="checkbox" checked={photoOnly} onChange={(e) => setPhotoOnly(e.target.checked)} /> 포토 리뷰만</label>
      </div>

      {list.slice(0, shown).map((r) => (
        <div key={r.id} className="rv-item">
          <div className="rv-head">
            <Stars n={r.rating} />
            <b>{r.user}</b>
            {r.real && <span className="rv-badge">구매 확인</span>}
            <span className="muted">{r.date}</span>
            {r.real && user && r.uid === user.uid && <button className="link" onClick={() => remove(r)}>삭제</button>}
          </div>
          <div className="rv-opt">
            구매옵션 {r.option}{r.fit && <> · <b>{r.fit}</b></>}
            {r.body && <span className="muted"> · {r.body}</span>}
          </div>
          <p className="rv-text">{r.text}</p>
          {r.photo && <img className="rv-photo" src={p.image.replace('w=700', 'w=240')} alt="리뷰 사진" loading="lazy" style={{ objectPosition: `${(r.helpful * 13) % 100}% ${(r.helpful * 7) % 100}%` }} />}
          <button className={`rv-help ${liked[r.id] ? 'on' : ''}`} onClick={() => setLiked({ ...liked, [r.id]: !liked[r.id] })}>
            👍 도움돼요 {(r.helpful || 0) + (liked[r.id] ? 1 : 0)}
          </button>
        </div>
      ))}
      {shown < list.length && <button className="btn outline more" onClick={() => setShown(shown + 10)}>리뷰 더 보기</button>}
      {!list.length && <p className="empty">조건에 맞는 리뷰가 없습니다.</p>}
    </section>
  );
}
