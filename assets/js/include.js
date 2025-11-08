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
      if (html) {
        footerPlaceholder.innerHTML = html;
        // After footer is injected, set up navigation for button-style links
        try {
          const root = footerPlaceholder;
          const navButtons = root.querySelectorAll('button.footer-btn[data-href]');
          navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
              const url = btn.getAttribute('data-href');
              if (!url) return;
              // Support Ctrl/Cmd click to open in new tab
              if (e.ctrlKey || e.metaKey) {
                window.open(url, '_blank', 'noopener,noreferrer');
              } else {
                window.location.href = url;
              }
            });
          });
        } catch (e) {
          console.warn('Footer nav setup skipped:', e);
        }
      }
    }
  } catch (e) {
    console.warn('Include failed:', e);
  }
}

document.addEventListener('DOMContentLoaded', includeHTML);
