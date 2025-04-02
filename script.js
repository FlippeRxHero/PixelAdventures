// Security: Sanitize input to prevent XSS
function sanitizeInput(str) {
    const temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
}

// Game State with Validation
let player = {
    level: 1,
    xp: 0,
    xpToNextLevel: 150,
    hp: 100,
    maxHp: 100,
    energy: 50,
    maxEnergy: 50,
    gold: 0,
    characterType: null,
    damage: 10,
    inventory: [],
    gear: { weapon: null, armor: null },
    achievements: {
        monstersDefeated: 0,
        questsCompleted: 0,
        itemsCrafted: 0,
        darkKingDefeated: false
    },
    currentQuest: null,
    questProgress: 0,
    questStartTime: null,
    completedQuests: []
};

// Track the current monster in combat
let currentMonster = null;

// Game Constants (Immutable)
const GAME_CONSTANTS = Object.freeze({
    MONSTER_XP: 10,
    MONSTER_GOLD: 5,
    ENERGY_REGEN_RATE: 1,
    ENERGY_REGEN_INTERVAL: 1 * 60 * 1000,
    ATTACK_AGAIN_CHANCE: 0.5,
    CRITICAL_HIT_CHANCE: 0.2
});

// Monster Types (Immutable)
const MONSTER_TYPES = Object.freeze([
    { name: "Goblin", difficulty: "Easy", hp: 20, damage: 5, lootTier: "Common" },
    { name: "Skeleton", difficulty: "Medium", hp: 30, damage: 8, lootTier: "Uncommon" },
    { name: "Wolf", difficulty: "Hard", hp: 40, damage: 12, lootTier: "Rare" }
]);

// Loot Table (Immutable)
const LOOT = Object.freeze([
    { name: "Leather", rarity: "Common", chance: 0.5 },
    { name: "Iron Ore", rarity: "Common", chance: 0.5 },
    { name: "Magic Crystal", rarity: "Uncommon", chance: 0.3 },
    { name: "Rusty Sword", rarity: "Rare", chance: 0.1 },
    { name: "Dragon Scale", rarity: "Legendary", chance: 0.02 }
]);

