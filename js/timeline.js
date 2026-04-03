const TIMELINE_ID = 'timeline';

const getTriggerFromTarget = (target) => {
  if (!(target instanceof Element)) return null;
  return target.closest('.timeline__trigger');
};

const expandItem = (trigger) => {
  const panelId = trigger.getAttribute('aria-controls');
  const panel = document.getElementById(panelId);

  if (!panel) return;

  trigger.setAttribute('aria-expanded', 'true');
  panel.classList.add('timeline__panel--open');
  trigger.closest('.timeline__item').classList.add('timeline__item--active');
};

const collapseItem = (trigger) => {
  const panelId = trigger.getAttribute('aria-controls');
  const panel = document.getElementById(panelId);

  if (!panel) return;

  trigger.setAttribute('aria-expanded', 'false');
  panel.classList.remove('timeline__panel--open');
  trigger.closest('.timeline__item').classList.remove('timeline__item--active');
};

const collapseAll = (timelineEl) => {
  const openTriggers = timelineEl.querySelectorAll(
    '.timeline__trigger[aria-expanded="true"]'
  );

  openTriggers.forEach(collapseItem);
};

export const initTimeline = () => {
  const timelineEl = document.getElementById(TIMELINE_ID);

  if (!timelineEl) return;

  timelineEl.addEventListener('click', (e) => {
    const trigger = getTriggerFromTarget(e.target);

    if (!trigger) return;

    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

    collapseAll(timelineEl);

    if (!isExpanded) {
      expandItem(trigger);
    }
  });

  const firstTrigger = timelineEl.querySelector('.timeline__trigger');
  if (firstTrigger) {
    expandItem(firstTrigger);
  }
};
