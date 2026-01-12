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