// Quests (Immutable)
const QUESTS = Object.freeze([
    {
        id: 1,
        name: "The Village’s Plea",
        timeLimit: 1 * 60 * 60 * 1000,
        progressPerAction: 20,
        story: "The village elder, Mara, approaches you with a desperate look. 'Hero, the Goblins have stolen our sacred relic, the Lightstone! It’s been passed down for generations, a gift from the Order of the Light. Please, recover it before the Dark King’s curse grows stronger.'",
        onStart: "Mara hands you a map. 'The Goblins are hiding in the nearby forest. Be careful—they’re small but vicious!'",
        onProgress: "You venture into the forest, hearing the cackle of Goblins. You find some tracks leading to their camp.",
        onComplete: "You retrieve the Lightstone from the Goblin camp! Mara thanks you with tears in her eyes. 'This relic will protect our village. You’re a true descendant of the Order of the Light!'",
        reward: { xp: 50, gold: 20, item: "Lightstone Shard" }
    },
    {
        id: 2,
        name: "The Blacksmith’s Request",
        timeLimit: 2 * 60 * 60 * 1000,
        progressPerAction: 20,
        story: "The village blacksmith, Torin, recognizes the Lightstone Shard. 'That shard… it’s part of a greater artifact. I can forge a weapon to fight the Dark King, but I need Iron Ore from the mines. They’re overrun with Skeletons now.'",
        onStart: "Torin sharpens your blade. 'The mines are dangerous, but I believe in you. Bring me the ore, and I’ll make you a weapon worthy of a hero.'",
        onProgress: "You descend into the mines, the air thick with dust. A Skeleton lunges at you, but you dodge just in time.",
        onComplete: "You return with the Iron Ore. Torin grins. 'Well done! With this, I’ve forged the Blade of Dawn. It’s not much, but it’ll grow stronger as you do.'",
        reward: { xp: 60, gold: 30, item: "Blade of Dawn" }
    },
    {
        id: 3,
        name: "The Lost Scholar",
        timeLimit: 3 * 60 * 60 * 1000,
        progressPerAction: 20,
        story: "A scholar named Elara seeks your help. 'I’ve been studying the Dark King’s curse. He was once a member of the Order of the Light, but he sought forbidden power. I need you to find my research notes in the Ruined Library, guarded by Wolves.'",
        onStart: "Elara hands you a tattered journal. 'My notes are in the library’s archive. Be wary—the Wolves are drawn to the curse’s magic.'",
        onProgress: "You enter the Ruined Library, the air heavy with the scent of decay. A Wolf howls in the distance as you search the shelves.",
        onComplete: "You find Elara’s notes and return them to her. She reads them eagerly. 'This confirms it—the Dark King’s power comes from the Shadow Crystal. We must destroy it!'",
        reward: { xp: 70, gold: 40, item: "Elara’s Journal" }
    },
    {
        id: 4,
        name: "The Cursed Forest",
        timeLimit: 4 * 60 * 60 * 1000,
        progressPerAction: 20,
        story: "Elara points to a map. 'The Shadow Crystal is hidden in the Cursed Forest, where the Dark King’s magic is strongest. We need to weaken his hold by destroying the cursed totems there.'",
        onStart: "Elara warns you, 'The forest is alive with dark magic. The totems are guarded by corrupted creatures. Stay sharp!'",
        onProgress: "You hack through thorny vines in the Cursed Forest. A corrupted creature snarls as you approach a totem, but you smash it with a satisfying crunch.",
        onComplete: "The last totem shatters, and the forest grows quieter. Elara nods. 'The Dark King’s grip is weakening. You’re closer to facing him.'",
        reward: { xp: 80, gold: 50 }
    },
    {
        id: 5,
        name: "The Forgotten Temple",
        timeLimit: 5 * 60 * 60 * 1000,
        progressPerAction: 20,
        story: "Mara tells you of an ancient temple of the Order of the Light. 'It holds a relic that can shield you from the Dark King’s magic. But the temple is sealed, and only a true hero can enter.'",
        onStart: "Mara gives you a pendant. 'This belonged to your ancestor. It will unlock the temple. Prove your worth within.'",
        onProgress: "The temple doors creak open. Inside, you face trials of courage—dodging traps and solving ancient puzzles.",
        onComplete: "You claim the Shield of Light from the temple’s altar. Mara smiles. 'Your ancestor would be proud. This shield will protect you.'",
        reward: { xp: 90, gold: 60, item: "Shield of Light" }
    },
    {
        id: 6,
        name: "The Traitor’s Lair",
        timeLimit: 6 * 60 * 60 * 1000,
        progressPerAction: 20,
        story: "Elara uncovers a traitor in the village. 'One of the Dark King’s spies has been feeding him information. They’re hiding in a lair near the cliffs. We must stop them!'",
        onStart: "Elara whispers, 'The traitor is cunning. They’ve set traps in the lair. Watch your step, hero.'",
        onProgress: "You navigate the lair, disarming traps and finding clues. The traitor’s voice echoes, 'You’ll never stop the Dark King!'",
        onComplete: "You confront the traitor and defeat them. They sneer, 'The Dark King will crush you…' but you find a map to his fortress.",
        reward: { xp: 100, gold: 70, item: "Traitor’s Map" }
    },
    {
        id: 7,
        name: "The Crystal Caverns",
        timeLimit: 7 * 60 * 60 * 1000,
        progressPerAction: 20,
        story: "The Traitor’s Map leads to the Crystal Caverns, where a fragment of the Shadow Crystal is hidden. 'We must destroy it to weaken the Dark King,' Elara says.",
        onStart: "Elara equips you with a crystal hammer. 'This will shatter the fragment. But the caverns are filled with dark energy.'",
        onProgress: "The caverns glow with an eerie light. You feel the Dark King’s presence as you chip away at the crystal fragment.",
        onComplete: "The fragment shatters with a deafening crack! Elara cheers, 'The Dark King’s power is fading. We’re almost ready to face him.'",
        reward: { xp: 110, gold: 80 }
    },
    {
        id: 8,
        name: "The Ally’s Sacrifice",
        timeLimit: 8 * 60 * 60 * 1000,
        progressPerAction: 20,
        story: "Torin reveals a secret. 'I was once part of the Order of the Light. I failed to stop the Dark King 100 years ago. I’ll help you now, even if it costs me my life.'",
        onStart: "Torin forges a final weapon. 'This is the Sunblade, infused with the Lightstone. I’ll hold off the Dark King’s minions while you prepare.'",
        onProgress: "You hear Torin’s battle cries as he fights off waves of monsters. You gather the last materials needed for the Sunblade.",
        onComplete: "Torin falls, but the Sunblade is complete. His last words are, 'End this… for Eldoria.' You vow to honor his sacrifice.",
        reward: { xp: 120, gold: 90, item: "Sunblade" }
    },
    {
        id: 9,
        name: "The Final Preparations",
        timeLimit: 9 * 60 * 60 * 1000,
        progressPerAction: 20,
        story: "Elara gathers the village. 'The Dark King knows you’re coming. We must rally the people of Eldoria to support you in the final battle.'",
        onStart: "Elara rallies the villagers. 'We’ll distract the Dark King’s forces. You must prepare for the journey to his fortress.'",
        onProgress: "The villagers cheer as you train with the Sunblade. You feel the weight of their hopes on your shoulders.",
        onComplete: "The village is ready. Elara hands you a vial. 'This is a potion of courage. You’ll need it for what’s ahead. Go, hero!'",
        reward: { xp: 130, gold: 100, item: "Potion of Courage" }
    },
    {
        id: 10,
        name: "The Path to the Dark King",
        timeLimit: 10 * 60 * 60 * 1000,
        progressPerAction: 20,
        story: "The time has come. The Dark King’s fortress looms in the distance, a towering spire of shadow. You must cross the Wastelands to reach him.",
        onStart: "Elara stands by your side. 'This is it, hero. The Wastelands are treacherous, but you carry the hopes of Eldoria. We believe in you.'",
        onProgress: "You traverse the Wastelands, battling through storms of dark magic. The Dark King’s voice echoes, 'You cannot stop fate, descendant of the Light!'",
        onComplete: "You stand before the fortress gates. The Dark King awaits. Elara’s voice echoes in your mind: 'You are the last hope of the Order of the Light. End this curse!'",
        reward: { xp: 150, gold: 120 }
    }
]);

