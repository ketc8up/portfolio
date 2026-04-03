const THEME_KEY = 'theme';

document.documentElement.classList.add('js-enabled');

const applyTheme = (theme) => {
  const html = document.documentElement;

  if (theme === 'dark') {
    html.setAttribute('data-theme', 'dark');
  } else {
    html.removeAttribute('data-theme');
  }

  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    const isDark = theme === 'dark';

    toggleBtn.setAttribute('aria-pressed', isDark.toString());

    toggleBtn.setAttribute(
      'aria-label',
      isDark ? 'Switch to light theme' : 'Switch to dark theme'
    );

    toggleBtn.textContent = isDark ? '☀️' : '🌙';
  }
};

const getInitialTheme = () => {
  const saved = localStorage.getItem(THEME_KEY);

  if (saved === 'dark' || saved === 'light') {
    return saved;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return prefersDark ? 'dark' : 'light';
};

const initTheme = () => {
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);

  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    applyTheme(newTheme);

    localStorage.setItem(THEME_KEY, newTheme);
  });
};

const enableThemeTransitions = () => {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      document.documentElement.classList.add('theme-transitions');
    });
  });
};

const initScrollAnimations = () => {
  const revealElements = document.querySelectorAll('.scroll-reveal');

  if (revealElements.length === 0) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => {
      element.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  revealElements.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top;
    const isInitiallyVisible = elementTop <= window.innerHeight * 0.9;

    if (isInitiallyVisible) {
      element.classList.add('is-visible');
      return;
    }

    observer.observe(element);
  });
};

const initActiveNav = () => {
  const currentPath = window.location.pathname;

  const navLinks = document.querySelectorAll('header nav a');

  navLinks.forEach((link) => {
    const linkPath = new URL(link.href).pathname;

    if (linkPath === currentPath) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  enableThemeTransitions();
  initScrollAnimations();
  initActiveNav();
});
