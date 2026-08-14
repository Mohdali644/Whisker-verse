"use strict";

// Hoisted globals to fix scoping errors found later in the file
let meowSound: HTMLAudioElement | null = null;
let toastContainer: HTMLElement | null = null;

/*
 * WHISKERVERSE - ULTRA LOGIC ENGINE
 * Features: Web Speech API, Clipboard API, Custom Confetti, Dynamic Quiz, Beast Modes
 */
document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. GLOBAL UTILITIES & NOTIFICATIONS
    // ==========================================
    const themeToggle = document.getElementById("themeToggle") as HTMLInputElement | null;
    meowSound = document.getElementById("meowSound") as HTMLAudioElement | null;
    toastContainer = document.getElementById("toastContainer") as HTMLElement | null;

    // CORRECTED Theme Switcher
    if (themeToggle) {
        if (localStorage.getItem('whiskerverse_theme') === 'light') {
            document.body.classList.remove('dark');
            themeToggle.checked = false;
        } else {
            document.body.classList.add('dark');
            themeToggle.checked = true;
        }

        themeToggle.addEventListener("change", function (this: HTMLInputElement) {
            if (this.checked) {
                document.body.classList.add("dark");
                localStorage.setItem('whiskerverse_theme', 'dark');
            } else {
                document.body.classList.remove("dark");
                localStorage.setItem('whiskerverse_theme', 'light');
            }
        });
    }

    // Scroll Reveal Observer
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-reveal').forEach(el => revealObserver.observe(el));

    // Toast Notification System
    function showToast(message: string, icon: string = "fa-info-circle"): void {
        if (!toastContainer) return;
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerHTML = `<i class="fas ${icon} highlight"></i> ${message}`;
        toastContainer.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add("show"));

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // Confetti Physics Engine
    function triggerConfetti(): void {
        const colors: string[] = ['#06b6d4', '#f43f5e', '#8b5cf6', '#ec4899', '#fcd34d'];
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.animationDelay = Math.random() * 1 + 's';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 6000);
        }
    }

    const generateBtn = document.getElementById("generateBtn") as HTMLButtonElement | null;
    const factCard = document.getElementById("factCard") as HTMLElement | null;
    const factText = document.getElementById("factText") as HTMLElement | null;
    const catImage = document.getElementById("catImage") as HTMLImageElement | null;
    const saveBtn = document.getElementById("saveBtn") as HTMLButtonElement | null;
    const copyBtn = document.getElementById("copyBtn") as HTMLButtonElement | null;
    const speakBtn = document.getElementById("speakBtn") as HTMLButtonElement | null;
    const meowBtn = document.getElementById("meowBtn") as HTMLButtonElement | null;
    const shareBtn = document.getElementById("shareBtn") as HTMLButtonElement | null;

    const FACT_API: string = "https://catfact.ninja/fact";
    const IMAGE_API: string = "https://api.thecatapi.com/v1/images/search";

    let currentFact: string = "";

    if (generateBtn) {
        generateBtn.addEventListener("click", async () => {
            if (!generateBtn || !factText || !catImage || !factCard || !saveBtn) return;
            
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Initializing...';
            generateBtn.disabled = true;
            window.speechSynthesis.cancel();

            try {
                const [factRes, imgRes] = await Promise.all([fetch(FACT_API), fetch(IMAGE_API)]);
                const factData = await factRes.json();
                const imgData = await imgRes.json();

                currentFact = factData.fact;
                factText.textContent = currentFact; 
                
                if (catImage.previousElementSibling instanceof HTMLElement) {
                    catImage.previousElementSibling.style.display = 'block';
                }
                
                catImage.src = imgData[0].url;
                factCard.classList.remove("hidden");
                
                generateBtn.innerHTML = '<i class="fas fa-bolt"></i> Generate Another';
                saveBtn.innerHTML = '<i class="fas fa-heart"></i> Save';
                saveBtn.disabled = false;

            } catch (error) {
                factText.textContent = "Connection lost. The cats are sleeping.";
                generateBtn.innerHTML = '<i class="fas fa-redo"></i> Retry';
            } finally {
                generateBtn.disabled = false;
            }
        });
    }

    // Copy, Speak, Meow, Share
    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            if (!currentFact) return;
            navigator.clipboard.writeText(currentFact).then(() => {
                showToast("Fact copied to clipboard!", "fa-check-circle");
            });
        });
    }

    if (speakBtn) {
        speakBtn.addEventListener("click", () => {
            if (!currentFact) return;
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(currentFact);
            utterance.rate = 1.0;
            utterance.pitch = 1.1;
            window.speechSynthesis.speak(utterance);
        });
    }

    if (meowBtn) {
        meowBtn.addEventListener("click", () => { 
            if (meowSound) {
                meowSound.currentTime = 0; 
                meowSound.play(); 
            }
        });
    }

    if (shareBtn) {
        shareBtn.addEventListener("click", () => {
            if (!currentFact) return;
            const textToShare = encodeURIComponent(`I just learned a new cat fact on Whiskerverse: "${currentFact}" 🐾 #Cats #Whiskerverse`);
            window.open(`https://twitter.com/intent/tweet?text=${textToShare}`, '_blank', 'width=550,height=420');
        });
    }

    const savedFactsContainer = document.getElementById("savedFacts") as HTMLElement | null;
    const exportBtn = document.getElementById("exportBtn") as HTMLButtonElement | null;

    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            if (!currentFact) return;
            
            let saved: string[] = JSON.parse(localStorage.getItem("catFacts") || "[]");
            
            if (!saved.includes(currentFact)) {
                saved.push(currentFact);
                localStorage.setItem("catFacts", JSON.stringify(saved));
                
                saveBtn.innerHTML = '<i class="fas fa-check"></i> Secured';
                saveBtn.disabled = true;
                showToast("Saved to your Knowledge Vault", "fa-bookmark");
                renderSavedFacts();
            } else {
                showToast("You already saved this fact!", "fa-exclamation-circle");
            }
        });
    }

    function renderSavedFacts(): void {
        if (!savedFactsContainer) return;
        
        const saved: string[] = JSON.parse(localStorage.getItem("catFacts") || "[]");
        savedFactsContainer.innerHTML = "";
        
        if (saved.length === 0) return;
        
        saved.forEach((fact, index) => {
            const div = document.createElement("div");
            div.className = "saved-item scroll-reveal visible"; 
            div.innerHTML = `<p>${fact}</p><button class="delete-fact" data-index="${index}"><i class="fas fa-trash"></i></button>`;
            savedFactsContainer.appendChild(div);
        });

        document.querySelectorAll('.delete-fact').forEach(btn => {
            btn.addEventListener('click', (e: Event) => {
                const target = e.currentTarget as HTMLButtonElement;
                const indexStr = target.getAttribute('data-index');
                
                if (indexStr !== null) {
                    const index = parseInt(indexStr, 10);
                    let saved: string[] = JSON.parse(localStorage.getItem("catFacts") || "[]");
                    saved.splice(index, 1);
                    localStorage.setItem("catFacts", JSON.stringify(saved));
                    showToast("Fact removed from vault", "fa-trash-alt");
                    renderSavedFacts();
                }
            });
        });
    }

    renderSavedFacts();

    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            let saved: string[] = JSON.parse(localStorage.getItem("catFacts") || "[]");
            
            if (saved.length === 0) {
                showToast("Your Vault is empty!", "fa-box-open");
                return;
            }
            
            let fileContent = "🐱 MY WHISKERVERSE KNOWLEDGE VAULT 🐱\n\n";
            saved.forEach((fact, index) => { fileContent += `${index + 1}. ${fact}\n`; });
            
            const blob = new Blob([fileContent], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Whiskerverse_Vault.txt";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast("Vault exported successfully!", "fa-check-circle");
        });
    }

    // ==========================================
    // 4. DYNAMIC RANDOMIZED QUIZ ENGINE
    // ==========================================
    interface QuizQuestion {
        q: string;
        options: string[];
        a: number;
    }

    const masterQuizBank: QuizQuestion[] = [
        { q: "How many toes does a cat usually have on its front paws?", options: ["4", "5", "6", "7"], a: 1 },
        { q: "What is a group of cats called?", options: ["A pack", "A clowder", "A herd", "A flock"], a: 1 },
        { q: "Which sense is most highly developed in cats?", options: ["Sight", "Taste", "Smell", "Hearing"], a: 3 },
        { q: "How much of their lives do cats spend sleeping?", options: ["30%", "50%", "70%", "90%"], a: 2 },
        { q: "What is the only continent without native wild cat species?", options: ["Europe", "Australia", "South America", "Africa"], a: 1 },
        { q: "What is the largest breed of domestic cat?", options: ["Persian", "Sphynx", "Maine Coon", "Bengal"], a: 2 },
        { q: "Cats cannot taste which of the following?", options: ["Sour", "Sweet", "Salty", "Bitter"], a: 1 },
        { q: "What is a cat's primary way of communicating with humans?", options: ["Tail wagging", "Blinking", "Meowing", "Purring"], a: 2 },
        { q: "How fast can an average domestic cat run?", options: ["10 mph", "20 mph", "30 mph", "40 mph"], a: 2 },
        { q: "What is the specialized sensory organ on the roof of a cat's mouth?", options: ["Jacobson's organ", "Feline radar", "Whiskers", "Olfactory bulb"], a: 0 }
    ];

    let activeQuizData: QuizQuestion[] = [];
    let currentQuestionIndex: number = 0;
    let score: number = 0;

    const startQuizBtn = document.getElementById("startQuizBtn") as HTMLButtonElement | null;
    const quizIntro = document.getElementById("quizIntro") as HTMLElement | null;
    const quizEngine = document.getElementById("quizEngine") as HTMLElement | null;
    const quizResults = document.getElementById("quizResults") as HTMLElement | null;
    const questionText = document.getElementById("questionText") as HTMLElement | null;
    const optionsGrid = document.getElementById("optionsGrid") as HTMLElement | null;
    const quizProgress = document.getElementById("quizProgress") as HTMLElement | null;
    const scoreText = document.getElementById("scoreText") as HTMLElement | null;
    const restartQuizBtn = document.getElementById("restartQuizBtn") as HTMLButtonElement | null;

    function shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    if (startQuizBtn) {
        startQuizBtn.addEventListener("click", () => {
            if (!quizIntro || !quizEngine) return;
            activeQuizData = shuffleArray([...masterQuizBank]).slice(0, 5);
            quizIntro.classList.add("hidden");
            quizEngine.classList.remove("hidden");
            currentQuestionIndex = 0;
            score = 0;
            loadQuestion();
        });
    }

    function loadQuestion(): void {
        if (!questionText || !optionsGrid || !quizProgress) return;

        const currentQ = activeQuizData[currentQuestionIndex];
        
        questionText.style.animation = 'none';
        void questionText.offsetHeight; 
        questionText.style.animation = ''; // Fixes the "null is not assignable to string" error
        questionText.innerText = currentQ.q;
        
        optionsGrid.innerHTML = "";
        
        const progressPercent = ((currentQuestionIndex) / activeQuizData.length) * 100;
        quizProgress.style.width = `${progressPercent}%`;
        
        currentQ.options.forEach((option, index) => {
            const btn = document.createElement("button");
            btn.className = "option-btn";
            btn.innerText = option;
            btn.style.animation = `fadeUpIn 0.5s ease forwards ${index * 0.1}s`;
            btn.style.opacity = "0";
            
            btn.addEventListener("click", () => handleAnswer(index, btn));
            optionsGrid.appendChild(btn);
        });
    }

    function handleAnswer(selectedIndex: number, btnElement: HTMLButtonElement): void {
        if (!optionsGrid) return;

        const currentQ = activeQuizData[currentQuestionIndex];
        const allBtns = optionsGrid.querySelectorAll('.option-btn') as NodeListOf<HTMLButtonElement>;
        
        allBtns.forEach(btn => btn.disabled = true);
        
        if (selectedIndex === currentQ.a) {
            btnElement.classList.add("correct");
            score++;
            if (meowSound) {
                meowSound.currentTime = 0;
                meowSound.play();
            }
        } else {
            btnElement.classList.add("wrong");
            allBtns[currentQ.a].classList.add("correct");
        }
        
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < activeQuizData.length) {
                loadQuestion();
            } else {
                showResults();
            }
        }, 1200);
    }

    function showResults(): void {
        if (!quizEngine || !quizResults || !quizProgress || !scoreText) return;

        quizEngine.classList.add("hidden");
        quizResults.classList.remove("hidden");
        quizProgress.style.width = "100%";
        
        let message = "";
        if (score === activeQuizData.length) {
            message = "Legendary! You are a feline master! 👑";
            triggerConfetti();
            document.body.classList.add('earthquake');
            setTimeout(() => document.body.classList.remove('earthquake'), 600);
        } else if (score > 2) {
            message = "Great job! Your cat knowledge is strong. ⚡";
        } else {
            message = "Time to study the Knowledge Vault! 📚";
        }
        
        scoreText.innerHTML = `You scored <span class="highlight">${score}</span> out of ${activeQuizData.length}.<br><br><span style="font-size:1.2rem; color:var(--text-muted);">${message}</span>`;
    }

    if (restartQuizBtn) {
        restartQuizBtn.addEventListener("click", () => {
            if (!quizResults || !quizIntro || !quizProgress) return;
            quizResults.classList.add("hidden");
            quizIntro.classList.remove("hidden");
            quizProgress.style.width = "0%";
        });
    }

    // --- 1. Dynamic Typewriter Engine ---
    let typingInterval: number | ReturnType<typeof setInterval>;
    let expectedText: string = "";
    
    const factObserver = new MutationObserver(() => {
        if (!factText) return;
        const actualText = factText.textContent;
        
        if (actualText === expectedText || actualText === "") return;
        
        const textToType = actualText || "";
        if (typingInterval) clearInterval(typingInterval as number);
        
        let i = 0;
        expectedText = "";
        factText.textContent = "";
        factText.style.borderRight = "3px solid var(--primary)";
        factText.style.paddingRight = "5px";
        
        typingInterval = setInterval(() => {
            expectedText += textToType.charAt(i);
            factText.textContent = expectedText;
            i++;
            if (i >= textToType.length) {
                clearInterval(typingInterval as number);
                factText.style.borderRight = "none";
            }
        }, 35);
    });

    if (factText) {
        factObserver.observe(factText, { childList: true, characterData: true, subtree: true });
    }

    // --- 2. Magic Mouse Trail (Updated for Theme Awareness) ---
    document.addEventListener('mousemove', (e: MouseEvent) => {
        if (Math.random() > 0.85) {
            const star = document.createElement('i');
            star.className = 'fas fa-star';
            const isDark = document.body.classList.contains('dark');
            
            const colors = isDark
                ? ['#06b6d4', '#f43f5e', '#8b5cf6', '#ec4899', '#fcd34d'] 
                : ['#6d28d9', '#be123c', '#1d4ed8', '#b45309', '#0f766e']; 
                
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            Object.assign(star.style, {
                position: 'fixed', left: e.clientX + 'px', top: e.clientY + 'px',
                color: randomColor, fontSize: (Math.random() * 12 + 6) + 'px',
                pointerEvents: 'none', zIndex: '9999', opacity: '1',
                transform: 'translate(-50%, -50%) scale(1)', transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)'
            });
            
            document.body.appendChild(star);
            setTimeout(() => {
                star.style.transform = `translate(-50%, ${Math.random() * 50 + 30}px) scale(0)`;
                star.style.opacity = '0';
            }, 10);
            setTimeout(() => star.remove(), 1000);
        }
    });

    // --- 3. Custom Energy Cursor ---
    const cursor = document.createElement('div');
    cursor.className = 'energy-cursor';
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e: MouseEvent) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
    document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));

    // --- 6. Idle "Cat Nap" Screensaver ---
    const sleepOverlay = document.createElement('div');
    sleepOverlay.className = 'sleep-overlay';
    sleepOverlay.innerHTML = '<div class="sleep-text">Zzz...</div>';
    document.body.appendChild(sleepOverlay);
    
    let idleTimer: number | ReturnType<typeof setTimeout>;
    
    const resetIdleTimer = () => {
        sleepOverlay.classList.remove('active');
        clearTimeout(idleTimer as number);
        idleTimer = setTimeout(() => {
            sleepOverlay.classList.add('active');
        }, 20000);
    };
    
    ['mousemove', 'keydown', 'scroll', 'click'].forEach(evt => document.addEventListener(evt, resetIdleTimer));
    resetIdleTimer();
});

