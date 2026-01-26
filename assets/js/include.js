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
      if (html) {
        headerPlaceholder.innerHTML = html;
        // Setup menu interactions for persistent open and forgiving hover
        try {
          const headerRoot = headerPlaceholder;
          const menuContainer = headerRoot.querySelector('.menu-container');
          const menuButton = headerRoot.querySelector('.menu-button');
          const menuContent = headerRoot.querySelector('.menu-content');
          if (menuContainer && menuButton && menuContent) {
            let isStickyOpen = false;
            let hoverCloseTimer = null;

            function openMenuSticky() {
              isStickyOpen = true;
              menuContainer.classList.add('open');
              menuButton.setAttribute('aria-expanded', 'true');
            }
            function closeMenuSticky() {
              isStickyOpen = false;
              menuContainer.classList.remove('open');
              menuButton.setAttribute('aria-expanded', 'false');
            }

            // Toggle on button click to persist open/close
            menuButton.addEventListener('click', (e) => {
              e.stopPropagation();
              if (isStickyOpen) closeMenuSticky();
              else openMenuSticky();
            });

            // Forgiving hover: keep open briefly after mouse leaves
            menuContainer.addEventListener('mouseenter', () => {
              if (!isStickyOpen) menuContainer.classList.add('hover-open');
              if (hoverCloseTimer) { clearTimeout(hoverCloseTimer); hoverCloseTimer = null; }
            });
            menuContainer.addEventListener('mouseleave', () => {
              if (hoverCloseTimer) clearTimeout(hoverCloseTimer);
              hoverCloseTimer = setTimeout(() => {
                if (!isStickyOpen) menuContainer.classList.remove('hover-open');
              }, 300); // brief delay for forgiving hover
            });

            // Clicking outside closes only sticky-open menus
            document.addEventListener('click', (evt) => {
              if (!isStickyOpen) return;
              const t = evt.target;
              if (t instanceof Node && !menuContainer.contains(t)) {
                closeMenuSticky();
              }
            });
          }
        } catch (e) {
          console.warn('Header menu setup skipped:', e);
        }
      }
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
