import { GameEngine } from './engine.js';
import { LevelManager } from './systems/level.js';
import { EntityDefs } from './data/entities/registry.js';
import { loadMonsterFromFile } from './systems/monsterLoader.js';
import { sounds } from './systems/sound.js';

const canvas = document.getElementById('gameCanvas');
const ui = {
    hp: document.getElementById('hp-value'),
    dir: document.getElementById('dir-value'),
    log: document.getElementById('message-log')
};

const engine = new GameEngine(canvas, ui);
const levelManager = new LevelManager(engine);

function addLog(msg) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerText = `> ${msg}`;
    ui.log.prepend(div);
}

// Initialize sounds on first interaction
let soundsStarted = false;
function startSounds() {
    if (!soundsStarted) {
        sounds.init();
        soundsStarted = true;
    }
}

window.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
            handleMove();
            break;
        case 'ArrowLeft':
        case 'a':
            handleRotate(-1);
            break;
        case 'ArrowRight':
        case 'd':
            handleRotate(1);
            break;
        case ' ':
            handleInteract();
            break;
    }
});

const playerState = {
    currentFloor: 1,
    charLevel: 1,
    hp: 100,
    maxHp: 100,
    gold: 0,
    xp: 0,
    inventory: [],
    inventoryMax: 20,
    equippedWeapon: null,
    equippedArmor: null,
    attackCooldown: 0,
    defendCooldown: 0,
    isDefending: false
};

/**
 * Checks for experience gain and handles stat increases.
 */
function checkLevelUp() {
    const xpNeeded = playerState.charLevel * 100;
    if (playerState.xp >= xpNeeded) {
        playerState.charLevel++;
        playerState.xp -= xpNeeded;
        playerState.maxHp += 20;
        playerState.hp = playerState.maxHp;
        
        addLog(`*** LEVEL UP! You are now level ${playerState.charLevel}! ***`);
        addLog(`Max HP increased to ${playerState.maxHp}.`);
        sounds.playLevelUp();
        updateStatsUI();
        
        // Visual effect
        const view = document.getElementById('view-container');
        view.style.boxShadow = "0 0 50px #ff0";
        setTimeout(() => view.style.boxShadow = "none", 1000);
        
        checkLevelUp(); // Check again if enough XP for multiple levels
    }
}

function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

// --- Interaction Handlers ---

engine.onEntityAttack = (monster, dmg) => {
    let finalDmg = dmg;
    const armorDef = playerState.equippedArmor ? (playerState.equippedArmor.def || 0) : 0;
    
    if (playerState.isDefending) {
        const weapon = playerState.equippedWeapon;
        const weaponDef = weapon ? (weapon.def || 0) : 0;
        const weaponDmgDie = weapon ? (weapon.damage || 4) : 4;
        
        const blockRoll = rollDice(20) + weaponDef; // D20 save
        
        if (blockRoll >= 18) {
            // PERFECT PARRY
            addLog(`*PERFECT PARRY*! (Rolled ${blockRoll})`);
            sounds.playTake(); 
            
            const reflectDmg = rollDice(weaponDmgDie) + 5;
            monster.hp -= reflectDmg;
            addLog(`You deflect the blow and strike back for ${reflectDmg} DMG!`);
            finalDmg = 0;
        } else if (blockRoll >= 10) {
            // SUCCESSFUL BLOCK
            const blockAmount = rollDice(6) + weaponDef + armorDef;
            finalDmg = Math.max(0, dmg - blockAmount);
            addLog(`You block! (Rolled ${blockRoll}) Reduced dmg to ${finalDmg}.`);
            sounds.playStep();
            
            const reflectDmg = rollDice(4);
            monster.hp -= reflectDmg;
            addLog(`Quick counter-attack deals ${reflectDmg} DMG.`);
        } else {
            // FAILED BLOCK
            finalDmg = Math.max(1, dmg - armorDef);
            addLog(`Your guard was broken! (Rolled ${blockRoll}) Takes ${finalDmg} HP!`);
            sounds.playMonsterHit();
        }

        // Check if counter-attack killed monster
        if (monster.hp <= 0) {
            handleMonsterDeath(monster, 15);
        }
    } else {
        finalDmg = Math.max(1, dmg - armorDef);
        addLog(`The ${monster.monsterType.toUpperCase()} hits you for ${finalDmg} HP! (Def: ${armorDef})`);
        sounds.playMonsterHit();
    }

    playerState.hp -= finalDmg;
    updateStatsUI();
    
    if (playerState.hp <= 0) {
        handleGameOver();
    }
};

