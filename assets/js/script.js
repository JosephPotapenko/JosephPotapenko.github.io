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
