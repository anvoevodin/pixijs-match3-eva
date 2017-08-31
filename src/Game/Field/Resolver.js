import { Linear } from "gsap";
import Hinter from "Lib/Hinter";

import Config from "Config";
import { App } from "Facade";

/** The class watches out for field and fill front tiles when they are missed. */
export default class Resolver {
	constructor(field) {
		this._field = field;
	}

	/** Creates random front tiles, put them on the stage and into frontTiles array */
	generate() {
		let cid, tmpTile, exeptions, tile, coords;
		for (let i = 0; i < this._field.backTiles.length; i++) {
			this._field.frontTiles[i] = [];
			for (let j = 0; j < this._field.backTiles[i].length; j++) {
				exeptions = [];
				/* We're going to take cids of front tiles of all side (left, top, right, bottom) relative to current, and
				   avoid them when we generate new CID for current front tile. Then we'll never make prepared matches. */
				tmpTile = this.getFront(i, j - 1);
				if (tmpTile) exeptions.push(tmpTile.obj.cid);
				tmpTile = this.getFront(i - 1, j);
				if (tmpTile) exeptions.push(tmpTile.obj.cid);
				tmpTile = this.getFront(i + 1, j);
				if (tmpTile) exeptions.push(tmpTile.obj.cid);
				tmpTile = this.getFront(i, j + 1);
				if (tmpTile) exeptions.push(tmpTile.obj.cid);

				cid = this.getRndCID(exeptions);
				this._field.createFrontTile(cid, i, j);
			}
		}
		this.checkPossibleMoves(true);
	}

	/** Removes all matches and fills the field with new front tiles */
	match() {
		let matches = this.getMatches();
		if (matches.length < 1) return false;

		this.isMatching = true;
		let tile, isLast, that = this;
		for (let i = 0; i < matches.length; i++) {
			this._field.tabler.addMatch(matches[i]);
			for (let j = 0; j < matches[i].match.length; j++) {
				tile = matches[i].match[j];
				//remember the last tile to know when his animation will be over to make new actions
				isLast = i + 1 == matches.length && j + 1 == matches[i].match.length;
				this._field.frontTiles[tile.col][tile.row] = null;
				tile.remove(isLast ? removed : undefined);
			}
		}
		return true;

		function removed(tile) {
			that.isMatching = false;
			that.supplement();
		}
	}

	/** Checks whether the player has possible moves to make a match. If neither, then shuffles all pieces.
		isWeak - true - no animation */
	checkPossibleMoves(isWeak, onComplete) {
		if (this.hasPossibleMoves()) return onComplete ? onComplete() : undefined;
		this.shuffle(isWeak, onComplete);
	}

	/** Shuffle pieces on the field not depending on possible moves. */
	shuffle(isWeak, onComplete) {
		this.isShuffling = true;
		let tiles = []; //all tiles on the field
		let that = this;
		//making list of all tiles on the field
		for (let tmp, i = 0; i < this._field.frontTiles.length; i++) {
			for (let j = 0; j < this._field.frontTiles[i].length; j++) {
				tmp = this._field.frontTiles[i][j];
				tiles.push(tmp);
				this._field.frontTiles[i][j].__resolverSaved = [tmp.x, tmp.y];
			}
		}

		let workArr, firstTile, rndIndex, rnd, len, shuffleCounter = 0;
		let isBad = false, attempts = 1000;
		do {
			shuffleCounter++;
			if (shuffleCounter >= attempts) {
				isBad = true;
				break;
			}

			workArr = tiles.concat(); //working array for making changes and not being afraid about original
			firstTile = workArr.pop(); //take any (in this case last) front tile for swapping and remove from working array
			while ((len = workArr.length) > 0) {
				rndIndex = Math.round(Math.random() * (workArr.length - 1)); //index in workArr for second random piece to swap
				rnd = workArr[rndIndex]; //rnd piece to swap
				this._field.swapper.swap(firstTile, rnd, false, undefined, true);
				workArr.splice(rndIndex, 1); //remove second piece from working array
			}
		} while (!this.hasPossibleMoves() || this.hasMatch());

		//making animation for tiles
		if (!isWeak) {
			let opt, tweenTime = 0.4;
			for (let tmp, i = 0; i < tiles.length; i++) {
				tmp = tiles[i];
				opt = { x: tmp.__resolverSaved[0], y: tmp.__resolverSaved[1], ease: Linear.easeNone };
				if (i + 1 >= tiles.length) opt.onComplete = complete;
				TweenLite.from(tmp, tweenTime, opt);
			}
			Hinter.simple(App, "MIXING", App.data.W * 0.5, App.data.H * 0.5, { fontSize: 65, fill: 0xffffff, dropShadowDistance: 3 }, tweenTime);
		}

		if (isBad) console.log("ERROR: Shuffling was too long (" + attempts + " attempts)!");

		function complete() {
			that.isShuffling = false;
		}
	}