// Crafting Recipes (Immutable)
const RECIPES = Object.freeze([
    { name: "Iron Sword", materials: [{ name: "Iron Ore", qty: 4 }, { name: "Leather", qty: 2 }], effect: { damage: 5 } },
    { name: "Leather Armor", materials: [{ name: "Leather", qty: 5 }], effect: { maxHp: 10 } },
    { name: "Dragon Staff", materials: [{ name: "Dragon Scale", qty: 2 }, { name: "Magic Crystal", qty: 3 }], effect: { damage: 20, maxEnergy: 10 } },
    { name: "Crystal Shield", materials: [{ name: "Magic Crystal", qty: 4 }, { name: "Iron Ore", qty: 3 }], effect: { maxHp: 15 } },
    { name: "Shadow Dagger", materials: [{ name: "Rusty Sword", qty: 2 }, { name: "Dragon Scale", qty: 1 }], effect: { damage: 10 } }
]);

// Bosses (Immutable)
const BOSSES = Object.freeze([
    { level: 5, name: "Giant Rat King", hp: 150, reward: { xp: 100, gold: 50, loot: "Rat King's Tail" } },
    { level: 10, name: "Orc Warlord", hp: 300, reward: { xp: 200, gold: 100, loot: "Orcish Blade" } },
    { level: 20, name: "Dark King", hp: 1000, reward: { xp: 1000, gold: 1000, loot: "Dark Crown" } }
]);

