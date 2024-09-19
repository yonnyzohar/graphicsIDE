import * as PIXI from 'pixi.js';
import { GraphicsController } from "../GraphicsController";
import { BaseController } from "./BaseController";
export class SpriteController extends BaseController{

    public filePath: string | undefined;

    constructor(texture: PIXI.Texture, name: string, renderer: PIXI.IRenderer<PIXI.ICanvas>, filePath:string) {
        super();
        const sprite = new PIXI.Sprite(texture);

        sprite.pivot.set(0.5, 0.5);
        sprite.x = 100;
        sprite.y = 100;
        sprite.scale.set(1);
        sprite.skew.set(0);
        sprite.rotation = 0;
        sprite.name = name;
        this.filePath = filePath;
        this.setView(sprite);
    }

    public dragging() {
        if (this.view) {
            let sprite = this.view as PIXI.Sprite;
            const _width = sprite.texture.orig.width;
            const _height = sprite.texture.orig.height;

            // Calculate the local positions of the four corners
            const topLeftLocal = new PIXI.Point(0, 0);
            const topRightLocal = new PIXI.Point(_width, 0);
            const bottomLeftLocal = new PIXI.Point(0, _height);
            const bottomRightLocal = new PIXI.Point(_width, _height);

            // Apply the sprite's transformation to get the global positions
            this.topLeftGlobal = this.view.toGlobal(topLeftLocal) as PIXI.Point;
            this.topRightGlobal = this.view.toGlobal(topRightLocal) as PIXI.Point;
            this.bottomLeftGlobal = this.view.toGlobal(bottomLeftLocal) as PIXI.Point;
            this.bottomRightGlobal = this.view.toGlobal(bottomRightLocal) as PIXI.Point;

            GraphicsController.drawCircleAroundAnchor(this.topLeftGlobal.x, this.topLeftGlobal.y, 0xffccff);
            GraphicsController.drawCircleAroundAnchor(this.topRightGlobal.x, this.topRightGlobal.y, 0xffccff);
            GraphicsController.drawCircleAroundAnchor(this.bottomLeftGlobal.x, this.bottomLeftGlobal.y, 0xffccff);
            GraphicsController.drawCircleAroundAnchor(this.bottomRightGlobal.x, this.bottomRightGlobal.y, 0xffccff);
        }


    }
    
    

    

    


}