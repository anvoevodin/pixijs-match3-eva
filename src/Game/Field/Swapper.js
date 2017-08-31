import { TweenLite } from "gsap";

/** The class makes front tile swaps. */
export default class Swapper {
	constructor(field) {
		this._field = field;
	}

	/** Is invoked when we select a front tile */
	pick(col, row) {
		let frontTile = this._field.frontTiles[col][row];
		let backTile = this._field.backTiles[col][row];
		if (!frontTile) return;

		//if clicked on tile is only one who is going to be selected then select it
		if (!this._firstFrontTile) {
			frontTile.select(true);
			backTile.select(true);
			this._firstFrontTile = frontTile;
			this._firstBackTile = backTile;
		}
		//if there is already selected tile and it's the same that we just picked, then remove
		else if (frontTile == this._firstFrontTile) {
			frontTile.select(false);
			backTile.select(false);
			this._firstFrontTile = undefined;
			this._firstBackTile = undefined;
		}
		//if there is already selected tile but current one is too far to be swapped, then make reselecting
		else if (!this._field.resolver.areNear(this._firstFrontTile, frontTile)) {
			this._firstFrontTile.select(false);
			this._firstBackTile.select(false);
			frontTile.select(true);
			backTile.select(true);
			this._firstFrontTile = frontTile;
			this._firstBackTile = backTile;
		}
		//if there is already selected tile and current one is near to it then swap them
		else {
			this._firstFrontTile.select(false);
			this._firstBackTile.select(false);
			this.swap(this._firstFrontTile, frontTile);
			this._firstFrontTile = undefined;
			this._firstBackTile = undefined;
		}
	}

	/** Swaps two front tiles.
		needCheck - does the function have to check matches after swapping to swap them back
		isWeak - true - no tween, all is going suddenly, default - there is a tween
		options - options for tween that will be merged with default */
	swap(tile1, tile2, needCheck, onComplete, isWeak, options) {
		if (needCheck === undefined) needCheck = true;
		this.isSwapping = true;
		let time, tweenOptions, that = this;
		let tile1Target = this._field.getCoordsByPos(tile2.col, tile2.row);
		let tile2Target = this._field.getCoordsByPos(tile1.col, tile1.row);
		let tmpCol = tile1.col, tmpRow = tile1.row;
		//swapping data
		tile1.col = tile2.col; tile1.row = tile2.row;
		tile2.col = tmpCol; tile2.row = tmpRow;
		this._field.frontTiles[tile1.col][tile1.row] = tile1;
		this._field.frontTiles[tile2.col][tile2.row] = tile2;
		//swapping view
		if (!isWeak) {
			tweenOptions = {
				x: tile1Target[0],
				y: tile1Target[1]
			};
			tweenOptions = Object.assign(tweenOptions, options);

			if (options && options.time) time = options.time;
			else time = Math.max(this._field.getTimeByCoords(tweenOptions.x, tile1.x), this._field.getTimeByCoords(tweenOptions.y, tile1.y));
			this._tweenSwap1 = TweenLite.to(tile1, time, tweenOptions);
			// this._tweenSwap1 = TweenLite.to(tile1, options && options.time ? options.time : 0.2, tweenOptions);

			tweenOptions = {
				x: tile2Target[0],
				y: tile2Target[1],
				onComplete: complete
			};
			tweenOptions = Object.assign(tweenOptions, options);
			this._tweenSwap2 = TweenLite.to(tile2, time, tweenOptions);
			// this._tweenSwap2 = TweenLite.to(tile2, options && options.time ? options.time : 0.2, tweenOptions);
		} else {
			tile1.position.set.apply(tile1.position, tile1Target);
			tile2.position.set.apply(tile2.position, tile2Target);
			complete();
		}

		function complete() {
			that.isSwapping = false;
			that.afterSwap(tile1, tile2);
			if (needCheck === true) that.onSwapped(tile1, tile2, onComplete, isWeak);
			else {
				if (onComplete) onComplete();
			}
		}
	}

	/** Is invoked when a swap was finished and now we need to check mathes. If there is no any,
		then we need to swap tiles back. */
	onSwapped(tile1, tile2, onComplete, isWeak) {
		if (this._field.resolver.hasMatch()) {
			this._field.resolver.match();
			if (onComplete) onComplete();
		} else this.swap(tile1, tile2, false, onComplete, isWeak);
	}

	/** Is invoked when a swap is done (and it doesn't matter successfully or not) */
	afterSwap(tile1, tile2) {
		tile1.select(false);
		tile2.select(false);
		this._field.backTiles[tile1.col][tile1.row].select(false);
		this._field.backTiles[tile2.col][tile2.row].select(false);
	}

	destroy() {
		if (this._tweenSwap1) { this._tweenSwap1.kill(); delete this._tweenSwap1; }
		if (this._tweenSwap2) { this._tweenSwap2.kill(); delete this._tweenSwap2; }
	}
}