// Load saved game with validation
function loadGame() {
    try {
        const saved = localStorage.getItem("pixelAdventures");
        if (saved) {
            const parsed = JSON.parse(saved);
            if (typeof parsed === "object" && parsed !== null) {
                player = Object.assign({}, player, parsed);
                player.level = Math.max(1, Math.min(100, Number(player.level) || 1));
                player.hp = Math.max(0, Math.min(player.maxHp, Number(player.hp) || 100));
                player.energy = Math.max(0, Math.min(player.maxEnergy, Number(player.energy) || 50));
                player.gold = Math.max(0, Number(player.gold) || 0);
                if (player.characterType) {
                    document.getElementById("character-selection").style.display = "none";
                    document.getElementById("main-menu").style.display = "flex";
                    updateStats();
                    updateBossButton();
                    updateQuestButton();
                    updateQuestTimer();
                }
            }
        }
    } catch (e) {
        log("Error loading game: " + sanitizeInput(e.message));
    }
}

// Save game with sanitization
function saveGame() {
    try {
        const safePlayer = JSON.parse(JSON.stringify(player));
        localStorage.setItem("pixelAdventures", JSON.stringify(safePlayer));
    } catch (e) {
        log("Error saving game: " + sanitizeInput(e.message));
    }
}

// Update stats display
function updateStats() {
    try {
        const stats = `Level: ${player.level} | HP: ${player.hp}/${player.maxHp} | Energy: ${player.energy}/${player.maxEnergy} | Gold: ${player.gold}`;
        document.getElementById("stats").innerText = sanitizeInput(stats);
    } catch (e) {
        log("Error updating stats: " + sanitizeInput(e.message));
    }
}

// Log messages with sanitization
function log(message) {
    try {
        document.getElementById("log").innerText = sanitizeInput(message);
    } catch (e) {
        console.error("Error logging message: ", e);
    }
}

// Update Quest Button Text
function updateQuestButton() {
    try {
        const questButton = document.getElementById("quest-button");
        if (player.currentQuest) {
            questButton.innerText = "Progress Quest";
        } else {
            const nextQuest = QUESTS.find(q => !player.completedQuests.includes(q.id));
            if (nextQuest) {
                questButton.innerText = `Start ${nextQuest.name}`;
            } else {
                questButton.innerText = "All Quests Completed";
                questButton.disabled = true;
            }
        }
    } catch (e) {
        log("Error updating quest button: " + sanitizeInput(e.message));
    }
}

// Update Quest Timer Display
function updateQuestTimer() {
    try {
        const timerDisplay = document.getElementById("quest-timer");
        if (player.currentQuest) {
            const elapsedTime = Date.now() - player.questStartTime;
            const timeRemaining = player.currentQuest.timeLimit - elapsedTime;
            if (timeRemaining <= 0) {
                log(`Time’s up! You failed to complete "${sanitizeInput(player.currentQuest.name)}" in time. The quest has been reset.`);
                player.currentQuest = null;
                player.questProgress = 0;
                player.questStartTime = null;
                updateQuestButton();
                timerDisplay.innerText = "";
                return;
            }
            const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000));
            const minutesRemaining = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
            timerDisplay.innerText = `Time Remaining: ${hoursRemaining}h ${minutesRemaining}m`;
        } else {
            timerDisplay.innerText = "";
        }
    } catch (e) {
        log("Error updating quest timer: " + sanitizeInput(e.message));
    }
}

// Update Timer Every Second
setInterval(updateQuestTimer, 1000);

