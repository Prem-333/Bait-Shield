document.addEventListener('DOMContentLoaded', () => {

    // --- INTERSECTION OBSERVER FOR SCROLL ANIMATIONS ---
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.animate-on-scroll').forEach(el => scrollObserver.observe(el));

    // --- FAQ ACCORDION LOGIC ---
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const answer = button.nextElementSibling;
            const item = button.closest('.faq-item');
            button.classList.toggle('active');
            if (item) item.classList.toggle('active');

            if (button.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = '0px';
            }
        });
    });

    // --- 3D CARD INTERACTIVITY (FOR "HOW IT WORKS" SECTION) ---
    function apply3DInteraction(cardSelector) {
        const cards = document.querySelectorAll(cardSelector);
        cards.forEach(card => {
            const glow = card.querySelector('.process-card-glow');
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const rotateY = -1 * ((x - rect.width / 2) / (rect.width / 2)) * 8;
                const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * 8;

                card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                if (glow) {
                    glow.style.setProperty('--mouse-x', `${x}px`);
                    glow.style.setProperty('--mouse-y', `${y}px`);
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'rotateX(0deg) rotateY(0deg)';
            });
        });
    }
    apply3DInteraction('.process-card-container');


    // --- INTERACTIVE HERO CANVAS ANIMATION ---
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let particlesArray;
        const mouse = { x: null, y: null, radius: 150 };
        
        window.addEventListener('mousemove', e => { mouse.x = e.x; mouse.y = e.y; });

        class Particle {
            constructor(x, y, dX, dY, s) { this.x = x; this.y = y; this.dX = dX; this.dY = dY; this.s = s; }
            draw() {
                ctx.beginPath(); ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 235, 194, 0.1)'; ctx.fill();
            }
            update() {
                if (this.x > canvas.width || this.x < 0) { this.dX = -this.dX; }
                if (this.y > canvas.height || this.y < 0) { this.dY = -this.dY; }
                this.x += this.dX; this.y += this.dY; this.draw();
            }
        }
        function init() {
            particlesArray = [];
            let num = (canvas.height * canvas.width) / 9000;
            for (let i = 0; i < num; i++) {
                let s = (Math.random() * 5) + 1;
                let x = Math.random() * (innerWidth - s * 2) + s * 2;
                let y = Math.random() * (innerHeight - s * 2) + s * 2;
                let dX = (Math.random() * 0.4) - 0.2;
                let dY = (Math.random() * 0.4) - 0.2;
                particlesArray.push(new Particle(x, y, dX, dY, s));
            }
        }
        function connect() {
            if(!particlesArray) return;
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let dist = ((particlesArray[a].x - particlesArray[b].x) ** 2) + ((particlesArray[a].y - particlesArray[b].y) ** 2);
                    if (dist < (canvas.width / 7) * (canvas.height / 7)) {
                        let opacity = 1 - (dist / 20000);
                        let dx = mouse.x - particlesArray[a].x;
                        let dy = mouse.y - particlesArray[a].y;
                        if(mouse.x === null) continue;
                        let mouseDist = Math.sqrt(dx * dx + dy * dy);
                        if (mouseDist < mouse.radius) {
                             ctx.strokeStyle = `rgba(0, 235, 194, ${opacity})`;
                        } else {
                             ctx.strokeStyle = `rgba(0, 235, 194, ${opacity / 4})`;
                        }
                        ctx.lineWidth = 1; ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y); ctx.stroke();
                    }
                }
            }
        }
        function animate() {
            requestAnimationFrame(animate); 
            if(!ctx) return;
            ctx.clearRect(0, 0, innerWidth, innerHeight);
            if (particlesArray) {
                for (let p of particlesArray) { p.update(); }
                connect();
            }
        }
        window.addEventListener('resize', () => { 
            if(canvas){
                canvas.width = innerWidth; 
                canvas.height = innerHeight; 
                init(); 
            }
        });
        window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
        init();
        animate();
    }

    // --- DYNAMIC NUMBER COUNTER & GRAPH ANIMATION ---
    const impactSectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                const counters = entry.target.querySelectorAll('.impact-number');
                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    const prefix = counter.getAttribute('data-prefix') || '';
                    const suffix = counter.getAttribute('data-suffix') || '';
                    const isDecimal = target % 1 !== 0;
                    
                    let current = 0;
                    const increment = target / 150;

                    const updateCounter = () => {
                        current += increment;

                        if (current < target) {
                            const displayValue = isDecimal ? current.toFixed(1) : Math.ceil(current);
                            counter.innerText = prefix + displayValue;
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.innerText = prefix + target + suffix;
                        }
                    };
                    updateCounter();
                });

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const impactSection = document.getElementById('impact-section');
    if (impactSection) {
        impactSectionObserver.observe(impactSection);
    }
});