(() => {
  const CSV_URL = 'daten/buecher.csv';
  const MEDIA_BASE = 'medien/';

  const list = document.querySelector('#book-list');
  const template = document.querySelector('#book-template');
  const search = document.querySelector('#search');
  const resultCount = document.querySelector('#result-count');
  const emptyState = document.querySelector('#empty-state');
  const loadError = document.querySelector('#load-error');
  const clearSearch = document.querySelector('#clear-search');
  const gridButton = document.querySelector('#grid-view');
  const listButton = document.querySelector('#list-view');
  const sortAscButton = document.querySelector('#sort-asc');
  const sortDescButton = document.querySelector('#sort-desc');

  let books = [];
  let linkColumns = [];
  let sortDirection = 'asc';

  function parseCSV(text, delimiter = ';') {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;

    text = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        row.push(field.trim());
        field = '';
      } else if (char === '\n' && !inQuotes) {
        row.push(field.trim());
        if (row.some(cell => cell !== '')) rows.push(row);
        row = [];
        field = '';
      } else {
        field += char;
      }
    }

    row.push(field.trim());
    if (row.some(cell => cell !== '')) rows.push(row);
    return rows;
  }

  function rowsToObjects(rows) {
    if (!rows.length) return [];
    const headers = rows[0].map(header => header.trim());
    linkColumns = headers.filter(header => header.toLowerCase().startsWith('link_'));

    return rows.slice(1).map(cells => {
      const entry = {};
      headers.forEach((header, index) => {
        entry[header] = (cells[index] ?? '').trim();
      });
      return entry;
    }).filter(entry => entry.nr || entry.titel);
  }

  function normalize(value) {
    return String(value ?? '')
      .toLocaleLowerCase('de')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function mediaPath(book, value) {
    const file = (value || '').trim();
    if (!file) return '';
    // Externe URLs und bereits vollständige Pfade unverändert lassen
    if (
      /^(https?:)?\/\//i.test(file) ||
      file.startsWith('/') ||
      file.includes('/')
    ) {
      return file;
    }
    // Einfache Dateinamen automatisch dem jeweiligen Buchordner zuordnen
    return `${MEDIA_BASE}${book.nr}/${file}`;
  }

  function linkLabel(column) {
    return column.slice(5).replaceAll('_', ' ').trim();
  }

  function isPlaceholderLink(url) {
    return ['#', 'PLATZHALTER', 'platzhalter'].includes((url || '').trim());
  }

  function renderBook(book) {
    const fragment = template.content.cloneNode(true);
    const card = fragment.querySelector('.book-card');
    const cover = fragment.querySelector('.book-cover');
    const placeholder = fragment.querySelector('.cover-placeholder');
    const links = fragment.querySelector('.book-links');

    fragment.querySelector('.book-number').textContent = book.nr || '—';
    fragment.querySelector('.book-kicker').textContent = book.nr ? `Band ${book.nr}` : 'NaWi geht’s?';
    fragment.querySelector('.book-title').textContent = book.titel || 'Titel folgt';
    const authorText = book.autor || 'Autor:in folgt';
    const yearText = book.jahr ? ` · ${book.jahr}` : '';
    fragment.querySelector('.book-author').textContent = authorText + yearText;
    fragment.querySelector('.book-description').textContent = book.kurzbeschreibung || 'Kurzbeschreibung folgt.';

    const src = mediaPath(book, book.bild);
    if (src) {
      cover.src = src;
      cover.alt = `Cover von ${book.titel || 'Buch ' + (book.nr || '')}`;
      cover.addEventListener('load', () => { placeholder.hidden = true; });
      cover.addEventListener('error', () => { cover.hidden = true; placeholder.hidden = false; });
    } else {
      cover.hidden = true;
    }

    linkColumns.forEach((column, index) => {
      const url = (book[column] || '').trim();
      if (!url) return;

      if (isPlaceholderLink(url)) {
        const span = document.createElement('span');
        span.className = 'book-link is-placeholder';
        span.textContent = `${linkLabel(column)} · Link folgt`;
        span.title = 'Platzhalter: URL in daten/buecher.csv eintragen';
        links.appendChild(span);
        return;
      }

      const anchor = document.createElement('a');
      anchor.className = 'book-link';
      if (index === 0) anchor.classList.add('is-primary');
      anchor.href = mediaPath(book, url);
      anchor.textContent = linkLabel(column);
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      links.appendChild(anchor);
    });

    if (!links.children.length) links.hidden = true;
    card.dataset.search = normalize(Object.values(book).join(' '));
    return fragment;
  }

  function sortBooks(items) {
    const sorted = [...items].sort((a, b) => {
      const aNum = Number.parseInt(a.nr, 10);
      const bNum = Number.parseInt(b.nr, 10);
      if (Number.isFinite(aNum) && Number.isFinite(bNum)) return aNum - bNum;
      return String(a.nr).localeCompare(String(b.nr), 'de', { numeric: true });
    });
    return sortDirection === 'desc' ? sorted.reverse() : sorted;
  }

  function render(items) {
    list.replaceChildren();
    sortBooks(items).forEach(book => list.appendChild(renderBook(book)));

    const total = books.length;
    const shown = items.length;
    resultCount.textContent = shown === total
      ? `${total} ${total === 1 ? 'Buch' : 'Bücher'}`
      : `${shown} von ${total} ${total === 1 ? 'Buch' : 'Büchern'}`;
    emptyState.hidden = shown !== 0;
  }

  function filteredBooks() {
    const query = normalize(search.value.trim());
    const tokens = query.split(/\s+/).filter(Boolean);
    return books.filter(book => {
      const haystack = normalize(Object.values(book).join(' '));
      return tokens.every(token => haystack.includes(token));
    });
  }

  function applySearch() {
    render(filteredBooks());
  }

  function setView(view) {
    const isGrid = view !== 'list';
    list.classList.toggle('grid-view', isGrid);
    list.classList.toggle('list-view', !isGrid);
    gridButton.classList.toggle('is-active', isGrid);
    listButton.classList.toggle('is-active', !isGrid);
    gridButton.setAttribute('aria-pressed', String(isGrid));
    listButton.setAttribute('aria-pressed', String(!isGrid));
    try { localStorage.setItem('nawi-view', isGrid ? 'grid' : 'list'); } catch (_) {}
  }

  function setSort(direction) {
    sortDirection = direction === 'desc' ? 'desc' : 'asc';
    const isAsc = sortDirection === 'asc';
    sortAscButton.classList.toggle('is-active', isAsc);
    sortDescButton.classList.toggle('is-active', !isAsc);
    sortAscButton.setAttribute('aria-pressed', String(isAsc));
    sortDescButton.setAttribute('aria-pressed', String(!isAsc));
    try { localStorage.setItem('nawi-sort', sortDirection); } catch (_) {}
    if (books.length) applySearch();
  }

  async function init() {
    try {
      const response = await fetch(CSV_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      books = rowsToObjects(parseCSV(text));
      render(books);
    } catch (error) {
      console.error('Buchdaten konnten nicht geladen werden:', error);
      loadError.hidden = false;
      resultCount.textContent = '';
    }
  }

  search.addEventListener('input', applySearch);
  clearSearch.addEventListener('click', () => { search.value = ''; applySearch(); search.focus(); });
  gridButton.addEventListener('click', () => setView('grid'));
  listButton.addEventListener('click', () => setView('list'));
  sortAscButton.addEventListener('click', () => setSort('asc'));
  sortDescButton.addEventListener('click', () => setSort('desc'));

  let savedView = 'grid';
  let savedSort = 'asc';
  try {
    savedView = localStorage.getItem('nawi-view') || 'grid';
    savedSort = localStorage.getItem('nawi-sort') || 'asc';
  } catch (_) {}
  setView(savedView);
  setSort(savedSort);
  init();
})();
