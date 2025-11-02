// Auto-extract preview images for link cards on pages like index.html
(function autoPreviewForCards(){
  document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('.image-cards-container');
    if (!containers.length) return;

    const CACHE_KEY = 'ogImageCacheV1';
    const KIND_KEY = 'ogImageCacheV1_kind';
    const cache = (() => { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; } })();
    const kindMap = (() => { try { return JSON.parse(localStorage.getItem(KIND_KEY) || '{}'); } catch { return {}; } })();
    const getCached = (href) => cache[href];
    const getKind = (href) => kindMap[href];
    const setCached = (href, url, kind) => {
      try {
        cache[href] = url;
        if (kind) kindMap[href] = kind; // 'shot' or 'meta'
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        localStorage.setItem(KIND_KEY, JSON.stringify(kindMap));
      } catch {}
    };

    const isLikelyGenericPreview = (url) => {
      try {
        const u = new URL(url);
        const host = u.hostname.toLowerCase();
        const path = (u.pathname || '').toLowerCase();
        if (host.endsWith('vercel.com') || host.endsWith('vercel.app')) return true;
        if (path.includes('opengraph') || path.includes('og-image') || path.includes('social')) return true;
      } catch {}
      return false;
    };

    const isFutureOrExample = ({ href, alt, label }) => {
      const text = `${alt || ''} ${label || ''}`.toLowerCase();
      const url = (href || '').toLowerCase();
      return (
        /future\s*(project|code)/i.test(text) ||
        url.includes('example.com') ||
        /(^|\/)example(\.html?)?$/.test(url)
      );
    };

    const resolvePreview = async (href) => {
      // Prefer a real page preview (screenshot) first
      try {
        const sUrl = `https://api.microlink.io/?url=${encodeURIComponent(href)}&screenshot=true&meta=false`;
        const sr = await fetch(sUrl, { cache: 'no-store' });
        if (sr.ok) {
          const s = await sr.json();
          const shot = s && s.status === 'success' && s.data && s.data.screenshot ? (s.data.screenshot.url || s.data.screenshot) : null;
          if (shot) return { url: shot, kind: 'shot' };
        }
      } catch {}

      // Then try local PHP OG resolver (if available)
      const apiPaths = [
        `/api/og-image.php?url=${encodeURIComponent(href)}`,
        `../api/og-image.php?url=${encodeURIComponent(href)}`
      ];
      for (const apiUrl of apiPaths) {
        try {
          const r = await fetch(apiUrl, { cache: 'no-store' });
          if (!r.ok) continue;
          const data = await r.json();
          if (data && data.ok && data.image) {
            return { url: data.image, kind: 'meta' };
          }
        } catch {}
      }
      // Finally Microlink metadata
      try {
        const mUrl = `https://api.microlink.io/?url=${encodeURIComponent(href)}&audio=false&video=false&page=false`;
        const mr = await fetch(mUrl, { cache: 'no-store' });
        if (mr.ok) {
          const m = await mr.json();
          const d = m && m.status === 'success' && m.data ? m.data : null;
          const ogImg = d && d.image ? (d.image.url || d.image) : null;
          const logo = d && d.logo ? (d.logo.url || d.logo) : null;
          const picked = ogImg || logo;
          if (picked && !isLikelyGenericPreview(picked)) return { url: picked, kind: 'meta' };
        }
      } catch {}
      return null;
    };

    containers.forEach(container => {
      container.querySelectorAll('.image-card > a').forEach(async anchor => {
        const href = anchor.getAttribute('href');
        const imgEl = anchor.querySelector('img');
        const label = (anchor.querySelector('.text-box p') || {}).textContent || '';
        const alt = imgEl ? imgEl.alt : '';
        if (!href || !imgEl) return;

        // Allow opting out per-card via attribute or class
        if (anchor.hasAttribute('data-no-auto-preview') ||
            (imgEl && (imgEl.hasAttribute('data-no-auto-preview') || imgEl.classList.contains('no-auto-preview')))) {
          return;
        }

        // Skip for future/example placeholders
        if (isFutureOrExample({ href, alt, label })) return;

        // Use cache or resolve
        const cachedUrl = getCached(href);
        const cachedKind = getKind(href);
        let resolvedUrl = cachedUrl;

        // If we prefer screenshots and we don't have one cached, try to resolve/upgrade
        if (!resolvedUrl || cachedKind !== 'shot') {
          const resolved = await resolvePreview(href);
          if (resolved && resolved.url) {
            resolvedUrl = resolved.url;
            setCached(href, resolved.url, resolved.kind);
          }
        }
        if (resolvedUrl) imgEl.src = resolvedUrl;
      });
    });
  });
})();
