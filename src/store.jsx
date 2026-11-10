import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase.js';

// 로그인: Firebase 이메일/비밀번호
// 저장: shop/{uid} 에 이름·장바구니·좋아요, shop/{uid}/orders/{주문} 에 주문 내역
// 로그인 안 했을 때 장바구니·좋아요는 이 브라우저(localStorage)에만 저장

const Ctx = createContext(null);
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };

const ERRORS = {
  'auth/email-already-in-use': '이미 가입된 이메일입니다.',
  'auth/invalid-email': '이메일 형식이 올바르지 않습니다.',
  'auth/weak-password': '비밀번호는 6자 이상으로 해주세요.',
  'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/too-many-requests': '시도가 너무 많습니다. 잠시 후 다시 해주세요.',
};
const errMsg = (e) => ERRORS[e.code] || '오류가 발생했습니다: ' + e.message;

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => load('cart', []));
  const [likes, setLikes] = useState(() => load('likes', []));
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [orders, setOrders] = useState([]);
  const synced = useRef(false); // 계정 데이터 불러오기가 끝나야 저장 시작
  const pendingName = useRef('');

  // 로그인 상태가 바뀌면 계정 데이터 불러오기
  useEffect(() => onAuthStateChanged(auth, async (u) => {
    synced.current = false;
    if (!u) { setUser(null); setOrders([]); setAuthReady(true); return; }
    const ref = doc(db, 'shop', u.uid);
    try {
      const snap = await getDoc(ref);
      const name = snap.exists() ? snap.data().name : (pendingName.current || u.displayName || u.email.split('@')[0]).slice(0, 20);
      if (snap.exists()) {
        // 계정 장바구니 + 로그인 전에 담은 것 합치기
        const d = snap.data();
        setCart((local) => [...d.cart, ...local.filter((x) => !d.cart.some((y) => y.key === x.key))]);
        setLikes((local) => [...new Set([...d.likes, ...local])]);
      }
      setUser({ uid: u.uid, email: u.email, name });
      const os = await getDocs(query(collection(ref, 'orders'), orderBy('createdAt', 'desc')));
      setOrders(os.docs.map((o) => ({ id: o.id, ...o.data() })));
    } catch (e) {
      console.error(e);
      setUser({ uid: u.uid, email: u.email, name: u.displayName || u.email });
    }
    synced.current = true;
    setAuthReady(true);
  }), []);

  // 장바구니·좋아요 저장 (로컬 + 로그인했으면 Firestore)
  useEffect(() => {
    save('cart', cart); save('likes', likes);
    if (!user || !synced.current) return;
    const t = setTimeout(() => {
      setDoc(doc(db, 'shop', user.uid), { name: user.name, cart, likes, updatedAt: serverTimestamp() }).catch(console.error);
    }, 500);
    return () => clearTimeout(t);
  }, [cart, likes, user]);

  const addToCart = (product, size, color, qty = 1) => {
    const key = `${product.id}-${size}-${color}`;
    setCart((c) => {
      const found = c.find((x) => x.key === key);
      if (found) return c.map((x) => (x.key === key ? { ...x, qty: x.qty + qty } : x));
      return [...c, { key, id: product.id, size, color, qty }];
    });
  };
  const updateQty = (key, qty) => setCart((c) => c.map((x) => (x.key === key ? { ...x, qty: Math.max(1, qty) } : x)));
  const removeFromCart = (key) => setCart((c) => c.filter((x) => x.key !== key));
  const toggleLike = (id) => setLikes((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  const signup = async (email, password, name) => {
    try {
      pendingName.current = name;
      const { user: u } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(u, { displayName: name });
      return null;
    } catch (e) { return errMsg(e); }
  };
  const login = async (email, password) => {
    try { await signInWithEmailAndPassword(auth, email, password); return null; } catch (e) { return errMsg(e); }
  };
  const logout = async () => {
    await signOut(auth);
    setCart([]); setLikes([]);
  };

  const placeOrder = async (items, total, shipping) => {
    const data = { items, total, shipping, status: '배송준비중', date: new Date().toLocaleString('ko-KR'), createdAt: serverTimestamp() };
    let id = 'ORD' + Date.now();
    if (user) {
      const r = await addDoc(collection(db, 'shop', user.uid, 'orders'), data);
      id = r.id;
      setOrders((o) => [{ id, ...data }, ...o]);
    }
    setCart([]);
    return { id };
  };

  return (
    <Ctx.Provider value={{ cart, addToCart, updateQty, removeFromCart, user, authReady, signup, login, logout, orders, placeOrder, likes, toggleLike }}>
      {children}
    </Ctx.Provider>
  );
}

export const useStore = () => useContext(Ctx);
