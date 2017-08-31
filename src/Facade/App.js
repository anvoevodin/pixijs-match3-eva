import * as PIXI from "pixi.js";

//there will be only 1 instance of App
let instance = new PIXI.Application(window.innerWidth, window.innerHeight, {
	// forceCanvas: true,
	// roundPixels: true,
	transparent: true
});
//we're going to store some useful data here, for example, actual width and height of screen
instance.data = {
	W: window.innerWidth,
	H: window.innerHeight
};

window.onresize = e => {
	instance.data.W = window.innerWidth;
	instance.data.H = window.innerHeight;
	instance.renderer.resize(instance.data.W, instance.data.H);
	instance.stage.emit("onWindowResize");
}

export default instance;