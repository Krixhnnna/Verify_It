/**
 * EVENT DELEGATION SYSTEM
 * Handles global interactions and dynamic UI updates.
 */

document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.body;

    // Use Event Delegation to handle clicks on the main body
    mainContainer.addEventListener('click', (event) => {
        const target = event.target;

        // 1. Handle Navigation Link Interactions
        if (target.matches('.nav-links a')) {
            console.log(`Navigating to: ${target.textContent}`);
        }

        // 2. Handle Action Button "Check Counterfeit"
        if (target.matches('.btn') && target.href.includes('/verify')) {
            // Optional: Add a subtle feedback or log the intent
            console.log('User initiated counterfeit verification check.');
        }

        // 3. Handle ticker interactions (if user clicks the solved count)
        if (target.closest('.solved-ticker')) {
            target.closest('.solved-ticker').style.transform = 'scale(1.05)';
            setTimeout(() => {
                target.closest('.solved-ticker').style.transform = 'scale(1)';
            }, 200);
        }
    });

    // Simple Animation for the Ticker Count
    const countElement = document.querySelector('.ticker-count');
    if (countElement) {
        const finalValue = parseInt(countElement.textContent);
        if (!isNaN(finalValue)) {
            animateCount(countElement, 0, finalValue, 1500);
        }
    }
});

/**
 * Animates a number from start to end over a specified duration
 */
function animateCount(element, start, end, duration) {
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentValue = Math.floor(progress * (end - start) + start);
        element.textContent = currentValue.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    }

    window.requestAnimationFrame(step);
}
