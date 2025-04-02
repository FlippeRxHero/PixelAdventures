/* Import a pixelated font from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

body {
    margin: 0;
    padding: 0;
    font-family: 'Press Start 2P', cursive;
    background-color: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.container {
    background-color: #f5e050;
    width: 100%;
    max-width: 400px;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-image: linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
    background-size: 10px 10px;
}

.stats-bar {
    background-color: #8b4513;
    color: #fff;
    padding: 10px;
    border: 2px solid #000;
    text-align: center;
}

.stats-bar h1 {
    margin: 0;
    font-size: 20px;
    text-shadow: 2px 2px #000;
}

.stats-bar p {
    margin: 5px 0 0;
    font-size: 12px;
    text-shadow: 1px 1px #000;
}

.menu {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 20px 0;
}

.menu h2 {
    text-align: center;
    margin: 0 0 10px;
    font-size: 16px;
    text-shadow: 2px 2px #000;
}

button {
    padding: 15px;
    font-size: 14px;
    font-family: 'Press Start 2P', cursive;
    border: 2px solid #000;
    border-radius: 0;
    cursor: pointer;
    color: #fff;
    text-shadow: 1px 1px #000;
    box-shadow: 4px 4px #000;
}

button:disabled {
    background-color: #888;
    cursor: not-allowed;
    color: #ccc;
    text-shadow: none;
}

.red { background-color: #ff4444; }
.orange { background-color: #ff8c00; }
.green { background-color: #00c853; }
.blue { background-color: #3f51b5; }
.purple { background-color: #9c27b0; }
.gray { background-color: #666; }
.yellow { background-color: #ffeb3b; color: #000; text-shadow: 1px 1px #fff; }

.warrior {
    background-color: #d32f2f;
    color: #fff;
    text-shadow: 1px 1px #000;
}

.mage {
    background-color: #1976d2;
    color: #fff;
    text-shadow: 1px 1px #000;
}

.rogue {
    background-color: #388e3c;
    color: #fff;
    text-shadow: 1px 1px #000;
}

.log {
    background-color: #fff;
    padding: 10px;
    border: 2px solid #000;
    box-shadow: 4px 4px #000;
    height: 100px;
    overflow-y: auto;
    font-size: 10px;
    text-shadow: 1px 1px #000;
}

.quest-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
}

.timer {
    font-size: 10px;
    color: #000;
    text-shadow: 1px 1px #fff;
    margin: 0;
}