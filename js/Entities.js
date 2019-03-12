class Entity extends Phaser.GameObjects.Sprite {
	constructor(scene, x, y, key) {
		super(scene, x, y, key);
		this.scene.add.existing(this);
		this.scene.physics.world.enableBody(this, 0);
	}
}

class Player extends Entity {
	constructor(scene, x, y) {
		super(scene, x, y, "sprPlayer");
	}
}

class PlayerLaser extends Entity {
	constructor(scene, x, y) {
		super(scene, x, y, "sprLaserPlayer");
	}
}

class EnemyLaser extends Entity {
	constructor(scene, x, y, key) {
		super(scene, x,y, "sprLaserEnemy");
	}
}

class Enemy extends Entity {
	constructor(scene, x, y, key) {
		super(scene, x, y, key);
		this.setOrigin(0);
	}
}

class ShieldTile extends Entity {
	constructor(scene, x, y) {
		super(scene, x, y, "sprShieldTile");
		this.setOrigin(0);
		this.setScale(2);
		this.setDepth(-2);
	}
}

class Explosion extends Entity {
	constructor(scene, x, y) {
		super(scene, x, y, "sprExplosion");
		this.play("sprExplosion");
		this.setOrigin(0);
		this.setScale(2);
		this.on("animationcomplete", function() {
			if (this) {
				this.destroy();
			}
		});
	}
}
