import { useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BANNERS, BRANDS, CATEGORIES, PRODUCTS, SUBCATEGORIES, won } from './data.js';
import { useStore } from './store.jsx';
import Reviews from './Reviews.jsx';

const pct = (p) => Math.round((1 - p.sale / p.price) * 100);
const byId = (id) => PRODUCTS.find((p) => p.id === Number(id));

function Img({ src, alt, seed, ...rest }) {
  const [s, setS] = useState(src);
  return <img src={s} alt={alt} loading="lazy" onError={() => setS(`https://picsum.photos/seed/${seed}/700/900`)} {...rest} />;
}

function Header() {
  const { cart, user } = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const count = cart.reduce((a, x) => a + x.qty, 0);
  return (
    <header className="header">
      <div className="topbar">신규 회원 첫 구매 10% 할인 · 5만원 이상 무료배송</div>
      <div className="header-main container">
        <Link to="/" className="logo">LOOKBOOK</Link>
        <form className="search" onSubmit={(e) => { e.preventDefault(); nav(`/products?q=${encodeURIComponent(q)}`); }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="상품, 브랜드 검색" />
          <button>검색</button>
        </form>
        <nav className="icons">
          <Link to={user ? '/mypage' : '/login'}>{user ? `${user.name}님` : '로그인'}</Link>
          <Link to="/cart" className="cart-link">장바구니{count > 0 && <span className="badge">{count}</span>}</Link>
        </nav>
      </div>
      <div className="catbar container">
        {CATEGORIES.map((c) => (
          <div key={c} className="cat-item">
            <Link to={`/products?cat=${encodeURIComponent(c)}`}>{c}</Link>
            {SUBCATEGORIES[c] && (
              <div className="dropdown">
                <Link to={`/products?cat=${encodeURIComponent(c)}`}>{c} 전체</Link>
                {SUBCATEGORIES[c].map((s) => <Link key={s} to={`/products?cat=${encodeURIComponent(c)}&sub=${encodeURIComponent(s)}`}>{s}</Link>)}
              </div>
            )}
          </div>
        ))}
        <Link to="/products?sort=sale" className="hot">SALE</Link>
      </div>
    </header>
  );
}

function ProductCard({ p }) {
  const { likes, toggleLike } = useStore();
  const liked = likes.includes(p.id);
  return (
    <div className="card">
      <Link to={`/product/${p.id}`} className="thumb">
        <Img src={p.image} alt={p.name} seed={p.id} />
      </Link>
      <button className={`like ${liked ? 'on' : ''}`} onClick={() => toggleLike(p.id)} aria-label="좋아요">{liked ? '♥' : '♡'}</button>
      <Link to={`/product/${p.id}`} className="info">
        <div className="brand">{p.brand}</div>
        <div className="name">{p.name}</div>
        <div className="price">
          {p.sale < p.price && <span className="off">{pct(p)}%</span>}
          <b>{won(p.sale)}</b>
          {p.sale < p.price && <s>{won(p.price)}</s>}
        </div>
        <div className="meta">★ {p.rating} · 리뷰 {p.reviews}</div>
      </Link>
    </div>
  );
}

function Home() {
  const [i, setI] = useState(0);
  const b = BANNERS[i];
  const best = [...PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, 8);
  const couple = PRODUCTS.filter((p) => p.couple);
  const luxury = PRODUCTS.filter((p) => p.price >= 1000000).sort((a, b) => b.price - a.price);
  const sale = [...PRODUCTS].sort((a, b) => pct(b) - pct(a)).slice(0, 4);
  return (
    <>
      <section className="hero" style={{ backgroundImage: `url(${b.image})` }}>
        <div className="hero-text container">
          <h1>{b.title}</h1>
          <p>{b.sub}</p>
          <Link to="/products" className="btn">지금 쇼핑하기</Link>
        </div>
        <div className="dots">{BANNERS.map((_, k) => <button key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} />)}</div>
      </section>
      <div className="container">
        <h2 className="section-title">브랜드</h2>
        <div className="brands">{BRANDS.map((x) => <Link key={x} to={`/products?brand=${encodeURIComponent(x)}`}>{x}</Link>)}</div>
        <h2 className="section-title">랭킹 BEST</h2>
        <div className="grid">{best.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        {couple.length > 0 && (
          <>
            <h2 className="section-title">커플룩 💑</h2>
            <div className="grid">{couple.slice(0, 8).map((p) => <ProductCard key={p.id} p={p} />)}</div>
          </>
        )}
        <h2 className="section-title">LUXURY · ORVELLE ATELIER</h2>
        <div className="grid">{luxury.slice(0, 8).map((p) => <ProductCard key={p.id} p={p} />)}</div>
        <h2 className="section-title">특가 SALE</h2>
        <div className="grid">{sale.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </div>
    </>
  );
}

function Products() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get('q') || '';
  const cat = sp.get('cat') || '전체';
  const sub = sp.get('sub') || '';
  const brand = sp.get('brand') || '';
  const sort = sp.get('sort') || 'new';
  const subs = SUBCATEGORIES[cat];
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n); };
  const setCat = (c) => { const n = new URLSearchParams(sp); c ? n.set('cat', c) : n.delete('cat'); n.delete('sub'); setSp(n); };

  const list = useMemo(() => {
    let l = PRODUCTS.filter((p) =>
      (cat === '전체' || p.category === cat) &&
      (!sub || p.sub === sub) &&
      (!brand || p.brand === brand) &&
      (!q || (p.name + p.brand).toLowerCase().includes(q.toLowerCase())));
    const s = { new: (a, b) => b.createdAt - a.createdAt, low: (a, b) => a.sale - b.sale, high: (a, b) => b.sale - a.sale, pop: (a, b) => b.reviews - a.reviews, sale: (a, b) => pct(b) - pct(a) }[sort];
    return [...l].sort(s);
  }, [q, cat, sub, brand, sort]);

  return (
    <div className="container page">
      {subs ? (
        <div className="crumb"><button onClick={() => setCat('')}>전체</button> › <button onClick={() => set('sub', '')}>{cat}</button>{sub && <> › <b>{sub}</b></>}</div>
      ) : null}
      <h2 className="section-title">{q ? `'${q}' 검색 결과` : brand || sub || cat}</h2>
      <div className="filters">
        <div className="chips">
          {subs
            ? ['전체', ...subs].map((s) => <button key={s} className={(s === '전체' ? !sub : s === sub) ? 'on' : ''} onClick={() => set('sub', s === '전체' ? '' : s)}>{s} <small>{PRODUCTS.filter((p) => p.category === cat && (s === '전체' || p.sub === s)).length}</small></button>)
            : CATEGORIES.map((c) => <button key={c} className={c === cat ? 'on' : ''} onClick={() => setCat(c === '전체' ? '' : c)}>{c}</button>)}
        </div>
        <div className="filter-right">
          <select value={brand} onChange={(e) => set('brand', e.target.value)}>
            <option value="">모든 브랜드</option>
            {BRANDS.map((b) => <option key={b}>{b}</option>)}
          </select>
          <select value={sort} onChange={(e) => set('sort', e.target.value)}>
            <option value="new">신상품순</option><option value="pop">인기순</option>
            <option value="low">낮은 가격순</option><option value="high">높은 가격순</option><option value="sale">할인율순</option>
          </select>
        </div>
      </div>
      <p className="count">총 {list.length}개</p>
      {list.length ? <PagedGrid key={sp.toString()} list={list} /> : <p className="empty">검색 결과가 없습니다.</p>}
    </div>
  );
}