// --- 1. Cinematic Preloader Logic ---
const loader = document.getElementById('ultra-loader') as HTMLElement | null;
if (loader) {
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
    }, 2200); 
}

// --- 2. Magnetic "Liquid" Buttons ---
const magneticButtons = document.querySelectorAll('.ultra-btn, .action-btn, .option-btn') as NodeListOf<HTMLElement>;
magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = btn.getBoundingClientRect();
        const h = rect.width / 2;
        const v = rect.height / 2;
        const x = e.clientX - rect.left - h;
        const y = e.clientY - rect.top - v;
        btn.style.transform = `translate(${x / 4}px, ${y / 4}px) scale(1.05)`;
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = `translate(0px, 0px) scale(1)`;
        btn.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    });

    btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'none'; 
    });
});

// --- 3. Dynamic Spotlight Hover ---
const glassCardsForSpotlight = document.querySelectorAll('.glass-card') as NodeListOf<HTMLElement>;
glassCardsForSpotlight.forEach(card => {
    card.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);
    });
});









// --- FEATURE B: THE ULTIMATE BEAST AI MOUSE (PREMIUM INTERNET ICON) ---
const existingMouse = document.querySelector('.rogue-mouse') as HTMLElement | null;
if (existingMouse) existingMouse.remove();

