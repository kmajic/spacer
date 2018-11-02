/*

Contact: kresimir [at] majic [dot] eu

TO DO:

*/

let gameScene = new Phaser.Scene("Game");


gameScene.preload = function(){
	this.load.image("trooper_brown", "assets/trooper_brown.png");
        this.load.image("pyro", "assets/pyro.png");

	this.load.image("emptyPixel", "assets/emptyPixel.png");
        this.load.image("background", "assets/texture1.png");
	this.load.image("logo", "assets/logo.png");
};

gameScene.create = function(){
	bg = this.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, "background");
	bg.setOrigin(0, 0);

	enemyGroup = this.physics.add.group();
	playerGroup = this.physics.add.group();
	playerBulletGroup = this.physics.add.group();
        enemyBulletGroup = this.physics.add.group();

	this.playerBounds = this.add.graphics();
	this.playerBounds.lineStyle(2, 0xff0000, 0.15);
	this.playerBounds.strokeRect(WORLD_BOUNDS_PADDING * 2, WORLD_BOUNDS_PADDING * 2, WORLD_WIDTH - WORLD_BOUNDS_PADDING * 4, WORLD_HEIGHT - WORLD_BOUNDS_PADDING * 4);

	spawnPlayer(0); // pass the number from chars array for player character
	this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        this.input.on("pointerdown", function(){
		CHARGEUP_TIMESTAMP = this.time.now;
	}, this);

	this.input.on("pointerup", function(){
		if (this.time.now > CHARGEUP_TIMESTAMP + MEGACHARGE_TIMER){
                        fireBullet (playerBulletGroup, this.player, chars[0].bulletScale * MEGACHARGE_SCALE, chars[0].bulletBodySize * MEGACHARGE_SCALE / 4, chars[0].bulletDamage * MEGACHARGE_DAMAGE, this.player.gunPoint.x,
	                        this.player.gunPoint.y, this.player.rotation, chars[0].bulletSprite, chars[0].megaTint, game.input.activePointer.x + gameScene.cameras.main.scrollX,
                                game.input.activePointer.y + gameScene.cameras.main.scrollY, chars[0].bulletLifespan, chars[0].bulletSpeed * MEGACHARGE_SCALE);
			CHARGEUP_TIMESTAMP = 0;
		} else if (this.time.now > CHARGEUP_TIMESTAMP + SUPERCHARGE_TIMER){
                        fireBullet (playerBulletGroup, this.player, chars[0].bulletScale * SUPERCHARGE_SCALE, chars[0].bulletBodySize * SUPERCHARGE_SCALE / 2, chars[0].bulletDamage * SUPERCHARGE_DAMAGE, this.player.gunPoint.x,
                                this.player.gunPoint.y, this.player.rotation, chars[0].bulletSprite, chars[0].superTint, game.input.activePointer.x + gameScene.cameras.main.scrollX,
                                game.input.activePointer.y + gameScene.cameras.main.scrollY, chars[0].bulletLifespan, chars[0].bulletSpeed * SUPERCHARGE_SCALE);
			CHARGEUP_TIMESTAMP = 0;
		} else {
			if (this.time.now > READY_TO_SHOOT){ // if not charged up, you can still shoot, but only at the default fire rate
		                fireBullet (playerBulletGroup, this.player, chars[0].bulletScale, chars[0].bulletBodySize, chars[0].bulletDamage, this.player.gunPoint.x,
				       	this.player.gunPoint.y, this.player.rotation, chars[0].bulletSprite, chars[0].tint, 
					game.input.activePointer.x + gameScene.cameras.main.scrollX + (this.player.gunPoint.x - this.player.x), 
					game.input.activePointer.y + gameScene.cameras.main.scrollY + (this.player.gunPoint.y - this.player.y),
				        // the above was added to prevent bullet shooting backwards/sideways when the pointer is between the player and the gunpoint	
					chars[0].bulletLifespan, chars[0].bulletSpeed);
                        	READY_TO_SHOOT = this.time.now + chars[0].fireRate;
			};	
			CHARGEUP_TIMESTAMP = 0;
		};
	}, this);
};

gameScene.update = function(){

	/// tracking key presses here and moving the player accordingly
	if (this.keyW.isDown && this.player.y > WORLD_BOUNDS_PADDING * 2){
		this.player.setVelocityY(-70);
	} else if (this.keyS.isDown && this.player.y < WORLD_HEIGHT - WORLD_BOUNDS_PADDING * 2){
		 this.player.setVelocityY(70);
	} else this.player.setVelocityY(0);
	
	// tracking horizontal/vertical movements separately to seem more natural
	if (this.keyA.isDown && this.player.x > WORLD_BOUNDS_PADDING * 2){
		this.player.setVelocityX(-70);
	} else if (this.keyD.isDown && this.player.x < WORLD_WIDTH - WORLD_BOUNDS_PADDING * 2){
		this.player.setVelocityX(70);
	} else this.player.setVelocityX(0);

	// gunPoint inherits the player's velocity
	this.player.gunPoint.body.velocity.copy(this.player.body.velocity);


	this.player.rotation = Phaser.Math.Angle.Between(this.player.x, this.player.y, game.input.activePointer.x + gameScene.cameras.main.scrollX, 
			game.input.activePointer.y + gameScene.cameras.main.scrollY);

	if (this.time.now > READY_FOR_MORE_ENEMIES){
//		generateWave(WAVE_NUMBER, ENEMIES_PER_WAVE, TIME_BETWEEN_ENEMIES);
//console.log("Calling an enemy wave: ", WAVE_NUMBER);
		WAVE_NUMBER++;
		READY_FOR_MORE_ENEMIES += TIME_TO_NEXT_WAVE;
                spawnEnemy(chars[7].type, 20, 20);
	};

        if (this.player.tinted && gameScene.time.now > this.player.tinted){
	        this.player.tint = 0xffffff;
	        this.player.tinted = 0;
        };

	// update the player/enemy sprites. Mind the rendering order!!
	Phaser.Utils.Array.Each(enemyGroup.getChildren(), updateEnemy, gameScene.physics);
        Phaser.Utils.Array.Each(enemyBulletGroup.getChildren(), updateBullets, gameScene.physics);
        Phaser.Utils.Array.Each(playerBulletGroup.getChildren(), updateBullets, gameScene.physics);

        if (this.player.hitPointsCurrent >= 0){
                updatePlayer();
        };

	// check for collisions
	if (playerBulletGroup.getLength()){
		this.physics.add.overlap(enemyGroup, playerBulletGroup, collisionHandler, null, this);
	};
        if (enemyBulletGroup.getLength()){
//		this.physics.add.overlap(this.player, enemyBulletGroup, collisionHandler, null, this);
	};

	if (gameScene.time.now > debugTime){
		console.log("enemyGroup count: ", enemyGroup.getLength());
		debugTime += debugTimer;
	};
};

let config = {
	type: Phaser.AUTO,
	width: WORLD_WIDTH,
	height: WORLD_HEIGHT,
	antialias: false,
	physics: {
	  default: 'arcade',
	  arcade: {
	    debug: false
	  },
	},
	scene: gameScene
};

let game = new Phaser.Game(config);
