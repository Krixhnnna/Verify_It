document.addEventListener('DOMContentLoaded', () => {
    let count = parseInt(localStorage.getItem('count')) || 0;
    if (document.getElementById('counterfeit-trigger')) {
        localStorage.setItem('count', ++count);
    }
    const el = document.getElementById('tracker-display');
    if (el) el.textContent = count.toLocaleString();
});
