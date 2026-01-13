export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function createConfetti(x, y) {
    const colors = ['#6200EA', '#00BFA5', '#FFD600', '#FF1744'];
    for (let i = 0; i < 20; i++) {
        const conf = document.createElement('div');
        conf.style.cssText = `
            position: absolute; left: ${x}px; top: ${y}px;
            width: 8px; height: 8px; background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%; pointer-events: none; z-index: 9999;
        `;
        document.body.appendChild(conf);

        const angle = Math.random() * Math.PI * 2;
        const velocity = 3 + Math.random() * 5;
        const tx = Math.cos(angle) * 100 * velocity;
        const ty = Math.sin(angle) * 100 * velocity;

        conf.animate([
            { transform: 'translate(0,0) scale(1)', opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
        ], {
            duration: 800 + Math.random() * 400,
            easing: 'cubic-bezier(0, .9, .57, 1)'
        }).onfinish = () => conf.remove();
    }
}

export function isLightColor(hex) {
    if (!hex) return false;
    const brights = ['#FFFF00', '#00FF00', '#00FFFF', '#76FF03'];
    return brights.includes(hex.toUpperCase());
}

export function createEmojiFireworks() {
    const emojis = ['🌶️', '🔥', '🎉', '✨', '🌈', '🤩', '🆙'];
    const duration = 2000;
    const count = 50;

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = window.innerHeight + 10;

            const el = document.createElement('div');
            el.innerText = emojis[Math.floor(Math.random() * emojis.length)];
            el.style.cssText = `
                position: fixed; left: ${x}px; top: ${y}px;
                font-size: ${2 + Math.random() * 2}rem;
                pointer-events: none; z-index: 9999;
                user-select: none;
            `;
            document.body.appendChild(el);

            const destX = (Math.random() - 0.5) * 200;
            const destY = -(window.innerHeight * 0.5 + Math.random() * (window.innerHeight * 0.5));
            const rotate = Math.random() * 720 - 360;

            el.animate([
                { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
                { transform: `translate(${destX}px, ${destY}px) rotate(${rotate}deg)`, opacity: 0 }
            ], {
                duration: 1500 + Math.random() * 1000,
                easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
            }).onfinish = () => el.remove();
        }, Math.random() * duration);
    }
}