const rogueMouse = document.createElement("div");
rogueMouse.className = "rogue-mouse";
rogueMouse.innerHTML = `
    <img src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f401.svg" class="beast-mouse-icon" alt="mouse">
`;
document.body.appendChild(rogueMouse);

let mouseX: number = window.innerWidth / 2;
let mouseY: number = window.innerHeight / 2;
let runTimeout: number | ReturnType<typeof setTimeout>;

rogueMouse.style.left = mouseX + "px";
rogueMouse.style.top = mouseY + "px";

document.addEventListener("mousemove", (e: MouseEvent) => {
    const dist = Math.hypot(e.clientX - mouseX, e.clientY - mouseY);
    if (dist < 150) {
        const evadeAngle = Math.atan2(mouseY - e.clientY, mouseX - e.clientX);
        const dx = Math.cos(evadeAngle) * 250;
        const dy = Math.sin(evadeAngle) * 250;

        mouseX += dx;
        mouseY += dy;

        mouseX = Math.max(50, Math.min(window.innerWidth - 50, mouseX));
        mouseY = Math.max(50, Math.min(window.innerHeight - 50, mouseY));

        const scaleX = dx < 0 ? 1 : -1;
        const tilt = (dy / 250) * 30; 

        rogueMouse.style.left = mouseX + "px";
        rogueMouse.style.top = mouseY + "px";
        rogueMouse.style.transform = `translate(-50%, -50%) scaleX(${scaleX}) rotate(${tilt * -scaleX}deg)`;
        
        rogueMouse.classList.add("is-running");
        
        clearTimeout(runTimeout as number);
        runTimeout = setTimeout(() => {
            rogueMouse.classList.remove("is-running");
        }, 250);
    }
});

