class SceneMainMenu extends Phaser.Scene {
	constructor() {
		super({ key: "SceneMainMenu" });
  }
  
  preload() {
    this.load.image("sprBtnPlay", "content/sprBtnPlay.png");
    this.load.image("sprBtnPlayHover", "content/sprBtnPlayHover.png");
  
    this.load.audio("sndBtn", "content/sndBtn.wav");
  }

  create() {
    this.sfx = {
      btn: this.sound.add("sndBtn")
    };

    this.textTitle = this.add.text(
      this.game.config.width * 0.5,
      64,
      "SAUCER INVADERS",
      {
        fontFamily: "Arcadepix",
        fontSize: 32,
        align: "center"
      }
    );
    this.textTitle.setOrigin(0.5);    

    this.btnPlay = this.add.sprite(
      this.game.config.width * 0.5,
      this.game.config.height * 0.5,
      "sprBtnPlay"
    );
    this.btnPlay.setInteractive();

    this.btnPlay.on("pointerover", function() {
      this.sfx.btn.play();
      this.btnPlay.setTexture("sprBtnPlayHover");
    }, this);
    
    this.btnPlay.on("pointerout", function() {
      this.setTexture("sprBtnPlay");
    });
    
    this.btnPlay.on("pointerdown", function() {
      this.sfx.btn.play();
      this.scene.start("SceneMain");
    }, this);
    
    this.btnPlay.on("pointerup", function() {
    this.setTexture("sprBtnPlay");	
    });
    
  }
  
}
