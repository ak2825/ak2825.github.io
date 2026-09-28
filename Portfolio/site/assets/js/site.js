(function (root) {
  const PAGE_TRACKS = [
    { page: 'index.html', title: "Anna's Library", artist: 'Anna Kim', cover: 'AK' },
    { page: 'projects.html', title: 'Projects', artist: 'Anna Kim', cover: 'PR' },
    { page: 'experience.html', title: 'Experience', artist: 'Anna Kim', cover: 'EX' },
    { page: 'beyond-data.html', title: 'Beyond the Data', artist: 'Anna Kim', cover: 'BD' },
    { page: 'profile.html', title: 'About Anna', artist: 'Anna Kim', cover: 'AK' },
    { page: 'project-beats-and-beliefs.html', title: 'Beats and Beliefs', artist: 'Anna Kim', cover: 'BB' },
    { page: 'project-froggit.html', title: 'Froggit', artist: 'Anna Kim', cover: 'FR' },
    { page: 'project-nba-analytics.html', title: 'NBA Player Performance Analytics', artist: 'Anna Kim', cover: 'NBA' },
    { page: 'project-allington-lab.html', title: 'Allington Lab', artist: 'Anna Kim', cover: 'AL' }
  ];

  function normalizePage(pathname) {
    const page = String(pathname || '').split('/').pop().split('#')[0];
    return PAGE_TRACKS.some((track) => track.page === page) ? page : 'index.html';
  }

  function trackForPage(pathname) {
    const page = normalizePage(pathname);
    return PAGE_TRACKS.find((track) => track.page === page);
  }

  function pageForDirection(pathname, direction, modes = {}, randomValue = Math.random()) {
    const page = normalizePage(pathname);
    if (modes.repeat) return page;
    if (modes.shuffle) {
      const alternatives = PAGE_TRACKS.filter((track) => track.page !== page);
      const index = Math.min(alternatives.length - 1, Math.floor(randomValue * alternatives.length));
      return alternatives[index].page;
    }
    const currentIndex = PAGE_TRACKS.findIndex((track) => track.page === page);
    const change = direction === 'previous' ? -1 : 1;
    return PAGE_TRACKS[(currentIndex + change + PAGE_TRACKS.length) % PAGE_TRACKS.length].page;
  }

  function greetingForHour(hour) {
    if (hour < 12) return 'Good morning, listener.';
    if (hour < 18) return 'Good afternoon, listener.';
    return 'Good evening, listener.';
  }

  function initHistoryControls(documentRef, historyRef = root.history) {
    ['back', 'forward'].forEach((action) => {
      const button = documentRef.querySelector(`[data-history-action="${action}"]`);
      if (!button) return;
      button.addEventListener('click', () => historyRef?.[action]?.());
    });
  }

  function trackLabel(track) {
    return {
      title: track.dataset.trackTitle,
      artist: `${track.dataset.trackParent} · Anna Kim`
    };
  }

  function closeSiblingTracks(activeTrack, tracks) {
    tracks.forEach((track) => {
      if (track !== activeTrack) track.open = false;
    });
  }

  function setCurrentPageLabel(documentRef) {
    const label = documentRef.querySelector('[data-now-viewing]');
    if (!label) return;
    label.textContent = `Now viewing: ${documentRef.body.dataset.pageTitle || 'Portfolio'}`;
  }

  function syncPlayerToTrack(documentRef, track) {
    const label = trackLabel(track);
    const playerTrack = documentRef.querySelector('[data-player-track]');
    const playerArtist = documentRef.querySelector('[data-player-artist]');
    const nowViewing = documentRef.querySelector('[data-now-viewing]');
    if (playerTrack) playerTrack.textContent = label.title;
    if (playerArtist) playerArtist.textContent = label.artist;
    if (nowViewing) nowViewing.textContent = `Now viewing: ${label.title}`;
  }

  function initPlayer(documentRef) {
    const player = documentRef.querySelector('.now-viewing');
    if (!player) return;

    const pathname = root.location?.pathname || 'index.html';
    const track = trackForPage(pathname);
    const trackLabel = player.querySelector('[data-player-track]');
    const artistLabel = player.querySelector('[data-player-artist]');
    const coverLabel = player.querySelector('[data-player-cover]');
    if (trackLabel) trackLabel.textContent = track.title;
    if (artistLabel) artistLabel.textContent = track.artist;
    if (coverLabel) coverLabel.textContent = track.cover;

    const modes = { shuffle: false, repeat: false };
    const playButton = player.querySelector('[data-player-action="play"]');
    const progress = player.querySelector('[data-player-progress]');

    player.querySelectorAll('[data-player-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.playerAction;
        if (action === 'play') {
          const isPlaying = button.getAttribute('aria-pressed') !== 'true';
          button.setAttribute('aria-pressed', String(isPlaying));
          button.setAttribute('aria-label', isPlaying ? 'Pause visual progress' : 'Play visual progress');
          button.textContent = isPlaying ? 'Ⅱ' : '▶';
          progress?.classList.toggle('is-playing', isPlaying);
          return;
        }
        if (action === 'shuffle' || action === 'repeat') {
          modes[action] = !modes[action];
          button.setAttribute('aria-pressed', String(modes[action]));
          return;
        }
        if (action === 'previous' || action === 'next') {
          root.location.href = pageForDirection(pathname, action, modes);
        }
      });
    });

    if (playButton) playButton.setAttribute('aria-pressed', 'false');
  }

  function initPlaylistTracks(documentRef, hash = root.location?.hash) {
    const playlistTracks = Array.from(documentRef.querySelectorAll('.playlist-track'));
    playlistTracks.forEach((track) => {
      track.addEventListener('toggle', () => {
        if (!track.open) return;
        closeSiblingTracks(track, playlistTracks);
        syncPlayerToTrack(documentRef, track);
      });
    });

    if (!hash) return;
    let targetId;
    try {
      targetId = decodeURIComponent(hash.slice(1));
    } catch {
      return;
    }
    const target = playlistTracks.find((track) => track.id === targetId);
    if (!target) return;
    closeSiblingTracks(target, playlistTracks);
    target.open = true;
    syncPlayerToTrack(documentRef, target);
  }

  function init(documentRef, date = new Date()) {
    const greeting = documentRef.querySelector('[data-greeting]');
    if (greeting) greeting.textContent = greetingForHour(date.getHours());
    setCurrentPageLabel(documentRef);
    initHistoryControls(documentRef);
    initPlayer(documentRef);
    initPlaylistTracks(documentRef);
  }

  const api = { closeSiblingTracks, greetingForHour, init, initHistoryControls, pageForDirection, setCurrentPageLabel, trackForPage, trackLabel };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PortfolioSite = api;
  if (root.document) root.document.addEventListener('DOMContentLoaded', () => init(root.document));
})(typeof window !== 'undefined' ? window : globalThis);
