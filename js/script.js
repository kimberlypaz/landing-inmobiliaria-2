/**
 * Ambital Inmobiliaria – Landing Page
 * script.js – v3.0
 *
 * Módulos:
 *  1. Header scroll  (transparent → solid)
 *  2. Mobile Nav
 *  3. Hero Slider    (auto-avance, flechas, dots, cambio de acento)
 *  4. Contadores     (count-up animado, una sola vez)
 *  5. Carousel       (Beneficios: auto-scroll, flechas, dots, responsive)
 *  6. Scroll Reveal  (fade + slide al entrar en viewport)
 *  7. Nav activo     (enlace activo según sección visible)
 *  8. Formulario     (validación + mensaje de éxito)
 */

(function () {
  'use strict';

  /* ============================================================
     1. HEADER SCROLL – transparent / sólido
     ============================================================ */
  const header = document.getElementById('mainHeader');
  const metrics = document.querySelector('.hero__metrics');

  function syncHeader() {
    const threshold = metrics ? metrics.offsetTop - header.offsetHeight : 80;
    header.classList.toggle('header--solid', window.scrollY >= threshold);
  }

  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();

  /* ============================================================
     1b. DROPDOWN "MÁS"
     ============================================================ */
  const dropdowns = document.querySelectorAll('.nav__dropdown');

  dropdowns.forEach(function(dd) {
    const btn = dd.querySelector('.nav__dropdown-btn');
    const arrow = dd.querySelector('.nav__dropdown-arrow');

    // Toggle al hacer click
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const isOpen = dd.classList.contains('open');
      // Cerrar todos
      dropdowns.forEach(function(d) {
        d.classList.remove('open');
        const a = d.querySelector('.nav__dropdown-btn');
        if (a) a.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        dd.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    // Hover en desktop
    dd.addEventListener('mouseenter', function() {
      if (window.innerWidth > 768) {
        dd.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
    dd.addEventListener('mouseleave', function() {
      if (window.innerWidth > 768) {
        dd.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    // Rotar arrow con la clase open
    const observer = new MutationObserver(function() {
      if (arrow) arrow.style.transform = dd.classList.contains('open') ? 'rotate(180deg)' : '';
    });
    observer.observe(dd, { attributes: true, attributeFilter: ['class'] });

    // Cerrar al hacer click en un link del dropdown
    dd.querySelectorAll('.nav__dropdown-link').forEach(function(link) {
      link.addEventListener('click', function() {
        dd.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  });

  // Cerrar dropdown al click fuera
  document.addEventListener('click', function() {
    dropdowns.forEach(function(d) {
      d.classList.remove('open');
      const b = d.querySelector('.nav__dropdown-btn');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  });

  /* ============================================================
     2. MOBILE NAV
     ============================================================ */
  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.getElementById('navMenu');

  navToggle.addEventListener('click', function () {
    const open = navMenu.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  const navClose = document.getElementById('navClose');
  if (navClose) {
    navClose.addEventListener('click', function () {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-label', 'Abrir menú');
      document.body.style.overflow = '';
    });
  }

  navMenu.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-label', 'Abrir menú');
      document.body.style.overflow = '';
    });
  });


  /* ============================================================
     3. HERO SLIDER
     ============================================================ */
  (function initHeroSlider() {
    const slides   = document.querySelectorAll('.hero__slide');
    const dotsWrap = document.getElementById('heroDots');
    const btnPrev  = document.getElementById('heroPrev');
    const btnNext  = document.getElementById('heroNext');

    if (!slides.length || !dotsWrap) return;

    let current    = 0;
    let slideTimer = null;

    // Construir dots
    slides.forEach(function (_, i) {
      const dot = document.createElement('button');
      dot.className = 'hero__dot' + (i === 0 ? ' hero__dot--active' : '');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dot.setAttribute('role', 'tab');
      dot.addEventListener('click', function () { goTo(i); resetTimer(); });
      dotsWrap.appendChild(dot);
    });

    // Arrancar todos los videos desde el inicio y dejarlos en loop continuo
    slides.forEach(function (slide) {
      var video = slide.querySelector('video');
      if (video) video.play().catch(function () {});
    });

    function goTo(index) {
      index = ((index % slides.length) + slides.length) % slides.length;
      if (index === current) return;

      var prevSlide = slides[current];

      // Anterior sigue visible debajo (z-index 1) mientras el nuevo aparece encima
      prevSlide.classList.remove('hero__slide--active');
      prevSlide.classList.add('hero__slide--prev');

      current = index;
      slides[current].classList.add('hero__slide--active');

      // Quitar --prev una vez termina el crossfade (los videos siguen corriendo)
      setTimeout(function () {
        prevSlide.classList.remove('hero__slide--prev');
      }, 1400);

      dotsWrap.querySelectorAll('.hero__dot').forEach(function (dot, i) {
        dot.classList.toggle('hero__dot--active', i === current);
      });
    }

    function startTimer() {
      slideTimer = setInterval(function () { goTo(current + 1); }, 4500);
    }

    function resetTimer() {
      clearInterval(slideTimer);
      startTimer();
    }

    if (btnPrev) btnPrev.addEventListener('click', function () { goTo(current - 1); resetTimer(); });
    if (btnNext) btnNext.addEventListener('click', function () { goTo(current + 1); resetTimer(); });

    // Pausar todos los videos cuando el tab está en segundo plano
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        clearInterval(slideTimer);
        slides.forEach(function (s) { var v = s.querySelector('video'); if (v) v.pause(); });
      } else {
        slides.forEach(function (s) { var v = s.querySelector('video'); if (v) v.play().catch(function(){}); });
        startTimer();
      }
    });

    goTo(0);
    startTimer();
  })();

  /* ============================================================
     4. CONTADORES ANIMADOS (COUNT-UP)
     ============================================================ */
  (function initCounters() {
    var counters = document.querySelectorAll('[data-count]');

    if (!counters.length) return;

    function countUp(el) {
      if (el.dataset.animated) return;
      el.dataset.animated = '1';
      var target   = parseInt(el.dataset.count, 10);
      var prefix   = el.dataset.prefix || '';
      var suffix   = el.dataset.suffix || '';
      var duration = 1800;
      var startTime = null;

      function tick(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed  = timestamp - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.round(eased * target).toLocaleString('es-PE') + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            countUp(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      counters.forEach(function (el) { io.observe(el); });
    } else {
      setTimeout(function () {
        counters.forEach(countUp);
      }, 600);
    }
  })();

  /* ============================================================
     5. CAROUSEL DE BENEFICIOS
     ============================================================ */
  (function initBeneficiosCarousel() {
    var viewport = document.getElementById('beneficiosViewport');
    var track    = document.getElementById('beneficiosTrack');
    var btnPrev  = document.getElementById('beneficiosPrev');
    var btnNext  = document.getElementById('beneficiosNext');
    var dotsWrap = document.getElementById('beneficiosDots');

    if (!viewport || !track) return;

    var items   = track.querySelectorAll('.carousel__item');
    var current = 0;

    function perPage() {
      var w = window.innerWidth;
      if (w >= 992) return 3;
      if (w >= 600) return 2;
      return 1;
    }

    function totalPages() {
      return Math.ceil(items.length / perPage());
    }

    function setItemWidths() {
      var w = viewport.offsetWidth / perPage();
      items.forEach(function (item) {
        item.style.width = w + 'px';
        item.style.flex  = '0 0 ' + w + 'px';
      });
    }

    function goTo(page) {
      var total = totalPages();
      current   = ((page % total) + total) % total;
      track.style.transition = '';
      track.style.transform  = 'translateX(-' + (current * viewport.offsetWidth) + 'px)';
      updateDots();
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      var n = totalPages();
      for (var i = 0; i < n; i++) {
        (function (idx) {
          var dot = document.createElement('button');
          dot.className = 'carousel__dot' + (idx === 0 ? ' carousel__dot--active' : '');
          dot.setAttribute('aria-label', 'Grupo ' + (idx + 1));
          dot.addEventListener('click', function () { goTo(idx); });
          dotsWrap.appendChild(dot);
        })(i);
      }
    }

    function updateDots() {
      if (!dotsWrap) return;
      dotsWrap.querySelectorAll('.carousel__dot').forEach(function (dot, i) {
        dot.classList.toggle('carousel__dot--active', i === current);
      });
    }

    // ── Botones existentes ──
    if (btnPrev) btnPrev.addEventListener('click', function () { goTo(current - 1); resetAuto(); });
    if (btnNext) btnNext.addEventListener('click', function () { goTo(current + 1); resetAuto(); });

    // ── Auto-avance por grupos ──
    var autoTimer = null;

    function startAuto() {
      autoTimer = setInterval(function () { goTo(current + 1); }, 4500);
    }

    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    // Pausar al hacer hover
    viewport.addEventListener('mouseenter', function () { clearInterval(autoTimer); });
    viewport.addEventListener('mouseleave', function () { startAuto(); });

    // ── Drag (mouse) ──
    var dragStartX   = 0;
    var dragStartOff = 0;
    var dragging     = false;
    var moved        = false;

    viewport.addEventListener('mousedown', function (e) {
      e.preventDefault();          // evita selección de texto y drag nativo de imágenes
      dragging     = true;
      moved        = false;
      dragStartX   = e.clientX;
      dragStartOff = current * viewport.offsetWidth;
      track.style.transition = 'none';
      viewport.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var delta = dragStartX - e.clientX;
      if (Math.abs(delta) > 4) moved = true;
      var max = (totalPages() - 1) * viewport.offsetWidth;
      var off = Math.max(0, Math.min(dragStartOff + delta, max));
      track.style.transform = 'translateX(-' + off + 'px)';
    });

    window.addEventListener('mouseup', function (e) {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove('is-dragging');
      if (!moved) return;
      var delta = dragStartX - e.clientX;
      goTo(Math.abs(delta) > 60 ? (delta > 0 ? current + 1 : current - 1) : current);
      resetAuto();
    });

    // Evitar que el click dispare enlaces si fue un drag
    viewport.addEventListener('click', function (e) {
      if (moved) e.stopPropagation();
    }, true);

    // ── Swipe (touch) ──
    var touchStartX   = 0;
    var touchStartOff = 0;

    viewport.addEventListener('touchstart', function (e) {
      touchStartX   = e.touches[0].clientX;
      touchStartOff = current * viewport.offsetWidth;
      track.style.transition = 'none';
    }, { passive: true });

    viewport.addEventListener('touchmove', function (e) {
      var delta = touchStartX - e.touches[0].clientX;
      var max   = (totalPages() - 1) * viewport.offsetWidth;
      var off   = Math.max(0, Math.min(touchStartOff + delta, max));
      track.style.transform = 'translateX(-' + off + 'px)';
    }, { passive: true });

    viewport.addEventListener('touchend', function (e) {
      var delta = touchStartX - e.changedTouches[0].clientX;
      goTo(Math.abs(delta) > 60 ? (delta > 0 ? current + 1 : current - 1) : current);
      resetAuto();
    });

    // ── Redimensionar ──
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        setItemWidths();
        buildDots();
        goTo(0);
      }, 200);
    });

    // Inicializar
    setItemWidths();
    buildDots();
    goTo(0);
    startAuto();
  })();

  /* ============================================================
     6. SCROLL REVEAL
     ============================================================ */
  (function initReveal() {
    var revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback: mostrar todo inmediatamente
      revealEls.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.10, rootMargin: '0px 0px -36px 0px' }
    );

    revealEls.forEach(function (el) { io.observe(el); });
  })();

  /* ============================================================
     6b. PROYECTOS – CARRUSEL AUTOMÁTICO INFINITO (RAF)
     ============================================================ */
  (function initProyectosCarousel() {
    var carousel = document.getElementById('proyectosCarousel');
    var track    = document.getElementById('proyectosTrack');

    if (!carousel || !track) return;

    // Solo activar en desktop (>768px). Mobile usa scroll nativo.
    if (window.innerWidth <= 768) return;

    // Clonar todos los cards para loop infinito sin espacio en blanco
    var originalItems = Array.from(track.children);
    var originalWidth = track.scrollWidth;
    originalItems.forEach(function (item) {
      track.appendChild(item.cloneNode(true));
    });

    var speed    = 0.5;   // px por frame
    var offset   = 0;
    var paused   = false;

    carousel.addEventListener('mouseenter', function () { paused = true;  });
    carousel.addEventListener('mouseleave', function () { paused = false; });

    function tick() {
      if (!paused) {
        offset += speed;
        // Al llegar al final del set original, saltar al inicio (invisible)
        if (offset >= originalWidth) {
          offset = offset - originalWidth;
        }
        track.style.transform = 'translateX(-' + offset + 'px)';
      }
      requestAnimationFrame(tick);
    }

    track.style.animation = 'none';
    requestAnimationFrame(tick);
  })();

  /* ============================================================
     7. NAV ACTIVO SEGÚN SECCIÓN VISIBLE
     ============================================================ */
  (function initActiveNav() {
    var sections = document.querySelectorAll('section[id]');
    var links    = document.querySelectorAll('.nav__link[href^="#"]');

    if (!sections.length || !links.length) return;

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            links.forEach(function (link) {
              link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach(function (s) { io.observe(s); });
  })();

  /* ============================================================
     8. FORMULARIO DE CONTACTO
     ============================================================ */
  (function initForm() {
    var form    = document.getElementById('contactForm');
    var success = document.getElementById('formSuccess');

    if (!form) return;

    // Select: gris cuando vacío, oscuro cuando seleccionado
    var selectProyecto = form.querySelector('#proyecto');
    if (selectProyecto) {
      selectProyecto.addEventListener('change', function () {
        this.classList.toggle('is-selected', this.value !== '');
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Limpiar errores previos
      form.querySelectorAll('.error').forEach(function (el) {
        el.classList.remove('error');
      });

      var nombre   = form.querySelector('#nombre');
      var telefono = form.querySelector('#telefono');
      var hasError = false;

      if (!nombre.value.trim()) {
        nombre.classList.add('error');
        nombre.focus();
        hasError = true;
      }

      if (!telefono.value.trim() || !/[\d\s+\-]{7,}/.test(telefono.value)) {
        telefono.classList.add('error');
        if (!hasError) telefono.focus();
        hasError = true;
      }

      if (hasError) return;

      // ── Aquí conectar con API real ──
      // fetch('/api/contacto', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     nombre:   nombre.value.trim(),
      //     telefono: telefono.value.trim(),
      //     email:    form.querySelector('#email').value.trim(),
      //     proyecto: form.querySelector('#proyecto').value,
      //     mensaje:  form.querySelector('#mensaje').value.trim(),
      //   })
      // }).then(showSuccess).catch(console.error);

      showSuccess();
    });

    function showSuccess() {
      form.hidden    = true;
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  })();

  /* ============================================================
     9. REELS – PLAY / PAUSE
     ============================================================ */
  (function initReels() {
    var frame = document.querySelector('.reels__frame');
    if (!frame) return;

    var cards = frame.querySelectorAll('.reel-card');

    // ── Carousel mobile ──
    var reelIndex = 0;
    var btnPrev = document.getElementById('reelsPrev');
    var btnNext = document.getElementById('reelsNext');
    var dots = document.querySelectorAll('.reels__mobile-dot');

    function goReelSlide(idx) {
      reelIndex = Math.max(0, Math.min(idx, cards.length - 1));
      cards.forEach(function(c, i) {
        c.style.transform = 'translateX(' + (-reelIndex * 100) + '%)';
      });
      dots.forEach(function(d, i) {
        d.classList.toggle('reels__mobile-dot--active', i === reelIndex);
      });
    }

    if (btnPrev) btnPrev.addEventListener('click', function() { goReelSlide(reelIndex - 1); });
    if (btnNext) btnNext.addEventListener('click', function() { goReelSlide(reelIndex + 1); });

    function collapseAll() {
      cards.forEach(function (c) {
        var v = c.querySelector('video');
        if (v) v.pause();
        c.classList.remove('is-playing', 'reel-card--expanded', 'reel-card--dimmed');
      });
    }

    cards.forEach(function (card) {
      var video = card.querySelector('video');
      var btn   = card.querySelector('.reel-card__play');
      if (!video || !btn) return;

      function activateCard() {
        var isMobile = window.innerWidth <= 768;

        // En mobile: sólo play/pause sin expandir ni mover nada
        if (isMobile) {
          if (card.classList.contains('is-playing')) {
            video.pause();
          } else {
            // Pausar otros videos en mobile
            cards.forEach(function (c) {
              if (c === card) return;
              var v = c.querySelector('video');
              if (v) v.pause();
              c.classList.remove('is-playing');
            });
            var p = video.play();
            if (p !== undefined) {
              p.then(function () { video.muted = false; }).catch(function () {
                video.muted = true;
                video.play().catch(function () {});
              });
            }
          }
          return;
        }

        // Desktop: lógica de expand/collapse
        if (card.classList.contains('is-playing')) {
          collapseAll();
          return;
        }

        // Pausar y colapsar SOLO las otras cards (no la que vamos a reproducir)
        cards.forEach(function (c) {
          if (c === card) return;
          var v = c.querySelector('video');
          if (v) v.pause();
          c.classList.remove('is-playing', 'reel-card--expanded');
          c.classList.add('reel-card--dimmed');
        });

        // Expandir la card objetivo
        card.classList.remove('reel-card--dimmed');
        card.classList.add('reel-card--expanded');

        var playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(function () {
            video.muted = false;
          }).catch(function () {
            video.muted = true;
            video.play().catch(function () {});
          });
        }
      }

      // Click en el botón play
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        activateCard();
      });

      // Click en la card completa — permite tap en cualquier parte (mejor UX móvil)
      card.addEventListener('click', function () {
        activateCard();
      });

      video.addEventListener('play',  function () { card.classList.add('is-playing'); });
      video.addEventListener('pause', function () { card.classList.remove('is-playing'); });
    });
  })();

  /* ============================================================
     10b. NOSOTROS – SLIDESHOW DE IMÁGENES
     ============================================================ */
  (function () {
    var slides = document.querySelectorAll('#nosotrosSlides .nosotros__slide');
    var dots   = document.querySelectorAll('#nosotrosDots .nosotros__img-dot');
    if (!slides.length) return;

    var current = 0;
    var timer;

    function goTo(n) {
      slides[current].classList.remove('nosotros__slide--active');
      dots[current].classList.remove('nosotros__img-dot--active');
      current = (n + slides.length) % slides.length;
      slides[current].classList.add('nosotros__slide--active');
      dots[current].classList.add('nosotros__img-dot--active');
    }

    function next() { goTo(current + 1); }

    function start() { timer = setInterval(next, 4000); }
    function stop()  { clearInterval(timer); }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        stop();
        goTo(parseInt(dot.dataset.ns, 10));
        start();
      });
    });

    start();
  })();

  /* ============================================================
     10. LIGHTBOX – CASOS DE ÉXITO
     ============================================================ */
  (function () {
    const overlay  = document.getElementById('casosLightbox');
    const btnClose = document.getElementById('lbClose');
    if (!overlay) return;

    const lbImg     = document.getElementById('lbImg');
    const lbBadge   = document.getElementById('lbBadge');
    const lbMetrics = document.getElementById('lbMetrics');
    const lbLoc     = document.getElementById('lbLocation');
    const lbTitle   = document.getElementById('lbTitle');
    const lbQuote   = document.getElementById('lbQuote');
    const lbPerson  = document.getElementById('lbPerson');

    function openLightbox(card) {
      var d = card.dataset;

      // Imagen
      lbImg.src = d.img;
      lbImg.alt = d.title;

      // Badge
      lbBadge.textContent = d.badge;
      lbBadge.className   = 'lb-badge caso-card__badge ' + (d.badgeClass || '');

      // Métricas
      lbMetrics.innerHTML =
        metric(d.m1, d.m1l) + metric(d.m2, d.m2l) + metric(d.m3, d.m3l);

      // Texto
      lbLoc.innerHTML =
        '<svg width="10" height="10" viewBox="0 0 8 8" fill="var(--azul)" aria-hidden="true"><circle cx="4" cy="4" r="4"/></svg> ' +
        d.location;
      lbTitle.textContent = d.title;
      lbQuote.textContent = d.quote;

      // Persona
      var initials = (d.person || '').split(' ').slice(0,2).map(function(w){ return w[0]; }).join('');
      lbPerson.innerHTML =
        '<div class="lb-avatar">' + initials + '</div>' +
        '<div class="lb-person-info"><strong>' + d.person + '</strong><span>' + d.role + '</span></div>';

      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    function metric(val, label) {
      return '<div class="caso-metric"><strong>' + val + '</strong><span>' + label + '</span></div>';
    }

    // Abrir al hacer clic en cualquier card con data-lightbox
    document.querySelectorAll('[data-lightbox]').forEach(function (card) {
      card.addEventListener('click', function () { openLightbox(card); });
    });

    // Cerrar con botón X
    btnClose.addEventListener('click', closeLightbox);

    // Cerrar al hacer clic en el overlay (fuera del panel)
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLightbox();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });

    // Cerrar al hacer clic en el CTA (navega a #contacto)
    document.getElementById('lbCta').addEventListener('click', closeLightbox);
  })();

})();
