import * as PIXI from 'pixi.js';
import { Model } from "./Model";
export class GraphicsController{
    static drawSquareAroundSprite(sprite: PIXI.Container) {
        const padding = 0;
        const { x, y, width, height } = sprite.getBounds();
    
        Model.getInstance().linesHolder!.clear(); // Clear any previous drawings
        Model.getInstance().linesHolder!.lineStyle(2, 0xFF0000); // Set line style (width and color)
        Model.getInstance().linesHolder!.drawRect(x - padding, y - padding, width + padding * 2, height + padding * 2); // Draw rectangle
        
    }

    static drawCircleAroundAnchor(x:number, y:number, color:number = 0xFF0000) {
        const radius = 5;
        //

        Model.getInstance().linesHolder!.lineStyle(2, color); // Set line style (width and color)
        Model.getInstance().linesHolder!.beginFill(color); // Set fill color
        Model.getInstance().linesHolder!.drawCircle(x, y, radius); // Draw circle
        Model.getInstance().linesHolder!.endFill();
    }

    
}