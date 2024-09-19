import * as PIXI from 'pixi.js'; // Import the 'PIXI' module
import { BaseController } from "./BaseController";

export class ContainerController extends BaseController{
    constructor(_name:string, renderer: PIXI.IRenderer<PIXI.ICanvas>){
        super();
        let container:PIXI.Container = new PIXI.Container();
        container.name = _name;
        container.x = 100;
        container.y = 100;
        this.drawCrosshair(container, 0, 0, 25, 3);
        this.setView(container);
    }
    /*
    protected updateHitArea(container: PIXI.Container) {
        container.hitArea = new PIXI.Rectangle(-container.width / 2, -container.height / 2, container.width, container.height);
    }
        */
    

    private drawCrosshair(container:PIXI.Container,x: number, y: number, length: number, thickness: number) {
        let graphics:PIXI.Graphics = new PIXI.Graphics();
        graphics.clear();
        graphics.name = "crosshair";

        // Draw vertical line
        graphics.lineStyle(thickness, 0xFF0000, 1); // Red color, solid line
        graphics.moveTo(x, y - length / 2);
        graphics.lineTo(x, y + length / 2);

        // Draw horizontal line
        graphics.lineStyle(thickness, 0x00FF00, 1); // Green color, solid line
        graphics.moveTo(x - length / 2, y);
        graphics.lineTo(x + length / 2, y);
        graphics.interactive = true;
        container.addChild(graphics);
    }
}