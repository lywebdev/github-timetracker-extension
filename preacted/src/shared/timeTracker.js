export function injectTimerButton() {
    if (!location.pathname.match(/^\/[^/]+\/[^/]+\/issues\/\d+$/)) return;
    if (document.getElementById('track-time-btn')) return;

    const container = document.querySelector('[data-testid="issue-metadata-fixed"]');
    if (!container) return;

    const btn = document.createElement('button');
    btn.id = 'track-time-btn';
    btn.textContent = 'Start Timer';
    btn.style = 'margin-left: 10px;';
    btn.onclick = () => alert('Start or stop timer (not implemented)');
    container.appendChild(btn);
}
