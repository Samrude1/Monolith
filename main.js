import { GameEngine } from './engine.js';
import { LevelManager } from './systems/level.js';
import { EntityDefs } from './data/entities/registry.js';
import { loadMonsterFromFile } from './systems/monsterLoader.js';
import { sounds } from './systems/sound.js';
import { StorySystem } from './systems/story.js';
import { VectorSprites } from './systems/vectorSprites.js';
import { playerState } from './systems/playerState.js';
import { UIManager } from './systems/uiManager.js';
import { CombatSystem } from './systems/combat.js';

const canvas = document.getElementById('gameCanvas');
const ui = {
    hp: document.getElementById('hp-value'),
    dir: document.getElementById('dir-value'),
    log: document.getElementById('message-log')
};

const engine = new GameEngine(canvas, ui);
const levelManager = new LevelManager(engine);
const storySystem = new StorySystem(engine);
const uiManager = new UIManager(playerState, engine, sounds);
const combatSystem = new CombatSystem(playerState, engine, uiManager, sounds);

function addLog(msg) { uiManager.addLog(msg); }
function updateStatsUI() { uiManager.updateStatsUI(); }
function toggleInventory(show) { uiManager.toggleInventory(show, storySystem.isOpen); }
function updateInventoryUI() { uiManager.updateInventoryUI((item) => handleDropItem(item)); }

function handleDropItem(item) {
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
    // If story is open, only allow ENTER to close it
    if (storySystem.isOpen) {
        if (e.key === 'Enter') {
            storySystem.close();
        }
        return;
    }

    const key = e.key.toLowerCase();
    switch(key) {
        case 'arrowup':
        case 'w':
            handleMove();
            break;
        case 'arrowdown':
        case 's':
            handleBackward();
            break;
        case 'a':
            handleStrafe(-1);
            break;
        case 'd':
            handleStrafe(1);
            break;
        case 'arrowleft':
        case 'q':
            handleRotate(-1);
            break;
        case 'arrowright':
        case 'e':
            handleRotate(1);
            break;
        case ' ':
        case 'f':
            handleInteract();
            break;
    }
});







// --- Interaction Handlers ---

engine.onEntityAttack = (monster, dmg) => combatSystem.onEntityAttack(monster, dmg);





document.getElementById('btn-restart').onclick = () => {
    location.reload();
};



// --- UI Button Handlers ---

function handleMove() {
    if (storySystem.isOpen) return;
    startSounds();
    const moveRes = engine.moveForward();
    if (moveRes === 'MONSTER') {
        addLog("A monster blocks your path!");
    } else if (moveRes === false) {
        addLog("You bump into a wall.");
    } else if (moveRes !== null) {
        sounds.playStep();
        updateStatsUI();
        
        // Trigger Story!
        storySystem.checkTrigger(playerState.currentFloor, engine.player.targetX, engine.player.targetY);

        if (moveRes === '<') addLog("You are standing on stairs leading UP. (Press USE)");
        if (moveRes === '>') addLog("You are standing on stairs leading DOWN. (Press USE)");
    }
}

function handleBackward() {
    if (storySystem.isOpen) return;
    startSounds();
    const moveRes = engine.moveBackward();
    if (moveRes === 'MONSTER') {
        addLog("A monster blocks your path!");
    } else if (moveRes === false) {
        addLog("You bump into a wall.");
    } else if (moveRes !== null) {
        sounds.playStep();
        updateStatsUI();
        storySystem.checkTrigger(playerState.currentFloor, engine.player.targetX, engine.player.targetY);
    }
}

function handleStrafe(side) {
    if (storySystem.isOpen) return;
    startSounds();
    const moveRes = engine.strafe(side);
    if (moveRes === 'MONSTER') {
        addLog("A monster blocks your path!");
    } else if (moveRes === false) {
        addLog("You bump into a wall.");
    } else if (moveRes !== null) {
        sounds.playStep();
        updateStatsUI();
        storySystem.checkTrigger(playerState.currentFloor, engine.player.targetX, engine.player.targetY);
    }
}


function handleRotate(dir) {
    if (storySystem.isOpen) return;
    startSounds();

    engine.rotate(dir);
    sounds.playStep();
    updateStatsUI();
}

async function handleInteract() {
    if (storySystem.isOpen) return;
    startSounds();

    const msg = engine.interact(playerState);
    updateInventoryUI(); // Update UI in case an item (like a key) was consumed
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
    if (storySystem.isOpen) return;
    combatSystem.handleDefend(document.getElementById('btn-defend'));
}

function handleAttack() {
    if (storySystem.isOpen) return;
    startSounds();
    combatSystem.handleAttack();
}

function handleTake() {
    if (storySystem.isOpen) return;
    startSounds();

    const px = Math.floor(engine.player.targetX);
    const py = Math.floor(engine.player.targetY);
    
    const entIndex = engine.entities.findIndex(e => 
        e.type === 'object' && Math.floor(e.x) === px && Math.floor(e.y) === py
    );

    if (entIndex !== -1) {
        const ent = engine.entities[entIndex];
        const def = EntityDefs[ent.monsterType];
        if (!def) {
            addLog(`Unknown item type: ${ent.monsterType}`);
            return;
        }

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

    // Check for story at spawn
    storySystem.checkTrigger(playerState.currentFloor, engine.player.targetX, engine.player.targetY);
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
document.getElementById('btn-down').onclick = handleBackward;
document.getElementById('btn-strafe-left').onclick = () => handleStrafe(-1);
document.getElementById('btn-strafe-right').onclick = () => handleStrafe(1);
document.getElementById('btn-turn-left').onclick = () => handleRotate(-1);
document.getElementById('btn-turn-right').onclick = () => handleRotate(1);
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
/**
 * Generates a high-quality pro-level retro stone wall texture.
 * Features noise, cracks, and beveled edges for depth.
 */
async function start() {
    const loadImage = (url) => new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload  = () => { console.log('Loaded:', url); resolve(img); };
        img.onerror = () => { console.error('Failed to load image:', url); resolve(null); };
        img.src = url;
    });

    updateStatsUI();
    
    // Load all entity definitions and sprites
    for (const [key, def] of Object.entries(EntityDefs)) {
        try {
            def.vector = await loadMonsterFromFile(def.file);
        } catch (e) {}
        if (def.spriteFile) {
            const rawImg = await loadImage(def.spriteFile + '?v=' + Date.now());
            if (rawImg) {
                def.sprite = rawImg;
            } else {
                console.warn('Failed to load sprite for ' + key);
            }
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
