function fireBullet(bulletGroupArg, objectArg, bulletScaleArg, bulletBodySizeArg, bulletDamageArg, spawnXArg, spawnYArg, rotationArg, spriteArg, tintArg, targetXArg, targetYArg, lifespanArg, speedArg){
	bullet = bulletGroupArg.create(spawnXArg, spawnYArg, spriteArg);
        bullet.tint = tintArg;
	bullet.setScale(bulletScaleArg);
	bulletSize = bulletBodySizeArg * bulletScaleArg;
	bullet.setCircle(bulletSize).setOffset(bullet.width / 2 - bulletSize, bullet.width / 2 - bulletSize);
        bullet.rotation = rotationArg;
	bullet.bulletDamage = bulletDamageArg;
	bullet.timeToDie = gameScene.time.now + lifespanArg;
	bullet.lifespan = lifespanArg;
        gameScene.physics.moveTo(bullet, targetXArg, targetYArg, speedArg);
};

function spawnEnemy(enemyTypeArg, spawnCoordinateXArg, spawnCoordinateYArg){

	var spawnLocation = Phaser.Math.Between(1,4);
	if (spawnCoordinateXArg == undefined && spawnCoordinateXArg == undefined){
                if (spawnLocation == 1){
                        spawnCoordinateXArg = -100;
			spawnCoordinateYArg = Phaser.Math.Between(-100, WORLD_HEIGHT + 100);
                } else if (spawnLocation == 2){
                        spawnCoordinateXArg = WORLD_WIDTH + 100;
                        spawnCoordinateYArg = Phaser.Math.Between(-100, WORLD_HEIGHT + 100);
                } else if (spawnLocation == 3){
			spawnCoordinateYArg = -100;
                        spawnCoordinateXArg = Phaser.Math.Between(-100, WORLD_WIDTH + 100);
		} else {
                        spawnCoordinateYArg = WORLD_HEIGHT + 100;
                        spawnCoordinateXArg = Phaser.Math.Between(-100, WORLD_WIDTH + 100);
		};
	};

	this.enemy = enemyGroup.create(spawnCoordinateXArg, spawnCoordinateYArg, chars[enemyTypeArg].sprite);
	// the line below centers the physics body, otherwise it starts at (0, 0)
        this.enemy.setCircle(chars[enemyTypeArg].bodySize).setOffset(this.enemy.width / 2 - chars[enemyTypeArg].bodySize, this.enemy.width / 2 - chars[enemyTypeArg].bodySize);
        this.enemy.setScale(chars[enemyTypeArg].scale);
        this.enemy.type = enemyTypeArg;
	this.enemy.hitPointsMax = chars[enemyTypeArg].hitPointsMax;
        this.enemy.hitPointsCurrent = this.enemy.hitPointsMax;
	this.enemy.healthBar = gameScene.add.graphics();
        this.enemy.healthBarType = chars[enemyTypeArg].healthBarType;

	this.enemy.range = chars[enemyTypeArg].range;
	this.enemy.gunPoint = gameScene.physics.add.sprite(this.enemy.x + (chars[enemyTypeArg].gunPointX * chars[enemyTypeArg].scale),
			                        this.enemy.y + (chars[enemyTypeArg].gunPointY * chars[enemyTypeArg].scale), "green");
	this.enemy.gunPoint.setScale(0.02);
        this.enemy.previousRotation = 0; // used to calculate gunPoint location

	this.enemy.bulletDamage = chars[enemyTypeArg].bulletDamage;
	this.enemy.tinted = 0;
	this.enemy.readyToShoot = 0; // this will update to earliest time at which the enemy can shoot
	this.enemy.readyToAim = 0;
	this.enemy.fireRate = chars[enemyTypeArg].fireRate;
	this.enemy.aiming = false;
	this.enemy.setScale(chars[enemyTypeArg].scale);
        this.enemy.rotation = Phaser.Math.Angle.Between(this.enemy.x, this.enemy.y, gameScene.player.x, gameScene.player.y);
};