rogueMouse.addEventListener("mousedown", () => {
    // Escape hatching global functions that were locked inside DOMContentLoaded
    if (typeof (window as any).triggerConfetti === 'function') (window as any).triggerConfetti();
    if (typeof (window as any).showToast === 'function') (window as any).showToast("ACHIEVEMENT UNLOCKED: Apex Predator!", "fa-trophy");
    
    rogueMouse.innerHTML = "💥";
    rogueMouse.style.fontSize = "4rem";
    setTimeout(() => rogueMouse.remove(), 500);
});

// --- FEATURE C: HOLOGRAPHIC PERSONA MATRIX ---
const generatePersonaBtn = document.getElementById("generatePersonaBtn") as HTMLButtonElement | null;
const humanNameInput = document.getElementById("humanNameInput") as HTMLInputElement | null;
const hologramCard = document.getElementById("hologramCard") as HTMLElement | null;

const breeds: string[] = ["Maine Coon", "Sphynx", "Bengal", "Scottish Fold", "Russian Blue", "Siamese"];
const traits: string[] = ["Chaotic Evil", "Chronically Sleepy", "Laser Focused", "Loudly Demanding", "Stealth Master"];
const powers: string[] = ["Midnight Zoomies", "Invisibility in Shadows", "Mind Control via Purring", "Gravity Defiance"];

