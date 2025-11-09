const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const statusEl = document.getElementById('status');
const board = document.getElementById('board');
const cardTemplate = document.getElementById('card-template');

let boardState = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  isPanning: false,
  startX: 0,
  startY: 0
};

const applyTransform = () => {
  board.style.transform = `translate(${boardState.offsetX}px, ${boardState.offsetY}px) scale(${boardState.scale})`;
};

board.addEventListener('mousedown', (event) => {
  if (event.button !== 0) return;
  boardState.isPanning = true;
  boardState.startX = event.clientX - boardState.offsetX;
  boardState.startY = event.clientY - boardState.offsetY;
  board.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (event) => {
  if (!boardState.isPanning) return;
  boardState.offsetX = event.clientX - boardState.startX;
  boardState.offsetY = event.clientY - boardState.startY;
  applyTransform();
});

document.addEventListener('mouseup', () => {
  boardState.isPanning = false;
  board.style.cursor = 'grab';
});

board.addEventListener('wheel', (event) => {
  event.preventDefault();
  const scaleAmount = -event.deltaY * 0.001;
  boardState.scale = Math.min(Math.max(boardState.scale + scaleAmount, 0.5), 2.5);
  applyTransform();
});

const createListItems = (values, formatter) => {
  if (!Array.isArray(values) || values.length === 0) return null;
  const fragment = document.createDocumentFragment();
  values.forEach((value) => {
    const li = document.createElement('li');
    li.innerHTML = formatter(value);
    fragment.appendChild(li);
  });
  return fragment;
};

const buildCard = (payload) => {
  const instance = cardTemplate.content.cloneNode(true);
  const article = instance.querySelector('.result-card');
  article.querySelector('.card-title').textContent = payload.title ?? 'Untitled';
  article.querySelector('.card-subtitle').textContent = payload.synopsis ?? '';

  const themeList = instance.querySelector('.themes ul');
  const themeItems = createListItems(payload.themes, (theme) => {
    const title = theme.title ? `<strong>${theme.title}</strong>` : '';
    const insight = theme.insight ?? '';
    return `${title}${insight}`;
  });
  if (themeItems) {
    themeList.append(themeItems);
  } else {
    themeList.parentElement.remove();
  }

  const crossMediaList = instance.querySelector('.cross-media ul');
  const crossMediaItems = createListItems(payload.crossMedia, (entry) => {
    const headingParts = [entry.medium, entry.title, entry.creator].filter(Boolean).join(' — ');
    const heading = headingParts ? `<strong>${headingParts}</strong>` : '';
    const description = entry.description ?? '';
    return `${heading}${description}`;
  });
  if (crossMediaItems) {
    crossMediaList.append(crossMediaItems);
  } else {
    crossMediaList.parentElement.remove();
  }

  const contemporaryList = instance.querySelector('.contemporary ul');
  const contemporaryItems = createListItems(payload.contemporaryResonance, (item) => item);
  if (contemporaryItems) {
    contemporaryList.append(contemporaryItems);
  } else {
    contemporaryList.parentElement.remove();
  }

  const conversationList = instance.querySelector('.conversations ul');
  const conversationItems = createListItems(payload.conversationStarters, (item) => item);
  if (conversationItems) {
    conversationList.append(conversationItems);
  } else {
    conversationList.parentElement.remove();
  }

  const furtherList = instance.querySelector('.further ul');
  const furtherItems = createListItems(payload.furtherExploration, (entry) => {
    const headingParts = [entry.medium, entry.title].filter(Boolean).join(' — ');
    const heading = headingParts ? `<strong>${headingParts}</strong>` : '';
    const why = entry.why ?? '';
    return `${heading}${why}`;
  });
  if (furtherItems) {
    furtherList.append(furtherItems);
  } else {
    furtherList.parentElement.remove();
  }

  return instance;
};

const clearBoard = () => {
  board.innerHTML = '';
};

const renderResult = (result) => {
  clearBoard();
  const card = buildCard(result);
  board.append(card);
  boardState = { ...boardState, offsetX: 0, offsetY: 0, scale: 1 };
  applyTransform();
};

const handleError = (error) => {
  statusEl.textContent = error;
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = input.value.trim();
  if (!query) return;

  statusEl.textContent = 'Spooling references…';
  form.classList.add('loading');

  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Search failed');
    }

    const result = await response.json();
    renderResult(result);
    statusEl.textContent = `Showing references for “${query}”. Drag to pan, scroll to zoom.`;
  } catch (error) {
    console.error(error);
    handleError(error.message);
  } finally {
    form.classList.remove('loading');
  }
});

applyTransform();
board.style.cursor = 'grab';
