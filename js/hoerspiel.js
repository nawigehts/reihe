(() => {

  const CSV_URL = 'daten/buecher.csv';
  const MEDIA_BASE = 'daten/medien/';


  const audioCard =
    document.querySelector('#audio-card');

  const errorBox =
    document.querySelector('#audio-error');

  const errorText =
    document.querySelector('#audio-error-text');


  const audio =
    document.querySelector('#audio');

  const titleEl =
    document.querySelector('#audio-title');

  const bandEl =
    document.querySelector('#audio-band');

  const numberEl =
    document.querySelector('#audio-book-number');

  const metaEl =
    document.querySelector('#audio-meta');

  const descriptionEl =
    document.querySelector('#audio-description');

  const speakerEl =
    document.querySelector('#audio-speaker');

  const coverEl =
    document.querySelector('#audio-cover');

  const coverPlaceholder =
    document.querySelector('#audio-cover-placeholder');


  const currentTimeEl =
    document.querySelector('#current-time');

  const durationEl =
    document.querySelector('#duration');

  const progressEl =
    document.querySelector('#progress');

  const volumeEl =
    document.querySelector('#volume');


  const backwardBtn =
    document.querySelector('#backward-btn');

  const playPauseBtn =
    document.querySelector('#play-pause-btn');

  const forwardBtn =
    document.querySelector('#forward-btn');

  const stopBtn =
    document.querySelector('#stop-btn');


  const materialsSection =
    document.querySelector('#audio-materials-section');

  const materialsEl =
    document.querySelector('#audio-materials');


  let linkColumns = [];


  function parseCSV(
    text,
    delimiter = ';'
  ) {

    const rows = [];

    let row = [];
    let field = '';
    let inQuotes = false;


    text = text
      .replace(/^\uFEFF/, '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');


    for (
      let i = 0;
      i < text.length;
      i += 1
    ) {

      const char = text[i];
      const next = text[i + 1];


      if (char === '"') {

        if (
          inQuotes &&
          next === '"'
        ) {

          field += '"';
          i += 1;

        } else {

          inQuotes = !inQuotes;

        }

      } else if (
        char === delimiter &&
        !inQuotes
      ) {

        row.push(field.trim());
        field = '';

      } else if (
        char === '\n' &&
        !inQuotes
      ) {

        row.push(field.trim());

        if (
          row.some(
            cell => cell !== ''
          )
        ) {

          rows.push(row);

        }

        row = [];
        field = '';

      } else {

        field += char;

      }

    }


    row.push(field.trim());

    if (
      row.some(
        cell => cell !== ''
      )
    ) {

      rows.push(row);

    }


    return rows;

  }


  function rowsToObjects(rows) {

    if (!rows.length) {
      return [];
    }


    const headers =
      rows[0].map(
        header => header.trim()
      );


    linkColumns =
      headers.filter(
        header =>
          header
            .toLowerCase()
            .startsWith('link_')
      );


    return rows
      .slice(1)
      .map(cells => {

        const entry = {};


        headers.forEach(
          (header, index) => {

            entry[header] =
              (
                cells[index] ?? ''
              ).trim();

          }
        );


        return entry;

      })
      .filter(
        entry =>
          entry.nr ||
          entry.titel
      );

  }


  function normalize(value) {

    return String(value ?? '')
      .toLocaleLowerCase('de')
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      );

  }


  function mediaPath(
    book,
    value
  ) {

    const file =
      (value || '').trim();


    if (!file) {
      return '';
    }


    if (
      /^(https?:)?\/\//i.test(file) ||
      file.startsWith('/') ||
      file.includes('/')
    ) {

      return file;

    }


    return (
      `${MEDIA_BASE}${book.nr}/${file}`
    );

  }


  function linkLabel(column) {

    return column
      .slice(5)
      .replaceAll('_', ' ')
      .trim();

  }


  function isAudioColumn(column) {

    const key =
      normalize(column)
        .replace(
          /[^a-z0-9]/g,
          ''
        );


    return (
      key === 'linkhorspiel' ||
      key === 'linkhoerspiel'
    );

  }


  function findAudioColumn() {

    return linkColumns.find(
      isAudioColumn
    );

  }


  function formatTime(seconds) {

    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {

      return '0:00';

    }


    const minutes =
      Math.floor(seconds / 60);

    const remainingSeconds =
      Math.floor(seconds % 60);


    return (
      `${minutes}:` +
      String(
        remainingSeconds
      ).padStart(2, '0')
    );

  }


  function syncProgress() {

    if (
      !Number.isFinite(
        audio.duration
      ) ||
      audio.duration <= 0
    ) {

      progressEl.value = 0;

      currentTimeEl.textContent =
        '0:00';

      durationEl.textContent =
        '0:00';

      return;

    }


    progressEl.value =
      (
        audio.currentTime /
        audio.duration
      ) * 100;


    currentTimeEl.textContent =
      formatTime(
        audio.currentTime
      );


    durationEl.textContent =
      formatTime(
        audio.duration
      );

  }


  function updatePlayButton() {

    playPauseBtn.textContent =
      audio.paused
        ? 'Start'
        : 'Pause';

  }


  function seekBy(seconds) {

    if (
      !Number.isFinite(
        audio.duration
      )
    ) {

      return;

    }


    audio.currentTime =
      Math.min(
        Math.max(
          audio.currentTime +
          seconds,
          0
        ),
        audio.duration
      );


    syncProgress();

  }


  async function togglePlayPause() {

    if (audio.paused) {

      try {

        await audio.play();

      } catch (error) {

        console.error(
          'Audio konnte nicht gestartet werden:',
          error
        );

      }

    } else {

      audio.pause();

    }


    updatePlayButton();

  }


  function stopAudio() {

    audio.pause();
    audio.currentTime = 0;

    syncProgress();
    updatePlayButton();

  }


  function renderMaterials(book) {

    materialsEl.replaceChildren();


    linkColumns.forEach(
      column => {

        if (
          isAudioColumn(column)
        ) {

          return;

        }


        const value =
          (
            book[column] || ''
          ).trim();


        if (
          !value ||
          value === '#'
        ) {

          return;

        }


        const anchor =
          document.createElement('a');


        anchor.className =
          'book-link';


        anchor.href =
          mediaPath(
            book,
            value
          );


        anchor.textContent =
          linkLabel(column);


        anchor.target = '_blank';

        anchor.rel =
          'noopener noreferrer';


        materialsEl.appendChild(
          anchor
        );

      }
    );


    materialsSection.hidden =
      materialsEl.children.length === 0;

  }


  function renderBook(book) {

    const audioColumn =
      findAudioColumn();


    if (!audioColumn) {

      throw new Error(
        'In der CSV fehlt die Spalte link_Hörspiel.'
      );

    }


    const audioValue =
      (
        book[audioColumn] || ''
      ).trim();


    if (!audioValue) {

      throw new Error(
        'Für dieses Buch ist kein Hörspiel eingetragen.'
      );

    }


    const audioSrc =
      mediaPath(
        book,
        audioValue
      );


    titleEl.textContent =
      book.titel ||
      'Hörspiel';


    document.title =
      `${book.titel || 'Hörspiel'} · NaWi geht’s?`;


    bandEl.textContent =
      book.nr
        ? `Band ${book.nr}`
        : 'NaWi geht’s?';


    numberEl.textContent =
      book.nr || '—';


    const metaParts = [];


    if (book.autor) {
      metaParts.push(
        book.autor
      );
    }


    if (book.jahr) {
      metaParts.push(
        book.jahr
      );
    }


    metaEl.textContent =
      metaParts.join(' · ');


    descriptionEl.textContent =
      book.kurzbeschreibung || '';


    if (book.sprecher) {

      speakerEl.textContent =
        `Gesprochen von: ${book.sprecher}`;

      speakerEl.hidden = false;

    } else {

      speakerEl.hidden = true;

    }


    const coverSrc =
      mediaPath(
        book,
        book.bild
      );


    if (coverSrc) {

      coverEl.src =
        coverSrc;


      coverEl.alt =
        `Cover von ${book.titel || 'diesem Buch'}`;


      coverEl.addEventListener(
        'load',
        () => {

          coverPlaceholder.hidden =
            true;

        }
      );


      coverEl.addEventListener(
        'error',
        () => {

          coverEl.hidden = true;

          coverPlaceholder.hidden =
            false;

        }
      );

    } else {

      coverEl.hidden = true;

      coverPlaceholder.hidden =
        false;

    }


    audio.src =
      audioSrc;


    renderMaterials(book);


    audioCard.hidden = false;

  }


  function showError(message) {

    audioCard.hidden = true;

    errorText.textContent =
      message;

    errorBox.hidden = false;

  }


  async function init() {

    const params =
      new URLSearchParams(
        window.location.search
      );


    const bookNumber =
      (
        params.get('buch') || ''
      ).trim();


    if (!bookNumber) {

      showError(
        'Es wurde keine Buchnummer angegeben.'
      );

      return;

    }


    try {

      const response =
        await fetch(
          CSV_URL,
          {
            cache: 'no-store'
          }
        );


      if (!response.ok) {

        throw new Error(
          `CSV konnte nicht geladen werden: HTTP ${response.status}`
        );

      }


      const text =
        await response.text();


      const books =
        rowsToObjects(
          parseCSV(text)
        );


      const book =
        books.find(
          item =>
            String(item.nr) ===
            String(bookNumber)
        );


      if (!book) {

        throw new Error(
          `Buch ${bookNumber} wurde nicht gefunden.`
        );

      }


      renderBook(book);


    } catch (error) {

      console.error(error);

      showError(
        error.message ||
        'Das Hörspiel konnte nicht geladen werden.'
      );

    }

  }


  audio.addEventListener(
    'loadedmetadata',
    syncProgress
  );


  audio.addEventListener(
    'timeupdate',
    syncProgress
  );


  audio.addEventListener(
    'play',
    updatePlayButton
  );


  audio.addEventListener(
    'pause',
    updatePlayButton
  );


  audio.addEventListener(
    'ended',
    () => {

      syncProgress();
      updatePlayButton();

    }
  );


  audio.addEventListener(
    'error',
    () => {

      showError(
        'Die Audiodatei konnte nicht geladen werden. Prüfe Dateiname und Pfad in der buecher.csv.'
      );

    }
  );


  progressEl.addEventListener(
    'input',
    () => {

      if (
        !Number.isFinite(
          audio.duration
        ) ||
        audio.duration <= 0
      ) {

        return;

      }


      audio.currentTime =
        (
          Number(
            progressEl.value
          ) / 100
        ) * audio.duration;


      syncProgress();

    }
  );


  volumeEl.addEventListener(
    'input',
    () => {

      audio.volume =
        Number(
          volumeEl.value
        );

    }
  );


  backwardBtn.addEventListener(
    'click',
    () => seekBy(-10)
  );


  forwardBtn.addEventListener(
    'click',
    () => seekBy(10)
  );


  playPauseBtn.addEventListener(
    'click',
    togglePlayPause
  );


  stopBtn.addEventListener(
    'click',
    stopAudio
  );


  audio.volume =
    Number(
      volumeEl.value
    );


  init();

})();
