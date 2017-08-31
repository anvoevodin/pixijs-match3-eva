import * as PIXI from "pixi.js";

import App from "./App"; //App can have only one instance, so it's created when we import it for the first time
import Preloader from "./Preloader";
import Game from "Game";

export default class Facade {
	constructor() {
		document.getElementById("root").appendChild(App.view);

		this._preloader = new Preloader();
		this._preloader.loadContent().then(res => this.onLoaded());
		App.stage.addChild(this._preloader);
	}

	/** Is invoked when all resources are loaded */
	onLoaded() {
		this._preloader.removeFromParent(true);
		let game = new Game(5, 6);
		App.stage.addChild(game);
	}
}

export { App };