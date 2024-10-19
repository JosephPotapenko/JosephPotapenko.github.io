// Check JS is Connected
console.log('JS Connected');

// get JSON data
// create anchor link for each item
document.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('data.json');
      const data = await response.json();
      
      const myLinks = document.getElementById('myLinks');
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