// Character Selection
function selectCharacter(type) {
    try {
        const validTypes = ["Warrior", "Mage", "Rogue"];
        if (!validTypes.includes(type)) {
            log("Invalid character type!");
            return;
        }
        player.characterType = type;
        if (type === "Warrior") {
            player.maxHp += 10;
            player.hp = player.maxHp;
            player.damage += 0.5;
        } else if (type === "Mage") {
            player.maxEnergy += 5;
            player.energy = player.maxEnergy;
        } else if (type === "Rogue") {
            player.gold += 10;
        }
        document.getElementById("character-selection").style.display = "none";
        document.getElementById("main-menu").style.display = "flex";
        updateStats();
        saveGame();
        log(`You are now a ${sanitizeInput(type)}! Start your adventure in the cursed land of Eldoria.`);
    } catch (e) {
        log("Error selecting character: " + sanitizeInput(e.message));
    }
}

// Fight Monster
function fightMonster() {
    try {
        if (player.hp <= 0) {
            log("You are defeated! Restoring HP...");
            player.hp = player.maxHp;
            updateStats();
            return;
        }

        if (!currentMonster) {
            if (player.energy < 5) {
                log("Not enough Energy! Wait for it to regenerate or buy more.");
                return;
            }
            player.energy -= 5;
            const monsterType = MONSTER_TYPES[Math.floor(Math.random() * MONSTER_TYPES.length)];
            currentMonster = {
                name: monsterType.name,
                difficulty: monsterType.difficulty,
                hp: monsterType.hp,
                maxHp: monsterType.hp,
                damage: monsterType.damage,
                lootTier: monsterType.lootTier
            };
            log(`A ${sanitizeInput(currentMonster.name)} (${sanitizeInput(currentMonster.difficulty)}) appears! HP: ${currentMonster.hp}/${currentMonster.maxHp}.`);
        }

        let damageDealt = player.damage;
        const isCritical = Math.random() <= GAME_CONSTANTS.CRITICAL_HIT_CHANCE;
        if (isCritical) {
            damageDealt *= 2;
            log(`Critical Hit! You strike the ${sanitizeInput(currentMonster.name)} for ${damageDealt} damage!`);
        } else {
            log(`You attack the ${sanitizeInput(currentMonster.name)} for ${damageDealt} damage!`);
        }
        currentMonster.hp -= damageDealt;

        let damageTaken = 0;
        if (currentMonster.hp > 0) {
            damageTaken = currentMonster.damage;
            player.hp -= damageTaken;
            log(`The ${sanitizeInput(currentMonster.name)} retaliates, dealing ${damageTaken} damage to you! Your HP: ${player.hp}/${player.maxHp}. Monster HP: ${currentMonster.hp}/${currentMonster.maxHp}.`);
        }

        if (currentMonster.hp <= 0) {
            player.xp += GAME_CONSTANTS.MONSTER_XP;
            player.gold += GAME_CONSTANTS.MONSTER_GOLD * (player.characterType === "Rogue" ? 1.1 : 1);
            player.achievements.monstersDefeated++;
            const loot = dropLoot(currentMonster.lootTier);
            if (loot) {
                player.inventory.push(loot);
                log(`You defeated the ${sanitizeInput(currentMonster.name)}! Gained ${GAME_CONSTANTS.MONSTER_XP} XP, ${GAME_CONSTANTS.MONSTER_GOLD} Gold, and found ${sanitizeInput(loot)}.`);
            } else {
                log(`You defeated the ${sanitizeInput(currentMonster.name)}! Gained ${GAME_CONSTANTS.MONSTER_XP} XP, ${GAME_CONSTANTS.MONSTER_GOLD} Gold.`);
            }
            currentMonster = null;
            checkLevelUp();
        } else {
            const roll = Math.random();
            if (roll <= GAME_CONSTANTS.ATTACK_AGAIN_CHANCE) {
                log(`The ${sanitizeInput(currentMonster.name)} is weakened! Monster HP: ${currentMonster.hp}/${currentMonster.maxHp}. You feel a surge of adrenaline! Click "Fight Monsters" to attack again (no Energy cost).`);
            } else {
                log(`The ${sanitizeInput(currentMonster.name)} stands strong! Monster HP: ${currentMonster.hp}/${currentMonster.maxHp}.`);
            }
        }

        updateStats();
        saveGame();
    } catch (e) {
        log("Error fighting monster: " + sanitizeInput(e.message));
    }
}

