import * as PIXI from "pixi.js";
import { TweenLite } from "gsap";

import Tile from "./Tile.js";

export default class Back extends Tile {
	constructor(cid, col, row) {
		super(cid, col, row);
	}

	/** Makes selected appearance */
	select(value) {
		if (this.isSelected == value) return;
		this.isSelected = value;
		this._tweenSelection = TweenLite.to(this._bg, 0.2, { alpha: value ? 0 : 1 });
	}

	destroy() {
		if (this._tweenSelection) { this._tweenSelection.kill(); delete this._tweenSelection; }
	}
}