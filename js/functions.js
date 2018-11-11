function fadeToGame(){
	phaserGame.scene.pause();
        phaserGame.scene.start('game');
	phaserGame.scene.bringToTop('game');
};

function fadeToMenu(){
        phaserGame.scene.pause();
        phaserGame.scene.start('menu');
        phaserGame.scene.bringToTop('menu');
};
