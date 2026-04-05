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

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function createTitleSlices(titleMain, sliceCount) {
    var slicesHost = document.createElement('div');
    slicesHost.className = 'pixel-title-slices';

    for (var index = 0; index < sliceCount; index += 1) {
      var clone = titleMain.cloneNode(true);
      var leftInset = (100 / sliceCount) * index;
      var rightInset = 100 - leftInset - (100 / sliceCount);

      clone.className = 'pixel-title-layer pixel-title-slice';
      clone.setAttribute('aria-hidden', 'true');
      clone.style.clipPath = 'inset(0 ' + rightInset + '% 0 ' + leftInset + '%)';
      slicesHost.appendChild(clone);
    }

    titleMain.parentNode.insertBefore(slicesHost, titleMain);

    return Array.prototype.slice.call(slicesHost.children);
  }

  function createImpactBurst(burstEl) {
    var ring = document.createElement('span');
    var particles = [];
    var specs = [
      { dx: -92, dy: -68, scale: 0.9, duration: 0.56, delay: 0.00, tone: 'bright' },
      { dx: -64, dy: -106, scale: 0.82, duration: 0.62, delay: 0.01, tone: 'cool' },
      { dx: -24, dy: -116, scale: 0.76, duration: 0.68, delay: 0.02, tone: 'bright' },
      { dx: 12, dy: -98, scale: 0.84, duration: 0.6, delay: 0.03, tone: 'accent' },
      { dx: 46, dy: -72, scale: 0.72, duration: 0.54, delay: 0.04, tone: 'cool' },
      { dx: 88, dy: -34, scale: 0.78, duration: 0.5, delay: 0.02, tone: 'bright' },
      { dx: 98, dy: 18, scale: 0.9, duration: 0.48, delay: 0.01, tone: 'accent' },
      { dx: 54, dy: 52, scale: 0.74, duration: 0.46, delay: 0.03, tone: 'cool' },
      { dx: 8, dy: 72, scale: 0.68, duration: 0.42, delay: 0.04, tone: 'bright' },
      { dx: -40, dy: 58, scale: 0.72, duration: 0.45, delay: 0.02, tone: 'accent' },
      { dx: -78, dy: 28, scale: 0.86, duration: 0.47, delay: 0.01, tone: 'bright' },
      { dx: -108, dy: -8, scale: 0.94, duration: 0.52, delay: 0.00, tone: 'cool' }
    ];

    burstEl.innerHTML = '';
    ring.className = 'title-impact-ring';
    burstEl.appendChild(ring);

    specs.forEach(function (spec) {
      var particle = document.createElement('span');
      particle.className = 'title-impact-particle is-' + spec.tone;
      burstEl.appendChild(particle);
      particles.push({
        element: particle,
        dx: spec.dx,
        dy: spec.dy,
        scale: spec.scale,
        duration: spec.duration,
        delay: spec.delay
      });
    });

    return {
      ring: ring,
      particles: particles
    };
  }

  function initTitleAnimation(onComplete, onIntroStart) {
    var stage = document.querySelector('[data-title-animation]');

    if (!stage) {
      return false;
    }

    var titleMain = stage.querySelector('.pixel-title-main');
    var titleShadow = stage.querySelector('.pixel-title-shadow');
    var dot = stage.querySelector('.title-impact-dot');
    var burstEl = stage.querySelector('.title-impact-burst');

    if (!titleMain || !titleShadow || !dot || !burstEl) {
      return false;
    }

    if (prefersReducedMotion || typeof window.gsap === 'undefined') {
      stage.classList.add('title-static');
      if (typeof onComplete === 'function') {
        onComplete();
      }
      return false;
    }

    var slices = createTitleSlices(titleMain, 10);
    var burst = createImpactBurst(burstEl);
    var particleNodes = burst.particles.map(function (particle) {
      return particle.element;
    });
    var introStarted = false;
    function triggerIntroStart() {
      if (introStarted) {
        return;
      }
      introStarted = true;
      if (typeof onIntroStart === 'function') {
        onIntroStart();
      }
    }
    var titleTimeline = window.gsap.timeline({
      defaults: {
        ease: 'power2.out'
      },
      onComplete: function () {
        triggerIntroStart();
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }
    });

    window.gsap.set(titleShadow, { opacity: 0.14 });
    window.gsap.set(titleMain, { opacity: 0 });
    window.gsap.set(slices, {
      opacity: 0,
      y: 16,
      scale: 0.985,
      filter: 'blur(10px)'
    });
    window.gsap.set(dot, {
      y: 0,
      scaleX: 0.9,
      scaleY: 1.1,
      opacity: 1,
      transformOrigin: '50% 100%'
    });
    window.gsap.set(burst.ring, {
      opacity: 0,
      scale: 0.08,
      transformOrigin: '50% 50%'
    });
    window.gsap.set(particleNodes, {
      x: 0,
      y: 0,
      scale: 0.2,
      opacity: 0,
      transformOrigin: '50% 50%'
    });

    titleTimeline.to(dot, {
      y: -122,
      scaleX: 0.92,
      scaleY: 1.08,
      duration: 0.22,
      ease: 'power2.out'
    }, 0.08);

    titleTimeline.to(dot, {
      y: 0,
      scaleX: 1.08,
      scaleY: 0.88,
      duration: 0.34,
      ease: 'power4.in'
    }, 0.3);

    titleTimeline.addLabel('impact', 0.64);

    titleTimeline.to(titleShadow, {
      opacity: 0.42,
      duration: 0.14
    }, 'impact');

    titleTimeline.to(dot, {
      scaleX: 1.52,
      scaleY: 0.5,
      duration: 0.06
    }, 'impact');

    titleTimeline.to(dot, {
      opacity: 0,
      scaleX: 0.74,
      scaleY: 1.18,
      duration: 0.08,
      ease: 'power1.out'
    }, 'impact+=0.04');

    titleTimeline.to(burst.ring, {
      opacity: 0.92,
      scale: 0.46,
      duration: 0.04,
      ease: 'linear'
    }, 'impact');

    titleTimeline.to(burst.ring, {
      opacity: 0,
      scale: 4.4,
      duration: 0.48,
      ease: 'power2.out'
    }, 'impact+=0.02');

    burst.particles.forEach(function (particle) {
      titleTimeline.to(particle.element, {
        opacity: 1,
        duration: 0.01
      }, 'impact+=' + particle.delay);

      titleTimeline.to(particle.element, {
        x: particle.dx,
        y: particle.dy,
        scale: particle.scale,
        opacity: 0,
        duration: particle.duration,
        ease: 'power2.out'
      }, 'impact+=' + particle.delay);
    });

    titleTimeline.to(titleShadow, {
      opacity: 1,
      duration: 0.22
    }, 'impact+=0.1');

    titleTimeline.to(slices, {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.16,
      stagger: 0.038,
      ease: 'power3.out'
    }, 'impact+=0.05');

    // Handoff from staggered slices to the final static layer with no overlap,
    // so total luminance does not spike at the end.
    titleTimeline.set(titleMain, {
      opacity: 1
    }, 'impact+=0.57');

    titleTimeline.set(slices, {
      opacity: 0
    }, 'impact+=0.57');

    titleTimeline.call(triggerIntroStart, [], Math.max(titleTimeline.duration() - 0.2, 0));

    return true;
  }

  var introItems = Array.prototype.slice.call(document.querySelectorAll('[data-intro]'));

  if (!introItems.length) {
    initTitleAnimation();
    return;
  }

  if (prefersReducedMotion || typeof window.gsap === 'undefined') {
    initTitleAnimation();
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

  var introTimeline = window.gsap.timeline({
    paused: true,
    defaults: {
      duration: 0.72,
      ease: 'power3.out'
    }
  });

  [
    { selector: '[data-intro-stage="copy"]', position: 0 },
    { selector: '[data-intro-stage="terminal"]', position: 0.48 }
  ].forEach(function (group) {
    var items = Array.prototype.slice.call(document.querySelectorAll(group.selector));

    if (!items.length) {
      return;
    }

    introTimeline.to(items, {
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

  var introTimelineStarted = false;
  function playIntroTimeline() {
    if (introTimelineStarted) {
      return;
    }
    introTimelineStarted = true;
    introTimeline.play(0);
  }

  var titleAnimationStarted = initTitleAnimation(null, playIntroTimeline);

  if (!titleAnimationStarted) {
    playIntroTimeline();
  }
})();
