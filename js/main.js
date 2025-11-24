import { RecipeManager } from './recipeManager.js';

const THEME_KEY = 'app-theme'; // 'light' or 'dark'

function applyTheme(theme) {
    const html = document.documentElement;
    if (theme === 'light') {
        html.classList.add('light-theme');
    } else {
        html.classList.remove('light-theme');
    }

    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        toggle.textContent = theme === 'light' ? '☀️' : '🌙';
        toggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    }
}

function toggleTheme() {
    const current = localStorage.getItem(THEME_KEY) || 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
}

document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize theme from storage (default dark)
        const stored = localStorage.getItem(THEME_KEY) || 'dark';
        applyTheme(stored);

        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.preventDefault && e.preventDefault();
                toggleTheme();
            });
        }

        RecipeManager.init();
    } catch (error) {
        console.error('Critical application error:', error);
        document.body.innerHTML = `
            <div style="padding: 40px; text-align: center; color: white; background: #0F0F23;">
                <h1>😵 Application Error</h1>
                <p>Sorry, something went wrong. Please refresh the page.</p>
                <button onclick="window.location.reload()" style="
                    background: #8B5FBF; 
                    color: white; 
                    border: none; 
                    padding: 10px 20px; 
                    border-radius: 5px; 
                    cursor: pointer;
                    margin-top: 20px;
                ">Refresh Page</button>
            </div>
        `;
    }
});