function spawnPlayer(playerCharArg){
        gameScene.player = gameScene.physics.add.sprite(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, chars[playerCharArg].sprite);
	gameScene.player.setDepth(1);
        gameScene.player.setCircle(chars[playerCharArg].bodySize).setOffset(gameScene.player.width / 2 - chars[playerCharArg].bodySize, gameScene.player.width / 2 - chars[playerCharArg].bodySize);
        gameScene.player.setScale(chars[playerCharArg].scale);
        gameScene.player.hitPointsMax = chars[playerCharArg].hitPointsMax;
        gameScene.player.hitPointsCurrent = gameScene.player.hitPointsMax;
        gameScene.player.tinted = 0;
	gameScene.player.previousRotation = 0; // used to calculate gunPoint location
        gameScene.player.healthBar = gameScene.add.graphics();

	gameScene.player.gunPoint = gameScene.physics.add.sprite(gameScene.player.x + (chars[playerCharArg].gunPointX * chars[playerCharArg].scale), 
			gameScene.player.y + (chars[playerCharArg].gunPointY * chars[playerCharArg].scale), "green");
	gameScene.player.gunPoint.setScale(0.02);
	gameScene.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        gameScene.cameras.main.startFollow(gameScene.player, true);
};

function updateEnemy(enemy){
	enemy.healthBar.clear();
	if (enemy.healthBar.visible){
	        enemy.healthBar.strokeRectShape(0, 0, enemy.width, enemy.height);
	};
	enemy.rotation = Phaser.Math.Angle.Between(enemy.x, enemy.y, gameScene.player.x, gameScene.player.y);

	// enemies will come closer until within range, then stop to aim, and shoot
	var distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, gameScene.player.x, gameScene.player.y);
	if (enemy.aiming && gameScene.time.now > enemy.readyToShoot){
		fireBullet(enemyBulletGroup, enemy, chars[enemy.type].bulletScale, chars[enemy.type].bulletBodySize, chars[enemy.type].bulletDamage, enemy.gunPoint.x, enemy.gunPoint.y, 
				enemy.rotation, chars[enemy.type].bulletSprite, chars[enemy.type].tint, gameScene.player.x, gameScene.player.y, chars[enemy.type].bulletLifespan, chars[enemy.type].bulletSpeed);
		enemy.aiming = false;
		enemy.readyToAim = gameScene.time.now + enemy.fireRate;
//		console.log("case 3: shooting", enemy.readyToAim);
	} 
	else if (distance <= enemy.range && !enemy.aiming && enemy.x > WORLD_BOUNDS_PADDING && enemy.x < WORLD_WIDTH - WORLD_BOUNDS_PADDING && enemy.y > WORLD_BOUNDS_PADDING && enemy.y < WORLD_HEIGHT - WORLD_BOUNDS_PADDING && enemy.readyToAim < gameScene.time.now){
		enemy.readyToShoot = gameScene.time.now + chars[enemy.type].aimTimer;
		enemy.aiming = true;
                enemy.setVelocity(0, 0);
                enemy.gunPoint.setVelocity(0, 0);
//                console.log("case 2: within range, starting to aim", enemy.readyToShoot);
        }
	else if ((distance > enemy.range || (enemy.x < WORLD_BOUNDS_PADDING || enemy.x > WORLD_WIDTH - WORLD_BOUNDS_PADDING || enemy.y < WORLD_BOUNDS_PADDING || enemy.y > WORLD_HEIGHT - WORLD_BOUNDS_PADDING)) && !enemy.aiming){
//                console.log("case 1: closing in", enemy.readyToAim);
                gameScene.physics.moveTo(enemy, gameScene.player.x, gameScene.player.y, chars[enemy.type].speed);
                enemy.gunPoint.body.velocity.copy(enemy.body.velocity);
        };
	if (enemy.tinted && gameScene.time.now > enemy.tinted){
		enemy.tint = 0xffffff;
		enemy.tinted = 0;
	};
	enemy.healthBarColor = Math.round(enemy.hitPointsCurrent / (enemy.hitPointsMax / 120)); // get a HSV color value from 0-120 (red to green) based off of missing HP
	enemy.healthBar.clear();
        enemy.healthBar.fillStyle(0x000000, 1);
        enemy.healthBar.fillRect(enemy.x - healthBarWidth / 2 - healthBarBorder, enemy.y + (enemy.height / 2) * enemy.scaleY, healthBarWidth + healthBarBorder * 2, healthBarHeight + healthBarBorder * 2); // black background
        if (enemy.healthBarType == "silver"){
                enemy.healthBar.lineStyle(healthBarBorder, 0xc0c0c0, 0.7);
                enemy.healthBar.strokeRect(enemy.x - healthBarWidth / 2 - healthBarBorder, enemy.y + (enemy.height / 2) * enemy.scaleY, healthBarWidth + healthBarBorder * 2, healthBarHeight + healthBarBorder * 2); // silver background
        } else if (enemy.healthBarType == "gold"){
                enemy.healthBar.lineStyle(healthBarBorder, 0xffdf00, 0.7);
                enemy.healthBar.strokeRect(enemy.x - healthBarWidth / 2 - healthBarBorder, enemy.y + (enemy.height / 2) * enemy.scaleY, healthBarWidth + healthBarBorder * 2, healthBarHeight + healthBarBorder * 2); // gold background
	};
	enemy.healthBar.fillStyle(hsv[enemy.healthBarColor].color, 0.6);
	enemy.healthBar.fillRect(enemy.x - healthBarWidth / 2, enemy.y + (enemy.height / 2) * enemy.scaleY + healthBarBorder, enemy.hitPointsCurrent / (enemy.hitPointsMax / healthBarWidth), healthBarHeight);
        enemy.gunPointRotation = enemy.rotation - enemy.previousRotation;
	enemy.previousRotation = enemy.rotation;
        Phaser.Actions.RotateAround([enemy.gunPoint], {x: enemy.x, y: enemy.y}, enemy.gunPointRotation);

	};