// 상품이 많아서 40개씩 보여주고 '더 보기'로 이어서
function PagedGrid({ list }) {
  const [shown, setShown] = useState(40);
  return (
    <>
      <div className="grid">{list.slice(0, shown).map((p) => <ProductCard key={p.id} p={p} />)}</div>
      {shown < list.length && (
        <button className="btn outline more" onClick={() => setShown(shown + 40)}>
          더 보기 ({Math.min(shown, list.length)} / {list.length})
        </button>
      )}
    </>
  );
}

function Detail() {
  const { id } = useParams();
  const p = byId(id);
  const { addToCart } = useStore();
  const nav = useNavigate();
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');
  if (!p) return <div className="container page">상품을 찾을 수 없습니다.</div>;
  const add = (go) => {
    if (!size || !color) return setMsg('사이즈와 색상을 선택해주세요.');
    addToCart(p, size, color, qty);
    go ? nav('/cart') : setMsg('장바구니에 담았습니다.');
  };
  return (
    <div className="container page detail">
      <div className="detail-img">
        <Img src={p.image} alt={p.name} seed={p.id} />
        {p.credit && (
          <p className="credit">
            Photo by <a href={`${p.credit.url}?utm_source=lookbook_portfolio&utm_medium=referral`} target="_blank" rel="noreferrer">{p.credit.name}</a> on{' '}
            <a href="https://unsplash.com/?utm_source=lookbook_portfolio&utm_medium=referral" target="_blank" rel="noreferrer">Unsplash</a>
          </p>
        )}
      </div>
      <div className="detail-info">
        <Link to={`/products?brand=${encodeURIComponent(p.brand)}`} className="brand">{p.brand} ›</Link>
        <h1>{p.name}</h1>
        <div className="meta">★ {p.rating} · 리뷰 {p.reviews}</div>
        <div className="price big">
          {p.sale < p.price && <><s>{won(p.price)}</s><br /><span className="off">{pct(p)}%</span></>}
          <b>{won(p.sale)}</b>
        </div>
        {p.couple && <p className="couple-note">💑 남녀 2벌 세트 · 사이즈는 남/여 조합으로 선택</p>}
        <p className="ship">{p.sale >= 50000 ? '무료배송' : '배송비 3,000원 (5만원 이상 무료)'} · 1~2일 내 출고</p>
        <div className="opt"><label>색상</label><div className="chips">{p.colors.map((c) => <button key={c} className={c === color ? 'on' : ''} onClick={() => setColor(c)}>{c}</button>)}</div></div>
        <div className="opt"><label>사이즈</label><div className="chips">{p.sizes.map((s) => <button key={s} className={s === size ? 'on' : ''} onClick={() => setSize(s)}>{s}</button>)}</div></div>
        <div className="opt"><label>수량</label><div className="qty"><button onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span>{qty}</span><button onClick={() => setQty(qty + 1)}>+</button></div></div>
        <div className="total">총 상품금액 <b>{won(p.sale * qty)}</b></div>
        {msg && <p className="msg">{msg}</p>}
        <div className="actions"><button className="btn outline" onClick={() => add(false)}>장바구니</button><button className="btn" onClick={() => add(true)}>바로 구매</button></div>
      </div>
      <Reviews key={p.id} p={p} />
    </div>
  );
}

