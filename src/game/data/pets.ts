export interface PetDef {
  id: string;
  name: string;
  icon: string;
  requiredLevel: number;
  description: string;
}

/** 레벨 달성 시 방에 합류하는 펫/마스코트 */
export const PETS: PetDef[] = [
  { id: 'cat', name: 'Pixel Cat', icon: '🐱', requiredLevel: 3, description: '키보드 위에 올라가는 것을 좋아한다.' },
  { id: 'codi', name: 'Codi', icon: '🐶', requiredLevel: 8, description: '빌드가 끝나면 짖는다.' },
  { id: 'minipc', name: 'Mini PC', icon: '🖥️', requiredLevel: 12, description: '작지만 램은 64GB.' },
  { id: 'byte', name: 'Byte', icon: '👻', requiredLevel: 18, description: '지워진 코드의 유령.' },
  { id: 'plant', name: 'Plant', icon: '🪴', requiredLevel: 25, description: '물 주는 것을 자동화했다.' },
  { id: 'duck', name: 'Duck', icon: '🦆', requiredLevel: 35, description: '러버덕 디버깅 전문가.' },
];

export function unlockedPets(level: number): PetDef[] {
  return PETS.filter((p) => p.requiredLevel <= level);
}
