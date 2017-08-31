import * as PIXI from "pixi.js";

import Config from "Config";

export default class Tile extends PIXI.Container {
	constructor(cid, col, row) {
		super();
		this.col = col;
		this.row = row;
		this.obj = Config.content[cid];

		this._bg = new PIXI.Sprite(PIXI.Texture.from(this.obj.ico));
		if (Array.isArray(this.obj.anchor)) this._bg.anchor.set(this.obj.anchor[0], this.obj.anchor[1]);
		else this._bg.alignAnchor();
		this.addChild(this._bg);
	}
}