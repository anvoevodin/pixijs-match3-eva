import * as PIXI from "pixi.js";
import { TweenLite } from "gsap";

import Tile from "./Tile.js";

export default class Front extends Tile {
	constructor(cid, col, row) {
		super(cid, col, row);
	}

	/** Shows appearing animation */
	appear(delay, onComplete) {
		this.alpha = 0;
		this._tweenAppearing = TweenLite.to(this, 0.3, { delay: delay, alpha: 1, onComplete: onComplete, onCompleteParams: [this] });
	}

	/** Shows removing animation */
	remove(onComplete) {
		this._tweenRemoving = TweenLite.to(this, 0.3, { alpha: 0, onComplete: () => {
			if (onComplete) onComplete(this);
			this.removeFromParent(true);
		}});
	}

	/** Makes selected appearance */
	select(value) {
		if (this.isSelected == value) return;
		this.isSelected = value;
		if (value === true) {
			this._bg.blendMode = PIXI.BLEND_MODES.OVERLAY;
			this._bg.texture = PIXI.Texture.from(this.obj.icoSelected);
		} else {
			this._bg.blendMode = PIXI.BLEND_MODES.NORMAL;
			this._bg.texture = PIXI.Texture.from(this.obj.ico);
		}
	}

	destroy() {
		if (this._tweenAppearing) { this._tweenAppearing.kill(); delete this._tweenAppearing; }
		if (this._tweenRemoving) { this._tweenRemoving.kill(); delete this._tweenRemoving; }
	}
}