function Cart() {
  const { cart, updateQty, removeFromCart } = useStore();
  const items = cart.map((x) => ({ ...x, p: byId(x.id) })).filter((x) => x.p);
  const sum = items.reduce((a, x) => a + x.p.sale * x.qty, 0);
  const ship = sum === 0 || sum >= 50000 ? 0 : 3000;
  if (!items.length) return <div className="container page empty">장바구니가 비어 있습니다. <Link to="/products" className="btn">쇼핑하러 가기</Link></div>;
  return (
    <div className="container page">
      <h2 className="section-title">장바구니</h2>
      <div className="cart-layout">
        <div>{items.map((x) => (
          <div key={x.key} className="cart-item">
            <Img src={x.p.image} alt={x.p.name} seed={x.p.id} />
            <div className="ci-info"><div className="brand">{x.p.brand}</div><Link to={`/product/${x.p.id}`}>{x.p.name}</Link><div className="meta">{x.color} / {x.size}</div>
              <div className="qty"><button onClick={() => updateQty(x.key, x.qty - 1)}>−</button><span>{x.qty}</span><button onClick={() => updateQty(x.key, x.qty + 1)}>+</button></div></div>
            <div className="ci-right"><b>{won(x.p.sale * x.qty)}</b><button className="link" onClick={() => removeFromCart(x.key)}>삭제</button></div>
          </div>))}
        </div>
        <Summary sum={sum} ship={ship}><Link to="/checkout" className="btn block">주문하기</Link></Summary>
      </div>
    </div>
  );
}

