// Check JS is Connected
console.log('JS Connected');

// Inject favicon and manifest links into <head> so we don't repeat in every page
(function injectFavicons() {
  try {
    const head = document.head || document.getElementsByTagName('head')[0];
    if (!head) return;

    // Avoid duplicate injection if links already present
    const hasFavicon = head.querySelector('link[rel="icon"][sizes="32x32"]');
    const hasManifest = head.querySelector('link[rel="manifest"]');
    if (!hasFavicon) {
      const links = [
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/assets/icons/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/assets/icons/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/assets/icons/favicon-16x16.png' }
      ];
      links.forEach(def => {
        const link = document.createElement('link');
        Object.entries(def).forEach(([k, v]) => link.setAttribute(k, v));
        head.appendChild(link);
      });
    }
    if (!hasManifest) {

    // Global Spotify embed toggle with localStorage persistence
    (function setupSpotifyEmbed() {
      const STORAGE_KEY = 'ui_spotifyEmbed_visible_v1';

      function applySavedVisibility() {
        const embed = document.getElementById('spotifyEmbed');
        if (!embed) return;
        let visible = true;
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          visible = saved === null ? true : saved === '1';
        } catch {}
        if (visible) embed.classList.remove('is-hidden');
        else embed.classList.add('is-hidden');
      }

      // Delegate clicks for the toggle button (works regardless of injection timing)
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('#spotifyToggle');
        if (!btn) return;
        const embed = document.getElementById('spotifyEmbed');
        if (!embed) return;
        const visible = embed.classList.toggle('is-hidden') === false;
        try { localStorage.setItem(STORAGE_KEY, visible ? '1' : '0'); } catch {}
      });

      // Apply state on DOM ready and when footer is injected
      document.addEventListener('DOMContentLoaded', () => {
        applySavedVisibility();
        // Observe for footer injection and apply once embed appears
        const obs = new MutationObserver((mutations) => {
          for (const m of mutations) {
            for (const n of m.addedNodes) {
              if (n.nodeType === 1) {
                if (n.id === 'spotifyEmbed' || (n.querySelector && n.querySelector('#spotifyEmbed'))) {
                  applySavedVisibility();
                  return;
                }
              }
            }
          }
        });
        try {
          obs.observe(document.body, { childList: true, subtree: true });
          setTimeout(() => obs.disconnect(), 5000);
        } catch {}
      });
    })();
      const manifest = document.createElement('link');
      manifest.setAttribute('rel', 'manifest');
      manifest.setAttribute('href', '/site.webmanifest');
      head.appendChild(manifest);
    }
  } catch (e) {
    console.warn('Favicon injection skipped:', e);
  }
})();

// get JSON data
// create anchor link for each item
document.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('/data.json');
      if (!response.ok) return; // quietly exit if not found
      const data = await response.json();
      
      const myLinks = document.getElementById('myLinks');
      if (!myLinks) return;
      const fragment = document.createDocumentFragment();
  
      data.myLinks.forEach(({ url, name }) => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${url}" target="_blank">${name}</a>`;
        fragment.appendChild(li);
      });
  
      myLinks.appendChild(fragment);
    } catch (error) {
      console.error('Error loading JSON:', error);
    }
  });