function updatePlayer(){
        gunPointRotation = gameScene.player.rotation - gameScene.player.previousRotation;
	gameScene.player.previousRotation = gameScene.player.rotation;
        Phaser.Actions.RotateAround([gameScene.player.gunPoint], {x: gameScene.player.x, y: gameScene.player.y}, gunPointRotation);
		
        gameScene.player.healthBarColor = Math.round(gameScene.player.hitPointsCurrent / (gameScene.player.hitPointsMax / 120));
        gameScene.player.healthBar.clear();
        gameScene.player.healthBar.fillStyle(0x000000, 0.6);
        gameScene.player.healthBar.fillRect(gameScene.player.x - healthBarWidth / 2 - healthBarBorder, gameScene.player.y + (gameScene.player.height / 2) * gameScene.player.scaleY, healthBarWidth + healthBarBorder * 2, healthBarHeight + healthBarBorder * 2);
        gameScene.player.healthBar.fillStyle(hsv[gameScene.player.healthBarColor].color, 0.6);
        gameScene.player.healthBar.fillRect(gameScene.player.x - healthBarWidth / 2, gameScene.player.y + (gameScene.player.height / 2) * gameScene.player.scaleY + healthBarBorder, gameScene.player.hitPointsCurrent / 
			(gameScene.player.hitPointsMax / healthBarWidth), healthBarHeight);
};

function collisionHandler(collidedObject, collidedBullet){
	collidedObject.hitPointsCurrent -= collidedBullet.bulletDamage * collidedBullet.alpha; // if the bullet is beyond it's range, it's damage is reduced according to it's translucency
	collidedObject.tinted = gameScene.time.now + 60;
	collidedObject.tint = 0xaaaaaa;

	if (collidedObject.hitPointsCurrent <= 0){
	        collidedObject.destroy();
		collidedObject.gunPoint.destroy();
		collidedObject.healthBar.clear();
	};
        collidedBullet.destroy();
};

function updateBullets(bullet){
	if (bullet.timeToDie < gameScene.time.now){
		bullet.alpha -= (1000 / 60) / BULLET_FADING_TIME;
	};
	if (bullet.alpha <= 0) bullet.destroy();
};

function generateWave(waveNumberArg, enemiesPerWaveArg, timeBetweenEnemiesArg){
	var nextEnemySpawn = 0;
	var minTier = Math.floor(waveNumberArg / 5) + 1;

        for (var z = 0; z < enemiesPerWaveArg; z++){
	        var randomNumber = Phaser.Math.Between(1, 100);
		if (randomNumber > waveType[(waveNumberArg % 5)]){
			enemyType = minTier + 3;
		} else {
        	        enemyType = minTier;
		};
		if (waveNumberArg % 5 != 0){
			var enemyRarity = Phaser.Math.Between(1, 100);
			if (enemyRarity < 6){
				enemyType += 2;
			} else if (enemyRarity < 16){
        	                enemyType += 1;
			};
		};
// console.log("spawning enemies! enemyType: ", enemyType, " at timestamp:", nextEnemySpawn, "current timestamp: ", gameScene.time.now, " randomNumber: ", randomNumber, " waveNumberArg: ", waveNumberArg);
       	        timedEvent = gameScene.time.delayedCall(nextEnemySpawn, spawnEnemy, [chars[enemyType].type], this);
        	nextEnemySpawn += timeBetweenEnemiesArg;
	};
};
