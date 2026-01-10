/**
 * Flo Faction Navigation System
 * Responsive burger menu with dropdown support
 * Auto-injects hamburger button on mobile devices
 */

(function() {
    'use strict';

    // Configuration
    const MOBILE_BREAKPOINT = 768;
    const NAV_SELECTOR = 'nav, .nav, .navigation, .navbar, header nav';
    
    // Inject styles
    const styles = document.createElement('style');
    styles.textContent = `
        .ff-burger {
            display: none;
            flex-direction: column;
            justify-content: space-around;
            width: 30px;
            height: 24px;
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 0;
            z-index: 1001;
            position: relative;
        }
        .ff-burger span {
            width: 30px;
            height: 3px;
            background: #333;
            border-radius: 3px;
            transition: all 0.3s ease;
            transform-origin: center;
        }
        .ff-burger.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        .ff-burger.active span:nth-child(2) {
            opacity: 0;
        }
        .ff-burger.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
        .ff-mobile-menu {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.98);
            z-index: 1000;
            padding: 80px 20px 20px;
            overflow-y: auto;
            flex-direction: column;
        }
        .ff-mobile-menu.active {
            display: flex;
        }
        .ff-mobile-menu a {
            display: block;
            padding: 15px 20px;
            color: #333;
            text-decoration: none;
            font-size: 1.1em;
            border-bottom: 1px solid #eee;
            transition: background 0.2s;
        }
        .ff-mobile-menu a:hover {
            background: #f5f5f5;
        }
        .ff-mobile-menu .dropdown-toggle {
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
        }
        .ff-mobile-menu .dropdown-toggle::after {
            content: '▼';
            font-size: 0.7em;
            transition: transform 0.3s;
        }
        .ff-mobile-menu .dropdown-toggle.open::after {
            transform: rotate(180deg);
        }
        .ff-mobile-menu .dropdown-content {
            display: none;
            padding-left: 20px;
            background: #f9f9f9;
        }
        .ff-mobile-menu .dropdown-content.open {
            display: block;
        }
        .ff-mobile-menu .dropdown-content a {
            font-size: 1em;
            padding: 12px 20px;
        }
        .ff-close-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 2em;
            background: none;
            border: none;
            cursor: pointer;
            color: #333;
        }
        @media (max-width: ${MOBILE_BREAKPOINT}px) {
            .ff-burger {
                display: flex;
            }
            .ff-desktop-nav {
                display: none !important;
            }
        }
        @media (min-width: ${MOBILE_BREAKPOINT + 1}px) {
            .ff-mobile-menu {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(styles);

    // Default navigation items
    const defaultNavItems = [
        { text: 'Home', href: '/' },
        { text: 'Services', href: '#', dropdown: [
            { text: 'Insurance', href: '/insurance.html' },
            { text: 'Financial Calculators', href: '/finance/' },
            { text: 'Healthcare', href: '/healthcare.html' },
            { text: 'Real Estate', href: '/real-estate.html' },
            { text: 'Tax Services', href: '/tax.html' },
            { text: 'Retirement Planning', href: '/retirement.html' },
            { text: 'Legacy Planning', href: '/legacy.html' }
        ]},
        { text: 'Pricing', href: '/pricing.html' },
        { text: 'Roadmap', href: '/roadmap.html' },
        { text: 'Calculators', href: '/finance/' },
        { text: 'Get Started', href: '/intake.html' },
        { text: 'Contact', href: '/contact.html' }
    ];

    function createBurgerButton() {
        const burger = document.createElement('button');
        burger.className = 'ff-burger';
        burger.setAttribute('aria-label', 'Toggle navigation menu');
        burger.innerHTML = '<span></span><span></span><span></span>';
        return burger;
    }

    function createMobileMenu(navItems) {
        const menu = document.createElement('div');
        menu.className = 'ff-mobile-menu';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'ff-close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', 'Close menu');
        menu.appendChild(closeBtn);

        navItems.forEach(item => {
            if (item.dropdown) {
                const toggle = document.createElement('div');
                toggle.className = 'dropdown-toggle';
                toggle.textContent = item.text;
                
                const content = document.createElement('div');
                content.className = 'dropdown-content';
                
                item.dropdown.forEach(subItem => {
                    const link = document.createElement('a');
                    link.href = subItem.href;
                    link.textContent = subItem.text;
                    content.appendChild(link);
                });
                
                toggle.addEventListener('click', () => {
                    toggle.classList.toggle('open');
                    content.classList.toggle('open');
                });
                
                menu.appendChild(toggle);
                menu.appendChild(content);
            } else {
                const link = document.createElement('a');
                link.href = item.href;
                link.textContent = item.text;
                menu.appendChild(link);
            }
        });

        return menu;
    }

    function init() {
        // Find existing nav or header
        let navContainer = document.querySelector(NAV_SELECTOR);
        if (!navContainer) {
            navContainer = document.querySelector('header') || document.body;
        }

        // Extract existing nav items if present
        let navItems = defaultNavItems;
        const existingLinks = navContainer.querySelectorAll('a');
        if (existingLinks.length > 0) {
            navItems = Array.from(existingLinks).map(link => ({
                text: link.textContent.trim(),
                href: link.href
            })).filter(item => item.text && item.href);
            
            // Add default items if not present
            const hasCalc = navItems.some(i => i.href.includes('finance'));
            if (!hasCalc) {
                navItems.push({ text: 'Calculators', href: '/finance/' });
            }
        }

        // Create and inject burger button
        const burger = createBurgerButton();
        const firstChild = navContainer.firstChild;
        if (firstChild) {
            navContainer.insertBefore(burger, firstChild);
        } else {
            navContainer.appendChild(burger);
        }

        // Create mobile menu
        const mobileMenu = createMobileMenu(navItems);
        document.body.appendChild(mobileMenu);

        // Event listeners
        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        mobileMenu.querySelector('.ff-close-btn').addEventListener('click', () => {
            burger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close on outside click
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                burger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                burger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Mark desktop nav for hiding on mobile
        const desktopNav = navContainer.querySelector('ul, .nav-links, .menu');
        if (desktopNav) {
            desktopNav.classList.add('ff-desktop-nav');
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
