import { VectorSprites } from './vectorSprites.js';

export class UIManager {
    constructor(playerState, engine, sounds) {
        this.playerState = playerState;
        this.engine = engine;
        this.sounds = sounds;
        this.logContainer = document.getElementById('message-log');
    }

    addLog(msg) {
        const div = document.createElement('div');
        const lower = msg.toLowerCase();
        let cls = 'message';
        
        if (lower.includes('hits you') || lower.includes('perished') || lower.includes('broken') || (lower.includes('dmg!') && lower.includes('you'))) {
            cls += ' message-damage';
        } else if (lower.includes('you hit') || lower.includes('critical hit') || lower.includes('obliterate') || lower.includes('counter-attack')) {
            cls += ' message-combat';
        } else if (lower.includes('gold') || lower.includes('picked up') || lower.includes('dropped') || lower.includes('found') || lower.includes('loot')) {
            cls += ' message-loot';
        } else if (lower.includes('level up') || lower.includes('perfect parry') || lower.includes('parry') || lower.includes('block')) {
            cls += ' message-warning';
        } else if (lower.includes('bump') || lower.includes('empty') || lower.includes('nothing') || lower.includes('blocked')) {
            cls += ' message-system';
        }
        
        div.className = cls;
        div.innerText = `> ${msg}`;
        this.logContainer.prepend(div);
    }

    updateStatsUI() {
        if (!document.getElementById('hp-value')) return;

        document.getElementById('hp-value').innerText = `${this.playerState.hp}/${this.playerState.maxHp}`;
        
        const hpPercent = Math.max(0, (this.playerState.hp / this.playerState.maxHp) * 100);
        const hpFill = document.getElementById('hp-bar-fill');
        hpFill.style.width = `${hpPercent}%`;
        hpFill.classList.remove('hp-high', 'hp-mid', 'hp-low');
        
        if (hpPercent > 50) hpFill.classList.add('hp-high');
        else if (hpPercent > 25) hpFill.classList.add('hp-mid');
        else hpFill.classList.add('hp-low');
        
        const dirs = ['N', 'E', 'S', 'W'];
        document.getElementById('dir-value').innerText = dirs[this.engine.player.targetDir];
        
        const weaponDmg = this.playerState.equippedWeapon ? (this.playerState.equippedWeapon.atk || 0) : 0;
        const armorDef = this.playerState.equippedArmor ? (this.playerState.equippedArmor.def || 0) : 0;
        
        document.getElementById('val-weapon').innerText = this.playerState.equippedWeapon ? this.playerState.equippedWeapon.name : 'None';
        document.getElementById('val-armor').innerText = this.playerState.equippedArmor ? this.playerState.equippedArmor.name : 'None';
        
        document.getElementById('val-dmg').innerText = weaponDmg;
        document.getElementById('val-def').innerText = armorDef;
        document.getElementById('val-gold').innerText = this.playerState.gold;
        document.getElementById('val-xp').innerText = this.playerState.xp;
        document.getElementById('val-level').innerText = this.playerState.charLevel;
    }

    toggleInventory(show, isStoryOpen) {
        if (show && isStoryOpen) return;
        const overlay = document.getElementById('inventory-overlay');

        if (show) {
            overlay.classList.remove('hidden');
            this.updateInventoryUI();
        } else {
            overlay.classList.add('hidden');
        }
    }

    updateInventoryUI(onDropCallback) {
        const grid = document.getElementById('inventory-grid');
        grid.innerHTML = '';
        
        for (let i = 0; i < this.playerState.inventoryMax; i++) {
            const slot = document.createElement('div');
            slot.className = 'inv-slot';
            
            const item = this.playerState.inventory[i];
            if (item) {
                const typeKey = item.id.toUpperCase();
                const drawFunc = VectorSprites[typeKey];

                if (item.sprite && item.sprite instanceof HTMLCanvasElement) {
                    const img = document.createElement('img');
                    img.src = item.sprite.toDataURL();
                    slot.appendChild(img);
                } else if (item.spriteFile) {
                    const img = document.createElement('img');
                    img.src = item.spriteFile + '?v=' + Date.now();
                    slot.appendChild(img);
                } else if (drawFunc) {
                    const canvas = document.createElement('canvas');
                    canvas.width = 64;
                    canvas.height = 64;
                    const ctx = canvas.getContext('2d');
                    
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.translate(32, 32); 
                    drawFunc(ctx, 40); 
                    
                    slot.appendChild(canvas);
                } else {
                    slot.innerText = item.name[0];
                }
                slot.onclick = () => this.showItemDetails(item, slot, onDropCallback);
            }
            grid.appendChild(slot);
        }
    }

    showItemDetails(item, slot, onDropCallback) {
        document.querySelectorAll('.inv-slot').forEach(s => s.classList.remove('selected'));
        if (slot) slot.classList.add('selected');

        document.getElementById('item-name').innerText = item.name || 'Select an item';
        document.getElementById('item-desc').innerText = item.description || '...';
        
        const actions = document.getElementById('item-actions');
        actions.innerHTML = '';
        
        if (!item.id) return;

        if (item.type === 'weapon' || item.type === 'armor') {
            const btn = document.createElement('button');
            btn.className = 'rpg-btn';
            btn.innerText = 'EQUIP';
            btn.onclick = () => {
                if (item.type === 'weapon') this.playerState.equippedWeapon = item;
                else this.playerState.equippedArmor = item;
                this.addLog(`Equipped ${item.name}`);
                this.updateStatsUI();
            };
            actions.appendChild(btn);
        } else if (item.type === 'consumable') {
            const btn = document.createElement('button');
            btn.className = 'rpg-btn';
            btn.innerText = 'EAT';
            btn.onclick = () => {
                this.addLog(`You ate ${item.name}. Restored ${item.healAmount} HP.`);
                this.playerState.hp = Math.min(this.playerState.maxHp, this.playerState.hp + item.healAmount);
                this.playerState.inventory = this.playerState.inventory.filter(i => i !== item);
                this.updateInventoryUI(onDropCallback);
                this.updateStatsUI();
                this.showItemDetails({}, null, onDropCallback);
            };
            actions.appendChild(btn);
        }

        const dropBtn = document.createElement('button');
        dropBtn.className = 'rpg-btn';
        dropBtn.style.borderColor = "#900";
        dropBtn.innerText = 'DROP';
        dropBtn.onclick = () => {
            if (onDropCallback) onDropCallback(item);
            this.showItemDetails({}, null, onDropCallback);
        };
        actions.appendChild(dropBtn);
    }

    flashDamage() {
        const view = document.getElementById('view-container');
        view.classList.add('hit-flash-player', 'screen-shake');
        setTimeout(() => {
            view.classList.remove('hit-flash-player', 'screen-shake');
        }, 150);
    }

    flashParry() {
        const view = document.getElementById('view-container');
        view.classList.add('perfect-parry');
        setTimeout(() => view.classList.remove('perfect-parry'), 300);
    }

    flashCritical() {
        const view = document.getElementById('view-container');
        view.classList.add('critical-hit', 'screen-shake');
        setTimeout(() => {
            view.classList.remove('critical-hit', 'screen-shake');
        }, 200);
    }

    flashLevelUp() {
        const view = document.getElementById('view-container');
        view.style.boxShadow = "0 0 50px #ff0";
        setTimeout(() => view.style.boxShadow = "none", 1000);
    }

    showGameOver() {
        document.getElementById('game-over-overlay').classList.remove('hidden');
    }
}