// Drop Loot Based on Monster Difficulty
function dropLoot(lootTier) {
    try {
        const roll = Math.random();
        let chanceMultiplier = 1;

        if (lootTier === "Common") chanceMultiplier = 0.8;
        else if (lootTier === "Uncommon") chanceMultiplier = 1.2;
        else if (lootTier === "Rare") chanceMultiplier = 1.5;

        let chance = 0;
        for (let item of LOOT) {
            if (lootTier === "Common" && item.rarity !== "Common") continue;
            if (lootTier === "Uncommon" && item.rarity === "Legendary") continue;
            chance += (item.chance * chanceMultiplier) * (player.characterType === "Rogue" ? 1.05 : 1);
            if (roll <= chance) return item.name;
        }
        return null;
    } catch (e) {
        log("Error dropping loot: " + sanitizeInput(e.message));
        return null;
    }
}

// Do Quest
function doQuest() {
    try {
        if (player.energy < 3) {
            log("Not enough Energy! Wait for it to regenerate or buy more.");
            return;
        }

        if (!player.currentQuest) {
            const nextQuest = QUESTS.find(q => !player.completedQuests.includes(q.id));
            if (!nextQuest) {
                log("You’ve completed all quests! Prepare to face the Dark King.");
                return;
            }

            player.currentQuest = nextQuest;
            player.questProgress = 0;
            player.questStartTime = Date.now();
            log(`${sanitizeInput(player.currentQuest.story)}\n${sanitizeInput(player.currentQuest.onStart)}\nProgress: ${player.questProgress}% | Time Limit: ${Math.floor(player.currentQuest.timeLimit / (60 * 60 * 1000))} hours`);
            updateQuestButton();
            updateQuestTimer();
        } else {
            const elapsedTime = Date.now() - player.questStartTime;
            if (elapsedTime > player.currentQuest.timeLimit) {
                log(`Time’s up! You failed to complete "${sanitizeInput(player.currentQuest.name)}" in time. The quest has been reset.`);
                player.currentQuest = null;
                player.questProgress = 0;
                player.questStartTime = null;
                updateQuestButton();
                updateQuestTimer();
                return;
            }

            player.energy -= 3;
            player.questProgress += player.currentQuest.progressPerAction;
            if (player.questProgress >= 100) {
                player.xp += player.currentQuest.reward.xp;
                player.gold += player.currentQuest.reward.gold;
                if (player.currentQuest.reward.item) {
                    player.inventory.push(player.currentQuest.reward.item);
                }
                player.achievements.questsCompleted++;
                player.completedQuests.push(player.currentQuest.id);
                log(`${sanitizeInput(player.currentQuest.onComplete)}\nReward: ${player.currentQuest.reward.xp} XP, ${player.currentQuest.reward.gold} Gold${player.currentQuest.reward.item ? `, ${sanitizeInput(player.currentQuest.reward.item)}` : ""}`);
                player.currentQuest = null;
                player.questProgress = 0;
                player.questStartTime = null;
                checkLevelUp();
                updateQuestButton();
                updateQuestTimer();
            } else {
                const timeRemaining = player.currentQuest.timeLimit - elapsedTime;
                const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000));
                const minutesRemaining = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
                log(`${sanitizeInput(player.currentQuest.onProgress)}\nProgress: ${player.questProgress}% | Time Remaining: ${hoursRemaining}h ${minutesRemaining}m`);
            }
        }

        updateStats();
        saveGame();
    } catch (e) {
        log("Error doing quest: " + sanitizeInput(e.message));
    }
}

