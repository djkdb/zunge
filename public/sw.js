/*
 * ZUN 서비스 워커.
 *
 * 방치형 게임인데 네트워크가 없으면 아예 열리지 않는 건 앞뒤가 맞지 않는다.
 * 한 번 들어온 적이 있으면 지하철에서도, 비행기에서도 켜지게 한다.
 *
 * 전략은 두 갈래뿐이다.
 *  - 페이지 이동: 네트워크 먼저. 새 배포를 놓치지 않기 위해서다.
 *                 실패하면 캐시에 둔 index.html 로 연다.
 *  - 나머지 자산: 캐시 먼저. 파일 이름에 해시가 붙어 있어 내용이 바뀌면
 *                 이름도 바뀌므로, 캐시가 낡을 일이 없다.
 *
 * 빌드 산출물 목록을 따로 만들지 않는다. 처음 받아온 것을 그때그때 캐시에
 * 넣는 방식이라 빌드 과정에 손을 댈 필요가 없다.
 */

const VERSION = 'zun-v1';
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;

/** 앱 껍데기 — 오프라인에서 첫 화면을 띄우는 데 필요한 최소한 */
const SHELL_URLS = ['./', './index.html', './manifest.webmanifest', './favicon.svg'];

/*
 * 자산 캐시 상한.
 * 배포할 때마다 파일 이름의 해시가 바뀌므로, 손대지 않으면 낡은 번들이
 * 계속 쌓인다. 캐릭터 32장 + 번들 몇 개면 충분하니 넉넉히 잡고
 * 넘치면 오래된 것부터 버린다.
 */
const ASSET_LIMIT = 80;

async function trimAssets() {
  const c = await caches.open(ASSETS);
  const keys = await c.keys();
  // keys() 는 넣은 순서대로 준다 — 앞쪽이 가장 오래됐다
  for (let i = 0; i < keys.length - ASSET_LIMIT; i += 1) await c.delete(keys[i]);
}

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(SHELL)
      // 하나라도 실패하면 설치 전체가 실패하므로 개별로 담는다
      .then((c) => Promise.all(SHELL_URLS.map((u) => c.add(u).catch(() => undefined))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

/*
 * 페이지가 "이건 캐시해 둬" 하고 알려주는 통로.
 *
 * 서비스 워커는 load 이후에 등록되므로, 그 전에 이미 받아온 번들과 스프라이트는
 * 워커를 거치지 않아 캐시에 남지 않는다. 그 상태로 지하철에 들어가면
 * 껍데기는 열리는데 자바스크립트가 없어 빈 화면이 된다.
 * 그래서 첫 화면을 다 그린 페이지가 자기가 쓴 파일 목록을 직접 넘겨준다.
 */
self.addEventListener('message', (e) => {
  const data = e.data;
  if (!data || data.type !== 'cache' || !Array.isArray(data.urls)) return;
  e.waitUntil(
    caches.open(ASSETS).then(async (c) => {
      for (const u of data.urls) {
        try {
          if (await c.match(u, { ignoreVary: true })) continue;
          await c.add(u);
        } catch {
          // 하나 실패해도 나머지는 계속 담는다
        }
      }
      await trimAssets();
    }),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // 다른 출처(웹폰트 등)는 브라우저에 맡긴다
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put('./index.html', copy)).catch(() => undefined);
          return res;
        })
        .catch(() => caches.match('./index.html', { ignoreVary: true }).then((r) => r ?? caches.match('./', { ignoreVary: true }))
          .then((r) => r ?? new Response('오프라인입니다.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }))),
    );
    return;
  }

  /*
   * ignoreVary 가 반드시 필요하다.
   * 서버가 Vary: Origin 을 붙이는데, 캐시에 넣을 때의 요청에는 Origin 헤더가
   * 없고 실제 스크립트 요청(crossorigin)에는 붙는다. 기본 매칭은 이걸 다른
   * 요청으로 보고 캐시를 지나쳐 버려서, 오프라인에서 번들을 못 찾는다.
   * 파일 이름에 해시가 있으니 URL 이 같으면 내용도 같다.
   */
  e.respondWith(
    caches.match(req, { ignoreVary: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        // 부분 응답이나 오류는 캐시하지 않는다
        if (res.ok && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches
            .open(ASSETS)
            .then((c) => c.put(req, copy))
            .then(trimAssets)
            .catch(() => undefined);
        }
        return res;
      });
    }),
  );
});