function handleMonsterDeath(monster, xpGain) {
    addLog(`The ${monster.monsterType.toUpperCase()} has been defeated!`);
    playerState.xp += xpGain;
    checkLevelUp();
    engine.entities = engine.entities.filter(e => e !== monster);
}

function handleGameOver() {
    playerState.hp = 0;
    updateStatsUI();
    addLog("YOU HAVE PERISHED...");
    sounds.playGameOver();
    document.getElementById('game-over-overlay').classList.remove('hidden');
}

document.getElementById('btn-restart').onclick = () => {
    location.reload();
};

/**
 * Updates all stat-related UI elements.
 */
function updateStatsUI() {
    if (!document.getElementById('hp-value')) return;

    document.getElementById('hp-value').innerText = `${playerState.hp}/${playerState.maxHp}`;
    
    const dirs = ['N', 'E', 'S', 'W'];
    document.getElementById('dir-value').innerText = dirs[engine.player.targetDir];
    
    const weaponDmg = playerState.equippedWeapon ? (playerState.equippedWeapon.atk || 0) : 0;
    const armorDef = playerState.equippedArmor ? (playerState.equippedArmor.def || 0) : 0;
    
    document.getElementById('val-weapon').innerText = playerState.equippedWeapon ? playerState.equippedWeapon.name : 'None';
    document.getElementById('val-armor').innerText = playerState.equippedArmor ? playerState.equippedArmor.name : 'None';
    
    document.getElementById('val-dmg').innerText = weaponDmg;
    document.getElementById('val-def').innerText = armorDef;
    document.getElementById('val-gold').innerText = playerState.gold;
    document.getElementById('val-xp').innerText = `${playerState.xp} (LVL ${playerState.charLevel})`;
}

// --- UI Button Handlers ---

function handleMove() {
    startSounds();
    const moveRes = engine.moveForward();
    if (moveRes === false) {
        addLog("You bump into a wall.");
    } else if (moveRes !== null) {
        sounds.playStep();
        updateStatsUI();
        if (moveRes === '<') addLog("You are standing on stairs leading UP. (Press OPEN)");
        if (moveRes === '>') addLog("You are standing on stairs leading DOWN. (Press OPEN)");
    }
}

function handleRotate(dir) {
    startSounds();
    engine.rotate(dir);
    sounds.playStep();
    updateStatsUI();
}

async function handleInteract() {
    startSounds();
    const msg = engine.interact();
    if (msg === "STAIRS_UP") {
        if (playerState.currentFloor > 1) {
            const prevFloor = playerState.currentFloor - 1;
            const success = await levelManager.loadLevel(prevFloor, '>'); 
            if (success) {
                playerState.currentFloor = prevFloor;
                addLog(`You ascend to Floor ${playerState.currentFloor}.`);
                updateStatsUI();
                sounds.playLevelUp();
            } else {
                addLog("The way up is blocked or busy.");
            }
        } else {
            addLog("The way up is blocked.");
        }
    } else if (msg === "STAIRS_DOWN") {
        const nextFloor = playerState.currentFloor + 1;
        const success = await levelManager.loadLevel(nextFloor, '<'); 
        if (success) {
            playerState.currentFloor = nextFloor;
            addLog(`You descend to Floor ${playerState.currentFloor}.`);
            updateStatsUI();
            sounds.playLevelUp();
        } else {
            addLog("The way down is blocked or busy. (Coming soon?)");
        }
    } else if (msg) {
        addLog(msg);
        sounds.playOpen();
    }
}

function handleDefend() {
    if (playerState.defendCooldown > 0) return;

    addLog("You raise your guard!");
    playerState.isDefending = true;
    playerState.defendCooldown = 4000; 
    
    const btn = document.getElementById('btn-defend');
    btn.style.boxShadow = "0 0 15px #0f0";
    btn.innerText = "BLOCKING";
    
    setTimeout(() => {
        playerState.isDefending = false;
        btn.style.boxShadow = "none";
        btn.innerText = "DEFEND";
    }, 2500); 
}

