import * as PIXI from "pixi.js";
import { Model } from "./Model";

export class AssetHolderController {
  btmLinesHolder: PIXI.Graphics | undefined;
  gridSize = 20;
  dragging = false;
  dragStart = new PIXI.Point();
  viewStart = new PIXI.Point();
  public view: PIXI.Container = new PIXI.Container();
  private stageScalingTXT: PIXI.Text | undefined;

  constructor() {
    console.log("AssetHolderController constructor");

    this.view!.eventMode = "dynamic";
    this.view!.interactive = true;
    const renderer = Model.getInstance().renderer!;
    if (renderer && renderer.view) {
      let v = renderer.view as any;
      v.addEventListener(
        "mousedown",
        this.onDragStart.bind(this) as EventListener
      );
      v.addEventListener("mousemove", this.onDragMove.bind(this));
      v.addEventListener("mouseup", this.onDragEnd.bind(this));
      v.addEventListener("mouseupoutside", this.onDragEnd.bind(this));
    }
    this.drawGrid();

    this.stageScalingTXT = new PIXI.Text('Scaling ' + this.view.scale.x, new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 12,
      fill: '#ffffff',
      wordWrap: false
  }));
  }

  public addGridScaling()
  {
    if(this.stageScalingTXT)
    {
      let model = Model.getInstance();
      if (model.stage) {
        model.stage.addChild(this.stageScalingTXT);
        this.stageScalingTXT.x = 10;
        this.stageScalingTXT.y = model.renderer?.height! - 30;
      }
    }
    
  }

  public drawGrid() {
    let model = Model.getInstance();
    if (!this.btmLinesHolder) {
      this.btmLinesHolder = new PIXI.Graphics();
      this.view.addChildAt(this.btmLinesHolder, 0);
    }

    let graphics = this.btmLinesHolder;
    if (graphics) {
      graphics.clear();
      graphics.lineStyle(1, 0xcccccc, 1);

      const width = model.renderer!.width;
      const height = model.renderer!.height;

      // Calculate the bounds of the visible area
      const startX =
        Math.floor(-this.view.x / this.view.scale.x / this.gridSize) *
        this.gridSize;
      const startY =
        Math.floor(-this.view.y / this.view.scale.y / this.gridSize) *
        this.gridSize;
      const endX =
        Math.ceil(
          (width / this.view.scale.x + -this.view.x / this.view.scale.x) /
            this.gridSize
        ) * this.gridSize;
      const endY =
        Math.ceil(
          (height / this.view.scale.y + -this.view.y / this.view.scale.y) /
            this.gridSize
        ) * this.gridSize;

      // Draw vertical lines
      for (let x = startX; x < endX; x += this.gridSize) {
        graphics.moveTo(x, startY);
        graphics.lineTo(x, endY);
      }

      // Draw horizontal lines
      for (let y = startY; y < endY; y += this.gridSize) {
        graphics.moveTo(startX, y);
        graphics.lineTo(endX, y);
      }
    }
  }

  onDragStart(event: MouseEvent) {
    if (
      Model.getInstance().dragTargetPanel == null &&
      Model.getInstance().dragTarget == null
    ) {
      this.dragging = true;
      this.dragStart.set(event.clientX, event.clientY);
      this.viewStart.set(this.view!.x, this.view!.y);
    } else {
      this.dragging = false;
    }
  }

  onDragMove(event: MouseEvent) {
    if (this.dragging) {
      if (
        Model.getInstance().dragTargetPanel == null &&
        Model.getInstance().dragTarget == null
      ) {
        const newPosition = new PIXI.Point(event.clientX, event.clientY);
        this.view!.x = this.viewStart.x + (newPosition.x - this.dragStart.x);
        this.view!.y = this.viewStart.y + (newPosition.y - this.dragStart.y);
        this.drawGrid();
      } else {
        this.dragging = false;
      }
    }
  }

  onDragEnd(event: MouseEvent) {
    this.dragging = false;
  }

  //override
  public update() {}

  zoom(event: WheelEvent) {
    const zoomFactor = 1.05;
    let model = Model.getInstance();
    const mouseX = model.mouseX;
    const mouseY = model.mouseY;
    let assetsHolder = this.view;

    if (assetsHolder) {
      // Get the scale factor
      let scale = event.deltaY < 0 ? zoomFactor : 1 / zoomFactor;

      // Prevent scaling below original size
      if (assetsHolder.scale.x * scale < 0.8 || assetsHolder.scale.x * scale > 2) {
        return;
      }

      // Calculate the world position of the mouse before scaling
      const worldPosBefore = new PIXI.Point(
        (mouseX - assetsHolder.x) / assetsHolder.scale.x,
        (mouseY - assetsHolder.y) / assetsHolder.scale.y
      );

      // Apply scaling
      assetsHolder.scale.x *= scale;
      assetsHolder.scale.y *= scale;

      // Calculate the new world position of the mouse after scaling
      const worldPosAfter = new PIXI.Point(
        (mouseX - assetsHolder.x) / assetsHolder.scale.x,
        (mouseY - assetsHolder.y) / assetsHolder.scale.y
      );

      // Adjust the container position to keep the mouse position consistent
      assetsHolder.x +=
        (worldPosAfter.x - worldPosBefore.x) * assetsHolder.scale.x;
      assetsHolder.y +=
        (worldPosAfter.y - worldPosBefore.y) * assetsHolder.scale.y;
      this.drawGrid();
      if(this.stageScalingTXT)
      {
        this.stageScalingTXT.text = 'Scaling ' + this.view.scale.x;
      }
      
    }
  }
}
