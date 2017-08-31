import * as PIXI from "pixi.js";
import { TweenLite } from "gsap";

export default class UI extends PIXI.Container {
	constructor() {
		super();
		this.tfScore = new PIXI.Text("0", {
			fontSize: 50,
			fill: 0xffffff,
			fontWeight: "bold",
			dropShadow: true,
			dropShadowColor: 0x0f3f61,
			dropShadowDistance: 2
		});
		this.tfScore.alignAnchor();
		this.addChild(this.tfScore);
	}

	setScore(score) {
		TweenLite.to(this.tfScore, 0.7, { text: score, onUpdate: () => this.tfScore.text = Math.round(this.tfScore.text) });
	}
}