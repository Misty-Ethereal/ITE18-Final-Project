import 'aframe';
import 'aframe-extras';
import 'aframe-environment-component';

// Import local components
import './components/slender-ai.js';
import './components/game-manager.js';

// --- UI EVENT LISTENERS ---

document.addEventListener('DOMContentLoaded', () => {
  // Toggle Light Button
  const btnLights = document.getElementById('btn-toggle-lights');
  if (btnLights) {
    btnLights.addEventListener('click', toggleLight);
  }

  // Rotation X Slider
  const rotX = document.getElementById('rot-x');
  if (rotX) {
    rotX.addEventListener('input', (e) => {
      document.querySelector('#enemy').setAttribute('slender-ai', 'xOffset', e.target.value);
    });
  }

  // Rotation Y Slider
  const rotY = document.getElementById('rot-y');
  if (rotY) {
    rotY.addEventListener('input', (e) => {
      document.querySelector('#enemy').setAttribute('slender-ai', 'yOffset', e.target.value);
    });
  }

  // Start / Toggle Enemy Button
  const btnStart = document.getElementById('btn-start');
  if (btnStart) {
    btnStart.addEventListener('click', toggleEnemy);
  }
  // Win popup buttons
  const btnRestart = document.getElementById('btn-restart');
  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      location.reload();
    });
  }

  const btnExit = document.getElementById('btn-exit');
  if (btnExit) {
    btnExit.addEventListener('click', () => {
      window.close();  // Closes window/tab if possible
      // Fallback for browsers that block window.close()
      setTimeout(() => {
        if (document.hasFocus()) {
          alert('Close this tab to fully exit the game.');
        }
      }, 200);
    });
  }
});

// --- HELPER FUNCTIONS ---

function toggleLight() {
  const scene = document.querySelector('a-scene');
  let amb = document.querySelector('#dev-ambient');
  if (!amb) {
    amb = document.createElement('a-entity');
    amb.setAttribute('id', 'dev-ambient');
    amb.setAttribute('light', 'type: ambient; intensity: 1.5; color: #FFF');
    scene.appendChild(amb);
    document.querySelector('a-scene').setAttribute('fog', 'density: 0');
  } else {
    amb.remove();
    document.querySelector('a-scene').setAttribute('fog', 'density: 0.15');
  }
}

function toggleEnemy() {
  const enemy = document.querySelector('#enemy');
  enemy.components['slender-ai'].toggleFreeze();

  const btn = document.getElementById('btn-start');
  if (btn.innerText === 'START GAME') {
    btn.innerText = 'PAUSE ENEMY';
    btn.style.background = 'red';
    const amb = document.querySelector('#dev-ambient');
    if (amb) amb.remove();
    document.querySelector('a-scene').setAttribute('fog', 'density: 0.15');
  } else {
    btn.innerText = 'START GAME';
    btn.style.background = 'lime';
    toggleLight();
  }
}