function handleAttack() {
    startSounds();
    if (playerState.attackCooldown > 0) return;
    playerState.isDefending = false; 

    const monster = engine.attack();
    
    if (monster) {
        const weapon = playerState.equippedWeapon;
        const weaponAtk = weapon ? (weapon.atk || 0) : 0;
        const weaponDmgDie = weapon ? (weapon.damage || 4) : 4;
        
        const hitRoll = rollDice(20);
        let totalDmg = 0;
        
        if (hitRoll === 20) {
            totalDmg = rollDice(weaponDmgDie) + rollDice(weaponDmgDie) + weaponAtk + 5;
            addLog(`*** CRITICAL HIT! *** Rolled a 20!`);
            addLog(`You obliterate the ${monster.monsterType.toUpperCase()} for ${totalDmg} DMG!`);
            sounds.playHit();
            sounds.playTake(); 
        } else if (hitRoll === 1) {
            addLog(`*CRITICAL MISS*! Rolled a 1! Your swing goes wild.`);
            sounds.playMiss();
            playerState.attackCooldown += 2000;
            return;
        } else if (hitRoll + weaponAtk >= 8) {
            totalDmg = rollDice(weaponDmgDie) + weaponAtk;
            addLog(`You hit ${monster.monsterType.toUpperCase()} for ${totalDmg} DMG! (Roll: ${hitRoll}+${weaponAtk})`);
            sounds.playHit();
        } else {
            addLog(`You missed! (Roll: ${hitRoll}+${weaponAtk} vs AC 8)`);
            sounds.playMiss();
            return;
        }
        
        monster.hp -= totalDmg;
        playerState.attackCooldown = weapon ? (weapon.cooldown || 4000) : 2500; 
        
        const view = document.getElementById('view-container');
        view.classList.add('hit-flash');
        setTimeout(() => view.classList.remove('hit-flash'), 150);

        if (monster.hp <= 0) {
            handleMonsterDeath(monster, 20);
            playerState.gold += 10;
            
            // Random Loot Drop
            if (Math.random() > 0.4) { 
                const lootOptions = ['food', 'gold_pile', 'health_potion', 'sword', 'dagger', 'mace', 'leather_armor'];
                const lootType = lootOptions[Math.floor(Math.random() * lootOptions.length)];
                
                engine.entities.push({
                    type: 'object',
                    monsterType: lootType, 
                    x: monster.x,
                    y: monster.y
                });
                addLog(`The monster dropped a ${lootType.toUpperCase()}!`);
            }
            updateStatsUI();
        }
    } else {
        addLog("You swing at the empty air.");
        playerState.attackCooldown = 1500; 
    }
}

function handleTake() {
    startSounds();
    const px = Math.floor(engine.player.targetX);
    const py = Math.floor(engine.player.targetY);
    
    const entIndex = engine.entities.findIndex(e => 
        e.type === 'object' && Math.floor(e.x) === px && Math.floor(e.y) === py
    );

    if (entIndex !== -1) {
        const ent = engine.entities[entIndex];
        const def = EntityDefs[ent.monsterType];

        if (ent.monsterType === 'stairs_up' || ent.monsterType === 'stairs_down') {
            addLog("These stairs are far too heavy to carry!");
            return;
        }

        if (def.id !== 'gold_pile' && playerState.inventory.length >= playerState.inventoryMax) {
            addLog("Your inventory is full!");
            return;
        }
        
        sounds.playTake();
        if (def.id === 'gold_pile') {
            const val = def.goldValue || 30;
            playerState.gold += val;
            addLog(`You found ${val} gold coins!`);
        } else {
            playerState.inventory.push({ ...def, instance: ent });
            addLog(`You picked up: ${def.name}`);
        }
        
        engine.entities.splice(entIndex, 1);
        updateInventoryUI();
        updateStatsUI();
    } else {
        addLog("There is nothing here to take.");
    }
}

function toggleInventory(show) {
    const overlay = document.getElementById('inventory-overlay');
    if (show) {
        overlay.classList.remove('hidden');
        updateInventoryUI();
    } else {
        overlay.classList.add('hidden');
    }
}

function updateInventoryUI() {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = '';
    
    for (let i = 0; i < playerState.inventoryMax; i++) {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        
        const item = playerState.inventory[i];
        if (item) {
            if (item.spriteFile) {
                const img = document.createElement('img');
                img.src = item.spriteFile;
                slot.appendChild(img);
            } else {
                slot.innerText = item.name[0];
            }
            slot.onclick = () => showItemDetails(item, slot);
        }
        grid.appendChild(slot);
    }
}

