import * as PIXI from "pixi.js";
import { TweenLite, Linear } from "gsap";

import Config from "Config";
import { App } from "Facade";
import Resolver from "./Resolver";
import Swapper from "./Swapper";
import Tabler from "./Tabler";
import UI from "./UI";
import Back from "./Tiles/Back";
import Front from "./Tiles/Front";

export default class Field extends PIXI.Container {
	constructor(levelCID) {
		super();
		this.levelObj = Config.content[levelCID];
		this.tabler = new Tabler(this);
		this.resolver = new Resolver(this); //util that helps to watch out for field filling
		this.swapper = new Swapper(this); //util that helps to swap front tiles

		this.cont = new PIXI.Container(); //container for tile layers and all their stuff
		this.layerBack = new PIXI.Container(); //here we will store all our back tiles
		this.layerFront = new PIXI.Container(); //here we will store all our front tiles
		this.ui = new UI();

		this.cont.addChild(this.layerBack);
		this.cont.addChild(this.layerFront);
		this.addChild(this.cont);
		this.addChild(this.ui);

		this.fillBackTiles(); //initializing back tiles array
		this.fillFrontTiles(); //initializing front tiles array

		this.ui.position.set(this.getBounds().width * 0.5, this.getBounds().height + 5);

		this.interactive = true;
		this.on("pointerdown", this.onStartClick = this.onStartClick.bind(this));
		// this.on("pointerup", this.onEndClick = this.onEndClick.bind(this));
		// this.on("pointerupoutside", this.onEndClick = this.onEndClick.bind(this));
		// this.on("pointermove", this.onMouseMoved = this.onMouseMoved.bind(this));
		// App.ticker.add(this.onTick = this.onTick.bind(this));
	}

	/** Is invoked when a player clicked on a tile */
	onStartClick(e) {
		if (this.isFieldBlocked()) return;
		let coords = e.data.getLocalPosition(this);
		let pos = this.getPosByCoords(coords.x, coords.y);
		this.swapper.pick(pos[0], pos[1]);
	}

	isFieldBlocked() {
		return this.swapper.isSwapping === true || this.resolver.isMatching === true || this.resolver.isSupplementing === true || this.resolver.isShuffling === true;
	}

	/** Creates a new front tile with specified cid in specified col and row.
		If fromCol and fromRow are passed then the tile will be going
		from (fromCol, fromRow) to (col, row) by tweening */
	createFrontTile(cid, col, row, fromCol, fromRow, onComplete, appearanceDelay) {
		let tile = new Front(cid, col, row);
		this.frontTiles[col][row] = tile;
		tile.propLarger(Config.field.frontTileWidth, Config.field.frontTileHeight);
		this.layerFront.addChild(tile);

		if (fromCol !== undefined && fromRow !== undefined) {
			tile.position.set.apply(tile.position, this.getCoordsByPos(fromCol, fromRow));
			let newCoords = this.getCoordsByPos(col, row);
			this.tweenFrontTile(tile, newCoords[0], newCoords[1], onComplete, appearanceDelay);
		} else {
			tile.position.set.apply(tile.position, this.getCoordsByPos(col, row));
			if (onComplete) onComplete(tile);
		}
		return tile;
	}

	/** Moves the tile to specified pos */
	moveFrontTile(tile, col, row, onComplete) {
		this.frontTiles[tile.col][tile.row] = null;
		this.frontTiles[col][row] = tile;
		tile.col = col;
		tile.row = row;
		let coords = this.getCoordsByPos(col, row);
		this.tweenFrontTile(tile, coords[0], coords[1], onComplete);
		return tile;
	}

	/** Moves sprite to specified coords with calculating correct time */
	tweenFrontTile(tile, toX, toY, onComplete, appearanceDelay) {
		TweenLite.to(tile, this.getTimeByCoords(toY, tile.y), { delay: appearanceDelay, x: toX, y: toY, ease: Linear.easeNone, onComplete: onComplete, onCompleteParams: [tile] });
	}

	/** Creates backTiles array, creates new back tiles and adds them on the stage. Can be called only once */
	fillBackTiles() {
		if (this._isBackTilesFilled === true) return;
		this.backTiles = [];
		let tile, coords;
		for (let i = 0; i < this.levelObj.cols; i++) {
			this.backTiles[i] = [];
			for (let j = 0; j < this.levelObj.rows; j++) {
				tile = new Back(7, i, j);
				this.backTiles[i][j] = tile;
				tile.propLarger(Config.field.backTileWidth, Config.field.backTileHeight);
				tile.position.set.apply(tile.position, this.getCoordsByPos(i, j));
				this.layerBack.addChild(tile);
			}
		}
		this._isBackTilesFilled = true; //flag for knowing, whether we initialized back tiles
	}

	/** Creates frontTiles array and fills it Can be called only once */
	fillFrontTiles() {
		if (this._isFrontTilesFilled === true) return;
		this.frontTiles = [];
		this.resolver.generate();
		this._isFrontTilesFilled = true; //flag for knowing, whether we initialized front tiles
	}

	/** Returns x and y (as array with 2 elements: 0 - x, 1 - y) of any tile with specified col and row (col and row >= 0).
		Returned coordinates means center of tile, not his top-left anchor */
	getCoordsByPos(col, row) {
		let width = Config.field.backTileWidth;
		let height = Config.field.backTileHeight;
		return [width * 0.5 + width * col, height * 0.5 + height * row];
	}

	/** Returns col and row (as array with 2 elements: 0 - col, 1 - row) of specified x and y of field. */
	getPosByCoords(x, y) {
		let width = Config.field.backTileWidth;
		let height = Config.field.backTileHeight;
		return [Math.floor(x / width), Math.floor(y / height)];
	}

	/** Returns seconds by distance for moving front tiles */
	getTimeByCoords(fromCoord, toCoord) {
		return Math.abs(fromCoord - toCoord) / Config.field.frontTileSpeed
	}

	/** Returns seconds by count of passed cells */
	getTimeByCells(cells) {
		return this.getTimeByCoords(this.getCoordsByPos(0, 0)[1], this.getCoordsByPos(0, cells)[1]);
	}

	destroy() {
		//removing all tweens of tiles if they exist
		for (var i = 0; i < this.frontTiles.length; i++) {
			for (var j = 0; j < this.frontTiles[i].length; j++) {
				if (this.frontTiles[i][j]) TweenLite.killTweensOf(this.frontTiles[i][j]);
			}
		}
		this.resolver.destroy();
		this.swapper.destroy();
		super.destroy();
	}
}