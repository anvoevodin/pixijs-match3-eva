import * as PIXI from "pixi.js";

import Config from "Config";
import { App } from "Facade";

export default class Preloader extends PIXI.Container {
	constructor() {
		super();
		/** TexField for showing status of loading */
		this._tf = new PIXI.Text("0%", { fontSize: 30, fill: 0 });
		this._tf.alignAnchor();

		this._tf.position.set(App.data.W * 0.5, App.data.H * 0.5);
		this.addChild(this._tf);

		this.onProgress = this.onProgress.bind(this); //for removing listener
	}

	//loading all needed resources and returns a promise
	loadContent() {
		return new Promise((resolve, reject) => {
			let obj;
			//here we take all content objects that have to be loaded while preloading
			for (let cid in Config.initialCIDs) {
				obj = Config.content[cid]; //take content data of particular object
				//looping through each content object to find needed props
				Config.initialCIDs[cid].forEach(propName => {
					App.loader.add(obj[propName], Config.paths.imagesUri + obj[propName]); //adding new resource to list of loadings
				});
			}
			App.loader.on("progress", this.onProgress);
			//is invoked when loading is done
			App.loader.load((loader, resources) => {
				App.loader.removeListener("progress", this.onProgress);
				setTimeout(resolve, 100); //just to see the preloader
			});
		}).catch(err => {
			App.loader.removeListener("progress", this.onProgress);
			console.log("ERROR Preloader:loadContent:", err);
		});
	}

	onProgress(loader) {
		this._tf.text = loader.progress.toFixed(2) + "%";
	}
}