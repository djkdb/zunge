import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const el = document.getElementById('root');
if (!el) throw new Error('#root 요소를 찾을 수 없습니다.');
createRoot(el).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

/*
 * 서비스 워커 등록.
 * 한 번 들어온 뒤에는 네트워크가 없어도 게임이 열리고, 재방문이 즉시 뜬다.
 * 첫 화면을 막지 않도록 load 이후에 붙인다.
 */
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => {
        /*
         * 워커는 이 시점에 붙는다. 그전에 받은 번들·스프라이트는 워커를 거치지
         * 않아 캐시에 없으므로, 지금 화면이 실제로 쓴 파일을 알려준다.
         * 이게 없으면 첫 방문 직후 오프라인이 됐을 때 빈 화면이 뜬다.
         */
        const urls = performance
          .getEntriesByType('resource')
          .map((e) => e.name)
          .filter((u) => u.startsWith(location.origin) && /\.(js|css|png|svg|webmanifest)(\?|$)/.test(u));
        (reg.active ?? navigator.serviceWorker.controller)?.postMessage({ type: 'cache', urls });
      })
      .catch(() => {
        // 등록에 실패해도 게임은 그대로 돌아간다
      });
  });
}
