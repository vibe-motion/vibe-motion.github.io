(function () {
  var tipTrigger = document.getElementById('vibe-tip-trigger');
  var tipEl = document.getElementById('vibe-tip');

  if (tipTrigger && tipEl) {
    tipTrigger.addEventListener('click', function (event) {
      event.stopPropagation();
      var nextVisible = tipEl.hidden;
      tipEl.hidden = !nextVisible;
      tipTrigger.setAttribute('aria-expanded', String(nextVisible));
    });

    document.addEventListener('click', function (event) {
      if (tipEl.hidden) {
        return;
      }

      if (tipTrigger.contains(event.target) || tipEl.contains(event.target)) {
        return;
      }

      tipEl.hidden = true;
      tipTrigger.setAttribute('aria-expanded', 'false');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || tipEl.hidden) {
        return;
      }

      tipEl.hidden = true;
      tipTrigger.setAttribute('aria-expanded', 'false');
    });
  }

  function fallbackCopy(text) {
    var textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }

  function showCopied(copyBtn) {
    copyBtn.classList.add('success');
    copyBtn.setAttribute('aria-label', 'Copied');
    copyBtn.setAttribute('title', 'Copied');
    window.setTimeout(function () {
      copyBtn.classList.remove('success');
      copyBtn.setAttribute('aria-label', 'Copy to clipboard');
      copyBtn.setAttribute('title', 'Copy to clipboard');
    }, 1500);
  }

  var terminalBodies = document.querySelectorAll('.terminal-body');

  terminalBodies.forEach(function (terminalBody) {
    var copyBtn = terminalBody.querySelector('.copy-btn');
    var codeEl = terminalBody.querySelector('code');

    if (!copyBtn || !codeEl) {
      return;
    }

    copyBtn.addEventListener('click', function () {
      var text = codeEl.textContent || '';

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showCopied(copyBtn);
        }).catch(function () {
          fallbackCopy(text);
          showCopied(copyBtn);
        });
        return;
      }

      fallbackCopy(text);
      showCopied(copyBtn);
    });
  });

  function revealIntroItems(items) {
    items.forEach(function (item) {
      item.classList.add('is-visible');
    });
  }

  var introItems = Array.prototype.slice.call(document.querySelectorAll('[data-intro]'));
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!introItems.length) {
    return;
  }

  if (prefersReducedMotion || typeof window.gsap === 'undefined') {
    revealIntroItems(introItems);
    return;
  }

  function markItemsVisible(items) {
    items.forEach(function (item) {
      item.classList.add('is-visible');
      item.style.transform = '';
      item.style.opacity = '';
      item.style.filter = '';
    });
  }

  var timeline = window.gsap.timeline({
    defaults: {
      duration: 0.72,
      ease: 'power3.out'
    }
  });

  [
    { selector: '[data-intro-stage="copy"]', position: 0.12 },
    { selector: '[data-intro-stage="terminal"]', position: '+=0.22' },
    { selector: '[data-intro-stage="social"]', position: '+=0.18' }
  ].forEach(function (group) {
    var items = Array.prototype.slice.call(document.querySelectorAll(group.selector));

    if (!items.length) {
      return;
    }

    timeline.to(items, {
      x: 0,
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      stagger: 0,
      onComplete: function () {
        markItemsVisible(items);
      }
    }, group.position);
  });
})();