function Summary({ sum, ship, children }) {
  return (
    <aside className="summary">
      <div><span>상품금액</span><span>{won(sum)}</span></div>
      <div><span>배송비</span><span>{ship ? won(ship) : '무료'}</span></div>
      <div className="grand"><span>결제예정금액</span><b>{won(sum + ship)}</b></div>
      {children}
    </aside>
  );
}

function Checkout() {
  const { cart, user, authReady, placeOrder } = useStore();
  const nav = useNavigate();
  const [f, setF] = useState({ name: user?.name || '', phone: '', addr: '', pay: 'card' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const items = cart.map((x) => ({ ...x, p: byId(x.id) })).filter((x) => x.p);
  const sum = items.reduce((a, x) => a + x.p.sale * x.qty, 0);
  const ship = sum >= 50000 ? 0 : 3000;
  if (!authReady) return <div className="container page empty">불러오는 중...</div>;
  if (!user) return <Navigate to="/login" state={{ from: '/checkout' }} />;
  if (!items.length && !busy) return <Navigate to="/cart" />;
  const submit = async (e) => {
    e.preventDefault();
    if (!f.name || !f.phone || !f.addr) return setErr('배송 정보를 모두 입력해주세요.');
    setBusy(true);
    try {
      const o = await placeOrder(items.map((x) => ({ id: x.p.id, name: x.p.name, size: x.size, color: x.color, qty: x.qty, price: x.p.sale })), sum + ship, f);
      nav(`/complete/${o.id}`);
    } catch (e) {
      setBusy(false);
      setErr('주문 저장에 실패했습니다: ' + e.message);
    }
  };
  const ch = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <form className="container page cart-layout" onSubmit={submit}>
      <div>
        <h2 className="section-title">주문/결제</h2>
        <div className="form">
          <label>받는 분<input value={f.name} onChange={ch('name')} /></label>
          <label>연락처<input value={f.phone} onChange={ch('phone')} placeholder="010-0000-0000" /></label>
          <label>주소<input value={f.addr} onChange={ch('addr')} /></label>
          <label>결제수단
            <div className="chips">{[['card', '신용카드'], ['bank', '무통장입금'], ['easy', '간편결제']].map(([v, l]) => <button type="button" key={v} className={f.pay === v ? 'on' : ''} onClick={() => setF({ ...f, pay: v })}>{l}</button>)}</div>
          </label>
          <p className="note">※ 데모 사이트입니다. 실제 결제는 이루어지지 않습니다.</p>
          {err && <p className="msg">{err}</p>}
        </div>
      </div>
      <Summary sum={sum} ship={ship}><button className="btn block" disabled={busy}>{busy ? '주문 처리 중...' : `${won(sum + ship)} 결제하기`}</button></Summary>
    </form>
  );
}

function Complete() {
  const { id } = useParams();
  return (
    <div className="container page empty">
      <h2>주문이 완료되었습니다 🎉</h2>
      <p>주문번호 {id}</p>
      <div className="actions"><Link to="/mypage" className="btn outline">주문내역 보기</Link><Link to="/" className="btn">계속 쇼핑하기</Link></div>
    </div>
  );
}

function Auth({ mode }) {
  const { login, signup } = useStore();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '', name: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const from = useLocation().state?.from || '/';
  const isSignup = mode === 'signup';
  const submit = async (e) => {
    e.preventDefault();
    if (!f.email || !f.password || (isSignup && !f.name)) return setErr('모든 항목을 입력해주세요.');
    if (isSignup && (f.name.trim().length < 2 || f.name.trim().length > 20)) return setErr('이름은 2~20자로 입력해주세요.');
    setBusy(true);
    const r = await (isSignup ? signup(f.email, f.password, f.name.trim()) : login(f.email, f.password));
    setBusy(false);
    r ? setErr(r) : nav(from, { replace: true });
  };
  const ch = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <form className="auth" onSubmit={submit}>
      <h2>{isSignup ? '회원가입' : '로그인'}</h2>
      {isSignup && <input placeholder="이름" value={f.name} onChange={ch('name')} />}
      <input type="email" placeholder="이메일" value={f.email} onChange={ch('email')} />
      <input type="password" placeholder="비밀번호" value={f.password} onChange={ch('password')} />
      {err && <p className="msg">{err}</p>}
      <button className="btn block" disabled={busy}>{busy ? '처리 중...' : isSignup ? '가입하기' : '로그인'}</button>
      <Link to={isSignup ? '/login' : '/signup'} state={{ from }} className="sub">{isSignup ? '이미 회원이신가요? 로그인' : '아직 회원이 아니신가요? 회원가입'}</Link>
    </form>
  );
}

