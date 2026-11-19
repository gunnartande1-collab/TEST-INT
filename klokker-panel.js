(() => {
  'use strict';
  const panel = document.getElementById('opsixToolsPanel');
  const backdrop = document.getElementById('opsixToolsBackdrop');
  const open = document.getElementById('opsixClockButton');
  const close = document.getElementById('opsixToolsClose');
  const popout = document.getElementById('opsixToolsPopout');
  if (!panel || !backdrop || !open || !close) return;

  const frame = document.getElementById('opsixToolsFrame') || panel.querySelector('iframe');

  function hasActiveClock() {
    return frame?.contentDocument?.documentElement?.hasAttribute('data-opsix-active-clock') === true;
  }

  function show() {
    panel.classList.add('is-open');
    panel.inert = false;
    panel.setAttribute('aria-hidden', 'false');
    open.setAttribute('aria-expanded', 'true');
    backdrop.hidden = false;
    close.focus();
  }

  function hide() {
    if (hasActiveClock() && !window.confirm(
      'En klokke eller et varsel er aktivt. Vil du skjule sidepanelet? Klokkene fortsetter i bakgrunnen.'
    )) return;
    open.focus();
    panel.classList.remove('is-open');
    panel.inert = true;
    panel.setAttribute('aria-hidden', 'true');
    open.setAttribute('aria-expanded', 'false');
    backdrop.hidden = true;
  }

  panel.inert = panel.getAttribute('aria-hidden') === 'true';
  open.addEventListener('click', show);
  close.addEventListener('click', hide);
  backdrop.addEventListener('click', hide);
  function closeOnEscape(event) {
    if (event.key === 'Escape' && !event.defaultPrevented && panel.classList.contains('is-open')) hide();
  }
  document.addEventListener('keydown', closeOnEscape);
  const listenInFrame = () => frame.contentDocument?.addEventListener('keydown', closeOnEscape);
  if (frame) {
    frame.addEventListener('load', listenInFrame);
    listenInFrame();
  }
  if (popout?.tagName === 'BUTTON') {
    popout.addEventListener('click', () => {
      window.open('./klokker/', '_blank', 'noopener');
    });
  }

  window.addEventListener('beforeunload', event => {
    if (!hasActiveClock()) return;
    event.preventDefault();
    event.returnValue = '1';
  });
})();