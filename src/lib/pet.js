export const PET_KEY = 'bubu-rabbit-v1';
export const CARE_INTERVAL = 30 * 60 * 1000;
export const petStages = [
  { name: '小小兔', points: 0, description: '刚来到花园，世界里的每件事都好新鲜。' },
  { name: '蹦蹦兔', points: 6, description: '耳朵竖起来啦，想和你一起探索花园。' },
  { name: '元气兔', points: 18, description: '一点点长大，已经是一只活泼的小伙伴。' },
  { name: '花园小伙伴', points: 36, description: '在你的照顾下长大啦！还想一直陪你玩。' },
];
export const newPet = () => ({ name: '奶糖', points: 0, foodAt: 0, waterAt: 0 });
export function readPet(raw) {
  try {
    const p = JSON.parse(raw);
    if (p && typeof p.name === 'string' && p.name.trim() && p.name.length <= 12 && Number.isSafeInteger(p.points) && p.points >= 0 && ['foodAt', 'waterAt'].every((k) => Number.isSafeInteger(p[k]) && p[k] >= 0)) return p;
  } catch { /* A missing or damaged save starts a new local pet. */ }
  return newPet();
}
export function remaining(pet, kind, now) {
  return Math.max(0, CARE_INTERVAL - (now - pet[`${kind}At`]));
}
export function careFor(pet, kind, now) {
  if (!['food', 'water'].includes(kind) || remaining(pet, kind, now) > 0) return pet;
  return { ...pet, points: Math.min(36, pet.points + 1), [`${kind}At`]: now };
}
