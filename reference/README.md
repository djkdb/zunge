# 원본 레퍼런스

ZUN 캐릭터 스프라이트 시트 원본(8열 x 4행 = 32포즈)을 여기에 올린다.

## 올리는 법 (터미널 불필요)

브라우저에서 아래 주소를 열고 이미지를 끌어다 놓은 뒤 커밋하면 된다.

https://github.com/djkdb/zunge/upload/claude/zun-ai-developer-game-6ja302/reference

파일 이름은 아무거나 괜찮다. `zun-sheet.png`, `reference.png`, 무엇이든
이 폴더에 있는 이미지를 자동으로 찾는다.

## 올린 다음

```bash
npm run extract-zun
```

체크무늬 배경 제거 → 번호 라벨 제거 → 32포즈 분리 → 전수 검증까지 한 번에 하고
결과를 `public/characters/zun/01.png` ~ `32.png` 로 저장한다.
