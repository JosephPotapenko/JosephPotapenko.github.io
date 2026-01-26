document.addEventListener('DOMContentLoaded', function(){
  var btn = document.getElementById('jp-print-pdf');
  if(btn){
    btn.addEventListener('click', function(){
      // Temporarily set a neutral document title for print headers
      var originalTitle = document.title;
      try { document.title = 'Resume - Joseph Potapenko'; } catch {}
      window.print();
      // Restore title after print when supported
      var restore = function(){ try { document.title = originalTitle; } catch {} };
      if ('onafterprint' in window) {
        var handler = function(){ restore(); window.removeEventListener('afterprint', handler); };
        window.addEventListener('afterprint', handler);
      } else {
        setTimeout(restore, 2000);
      }
    });
  }

  // Download resume as plain text file, avoiding ligatures and fancy punctuation
  var txtBtn = document.getElementById('jp-download-txt');
  if (txtBtn) {
    txtBtn.addEventListener('click', function(){
      try {
        var sheet = document.querySelector('.jp-resume__sheet');
        if (!sheet) return;

        function getText(el){ return (el && el.textContent) ? el.textContent.trim() : ''; }
        function mapLigatures(s){
          return s
            .replace(/[\uFB00]/g, 'ff')
            .replace(/[\uFB01]/g, 'fi')
            .replace(/[\uFB02]/g, 'fl')
            .replace(/[\uFB03]/g, 'ffi')
            .replace(/[\uFB04]/g, 'ffl')
            .replace(/[\uFB05]/g, 'ft')
            .replace(/[\uFB06]/g, 'st');
        }
        function sanitize(s){
          var t = s.normalize ? s.normalize('NFKD') : s;
          t = mapLigatures(t);
          // Replace curly quotes/dashes with ASCII equivalents
          t = t.replace(/[“”]/g, '"').replace(/[‘’]/g, '\'').replace(/[–—]/g, '-');
          // Collapse multiple spaces and trim lines
          t = t.replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
          return t;
        }

        var name = getText(sheet.querySelector('.jp-resume__name'));
        var role = getText(sheet.querySelector('.jp-resume__role'));

        var contactRows = sheet.querySelectorAll('#jp-contact-section .jp-resume__contact-row .jp-resume__contact-text');
        var contacts = Array.from(contactRows).map(function(el){ return getText(el); }).filter(Boolean);

        var summary = getText(sheet.querySelector('.jp-resume__section .jp-resume__p'));

        var jobs = Array.from(sheet.querySelectorAll('.jp-resume__job')).map(function(job){
          var title = getText(job.querySelector('.jp-resume__job-title'));
          var meta = getText(job.querySelector('.jp-resume__job-meta'));
          var bullets = Array.from(job.querySelectorAll('.jp-resume__bullets li')).map(function(li){ return '- ' + getText(li); });
          return [title, meta].concat(bullets).join('\n');
        });

        var edus = Array.from(sheet.querySelectorAll('.jp-resume__edu')).map(function(edu){
          var title = getText(edu.querySelector('.jp-resume__edu-title'));
          var metas = Array.from(edu.querySelectorAll('.jp-resume__edu-meta')).map(function(m){ return getText(m); });
          return [title].concat(metas).join('\n');
        });

        var skills = Array.from(sheet.querySelectorAll('.jp-resume__skills li')).map(function(li){ return '- ' + getText(li); });

        var lines = [];
        lines.push(name);
        lines.push(role);
        if (contacts.length) lines.push('', 'CONTACT', contacts.join(' - '));
        lines.push('', 'PROFESSIONAL SUMMARY', summary);
        if (jobs.length) {
          lines.push('', 'EXPERIENCE');
          jobs.forEach(function(j){ lines.push(j, ''); });
        }
        if (edus.length) {
          lines.push('', 'EDUCATION');
          edus.forEach(function(e){ lines.push(e, ''); });
        }
        if (skills.length) {
          lines.push('', 'SKILLS');
          skills.forEach(function(s){ lines.push(s); });
        }

        var text = sanitize(lines.join('\n'));
        var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'Joseph_Potapenko_Resume.txt';
        document.body.appendChild(a);
        a.click();
        setTimeout(function(){ URL.revokeObjectURL(url); document.body.removeChild(a); }, 100);
      } catch (e) {
        console.warn('Text download failed:', e);
      }
    });
  }

  // Rasterize only the contact section on page (screen only), keep text for print
  var contact = document.getElementById('jp-contact-section');
  if(contact && window.html2canvas){
    var contactImage = document.createElement('div');
    contactImage.className = 'jp-contact-image';
    // Insert image container right after the contact section
    contact.parentNode.insertBefore(contactImage, contact.nextSibling);

    var renderContact = function(){
      var ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
      ready.then(function(){
        html2canvas(contact, { scale: 2, useCORS: true, backgroundColor: null }).then(function(canvas){
          var img = new Image();
          img.alt = 'Contact info image';
          img.src = canvas.toDataURL('image/png');
          contactImage.innerHTML = '';
          contactImage.appendChild(img);
          document.body.classList.add('contact-rasterized');
        }).catch(function(){ /* fail silently */ });
      });
    };
    setTimeout(renderContact, 100);
    window.addEventListener('resize', function(){
      if(document.body.classList.contains('contact-rasterized')){
        document.body.classList.remove('contact-rasterized');
        contactImage.innerHTML = '';
        setTimeout(renderContact, 100);
      }
    });
  }
});
