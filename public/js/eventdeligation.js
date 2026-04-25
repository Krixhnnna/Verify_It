document.addEventListener('DOMContentLoaded', () => {
    let count = parseInt(localStorage.getItem('count')) || 0;
    if (document.getElementById('counterfeit-trigger')) {
        localStorage.setItem('count', ++count);
    }

    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target.matches('.btn') && target.getAttribute('href') === '/verify') {
            console.log('🚀 Redirecting to verification engine...');
        }
        
        // Example: Handle logo clicks
    });

    const el = document.getElementById('tracker-display');
    if (el) el.textContent = count.toLocaleString();
});
