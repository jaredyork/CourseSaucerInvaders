class SceneMain extends Phaser.Scene {
	constructor() {
		super({ key: "SceneMain" });
  }
  
  init(data) {
    this.passingData = data;
  }

  preload() {
    this.load.image("sprPlayer", "content/sprPlayer.png");
    this.load.spritesheet("sprEnemy0", "content/sprEnemy0.png", {
      frameWidth: 8,
      frameHeight: 8
    });
    this.load.image("sprShieldTile", "content/sprShieldTile.png");
    this.load.image("sprLaserEnemy", "content/sprLaserEnemy.png");
    this.load.image("sprLaserPlayer", "content/sprLaserPlayer.png");
    this.load.spritesheet("sprExplosion", "content/sprExplosion.png", {
      frameWidth: 8,
      frameHeight: 8
    });
    
    this.load.audio("sndExplode", "content/sndExplode.wav");
    this.load.audio("sndLaserPlayer", "content/sndLaserPlayer.wav");
    this.load.audio("sndLaserEnemy", "content/sndLaserEnemy.wav");
  }
  
  create() {
    if (Object.getOwnPropertyNames(this.passingData).length == 0 &&
      this.passingData.constructor === Object) {
      
      this.passingData = {
        maxLives: 3,
        lives: 3,
        score: 0,
        highScore: 0
      };
    }
    
    this.sfx = {
      explode: this.sound.add("sndExplode"),
      laserPlayer: this.sound.add("sndLaserPlayer"),
      laserEnemy: this.sound.add("sndLaserEnemy")
    };
    
    this.anims.create({
      key: "sprEnemy0",
      frames: this.anims.generateFrameNumbers("sprEnemy0"),
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: "sprExplosion",
      frames: this.anims.generateFrameNumbers("sprExplosion"),
      frameRate: 15,
      repeat: 0
    });

    this.textLabelScore = this.add.text(
      32,
      32,
      "SCORE <1>",
      {
        fontFamily: "Arcadepix",
        fontSize: 16,
        align: "left"
      }
    );
    
    
    this.textScore = this.add.text(
      32,
      64,
      this.passingData.score,
      {
        fontFamily: "Arcadepix",
        fontSize: 16,
        align: "left"
      }
    );

    this.textLabelHighScore = this.add.text(
      180,
      32,
      "HI-SCORE",
      {
        fontFamily: "Arcadepix",
        fontSize: 16,
        align: "left"
      }
    );

    this.textHighScore = this.add.text(
      180,
      64,
      this.passingData.highScore,
      {
        fontFamily: "Arcadepix",
        fontSize: 16,
        align: "left"
      }
    );

    this.player = new Player(
      this,
      this.game.config.width * 0.5,
      this.game.config.height - 64
    );

    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.playerShootDelay = 30;
    this.playerShootTick = 0;

    this.shieldPattern = [
      [0, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 1, 1]
    ];

    this.enemies = this.add.group();
    this.enemyLasers = this.add.group();
    this.playerLasers = this.add.group();
    this.explosions = this.add.group();
    this.shieldTiles = this.add.group();
    this.shieldHoles = this.add.group();

    this.lastEnemyMoveDir = "RIGHT";
    this.enemyMoveDir = "LEFT";
    this.enemyRect = new Phaser.Geom.Rectangle(
      0,
      0,
      Math.round((this.game.config.width / 24) * 0.75) * 24,
      Math.round((this.game.config.height / 20) * 0.25) * 20
    );

    for (var x = 0; x < Math.round((this.game.config.width / 24) * 0.75); x++) {
      for (var y = 0; y < Math.round((this.game.config.height / 20) * 0.25); y++) {
        var enemy = new Enemy(this, x * 24, 128 + (y * 20), "sprEnemy0");
        enemy.play("sprEnemy0");
        enemy.setScale(2);
        this.enemies.add(enemy);
      }
    }

    this.updateEnemiesMovement();
    this.updateEnemiesShooting();
    this.updatePlayerMovement();
    this.updatePlayerShooting();
    this.updateLasers();
    this.createLivesIcons();

    this.physics.add.overlap(this.playerLasers, this.enemies, function(laser, enemy) {
      if (laser) {
        laser.destroy();
      }
    
      if (enemy) {
        this.createExplosion(enemy.x, enemy.y);
        this.addScore(10);
        enemy.destroy();
      }
    }, null, this);

    this.physics.add.overlap(this.playerLasers, this.enemyLasers, function(playerLaser, enemyLaser) {

      if (playerLaser) {
        playerLaser.destroy();
      }
    
      if (enemyLaser) {
        enemyLaser.destroy();
      }
    
    }, null, this);
    
    this.physics.add.overlap(this.playerLasers, this.shieldTiles, function(laser, tile) {
      if (laser) {
        laser.destroy();
      }
    
    this.destroyShieldTile(tile);
    }, null, this);
    
    this.physics.add.overlap(this.enemyLasers, this.shieldTiles, function(laser, tile) {
      if (laser) {
        laser.destroy();
      }
    
      this.destroyShieldTile(tile);
    }, null, this);
    
    this.physics.add.overlap(this.player, this.enemies, function(player, enemy) {
      if (player) {
        player.destroy();
    
        this.onLifeDown();
      }
    }, null, this);
    
    this.physics.add.overlap(this.player, this.enemyLasers, function(player, laser) {
      if (player) {
        player.destroy();
    
        this.onLifeDown();
      }
    
      if (laser) {
        laser.destroy();
      }
    }, null, this);

    var totalShieldsWidth = (4 * 96) + (7 * 8);
    for (var i = 0; i < 4; i++) {
      this.addShield(
        ((this.game.config.width * 0.5) - (totalShieldsWidth * 0.5)) + ((i * 96) + (7 * 8)),
        this.game.config.height - 128
      );
    }

    if (localStorage.getItem("highScore") == null) {
      localStorage.setItem("highScore", 0);
    }
    else {
      this.passingData.highScore = localStorage.getItem("highScore");
      this.textHighScore.setText(this.passingData.highScore);
    }
    
  }

  addScore(amount) {
    this.passingData.score += amount;
    this.textScore.setText(this.passingData.score);
  }

  setEnemyDirection(direction) {
    this.lastEnemyMoveDir = this.enemyMoveDir;
    this.enemyMoveDir = direction;
  }

  updateEnemiesMovement() {
    this.enemyMoveTimer = this.time.addEvent({
      delay: 1024,
      callback: function() {
        if (this.enemyMoveDir == "RIGHT") {
          this.enemyRect.x += 6;
          
          if (this.enemyRect.x + this.enemyRect.width > this.game.config.width - 20) {
            this.setEnemyDirection("DOWN");
          }
        }
        else if (this.enemyMoveDir == "LEFT") {
          this.enemyRect.x -= 6;
        
          if (this.enemyRect.x < 20) {
            this.setEnemyDirection("DOWN");
          }
        }
        else if (this.enemyMoveDir == "DOWN") {
          this.enemyMoveTimer.delay -= 100;
          this.moveEnemiesDown();
        }
        
        for (var i = this.enemies.getChildren().length - 1; i >= 0; i--) {
          var enemy = this.enemies.getChildren()[i];
          
          if (this.enemyMoveDir == "RIGHT") {
            enemy.x += 6;
          }
          else if (this.enemyMoveDir == "LEFT") {
            enemy.x -= 6;
          }
        }        
      },
      callbackScope: this,
      loop: true
    });    
  }
  
  updateEnemiesShooting() {
    this.time.addEvent({
      delay: 500,
      callback: function() {
        for (var i = 0; i < this.enemies.getChildren().length; i++) {
          var enemy = this.enemies.getChildren()[i];
  
          if (Phaser.Math.Between(0, 1000) > 995) {
            var laser = new EnemyLaser(this, enemy.x, enemy.y);
            this.enemyLasers.add(laser);
  
            this.sfx.laserEnemy.play();
          }
        }
      },
      callbackScope: this,
      loop: true
    });
  }

  moveEnemiesDown() {
    for (var i = this.enemies.getChildren().length - 1; i >= 0; i--) {
      var enemy = this.enemies.getChildren()[i];
    
      enemy.y += 20;
      
      if (this.lastEnemyMoveDir == "LEFT") {
        this.setEnemyDirection("RIGHT");
      }
      else if (this.lastEnemyMoveDir == "RIGHT") {
        this.setEnemyDirection("LEFT");	
      }
    }
  }
    
  updatePlayerMovement() {
    this.time.addEvent({
      delay: 60,
      callback: function() {
        
        if (this.keyA.isDown) {
          this.player.x -= 8;
        }
  
        if (this.keyD.isDown) {
          this.player.x += 8;
        }
  
      },
      callbackScope: this,
      loop: true
    });
  }

  updatePlayerShooting() {
    this.time.addEvent({
      delay: 15,
      callback: function() {
        if (this.keySpace.isDown && this.player.active) {
          if (this.playerShootTick < this.playerShootDelay) {
            this.playerShootTick++;
          }
          else {
            var laser = new PlayerLaser(this, this.player.x, this.player.y);
            this.playerLasers.add(laser);
  
            this.sfx.laserPlayer.play();
  
            this.playerShootTick = 0;
          }
        }	
      },
      callbackScope: this,
      loop: true
    });
  }

  updateLasers() {
    this.time.addEvent({
      delay: 30,
      callback: function() {
        for (var i = 0; i < this.playerLasers.getChildren().length; i++) {
          var laser = this.playerLasers.getChildren()[i];
    
          laser.y -= laser.displayHeight;
    
          if (laser.y < 16) {
            this.createExplosion(laser.x, laser.y);
    
            if (laser) {
              laser.destroy();
            }
          }
        }
      },
      callbackScope: this,
      loop: true
    });
    
    this.time.addEvent({
      delay: 128,
      callback: function() {
        for (var i = 0; i < this.enemyLasers.getChildren().length; i++) {
          var laser = this.enemyLasers.getChildren()[i];
    
          laser.y += laser.displayHeight;
        }
      },
      callbackScope: this,
      loop: true
    });    
  }
  
  addShield(posX, posY) {
    for (var y = 0; y < this.shieldPattern.length; y++) {
      for (var x = 0; x < this.shieldPattern[y].length; x++) {
        if (this.shieldPattern[y][x] == 1) {
          var tile = new ShieldTile(
            this,
            posX + (x * 8),
            posY + (y * 8)
          );
          this.shieldTiles.add(tile);
        }
      }
    }
  }

  destroyShieldTile(tile) {
    if (tile) {
      this.createExplosion(tile.x, tile.y);
      
      for (var i= 0; i < Phaser.Math.Between(10, 20); i++) {
        var shieldHole = this.add.graphics({
          fillStyle: {
            color: 0x000000
          }
        });
        shieldHole.setDepth(-1);
    
        var size = Phaser.Math.Between(2, 4);
    
        if (Phaser.Math.Between(0, 100) > 25) {
          var rect = new Phaser.Geom.Rectangle(
            tile.x + (Phaser.Math.Between(-2, tile.displayWidth + 2)),
            tile.y + (Phaser.Math.Between(-2, tile.displayHeight + 2)),
            size,
            size
          );
        }
        else {
          var rect = new Phaser.Geom.Rectangle(
            tile.x + (Phaser.Math.Between(-4, tile.displayWidth + 4)),
            tile.y + (Phaser.Math.Between(-4, tile.displayHeight + 4))
          );
        }
    
        shieldHole.fillRectShape(rect);
        
        this.shieldHoles.add(shieldHole);
      }
      tile.destroy();
    }    
  }
  
  createExplosion(x, y) {
    this.sfx.explode.play();
  
    var explosion = new Explosion(this, x, y);
    this.explosions.add(explosion);
  }

  createLivesIcons() {
    for (var i = 0; i < this.passingData.lives; i++) {
      var icon = this.add.sprite(
        32 + (i * 32),
        this.game.config.height - 24,
        "sprPlayer"
      );
      icon.setScale(2);
      icon.setDepth(5);
    }
  }
    
  onLifeDown() {
    if (this.passingData.lives === 0) {
      this.textLabelScore.setVisible(false);
      this.textScore.setVisible(false);
      this.textLabelHighScore.setVisible(false);
      this.textHighScore.setVisible(false);
  
      this.textGameOver = this.add.text(
        this.game.config.width * 0.5,
        128,
        "GAME OVER",
        {
          fontFamily: "Arcadepix",
          fontSize: 60,
          align: "center"
        }
      );
      this.textGameOver.setOrigin(0.5);
    }

    if (this.passingData.score > localStorage.getItem("highScore")) {
      localStorage.setItem("highScore", this.passingData.score);
    }  
  
    this.time.addEvent({
      delay: 3000,
      callback: function() {
        if (this.passingData.lives > 0) {
          this.passingData.lives--;
    
          this.scene.start("SceneMain", this.passingData);
        }
        else {
          this.scene.start("SceneMain", { });
        }
      },
      callbackScope: this,
      loop: false
    });
  }


  
}
