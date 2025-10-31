// Dynamically loads header and footer into the page (uses absolute paths)
function includeHTML() {
  const headerPlaceholder = document.getElementById('header-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');

  if (headerPlaceholder) {
    fetch('/partials/header.html')
      .then(response => response.text())
      .then(data => {
        headerPlaceholder.innerHTML = data;
      });
  }
  if (footerPlaceholder) {
    fetch('/partials/footer.html')
      .then(response => response.text())
      .then(data => {
        footerPlaceholder.innerHTML = data;
      });
  }
}

document.addEventListener('DOMContentLoaded', includeHTML);