// Craft Gear
function craftGear() {
    try {
        let canCraft = false;
        let recipeToCraft = null;
        for (let recipe of RECIPES) {
            let hasMaterials = true;
            for (let mat of recipe.materials) {
                const count = player.inventory.filter(item => item === mat.name).length;
                if (count < mat.qty) {
                    hasMaterials = false;
                    break;
                }
            }
            if (hasMaterials) {
                canCraft = true;
                recipeToCraft = recipe;
                break;
            }
        }

        if (!canCraft) {
            log("You don't have enough materials to craft anything! Check the Crafting Recipes menu for requirements.");
            return;
        }

        for (let mat of recipeToCraft.materials) {
            for (let i = 0; i < mat.qty; i++) {
                const index = player.inventory.indexOf(mat.name);
                if (index !== -1) player.inventory.splice(index, 1);
            }
        }

        if (recipeToCraft.effect.damage) {
            player.damage += recipeToCraft.effect.damage;
            player.gear.weapon = recipeToCraft.name;
        }
        if (recipeToCraft.effect.maxHp) {
            player.maxHp += recipeToCraft.effect.maxHp;
            player.hp += recipeToCraft.effect.maxHp;
            player.gear.armor = recipeToCraft.name;
        }
        if (recipeToCraft.effect.maxEnergy) {
            player.maxEnergy += recipeToCraft.effect.maxEnergy;
            player.energy += recipeToCraft.effect.maxEnergy;
        }

        player.achievements.itemsCrafted++;
        log(`Crafted ${sanitizeInput(recipeToCraft.name)}! Inventory: ${sanitizeInput(player.inventory.join(", "))}`);
        updateStats();
        saveGame();
    } catch (e) {
        log("Error crafting gear: " + sanitizeInput(e.message));
    }
}

// View Crafting Recipes
function viewCraftingRecipes() {
    try {
        let recipeList = "Crafting Recipes:\n";
        RECIPES.forEach(recipe => {
            const materials = recipe.materials.map(mat => `${sanitizeInput(mat.name)} (${mat.qty})`).join(", ");
            recipeList += `${sanitizeInput(recipe.name)}: ${materials}\n`;
        });
        log(recipeList);
    } catch (e) {
        log("Error viewing recipes: " + sanitizeInput(e.message));
    }
}

// Visit Blacksmith
function visitBlacksmith() {
    try {
        if (player.gold >= 50) {
            player.gold -= 50;
            player.energy += 10;
            if (player.energy > player.maxEnergy) player.energy = player.maxEnergy;
            log("Bought 10 Energy for 50 Gold!");
        } else {
            log("Not enough Gold to buy Energy!");
        }
        updateStats();
        saveGame();
    } catch (e) {
        log("Error visiting blacksmith: " + sanitizeInput(e.message));
    }
}

// View Achievements
function viewAchievements() {
    try {
        log(`Achievements:\nMonsters Defeated: ${player.achievements.monstersDefeated}/100\nQuests Completed: ${player.achievements.questsCompleted}/20\nItems Crafted: ${player.achievements.itemsCrafted}/30\nDark King Defeated: ${player.achievements.darkKingDefeated ? "Yes" : "No"}`);
    } catch (e) {
        log("Error viewing achievements: " + sanitizeInput(e.message));
    }
}

// Fight Boss
function fightBoss() {
    try {
        const boss = BOSSES.find(b => b.level === player.level) || BOSSES[BOSSES.length - 1];
        if (!boss) {
            log("No boss available at this level!");
            return;
        }

        if (player.energy < 10) {
            log("Not enough Energy! Wait for it to regenerate or buy more.");
            return;
        }

        player.energy -= 10;
        const damageTaken = Math.floor(Math.random() * 50) + 20;
        player.hp -= damageTaken;
        boss.hp -= player.damage;

        if (boss.hp <= 0) {
            player.xp += boss.reward.xp;
            player.gold += boss.reward.gold;
            player.inventory.push(boss.reward.loot);
            if (boss.name === "Dark King") player.achievements.darkKingDefeated = true;
            log(`You defeated ${sanitizeInput(boss.name)}! Gained ${boss.reward.xp} XP, ${boss.reward.gold} Gold, and ${sanitizeInput(boss.reward.loot)}.`);
            checkLevelUp();
        } else {
            log(`${sanitizeInput(boss.name)} strikes back! You took ${damageTaken} damage. Your HP: ${player.hp}/${player.maxHp}.`);
        }

        if (player.hp <= 0) {
            log("You were defeated by the boss! Restoring HP...");
            player.hp = player.maxHp;
        }

        updateStats();
        saveGame();
    } catch (e) {
        log("Error fighting boss: " + sanitizeInput(e.message));
    }
}

