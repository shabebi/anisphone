import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePhoneScene } from './usePhoneScene';
import {
  computeSceneState,
  heroContentOpacity,
  newContentOpacity,
} from './animations';
import './SmartphoneHero.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * The complete, self-contained smartphone hero.
 *
 * A tall scroll section pins a full-viewport stage. A single GSAP ScrollTrigger
 * scrubs progress `p` in [0,1], which continuously drives the 3D phone (position,
 * 180deg rotation, scale, subtle camera dolly), fades the right-side editorial
 * content, and finally reveals the product carousel — one continuous choreography.
 *
 * Honors prefers-reduced-motion by skipping the scrubbed animation and showing a
 * calm final composition instead.
 */
export function SmartphoneHero() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const contentRef = useRef(null);
  const shadowRef = useRef(null);
  const cursorLensRef = useRef(null);
  const newContentRef = useRef(null);
  const scrollRef = useRef(null);
  const heroProgressRef = useRef(0);

  const [showDragIndicator, setShowDragIndicator] = useState(false);
  const dragIndicatorShownRef = useRef(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [language, setLanguage] = useState('en');

  const totalSlides = 4;

  const dragRef = useRef({
    active: false,
    startX: 0,
    currentX: 0,
  });

  const reducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const scene = usePhoneScene(canvasRef, stageRef);

  // Half-width of usable horizontal world space, based on viewport aspect.
  const spanXRef = useRef(3);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;

      // Narrower screens keep the phone closer to center to avoid clipping.
      spanXRef.current =
        w < 768 ? 1.2 : w < 1200 ? 2.4 : 3.2;
    };

    compute();

    window.addEventListener('resize', compute);

    return () => window.removeEventListener('resize', compute);
  }, []);

  useEffect(() => {
    const hero = stageRef.current;
    const lens = cursorLensRef.current;

    if (!hero || !lens) return;

    const handlePointerMove = (event) => {
      const rect = hero.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      lens.style.left = `${x}px`;
      lens.style.top = `${y}px`;
      lens.style.opacity = '1';

      const corner = newContentRef.current;

      let insideCircle = false;

      if (corner) {
        const cornerRect = corner.getBoundingClientRect();

        const dx =
          event.clientX -
          (cornerRect.left + cornerRect.width);

        const dy =
          event.clientY -
          (cornerRect.top + cornerRect.height);

        const distance = Math.sqrt(dx * dx + dy * dy);

        insideCircle = distance <= cornerRect.width;
      }

      // iPad screen hit area
      const heroIsAtEnd =
        heroProgressRef.current >= 0.7;

      const circleIsAtEnd =
        heroProgressRef.current >= 0.7;

      const screenLeft =
        window.innerWidth * 0.26;

      const screenRight =
        window.innerWidth * 0.75;

      const screenTop =
        window.innerHeight * 0.15;

      const screenBottom =
        window.innerHeight * 0.86;

      const insideScreen =
        heroIsAtEnd &&
        event.clientX >= screenLeft &&
        event.clientX <= screenRight &&
        event.clientY >= screenTop &&
        event.clientY <= screenBottom;

      // Shrink over either the circle OR the iPad screen.
      lens.classList.toggle(
        'hero-cursor-lens-small',
        (insideCircle && circleIsAtEnd) || insideScreen,
      );
    };

    const handlePointerLeave = () => {
      lens.style.opacity = '0';
    };

    hero.addEventListener('pointermove', handlePointerMove);
    hero.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      hero.removeEventListener('pointermove', handlePointerMove);
      hero.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  // Apply a given progress to scene + UI.
  // Shared by scrub and reduced-motion.
  const applyProgress = useCallback(
    (p) => {
      heroProgressRef.current = p;

      scene.applyState(
        computeSceneState(p, spanXRef.current),
        spanXRef.current,
      );

      const opacity = heroContentOpacity(p);

      const content = contentRef.current;

      if (content) {
        content.style.opacity = String(opacity);
        content.style.transform = 'none';
        content.style.pointerEvents = 'none';
      }

      const shadow = shadowRef.current;

      if (shadow) {
        shadow.style.opacity = String(opacity);
      }

      const newContent = newContentRef.current;

      if (newContent) {
        newContent.style.opacity = String(
          newContentOpacity(p),
        );
      }

      const scroll = scrollRef.current;

      if (scroll) {
        scroll.style.opacity = String(opacity);
      }
    },
    [scene],
  );

  useLayoutEffect(() => {
    if (reducedMotion) {
      // Show a calm, centered final composition without scroll scrubbing.
      applyProgress(1);
      return;
    }

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=280%',
        pin: stageRef.current,
        scrub: 0.8,
        onUpdate: (self) => applyProgress(self.progress),
        onRefresh: (self) => applyProgress(self.progress),
      });

      return () => st.kill();
    }, sectionRef);

    // Initial paint at p=0.
    applyProgress(0);

    // Recalculate once the scene/canvas has laid out.
    const id = window.setTimeout(
      () => ScrollTrigger.refresh(),
      120,
    );

    return () => {
      window.clearTimeout(id);
      ctx.revert();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const handlePreviousSlide = async () => {
    const nextIndex =
      (currentSlide - 1 + totalSlides) % totalSlides;

    await scene.commitScreenSlide(-1);

    setCurrentSlide(nextIndex);
  };

  const handleNextSlide = async () => {
    const nextIndex =
      (currentSlide + 1) % totalSlides;

    await scene.commitScreenSlide(1);

    setCurrentSlide(nextIndex);
  };

  const handleScreenPointerDown = (event) => {
    if (heroProgressRef.current < 0.7) return;

    dragRef.current.active = true;
    dragRef.current.startX = event.clientX;
    dragRef.current.currentX = event.clientX;

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );
  };

  const handleScreenPointerMove = (event) => {
    if (!dragRef.current.active) return;

    dragRef.current.currentX = event.clientX;

    const deltaX =
      event.clientX - dragRef.current.startX;

    // Convert pixels into a normalized drag amount.
    // ~300px = one complete slide.
    const offset = Math.max(
      -1,
      Math.min(1, deltaX / 300),
    );

    scene.setScreenDrag(offset);
  };

  const handleScreenPointerUp = (event) => {
    if (!dragRef.current.active) return;

    dragRef.current.active = false;

    const deltaX =
      event.clientX - dragRef.current.startX;

    const threshold = 80;

    if (Math.abs(deltaX) >= threshold) {
      const direction = deltaX < 0 ? 1 : -1;

      const nextIndex =
        (currentSlide + direction + totalSlides) %
        totalSlides;

      void scene.commitScreenSlide(direction);

      setCurrentSlide(nextIndex);
    } else {
      scene.cancelScreenDrag();
    }
  };

  const handleScreenPointerCancel = () => {
    if (!dragRef.current.active) return;

    dragRef.current.active = false;
    scene.cancelScreenDrag();
  };

  return (
    <section
      ref={sectionRef}
      className="hero-section"
      aria-label="Premium smartphone showcase"
    >
      {/* Pinned full-viewport stage */}
      <div
        ref={stageRef}
        className="hero-stage"
      >
        <div className="hero-header-wrapper">
          {/* <Header
            variant="hero"
            language={language}
            onLanguageChange={setLanguage}
          /> */}
        </div>

        {/* Hero typography — intentionally behind the 3D iPad */}
        <div
          ref={contentRef}
          className="hero-content"
        >
          <div className="hero-content-inner">
            <h1
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              className={`hero-main-title ${language === 'ar' ? 'hero-main-title-ar' : ''
                }`}
            >
              {language === 'ar' ? (
                <span className="hero-arabic-lines">
                  <span className="hero-arabic-line">
                    <span>أجهزة</span>
                    <span>ذكية</span>
                  </span>

                  <span className="hero-arabic-line">
                    <span>لحياة</span>
                    <span>أفضل</span>
                  </span>
                </span>
              ) : (
                <>
                  <span className="block">
                    Smarter Devices.
                  </span>
                  <span className="block">
                    Better Everyday.
                  </span>
                </>
              )}
            </h1>
          </div>
        </div>

        {/* What's new corner */}
        <div
          ref={newContentRef}
          className="hero-new-corner"
        >
          <div
            className="hero-new-corner-content"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="hero-new-corner-title">
              {language === 'ar' ? (
                <>
                  <span>اكتشف</span>
                  <span>جديدنا</span>
                </>
              ) : (
                <>
                  <span>DISCOVER</span>
                  <span>WHAT'S</span>
                  <span>NEW</span>
                </>
              )}
            </div>

            <div className="hero-slider-nav">
              <span className="hero-slider-counter">
                <span>
                  {String(currentSlide + 1).padStart(
                    2,
                    '0',
                  )}
                </span>

                <span className="hero-slider-divider">
                  /
                </span>

                <span>
                  {String(totalSlides).padStart(2, '0')}
                </span>
              </span>

              <div className="hero-slider-buttons">
                <button
                  type="button"
                  className="hero-slider-button"
                  aria-label="Previous item"
                  onClick={handlePreviousSlide}
                >
                  ←
                </button>

                <button
                  type="button"
                  className="hero-slider-button"
                  aria-label="Next item"
                  onClick={handleNextSlide}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* iPad shadow */}
        <div
          ref={shadowRef}
          aria-hidden
          className="hero-ipad-shadow"
        />

        {/* Cursor X-ray lens */}
        <div
          ref={cursorLensRef}
          aria-hidden
          className="hero-cursor-lens"
        >
          <span className="hero-cursor-dot" />
        </div>

        {showDragIndicator && (
          <div
            className="hero-screen-drag-indicator"
            aria-hidden="true"
          >
            DRAG&nbsp;↔
          </div>
        )}

        {/* Three.js iPad */}
        <div className="hero-canvas-wrapper">
          <canvas
            ref={canvasRef}
            className="hero-canvas"
          />
        </div>

        <div
          className="hero-screen-drag-area"
          onPointerDown={handleScreenPointerDown}
          onPointerMove={handleScreenPointerMove}
          onPointerUp={handleScreenPointerUp}
          onPointerCancel={handleScreenPointerCancel}
        />

        {/* Scroll affordance, fades as the transformation begins */}
        <div
          ref={scrollRef}
          aria-hidden
          className="hero-scroll"
          style={{ opacity: 1 }}
        >
          <span className="hero-scroll-label">
            Scroll
          </span>

          <span className="hero-scroll-line" />
        </div>
      </div>
    </section>
  );
}