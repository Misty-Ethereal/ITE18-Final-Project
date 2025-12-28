/* global AFRAME, THREE */

AFRAME.registerComponent('slender-ai', {
  schema: {
    stalkTime: { type: 'number', default: 60 },
    chaseSpeed: { type: 'number', default: 3.8 },
    chargeSpeed: { type: 'number', default: 9.0 },
    stopDistance: { type: 'number', default: 2.0 },
    scareDistance: { type: 'number', default: 10 },
    xOffset: { type: 'number', default: 0 },
    yOffset: { type: 'number', default: 90 }
  },

  init: function () {
    this.player = document.querySelector('#player');
    this.staticOverlay = document.querySelector('#static-overlay');
    this.audioStatic = document.querySelector('#sfx-static');

    if (this.player) this.camera = this.player.querySelector('[camera]');

    this.timeElapsed = 0;
    this.lastTeleport = 0;
    this.isStalking = true;
    this.isFrozen = true;

    this.lookAtTimer = 0;
    this.isCharging = false;

    this.tick = AFRAME.utils.throttleTick(this.tick, 50, this);
  },

  tick: function (t, dt) {
    if (!this.player) {
      this.player = document.querySelector('#player');
      return;
    }
    if (!this.camera) {
      this.camera = this.player.querySelector('[camera]');
      return;
    }
    if (!this.player.object3D || !this.camera.object3D) return;

    this.updateRotation();
    if (this.isFrozen) return;

    this.timeElapsed += dt / 1000;

    if (this.isStalking && this.timeElapsed > this.data.stalkTime) {
      this.isStalking = false;
    }

    const playerPos = this.player.object3D.position;
    const enemyPos = this.el.object3D.position;
    const distance = playerPos.distanceTo(enemyPos);
    
    const isLooking = this.isPlayerLooking();

    // ---- STATIC LOGIC ---
    if (distance < this.data.scareDistance) {
      const intensity = 1 - (distance / this.data.scareDistance);
      
      if(this.staticOverlay) this.staticOverlay.style.opacity = intensity;
      
      if(this.audioStatic) {
          if(this.audioStatic.paused) this.audioStatic.play().catch(e=>{});
          this.audioStatic.volume = Math.max(0, intensity);
      }
    } else {
        if(this.staticOverlay) this.staticOverlay.style.opacity = 0;
        if(this.audioStatic) this.audioStatic.pause();
    }

    // --- AI MOVEMENT ---
    if (this.isStalking) {
      if (this.timeElapsed - this.lastTeleport > 10) {
        this.teleportInFront(playerPos);
        this.lastTeleport = this.timeElapsed;
        this.lookAtTimer = 0;
        this.isCharging = false;
      }

      if (isLooking) {
        this.lookAtTimer += dt / 1000;
        if (this.lookAtTimer > 3) this.isCharging = true;
      } else {
        this.lookAtTimer = 0;
      }

      if (this.isCharging && isLooking) {
        const direction = new THREE.Vector3().subVectors(playerPos, enemyPos).normalize();
        direction.y = 0;
        this.el.object3D.position.add(direction.multiplyScalar(this.data.chargeSpeed * (dt / 1000)));
      }
    } else {
      if (distance > 40 && this.timeElapsed - this.lastTeleport > 15) {
        this.teleportInFront(playerPos);
        this.lastTeleport = this.timeElapsed;
      }

      const direction = new THREE.Vector3().subVectors(playerPos, enemyPos).normalize();
      direction.y = 0;
      this.el.object3D.position.add(direction.multiplyScalar(this.data.chaseSpeed * (dt / 1000)));
    }

    if (distance < this.data.stopDistance) this.gameOver();
  },

  updateRotation: function () {
    if (!this.player || !this.player.object3D) return;

    const dx = this.player.object3D.position.x - this.el.object3D.position.x;
    const dz = this.player.object3D.position.z - this.el.object3D.position.z;
    const theta = Math.atan2(dx, dz);
    let rotationY = theta * (180 / Math.PI);

    const finalX = this.data.xOffset;
    const finalY = rotationY + this.data.yOffset;
    const finalZ = 0;

    this.el.setAttribute('rotation', `${finalX} ${finalY} ${finalZ}`);
    const display = document.getElementById('rot-display');
    if (display) display.innerText = `X:${finalX}  Y:Math+${this.data.yOffset}  Z:0`;
  },

  teleportInFront: function (playerPos) {
    const direction = new THREE.Vector3();
    this.player.object3D.getWorldDirection(direction);
    const dist = 12;
    const newX = playerPos.x + direction.x * -dist;
    const newZ = playerPos.z + direction.z * -dist;
    this.el.object3D.position.set(newX, 0, newZ);
  },

  isPlayerLooking: function () {
    if (!this.camera || !this.camera.object3D) return false;

    const camDir = new THREE.Vector3();
    this.camera.object3D.getWorldDirection(camDir);
    const cam2D = new THREE.Vector2(camDir.x, camDir.z).normalize();

    const enemyPos = this.el.object3D.position;
    const playerPos = this.player.object3D.position;
    const toEnemy = new THREE.Vector2(enemyPos.x - playerPos.x, enemyPos.z - playerPos.z).normalize();

    const dot = cam2D.dot(toEnemy);
    return dot > 0.55;
  },

  gameOver: function () {
    const jumpscareEl = document.getElementById('jumpscare-overlay');
    const gameOverText = document.getElementById('game-over');

    jumpscareEl.style.display = 'block';
    document.querySelector('#sfx-jumpscare').play().catch(() => {});
    gameOverText.style.display = 'block';

    this.player.setAttribute('look-controls', 'enabled: false');
    this.player.setAttribute('movement-controls', 'enabled: false');
    this.isFrozen = true;
  },

  toggleFreeze: function () {
    this.isFrozen = !this.isFrozen;
  }
});