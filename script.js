/* ===================================
   VALENTINE'S WEBSITE — SCRIPT
   =================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ========== STATE ==========
    let rosesAnswer = null;   // stored integer from roses question

    // ========== ELEMENTS ==========
    const gates = {
        gate1: document.getElementById('gate1'),
        gate2: document.getElementById('gate2'),
        gate3: document.getElementById('gate3'),
    };

    // ========== ROSE GALLERY REVEAL ==========
    const roses = document.querySelectorAll('.rose');
    roses.forEach((rose, i) => {
        setTimeout(() => rose.classList.add('visible'), 400 + i * 350);
    });

    // ========== FADE-IN OBSERVER ==========
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

    // ========== PARALLAX ==========
    let mouseX = 0.5, mouseY = 0.5, currentX = 0.5, currentY = 0.5;
    // Also track absolute mouse position for the No button force field
    let absMouseX = 0, absMouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
        absMouseX = e.clientX;
        absMouseY = e.clientY;
    });

    function animateParallax() {
        currentX += (mouseX - currentX) * 0.03;
        currentY += (mouseY - currentY) * 0.03;
        const offsetX = (currentX - 0.5) * 20;
        const offsetY = (currentY - 0.5) * 15;
        roses.forEach((rose, i) => {
            const depth = 0.5 + (i % 3) * 0.3;
            rose.style.translate = `${offsetX * depth}px ${offsetY * depth}px`;
        });
        requestAnimationFrame(animateParallax);
    }
    if (!('ontouchstart' in window)) animateParallax();

    // ========== SCROLL GATING SYSTEM ==========
    // Hide everything below a gate until it is "opened"
    // We do this by setting a max-height on gated sections
    function openGate(gateId) {
        const gate = gates[gateId];
        if (gate) gate.classList.add('open');
        // Reveal the next gated section
        const next = gate?.nextElementSibling;
        if (next && next.classList.contains('gated-section')) {
            next.classList.add('unlocked');
            next.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
        }
        // Gate3 also unlocks the final section
        if (gateId === 'gate3') {
            const finalSec = document.getElementById('finalSection');
            if (finalSec) {
                finalSec.classList.add('unlocked');
                finalSec.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
            }
        }
    }

    // ========== SECTION 2: QUIZ GRID ==========
    const positiveWords = [
        'Beautiful', 'Gorgeous', 'Smart', 'Kind', 'Funny',
        'Caring', 'Creative', 'Brave', 'Charming', 'Radiant',
        'Loving', 'Brilliant', 'Graceful', 'Stunning', 'Adorable',
        'Sweet', 'Talented', 'Wonderful', 'Amazing', 'Perfect'
    ];
    const negativeWords = ['Fat', 'Ugly', 'Disgusting', 'Boring', 'Annoying'];

    const allWords = [
        ...positiveWords.map(w => ({ text: w, type: 'positive' })),
        ...negativeWords.map(w => ({ text: w, type: 'negative' }))
    ];
    // Fisher-Yates shuffle
    for (let i = allWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allWords[i], allWords[j]] = [allWords[j], allWords[i]];
    }

    const grid = document.getElementById('quizGrid');
    const quizLabel = document.getElementById('quizCompleteLabel');
    let positiveSelected = 0;
    const totalPositive = positiveWords.length;

    allWords.forEach((word, index) => {
        const btn = document.createElement('button');
        btn.className = `quiz-btn quiz-btn--${word.type}`;
        btn.textContent = word.text;
        btn.style.animationDelay = `${0.03 * index}s`;

        btn.addEventListener('click', () => {
            if (word.type === 'positive') {
                if (btn.classList.contains('selected')) return;
                btn.classList.add('selected');
                btn.style.pointerEvents = 'none';
                positiveSelected++;
                if (positiveSelected >= totalPositive) {
                    quizLabel.classList.add('visible');
                    openGate('gate1');
                }
            } else {
                btn.classList.add('rejected');
                btn.addEventListener('animationend', () => {
                    btn.classList.remove('rejected');
                }, { once: true });
            }
        });

        grid.appendChild(btn);
    });

    // Staggered button reveal
    const quizBtns = document.querySelectorAll('.quiz-btn');
    const gridObserver = new IntersectionObserver(
        (entries) => entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                gridObserver.unobserve(entry.target);
            }
        }),
        { threshold: 0.1 }
    );
    quizBtns.forEach((btn) => gridObserver.observe(btn));

    // ========== SECTION 3: ROSES INPUT ==========
    const rosesInput = document.getElementById('rosesInput');
    const rosesError = document.getElementById('rosesError');
    const rosesLockBtn = document.getElementById('rosesLockBtn');
    const bouquetContainer = document.getElementById('bouquetContainer');

    // SVG for a single rose — actually a CSS div-based rose
    function createRoseHTML() {
        return `<div class="css-rose">
            <div class="css-thorns">
                <div></div><div></div><div></div><div></div>
            </div>
            <div class="css-stem"><div></div></div>
            <div class="css-petals">
                <div></div><div></div><div></div><div></div><div></div><div></div><div></div>
            </div>
        </div>`;
    }

    function buildBouquet(count) {
        bouquetContainer.innerHTML = '';
        const capped = Math.min(count, 100);

        // Determine sizing based on count
        let roseScale, roseWidth;
        if (capped <= 5) { roseScale = 1.2; roseWidth = 120; }
        else if (capped <= 15) { roseScale = 0.9; roseWidth = 90; }
        else if (capped <= 30) { roseScale = 0.7; roseWidth = 70; }
        else if (capped <= 60) { roseScale = 0.5; roseWidth = 50; }
        else { roseScale = 0.38; roseWidth = 38; }

        // Build rings from center outward
        // Ring 0: 1 rose (center), Ring 1: ~6, Ring 2: ~12, Ring 3: ~18...
        let placed = 0;
        let ring = 0;
        const roseElements = [];

        while (placed < capped) {
            const rosesInRing = ring === 0 ? 1 : Math.floor(ring * 6);
            const ringCount = Math.min(rosesInRing, capped - placed);

            for (let i = 0; i < ringCount; i++) {
                const angle = ring === 0
                    ? 0
                    : (i / rosesInRing) * Math.PI * 2 + (ring * 0.3); // offset each ring

                const radius = ring * (roseWidth * 0.55);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius * 0.4; // squish vertically for bouquet look

                // Higher rings go behind (lower z) and higher up
                const zIndex = 20 - ring;
                const yOffset = -ring * (roseWidth * 0.15);

                // Slight random rotation for natural look
                const rot = (Math.random() - 0.5) * 25 - 5; // slight lean

                roseElements.push({ x, y: y + yOffset, zIndex, rot, scale: roseScale, delay: placed * 30 });
                placed++;
            }
            ring++;
        }

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'bouquet-wrapper';

        roseElements.forEach((r, idx) => {
            const el = document.createElement('div');
            el.className = 'bouquet-rose';
            el.innerHTML = createRoseHTML();
            el.style.cssText = `
                position: absolute;
                left: 50%;
                top: 50%;
                z-index: ${r.zIndex};
                transform: translate(calc(-50% + ${r.x}px), calc(-50% + ${r.y}px)) rotate(${r.rot}deg) scale(${r.scale});
                opacity: 0;
                animation: bouquetRoseIn 0.4s ease-out ${r.delay}ms forwards;
            `;
            wrapper.appendChild(el);
        });

        bouquetContainer.appendChild(wrapper);
        bouquetContainer.classList.add('visible');
    }

    // Filter input to digits only
    rosesInput.addEventListener('input', () => {
        rosesInput.value = rosesInput.value.replace(/[^0-9]/g, '');
        rosesError.textContent = '';
        rosesError.classList.remove('visible');
    });

    rosesLockBtn.addEventListener('click', () => {
        if (rosesLockBtn.classList.contains('locked')) return;

        const val = parseInt(rosesInput.value, 10);
        if (!rosesInput.value || isNaN(val) || val <= 0) {
            rosesError.textContent = val === 0 ? 'Zero? Really? Try again!' : 'Please enter a valid number!';
            rosesError.classList.add('visible');
            rosesInput.classList.add('input-shake');
            rosesInput.addEventListener('animationend', () => rosesInput.classList.remove('input-shake'), { once: true });
            return;
        }

        rosesAnswer = val;
        rosesLockBtn.classList.add('locked');
        rosesLockBtn.textContent = `Locked in: ${val} rose${val > 1 ? 's' : ''}`;
        rosesInput.disabled = true;

        // Build the bouquet!
        buildBouquet(val);

        openGate('gate2');
    });

    // ========== SECTION 4: FAVORITE PART ==========
    const favInput = document.getElementById('favInput');
    const favLockBtn = document.getElementById('favLockBtn');
    const wrongOverlay = document.getElementById('wrongOverlay');
    const wrongDismiss = document.getElementById('wrongDismiss');

    favLockBtn.addEventListener('click', () => {
        if (favLockBtn.classList.contains('locked')) return;
        if (!favInput.value.trim()) {
            favInput.classList.add('input-shake');
            favInput.addEventListener('animationend', () => favInput.classList.remove('input-shake'), { once: true });
            return;
        }

        favLockBtn.classList.add('locked');
        favLockBtn.textContent = 'Locked in!';
        favInput.disabled = true;

        // Show WRONG popup
        setTimeout(() => {
            wrongOverlay.classList.add('visible');
        }, 300);
    });

    wrongDismiss.addEventListener('click', () => {
        wrongOverlay.classList.remove('visible');
        openGate('gate3');
    });

    // ========== SECTION 6: YES / NO BUTTONS ==========
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');
    const videoContainer = document.getElementById('videoContainer');
    const videoPlayer = document.getElementById('videoPlayer');
    const confettiCanvas = document.getElementById('confettiCanvas');

    // Heart particles on Yes hover
    let heartInterval = null;
    btnYes.addEventListener('mouseenter', () => {
        heartInterval = setInterval(() => spawnHeart(btnYes), 100);
    });
    btnYes.addEventListener('mouseleave', () => {
        clearInterval(heartInterval);
    });

    function spawnHeart(anchor) {
        const heart = document.createElement('span');
        heart.className = 'floating-heart';
        heart.textContent = ['❤️', '💕', '💗', '💖', '💘'][Math.floor(Math.random() * 5)];
        const rect = anchor.getBoundingClientRect();
        heart.style.left = (rect.left + Math.random() * rect.width) + 'px';
        heart.style.top = (rect.top + window.scrollY - 10) + 'px';
        heart.style.setProperty('--drift', (Math.random() - 0.5) * 80 + 'px');
        document.body.appendChild(heart);
        heart.addEventListener('animationend', () => heart.remove());
    }

    // YES CLICK → confetti + video
    btnYes.addEventListener('click', () => {
        btnYes.classList.add('pressed');
        btnNo.style.display = 'none';
        launchConfetti();
        // Show video
        videoContainer.classList.add('visible');
        videoPlayer.src = 'https://www.youtube.com/embed/d1NjkYjRn34?autoplay=1&loop=1&playlist=d1NjkYjRn34';
    });

    // NO BUTTON FORCE FIELD
    let noAnimFrame = null;
    function repelNoButton() {
        if (btnNo.style.display === 'none') {
            cancelAnimationFrame(noAnimFrame);
            return;
        }
        const rect = btnNo.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;
        const dx = btnCenterX - absMouseX;
        const dy = btnCenterY - absMouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const forceRadius = 180;

        if (dist < forceRadius && dist > 0) {
            const force = (forceRadius - dist) / forceRadius;
            const pushX = (dx / dist) * force * 60;
            const pushY = (dy / dist) * force * 60;
            // Get current translate values
            const style = window.getComputedStyle(btnNo);
            const matrix = new DOMMatrix(style.transform);
            const curX = matrix.m41;
            const curY = matrix.m42;
            btnNo.style.transform = `translate(${curX + pushX}px, ${curY + pushY}px)`;
        }

        noAnimFrame = requestAnimationFrame(repelNoButton);
    }
    // Start force field when final section is in view
    const finalObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                repelNoButton();
                finalObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    finalObserver.observe(document.getElementById('finalSection'));

    // ========== CONFETTI ==========
    function launchConfetti() {
        const canvas = confettiCanvas;
        canvas.classList.add('active');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        const particles = [];
        const colors = ['#c93555', '#e8899a', '#ffd6de', '#d4556a', '#b83a52', '#ff6b8a', '#ffb6c1', '#fff5f5', '#ffc0cb', '#ff1493'];

        function createParticle() {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * -canvas.height,
                w: Math.random() * 10 + 5,
                h: Math.random() * 6 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 3 + 2,
                rot: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 10,
            };
        }

        for (let i = 0; i < 300; i++) {
            particles.push(createParticle());
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.04;
                p.rot += p.rotSpeed;

                // Reset particle when it falls off screen
                if (p.y > canvas.height + 20) {
                    particles[i] = createParticle();
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rot * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            });
            requestAnimationFrame(draw);
        }
        draw();
    }
});