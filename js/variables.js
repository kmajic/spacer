let WORLD_WIDTH = 1000;
let WORLD_HEIGHT = 600;
let WORLD_BOUNDS_PADDING = 30;

let bg;
let enemyGroup;
let playerBulletGroup;
let enemyBulletGroup;

let debugTime = 0;
let debugTimer = 1000;

let TIME_BETWEEN_ENEMIES = 200;
let TIME_TO_NEXT_WAVE = 10000;
let ENEMIES_PER_WAVE = 10;
let WAVE_NUMBER = 0;
let waveType = [100, 80, 60, 40, 20];

let BULLET_FADING_TIME = 100;
let SUPERCHARGE_TIMER = 1000;
let MEGACHARGE_TIMER = 2000;
let SUPERCHARGE_SCALE = 1.5;
let MEGACHARGE_DAMAGE = 10;
let SUPERCHARGE_DAMAGE = 5;
let MEGACHARGE_SCALE = 2.2;
let CHARGEUP_TIMESTAMP = 0;
let READY_TO_SHOOT = 0;

let READY_FOR_MORE_ENEMIES = 2000; //start spawning enemies after 2 seconds
let enemyWave = [];
let hsv = Phaser.Display.Color.HSVColorWheel();
let healthBarWidth = 80;
let healthBarHeight = 8;
let healthBarBorder = 2;
let chars = [
	{	type: 0,
		value: 9999999, // don't want the player sprite in rotation, so this is just a precaution
                speed: 90,
                bulletSpeed: 800,
		bulletDamage: 1500,
		bulletLifespan: 200,
		fireRate: 200,
		aimTimer: 0,
                sprite: "clone",
                bodySize: 65,
                scale: 0.4,
		gunPointX: 90, // offset from the sprite centerX at 1:1 scale, was 124 originally
		gunPointY: 20, // offset from the sprite centerY
		hitPointsMax: 50000,
		tint: 0xffffff,
		superTint: 0xbbffbb,
		megaTint: 0xffbbbb,
                bulletSprite: "bullet1",
		bulletScale: 0.6,
		bulletBodySize: 6
        },
        {       type: 1,
		value: 10,
                speed: 40,
		range: 200,
		bulletType: "fade", // also explode, laser
                bulletSpeed: 400,
		bulletDamage: 10,
		bulletLifespan: 200,
                fireRate: 500,	
		aimTimer: 1000,
		sprite: "trooper_red",
                bodySize: 60,
		scale: 0.3,
		gunPointX: 131, // was 127
		gunPointY: 25,
		hitPointsMax: 500,
		healthBarType: "normal", // normal, silver, gold
		tint: 0xffffff,
                bulletSprite: "bullet3",
		bulletScale: 0.8,
                bulletBodySize: 8
        },
	{       type: 2,
		value: 10,
		speed: 40,
		range: 250,
		bulletType: "fade", // also explode, laser
		bulletSpeed: 500,
		bulletDamage: 30,
		bulletLifespan: 500,
		fireRate: 500,
		aimTimer: 1000,
		sprite: "trooper_red",
		bodySize: 60,
		scale: 0.3,
		gunPointX: 131, // was 127
		gunPointY: 25,
		hitPointsMax: 900,
		healthBarType: "silver", // normal, silver, gold
		tint: 0xffffff,
		bulletSprite: "bullet3",
		bulletScale: 0.8,
		bulletBodySize: 8
	},
	{       type: 3,
		value: 10,
		speed: 40,
		range: 300,
		bulletType: "fade", // also explode, laser
		bulletSpeed: 400,
		bulletDamage: 50,
		bulletLifespan: 500,
		fireRate: 500,
		aimTimer: 1000,
		sprite: "trooper_red",
		bodySize: 60,
		scale: 0.3,
		gunPointX: 131, // was 127
		gunPointY: 25,
		hitPointsMax: 1500,
		healthBarType: "gold", // normal, silver, gold
		tint: 0xffffff,
		bulletSprite: "bullet3",
		bulletScale: 0.8,
		bulletBodySize: 8
	},
        {       type: 4,
		value: 15,
                speed: 40,
		range: 250,
                bulletSpeed: 150,
                bulletDamage: 100,
                bulletLifespan: 2500,
                fireRate: 1200,
                aimTimer: 800,
                sprite: "trooper_brown",
                bodySize: 80,
                scale: 0.3,
                gunPointX: 126,
                gunPointY: 12,
                hitPointsMax: 900,
                healthBarType: "normal", // normal, silver, gold
                tint: 0xffffff,
                bulletSprite: "bullet3",
                bulletScale: 0.8,
                bulletBodySize: 12
        },
        {       type: 5,
                value: 15,
                speed: 40,
                range: 250,
                bulletSpeed: 150,
                bulletDamage: 100,
                bulletLifespan: 2500,
                fireRate: 1200,
                aimTimer: 800,
                sprite: "trooper_brown",
                bodySize: 80,
                scale: 0.3,
                gunPointX: 126,
                gunPointY: 12,
                hitPointsMax: 1300,
                healthBarType: "silver", // normal, silver, gold
                tint: 0xffffff,
                bulletSprite: "bullet3",
                bulletScale: 0.8,
                bulletBodySize: 12
        },
        {       type: 6,
                value: 15,
                speed: 40,
                range: 250,
                bulletSpeed: 150,
                bulletDamage: 100,
                bulletLifespan: 2500,
                fireRate: 1200,
                aimTimer: 800,
                sprite: "trooper_brown",
                bodySize: 80,
                scale: 0.3,
                gunPointX: 126,
                gunPointY: 12,
                hitPointsMax: 1900,
                healthBarType: "gold", // normal, silver, gold
                tint: 0xffffff,
                bulletSprite: "bullet3",
                bulletScale: 0.8,
                bulletBodySize: 12
        },
        {       type: 7,
                value: 15,
                speed: 40,
                range: 250,
                bulletSpeed: 150,
                bulletDamage: 100,
                bulletLifespan: 2500,
                fireRate: 1200,
                aimTimer: 800,
                sprite: "heavy",
                bodySize: 80,
                scale: 0.3,
                gunPointX: 186,
                gunPointY: -37,
                hitPointsMax: 1900,
                healthBarType: "normal", // normal, silver, gold
                tint: 0xffffff,
                bulletSprite: "bullet3",
                bulletScale: 0.8,
                bulletBodySize: 12
        },
        {       type: 8,
                value: 15,
                speed: 40,
                range: 250,
                bulletSpeed: 150,
                bulletDamage: 100,
                bulletLifespan: 2500,
                fireRate: 1200,
                aimTimer: 800,
                sprite: "heavy",
                bodySize: 80,
                scale: 0.3,
                gunPointX: 186,
                gunPointY: -37,
                hitPointsMax: 1900,
                healthBarType: "silver", // normal, silver, gold
                tint: 0xffffff,
                bulletSprite: "bullet3",
                bulletScale: 0.8,
                bulletBodySize: 12
        },
        {       type: 9,
                value: 15,
                speed: 40,
                range: 250,
                bulletSpeed: 150,
                bulletDamage: 100,
                bulletLifespan: 2500,
                fireRate: 1200,
                aimTimer: 800,
                sprite: "heavy",
                bodySize: 80,
                scale: 0.3,
                gunPointX: 186,
                gunPointY: -37,
                hitPointsMax: 1900,
                healthBarType: "gold", // normal, silver, gold
                tint: 0xffffff,
                bulletSprite: "bullet3",
                bulletScale: 0.8,
                bulletBodySize: 12
        }
];
