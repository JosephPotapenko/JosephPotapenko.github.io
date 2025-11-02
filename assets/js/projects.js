// Data-driven renderer for projects page to avoid repeated containers and markup
(function initProjectsPage(){
  document.addEventListener('DOMContentLoaded', async () => {
    const root = document.getElementById('projects-root');
    if (!root) return; // Not on projects page

    // Simple localStorage cache for resolved preview images
    const CACHE_KEY = 'ogImageCacheV1';
    const cache = (() => {
      try {
        return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      } catch { return {}; }
    })();
    const getCachedImage = (href) => cache[href];
    const setCachedImage = (href, url) => {
      try {
        cache[href] = url;
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      } catch { /* ignore quota */ }
    };

    // Helper: try multiple JSON paths to handle different hosting bases
    async function fetchJSONWithFallback(paths) {
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: 'no-cache' });
          if (res.ok) return await res.json();
        } catch (e) {
          // try next
        }
      }
      return null;
    }

    // Fetch data, fallback to inline data on failure
    const data = await (async () => {
      try {
        const json = await fetchJSONWithFallback([
          '/assets/data/projects.json',
          '../assets/data/projects.json',
          'assets/data/projects.json'
        ]);
        if (json) return json;
      } catch(e) {
        console.warn('Falling back to inline projects data:', e);
      }
      return {
        sections: [
          {
            title: 'HTML & CSS',
            titleClass: 'image-text-1',
            containerClass: 'image-cards-container-horizontal',
            items: [
              { href: 'https://clock-coral-nine.vercel.app/', img: '/images/Clock.png', alt: 'Clock', label: 'Clock Project' },
              { href: 'https://image-color-pallet-swap.vercel.app/', img: '/images/Code.webp', alt: 'Image Palette Swap', label: 'Image Palette Swap' },
              { href: 'https://sprite-sheet-clothing-color-changer.vercel.app/', img: '/images/Code.webp', alt: 'Sprite Sheet Color Changer', label: 'Sprite Sheet Color Changer' },
              { href: 'https://sprite-sheet-composition.vercel.app/', img: '/images/Code.webp', alt: 'Sprite Sheet Composition', label: 'Sprite Sheet Composition' },
              { href: 'https://re-ordering-images.vercel.app/', img: '/images/Code.webp', alt: 'Re-Ordering Images', label: 'Re-Ordering Images' }
            ]
          },
          {
            title: 'JAVA/JAVAScript',
            titleClass: 'image-text-3',
            containerClass: 'image-cards-container-horizontal-3',
            items: [
              { href: 'https://cscd-210-lab6.vercel.app/', img: '/images/number manipulation.png', alt: 'Java Number Manipulation Program', label: 'Number Manipulation' },
              { href: 'https://cscd-210-lab5.vercel.app/', img: '/images/number manipulation 2.png', alt: 'Java Number Manipulation Program 2', label: 'Number Manipulation 2' },
              { href: 'https://cscd-210-lab10.vercel.app/', img: '/images/author website.png', alt: 'Author Sorting Program', label: 'Author List Sorting' },
              { href: 'https://example.com', img: '/images/Code.webp', alt: 'Future Project', label: 'Future Project' },
              { href: 'https://example.com', img: '/images/Code.webp', alt: 'Future Project', label: 'Future Project' }
            ]
          },
          {
            title: 'Ruby on Rails',
            titleClass: 'image-text-2',
            containerClass: 'image-cards-container-horizontal-2',
            items: [
              { href: 'https://example.com', img: '/images/Code.webp', alt: 'Future Project', label: 'Future Project' },
              { href: 'https://example.com', img: '/images/Code.webp', alt: 'Future Project', label: 'Future Project' },
              { href: 'https://example.com', img: '/images/Code.webp', alt: 'Future Project', label: 'Future Project' },
              { href: 'https://example.com', img: '/images/Code.webp', alt: 'Future Project', label: 'Future Project' },
              { href: 'https://example.com', img: '/images/Code.webp', alt: 'Future Project', label: 'Future Project' }
            ]
          }
        ]
      };
    })();

    // Helper predicates
    const isFutureOrExample = ({ href, alt, label }) => {
      const text = `${alt || ''} ${label || ''}`.toLowerCase();
      const url = (href || '').toLowerCase();
      return (
        text.includes('future project') ||
        text.includes('future code') ||
        url.includes('example.com') ||
        /(^|\/)example(\.html?)?$/.test(url)
      );
    };

    // Helper to create one card with optional auto image resolution
    const createCard = ({ href, img, alt, label }) => {
      const card = document.createElement('div');
      card.className = 'image-card colorful-border';

      const anchor = document.createElement('a');
      anchor.href = href;

      const image = document.createElement('img');
      image.alt = alt || label || 'Project';
      const cached = href ? getCachedImage(href) : null;
      const ignoreAuto = isFutureOrExample({ href, alt, label });
      const PLACEHOLDER = '/images/Code.webp';
      const isFutureLabel = /future\s*(project|code)/i.test((label || alt || ''));
      // Priority: if future -> placeholder; else cached > provided img > placeholder
      let initialSrc;
      if (isFutureLabel) {
        initialSrc = PLACEHOLDER;
      } else if (cached) {
        initialSrc = cached;
      } else if (img) {
        initialSrc = img;
      } else {
        initialSrc = PLACEHOLDER;
      }
      image.src = initialSrc;
      const isPlaceholder = /\/images\/Code\.webp$/.test(image.src) || image.src.endsWith('Code.webp');

      const textBox = document.createElement('div');
      textBox.className = 'text-box';
      textBox.innerHTML = `<p>${label || alt || href}</p>`;

      anchor.appendChild(image);
      anchor.appendChild(textBox);
      card.appendChild(anchor);

      // If no explicit image or a placeholder was provided, try to resolve og:image via our API
      // Only attempt auto-resolve when not an example/future placeholder
      if (href && isPlaceholder && !cached && !ignoreAuto) {
        const apiPaths = [
          `/api/og-image.php?url=${encodeURIComponent(href)}`,
          `../api/og-image.php?url=${encodeURIComponent(href)}`
        ];

        (async () => {
          // 1) Try our local PHP endpoints (works on PHP-capable hosting)
          for (const apiUrl of apiPaths) {
            try {
              const r = await fetch(apiUrl, { cache: 'no-store' });
              if (!r.ok) continue;
              const data = await r.json();
              if (data && data.ok && data.image) {
                image.src = data.image;
                setCachedImage(href, data.image);
                return;
              }
            } catch (e) {
              // try next path
            }
          }

          // 2) Fallback to Microlink metadata (works on static hosting); try image then logo
          try {
            const mUrl = `https://api.microlink.io/?url=${encodeURIComponent(href)}&audio=false&video=false&page=false`;
            const mr = await fetch(mUrl, { cache: 'no-store' });
            if (mr.ok) {
              const m = await mr.json();
              const data = m && m.status === 'success' && m.data ? m.data : null;
              const ogImg = data && data.image ? (data.image.url || data.image) : null;
              const logo = data && data.logo ? (data.logo.url || data.logo) : null;
              const picked = ogImg || logo;
              if (picked) {
                image.src = picked;
                setCachedImage(href, picked);
                return;
              }
            }
          } catch (e) { /* proceed to screenshot */ }

          // 3) Last resort: Microlink screenshot
          try {
            const sUrl = `https://api.microlink.io/?url=${encodeURIComponent(href)}&screenshot=true&meta=false`;
            const sr = await fetch(sUrl, { cache: 'no-store' });
            if (sr.ok) {
              const s = await sr.json();
              const shot = s && s.status === 'success' && s.data && s.data.screenshot ? (s.data.screenshot.url || s.data.screenshot) : null;
              if (shot) {
                image.src = shot;
                setCachedImage(href, shot);
              }
            }
          } catch (e) {
            // keep placeholder
          }
        })();
      }

      return card;
    };

    // Render sections
    const frag = document.createDocumentFragment();

    // Main page title is static in HTML as .image-text-title; we render category titles and rows here
    data.sections.forEach(section => {
      // Title
      const h2 = document.createElement('h2');
      h2.className = section.titleClass;
      h2.textContent = section.title;
      frag.appendChild(h2);

      // Container row
      const mainEl = document.createElement('main');
      const row = document.createElement('div');
      row.className = section.containerClass;

      section.items.forEach(item => row.appendChild(createCard(item)));
      mainEl.appendChild(row);
      frag.appendChild(mainEl);
    });

    root.appendChild(frag);
  });
})();
