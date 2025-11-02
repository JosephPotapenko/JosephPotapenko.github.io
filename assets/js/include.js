// Dynamically loads header and footer into the page (uses absolute paths)
async function includeHTML() {
  try {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    const tryPaths = async (paths) => {
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: 'no-store' });
          if (res.ok) return await res.text();
        } catch (e) { /* try next */ }
      }
      return null;
    };

    if (headerPlaceholder) {
      const html = await tryPaths([
        '/partials/header.html',
        '../partials/header.html',
        'partials/header.html'
      ]);
      if (html) headerPlaceholder.innerHTML = html;
    }

    if (footerPlaceholder) {
      const html = await tryPaths([
        '/partials/footer.html',
        '../partials/footer.html',
        'partials/footer.html'
      ]);
      if (html) footerPlaceholder.innerHTML = html;
    }
  } catch (e) {
    console.warn('Include failed:', e);
  }
}

document.addEventListener('DOMContentLoaded', includeHTML);