if (generatePersonaBtn && humanNameInput && hologramCard) {
    generatePersonaBtn.addEventListener("click", () => {
        const name = humanNameInput.value.trim();
        if (!name) {
            if (typeof (window as any).showToast === 'function') {
                (window as any).showToast("Please enter your human name first.", "fa-exclamation-triangle");
            }
            return;
        }

        let seed = 0;
        for (let i = 0; i < name.length; i++) {
            seed = (seed * 31) + name.toLowerCase().charCodeAt(i);
        }
        seed = Math.abs(seed);

        const holoName = document.getElementById("holoName");
        const holoBreed = document.getElementById("holoBreed");
        const holoTrait = document.getElementById("holoTrait");
        const holoPower = document.getElementById("holoPower");

        if (holoName) holoName.innerText = `Agent ${name}`;
        if (holoBreed) holoBreed.innerText = breeds[seed % breeds.length];
        if (holoTrait) holoTrait.innerText = traits[(seed * 2) % traits.length];
        if (holoPower) holoPower.innerText = powers[(seed * 3) % powers.length];

        generatePersonaBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning DNA...';
        setTimeout(() => {
            hologramCard.classList.remove("hidden");
            generatePersonaBtn.innerHTML = '<i class="fas fa-dna"></i> Matrix Generated';
            hologramCard.style.transform = "scale(0.8) rotateX(20deg)";
            setTimeout(() => hologramCard.style.transform = "scale(1) rotateX(0deg)", 100);
        }, 1000);
    });
}

// ==========================================
// 8. BEAST FEATURE: GENETICS LABORATORY
// ==========================================
const coatSlider = document.getElementById("coatSlider") as HTMLInputElement | null;
const melaninSlider = document.getElementById("melaninSlider") as HTMLInputElement | null;
const earSlider = document.getElementById("earSlider") as HTMLInputElement | null;
const vocalSlider = document.getElementById("vocalSlider") as HTMLInputElement | null;

const coatVal = document.getElementById("coatVal") as HTMLElement | null;
const melaninVal = document.getElementById("melaninVal") as HTMLElement | null;
const earVal = document.getElementById("earVal") as HTMLElement | null;
const vocalVal = document.getElementById("vocalVal") as HTMLElement | null;
const breedResult = document.getElementById("breedResult") as HTMLElement | null;

const calculateBreed = (): void => {
    if (!coatSlider || !melaninSlider || !earSlider || !vocalSlider || !breedResult) return;
    
    const coat = parseInt(coatSlider.value, 10);
    const melanin = parseInt(melaninSlider.value, 10);
    const ears = parseInt(earSlider.value, 10);
    const vocal = parseInt(vocalSlider.value, 10);

    if (coatVal) coatVal.innerText = coat + "%";
    if (melaninVal) melaninVal.innerText = melanin + "%";
    if (earVal) earVal.innerText = ears + "%";
    if (vocalVal) vocalVal.innerText = vocal + "%";

    let breed = "Domestic Shorthair";
    
    if (coat < 15) breed = "Sphynx (Hairless)";
    else if (ears > 80) breed = "Scottish Fold";
    else if (coat > 80 && melanin < 40) breed = "Birman";
    else if (coat > 80 && melanin >= 40) breed = "Maine Coon";
    else if (coat <= 80 && melanin < 40 && vocal > 75) breed = "Siamese";
    else if (coat <= 80 && melanin >= 80) breed = "Bombay (Mini Panther)";
    else if (coat > 60 && melanin > 40 && vocal < 40) breed = "Persian";
    else if (coat > 30 && coat < 70 && melanin > 30 && melanin < 70) breed = "Standard Tabby";

    if (breedResult.innerText !== breed) {
        breedResult.style.transform = "scale(0.9)";
        breedResult.style.opacity = "0.5";
        setTimeout(() => {
            breedResult.innerText = breed;
            breedResult.style.transform = "scale(1)";
            breedResult.style.opacity = "1";
            breedResult.style.transition = "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        }, 150);
    }
};

if (coatSlider && melaninSlider && earSlider && vocalSlider) {
    [coatSlider, melaninSlider, earSlider, vocalSlider].forEach(slider => {
        slider.addEventListener("input", calculateBreed);
    });
    calculateBreed();
}

// ==========================================
// 9. FUNNY & USEFUL UTILITIES
// ==========================================

// --- FEATURE A: FELINE EXCUSE ENGINE ---
const excuseContext = document.getElementById("excuseContext") as HTMLSelectElement | null;
const generateExcuseBtn = document.getElementById("generateExcuseBtn") as HTMLButtonElement | null;
const excuseText = document.getElementById("excuseText") as HTMLElement | null;
const copyExcuseBtn = document.getElementById("copyExcuseBtn") as HTMLButtonElement | null;

type ExcuseCategory = 'work' | 'social' | 'dating';

const excuseDatabase: Record<ExcuseCategory, string[]> = {
    work: [
        "I will be offline for the next hour. My cat has fallen asleep on my arms and Feline Law dictates I cannot move.",
        "I can't make the 9 AM sync. My cat just threw up on my router.",
        "I need to take a personal day. My cat is staring at the corner of the ceiling and I need to make sure we don't have a ghost.",
        "My camera will be off today. My cat decided my keyboard is a bed and is actively typing gibberish into Slack."
    ],
    social: [
        "I can't make it tonight. My cat is finally letting me pet her belly and I can't break the trust.",
        "Sorry, I have to cancel. I bought a $50 cat tree and my cat is playing with the cardboard box it came in. I must supervise.",
        "I'm going to stay in. My cat looked at me with sad eyes when I put my shoes on, and I am weak.",
        "I can't come. My cat is having the zoomies and is using my face as a launchpad."
    ],
    dating: [
        "I don't think this is going to work out. My cat sniffed your jacket last time and gave me a look of deep judgment.",
        "I can't go on our date tonight. I need to spend the evening apologizing to my cat for accidentally stepping on her tail.",
        "Sorry to cancel, but my cat is currently sitting in my lap purring, and this is the most affection I've received in months."
    ]
};

if (generateExcuseBtn && excuseContext && excuseText && copyExcuseBtn) {
    generateExcuseBtn.addEventListener("click", () => {
        const category = excuseContext.value as ExcuseCategory;
        const options = excuseDatabase[category];
        const randomExcuse = options[Math.floor(Math.random() * options.length)];
        
        excuseText.style.opacity = "0";
        setTimeout(() => {
            excuseText.innerText = randomExcuse;
            excuseText.style.opacity = "1";
            excuseText.style.transition = "opacity 0.3s ease";
        }, 200);
    });

    copyExcuseBtn.addEventListener("click", () => {
        const textToCopy = excuseText.innerText;
        if (textToCopy === "Select a category and generate an excuse...") return;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            if (typeof (window as any).showToast === 'function') {
                (window as any).showToast("Excuse copied! Go cancel those plans.", "fa-check");
            }
            copyExcuseBtn.innerHTML = '<i class="fas fa-check" style="color: #10b981;"></i>';
            setTimeout(() => copyExcuseBtn.innerHTML = '<i class="fas fa-copy"></i>', 2000);
        });
    });
}

