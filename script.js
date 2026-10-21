"use strict";

/* ========================================
   1. DOM READY
======================================== */

document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initSmoothNavigation();
    initScrollReveal();
    initActiveNavigation();
    initTypingEffect();
    initCurrentYear();
});


/* ========================================
   2. MOBILE NAVIGATION
======================================== */

function initMobileMenu() {
    const header = document.querySelector(".header");
    const navbar = document.querySelector(".navbar");

    if (!header || !navbar) return;

    // Prevent creating duplicate buttons.
    if (header.querySelector(".menu-toggle")) return;

    const menuButton = document.createElement("button");

    menuButton.className = "menu-toggle";
    menuButton.type = "button";
    menuButton.setAttribute("aria-label", "Open navigation menu");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-controls", "main-navigation");
    menuButton.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;

    navbar.id = "main-navigation";
    header.insertBefore(menuButton, navbar);

    // Mobile menu styles.
    const menuStyles = document.createElement("style");

    menuStyles.textContent = `
        .menu-toggle {
            display: none;
            width: 42px;
            height: 42px;
            padding: 9px;
            border: 1px solid #292929;
            border-radius: 4px;
            background: #101010;
            cursor: pointer;
            flex-direction: column;
            justify-content: center;
            gap: 5px;
        }

        .menu-toggle span {
            display: block;
            width: 100%;
            height: 2px;
            background: #ff263f;
            border-radius: 2px;
            transition: transform 0.25s ease, opacity 0.25s ease;
        }

        .menu-toggle.active span:nth-child(1) {
            transform: translateY(7px) rotate(45deg);
        }

        .menu-toggle.active span:nth-child(2) {
            opacity: 0;
        }

        .menu-toggle.active span:nth-child(3) {
            transform: translateY(-7px) rotate(-45deg);
        }

        @media (max-width: 760px) {
            .header {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
            }

            .header .logo {
                width: auto;
                text-align: left;
            }

            .menu-toggle {
                display: flex;
            }

            .header .navbar {
                display: none;
                width: 100%;
                padding: 18px 0 8px;
                flex-direction: column;
                align-items: center;
                gap: 18px;
            }

            .header .navbar.menu-open {
                display: flex;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .menu-toggle span {
                transition: none;
            }
        }
    `;

    document.head.appendChild(menuStyles);

    function closeMenu() {
        navbar.classList.remove("menu-open");
        menuButton.classList.remove("active");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation menu");
    }

    menuButton.addEventListener("click", () => {
        const isOpen = navbar.classList.toggle("menu-open");

        menuButton.classList.toggle("active", isOpen);
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );
    });

    navbar.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    document.addEventListener("click", (event) => {
        if (
            navbar.classList.contains("menu-open") &&
            !header.contains(event.target)
        ) {
            closeMenu();
        }
    });

    // Restore desktop navigation when resizing to a larger screen.
    window.addEventListener("resize", () => {
        if (window.innerWidth > 760) {
            closeMenu();
        }
    });
}


/* ========================================
   3. SMOOTH NAVIGATION
======================================== */

function initSmoothNavigation() {
    const navigationLinks = document.querySelectorAll('a[href^="#"]');

    navigationLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches ? "auto" : "smooth",
                block: "start"
            });

            // Update the URL without causing a second jump.
            if (window.location.hash !== targetId) {
                history.pushState(null, "", targetId);
            }
        });
    });
}


/* ========================================
   4. SCROLL REVEAL
======================================== */

function initScrollReveal() {
    const sections = document.querySelectorAll(
        ".section, .skill-card, .project-card"
    );

    if (!sections.length) return;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
        sections.forEach((element) => {
            element.style.opacity = "1";
            element.style.transform = "none";
        });

        return;
    }

    const revealStyles = document.createElement("style");

    revealStyles.textContent = `
        .reveal-item {
            opacity: 0;
            transform: translateY(24px);
            transition:
                opacity 0.65s ease,
                transform 0.65s ease;
        }

        .reveal-item.is-visible {
            opacity: 1;
            transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
            .reveal-item,
            .reveal-item.is-visible {
                opacity: 1;
                transform: none;
                transition: none;
            }
        }
    `;

    document.head.appendChild(revealStyles);

    const observer = new IntersectionObserver(
        (entries, currentObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("is-visible");
                currentObserver.unobserve(entry.target);
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -35px 0px"
        }
    );

    sections.forEach((element) => {
        element.classList.add("reveal-item");
        observer.observe(element);
    });
}


/* ========================================
   5. ACTIVE NAVIGATION LINK
======================================== */

