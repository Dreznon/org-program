// Simple client-side router and data layer
// Debug logs are intentionally verbose to aid troubleshooting (rule: Debug logs)
const log = (...args) => console.debug('[ui]', ...args);

// Security helper for future innerHTML use (rule: Security)
function escapeText(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return (text ?? '').toString().replace(/[&<>"']/g, s => map[s]);
}

const StorageKeys = {
  Items: 'collection.items.v1',
  Seeded: 'collection.seeded.v1'
};

const TAG_PATTERN = /^[a-z0-9\- ]+$/i;

/** @typedef {{ id:string, name:string, description?:string, tags:string[], quantity:number, category:string, createdAt:number }} Item */

const CategoryKeywords = {
  Bathroom: ['toothbrush','tooth paste','toothpaste','soap','shampoo','conditioner','towel','razor','toilet','bath','shower','hygiene','deodorant'],
  Kitchen: ['pan','pot','spatula','knife','fork','spoon','plate','bowl','mug','glass','cup','fridge','refrigerator','oven','stove','microwave','dish','food'],
  Bedroom: ['pillow','blanket','sheet','duvet','bed','lamp','nightstand','alarm','dresser','hanger','clothes'],
  LivingRoom: ['sofa','couch','tv','television','remote','coffee table','bookshelf','speaker','console','game','plant'],
  Office: ['laptop','computer','keyboard','mouse','monitor','notebook','pen','pencil','paper','printer','router','desk','chair'],
  Garage: ['hammer','screwdriver','wrench','drill','nail','bolt','bike','bicycle','car','tool','ladder'],
  Closet: ['shirt','pants','jeans','dress','coat','jacket','shoes','socks','belt','hat','scarf','gloves'],
  Laundry: ['detergent','washer','dryer','basket','iron','ironing board','stain'],
  Cleaning: ['broom','mop','vacuum','cleaner','bleach','sponge','brush','duster','trash','bin','bag'],
  Outdoors: ['tent','sleeping bag','backpack','camp','hike','grill','bbq','garden','hose','shovel','rake'],
  Electronics: ['phone','tablet','charger','cable','battery','camera','headphones','earbuds','speaker','console','controller','adapter'],
  BathroomCabinet: ['medicine','bandage','band aid','ointment','aspirin','ibuprofen','vitamin','first aid']
};

const DefaultCategory = 'Miscellaneous';

// Routes (hash-based for simplicity; rule: Simple solutions)
const Routes = {
  Home: '#/',
  HowTo: '#/how-to',
  Upload: '#/upload',
  NewItem: '#/item/new'
};

const createId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function normalize(text) {
  return (text || '').toLowerCase();
}

function classifyCategory(name, tags) {
  const haystack = normalize(name) + ' ' + normalize((tags || []).join(' '));
  let bestCategory = DefaultCategory;
  let bestScore = 0;
  for (const [category, keywords] of Object.entries(CategoryKeywords)) {
    let score = 0;
    for (const kw of keywords) {
      if (haystack.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  return bestCategory;
}

function readItems() {
  try {
    const raw = localStorage.getItem(StorageKeys.Items);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeItems(items) {
  localStorage.setItem(StorageKeys.Items, JSON.stringify(items));
}

function seedDataIfNeeded() {
  if (localStorage.getItem(StorageKeys.Seeded)) return;
  const sample = [
    { name: 'Toothbrush', description: 'Soft bristles', tags: ['bathroom','hygiene'], quantity: 2 },
    { name: 'Chef Knife', description: '8-inch stainless', tags: ['kitchen','knife'], quantity: 1 },
    { name: 'USB-C Charger', description: '65W fast charge', tags: ['electronics','charger'], quantity: 1 },
  ].map(s => ({
    id: createId(),
    name: s.name,
    description: s.description,
    tags: s.tags,
    quantity: s.quantity,
    category: classifyCategory(s.name, s.tags),
    createdAt: Date.now()
  }));
  writeItems(sample);
  localStorage.setItem(StorageKeys.Seeded, '1');
}

function groupByCategory(items) {
  const map = new Map();
  for (const item of items) {
    const list = map.get(item.category) || [];
    list.push(item);
    map.set(item.category, list);
  }
  return map;
}

function navigateTo(hash) {
  if (location.hash !== hash) {
    location.hash = hash;
  } else {
    render();
  }
}

function mainView() {
  log('render main');
  const items = readItems();
  const grouped = groupByCategory(items);
  const categories = Array.from(grouped.keys()).sort((a,b)=>a.localeCompare(b));

  const app = document.getElementById('app');
  app.textContent = '';

  // Header per reference: title + help pill
  const head = document.createElement('div');
  head.style.display = 'flex';
  head.style.alignItems = 'center';
  head.style.justifyContent = 'space-between';
  const title = document.createElement('h2');
  title.textContent = 'Your Collection';
  const help = document.createElement('a');
  help.href = Routes.HowTo; help.textContent = 'Help'; help.className = 'help-pill';
  help.addEventListener('click', (e) => { e.preventDefault(); navigateTo(Routes.HowTo); });
  head.appendChild(title); head.appendChild(help);
  app.appendChild(head);

  if (categories.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No items yet. Click "Add to Collection" to get started.';
    app.appendChild(empty);
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'grid';
  for (const category of categories) {
    const list = grouped.get(category) || [];
    const card = document.createElement('div');
    card.className = 'category-card';
    card.tabIndex = 0;

    const titleDiv = document.createElement('div');
    titleDiv.className = 'title';
    titleDiv.textContent = category;

    const metaDiv = document.createElement('div');
    metaDiv.className = 'meta';
    metaDiv.textContent = `${list.length} item${list.length!==1?'s':''}`;

    card.appendChild(titleDiv);
    card.appendChild(metaDiv);
    const go = () => navigateTo(`#/category/${encodeURIComponent(category)}`);
    card.addEventListener('click', go);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    grid.appendChild(card);
  }
  app.appendChild(grid);
}

function categoryView(category) {
  log('render category', category);
  const items = readItems().filter(i => i.category === category);
  const app = document.getElementById('app');
  app.textContent = '';

  const crumbs = document.createElement('div');
  crumbs.className = 'crumbs';
  const back = document.createElement('a');
  back.href = Routes.Home;
  back.textContent = '← Back';
  crumbs.appendChild(back);
  app.appendChild(crumbs);

  const header = document.createElement('div');
  header.className = 'category-header';
  const title = document.createElement('h2');
  title.textContent = category;
  const count = document.createElement('div');
  count.className = 'meta';
  count.textContent = `${items.length} item${items.length!==1?'s':''}`;
  header.appendChild(title);
  header.appendChild(count);
  app.appendChild(header);

  if (items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No items in this category yet.';
    app.appendChild(empty);
    return;
  }

  const search = document.createElement('input');
  search.className = 'search';
  search.placeholder = 'toothbrush';
  app.appendChild(search);

  const list = document.createElement('div');
  list.className = 'items';
  function renderList(filter) {
    list.textContent = '';
    const filtered = items.filter(i => !filter || i.name.toLowerCase().includes(filter.toLowerCase()));
    for (const item of filtered) {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.tabIndex = 0;
      const tagText = item.tags.length ? `tags: ${item.tags.join(', ')}` : '';
      const left = document.createElement('div');
      const nameDiv = document.createElement('div'); nameDiv.className = 'name'; nameDiv.textContent = item.name;
      const descDiv = document.createElement('div'); descDiv.className = 'desc'; descDiv.textContent = tagText;
      left.appendChild(nameDiv); left.appendChild(descDiv);
      const right = document.createElement('div'); right.className='chevron'; right.textContent='›';
      card.appendChild(left); card.appendChild(right);
      const goDetail = () => navigateTo(`#/item/${encodeURIComponent(item.id)}`);
      card.addEventListener('click', goDetail);
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goDetail(); } });
      list.appendChild(card);
    }
  }
  renderList('');
  search.addEventListener('input', () => renderList(search.value));
  app.appendChild(list);
}

function howtoView() {
  log('render how-to');
  const app = document.getElementById('app');
  app.textContent = '';
  const wrap = document.createElement('div');
  wrap.className = 'howto';

  const h2 = document.createElement('h2');
  h2.textContent = 'How to Use';

  const p1 = document.createElement('p');
  p1.textContent = '';

  const grid = document.createElement('div');
  grid.className = 'info-grid';
  [
    "Add items via 'Add to Collection'",
    'We auto-categorize by typical storage location',
    'Tap a category to see items; tap an item for details',
    "Unsure? Use 'Move Category' in the item sheet",
  ].forEach((text, idx) => {
    const c = document.createElement('div');
    c.className = 'info-card';
    c.style.display='grid'; c.style.gridTemplateColumns='auto 1fr'; c.style.gap='12px'; c.style.alignItems='center';
    const badge = document.createElement('div'); badge.className='badge-number'; badge.textContent=String(idx+1); badge.setAttribute('aria-hidden','true');
    const t = document.createElement('div'); t.textContent = text;
    c.appendChild(badge); c.appendChild(t);
    grid.appendChild(c);
  });

  const p2 = document.createElement('p');
  p2.textContent = 'Data is stored locally in your browser.';

  const back = document.createElement('a');
  back.href = Routes.Home;
  back.textContent = '← Back to main';

  wrap.appendChild(h2);
  wrap.appendChild(p1);
  wrap.appendChild(grid);
  wrap.appendChild(p2);
  wrap.appendChild(back);
  app.appendChild(wrap);
}

// Upload single-card flow (Enter Manually)
function uploadView() {
  log('render upload');
  const app = document.getElementById('app');
  app.textContent = '';

  const wrap = document.createElement('div');
  wrap.className = 'wizard';

  // segmented control (visual)
  const seg = document.createElement('div'); seg.className = 'segmented';
  ['Scan Photo','Upload Photo','Enter Manually'].forEach((t,i)=>{ const b=document.createElement('button'); b.className='seg'+(i===2?' active':''); b.classList.add('seg'); b.textContent=t; seg.appendChild(b); });
  wrap.appendChild(seg);

  // form card
  const card = document.createElement('div'); card.className = 'card pad-6';
  const fields = document.createElement('div'); fields.className = 'modal-body';
  const state = { name:'', description:'', tags:[], itemType:'manual', category:'', confidence:null };
  const title = document.createElement('input'); title.placeholder='Title'; title.addEventListener('input',()=> state.name = title.value.trim());
  const desc = document.createElement('input'); desc.placeholder='Description'; desc.addEventListener('input',()=> state.description = desc.value.trim());
  const tags = document.createElement('input'); tags.placeholder='comma-separated'; tags.addEventListener('input',()=> state.tags = tags.value.split(',').map(s=>s.trim()).filter(Boolean));
  const mk = (label, el) => { const field=document.createElement('label'); field.className='field'; const span=document.createElement('span'); span.textContent=label; field.appendChild(span); field.appendChild(el); return field; };
  fields.appendChild(mk('Title', title));
  fields.appendChild(mk('Description', desc));
  fields.appendChild(mk('Tags', tags));
  fields.appendChild(mk('Item Type', document.createElement('span')));
  const catBtn = document.createElement('button'); catBtn.className='button primary'; catBtn.textContent='Categorize';
  fields.appendChild(catBtn);
  const catRow = document.createElement('div'); catRow.style.display='flex'; catRow.style.justifyContent='space-between'; catRow.style.alignItems='center'; catRow.style.marginTop='8px';
  const catLabel = document.createElement('div'); const change = document.createElement('button'); change.className='button secondary'; change.textContent='Change';
  change.addEventListener('click', () => { const v = prompt('Enter category', state.category || DefaultCategory); if (v) { state.category = v; catLabel.textContent = `Category: ${state.category}${state.confidence?` (${Math.round(state.confidence*100)}%)`:''}`; } });
  catRow.appendChild(catLabel); catRow.appendChild(change);
  fields.appendChild(catRow);
  card.appendChild(fields);
  wrap.appendChild(card);

  // review
  const review = document.createElement('div'); review.className='review-card';
  function renderReview(){
    review.textContent='';
    const lines = [state.name||'Title', state.description||'Description', `${state.tags.length?`Tags: ${state.tags.join(' · ')}`:'Tags'}`, `Category: ${state.category||'-'}`];
    lines.forEach(t=>{ const d=document.createElement('div'); d.textContent=t; review.appendChild(d); });
  }
  renderReview();
  wrap.appendChild(review);

  // Save button (full width)
  const save = document.createElement('button'); save.className='button primary'; save.textContent='Save'; save.style.width='100%'; save.style.padding='14px 18px'; save.style.marginTop='8px';
  save.addEventListener('click', () => {
    if (!state.name) { alert('Title required'); return; }
    const item = { id:createId(), name:state.name, description:state.description, tags:state.tags, quantity:1, category:state.category||DefaultCategory, createdAt:Date.now() };
    const items = readItems(); items.push(item); writeItems(items); navigateTo(Routes.Home);
  });
  wrap.appendChild(save);

  // categorize logic (local heuristic)
  function doCategorize(){
    const predicted = classifyCategory(state.name, state.tags);
    state.category = predicted; state.confidence = (predicted===DefaultCategory?0.42:0.92);
    catLabel.textContent = `Category: ${state.category} (${Math.round(state.confidence*100)}%)`;
    renderReview();
  }
  catBtn.addEventListener('click', doCategorize);

  app.appendChild(wrap);
}

function itemDetailView(id) {
  log('render item detail', id);
  const app = document.getElementById('app');
  app.textContent = '';
  const items = readItems();
  const item = items.find(i => i.id === id);
  if (!item) { const p=document.createElement('p'); p.textContent='Item not found.'; app.appendChild(p); return; }
  const wrap = document.createElement('div'); wrap.className='detail';
  const header = document.createElement('div'); header.className='detail-header';
  const title = document.createElement('h2'); title.textContent = item.name;
  const actions = document.createElement('div'); actions.className='top-actions';
  const cancel = document.createElement('a'); cancel.href = Routes.Home; cancel.className = 'link-button'; cancel.textContent='Cancel';
  const adv = document.createElement('button'); adv.className='link-button'; adv.textContent='Advanced'; adv.addEventListener('click', () => openAdvancedModal(item));
  actions.appendChild(cancel); actions.appendChild(adv);
  header.appendChild(title); header.appendChild(actions);
  wrap.appendChild(header);
  const meta = document.createElement('div'); meta.className='meta-grid';
  const addField = (k,v) => { const m=document.createElement('div'); m.className='meta-field'; const s=document.createElement('strong'); s.textContent = `${k}: `; const t=document.createElement('span'); t.textContent = v; m.appendChild(s); m.appendChild(t); meta.appendChild(m); };
  addField('Description', item.description || '-');
  addField('Quantity', String(item.quantity));
  addField('Date', item.date || '-');
  addField('Format', item.format || '-');
  const subj = document.createElement('div'); subj.className='meta-field'; const s=document.createElement('strong'); s.textContent='Subjects: '; subj.appendChild(s); const list=document.createElement('span'); list.textContent=' '; (item.subjects||item.tags||[]).forEach((t,i)=>{ const chip=document.createElement('span'); chip.className='chip'; chip.textContent=t; subj.appendChild(chip); if (i< (item.subjects||item.tags||[]).length-1) subj.appendChild(document.createTextNode(' ')); }); meta.appendChild(subj);
  wrap.appendChild(meta);
  app.appendChild(wrap);
}

function openAdvancedModal(item) {
  log('open advanced modal', item.id);
  const backdrop = document.getElementById('modal-backdrop');
  const modal = document.getElementById('advanced-modal');
  const content = document.getElementById('advanced-modal-content');
  content.textContent = '';
  const header = document.createElement('div'); header.className='modal-header';
  const h = document.createElement('h2'); h.id='advanced-modal-title'; h.textContent='Advanced Metadata';
  const closeBtn = document.createElement('button'); closeBtn.className='icon-button'; closeBtn.setAttribute('aria-label','Close'); closeBtn.textContent='✕'; closeBtn.addEventListener('click', closeAdvancedModal);
  header.appendChild(h); header.appendChild(closeBtn);
  const form = document.createElement('form'); form.className='modal-body'; form.addEventListener('submit', (e)=>{ e.preventDefault(); });
  const fields = [
    ['type','Type'], ['publisher','Publisher'], ['language','Language'], ['source','Source'],
    ['coverage','Coverage'], ['rights','Rights'], ['creators','Creators (comma)'], ['contributors','Contributors (comma)'], ['identifiers','Identifiers (comma)']
  ];
  const values = item.__advanced || {};
  fields.forEach(([key,label]) => {
    const field = document.createElement('label'); field.className='field';
    const span = document.createElement('span'); span.textContent = label; field.appendChild(span);
    const input = document.createElement('input'); input.value = Array.isArray(values[key]) ? values[key].join(', ') : (values[key] || '');
    input.addEventListener('input', () => { values[key] = (key==='creators'||key==='contributors'||key==='identifiers') ? input.value.split(',').map(s=>s.trim()).filter(Boolean) : input.value.trim(); });
    field.appendChild(input);
    form.appendChild(field);
  });
  const actions = document.createElement('div'); actions.className='modal-actions';
  const cancel = document.createElement('button'); cancel.type='button'; cancel.className='button secondary'; cancel.textContent='Cancel'; cancel.addEventListener('click', closeAdvancedModal);
  const save = document.createElement('button'); save.type='button'; save.className='button primary'; save.textContent='Save'; save.addEventListener('click', () => {
    const items = readItems();
    const idx = items.findIndex(i => i.id === item.id);
    if (idx !== -1) { items[idx].__advanced = values; writeItems(items); log('advanced saved', item.id); }
    closeAdvancedModal(); render();
  });
  actions.appendChild(cancel); actions.appendChild(save); form.appendChild(actions);
  content.appendChild(header); content.appendChild(form);
  backdrop.hidden = false; modal.hidden = false;
}

function closeAdvancedModal() {
  document.getElementById('modal-backdrop').hidden = true;
  document.getElementById('advanced-modal').hidden = true;
}

function newItemView() {
  log('render new item');
  const app = document.getElementById('app'); app.textContent='';
  const wrap = document.createElement('div'); wrap.className='wizard';
  const h2 = document.createElement('h2'); h2.textContent = 'New Item';
  wrap.appendChild(h2);
  const f = document.createElement('form'); f.addEventListener('submit',(e)=>{ e.preventDefault(); });
  const name = document.createElement('input'); name.placeholder='Name (required)'; name.required=true;
  const desc = document.createElement('textarea'); desc.placeholder='Description (optional)';
  const tags = document.createElement('input'); tags.placeholder='Tags (comma)';
  const qty = document.createElement('input'); qty.type='number'; qty.min='1'; qty.value='1';
  const cat = document.createElement('input'); cat.placeholder='Category (optional)';
  const mk = (label, el) => { const field=document.createElement('label'); field.className='field'; const span=document.createElement('span'); span.textContent=label; field.appendChild(span); field.appendChild(el); wrap.appendChild(field); };
  mk('Name', name); mk('Description', desc); mk('Tags', tags); mk('Quantity', qty); mk('Category', cat);
  const actions = document.createElement('div'); actions.className='form-actions';
  const cancel = document.createElement('a'); cancel.href = Routes.Home; cancel.className='button secondary'; cancel.textContent='Cancel';
  const save = document.createElement('button'); save.className='button primary'; save.textContent='Save'; save.type='button'; save.addEventListener('click', async () => {
    const nm = (name.value||'').trim(); if (!nm) { name.focus(); return; }
    const ds = (desc.value||'').trim();
    const tg = (tags.value||'').split(',').map(s=>s.trim()).filter(Boolean).filter(t=>TAG_PATTERN.test(t));
    const q = Math.max(1, Math.floor(Number(qty.value)||1));
    let cg = (cat.value||'').trim();
    if (!cg) { cg = await categorizeApiOrLocal(nm, tg); }
    const item = { id:createId(), name:nm, description:ds, tags:tg, quantity:q, category:cg, createdAt:Date.now() };
    const items = readItems(); items.push(item); writeItems(items); log('created item', item.id);
    navigateTo(Routes.Home);
  });
  actions.appendChild(cancel); actions.appendChild(save); wrap.appendChild(actions);
  app.appendChild(wrap);
}

async function categorizeApiOrLocal(name, tags) {
  try {
    const controller = new AbortController();
    const t = setTimeout(()=>controller.abort(), 2000);
    const res = await fetch('/api/categorize', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, tags }), signal: controller.signal });
    clearTimeout(t);
    if (res.ok) {
      const data = await res.json();
      if (data && data.category) return data.category;
    }
  } catch (e) {
    log('categorize api fallback', e && e.name ? e.name : e);
  }
  return classifyCategory(name, tags);
}

function render() {
  const hash = location.hash || Routes.Home;
  const path = hash.startsWith('#') ? hash.slice(1) : hash;
  if (path.startsWith('/category/')) {
    const category = decodeURIComponent(path.replace('/category/',''));
    categoryView(category);
  } else if (path.startsWith('/how-to')) {
    howtoView();
  } else if (path.startsWith('/upload')) {
    uploadView();
  } else if (path.startsWith('/item/new')) {
    newItemView();
  } else if (path.startsWith('/item/')) {
    const id = decodeURIComponent(path.replace('/item/',''));
    itemDetailView(id);
  } else {
    mainView();
  }
  const main = document.getElementById('app'); main.focus && main.focus();
}

function wireEvents() {
  document.getElementById('add-button').addEventListener('click', () => navigateTo(Routes.NewItem));
  const howto = document.getElementById('howto-link'); if (howto) howto.addEventListener('click', (e) => { e.preventDefault(); navigateTo(Routes.HowTo); });
  const upload = document.getElementById('upload-link'); if (upload) upload.addEventListener('click', (e) => { e.preventDefault(); navigateTo(Routes.Upload); });
  document.getElementById('modal-backdrop').addEventListener('click', closeAdvancedModal);
}

window.addEventListener('hashchange', render);

seedDataIfNeeded();
wireEvents();
render();

