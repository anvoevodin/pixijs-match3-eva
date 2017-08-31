import { TweenLite, Back } from "gsap";

let Hinter = {};

Hinter.simple = function (app, text, x, y, tfOptions, time) {
	if (time === undefined) time = 0.7;
	let opt = {
		fontSize: 60,
		fill: 0xffffff,
		fontWeight: "bold",
		dropShadow: true,
		dropShadowColor: 0x0f3f61,
		dropShadowDistance: 2
	}
	opt = Object.assign(opt, tfOptions);
	let tf = new PIXI.Text(text, opt);
	tf.alignAnchor();
	tf.position.set(x, y);
	tf.alpha = 0;
	app.ticker.add(tick);
	app.stage.addChild(tf);
	TweenLite.to(tf, 0.3, { alpha: 1, ease: Back.easeOut, onComplete: complete });

	function tick() {
		tf.y -= 1;
	}

	function complete() {
		TweenLite.to(tf, 0.3, { delay: time, alpha: 0, ease: Back.easeOut, onComplete: remove });
	}

	function remove() {
		tf.removeFromParent(true);
		app.ticker.remove(tick);
	}
}

Hinter.rotated = function (app, text, x, y, tfOptions, time) {
	if (time === undefined) time = 0.7;
	let opt = {
		fontSize: 60,
		fill: 0xffffff,
		fontWeight: "bold",
		dropShadow: true,
		dropShadowColor: 0x0f3f61,
		dropShadowDistance: 2
	}
	opt = Object.assign(opt, tfOptions);
	let tf = new PIXI.Text(text, opt);
	tf.alignAnchor();
	tf.position.set(x, y);
	tf.alpha = 0;
	tf.rotation = -0.4;
	app.ticker.add(tick);
	app.stage.addChild(tf);
	TweenLite.to(tf, 0.3, { alpha: 1, rotation: -0.2, ease: Back.easeOut, onComplete: complete });

	function tick() {
		tf.y -= 1;
	}

	function complete() {
		TweenLite.to(tf, 0.3, { delay: time, alpha: 0, ease: Back.easeOut, onComplete: remove });
	}

	function remove() {
		tf.removeFromParent(true);
		app.ticker.remove(tick);
	}
}

export default Hinter;