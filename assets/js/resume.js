(function () {
  'use strict';

  var RESUME = {
    name: 'JOSEPH POTAPENKO',
    contact: {
      phone: '208-640-8653',
      email: 'joepotap@gmail.com',
      location: 'Coeur d\u2019Alene, ID'
    },
    summary: 'Detail-oriented Computer Science student with experience in software development, cybersecurity, technical documentation, systems analysis, data management, troubleshooting, project coordination, and customer-facing support. Strong foundation in secure coding, database systems, networking, operating systems, algorithms, and workflow analysis through coursework, internship experience, and leadership roles. Proven ability to learn complex technologies quickly, communicate effectively across teams, and deliver reliable technical solutions in fast-paced environments.',
    skills: [

  'Software Dev.',
  'Full-Stack Development',
  'OOP',
  'Algorithms',
  'Data Structures',
  'Secure Coding',

  'JavaScript',
  'Java',
  'Python',
  'C, C#, C++',
  'SQL/MySQL',
  'HTML',
  'CSS',
  'React',

  'Operating Systems',
  'Database Systems',
  'Network Security',
  'Cybersecurity',
  'Information Security',
  'Security Awareness',
  'Aerospace Cybersecurity',

  'Systems Analysis',
  'Data Analysis',
  'Data Integrity',
  'Requirements Gathering',
  'Technical Documentation',
  'Technical Troubleshooting',
  'Technical Support',
  'Software Deployment',

  'Agile',
  'Project Coordination',
  'Process Improvement',
  'Team Leadership',
  'Technical Communication',
  'Customer Service',
  'Conflict Resolution',
  'Adaptability',
  'Microsoft Suites',
  'Bilingual Russian'

    ],
    experience: [
      {
        title: 'Software Development Intern',
        company: 'Global Radio Outreach',
        location: 'Seattle, WA',
        dates: 'June 2025 - September 2025',
        bullets: [
          'Maintained system documentation, project updates, and technical records to support software development initiatives.',
          'Collaborated with dev. teams to analyze requirements, track project milestones, and support solution implementation.',
          'Tested application functionality, identified issues, and supported resolution efforts to improve user experience.'
        ]
      },
      {
        title: 'Operational Assistant Store Management',
        company: 'Rue21',
        location: 'Spokane Valley, WA',
        dates: 'February 2025 - June 2025',
        bullets: [
          'Coordinated operational processes, maintained data accuracy, and supported process improvement initiatives.',
          'Maintained operational documentation, generated reports, and tracked inventory data.',
          'Contributed to a 320% increase in store sales within three months of start date.'
        ]
      },
      {
        title: 'Customer Experience Colleague',
        company: 'Macy\u2019s',
        location: 'Spokane Valley, WA',
        dates: 'June 2024 - February 2025',
        bullets: [
          'Provided customer support and resolved inquiries in person and by phone.',
          'Maintained accurate records and utilized internal systems to track customer orders and transactions.',
          'Troubleshot customer issues, documented resolutions, and maintained confidentiality of customer information.',
          'Generated $220,000 in sales within 6 months.'
        ]
      },
      {
        title: 'Teacher\u2019s Assistant',
        company: 'Eastern Washington University',
        location: 'Cheney, WA',
        dates: 'January 2023 - May 2024',
        bullets: [
          'Maintained accurate academic records and supported students through structured learning processes.',
          'Assisted with grading, documentation, and communication regarding academic progress.'
        ]
      },
      {
        title: 'Self-Employed Landscaping',
        company: '',
        location: 'Spokane Valley, WA',
        dates: 'June 2021 - September 2024',
        bullets: [
          'Coordinated schedules, managed project timelines, and maintained communication with clients regarding service needs.',
          'Maintained client records, coordinated service requests, and ensured timely project completion.'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        school: 'Eastern Washington University',
        date: 'June 2026',
        details: ['Minors: Cybersecurity and Psychology', 'GPA: 3.8']
      },
      {
        degree: 'Associate in Arts Transfer Degree',
        school: 'Spokane Falls Community College',
        date: 'June 2022',
        details: []
      }
    ]
  };

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function q(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function getText(el) {
    return el && el.textContent ? el.textContent.trim() : '';
  }

  function setText(el, text) {
    if (el) el.textContent = text || '';
  }

  function createEl(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (typeof text !== 'undefined') el.textContent = text;
    return el;
  }

  function clearNode(el) {
    while (el && el.firstChild) el.removeChild(el.firstChild);
  }

  function findSectionByHeading(label) {
    var sections = qa('.jp-resume__section');
    label = String(label).toUpperCase();

    for (var i = 0; i < sections.length; i += 1) {
      var h2 = q('.jp-resume__h2', sections[i]);
      if (getText(h2).toUpperCase() === label) return sections[i];
    }
    return null;
  }

  function replaceBullets(ul, bullets) {
    clearNode(ul);
    bullets.forEach(function (bullet) {
      ul.appendChild(createEl('li', '', bullet));
    });
  }

  function jobMeta(job) {
    var parts = [];
    if (job.company) parts.push(job.company);
    if (job.location) parts.push(job.location);
    if (job.dates) parts.push(job.dates);
    return parts.join(' | ');
  }

  function renderExperience() {
    var section = findSectionByHeading('EXPERIENCE');
    if (!section) return;

    qa('.jp-resume__job', section).forEach(function (node) {
      node.parentNode.removeChild(node);
    });

    RESUME.experience.forEach(function (job, index) {
      var wrapper = createEl('div', 'jp-resume__job' + (index ? ' jp-resume__job--spaced' : ''));
      wrapper.appendChild(createEl('div', 'jp-resume__job-title', job.title));
      wrapper.appendChild(createEl('div', 'jp-resume__job-meta', jobMeta(job)));

      var ul = createEl('ul', 'jp-resume__bullets');
      replaceBullets(ul, job.bullets);
      wrapper.appendChild(ul);
      section.appendChild(wrapper);
    });
  }

  function renderEducation() {
    var section = findSectionByHeading('EDUCATION');
    if (!section) return;

    qa('.jp-resume__edu', section).forEach(function (node) {
      node.parentNode.removeChild(node);
    });

    RESUME.education.forEach(function (edu, index) {
      var wrapper = createEl('div', 'jp-resume__edu' + (index ? ' jp-resume__edu--spaced' : ''));
      wrapper.appendChild(createEl('div', 'jp-resume__edu-title', edu.degree));
      wrapper.appendChild(createEl('div', 'jp-resume__edu-meta', edu.school + ' | ' + edu.date));
      edu.details.forEach(function (detail) {
        wrapper.appendChild(createEl('div', 'jp-resume__edu-meta', detail));
      });
      section.appendChild(wrapper);
    });
  }

  function renderSkills() {
    var skillsList = q('.jp-resume__skills');
    if (!skillsList) return;

    clearNode(skillsList);
    RESUME.skills.forEach(function (skill) {
      skillsList.appendChild(createEl('li', '', skill));
    });
  }

  function renderContact() {
    var rows = qa('#jp-contact-section .jp-resume__contact-text');
    var values = [RESUME.contact.phone, RESUME.contact.email, RESUME.contact.location];

    values.forEach(function (value, index) {
      if (rows[index]) setText(rows[index], value);
    });
  }

  function renderResumeToPage() {
    var sheet = q('.jp-resume__sheet');
    if (!sheet) return;

    setText(q('.jp-resume__name', sheet), RESUME.name);
    setText(q('.jp-resume__role', sheet), RESUME.role);
    setText(q('.jp-resume__p', findSectionByHeading('PROFESSIONAL SUMMARY')), RESUME.summary);
    renderContact();
    renderExperience();
    renderEducation();
    renderSkills();
  }

  function mapLigatures(s) {
    return String(s || '')
      .replace(/[\uFB00]/g, 'ff')
      .replace(/[\uFB01]/g, 'fi')
      .replace(/[\uFB02]/g, 'fl')
      .replace(/[\uFB03]/g, 'ffi')
      .replace(/[\uFB04]/g, 'ffl')
      .replace(/[\uFB05]/g, 'ft')
      .replace(/[\uFB06]/g, 'st');
  }

  function sanitize(s) {
    var t = String(s || '');
    t = t.normalize ? t.normalize('NFKD') : t;
    t = mapLigatures(t);
    t = t
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[\u2022]/g, '-')
      .replace(/[\u00A0]/g, ' ')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return t;
  }

  function buildTextResume() {
    var lines = [];

    lines.push(RESUME.name);
    lines.push([RESUME.contact.location, RESUME.contact.phone, RESUME.contact.email].join(' | '));

    lines.push('', 'SUMMARY', RESUME.summary);

    lines.push('', 'SKILLS');
    lines.push(RESUME.skills.join(' | '));

    lines.push('', 'EXPERIENCE');
    RESUME.experience.forEach(function (job) {
      lines.push(job.title + ' | ' + jobMeta(job));
      job.bullets.forEach(function (bullet) {
        lines.push('- ' + bullet);
      });
      lines.push('');
    });

    lines.push('EDUCATION');
    RESUME.education.forEach(function (edu) {
      lines.push(edu.degree + ' | ' + edu.school + ' | ' + edu.date);
      edu.details.forEach(function (detail) {
        lines.push(detail);
      });
      lines.push('');
    });

    return sanitize(lines.join('\n')) + '\n';
  }

  function downloadTextFile(filename, text) {
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');

    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    window.setTimeout(function () {
      window.URL.revokeObjectURL(url);
      if (a.parentNode) a.parentNode.removeChild(a);
    }, 250);
  }

  function bindPrintButton() {
    var btn = document.getElementById('jp-print-pdf');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var originalTitle = document.title;
      var restored = false;

      function restoreTitle() {
        if (restored) return;
        restored = true;
        document.title = originalTitle;
        window.removeEventListener('afterprint', restoreTitle);
      }

      document.title = 'Resume - Joseph Potapenko';
      window.addEventListener('afterprint', restoreTitle);

      try {
        window.print();
      } catch (e) {
        restoreTitle();
        throw e;
      }

      window.setTimeout(restoreTitle, 3000);
    });
  }

  function bindTextDownloadButton() {
    var txtBtn = document.getElementById('jp-download-txt');
    if (!txtBtn) return;

    txtBtn.addEventListener('click', function () {
      try {
        downloadTextFile('Joseph_Potapenko_Resume.txt', buildTextResume());
      } catch (e) {
        if (window.console && console.warn) console.warn('Text download failed:', e);
      }
    });
  }

  function rasterizeContactForScreen() {
    var contact = document.getElementById('jp-contact-section');
    if (!contact || !window.html2canvas) return;

    var contactImage = q('.jp-contact-image');
    if (!contactImage) {
      contactImage = createEl('div', 'jp-contact-image');
      contact.parentNode.insertBefore(contactImage, contact.nextSibling);
    }

    var renderTimer = null;

    function renderContact() {
      var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();

      fontsReady.then(function () {
        return window.html2canvas(contact, {
          scale: Math.min(2, window.devicePixelRatio || 1),
          useCORS: true,
          backgroundColor: null
        });
      }).then(function (canvas) {
        var img = new Image();
        img.alt = 'Contact information';
        img.src = canvas.toDataURL('image/png');
        clearNode(contactImage);
        contactImage.appendChild(img);
        document.body.classList.add('contact-rasterized');
      }).catch(function (e) {
        document.body.classList.remove('contact-rasterized');
        clearNode(contactImage);
        if (window.console && console.warn) console.warn('Contact rasterization failed:', e);
      });
    }

    function scheduleRender() {
      if (renderTimer) window.clearTimeout(renderTimer);
      document.body.classList.remove('contact-rasterized');
      clearNode(contactImage);
      renderTimer = window.setTimeout(renderContact, 150);
    }

    scheduleRender();
    window.addEventListener('resize', scheduleRender);
  }

  onReady(function () {
    renderResumeToPage();
    bindPrintButton();
    bindTextDownloadButton();
    rasterizeContactForScreen();
  });
}());