// --- FEATURE B: PURR-MODORO FOCUS TIMER ---
const timerMinutes = document.getElementById("timerMinutes") as HTMLElement | null;
const timerSeconds = document.getElementById("timerSeconds") as HTMLElement | null;
const toggleTimerBtn = document.getElementById("toggleTimerBtn") as HTMLButtonElement | null;
const focusCatDisplay = document.getElementById("focusCatDisplay") as HTMLElement | null;

let focusInterval: number | ReturnType<typeof setInterval>;
let timeRemaining: number = 25 * 60; 
let isTimerRunning: boolean = false;

const updateTimerDisplay = (): void => {
    if (!timerMinutes || !timerSeconds) return;
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    timerMinutes.innerText = mins.toString().padStart(2, "0");
    timerSeconds.innerText = secs.toString().padStart(2, "0");
};

if (toggleTimerBtn && focusCatDisplay) {
    toggleTimerBtn.addEventListener("click", () => {
        if (isTimerRunning) {
            clearInterval(focusInterval as number);
            isTimerRunning = false;
            toggleTimerBtn.innerHTML = '<i class="fas fa-play"></i> Resume Focus';
            focusCatDisplay.innerText = "🐈"; 
            focusCatDisplay.style.transform = "scale(1)";
        } else {
            isTimerRunning = true;
            toggleTimerBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            focusCatDisplay.innerText = "💤🐈"; 
            focusCatDisplay.style.transform = "scale(1.1)";
            
            if (typeof (window as any).showToast === 'function') {
                (window as any).showToast("Focus mode engaged. Do not switch tabs!", "fa-lock");
            }
            
            focusInterval = setInterval(() => {
                timeRemaining--;
                updateTimerDisplay();
                
                if (timeRemaining <= 0) {
                    clearInterval(focusInterval as number);
                    isTimerRunning = false;
                    if (typeof (window as any).showToast === 'function') {
                        (window as any).showToast("Focus session complete! You may pet the cat.", "fa-trophy");
                    }
                    focusCatDisplay.innerText = "😻";
                    
                    const globalMeow = (window as any).meowSound || document.getElementById('meowSound') as HTMLAudioElement;
                    if (globalMeow) globalMeow.play();
                }
            }, 1000);
        }
    });
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden && isTimerRunning && toggleTimerBtn && focusCatDisplay) {
        clearInterval(focusInterval as number);
        isTimerRunning = false;
        
        toggleTimerBtn.innerHTML = '<i class="fas fa-play"></i> You Woke The Cat. Resume.';
        focusCatDisplay.innerText = "😾💢"; 
        focusCatDisplay.style.transform = "scale(1.3) rotate(5deg)";
        
        const globalMeow = (window as any).meowSound || document.getElementById('meowSound') as HTMLAudioElement;
        if (globalMeow) {
            globalMeow.currentTime = 0;
            globalMeow.play();
        }
        
        setTimeout(() => {
            if (typeof (window as any).showToast === 'function') {
                (window as any).showToast("Hey! You broke focus! The cat is highly disappointed in you.", "fa-exclamation-triangle");
            }
        }, 500);
    }
});

