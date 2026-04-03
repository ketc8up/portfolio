const STORAGE_KEY = 'about-scroll-position';
const RESUME_PENDING_KEY = 'about-resume-pending';
const RESUME_THRESHOLD = 200;
const SAVE_DEBOUNCE_MS = 300;
const RESUME_TOLERANCE_PX = 48;

const debounce = (fn, delay) => {
  let timer = null;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const createProgressBar = () => {
  const bar = document.createElement('div');
  bar.id = 'reading-progress-bar';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', 'Reading progress');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  bar.setAttribute('aria-valuenow', '0');

  document.body.prepend(bar);

  return bar;
};

const getScrollPercent = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight;
  const windowHeight = window.innerHeight;
  const scrollable = docHeight - windowHeight;

  if (scrollable <= 0) return 0;

  return Math.round((scrollTop / scrollable) * 100);
};

const createResumePrompt = () => {
  const prompt = document.createElement('div');
  prompt.id = 'resume-prompt';
  prompt.setAttribute('role', 'dialog');
  prompt.setAttribute('aria-modal', 'false');
  prompt.setAttribute('aria-label', 'Resume reading');
  prompt.hidden = true;

  const promptText = document.createElement('p');
  promptText.id = 'resume-prompt-text';
  promptText.textContent = 'Continue where you left off?';

  const actions = document.createElement('div');
  actions.className = 'resume-prompt__actions';

  const resumeButton = document.createElement('button');
  resumeButton.id = 'resume-btn';
  resumeButton.className = 'btn btn--primary btn--sm';
  resumeButton.type = 'button';
  resumeButton.textContent = 'Resume';

  const dismissButton = document.createElement('button');
  dismissButton.id = 'dismiss-btn';
  dismissButton.className = 'btn btn--secondary btn--sm';
  dismissButton.type = 'button';
  dismissButton.textContent = 'Dismiss';

  actions.append(resumeButton, dismissButton);
  prompt.append(promptText, actions);

  prompt.classList.add('resume-prompt--hidden');

  document.body.appendChild(prompt);

  return {
    element: prompt,
    resumeButton,
    dismissButton,

    show() {
      prompt.hidden = false;
      prompt.classList.remove('resume-prompt--hidden');
      prompt.classList.add('resume-prompt--visible');
      resumeButton?.focus();
    },

    hide() {
      prompt.classList.remove('resume-prompt--visible');
      prompt.classList.add('resume-prompt--hidden');
      prompt.hidden = true;
    }
  };
};

const getSavedScrollTarget = () => {
  const savedPosition = sessionStorage.getItem(STORAGE_KEY);

  if (savedPosition === null) {
    return null;
  }

  const savedY = Number.parseInt(savedPosition, 10);

  if (!Number.isFinite(savedY)) {
    return null;
  }

  const maxScrollTop = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );

  return Math.min(savedY, maxScrollTop);
};

const persistScrollState = () => {
  const currentY = window.scrollY;

  if (currentY > RESUME_THRESHOLD) {
    sessionStorage.setItem(STORAGE_KEY, currentY.toString());
    sessionStorage.setItem(RESUME_PENDING_KEY, 'true');
    return;
  }

  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(RESUME_PENDING_KEY);
};

export const initReadingProgress = () => {

  const progressBar = createProgressBar();

  const resumePrompt = createResumePrompt();
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  let resumeTargetY = null;

  const saveScrollPosition = debounce(persistScrollState, SAVE_DEBOUNCE_MS);

  const updateProgressBar = () => {
    const percent = getScrollPercent();
    progressBar.style.width = `${percent}%`;
    progressBar.setAttribute('aria-valuenow', percent.toString());
  };

  const maybeShowResumePrompt = () => {
    const hasPendingResume = sessionStorage.getItem(RESUME_PENDING_KEY) === 'true';
    const targetY = getSavedScrollTarget();

    if (!hasPendingResume || targetY === null || targetY <= RESUME_THRESHOLD) {
      resumePrompt.hide();
      return;
    }

    const alreadyNearSavedPosition =
      Math.abs(window.scrollY - targetY) <= RESUME_TOLERANCE_PX;

    if (alreadyNearSavedPosition) {
      sessionStorage.removeItem(RESUME_PENDING_KEY);
      resumePrompt.hide();
      return;
    }

    resumeTargetY = targetY;
    resumePrompt.show();
  };

  resumePrompt.resumeButton?.addEventListener('click', () => {
    if (resumeTargetY === null) {
      resumePrompt.hide();
      return;
    }

    sessionStorage.removeItem(RESUME_PENDING_KEY);
    resumePrompt.hide();

    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: resumeTargetY,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  });

  resumePrompt.dismissButton?.addEventListener('click', () => {
    resumeTargetY = null;
    resumePrompt.hide();
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(RESUME_PENDING_KEY);
  });

  updateProgressBar();

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(maybeShowResumePrompt);
  });

  window.addEventListener('scroll', () => {
    updateProgressBar();
    saveScrollPosition();
  }, { passive: true });

  window.addEventListener('pagehide', persistScrollState);
  window.addEventListener('pageshow', () => {
    updateProgressBar();
    window.requestAnimationFrame(maybeShowResumePrompt);
  });
};
