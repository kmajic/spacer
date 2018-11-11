var menu = new Phaser.Class({
  Extends: Phaser.Scene,
    initialize:
    function menu (){
        Phaser.Scene.call(this, { key: 'menu' });
    },

    preload: function (){
    },

    create: function (){
        var mainMenu = [];
        mainMenu.bg = this.add.graphics();
	mainMenu.bg.fillStyle(0x333333);
	mainMenu.bg.fillRect(-WORLD_WIDTH / 2, 0, WORLD_WIDTH / 2, WORLD_HEIGHT);
	mainMenu.txt = [];
        mainMenu.txt[0] = this.add.text(-WORLD_WIDTH / 2 + MENU_PADDING_LEFT, MENU_PADDING_TOP, "Play", TEXT_STYLE);
	mainMenu.txt[0].setStroke('0x111111', 4);
        mainMenu.txt[0].setInteractive();       // this is required for any text that will be interactive/clickable
        mainMenu.txt[1] = this.add.text(-WORLD_WIDTH / 2 + MENU_PADDING_LEFT, mainMenu.txt[0].y + MENU_PADDING_BOTTOM, "Settings", TEXT_STYLE);
        mainMenu.txt[2] = this.add.text(-WORLD_WIDTH / 2 + MENU_PADDING_LEFT, mainMenu.txt[1].y + MENU_PADDING_BOTTOM, "Extra", TEXT_STYLE);

	///////////// sliding background & text /////////////
        this.tweens.add({
                targets: mainMenu.bg,
                x: WORLD_WIDTH / 2,
                duration: FADE_TIME,
		delay: FADE_DELAY,
                ease: 'Expo.easeOut'
        });
        this.tweens.add({
                targets: mainMenu.txt,
                x:  MENU_PADDING_LEFT,
                duration: FADE_TIME,
		delay: FADE_DELAY,
                ease: 'Expo.easeOut'
        });
	///////////// fade-out before launching the next scene /////////////
        mainMenu.txt[0].on('pointerdown', function () {
	        this.tweens.add({
        	        targets: mainMenu.txt,
                	x: -WORLD_WIDTH / 2 + MENU_PADDING_LEFT,
	                duration: FADE_TIME,
			onComplete: fadeToGame,
        	        ease: 'Expo.easeIn'
	        });
                this.tweens.add({
                        targets: mainMenu.bg,
                        x: -WORLD_WIDTH / 2,
                        duration: FADE_TIME,
                        onComplete: fadeToGame,
                        ease: 'Expo.easeIn'
                });
        }, this);
    },

    update: function (){
    }
});

var gameConfig = {
        type: Phaser.AUTO,
        width: WORLD_WIDTH,
        height: WORLD_HEIGHT,
        physics: {
        	default: 'arcade',
	        arcade: {
        	        debug: false
	        },
        },
        scene: [menu, game]
};

var phaserGame = new Phaser.Game(gameConfig);
