/**
 * EVENT DELEGATION - Counterfeit Tracker Logic
 * This script handles global event delegation and the persistent solved problem counter.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. INITIALIZE DATA
    // We start with a simulated count of 1,240 to make the platform look established.
    const START_OFFSET = 1240;
    let localCount = parseInt(localStorage.getItem('counterfeit_solved_local')) || 0;
    
    const updateDisplay = () => {
        const display = document.getElementById('tracker-display');
        if (display) {
            display.textContent = (START_OFFSET + localCount).toLocaleString();
        }
    };

    // 2. TRIGGER LOGIC
    // If this page contains a counterfeit alert, increment the local counter.
    const trigger = document.getElementById('counterfeit-trigger');
    if (trigger) {
        localCount++;
        localStorage.setItem('counterfeit_solved_local', localCount);
        // Show an alert only once per trigger session
        if (!sessionStorage.getItem('alert_shown')) {
            console.log('✅ Counterfeit Solver Tracker Updated!');
            sessionStorage.setItem('alert_shown', 'true');
        }
    }

    // 3. EVENT DELEGATION
    // We listen for any clicks on the body and delegate logic based on the target.
    document.body.addEventListener('click', (event) => {
        const target = event.target;

        // Example: Handle the "Check Now" button click via delegation
        if (target.matches('.btn') && target.getAttribute('href') === '/verify') {
            console.log('🚀 Redirecting to verification engine...');
        }
        
        // Example: Handle logo clicks
        if (target.closest('.nav-logo')) {
            console.log('🏠 Navigating home...');
        }
    });

    // 4. INITIAL RENDER
    updateDisplay();
});
