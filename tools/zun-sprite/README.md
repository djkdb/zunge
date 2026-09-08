# ZUN 스프라이트 생성기

`src/components/scene/zunSprite.ts` 는 손으로 찍은 것이 아니라 이 스크립트로 생성한다.
셀에 팔레트 키를 찍고 마지막에 실루엣 바깥을 자동으로 아웃라인 처리한 뒤,
TypeScript 행 문자열과 PNG 미리보기를 함께 내보낸다.

```bash
pip install pillow
cd tools/zun-sprite

python3 gen.py .     # 표정 7종을 PNG 로 렌더링 (zun-*.png, zun-sheet.png)
python3 emit.py      # zunSprite.head.ts 생성 (ZUN 파트)
```

`emit.py` 는 ZUN 부분만 만든다. 팀원 스프라이트까지 붙인 최종 파일은
`build_teammate()` 결과를 이어붙여 `src/components/scene/zunSprite.ts` 로 저장한다.

## 규칙

- 캔버스는 48 x 64 (치비 비율: 머리가 전체 높이의 약 절반)
- 광원은 좌측 상단. 재질마다 그림자 / 기본 / 하이라이트 3톤을 쓴다
- 무드별로 달라지는 구간은 y17~y33 뿐이라 그 17행만 표정 데이터로 분리한다
- **씬에서는 반드시 정수 배율로만 그린다.** 1.5배 같은 소수 배율을 쓰면
  crispEdges 반올림 때문에 픽셀이 뭉개진다
