import * as PIXI from "pixi.js";
import { EventDispatcher } from "./../EventDispatcher";
import { Model } from "./../Model";

export class PathPanel extends EventDispatcher {
  public view: PIXI.Container = new PIXI.Container();
  private arr: Array<PIXI.Text> = [];
  static lastClickTime = 0;
  static doubleClickThreshold = 300;
  private bg:PIXI.Graphics = new PIXI.Graphics();

  constructor() {
    super();
    this.render();
    this.resize();
    Model.getInstance().stage!.addChild(this.view);
    this.view.addChildAt(this.bg, 0);
  }

  public resize()
  {
    this.bg.clear();
    this.bg.beginFill(0x2f2f2f);
    this.bg.drawRect(0, 0, Model.getInstance().view!.width, 30); // x, y, width, height
    this.bg.endFill();
  }
  public render() {
    let model = Model.getInstance();
    for (let i = 0; i < this.arr.length; i++) {
      this.view.removeChild(this.arr[i]);
    }
    this.arr = [];
    let _x = 5;
    for (let i = 0; i < model.currentHierarchy.length; i++) {
      let label = new PIXI.Text(
        model.currentHierarchy[i].name || "",
        {
          fontFamily: "Arial",
          fontSize: 14,
          fill: "#ffffff",
          align: "center",
        }
      );

      this.view.addChild(label);
      label.x = _x;
      label.y = 5;

      _x += label.width + 5;

      this.arr.push(label);

      label.eventMode = "dynamic";
      label.on("pointerdown", (e: any) => {
        console.log("pointerdown");
        let target = e.target;

        const currentTime = Date.now();
        if (currentTime - PathPanel.lastClickTime < PathPanel.doubleClickThreshold) 
        {
          console.log("Sprite was double-clicked!");

          let index: number = this.arr.indexOf(target);
          while (model.currentHierarchy.length > index + 1) {
            model.currentHierarchy.pop();
          }
          this.render();
          this.dispatchEvent("DRILL_DOWN");
        } 
        else {
          let asset = model.currentHierarchy[this.arr.indexOf(target)];
          if (asset) {
            this.dispatchEvent("ASSET_SELECTED", asset);
          } else {
            console.error("Asset not found");
          }
        }

        PathPanel.lastClickTime = currentTime;
      });
    }
  }
}