	hasPossibleMoves() {
		let first, second, match, scheme = [[0, -1], [1, 0], [0, 1], [-1, 0]];
		for (let i = 0; i < this._field.frontTiles.length; i++) {
			for (let j = 0; j < this._field.frontTiles[i].length; j++) {
				first = this._field.frontTiles[i][j];
				if (!first) continue;

				for (let k = 0; k < scheme.length; k++) {
					second = this.getFront(i + scheme[k][0], j + scheme[k][1]);
					if (second) {
						this._field.swapper.swap(first, second, false, undefined, true); //swap to check whether we have matches
						match = this.hasMatch();
						this._field.swapper.swap(first, second, false, undefined, true); //swap the tiles back
						if (match) return true;
					}
				}
			}
		}
		return false;
	}

	/** Looks for empty cells and fill them with new front tiles */
	supplement() {
		this.isSupplementing = true;
		let tile, delay, that = this;
		let created = {}; //in key - col, in value - how many tiles we've already created in this col
		let involved = 0; //how many front tiles are acting on the field (it's just to know when the last tile will be done)
		//we're going to start with looping through rows (not cols as usually), because the pieces have to appear from the bottom
		for (let j = 0; j < this._field.frontTiles[0].length; j++) {
			for (let i = 0; i < this._field.frontTiles.length; i++) {
				tile = this._field.frontTiles[i][j];
				if (tile) continue;
				tile = takeUnder(i, j);
				if (tile) this._field.moveFrontTile(tile, i, j, done);
				else {
					//calculating delay to making front tiles appearing one by one
					delay = created[i] ? this._field.getTimeByCells(created[i]) : 0;
					this._field.createFrontTile(this.getRndCID(), i, j, i, 6, done, delay)
						.appear(delay);
					//remember how many tiles we've put in this col
					if (!created[i]) created[i] = 0;
					created[i]++;
				}
				involved++;
			}
		}

		/** Returns nearest front tile under specified pos */
		function takeUnder(col, row) {
			let tile;
			for (row = row + 1 /* making sure that we won't count current tile */; row < that._field.frontTiles[col].length; row++) {
				tile = that._field.frontTiles[col][row];
				if (tile) return tile;
			}
			return null;
		}

		/** Is invoked every time when each tile is done his moving */
		function done(tile) {
			involved--;
			if (involved < 1) {
				that.isSupplementing = false;
				//try to match again in case we have new matches after supplementing, if we don't, then check possible moves for the player
				if (!that.match()) that.checkPossibleMoves();
			}
		}
	}

	/** Returns all possible matches on the field.
		isWeak (bool) means whether the function has to stop looking for matches after first one (it's just for knowning,
		that we have at least one match) */
	getMatches(isWeak) {
		let used = []; //all pieces that are already marked as having match
		let matches = [], match;

		//loop through all pieces
		main: for (let i = 0; i < this._field.frontTiles.length; i++) {
			for (let j = 0; j < this._field.frontTiles[i].length; j++) {
				match = this.getMatchFor(this._field.frontTiles[i][j].col, this._field.frontTiles[i][j].row, used);
				//if we looked for enough tiles
				if (match) {
					used = used.concat(match.match); //mark all matched piece so that we won't use them twice
					matches.push(match);
					if (isWeak === true) break main; //if we just need to know whether there is at least one match, then break all loops
				}
			}
		}
		return matches;
	}

	/** Returns a match for specified piece */
	getMatchFor(tileCol, tileRow, exeptions) {
		let col, row, isSpecial, patTile, item, pattern, match;
		//loop through all patterns
		for (let k = 0; k < Config.field.matchPatterns.length; k++) {
			pattern = Config.field.matchPatterns[k];
			match = [];
			//loop through all items in the pattern
			for (let l = 0; l < pattern.list.length; l++) {
				item = pattern.list[l];

				col = item[0]; row = item[1];
				isSpecial = typeof col != "number" || typeof row != "number"; //special means the current pattern item is going while tiles are suitable
				if (isSpecial) l--; //because when we get "+" or "-" pattern we look for tiles while they exist

				if (col == "+") {
					if (match.length > 0) col = match[match.length - 1].col + 1;
					else col = tileCol;
				} else if (col == "-") {
					if (match.length > 0) col = match[match.length - 1].col - 1;
					else col = tileCol;
				} else col = tileCol + item[0];

				if (row == "+") {
					if (match.length > 0) row = match[match.length - 1].row + 1;
					else row = tileRow;
				} else if (row == "-") {
					if (match.length > 0) row = match[match.length - 1].row - 1;
					else row = tileRow;
				} else row = tileRow + item[1];

				patTile = this.getFront(col, row);
				if (!patTile) {
					//we don't break when it's special because after special may be another tiles
					if (isSpecial) {
						l++; //increment it to move to next iteration (because we decrement it above)
						continue;
					} else break;
				}
				//checking whether this tile has to be skipped
				else if (exeptions && exeptions.indexOf(patTile) != -1) {
					if (isSpecial) {
						l++;
						continue;
					} else break;
				}
				//checking whether we used this tile already in this match
				else if (match.indexOf(patTile) != -1) {
					if (isSpecial) l++;
					continue;
				}
				//take first tile from already matched and compare cids
				else if (match.length > 0 && match[0].obj.cid != patTile.obj.cid) {
					if (isSpecial) {
						l++;
						continue;
					} else break;
				} else match.push(patTile);
			}
			if (match.length >= pattern.minMatch) return { match: match, pattern: pattern };
		}
		return null;
	}