function showItemDetails(item, slot) {
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
            if (item.type === 'weapon') playerState.equippedWeapon = item;
            else playerState.equippedArmor = item;
            addLog(`Equipped ${item.name}`);
            updateStatsUI();
        };
        actions.appendChild(btn);
    } else if (item.type === 'consumable') {
        const btn = document.createElement('button');
        btn.className = 'rpg-btn';
        btn.innerText = 'EAT';
        btn.onclick = () => {
            addLog(`You ate ${item.name}. Restored ${item.healAmount} HP.`);
            playerState.hp = Math.min(playerState.maxHp, playerState.hp + item.healAmount);
            playerState.inventory = playerState.inventory.filter(i => i !== item);
            updateInventoryUI();
            updateStatsUI();
            showItemDetails({}, null);
        };
        actions.appendChild(btn);
    }

    const dropBtn = document.createElement('button');
    dropBtn.className = 'rpg-btn';
    dropBtn.style.borderColor = "#900";
    dropBtn.innerText = 'DROP';
    dropBtn.onclick = () => {
        addLog(`Dropped ${item.name}`);
        if (playerState.equippedWeapon === item) playerState.equippedWeapon = null;
        if (playerState.equippedArmor === item) playerState.equippedArmor = null;
        
        engine.entities.push({
            type: 'object',
            monsterType: item.id,
            x: engine.player.targetX,
            y: engine.player.targetY
        });
        
        playerState.inventory = playerState.inventory.filter(i => i !== item);
        updateInventoryUI();
        updateStatsUI();
        showItemDetails({}, null);
    };
    actions.appendChild(dropBtn);
}

// --- Scaling and Settings ---

function applyScale() {
    const wrapper = document.getElementById('game-wrapper');
    const select = document.getElementById('select-resolution');
    const val = select.value;
    
    if (val === 'auto') {
        const scaleW = (window.innerWidth - 40) / 1200;
        const scaleH = (window.innerHeight - 40) / 800;
        const scale = Math.min(scaleW, scaleH);
        wrapper.style.transform = `scale(${scale})`;
    } else {
        wrapper.style.transform = `scale(${val})`;
    }
}

window.addEventListener('resize', applyScale);
document.getElementById('select-resolution').onchange = applyScale;

document.getElementById('btn-toggle-sound').onclick = (e) => {
    sounds.enabled = !sounds.enabled;
    e.target.innerText = sounds.enabled ? "ON" : "OFF";
};

// --- Menu Navigation ---

document.getElementById('btn-start').onclick = () => {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('main-layout').classList.remove('hidden');
    document.getElementById('info-bar').classList.remove('hidden');
    startSounds();
    applyScale();
};

document.getElementById('btn-settings').onclick = () => {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('settings-menu').classList.remove('hidden');
};

document.getElementById('btn-settings-back').onclick = () => {
    document.getElementById('settings-menu').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
};

document.getElementById('btn-to-menu').onclick = () => {
    location.reload(); 
};

// --- Listeners ---

document.getElementById('btn-up').onclick = handleMove;
document.getElementById('btn-left').onclick = () => handleRotate(-1);
document.getElementById('btn-right').onclick = () => handleRotate(1);
document.getElementById('btn-attack').onclick = handleAttack;
document.getElementById('btn-defend').onclick = handleDefend;
document.getElementById('btn-take').onclick = handleTake;
document.getElementById('btn-open').onclick = handleInteract;
document.getElementById('btn-inv').onclick = () => toggleInventory(true);
document.getElementById('btn-close-inv').onclick = () => toggleInventory(false);
document.getElementById('btn-restart').onclick = () => location.reload();

/**
 * Main game initialization and loop.
 */
async function start() {
    const loadImage = (url) => new Promise(resolve => {
        const img = new Image();
        img.onload  = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
    });

    updateStatsUI();
    
    // Load all entity definitions and sprites
    for (const [key, def] of Object.entries(EntityDefs)) {
        try {
            def.vector = await loadMonsterFromFile(def.file);
        } catch (e) {}
        if (def.spriteFile) {
            def.sprite = await loadImage(def.spriteFile);
        }
    }

    await levelManager.loadLevel(1);
    applyScale();

    let lastTime = 0;
    function loop(time) {
        const dt = (time - lastTime) / 1000;
        lastTime = time;

        // Handle Cooldowns
        if (playerState.attackCooldown > 0) {
            playerState.attackCooldown -= dt * 1000;
            const btn = document.getElementById('btn-attack');
            btn.disabled = true;
            btn.style.opacity = "0.5";
        } else {
            const btn = document.getElementById('btn-attack');
            btn.disabled = false;
            btn.style.opacity = "1";
        }

        if (playerState.defendCooldown > 0) {
            playerState.defendCooldown -= dt * 1000;
            if (!playerState.isDefending) {
                const btn = document.getElementById('btn-defend');
                btn.disabled = true;
                btn.style.opacity = "0.5";
            }
        } else {
            const btn = document.getElementById('btn-defend');
            btn.disabled = false;
            btn.style.opacity = "1";
        }

        engine.update(dt);
        engine.render();
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}

start().catch(err => console.error(err));
