// Simple client-side router and data layer

const StorageKeys = {
  Items: 'collection.items.v1',
  Seeded: 'collection.seeded.v1'
};

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
  if (location.hash !== hash) location.hash = hash;
  else render();
}

function mainView() {
  const items = readItems();
  const grouped = groupByCategory(items);
  const categories = Array.from(grouped.keys()).sort((a,b)=>a.localeCompare(b));

  const app = document.getElementById('app');
  app.innerHTML = '';

  if (categories.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = 'No items yet. Click "Add to Collection" to get started.';
    app.appendChild(empty);
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'grid';
  for (const category of categories) {
    const list = grouped.get(category) || [];
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `<div class="title">${category}</div><div class="meta">${list.length} item${list.length!==1?'s':''}</div>`;
    card.addEventListener('click', () => navigateTo(`#category/${encodeURIComponent(category)}`));
    grid.appendChild(card);
  }
  app.appendChild(grid);
}

function categoryView(category) {
  const items = readItems().filter(i => i.category === category);
  const app = document.getElementById('app');
  app.innerHTML = '';

  const crumbs = document.createElement('div');
  crumbs.className = 'crumbs';
  const back = document.createElement('a');
  back.href = '#';
  back.textContent = '← All categories';
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

  const list = document.createElement('div');
  list.className = 'items';
  for (const item of items) {
    const card = document.createElement('div');
    card.className = 'item-card';
    const tagText = item.tags.length ? ` • ${item.tags.join(', ')}` : '';
    const nameDiv = document.createElement('div');
    nameDiv.className = 'name';
    nameDiv.textContent = item.name + ' ';
    const qtySpan = document.createElement('span');
    qtySpan.className = 'meta';
    qtySpan.textContent = `×${item.quantity}`;
    nameDiv.appendChild(qtySpan);

    const descDiv = document.createElement('div');
    descDiv.className = 'desc';
    descDiv.textContent = item.description || '';

    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'tags';
    tagsDiv.textContent = `${item.category}${tagText}`;

    card.appendChild(nameDiv);
    card.appendChild(descDiv);
    card.appendChild(tagsDiv);
    list.appendChild(card);
  }
  app.appendChild(list);
}

function howtoView() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'howto';
  wrap.innerHTML = `
    <h2>How to Use</h2>
    <p>Add items with the button below. The app will auto-categorize based on the name and tags you enter. You can browse categories from the main screen, and drill into a category to view item details.</p>
    <ol>
      <li>Click "Add to Collection"</li>
      <li>Enter a name (e.g., Toothbrush), optional description, tags, and quantity</li>
      <li>Submit to save. You'll see a new category tile if needed</li>
      <li>Tap a category to view its items</li>
    </ol>
    <p>Data is stored locally in your browser.</p>
    <a href="#">← Back to main</a>
  `;
  app.appendChild(wrap);
}

function render() {
  const hash = location.hash;
  if (hash.startsWith('#category/')) {
    const category = decodeURIComponent(hash.replace('#category/',''));
    categoryView(category);
  } else if (hash.startsWith('#howto')) {
    howtoView();
  } else {
    mainView();
  }
}

function openModal() {
  document.getElementById('modal-backdrop').hidden = false;
  document.getElementById('add-modal').hidden = false;
  const form = document.getElementById('add-form');
  form.reset();
  form.elements.namedItem('name').focus();
}

function closeModal() {
  document.getElementById('modal-backdrop').hidden = true;
  document.getElementById('add-modal').hidden = true;
}

function wireEvents() {
  document.getElementById('add-button').addEventListener('click', openModal);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', closeModal);

  document.getElementById('howto-link').addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('#howto');
  });

  const form = document.getElementById('add-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const description = (data.get('description') || '').toString().trim();
    const tagsRaw = (data.get('tags') || '').toString();
    const quantity = Number(data.get('quantity') || 1) || 1;
    const tags = tagsRaw.split(',').map(s => s.trim()).filter(Boolean);
    if (!name) return;
    const category = classifyCategory(name, tags);
    const item = { id: createId(), name, description, tags, quantity, category, createdAt: Date.now() };
    const items = readItems();
    items.push(item);
    writeItems(items);
    closeModal();
    render();
  });
}

window.addEventListener('hashchange', render);

seedDataIfNeeded();
wireEvents();
render();

