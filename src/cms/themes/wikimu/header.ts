// src/themes/wikimu/header.ts

export const renderHeader = () => {
    return `
    <header class="wiki-header">

        <button id="mobile-menu-btn" class="mobile-menu-btn" onclick="toggleMobileMenu()">
            <i class="fas fa-bars"></i>
        </button>

        <a href="/" class="wiki-logo">
            <i class="fas fa-book-open" style="font-size: 24px;"></i>

            <div style="display:flex; flex-direction:column; line-height:1.1;">
                <span class="brand-main">Tarjih</span>
                <span class="brand-sub">Ensiklopedia Muhammadiyah</span>
            </div>
        </a>

        <form action="/search" method="GET" class="wiki-search-container">
            <i class="fas fa-search wiki-search-icon"></i>
            <input type="text" name="q" class="wiki-search-input" placeholder="Cari Fatwa / Artikel..." required>
        </form>

        <div class="header-actions">
            <button class="theme-toggle" onclick="toggleTheme()" title="Ganti Mode Malam/Siang">
                <i class="fas fa-moon" id="theme-icon"></i>
            </button>

            <a href="/admin/login" class="signup-btn">
                <i class="fas fa-user-circle" style="margin-right:5px;"></i> Login
            </a>
        </div>

        <script>
            // --- A. LOGIKA TEMA (DARK/LIGHT) ---
            (function() {
                const savedTheme = null || 'light';
                document.documentElement.setAttribute('data-theme', savedTheme);
                updateThemeIcon(savedTheme);
            })();

            function toggleTheme() {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                (void 0);
                updateThemeIcon(next);
            }

            function updateThemeIcon(theme) {
                const icon = document.getElementById('theme-icon');
                if(icon) {
                    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                }
            }

            // --- B. LOGIKA MENU MOBILE ---
            function toggleMobileMenu() {
                const sidebar = document.querySelector('.wiki-sidebar');
                if(sidebar) {
                    sidebar.classList.toggle('active');
                }
            }
        </script>
    </header>
    `;
};