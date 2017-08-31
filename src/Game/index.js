import * as PIXI from "pixi.js";

import Config from "Config";
import { App } from "Facade";
import Field from "./Field";

export default class Game extends PIXI.Container {
	constructor(mapCID, levelCID) {
		super();
		this.obj = Config.content[mapCID];

		//creating background for the game
		this._bgSprite = new PIXI.Sprite(PIXI.Texture.from(this.obj.ico));
		this.addChild(this._bgSprite);

		//creating field for playing
		this._field = new Field(levelCID);
		this.addChild(this._field);

		//setting correct positions for all elements of game
		this.repos();

		//updating positions when window sizes are changed
		App.stage.on("onWindowResize", this.repos = this.repos.bind(this));
	}

	/** Updates positions of all game elements */
	repos() {
		console.log("RESIZE");
		let bounds;
		if (this._bgSprite) {
			this._bgSprite.propFrame(App.data.W, App.data.H, false);
			bounds = this._bgSprite.getBounds();
			this._bgSprite.position.set((App.data.W - bounds.width) * 0.5, (App.data.H - bounds.height) * 0.5);
			// this._bgSprite.position.set((App.data.W - bounds.width) * 0.5, App.data.H - bounds.height);
		}
		if (this._field) {
			bounds = this._field.getBounds();
			let kx = App.data.W / bounds.width;
			let ky = App.data.H / bounds.height;
			if (kx < 1 || ky < 1) this._field.scale.set(Math.min(kx * 0.9, ky * 0.9));
			else this._field.scale.set(1);
			bounds = this._field.getBounds();
			this._field.position.set((App.data.W - bounds.width) * 0.5, (App.data.H - bounds.height) * 0.5);
		}
	}

	destroy() {
		App.stage.removeListener("onWindowResize", this.repos);
		super.destroy();
	}
}