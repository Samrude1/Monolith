import { EntityDefs } from '../data/entities/registry.js';

export class CombatSystem {
    constructor(playerState, engine, uiManager, sounds) {
        this.playerState = playerState;
        this.engine = engine;
        this.uiManager = uiManager;
        this.sounds = sounds;
    }

    rollDice(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }

    checkLevelUp() {
        const xpNeeded = this.playerState.charLevel * 100;
        if (this.playerState.xp >= xpNeeded) {
            this.playerState.charLevel++;
            this.playerState.xp -= xpNeeded;
            this.playerState.maxHp += 20;
            this.playerState.hp = this.playerState.maxHp;
            
            this.uiManager.addLog(`*** LEVEL UP! You are now level ${this.playerState.charLevel}! ***`);
            this.uiManager.addLog(`Max HP increased to ${this.playerState.maxHp}.`);
            this.sounds.playLevelUp();
            this.uiManager.updateStatsUI();
            
            this.uiManager.flashLevelUp();
            
            this.checkLevelUp();
        }
    }

    handleMonsterDeath(monster, xpGain) {
        this.uiManager.addLog(`The ${monster.monsterType.toUpperCase()} has been defeated!`);
        this.playerState.xp += xpGain;
        this.checkLevelUp();
        this.engine.entities = this.engine.entities.filter(e => e !== monster);
    }

    onEntityAttack(monster, dmg) {
        let finalDmg = dmg;
        const armorDef = this.playerState.equippedArmor ? (this.playerState.equippedArmor.def || 0) : 0;
        
        if (this.playerState.isDefending) {
            const weapon = this.playerState.equippedWeapon;
            const weaponDef = weapon ? (weapon.def || 0) : 0;
            const weaponDmgDie = weapon ? (weapon.damage || 4) : 4;
            
            const blockRoll = this.rollDice(20) + weaponDef;
            
            if (blockRoll >= 18) {
                // PERFECT PARRY
                this.uiManager.addLog(`*PERFECT PARRY*! (Rolled ${blockRoll})`);
                this.sounds.playTake(); 
                
                const reflectDmg = this.rollDice(weaponDmgDie) + 5;
                monster.hp -= reflectDmg;
                this.uiManager.addLog(`You deflect the blow and strike back for ${reflectDmg} DMG!`);
                finalDmg = 0;

                this.uiManager.flashParry();
            } else if (blockRoll >= 10) {
                // SUCCESSFUL BLOCK
                const blockAmount = this.rollDice(6) + weaponDef + armorDef;
                finalDmg = Math.max(0, dmg - blockAmount);
                this.uiManager.addLog(`You block! (Rolled ${blockRoll}) Reduced dmg to ${finalDmg}.`);
                this.sounds.playStep();
                
                const reflectDmg = this.rollDice(4);
                monster.hp -= reflectDmg;
                this.uiManager.addLog(`Quick counter-attack deals ${reflectDmg} DMG.`);
            } else {
                // FAILED BLOCK
                finalDmg = Math.max(1, dmg - armorDef);
                this.uiManager.addLog(`Your guard was broken! (Rolled ${blockRoll}) Takes ${finalDmg} HP!`);
                this.sounds.playMonsterHit();
            }

            if (monster.hp <= 0) {
                this.handleMonsterDeath(monster, 15);
            }
        } else {
            finalDmg = Math.max(1, dmg - armorDef);
            this.uiManager.addLog(`The ${monster.monsterType.toUpperCase()} hits you for ${finalDmg} HP! (Def: ${armorDef})`);
            this.sounds.playMonsterHit();
        }

        this.playerState.hp -= finalDmg;
        this.uiManager.updateStatsUI();
        
        this.uiManager.flashDamage();
        
        if (this.playerState.hp <= 0) {
            this.uiManager.showGameOver();
            this.uiManager.addLog("YOU HAVE PERISHED...");
            this.sounds.playGameOver();
        }
    }

    handleDefend(btnElement) {
        if (this.playerState.defendCooldown > 0) return;

        this.uiManager.addLog("You raise your guard!");
        this.playerState.isDefending = true;
        this.playerState.defendCooldown = 4000; 
        
        if (btnElement) {
            btnElement.style.boxShadow = "0 0 15px #0f0";
            btnElement.innerText = "BLOCKING";
            
            setTimeout(() => {
                this.playerState.isDefending = false;
                btnElement.style.boxShadow = "none";
                btnElement.innerText = "DEFEND";
            }, 2500);
        } else {
            setTimeout(() => {
                this.playerState.isDefending = false;
            }, 2500);
        }
    }

    handleAttack() {
        if (this.playerState.attackCooldown > 0) return;
        this.playerState.isDefending = false; 

        const monster = this.engine.attack();
        
        if (monster) {
            const weapon = this.playerState.equippedWeapon;
            const weaponAtk = weapon ? (weapon.atk || 0) : 0;
            const weaponDmgDie = weapon ? (weapon.damage || 4) : 4;
            
            const hitRoll = this.rollDice(20);
            let totalDmg = 0;
            
            if (hitRoll === 20) {
                totalDmg = this.rollDice(weaponDmgDie) + this.rollDice(weaponDmgDie) + weaponAtk + 5;
                this.uiManager.addLog(`*** CRITICAL HIT! *** Rolled a 20!`);
                this.uiManager.addLog(`You obliterate the ${monster.monsterType.toUpperCase()} for ${totalDmg} DMG!`);
                this.sounds.playHit();
                this.sounds.playTake(); 
            } else if (hitRoll === 1) {
                this.uiManager.addLog(`*CRITICAL MISS*! Rolled a 1! Your swing goes wild.`);
                this.sounds.playMiss();
                this.playerState.attackCooldown += 2000;
                return;
            } else if (hitRoll + weaponAtk >= 8) {
                totalDmg = this.rollDice(weaponDmgDie) + weaponAtk;
                this.uiManager.addLog(`You hit ${monster.monsterType.toUpperCase()} for ${totalDmg} DMG! (Roll: ${hitRoll}+${weaponAtk})`);
                this.sounds.playHit();
            } else {
                this.uiManager.addLog(`You missed! (Roll: ${hitRoll}+${weaponAtk} vs AC 8)`);
                this.sounds.playMiss();
                return;
            }
            
            monster.hp -= totalDmg;
            monster.hitTimer = 0.15; 
            this.playerState.attackCooldown = weapon ? (weapon.cooldown || 4000) : 2500; 
            
            if (hitRoll === 20) {
                this.uiManager.flashCritical();
            }

            if (monster.hp <= 0) {
                this.handleMonsterDeath(monster, 20);
                this.playerState.gold += 10;
                
                if (Math.random() > 0.4) { 
                    const lootOptions = ['food', 'gold_pile', 'health_potion', 'sword', 'dagger', 'mace', 'leather_armor'];
                    const lootType = lootOptions[Math.floor(Math.random() * lootOptions.length)];
                    
                    this.engine.entities.push({
                        type: 'object',
                        monsterType: lootType, 
                        x: monster.x,
                        y: monster.y
                    });
                    this.uiManager.addLog(`The monster dropped a ${lootType.toUpperCase()}!`);
                }
                this.uiManager.updateStatsUI();
            }
        } else {
            this.uiManager.addLog("You swing at the empty air.");
            this.playerState.attackCooldown = 1500; 
        }
    }
}
