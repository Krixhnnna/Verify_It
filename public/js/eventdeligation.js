document.addEventListener('DOMContentLoaded', () => {
    let count = parseInt(localStorage.getItem('count')) || 0;
    if (document.getElementById('counterfeit-trigger')) {
        localStorage.setItem('count', ++count);
    }

    document.addEventListener('click', (e) => {
        const target = e.target;

        // Example: Handle the "Check Now" button click via delegation
        if (target.matches('.btn') && target.getAttribute('href') === '/verify') {
            console.log('🚀 Redirecting to verification engine...');
        }
        
        // Mobile Menu Toggle logic
        if (target.matches('.menu-toggle')) {
            const nav = target.closest('nav');
            nav.classList.toggle('nav-active');
            target.textContent = nav.classList.contains('nav-active') ? 'CLOSE' : 'MENU';
        }
        
        // Example: Handle logo clicks
    });

    const el = document.getElementById('tracker-display');
    if (el) el.textContent = count.toLocaleString();
});
