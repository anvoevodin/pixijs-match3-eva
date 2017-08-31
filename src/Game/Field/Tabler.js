import { App } from "Facade";
import Hinter from "Lib/Hinter";

export default class Tabler {
	constructor(field) {
		this._field = field;
		this._score = 0;
	}

	addMatch(match) {
		let extraScore, score = match.pattern.score;
		let extraIndex = (match.match.length - match.pattern.minMatch) - 1; //which index of extra score in array of all extra scores
		//if there is no extra scores or we matched not enough pieces then we get 0
		if (!match.pattern.extraScore || extraIndex < 0) extraScore = 0;
		//if extra score exists but we match more pieces than elements in array, then take the last one
		else if (extraIndex >= match.pattern.extraScore.length) extraScore = match.pattern.extraScore[match.pattern.extraScore.length - 1];
		//if all is fine, just take needed extra score
		else extraScore = match.pattern.extraScore[extraIndex];
		this._score += score + extraScore;
		this._field.ui.setScore(this._score);

		//finding average coordinates to show hint
		let g, xs = [], ys = [];
		for (let i = 0; i < match.match.length; i++) {
			g = match.match[i].toGlobal(App.stage);
			xs.push(g.x);
			ys.push(g.y);
		}
		xs = xs.reduce((total, item) => total + item) / xs.length;
		ys = ys.reduce((total, item) => total + item) / ys.length - 20;
		//show message about newly got score
		Hinter.rotated(App, "+" + score, xs, ys, { fill: match.match[0].obj.color });
		if (extraScore) Hinter.rotated(App, "+" + extraScore, xs + 25, ys - 25, { fill: match.match[0].obj.color });
	}
}