function initActiveNavigation() {
    const sections = document.querySelectorAll(
        "#home, #about, #skills, #projects, #contact"
    );

    const links = document.querySelectorAll('.navbar a[href^="#"]');

    if (!sections.length || !links.length) return;

    function updateActiveLink() {
        const marker = window.scrollY + 140;
        let activeId = "home";

        sections.forEach((section) => {
            if (section.offsetTop <= marker) {
                activeId = section.id;
            }
        });

        links.forEach((link) => {
            const isActive =
                link.getAttribute("href") === `#${activeId}`;

            if (isActive) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    window.addEventListener("scroll", updateActiveLink, {
        passive: true
    });

    window.addEventListener("resize", updateActiveLink);

    updateActiveLink();
}


/* ========================================
   6. TYPING EFFECT
======================================== */

function initTypingEffect() {
    const heading = document.querySelector(".hero h2");

    if (!heading) return;

    const originalText = heading.textContent.trim();

    if (!originalText) return;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // Keep the original heading for accessibility and reduced motion.
    if (reducedMotion) return;

    // Avoid starting the animation more than once.
    if (heading.dataset.typingInitialized === "true") return;

    heading.dataset.typingInitialized = "true";

    heading.textContent = "";
    heading.setAttribute("aria-label", originalText);

    const cursor = document.createElement("span");

    cursor.className = "typing-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.textContent = "|";

    const cursorStyles = document.createElement("style");

    cursorStyles.textContent = `
        .typing-cursor {
            display: inline-block;
            margin-left: 5px;
            color: #ff263f;
            animation: typingBlink 0.8s steps(2, start) infinite;
        }

        @keyframes typingBlink {
            to {
                visibility: hidden;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .typing-cursor {
                animation: none;
            }
        }
    `;

    document.head.appendChild(cursorStyles);
    heading.appendChild(cursor);

    let index = 0;

    function typeNextCharacter() {
        if (index < originalText.length) {
            cursor.before(
                document.createTextNode(originalText.charAt(index))
            );

            index++;

            window.setTimeout(typeNextCharacter, 65);
        } else {
            // Keep the blinking cursor after typing is complete.
            cursor.style.animation = "typingBlink 0.8s steps(2, start) infinite";
        }
    }

    window.setTimeout(typeNextCharacter, 500);
}


/* ========================================
   7. AUTOMATIC COPYRIGHT YEAR
======================================== */

function initCurrentYear() {
    const footerParagraphs = document.querySelectorAll(".footer p");

    footerParagraphs.forEach((paragraph) => {
        if (!paragraph.textContent.includes("ALL RIGHTS RESERVED")) {
            return;
        }

        paragraph.textContent = paragraph.textContent.replace(
            /©\s*\d{4}/,
            `© ${new Date().getFullYear()}`
        );
    });
}
/* ========================================
   SKILLS PROGRESS BARS
======================================== */

function initSkillProgress() {
    const skills = document.querySelectorAll(".skill-card");

    const skillData = [
        { name: "HTML", level: "در حال یادگیری", progress: 35 },
        { name: "CSS", level: "در حال یادگیری", progress: 25 },
        { name: "JavaScript", level: "در حال یادگیری", progress: 10 }
    ];

    skills.forEach((card, index) => {
        const skill = skillData[index];

        if (!skill || card.querySelector(".skill-bar")) return;

        const level = document.createElement("p");
        level.className = "skill-level";
        level.textContent = skill.level;

        const bar = document.createElement("div");
        bar.className = "skill-bar";
        bar.setAttribute("role", "progressbar");
        bar.setAttribute("aria-label", `${skill.name} learning progress`);
        bar.setAttribute("aria-valuemin", "0");
        bar.setAttribute("aria-valuemax", "100");
        bar.setAttribute("aria-valuenow", String(skill.progress));

        const progress = document.createElement("div");
        progress.className = "skill-progress";
        progress.style.setProperty("--skill-width", `${skill.progress}%`);

        bar.appendChild(progress);
        card.append(level, bar);

        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        progress.classList.add("is-visible");
                        observer.unobserve(card);
                    }
                });
            }, { threshold: 0.3 });

            observer.observe(card);
        } else {
            progress.classList.add("is-visible");
        }
    });
}

initSkillProgress();
/* ========================================
   GLITCH NAME INITIALIZATION
======================================== */

function initGlitchName() {
    const name = document.querySelector(".hero h1 span");

    if (!name) return;

    name.setAttribute("data-text", name.textContent.trim());
}

initGlitchName();

/* =========================================
   SKILLS PROGRESS ANIMATION
========================================= */

function animateSkillBars() {
    const bars = document.querySelectorAll(
        ".skills-section .skill-progress"
    );

    if (!bars.length) return;

    if (!("IntersectionObserver" in window)) {
        bars.forEach((bar) => {
            bar.classList.add("is-visible");
        });

        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.25
        }
    );

    bars.forEach((bar) => {
        observer.observe(bar);
    });
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        animateSkillBars,
        { once: true }
    );
} else {
    animateSkillBars();
}