function MyPage() {
  const { user, authReady, logout, orders, likes } = useStore();
  const [tab, setTab] = useState('orders');
  if (!authReady) return <div className="container page empty">불러오는 중...</div>;
  if (!user) return <Navigate to="/login" state={{ from: '/mypage' }} />;
  const mine = orders;
  const liked = PRODUCTS.filter((p) => likes.includes(p.id));
  return (
    <div className="container page">
      <div className="my-head"><h2>{user.name}님, 안녕하세요</h2><button className="link" onClick={logout}>로그아웃</button></div>
      <div className="chips tabs"><button className={tab === 'orders' ? 'on' : ''} onClick={() => setTab('orders')}>주문내역 ({mine.length})</button><button className={tab === 'likes' ? 'on' : ''} onClick={() => setTab('likes')}>좋아요 ({liked.length})</button></div>
      {tab === 'orders' ? (mine.length ? mine.map((o) => (
        <div key={o.id} className="order">
          <div className="order-head"><b>{o.date}</b><span>{o.id}</span><span className="status">{o.status}</span></div>
          {o.items.map((it, k) => {
            const p = byId(it.id) || PRODUCTS.find((x) => x.name === it.name);
            return (
              <div key={k} className="order-item">
                {p ? <Link to={`/product/${p.id}`}><Img src={p.image} alt={it.name} seed={p.id} /></Link> : <div className="noimg" />}
                <div>
                  {p && <div className="brand">{p.brand}</div>}
                  {p ? <Link to={`/product/${p.id}`}>{it.name}</Link> : it.name}
                  <div className="meta">{it.color} / {it.size} · {it.qty}개 · {won(it.price * it.qty)}</div>
                </div>
              </div>
            );
          })}
          <div className="order-total">{won(o.total)}</div>
        </div>)) : <p className="empty">주문내역이 없습니다.</p>)
        : (liked.length ? <div className="grid">{liked.map((p) => <ProductCard key={p.id} p={p} />)}</div> : <p className="empty">좋아요한 상품이 없습니다.</p>)}
    </div>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<Detail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/complete/:id" element={<Complete />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="footer"><div className="container">LOOKBOOK · 포트폴리오용 데모 쇼핑몰 · 상품 이미지: Unsplash</div></footer>
    </>
  );
}