	// getMatches(isWeak) {
	// 	let col, row, isSpecial, patTile, item, pattern; //current pattern in the loop
	// 	let used = []; //all pieces that are already marked as having match
	// 	let matches = [], match;

	// 	//loop through all patterns
	// 	main: for (let k = 0; k < Config.field.matchPatterns.length; k++) {
	// 		pattern = Config.field.matchPatterns[k];
	// 		//loop through all pieces
	// 		for (let i = 0; i < this._field.frontTiles.length; i++) {
	// 			for (let j = 0; j < this._field.frontTiles[i].length; j++) {
	// 				match = [];
	// 				//loop through all items in the pattern
	// 				for (let l = 0; l < pattern.list.length; l++) {
	// 					item = pattern.list[l];

	// 					col = item[0]; row = item[1];
	// 					isSpecial = typeof col != "number" || typeof row != "number"; //special means the current pattern item is going while tiles are suitable
	// 					if (isSpecial) l--; //because when we get "+" or "-" pattern we look for tiles while they exist

	// 					if (col == "+") {
	// 						if (match.length > 0) col = match[match.length - 1].col + 1;
	// 						else col = i;
	// 					} else if (col == "-") {
	// 						if (match.length > 0) col = match[match.length - 1].col - 1;
	// 						else col = i;
	// 					} else col = i + item[0];

	// 					if (row == "+") {
	// 						if (match.length > 0) row = match[match.length - 1].row + 1;
	// 						else row = j;
	// 					} else if (row == "-") {
	// 						if (match.length > 0) row = match[match.length - 1].row - 1;
	// 						else row = j;
	// 					} else row = j + item[1];

	// 					patTile = this.getFront(col, row);
	// 					if (!patTile) {
	// 						//we don't break when it's special because after special may be another tiles
	// 						if (isSpecial) {
	// 							l++; //increment it to move to next iteration (because we decrement it above)
	// 							continue;
	// 						} else break;
	// 					}
	// 					//checking whether this tile was matched earlier
	// 					else if (used.indexOf(patTile) != -1) {
	// 						if (isSpecial) {
	// 							l++;
	// 							continue;
	// 						} else break;
	// 					}
	// 					//checking whether we used this tile already in this match
	// 					else if (match.indexOf(patTile) != -1) {
	// 						if (isSpecial) l++;
	// 						continue;
	// 					}
	// 					//take first tile from already matched and compare cids
	// 					else if (match.length > 0 && match[0].obj.cid != patTile.obj.cid) {
	// 						if (isSpecial) {
	// 							l++;
	// 							continue;
	// 						} else break;
	// 					} else match.push(patTile);
	// 				}
	// 				//if we looked for enough tiles
	// 				if (match.length >= pattern.minMatch) {
	// 					used = used.concat(match); //mark all matched piece so that we won't use them twice
	// 					matches.push({
	// 						match: match,
	// 						pattern: pattern
	// 					});
	// 					if (isWeak === true) break main; //if we just need to know whether there is at least one match, then break all loops
	// 				}
	// 			}
	// 		}
	// 	}
	// 	return matches;
	// }

	/** Whether the field has any matches (at least 1). The function differs from getMatches in that
		hasMatch stops running when it find at least 1 match. */
	hasMatch() {
		let matches = this.getMatches(true);
		return matches.length > 0 ? matches[0] : false;
	}

	/** Returns front tiles by specified row and col */
	getFront(col, row) {
		if (col < 0 || row < 0 || col >= this._field.frontTiles.length || row >= this._field.frontTiles[0].length) return null;
		return this._field.frontTiles[col][row];
	}

	/** Returns bool, whether two specified tiles are near to each other to be swapped */
	areNear(tile1, tile2) {
		return Math.abs(tile1.col - tile2.col) + Math.abs(tile1.row - tile2.row) === 1;
	}

	/** Returns a random CID of front tiles.
		exeptions - is an array with CIDs that the function has to avoid while generating random CID */
	getRndCID(exeptions) {
		let index, list = Config.frontCIDs.concat();
		//if we passed exeptions
		if (exeptions) {
			//checking all exeptions to remove them from the list of possible cids
			for (let i = 0; i < exeptions.length; i++) {
				index = list.indexOf(exeptions[i]);
				if (index != -1) list.splice(index, 1);
			}
		}
		return list[Math.round(Math.random() * (list.length - 1))];
	}

	destroy() {

	}
}