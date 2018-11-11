var game = new Phaser.Class({
  Extends: Phaser.Scene,
    initialize:
    function game (){
        Phaser.Scene.call(this, { key: 'game' });
    },

    preload: function (){
    },

    create: function (){
        var bg = this.add.graphics();
        bg.fillStyle(0x996666, 1);
        bg.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

        var text_Menu = this.add.text(50, WORLD_HEIGHT - 50, "Menu", TEXT_STYLE);
	text_Menu.setStroke('0x111111', 4);
	text_Menu.setInteractive();

        var fadeScreen = this.add.graphics();
        fadeScreen.fillStyle(FADE_COLOR, 1);
        fadeScreen.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

        ///////////// intro fade-in /////////////
        this.tweens.add({
                targets: fadeScreen,
                alpha:  0,
                duration: FADE_TIME,
		delay: FADE_DELAY,
                ease: 'Liner'
        });

        ///////////// fade-out before launching the next scene /////////////
        text_Menu.on('pointerdown', function () {
                this.tweens.add({
                        targets: fadeScreen,
                        alpha:  1,
                        duration: FADE_TIME,
                        onComplete: fadeToMenu,
                        ease: 'Linear'
                });
        }, this);
    },

    update: function (){

    }
});
