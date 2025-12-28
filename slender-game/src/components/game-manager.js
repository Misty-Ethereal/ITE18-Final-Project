/* global AFRAME */

AFRAME.registerComponent('game-manager', {
  init: function () {
    this.scene = document.querySelector('a-scene');
    this.player = document.querySelector('#player');

    if (this.scene.hasLoaded) this.createLevel();
    else this.scene.addEventListener('loaded', () => this.createLevel());

    const enemy = document.querySelector('#enemy');
    enemy.setAttribute('position', '0 0 5');
  },

  tick: function () {
    this.checkWin();
  },

  checkWin: function () {
    if (!this.exitZone || !this.player) return;
    const dist = this.player.object3D.position.distanceTo(this.exitZone.object3D.position);
    if (dist < 5) {
      this.showWinScreen();
    }
  },

  showWinScreen: function () {
    const popup = document.getElementById('win-popup');
    if (popup) {
      popup.classList.add('show');
    }

    // Disable player controls
    if (this.player) {
      this.player.setAttribute('look-controls', 'enabled: false');
      this.player.setAttribute('movement-controls', 'enabled: false');
    }

    // Freeze enemy AI
    const enemy = document.querySelector('#enemy');
    if (enemy && enemy.components && enemy.components['slender-ai']) {
      enemy.components['slender-ai'].toggleFreeze();
    }
  },

  createLevel: function () {
    this.exitZone = document.createElement('a-entity');
    this.exitZone.setAttribute('position', '0 0 -200');

    const beam = document.createElement('a-entity');
    beam.setAttribute('geometry', 'primitive: cylinder; height: 100; radius: 1; openEnded: true');
    beam.setAttribute('material', 'shader: flat; color: #FFF; opacity: 0.5; transparent: true; side: double; fog: false');
    beam.setAttribute('position', '0 50 0');
    beam.setAttribute('visible', false);

    const light = document.createElement('a-entity');
    light.setAttribute('light', 'type: point; color: #FFF; intensity: 3; distance: 40');
    light.setAttribute('position', '0 5 0');
    light.setAttribute('visible', false);

    this.exitZone.appendChild(beam);
    this.exitZone.appendChild(light);
    this.scene.appendChild(this.exitZone);

    setInterval(() => {
      beam.setAttribute('visible', true);
      light.setAttribute('visible', true);
      setTimeout(() => {
        beam.setAttribute('visible', false);
        light.setAttribute('visible', false);
      }, 3000);
    }, 20000);

    const tower = document.createElement('a-entity');
    tower.setAttribute('gltf-model', '/models/watertower.glb');
    tower.setAttribute('position', '20 0 -50');
    tower.setAttribute('scale', '2 2 2');
    tower.setAttribute('rotation', '90 0 0');
    this.scene.appendChild(tower);

    const totalTrees = 150;
    let count = 0;
    const perFrame = 10;

    const spawn = () => {
      for (let i = 0; i < perFrame; i++) {
        if (count >= totalTrees) break;

        const tree = document.createElement('a-entity');
        let x, z;
        let ok = false;
        let tries = 0;

        while (!ok && tries < 50) {
          tries++;
          x = (Math.random() - 0.5) * 300;
          z = Math.random() * -300 + 50;
          if (Math.sqrt(x * x + (z - 40) * (z - 40)) > 25 && Math.sqrt(x * x + (z + 200) * (z + 200)) > 5) ok = true;
        }

        tree.setAttribute('position', `${x} 0 ${z}`);
        tree.setAttribute('gltf-model', '/models/tree.glb');
        tree.setAttribute('shadow', 'cast: false; receive: false');

        const s = 5 + Math.random() * 5;
        tree.setAttribute('scale', `${s} ${s} ${s}`);
        tree.setAttribute('rotation', `0 ${Math.random() * 360} 0`);

        this.scene.appendChild(tree);
        count++;
      }

      if (count < totalTrees) requestAnimationFrame(spawn);
      else {
        const loader = document.getElementById('loading-screen');
        loader.style.opacity = 0;
        setTimeout(() => (loader.style.display = 'none'), 1000);
      }
    };

    spawn();
  },

});