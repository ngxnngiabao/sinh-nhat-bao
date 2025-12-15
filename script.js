document.addEventListener('DOMContentLoaded', () => {
    // --- KHAI BÁO CÁC BIẾN QUAN TRỌNG ---
    const bgMusic = document.getElementById('bgMusic');
    const snowCanvas = document.getElementById('snowCanvas');
    const nightOverlay = document.getElementById('nightOverlay');
    const vinylRecord = document.querySelector('.vinyl-record');
    const musicHint = document.querySelector('.music-hint');
    const startBtn = document.getElementById('startBtn');
    const heartRainContainer = document.getElementById('heartRainContainer');
    const loadingScreen = document.getElementById('loading');
    
    let giftsOpened = 0;

    // --- 1. XỬ LÝ LOADING SCREEN ---
    // Khi mọi tài nguyên (ảnh, nhạc) tải xong thì tắt màn hình chờ
    window.onload = () => {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 800);
        }, 1000); // Delay nhẹ 1s để kịp nhìn thấy hiệu ứng tim đập
    };

    // --- CÁC HÀM TIỆN ÍCH (UTILITIES) ---

    /**
     * Rung điện thoại (Haptic Feedback)
     * Tạo cảm giác vật lý khi chạm vào nút hoặc mở quà
     */
    function vibrateDevice() {
        // Kiểm tra nếu trình duyệt hỗ trợ rung (chỉ hoạt động trên Android/một số mobile)
        if (navigator.vibrate) {
            navigator.vibrate(50); // Rung nhẹ 50ms
        }
    }

    /**
     * Chuyển đổi giữa các Scene
     */
    function switchScene(fromId, toId) {
        const from = document.getElementById(fromId);
        const to = document.getElementById(toId);
        
        // 1. Fade out scene cũ
        from.style.opacity = '0';
        from.style.transform = 'translateY(-20px)';
        from.style.transition = 'all 0.5s ease';

        setTimeout(() => {
            from.classList.remove('active');
            from.style.display = 'none';
            
            // 2. Chuẩn bị scene mới
            to.style.display = 'flex';
            to.style.opacity = '0';
            to.style.transform = 'translateY(20px)';
            
            void to.offsetWidth; // Trigger reflow
            
            to.classList.add('active');
            to.style.opacity = '1';
            to.style.transform = 'translateY(0)';
            to.style.transition = 'all 0.8s ease';
            
            // Xử lý màn đêm cho Scene 2
            if(toId === 'scene2') {
                nightOverlay.classList.add('active');
            } else if (fromId === 'scene2') {
                nightOverlay.classList.remove('active');
                nightOverlay.classList.remove('lit');
            }
        }, 500);
    }

    /**
     * Hiệu ứng gõ chữ (Typewriter)
     */
    function typeWriter(elementId, text, speed = 50) {
        const element = document.getElementById(elementId);
        if (!element) return;
        element.innerHTML = "";
        let i = 0;
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    /**
     * Tạo hiệu ứng mưa tim (Heart Rain)
     * Dùng cho lúc thắp nến và kết thúc
     */
    function createHeartRain() {
        for(let i=0; i<20; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.classList.add('heart');
                heart.innerHTML = '❤️';
                heart.style.left = Math.random() * 100 + 'vw';
                heart.style.fontSize = Math.random() * 20 + 15 + 'px';
                heart.style.animationDuration = Math.random() * 2 + 3 + 's';
                heartRainContainer.appendChild(heart);

                // Tự xóa sau khi bay xong
                setTimeout(() => {
                    heart.remove();
                }, 5000);
            }, i * 150);
        }
    }

    // --- XỬ LÝ NHẠC ---
    window.toggleMusic = function() {
        vibrateDevice();
        if (bgMusic.paused) {
            bgMusic.play();
            vinylRecord.classList.add('running');
            if(musicHint) musicHint.style.opacity = '0'; // Ẩn gợi ý
        } else {
            bgMusic.pause();
            vinylRecord.classList.remove('running');
        }
    };

    // --- XỬ LÝ SỰ KIỆN CHÍNH (MAIN EVENTS) ---

    // 1. SCENE 1: NÚT START
    startBtn.addEventListener('click', () => {
        vibrateDevice();
        
        // Thử phát nhạc (cần tương tác người dùng mới phát được trên mobile)
        bgMusic.play().then(() => {
            bgMusic.volume = 0.6;
            vinylRecord.classList.add('running');
            if(musicHint) musicHint.style.display = 'none';
        }).catch(err => console.log("Cần tương tác thêm để phát nhạc"));

        switchScene('scene1', 'scene2');

        // Gõ chữ Santa sau khi chuyển cảnh xong
        setTimeout(() => {
            typeWriter("typingText", "Tối quá anh không thấy đường... Bảo ơi, soi sáng cho anh đi! 🥺");
        }, 1200);
    });

    // 2. SCENE 2: THẮP NẾN
    const candle = document.getElementById('candle');
    const instruction = document.querySelector('.instruction');
    const lightMsg = document.getElementById('lightMsg');

    candle.addEventListener('click', () => {
        if (!candle.classList.contains('lit')) {
            vibrateDevice();
            candle.classList.add('lit');
            
            // Hiệu ứng mưa tim lãng mạn
            createHeartRain();

            // Ẩn hướng dẫn, hiện thông điệp
            instruction.style.opacity = '0';
            setTimeout(() => instruction.style.display = 'none', 500);

            setTimeout(() => {
                lightMsg.classList.add('visible');
            }, 600);

            // Làm sáng nền
            nightOverlay.classList.add('lit');

            // Chuyển cảnh sau 5s (để kịp đọc chữ và ngắm tim bay)
            setTimeout(() => {
                switchScene('scene2', 'scene3');
            }, 5000);
        }
    });

    // 3. SCENE 3: LÁ THƯ -> QUÀ
    document.getElementById('nextToGiftBtn').addEventListener('click', () => {
        vibrateDevice();
        switchScene('scene3', 'scene4');
    });

    // 4. SCENE 4: MỞ QUÀ (Global function)
    window.openGift = function(id) {
        const giftCard = document.getElementById(`gift${id}`);
        
        if (!giftCard.classList.contains('revealed')) {
            vibrateDevice();
            giftCard.classList.add('revealed');
            
            // Pháo giấy nhỏ
            spawnConfetti(giftCard);

            if (!giftCard.dataset.counted) {
                giftCard.dataset.counted = "true";
                giftsOpened++;
                
                // Khi mở hết 3 món quà
                if (giftsOpened === 3) {
                    setTimeout(() => {
                        document.getElementById('finalMessage').classList.add('visible');
                        spawnFullScreenConfetti();
                        createHeartRain(); // Mưa tim lần nữa chúc mừng sinh nhật
                    }, 1000);
                }
            }
        }
    };

    // --- HIỆU ỨNG VISUAL (VISUAL EFFECTS) ---

    // 1. Bụi tiên (Magic Dust)
    function createMagicDust(x, y) {
        const dust = document.createElement('div');
        dust.style.position = 'fixed';
        dust.style.left = x + 'px';
        dust.style.top = y + 'px';
        dust.style.width = '4px'; dust.style.height = '4px';
        dust.style.background = '#fff';
        dust.style.borderRadius = '50%';
        dust.style.pointerEvents = 'none';
        dust.style.boxShadow = '0 0 5px #fff, 0 0 10px #f1c40f';
        dust.style.zIndex = '9999';
        document.body.appendChild(dust);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 30 + 10;
        const moveX = Math.cos(angle) * velocity;
        const moveY = Math.sin(angle) * velocity;

        dust.animate([
            { transform: `translate(0,0) scale(1)`, opacity: 1 },
            { transform: `translate(${moveX}px, ${moveY}px) scale(0)`, opacity: 0 }
        ], { duration: 800, easing: 'ease-out' }).onfinish = () => dust.remove();
    }

    document.addEventListener('mousemove', (e) => createMagicDust(e.clientX, e.clientY));
    document.addEventListener('touchmove', (e) => createMagicDust(e.touches[0].clientX, e.touches[0].clientY));

    // 2. Pháo giấy nhỏ (Mini Confetti)
    function spawnConfetti(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const topY = rect.top;

        for (let i = 0; i < 30; i++) {
            const el = document.createElement('div');
            el.innerHTML = ['✨', '❤️', '🎉', '🎁'][Math.floor(Math.random() * 4)];
            el.style.position = 'fixed';
            el.style.left = centerX + 'px';
            el.style.top = topY + 'px';
            el.style.fontSize = Math.random() * 15 + 10 + 'px'; 
            el.style.pointerEvents = 'none';
            el.style.zIndex = 999;
            el.style.transition = 'all 1s ease-out';
            document.body.appendChild(el);

            setTimeout(() => {
                const randX = Math.random() * 200 - 100;
                const randY = Math.random() * 200 + 50;
                el.style.transform = `translate(${randX}px, -${randY}px) scale(0) rotate(${Math.random()*360}deg)`;
                el.style.opacity = 0;
            }, 50);
            setTimeout(() => el.remove(), 1000);
        }
    }

    // 3. Pháo giấy toàn màn hình (Full Screen Confetti)
    function spawnFullScreenConfetti() {
        const colors = ['#e74c3c', '#f1c40f', '#3498db', '#ffffff', '#2ecc71'];
        for(let i=0; i<100; i++) {
            const div = document.createElement('div');
            div.style.position = 'fixed';
            div.style.left = Math.random()*100 + 'vw';
            div.style.top = '-20px';
            div.style.width = Math.random() * 10 + 5 + 'px';
            div.style.height = Math.random() * 10 + 5 + 'px';
            div.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
            div.style.zIndex = 1000;
            // Một số mảnh tròn, một số mảnh vuông
            div.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            div.style.animation = `fall ${Math.random()*3+2}s linear forwards`;
            document.body.appendChild(div);
        }
        
        // Keyframe cho pháo giấy rơi
        if (!document.getElementById('confettiKeyframes')) {
            const s = document.createElement('style');
            s.id = 'confettiKeyframes';
            s.innerHTML = `@keyframes fall { to { top: 120vh; transform: rotate(720deg); opacity: 0; } }`;
            document.head.appendChild(s);
        }
    }

    // --- HIỆU ỨNG TUYẾT RƠI (CANVAS) ---
    const ctx = snowCanvas.getContext('2d');
    
    function resizeCanvas() {
        snowCanvas.width = window.innerWidth;
        snowCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const flakes = Array.from({length: 100}, () => ({
        x: Math.random() * snowCanvas.width,
        y: Math.random() * snowCanvas.height,
        r: Math.random() * 2 + 0.5,
        s: Math.random() * 1 + 0.5
    }));
    
    function drawSnow() {
        ctx.clearRect(0,0,snowCanvas.width,snowCanvas.height);
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.beginPath();
        flakes.forEach(f => {
            ctx.moveTo(f.x, f.y); 
            ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
            f.y += f.s; 
            
            if(f.y > snowCanvas.height) {
                f.y = -5;
                f.x = Math.random() * snowCanvas.width;
            }
        });
        ctx.fill();
        requestAnimationFrame(drawSnow);
    }
    drawSnow();
});