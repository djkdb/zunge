import { useRef, useState } from 'react';
import { characterStore, importSheet, resetCharacterAssets } from '../../game/characterAssets';
import { useStore } from '../../game/createStore';
import { POSE_NUMBER } from '../../game/data/zunPoses';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

type Status =
  | { kind: 'idle' }
  | { kind: 'working' }
  | { kind: 'done'; count: number; failures: { index: number; reason: string }[] }
  | { kind: 'error'; message: string };

/**
 * 캐릭터 시트를 게임 안에서 바로 넣는다.
 * 이미지를 끌어다 놓거나 붙여넣으면 브라우저가 체크무늬 배경을 지우고 32포즈로 나눈 뒤
 * 이 브라우저에 저장한다. 터미널이나 빌드 도구가 필요 없다.
 */
export function CharacterImport() {
  const assets = useStore(characterStore, (s) => s);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = async (file: Blob | null | undefined) => {
    if (!file) return;
    setStatus({ kind: 'working' });
    try {
      const r = await importSheet(file);
      if (!r.assets.length) {
        setStatus({ kind: 'error', message: '캐릭터를 찾지 못했습니다. 8열 x 4행 시트가 맞는지 확인해주세요.' });
        return;
      }
      setStatus({ kind: 'done', count: r.assets.length, failures: r.failures });
    } catch (e) {
      setStatus({ kind: 'error', message: e instanceof Error ? e.message : '처리에 실패했습니다.' });
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const item = [...e.clipboardData.items].find((i) => i.type.startsWith('image/'));
    if (item) {
      e.preventDefault();
      void handle(item.getAsFile());
    }
  };

  const imported = assets.source === 'imported';
  const total = Object.keys(POSE_NUMBER).length;

  return (
    <div className="card flex flex-col gap-2.5 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-black">🎨 캐릭터 이미지</div>
        {imported ? (
          <Badge tone="mint">내 이미지 {Object.keys(assets.urls).length}/{total}</Badge>
        ) : assets.source === 'bundled' ? (
          <Badge tone="primary">기본 이미지</Badge>
        ) : (
          <Badge tone="slate">기본 도트</Badge>
        )}
      </div>
      <p className="text-[11px] leading-relaxed text-ink-soft">
        8열 x 4행(32포즈) 캐릭터 시트를 아래에 끌어다 놓거나 붙여넣으면
        체크무늬 배경을 지우고 포즈별로 잘라서 바로 적용합니다. 이 브라우저에만 저장됩니다.
      </p>

      <div
        role="button"
        tabIndex={0}
        onPaste={onPaste}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handle(e.dataTransfer.files[0]);
        }}
        className={`btn-press flex min-h-[92px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-3 py-4 text-center transition-colors ${
          dragging ? 'border-mint bg-mint-soft' : 'border-line-2 bg-bg-2'
        }`}
      >
        <span className="text-2xl">{status.kind === 'working' ? '⏳' : '🖼️'}</span>
        <span className="text-xs font-bold">
          {status.kind === 'working' ? '이미지를 자르는 중...' : '이미지를 끌어다 놓거나 눌러서 선택'}
        </span>
        <span className="text-[10px] text-ink-muted">붙여넣기(Ctrl/⌘+V)도 됩니다</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handle(e.target.files?.[0])}
      />

      {status.kind === 'done' && (
        <div className={`rounded-lg px-2.5 py-2 text-[11px] font-bold ${status.failures.length ? 'bg-gold-soft text-[#ffd06a]' : 'bg-mint-soft text-[#5ee596]'}`}>
          ✅ {status.count}개 포즈를 적용했습니다.
          {status.failures.length > 0 && (
            <div className="mt-1 font-normal">
              {status.failures.length}칸은 건너뛰었습니다:{' '}
              {status.failures.slice(0, 4).map((f) => `${f.index}번(${f.reason})`).join(', ')}
            </div>
          )}
        </div>
      )}
      {status.kind === 'error' && (
        <div className="rounded-lg bg-rose-soft px-2.5 py-2 text-[11px] font-bold text-[#ff8aa1]">⚠️ {status.message}</div>
      )}

      {imported && (
        <>
          <div className="flex flex-wrap gap-1 rounded-lg bg-bg-2 p-2">
            {Object.entries(assets.urls)
              .slice(0, 32)
              .map(([n, url]) => (
                <img
                  key={n}
                  src={url}
                  alt=""
                  className="h-9 w-auto"
                  style={{ imageRendering: 'pixelated' }}
                />
              ))}
          </div>
          <Button
            variant="neutral"
            onClick={() => {
              void resetCharacterAssets();
              setStatus({ kind: 'idle' });
            }}
          >
            내 이미지 지우고 기본으로
          </Button>
        </>
      )}
    </div>
  );
}
