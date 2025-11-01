// Dynamically loads header and footer into the page (uses absolute paths)
async function includeHTML() {
  try {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (headerPlaceholder) {
      const res = await fetch('/partials/header.html', { cache: 'no-store' });
      if (res.ok) headerPlaceholder.innerHTML = await res.text();
    }

    if (footerPlaceholder) {
      const res = await fetch('/partials/footer.html', { cache: 'no-store' });
      if (res.ok) footerPlaceholder.innerHTML = await res.text();
    }
  } catch (e) {
    console.warn('Include failed:', e);
  }
}

document.addEventListener('DOMContentLoaded', includeHTML);