// Update Boss Button
function updateBossButton() {
    try {
        const bossButton = document.getElementById("boss-button");
        if (player.level >= 20) {
            bossButton.disabled = false;
        } else if (BOSSES.some(b => b.level === player.level)) {
            const boss = BOSSES.find(b => b.level === player.level);
            bossButton.innerText = `Fight ${sanitizeInput(boss.name)} (Level ${boss.level})`;
            bossButton.disabled = false;
        } else {
            bossButton.innerText = `Dark King (Level 20)`;
            bossButton.disabled = true;
        }
    } catch (e) {
        log("Error updating boss button: " + sanitizeInput(e.message));
    }
}

// Check Level Up
function checkLevelUp() {
    try {
        if (player.xp >= player.xpToNextLevel) {
            player.level++;
            player.xp = 0;
            player.xpToNextLevel = 100 + (player.level * 50);
            player.maxHp += 10;
            player.hp = player.maxHp;
            player.maxEnergy += 5;
            player.energy = player.maxEnergy;
            log(`Level Up! You are now Level ${player.level}.`);
            updateBossButton();
        }
    } catch (e) {
        log("Error checking level up: " + sanitizeInput(e.message));
    }
}

// Open Settings
function openSettings() {
    try {
        log("Settings Menu:\n1. Reset Game (Start Over)\n\nClick the Settings button again to reset the game, or choose another action.");
        document.getElementById("settings-button").onclick = resetGame;
    } catch (e) {
        log("Error opening settings: " + sanitizeInput(e.message));
    }
}

// Reset Game
function resetGame() {
    try {
        localStorage.removeItem("pixelAdventures");
        player = {
            level: 1,
            xp: 0,
            xpToNextLevel: 150,
            hp: 100,
            maxHp: 100,
            energy: 50,
            maxEnergy: 50,
            gold: 0,
            characterType: null,
            damage: 10,
            inventory: [],
            gear: { weapon: null, armor: null },
            achievements: {
                monstersDefeated: 0,
                questsCompleted: 0,
                itemsCrafted: 0,
                darkKingDefeated: false
            },
            currentQuest: null,
            questProgress: 0,
            questStartTime: null,
            completedQuests: []
        };
        currentMonster = null;
        document.getElementById("character-selection").style.display = "flex";
        document.getElementById("main-menu").style.display = "none";
        document.getElementById("quest-button").innerText = "Start The Village’s Plea";
        document.getElementById("quest-button").disabled = false;
        document.getElementById("quest-timer").innerText = "";
        document.getElementById("settings-button").onclick = openSettings;
        updateStats();
        saveGame();
        log("Game reset! Choose your character to start over.");
    } catch (e) {
        log("Error resetting game: " + sanitizeInput(e.message));
    }
}

// Energy Regeneration
setInterval(() => {
    try {
        if (player.energy < player.maxEnergy) {
            player.energy += GAME_CONSTANTS.ENERGY_REGEN_RATE;
            if (player.energy > player.maxEnergy) player.energy = player.maxEnergy;
            updateStats();
            saveGame();
        }
    } catch (e) {
        log("Error regenerating energy: " + sanitizeInput(e.message));
    }
}, GAME_CONSTANTS.ENERGY_REGEN_INTERVAL);

// Initialize Game
try {
    loadGame();
} catch (e) {
    log("Error initializing game: " + sanitizeInput(e.message));
}