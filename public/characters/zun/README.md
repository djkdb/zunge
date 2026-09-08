# ZUN 캐릭터 이미지

`01.png` ~ `32.png` (8열 x 4행 레퍼런스 시트의 32포즈)가 여기에 들어간다.

## 넣는 법

레퍼런스 시트를 저장소 루트에 `zun-sheet.png` 로 저장한 뒤:

```bash
npm run extract-zun
```

경로를 직접 주려면:

```bash
npm run extract-zun -- ~/Downloads/reference.png
```

스크립트가 자동으로 찾는 위치는 `zun-sheet.png`, `public/zun-sheet.png`,
`reference/zun-sheet.png`, `~/zun-sheet.png`, `~/Downloads/zun-sheet.png` 이다.

실행이 끝나면 32개 PNG를 전수 검사해서
"캐릭터 1명 + 배경 alpha 0" 인지 확인하고 결과를 출력한다.

이미지가 없는 동안에는 폴백 픽셀 스프라이트로 자동 전환되므로 게임은 정상 동작한다.
