import { STORY_DATA } from '../data/story.js';

export class StorySystem {
    constructor(game) {
        this.game = game;
        this.flags = new Set(); // Track seen story IDs
        this.activeStory = null;
        this.isOpen = false;

        // UI References
        this.overlay = document.getElementById('story-overlay');
        this.header = document.getElementById('story-header');
        this.text = document.getElementById('story-text');
        this.imgContainer = document.getElementById('story-img-container');
    }

    checkTrigger(levelId, x, y) {
        if (this.isOpen) return;

        const stories = STORY_DATA[levelId] || [];
        const story = stories.find(s => Math.floor(s.x) === Math.floor(x) && Math.floor(s.y) === Math.floor(y));

        if (story) {
            if (story.once && this.flags.has(story.id)) return;
            this.showStory(story);
        }
    }

    showStory(story) {
        this.activeStory = story;
        this.isOpen = true;
        this.flags.add(story.id);

        // Update UI
        this.header.innerText = story.title || "NARRATIVE";
        this.text.innerText = story.text;
        
        // Handle illustration
        this.imgContainer.innerHTML = '';
        if (story.img) {
            const img = new Image();
            img.src = story.img;
            this.imgContainer.appendChild(img);
            this.imgContainer.classList.remove('hidden');
        } else {
            this.imgContainer.classList.add('hidden');
        }

        // Show Overlay
        this.overlay.classList.remove('hidden');
        
        // Pause game input if needed (handled in main.js state)
    }

    close() {
        this.isOpen = false;
        this.activeStory = null;
        this.overlay.classList.add('hidden');
    }
}
