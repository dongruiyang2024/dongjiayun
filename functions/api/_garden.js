export const defaultGarden = {
  intro: '爱记录，也爱问为什么。把生活里的小发现，变成一次次动手尝试。',
  stages: [
    { id: 'grade-3', start: '2025-09-01', label: '三年级', theme: '记录生活，发现自己的兴趣' },
    { id: 'grade-4', start: '2026-09-01', label: '四年级', theme: '带着好奇心，开始自己的小研究' },
  ],
  projects: [{
    id: 'science-festival', title: '学校科技节 · 我的第一个作品', category: '科技制作',
    summary: '想自己做一件作品，把一个好奇的问题变成看得见的答案。先收集想法，再决定做什么。',
    stageId: 'grade-4', status: '筹备中', question: '',
    steps: ['寻找问题', '设计方案', '动手制作', '测试改进', '展示复盘'].map((title) => ({ title, done: false })),
    notes: [], result: '', image: '',
  }],
};

export function currentStage(stages, today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' })) {
  return [...stages].filter((stage) => stage.start <= today).sort((a, b) => b.start.localeCompare(a.start))[0];
}

export const projectStatuses = ['筹备中', '进行中', '已完成', '已暂停'];
const str = (value, max = 10000) => typeof value === 'string' && value.length <= max;
const date = (value) => str(value, 10) && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const uniqueIds = (items) => new Set(items.map((item) => item?.id)).size === items.length;
const id = (value) => str(value, 80) && /^[a-zA-Z0-9_-]+$/.test(value);
export function validGarden(data) {
  return data && str(data.intro, 1000) && Array.isArray(data.stages) && data.stages.length > 0 && data.stages.length <= 50 &&
    data.stages.every((s) => s && id(s.id) && date(s.start) && str(s.label, 80) && s.label.trim() && str(s.theme, 500)) && uniqueIds(data.stages) &&
    Array.isArray(data.projects) && data.projects.length <= 100 && uniqueIds(data.projects) && data.projects.every((p) => p && id(p.id) &&
      str(p.title, 200) && p.title.trim() && str(p.category, 80) && str(p.summary, 2000) && str(p.question) && str(p.result) &&
      data.stages.some((s) => s.id === p.stageId) && projectStatuses.includes(p.status) && str(p.image, 2000) && (!p.image || /^https:\/\//.test(p.image)) &&
      Array.isArray(p.steps) && p.steps.length <= 20 && p.steps.every((s) => s && str(s.title, 200) && s.title.trim() && typeof s.done === 'boolean') &&
      Array.isArray(p.notes) && p.notes.length <= 200 && p.notes.every((n) => n && date(n.date) && str(n.title, 200) && n.title.trim() && str(n.body)));
}
