// Firebase 설정 (mock-stock, maple-item, car-gacha 와 같은 프로젝트 jh-stock-4cbf6 사용)
// 이 값은 공개돼도 괜찮음: 실제 보안은 firestore.rules 가 맡음
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDeNdXg_6NWHFp9JAkH7NYKpnMPqg7bDtA',
  authDomain: 'jh-stock-4cbf6.firebaseapp.com',
  projectId: 'jh-stock-4cbf6',
  storageBucket: 'jh-stock-4cbf6.firebasestorage.app',
  messagingSenderId: '450139556750',
  appId: '1:450139556750:web:ce4214f69150204abbb2df',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