// ==========================================
// 10. EXTREME BEAST LEVEL: 3D & CANVAS PHYSICS
// ==========================================

// --- FEATURE A: QUANTUM SCHRÖDINGER'S BOX ---
const quantumCube = document.getElementById("quantumCube") as HTMLElement | null;
const cubeSecret = document.getElementById("cubeSecret") as HTMLElement | null;

const quantumStates = [
    { icon: "🐈", message: "Alive! It's a standard Earth cat.", color: "#10b981" },
    { icon: "💀", message: "Uh oh. It's a skeleton cat.", color: "#ef4444" },
    { icon: "🌌", message: "Quantum anomaly! It's pure stardust.", color: "#8b5cf6" },
    { icon: "👽", message: "Alien feline detected.", color: "#06b6d4" },
    { icon: "📦", message: "Paradox. Another box inside the box.", color: "#f59e0b" }
];

if (quantumCube && cubeSecret) {
    document.addEventListener("mousemove", (e: MouseEvent) => {
        if (quantumCube.classList.contains("is-open")) return;
        const rect = quantumCube.getBoundingClientRect();
        const centerX = rect.left + (rect.width / 2);
        const centerY = rect.top + (rect.height / 2);
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        
        const rotateX = -15 - (mouseY * 0.05);
        const rotateY = 25 + (mouseX * 0.05);
        quantumCube.style.transform = `translateZ(-100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    quantumCube.addEventListener("click", () => {
        if (quantumCube.classList.contains("is-open")) {
            quantumCube.classList.remove("is-open");
            cubeSecret.style.opacity = "0";
        } else {
            const state = quantumStates[Math.floor(Math.random() * quantumStates.length)];
            cubeSecret.innerText = state.icon;
            cubeSecret.style.textShadow = `0 0 40px ${state.color}`;
            quantumCube.classList.add("is-open");
            
            if (typeof (window as any).triggerConfetti === 'function') (window as any).triggerConfetti();
            if (typeof (window as any).showToast === 'function') {
                (window as any).showToast(`Waveform Collapsed: ${state.message}`, "fa-atom");
            }
        }
    });
}

// --- FEATURE A: THE FELINE THEREMIN (Web Audio Synth) ---
const thereminPad = document.getElementById("thereminPad") as HTMLElement | null;
const thereminNode = document.getElementById("thereminNode") as HTMLElement | null;

let audioCtx: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let isPlaying: boolean = false;

if (thereminPad && thereminNode) {
    const updateTheremin = (e: MouseEvent) => {
        if (!isPlaying || !audioCtx) return;
        const rect = thereminPad.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        
        x = Math.max(0, Math.min(rect.width, x));
        y = Math.max(0, Math.min(rect.height, y));
        
        thereminNode.style.left = x + "px";
        thereminNode.style.top = y + "px";
        
        const minFreq = 200, maxFreq = 1200;
        const freq = minFreq + (x / rect.width) * (maxFreq - minFreq);
        const volume = 0.3 - (y / rect.height) * 0.3; 
        
        if (oscillator) oscillator.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.05);
        if (gainNode) gainNode.gain.setTargetAtTime(volume, audioCtx.currentTime, 0.05);
    };

    thereminPad.addEventListener("mousedown", (e: MouseEvent) => {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            audioCtx = new AudioContextClass();
            oscillator = audioCtx.createOscillator();
            gainNode = audioCtx.createGain();
            
            oscillator.type = "sine"; 
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.start();
        }
        
        isPlaying = true;
        thereminPad.classList.add("active");
        thereminNode.style.opacity = "1";
        
        if (gainNode) gainNode.gain.setTargetAtTime(0.1, audioCtx.currentTime, 0.05);
        updateTheremin(e);
    });

    thereminPad.addEventListener("mousemove", updateTheremin);

    const stopTheremin = () => {
        if (!isPlaying || !audioCtx) return;
        isPlaying = false;
        thereminPad.classList.remove("active");
        thereminNode.style.opacity = "0";
        if (gainNode) gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1); 
    };

    thereminPad.addEventListener("mouseup", stopTheremin);
    thereminPad.addEventListener("mouseleave", stopTheremin);
}

// --- FEATURE C: PIP DESKTOP COMPANION ---
const pipCompanionBtn = document.getElementById("pipCompanionBtn") as HTMLButtonElement | null;
if (pipCompanionBtn) {
    pipCompanionBtn.addEventListener("click", async () => {
        if ('documentPictureInPicture' in window) {
            try {
                const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
                    width: 200, height: 200
                });
                
                pipWindow.document.body.style.background = "#1a1a2e";
                pipWindow.document.body.style.display = "flex";
                pipWindow.document.body.style.justifyContent = "center";
                pipWindow.document.body.style.alignItems = "center";
                pipWindow.document.body.innerHTML = `
                    <div style="text-align: center; color: white; font-family: sans-serif;">
                        <img src="https://i.gifer.com/origin/d5/d531ab42cc07a61ba9a3962d3a242c75_w200.gif" style="width: 100px;">
                        <p>I am watching you work.</p>
                    </div>
                `;
                
                if (typeof (window as any).showToast === 'function') {
                    (window as any).showToast("Companion deployed to your desktop!", "fa-external-link-alt");
                }
            } catch (err) {
                if (typeof (window as any).showToast === 'function') {
                    (window as any).showToast("PiP Failed. Try a Chromium browser.", "fa-exclamation");
                }
            }
        } else {
            if (typeof (window as any).showToast === 'function') {
                (window as any).showToast("Your browser does not support the Document PiP API yet.", "fa-exclamation-triangle");
            }
        }
    });
}

// --- FEATURE D: THE COSMIC STAR MAP (CANVAS) ---
const toggleStarMapBtn = document.getElementById("toggleStarMapBtn") as HTMLButtonElement | null;
const starCanvas = document.getElementById("cosmicStarMap") as HTMLCanvasElement | null;
let isMapActive: boolean = false;

if (toggleStarMapBtn && starCanvas) {
    const starCtx = starCanvas.getContext("2d");
    let w: number, h: number;
    
    interface Star {
        x: number;
        y: number;
        r: number;
        speed: number;
    }
    
    const stars: Star[] = [];

    const initStars = () => {
        w = starCanvas.width = window.innerWidth;
        h = starCanvas.height = window.innerHeight;
        stars.length = 0;
        
        for (let i = 0; i < 300; i++) {
            stars.push({
                x: Math.random() * w, 
                y: Math.random() * h,
                r: Math.random() * 2, 
                speed: Math.random() * 0.5 + 0.1
            });
        }
    };

    const drawStars = () => {
        if (!isMapActive || !starCtx) return;
        
        starCtx.fillStyle = "rgba(3, 7, 18, 0.3)"; 
        starCtx.fillRect(0, 0, w, h);
        starCtx.fillStyle = "#fff";
        
        stars.forEach(s => {
            starCtx.beginPath();
            starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            starCtx.fill();
            s.y -= s.speed; 
            if (s.y < 0) s.y = h; 
        });
        
        requestAnimationFrame(drawStars);
    };

    window.addEventListener("resize", initStars);

    toggleStarMapBtn.addEventListener("click", () => {
        isMapActive = !isMapActive;
        if (isMapActive) {
            initStars();
            starCanvas.classList.add("active");
            toggleStarMapBtn.innerHTML = '<i class="fas fa-times"></i> Disable Star Map';
            document.body.style.background = "transparent"; 
            drawStars();
        } else {
            starCanvas.classList.remove("active");
            toggleStarMapBtn.innerHTML = '<i class="fas fa-meteor"></i> Engage Cosmic Star Map';
            document.body.style.background = ""; 
        }
    });
}

// --- FEATURE E: GRAVITY CATACLYSM (DOM PHYSICS) ---
const gravityBtn = document.getElementById("gravityCataclysmBtn") as HTMLButtonElement | null;

if (gravityBtn) {
    gravityBtn.addEventListener("click", () => {
        if (typeof (window as any).showToast === 'function') {
            (window as any).showToast("WARNING: STRUCTURAL INTEGRITY FAILING", "fa-skull");
        }
        gravityBtn.disabled = true;
        
        const elements = document.querySelectorAll(".glass-card, .ultra-btn, h1, h2") as NodeListOf<HTMLElement>;
        
        interface PhysicsItem {
            el: HTMLElement;
            y: number;
            vy: number;
            vx: number;
            rotation: number;
            vr: number;
        }
        
        const physicsData: PhysicsItem[] = [];

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            el.style.left = rect.left + "px";
            el.style.top = rect.top + "px";
            el.style.width = rect.width + "px"; 
            el.classList.add("falling-element");
            
            physicsData.push({
                el: el,
                y: rect.top,
                vy: Math.random() * -10 - 5, 
                vx: (Math.random() - 0.5) * 10, 
                rotation: 0,
                vr: (Math.random() - 0.5) * 10 
            });
        });

        const gravity = 0.8;
        const floor = window.innerHeight + window.scrollY;

        const fallLoop = () => {
            let stillFalling = false;
            
            physicsData.forEach(item => {
                item.vy += gravity; 
                item.y += item.vy;
                item.rotation += item.vr;
                
                if (item.y + item.el.offsetHeight > floor) {
                    item.y = floor - item.el.offsetHeight;
                    item.vy *= -0.6; 
                    item.vr *= 0.8; 
                } else {
                    stillFalling = true;
                }
                
                item.el.style.top = item.y + "px";
                item.el.style.transform = `rotate(${item.rotation}deg) translateX(${item.vx}px)`;
            });

            if (stillFalling) {
                requestAnimationFrame(fallLoop);
            } else {
                if (typeof (window as any).showToast === 'function') {
                    (window as any).showToast("System Destroyed. Refresh the page.", "fa-bomb");
                }
            }
        };

        setTimeout(() => {
            document.body.classList.add("earthquake"); 
            setTimeout(() => document.body.classList.remove("earthquake"), 500);
            requestAnimationFrame(fallLoop);
        }, 1000);
    });
}