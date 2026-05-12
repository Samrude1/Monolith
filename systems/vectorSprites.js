
/**
 * Vector Sprite Registry
 * Defines how to draw monsters and items using Canvas API calls.
 * All functions receive (ctx, size) where (0,0) is the center.
 */
export const VectorSprites = {
    // --- MONSTERS ---
    'SPIDER': (ctx, s) => {
        const absS = Math.abs(s);
        const w = absS * 0.8;
        const h = absS * 0.4;
        ctx.strokeRect(-w/2, -h/2, w, h); // Body
        const eyeSize = Math.max(1, absS * 0.05);
        for (let i = -1.5; i <= 1.5; i++) {
            ctx.beginPath();
            ctx.arc(i * absS * 0.1, -h/4, eyeSize, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(-w/4, h/2); ctx.lineTo(-w/8, h/2 + absS*0.1); ctx.lineTo(0, h/2);
        ctx.moveTo(w/4, h/2); ctx.lineTo(w/8, h/2 + absS*0.1); ctx.lineTo(0, h/2);
        ctx.stroke();
        const legCount = 4;
        for (let i = 0; i < legCount; i++) {
            const y = -h/2 + (i * h/(legCount-1));
            ctx.beginPath(); ctx.moveTo(w/2, y); ctx.lineTo(w/2 + absS*0.2, y - absS*0.2); ctx.lineTo(w/2 + absS*0.3, y + absS*0.1); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-w/2, y); ctx.lineTo(-w/2 - absS*0.2, y - absS*0.2); ctx.lineTo(-w/2 - absS*0.3, y + absS*0.1); ctx.stroke();
        }
    },
    
    'SKELETON': (ctx, s) => {
        const absS = Math.abs(s) * 1.2;
        const headS = absS * 0.25;
        const neckY = -absS*0.5 + headS;
        ctx.strokeRect(-headS/2, -absS*0.5, headS, headS);
        const eyeSize = headS * 0.2;
        ctx.strokeRect(-headS*0.3, -absS*0.4, eyeSize, eyeSize);
        ctx.strokeRect(headS*0.1, -absS*0.4, eyeSize, eyeSize);
        const toothS = headS * 0.1;
        const toothY = -absS*0.5 + headS * 0.8;
        for (let i = -1; i <= 1; i++) {
            const tx = i * headS * 0.25;
            ctx.beginPath();
            ctx.moveTo(tx - toothS, toothY); ctx.lineTo(tx + toothS, toothY);
            ctx.moveTo(tx, toothY - toothS); ctx.lineTo(tx, toothY + toothS);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(0, neckY); ctx.lineTo(0, absS*0.2); // Spine
        for (let i = 0; i < 3; i++) {
            const ry = neckY + absS*0.1 + (i * absS*0.08);
            ctx.moveTo(-absS*0.15, ry); ctx.lineTo(absS*0.15, ry);
        }
        const shoulderY = neckY + absS*0.05;
        ctx.moveTo(0, shoulderY); ctx.lineTo(-absS*0.35, shoulderY + absS*0.1); 
        const handX = absS*0.35;
        const handY = shoulderY + absS*0.1;
        ctx.moveTo(0, shoulderY); ctx.lineTo(handX, handY); 
        const swordLen = absS * 0.4;
        const hiltW = absS * 0.15;
        ctx.moveTo(handX, handY + absS*0.05); ctx.lineTo(handX, handY - swordLen); 
        ctx.moveTo(handX - hiltW/2, handY); ctx.lineTo(handX + hiltW/2, handY); 
        ctx.moveTo(0, absS*0.2); ctx.lineTo(-absS*0.2, absS*0.5);
        ctx.moveTo(0, absS*0.2); ctx.lineTo(absS*0.2, absS*0.5);
        ctx.stroke();
    },

    // --- ITEMS ---
    'KEY': (ctx, s) => {
        const absS = Math.abs(s);
        const r = absS * 0.2;
        ctx.beginPath();
        ctx.arc(0, -absS*0.3, r, 0, Math.PI * 2); 
        ctx.moveTo(0, -absS*0.3 + r);
        ctx.lineTo(0, absS*0.3); 
        ctx.moveTo(0, absS*0.1); ctx.lineTo(absS*0.15, absS*0.1); 
        ctx.moveTo(0, absS*0.25); ctx.lineTo(absS*0.15, absS*0.25);
        ctx.stroke();
    },

    'SWORD': (ctx, s) => {
        const absS = Math.abs(s);
        ctx.beginPath();
        ctx.moveTo(0, absS*0.5);
        ctx.lineTo(-absS*0.08, absS*0.35);
        ctx.lineTo(-absS*0.08, -absS*0.2);
        ctx.lineTo(absS*0.08, -absS*0.2);
        ctx.lineTo(absS*0.08, absS*0.35);
        ctx.closePath();
        ctx.moveTo(-absS*0.25, -absS*0.2); ctx.lineTo(absS*0.25, -absS*0.2);
        ctx.moveTo(0, -absS*0.2); ctx.lineTo(0, -absS*0.45);
        ctx.stroke();
    },

    'DAGGER': (ctx, s) => {
        const absS = Math.abs(s);
        ctx.beginPath();
        ctx.moveTo(0, absS*0.3); ctx.lineTo(0, -absS*0.3); 
        ctx.moveTo(-absS*0.1, -absS*0.1); ctx.lineTo(absS*0.1, -absS*0.1); 
        ctx.moveTo(0, -absS*0.1); ctx.lineTo(0, -absS*0.3); 
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-absS*0.04, absS*0.25); ctx.lineTo(0, absS*0.4); ctx.lineTo(absS*0.04, absS*0.25);
        ctx.stroke();
    },

    'MACE': (ctx, s) => {
        const absS = Math.abs(s);
        ctx.beginPath();
        ctx.arc(0, absS*0.2, absS*0.2, 0, Math.PI * 2); 
        ctx.moveTo(0, 0); ctx.lineTo(0, -absS*0.4); 
        for (let i = 0; i < 8; i++) {
            const ang = (i / 8) * Math.PI * 2;
            ctx.moveTo(Math.cos(ang)*absS*0.2, absS*0.2 + Math.sin(ang)*absS*0.2);
            ctx.lineTo(Math.cos(ang)*absS*0.3, absS*0.2 + Math.sin(ang)*absS*0.3);
        }
        ctx.stroke();
    },

    'LEATHER_ARMOR': (ctx, s) => {
        const absS = Math.abs(s) * 0.75; // 25% smaller
        ctx.beginPath();
        ctx.moveTo(-absS*0.3, -absS*0.4); ctx.lineTo(absS*0.3, -absS*0.4);
        ctx.lineTo(absS*0.35, absS*0.3); ctx.lineTo(-absS*0.35, absS*0.3);
        ctx.closePath();
        ctx.moveTo(-absS*0.3, -absS*0.4); ctx.lineTo(-absS*0.5, -absS*0.2); ctx.lineTo(-absS*0.45, 0); ctx.lineTo(-absS*0.32, -absS*0.1);
        ctx.moveTo(absS*0.3, -absS*0.4); ctx.lineTo(absS*0.5, -absS*0.2); ctx.lineTo(absS*0.45, 0); ctx.lineTo(absS*0.32, -absS*0.1);
        ctx.moveTo(-absS*0.1, -absS*0.4); ctx.lineTo(0, -absS*0.3); ctx.lineTo(absS*0.1, -absS*0.4);
        ctx.moveTo(-absS*0.2, -absS*0.1); ctx.lineTo(absS*0.2, -absS*0.1);
        ctx.moveTo(-absS*0.2, absS*0.1); ctx.lineTo(absS*0.2, absS*0.1);
        ctx.stroke();
    },

    'FOOD': (ctx, s) => {
        const absS = Math.abs(s) * 0.6; // 40% smaller
        const r = absS * 0.3;
        ctx.beginPath();
        ctx.arc(0, absS*0.1, r, 0, Math.PI * 2); 
        ctx.moveTo(0, absS*0.1 - r);
        ctx.lineTo(absS*0.1, absS*0.1 - r - absS*0.15); 
        ctx.stroke();
    },

    'HEALTH_POTION': (ctx, s) => {
        const absS = Math.abs(s) * 1.3; // 30% larger
        ctx.strokeRect(-absS*0.15, -absS*0.4, absS*0.3, absS*0.1); 
        ctx.strokeRect(-absS*0.2, -absS*0.3, absS*0.4, absS*0.6); 
        ctx.beginPath();
        ctx.moveTo(-absS*0.1, 0); ctx.lineTo(absS*0.1, 0); 
        ctx.moveTo(0, -absS*0.1); ctx.lineTo(0, absS*0.1);
        ctx.stroke();
    },

    'GOLD_PILE': (ctx, s) => {
        const absS = Math.abs(s);
        const coinW = absS * 0.3;
        const coinH = absS * 0.08;
        
        const drawStack = (offsetX, offsetY, count) => {
            for (let i = 0; i < count; i++) {
                const y = offsetY - (i * absS * 0.07);
                ctx.beginPath();
                ctx.ellipse(offsetX, y, coinW/2, coinH/2, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
        };

        drawStack(-absS*0.2, absS*0.3, 3); // Stack 1
        drawStack(0, absS*0.4, 5);       // Stack 2 (main)
        drawStack(absS*0.2, absS*0.3, 2);  // Stack 3
    },

    'STAIRS_UP': (ctx, s) => {
        const absS = Math.abs(s);
        for (let i = 0; i < 4; i++) {
            const y = absS*0.4 - (i * absS*0.2);
            const w = absS*0.2 + (i * absS*0.2);
            ctx.strokeRect(-w/2, y, w, absS*0.2);
        }
    },

    'STAIRS_DOWN': (ctx, s) => {
        const absS = Math.abs(s);
        for (let i = 0; i < 4; i++) {
            const y = -absS*0.4 + (i * absS*0.2);
            const w = absS*0.8 - (i * absS*0.2);
            ctx.strokeRect(-w/2, y, w, absS*0.2);
        }
    },

    'CHEST': (ctx, s) => {
        const absS = Math.abs(s);
        const w = absS * 0.8;
        const h = absS * 0.6;
        ctx.strokeRect(-w/2, -h/2, w, h);
        ctx.strokeRect(-w/2, -h/2, w, h*0.4); 
        ctx.strokeRect(-absS*0.05, -h*0.1, absS*0.1, absS*0.1); 
        ctx.moveTo(-w/4, -h/2); ctx.lineTo(-w/4, h/2); 
        ctx.moveTo(w/4, -h/2); ctx.lineTo(w/4, h/2);
        ctx.stroke();
    },

    'LEVER': (ctx, s) => {
        const absS = Math.abs(s);
        // Square base at the bottom
        ctx.strokeRect(-absS*0.15, -absS*0.1, absS*0.3, absS*0.2);
        // Vertical shaft from center
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -absS*0.4);
        ctx.stroke();
        // Thicker handle top (grip)
        ctx.strokeRect(-absS*0.08, -absS*0.6, absS*0.16, absS*0.2);
    },

    'DEFAULT': (ctx, s) => {
        const absS = Math.abs(s);
        ctx.beginPath();
        ctx.moveTo(0, -absS/2); ctx.lineTo(absS/2, 0); ctx.lineTo(0, absS/2); ctx.lineTo(-absS/2, 0);
        ctx.closePath();
        ctx.stroke();
    }
};
