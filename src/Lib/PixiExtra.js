import * as PIXI from "pixi.js";

/** Removes the current child from his parent. Also destroys it if needDestroy-prop is passed as true. Returns the child. */
PIXI.DisplayObject.prototype.removeFromParent = function removeFromParent(needDestroy) {
	if (needDestroy) this.destroy({ children: true });

	if (!this.parent) return this;
	if (this.parent.getChildIndex(this) == -1) return this;
	this.parent.removeChild(this);
	return this;
}

/** The function sets the anchor in particular place. Default - in center.
	We can pass a parameter from 1 to 9, where, e.g., 1 is top-left, 5 - center,
	8 - bottom-center etc. For understanding imagine a squre:
		1 2 3
		4 5 6
		7 8 9
	Returns itself for chaining
*/
PIXI.Sprite.prototype.alignAnchor = function alignAnchor(pos) {
	pos = pos || 5;
	if (pos < 1 || pos > 9) throw "Wrong number '" + pos + "' for aligning anchor";
	let ky = Math.floor((pos - 1) / 3);
	let kx = (pos - 1) - ky * 3;
	this.anchor.set(kx * 0.5, ky * 0.5);
	return this;
}

/** Proportionally changes size of the display object that way the display object fits into frame */
PIXI.DisplayObject.prototype.propFrame = function (frameWidth, frameHeight) {
	var bounds = this.getBounds();
	if (bounds.width < frameWidth) this.propByWidth(frameWidth, false);
	if (bounds.height < frameHeight) this.propByHeight(frameHeight, false);
}

/** Proportionally changes size of the display object with a side that is larger */
PIXI.DisplayObject.prototype.propLarger = function (width, height, onlyZoomOut) {
	if (onlyZoomOut === undefined) onlyZoomOut = true;
	var bounds = this.getBounds();
	if (bounds.width > bounds.height) this.propByWidth(width, onlyZoomOut);
	else this.propByHeight(height, onlyZoomOut);
}

/** Proportionally changes size of the display object with a side that is less */
PIXI.DisplayObject.prototype.propLess = function (width, height, onlyZoomOut) {
	if (onlyZoomOut === undefined) onlyZoomOut = true;
	var bounds = this.getBounds();
	if (bounds.width < bounds.height) this.propByWidth(width, onlyZoomOut);
	else this.propByHeight(height, onlyZoomOut);
}

/** Proportionally changes size of the display object relative to specified width */
PIXI.DisplayObject.prototype.propByWidth = function (newWidth, onlyZoomOut) {
	if (onlyZoomOut === undefined) onlyZoomOut = true;
	var bounds = this.getBounds();
	var k = newWidth / bounds.width;
	if (!onlyZoomOut || k < 1) {
		this.width = parseInt(bounds.width * k);
		this.height = parseInt(bounds.height * k);
	}
}

/** Proportionally changes size of the display object relative to specified height */
PIXI.DisplayObject.prototype.propByHeight = function (newHeight, onlyZoomOut) {
	if (onlyZoomOut === undefined) onlyZoomOut = true;
	var bounds = this.getBounds();
	var k = newHeight / bounds.height;
	if (!onlyZoomOut || k < 1) {
		this.width = parseInt(bounds.width * k);
		this.height = parseInt(bounds.height * k);
	}
}