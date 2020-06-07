import * as Phaser from 'phaser';
import IsoPlugin from 'phaser3-plugin-isometric';
import IsoSprite from 'phaser3-plugin-isometric/src/IsoSprite';
import IsoPhysics from 'phaser3-plugin-isometric/src/physics/IsoPhysics';
import IsoPoint3 from 'phaser3-plugin-isometric/src/Point3';
import { UserLocation, UserModel } from '../../models/user-model';
import { Subject } from 'rxjs';


const map = [
	[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
];
const BASE_SIZE = 35;
const HEIGHT = 400;
const WIDTH = 600;
const SPEED = 100;
const ROTATION_SPEED = 3;  // deg
const VIEWING_ANGLE = 120; // deg
const VIEW_LINE_LENGTH = 150;


export default class VRoomGame extends Phaser.Game {
	playerLocationChanged = new Subject<UserLocation>();
	private initializedPlayerLocation: UserLocation;

	constructor(elementId, initializedPlayerLocation: UserLocation) {
		super({
			type: Phaser.AUTO,
			width: WIDTH,
			height: HEIGHT,
			parent: 'vroom-game',
			scale: {
				mode: Phaser.Scale.FIT,
				autoCenter: Phaser.Scale.CENTER_BOTH,
				parent: elementId,
			},
			scene: MainScene
		});
		this.initializedPlayerLocation = initializedPlayerLocation;
	}

	get mainScene(): MainScene {
		return this.scene.getAt(0) as MainScene;
	}

	start(): void {
		super.start();
		this.mainScene.playerLocationChanged.subscribe(location => {
			this.playerLocationChanged.next(location);
		});
		this.mainScene.events.once('create', () => {
			this.setPlayerLocation(this.initializedPlayerLocation);
		});
	}

	setRemoteUsers(users: UserModel[]): void {
		this.mainScene.setRemoteUsers(users);
	}

	setPlayerLocation(location: UserLocation): void {
		this.mainScene.setPlayerLocation(location);
	}
}

class MainScene extends Phaser.Scene {
	private iso: IsoPlugin;
	private isoPhysics: IsoPhysics;
	private cursors: {[key: string]: Phaser.Input.Keyboard.Key};
	private isoGroup: Phaser.GameObjects.Group;
	private player: IsoSprite;
	private remotePlayers: {[key: string]: IsoSprite} = {};
	private beforePlayerLocation: UserLocation;
	private remoteUserModels: UserModel[] = [];
	private playerAngle: number;

	playerLocationChanged = new Subject<UserLocation>();

	constructor() {
		super({
			mapAdd: { isoPlugin: 'iso', isoPhysics: 'isoPhysics' }
		});
	}

	preload(): void {
		this.load.image('tile', '/assets/images/tile.png');
		this.load.image('cube', '/assets/images/cube.png');
		this.load.image('cube2', '/assets/images/cube2.png');
		this.load.scenePlugin({
			key: 'IsoPlugin',
			url: IsoPlugin,
			sceneKey: 'iso'
		});
		this.load.scenePlugin({
			key: 'IsoPhysics',
			url: IsoPhysics,
			sceneKey: 'isoPhysics'
		});
	}

	create (): void {
		this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor('#3498db');
		this.iso.projector.origin.setTo(0.5, 0.1);

		this.isoGroup = this.add.group();
		this.createMap();
		this.createPlayer();

		this.cursors = this.input.keyboard.addKeys({
			rotateLeft: Phaser.Input.Keyboard.KeyCodes.Q,
			rotateRight: Phaser.Input.Keyboard.KeyCodes.E,
			up: Phaser.Input.Keyboard.KeyCodes.W,
			up2: Phaser.Input.Keyboard.KeyCodes.UP,
			down: Phaser.Input.Keyboard.KeyCodes.S,
			down2: Phaser.Input.Keyboard.KeyCodes.DOWN,
			left: Phaser.Input.Keyboard.KeyCodes.A,
			left2: Phaser.Input.Keyboard.KeyCodes.LEFT,
			right: Phaser.Input.Keyboard.KeyCodes.D,
			right2: Phaser.Input.Keyboard.KeyCodes.RIGHT
		}) as {[key: string]: Phaser.Input.Keyboard.Key};
	}

	private createMap(): void {
		for (let y = 0; y < map.length; ++y) {
			for (let x = 0; x < map[y].length; ++x) {
				if (map[y][x] === 2) {
					// @ts-ignore
					const cube = this.add.isoSprite(x * BASE_SIZE, y * BASE_SIZE, 0, 'cube', this.isoGroup);
					this.isoPhysics.world.enable(cube);
					cube.body.immovable = true;
					cube.alpha = 0;
				} else {
					// @ts-ignore
					const tile = this.add.isoSprite(x * BASE_SIZE, y * BASE_SIZE, -BASE_SIZE / 2 - 5, 'tile', this.isoGroup);
					this.isoPhysics.world.enable(tile);
					tile.body.immovable = true;

					if (map[y][x] === 1) {
						// @ts-ignore
						const cube = this.add.isoSprite(x * BASE_SIZE, y * BASE_SIZE, 0, 'cube', this.isoGroup);
						this.isoPhysics.world.enable(cube);
						cube.body.immovable = true;
					}
				}
			}
		}
	}

	private createPlayer(): void {
		// @ts-ignore
		this.player = this.add.isoSprite(0, 0, 15, 'cube2', this.isoGroup);
		this.player.tint = 0x86bfda;
		this.isoPhysics.world.enable(this.player);

		this.player.viewingCursor = this.add.graphics();
		this.player.viewingCursor.depth = 10000;
		this.playerAngle = 0;
	}

	update(): void {
		this.isoPhysics.world.collide(this.isoGroup);
		topologicalSortInGroup(this.isoGroup);
		this.updatePlayer();
		this.updateRemotePlayers();

		const currentPlayerLocation = this.getPlayerLocation();
		if (this.beforePlayerLocation && !this.beforePlayerLocation.equals(currentPlayerLocation)) {
			this.playerLocationChanged.next(currentPlayerLocation);
		}
		this.beforePlayerLocation = currentPlayerLocation;
	}

	private updatePlayer(): void {
		let x = 0;
		let y = 0;
		let angle = 0;

		if (this.cursors.up.isDown || this.cursors.up2.isDown) {
			y = -SPEED;
		} else if (this.cursors.down.isDown || this.cursors.down2.isDown) {
			y = SPEED;
		}

		if (this.cursors.left.isDown || this.cursors.left2.isDown) {
			x = -SPEED;
		} else if (this.cursors.right.isDown || this.cursors.right2.isDown) {
			x = SPEED;
		}

		if (this.cursors.rotateLeft.isDown) {
			angle = ROTATION_SPEED;
		} else if (this.cursors.rotateRight.isDown) {
			angle = -ROTATION_SPEED;
		}

		this.player.body.velocity.setTo(x, y);

		this.playerAngle = (this.playerAngle + angle + 360) % 360;
		this.updateFacingCursor(
			this.player.viewingCursor,
			this.player.x, this.player.y + this.player.height * 0.365 * Math.cos(Math.PI),
			this.playerAngle, VIEWING_ANGLE, VIEW_LINE_LENGTH,
			8, 0xff0000, 0.5
		);
	}

	private updateRemotePlayers(): void {
		const updated = {};
		for (const id of Object.keys(this.remotePlayers)) {
			updated[id] = false;
		}

		for (const remoteUser of this.remoteUserModels) {
			const id = remoteUser.connectionId;
			let remotePlayer: IsoSprite;
			if (id in this.remotePlayers) {
				remotePlayer = this.remotePlayers[id];
				updated[id] = true;
			} else {
				// @ts-ignore
				remotePlayer = this.add.isoSprite(128, 128, 15, 'cube2', this.isoGroup);
				remotePlayer.tint = 0xbf86da;
				this.isoPhysics.world.enable(remotePlayer);
				remotePlayer.viewingCursor = this.add.graphics();
				remotePlayer.viewingCursor.depth = 9999;
				this.remotePlayers[id] = remotePlayer;
			}
			remotePlayer.isoX = remoteUser.location.x;
			remotePlayer.isoY = remoteUser.location.y;
			this.updateFacingCursor(
				remotePlayer.viewingCursor,
				remotePlayer.x, remotePlayer.y + remotePlayer.height * 0.365 * Math.cos(Math.PI),
				remoteUser.location.angle, VIEWING_ANGLE, VIEW_LINE_LENGTH / 2,
				4, 0x00ffff, 0.5
			);
		}

		for (const id of Object.keys(updated)) {
			if (updated[id]) { continue; }
			const remotePlayer = this.remotePlayers[id];
			this.isoPhysics.world.bodies.delete(remotePlayer.body);
			remotePlayer.destroy();
			remotePlayer.viewingCursor.destroy();
			delete this.remotePlayers[id];
		}
	}

	private updateFacingCursor(obj: Phaser.GameObjects.Graphics,
														 x: number, y: number, angle: number,
														 viewingAngle: number, viewLineLength: number,
														 viewLineWidth: number, color: number, alpha: number): void {
		obj.setX(x);
		obj.setY(y);

		const p0 = this.iso.projector.project(new IsoPoint3());
		const p1 = this.iso.projector.project(new IsoPoint3(
			viewLineLength * Math.cos((angle - viewingAngle / 2) / 360 * (Math.PI * 2)),
			viewLineLength * Math.sin((angle - viewingAngle / 2) / 360 * (Math.PI * 2)),
		));
		const p2 = this.iso.projector.project(new IsoPoint3(
			viewLineLength * Math.cos((angle + viewingAngle / 2) / 360 * (Math.PI * 2)),
			viewLineLength * Math.sin((angle + viewingAngle / 2) / 360 * (Math.PI * 2)),
		));

		obj
			.clear()
			.lineStyle(viewLineWidth, color, alpha)
			.beginPath()
			.moveTo(p1.x - p0.x, p1.y - p0.y)
			.lineTo(0, 0)
			.lineTo(p2.x - p0.x, p2.y - p0.y)
			.lineTo(0, 0)
			.closePath()
			.strokePath();
	}

	getPlayerLocation(): UserLocation {
		const location = new UserLocation();
		location.update(this.player.isoX, this.player.isoY);
		location.updateAngle(this.playerAngle);
		return location;
	}

	setPlayerLocation(location: UserLocation): void {
		this.player.isoX = location.x;
		this.player.isoY = location.y;
		this.playerAngle = location.angle;
	}

	setRemoteUsers(users: UserModel[]): void {
		this.remoteUserModels = users;
	}
}


// Fix bug of phaser3-plugin-isometric
// @ts-ignore
Phaser.GROUP = 'Group';


// based on http://udof.org/phaser/iso/doc/Projector.js.html#sunlight-1-line-131
function topologicalSortInGroup(group: Phaser.GameObjects.Group, padding: number = 1.5): void {
	const children: any[] = group.children.getArray();
	const len = children.length;

	for (let i = 0; i < len; i++) {
		const a = children[i];
		let behindIndex = 0;
		if (!a.isoSpritesBehind) {
			a.isoSpritesBehind = [];
		}

		for (let j = 0; j < len; j++) {
			if (i !== j) {
				const b = children[j];
				const bounds = a.body || a.isoBounds;
				if (b._isoPosition.x + padding < bounds.frontX - padding &&
					b._isoPosition.y + padding < bounds.frontY - padding &&
					b._isoPosition.z + padding < bounds.top - padding) {
					a.isoSpritesBehind[behindIndex++] = b;
				}
			}
		}
		a.isoVisitedFlag = false;
	}

	let _sortDepth = 0;

	function visitNode(node) {
		if (node.isoVisitedFlag === false) {
			node.isoVisitedFlag = true;
			const spritesBehindLength = node.isoSpritesBehind.length;
			for (let k = 0; k < spritesBehindLength; k++) {
				if (node.isoSpritesBehind[k] === null) {
					break;
				} else {
					visitNode(node.isoSpritesBehind[k]);
					node.isoSpritesBehind[k] = null;
				}
			}

			node.setDepth(_sortDepth++);
		}
	}

	for (let i = 0; i < len; i++) {
		visitNode(children[i]);
	}
}
