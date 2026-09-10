import { useState } from 'react';
import { useGame, useUi } from '../../hooks/useGame';
import { actions, pushToast } from '../../game/store';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { CharacterImport } from './CharacterImport';
import { InstallGuide } from '../overlays/InstallGuide';
import { useInstall } from '../../hooks/useInstall';

export function SettingsPanel() {
  const settings = useGame((s) => s.settings);
  const lastSave = useUi((u) => u.lastSaveAt);
  const [exportCode, setExportCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [copied, setCopied] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const { platform } = useInstall();

  const doExport = () => {
    const code = actions.exportSave();
    setExportCode(code);
    setCopied(false);
    navigator.clipboard?.writeText(code).then(() => setCopied(true)).catch(() => setCopied(false));
  };
  const doImport = () => {
    if (actions.importSave(importCode)) {
      setImportCode('');
      pushToast('📥', '불러오기 완료', '저장 데이터를 성공적으로 불러왔습니다.', 'good');
    } else {
      pushToast('⚠️', '불러오기 실패', '올바른 저장 코드가 아닙니다.', 'bad');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-black">설정</h2>
        <p className="text-[11px] text-ink-soft">게임은 5초마다 자동 저장됩니다. {lastSave ? `마지막 저장 ${new Date(lastSave).toLocaleTimeString('ko-KR')}` : ''}</p>
      </div>

      <div className="card flex flex-col divide-y divide-line">
        <Toggle label="효과음" desc="구매, 출시, 레벨업 효과음" value={settings.sound} onChange={(v) => actions.updateSettings({ sound: v })} />
        <Toggle label="배경음악" desc="자취방에 어울리는 잔잔한 반복 연주" value={settings.music} onChange={(v) => actions.updateSettings({ music: v })} />
        <Toggle label="애니메이션 줄이기" desc="저사양 기기에서 부드럽게 플레이" value={settings.reducedMotion} onChange={(v) => actions.updateSettings({ reducedMotion: v })} />
      </div>

      {/* 앱으로 쓰기 — 방법이 기기마다 달라서 안내는 창에서 보여준다 */}
      <div className="card flex flex-col gap-2 p-3">
        <div className="flex items-center gap-1.5 text-xs font-black">
          <Icon name="phone" size={14} className="text-ink-soft" />
          앱으로 쓰기
        </div>
        <p className="text-[11px] leading-relaxed text-ink-soft">
          {platform.method === 'installed'
            ? '홈 화면에서 실행 중입니다. 네트워크가 없어도 켜져요.'
            : '홈 화면에 추가하면 주소창 없이 전체 화면으로 열리고, 네트워크가 없어도 실행됩니다.'}
        </p>
        <Button
          variant={platform.method === 'installed' ? 'neutral' : 'accent'}
          onClick={() => setInstallOpen(true)}
          disabled={platform.method === 'installed'}
        >
          <span className="flex items-center gap-1.5">
            <Icon name="download" size={14} strokeWidth={2} />
            {platform.method === 'installed' ? '이미 설치됨' : '홈 화면에 추가하는 방법'}
          </span>
        </Button>
      </div>

      <InstallGuide open={installOpen} onClose={() => setInstallOpen(false)} />

      <CharacterImport />

      <div className="card flex flex-col gap-2 p-3">
        <div className="flex items-center gap-1.5 text-xs font-black"><Icon name="projects" size={14} className="text-ink-soft" />튜토리얼</div>
        <p className="text-[11px] text-ink-soft">첫 안내와 기능별 설명을 처음부터 다시 볼 수 있습니다.</p>
        <Button variant="neutral" onClick={() => actions.resetTutorials()}>튜토리얼 다시 보기</Button>
      </div>

      <div className="card flex flex-col gap-2 p-3">
        <div className="flex items-center gap-1.5 text-xs font-black"><Icon name="download" size={14} className="text-ink-soft" />저장 데이터</div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="neutral" onClick={() => { actions.save(); pushToast('💾', '저장 완료', '진행 상황이 저장되었습니다.', 'good', 1800); }}>지금 저장</Button>
          <Button variant="neutral" onClick={doExport}>내보내기</Button>
        </div>
        {exportCode && (
          <div className="flex flex-col gap-1">
            <textarea readOnly value={exportCode} onFocus={(e) => e.currentTarget.select()} className="h-20 w-full rounded-lg border border-line bg-navy-deep p-2 font-mono text-[10px] text-ink-soft" />
            <div className="flex items-center gap-1 text-[10px] font-bold text-ink-muted">{copied && <Icon name="check" size={11} className="text-mint" strokeWidth={2.4} />}{copied ? '클립보드에 복사되었습니다.' : '코드를 복사해 보관하세요.'}</div>
          </div>
        )}
        <div className="mt-1 text-[11px] font-bold text-ink-soft">가져오기</div>
        <textarea
          value={importCode}
          onChange={(e) => setImportCode(e.target.value)}
          placeholder="ZUN1. 으로 시작하는 저장 코드를 붙여넣으세요"
          className="h-16 w-full rounded-lg border border-line bg-navy-deep p-2 font-mono text-[10px] text-ink placeholder:text-ink-muted"
        />
        <Button variant="accent" disabled={!importCode.trim()} onClick={doImport}>데이터 가져오기</Button>
      </div>

      <div className="card flex flex-col gap-2 p-3">
        <div className="flex items-center gap-1.5 text-xs font-black"><Icon name="trash" size={14} className="text-ink-soft" />초기화</div>
        <p className="text-[11px] text-ink-soft">모든 진행 상황이 삭제되고 자취방에서 다시 시작합니다. 되돌릴 수 없습니다.</p>
        <Button variant="danger" onClick={() => setConfirmReset(true)}>게임 초기화</Button>
      </div>

      <div className="px-1 text-center text-[10px] text-ink-muted">
        ZUN: AI 개발자 키우기 · v1.0 · 작은 아이디어가 온 세상을 만든다.
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)}>
        <div className="card p-5">
          <div className="flex justify-center text-rose"><Icon name="trash" size={30} /></div>
          <h3 className="mt-2 text-center text-base font-black">정말 초기화할까요?</h3>
          <p className="mt-1 text-center text-xs text-ink-soft">돈, 프로젝트, 업그레이드, 레벨이 모두 삭제됩니다.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="neutral" onClick={() => setConfirmReset(false)}>취소</Button>
            <Button variant="danger" onClick={() => { actions.reset(); setConfirmReset(false); }}>초기화</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Toggle({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="flex w-full items-center justify-between px-3 py-3 text-left">
      <div>
        <div className="text-xs font-black">{label}</div>
        <div className="text-[11px] text-ink-soft">{desc}</div>
      </div>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${value ? 'bg-mint' : 'bg-white/15'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </span>
    </button>
  );
}
