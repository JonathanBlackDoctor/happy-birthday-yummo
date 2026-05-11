// 임시 감사: 모든 씬에서 등장하는 [CHARACTER] (id, sprite) 페어를 모아
// resolveSpriteName 로직으로 풀 스프라이트 ID를 만든 뒤 SPRITE_CATALOG 63개와 비교.
import fs from 'node:fs';
import path from 'node:path';

const PREFIX_BY_NAME = {
  yunmo: 'yunmo', 구윤모: 'yunmo', 윤모: 'yunmo',
  serin: 'serin', H1: 'serin', 차세린: 'serin', 세린: 'serin',
  hajeong: 'hajeong', H2: 'hajeong', 윤하정: 'hajeong', 하정: 'hajeong',
  seol: 'seol', H3: 'seol', 한설: 'seol', 설: 'seol',
  seoyoon: 'seoyoon', H4: 'seoyoon', 나서윤: 'seoyoon', 서윤: 'seoyoon',
  yuna: 'yuna', H5: 'yuna', 장윤영: 'yuna', 윤영: 'yuna',
  gyumin: 'gyumin', 김규민: 'gyumin', 규민: 'gyumin',
  junhyuk: 'junhyuk', 오준혁: 'junhyuk', 준혁: 'junhyuk',
  nathan: 'nathan', 조나단: 'nathan',
  gyeongmin: 'gyeongmin', 표경민: 'gyeongmin', 경민: 'gyeongmin',
};
const KNOWN_PREFIXES = new Set(['yunmo','serin','hajeong','seol','seoyoon','yuna','gyumin','junhyuk','nathan','gyeongmin']);
const SIDE_DEFAULT_ONLY = new Set(['gyumin','gyeongmin','nathan','junhyuk']);

function resolve(id, sprite) {
  if (!sprite) return null;
  let fileName, prefix;
  if (sprite.includes('_') && KNOWN_PREFIXES.has(sprite.split('_')[0])) {
    fileName = sprite; prefix = sprite.split('_')[0];
  } else {
    prefix = PREFIX_BY_NAME[id];
    if (!prefix) return null;
    fileName = `${prefix}_${sprite}`;
  }
  if (SIDE_DEFAULT_ONLY.has(prefix)) return `${prefix}_default`;
  return fileName;
}

const CATALOG = {
  yunmo: ['yunmo_default','yunmo_smile','yunmo_blush','yunmo_panic','yunmo_perv','yunmo_perv_1','yunmo_recover','yunmo_sad','yunmo_serious'],
  serin: ['serin_default','serin_smile','serin_smile_warm','serin_blush','serin_concerned','serin_serious','serin_surprised','serin_tired','serin_outfit_casual','serin_outfit_winter_coat'],
  hajeong: ['hajeong_default','hajeong_smile_small','hajeong_warm_smile','hajeong_blush','hajeong_drunk','hajeong_panic','hajeong_pout','hajeong_serious','hajeong_outfit_lab_coat','hajeong_outfit_party'],
  seol: ['seol_default','seol_smile_slight','seol_warm_smile','seol_blush','seol_concerned','seol_serious','seol_tired','seol_no_glasses','seol_outfit_casual','seol_outfit_lab_late'],
  seoyoon: ['seoyoon_default','seoyoon_smile_slight','seoyoon_smile_full','seoyoon_warm','seoyoon_blush','seoyoon_distant','seoyoon_serious','seoyoon_thinking','seoyoon_outfit_date','seoyoon_outfit_school'],
  yuna: ['yuna_default','yuna_smile_big','yuna_warm_smile','yuna_excited','yuna_blush','yuna_pout','yuna_sad','yuna_serious','yuna_outfit_dress','yuna_outfit_festival'],
  gyumin: ['gyumin_default'],
  gyeongmin: ['gyeongmin_default'],
  nathan: ['nathan_default'],
  junhyuk: ['junhyuk_default'],
};
const ALL = new Set(Object.values(CATALOG).flat());
console.log('Catalog total:', ALL.size);

const dirs = ['src/scenes', 'src/scenes/compressed', 'src/scenes/palJeongPot'];
const used = new Set();
const usedFull = new Set();   // 풀 모드에서만 도달 가능
const usedCompressed = new Set(); // 압축 모드에서만 도달 가능
const unresolved = [];

for (const rel of dirs) {
  const dir = path.resolve(rel);
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.scene.json'));
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const cmds = data.commands || data.cmds || [];
    for (const c of cmds) {
      if (c.type === 'CHARACTER' && c.sprite) {
        const full = resolve(c.id, c.sprite);
        if (full) {
          used.add(full);
          if (rel === 'src/scenes') usedFull.add(full);
          else if (rel === 'src/scenes/compressed') usedCompressed.add(full);
        } else unresolved.push({file: `${rel}/${f}`, id: c.id, sprite: c.sprite});
      }
    }
  }
}

console.log('Used (resolved) total:', used.size);
const usedInCatalog = [...used].filter(x => ALL.has(x));
const usedNotInCatalog = [...used].filter(x => !ALL.has(x));
console.log('Used ∩ Catalog:', usedInCatalog.length);
console.log('Used but NOT in catalog (orphan refs):', usedNotInCatalog.length);
if (usedNotInCatalog.length) console.log('  →', usedNotInCatalog);

const unused = [...ALL].filter(x => !used.has(x));
console.log('\nUnused sprites (catalog ∖ all-modes):', unused.length);
for (const u of unused) console.log('  -', u);

const fullOnly = [...usedFull].filter(x => !usedCompressed.has(x));
const compressedOnly = [...usedCompressed].filter(x => !usedFull.has(x));
console.log('\n참고 — 풀 모드에만 있는 sprite:', fullOnly.length, fullOnly);
console.log('참고 — 압축 모드에만 있는 sprite:', compressedOnly.length, compressedOnly);

if (unresolved.length) {
  console.log('\nUnresolved CHARACTER refs (id mapping failed):', unresolved.length);
  for (const u of unresolved.slice(0, 20)) console.log('  -', u);
}
