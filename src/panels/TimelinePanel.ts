import * as PIXI from "pixi.js";
import { BaseController } from "../entities/BaseController";
import { Model } from "../Model";
import { AssetProps, TimeLineAsset } from "../TimelineAsset";
import { Panel } from "./Panel";
import { Timeline } from "./Timeline";

export class TimelinePanel extends Panel{
    
    
    timelines:Timeline[] = [];
    numbersHolder:PIXI.Container = new PIXI.Container();
    placehead:PIXI.Graphics = new PIXI.Graphics();
    globalPlayhead:PIXI.Graphics = new PIXI.Graphics();
    rowLine:PIXI.Graphics = new PIXI.Graphics();
    headMoving:boolean = false;


    constructor() {
        super();
        this.addTopBar("Timeline");
        this.setBGSize(500, 200);
        this.contents.addChild(this.numbersHolder);
        let model = Model.getInstance();

        for(let i = 0; i < 100; i+=5)
        {
            let txtNum = new PIXI.Text(i, Model.style);
            this.numbersHolder.addChild(txtNum);
            txtNum.x = (i * model.frameWidth);
        }

        this.numbersHolder.visible = false;

        this.view.x = 100;
        this.view.y = 100;
    }

    onAssetSelected(ent: PIXI.Container<PIXI.DisplayObject>) {
        for(let i = 0; i < this.timelines.length; i++)
        {
            let timeline:Timeline = this.timelines[i];
            if(timeline.sc?.view == ent)
            {
                this.placehead.y = timeline.view.y;
                break;
            }
        }
    }
  

    public render():void
    {
        while(this.timelines.length > 0)
        {
            //this.timelines[0].removeEventListener("click", this.onTimeLineClick.bind(this));
            this.timelines[0].view.removeFromParent();
            this.timelines.shift();
        }
        let x = 10;
        let y = 20;
        this.placehead.removeFromParent();
        this.globalPlayhead.removeFromParent();

        this.placehead.off('pointerdown', this.onHeadPointerDown.bind(this));
        this.placehead.off('pointerup', this.onHeadDragEnd.bind(this));
        this.placehead.off('pointerupoutside', this.onHeadDragEnd.bind(this));

        let model = Model.getInstance();
        this.numbersHolder.visible = false;
        let exist = false;

        let lastEnt: PIXI.Container = model.currentHierarchy[model.currentHierarchy.length - 1];
        let n = 0;
        for(let j = 0; j < lastEnt.children.length; j++)
        {
            let child:PIXI.DisplayObject = lastEnt.children[j];
            if (child instanceof PIXI.Graphics) 
            {
                continue;
            }
            let c1:PIXI.Container = child as PIXI.Container;
            let sc: BaseController | null = model.assetsMap.get(c1!) ?? null;
            
            let timeline:Timeline = new Timeline(c1.name || "layer_" + n,sc);
            //timeline.addEventListener("click", this.onTimeLineClick.bind(this));
            this.contents.addChild(timeline.view);
            timeline.view.y = (timeline.view.height * n) + y;
            timeline.view.x = x;
            this.timelines.push(timeline);
            exist = true;
            n++;
            
        }

        if(exist)
        {
            this.numbersHolder.visible = true;
            let startX = this.timelines[0].view.x + this.timelines[0].timelineHolder.x;
            this.numbersHolder.x = startX;
            this.numbersHolder.y = y-model.frameWidth;

            this.contents.addChild(this.placehead);
            this.placehead.clear();
            this.placehead.beginFill(0x00000FF);
            this.placehead.drawRect(0, 0, model.frameWidth, model.frameWidth); // x, y, width, height
            this.placehead.endFill();
            this.placehead.alpha = 0.5;
            this.placehead.x = startX;
            this.placehead.y = y;
            this.placehead.interactive = true;
            this.placehead.on('pointerdown', this.onHeadPointerDown.bind(this));
            this.placehead.on('pointerup', this.onHeadDragEnd.bind(this));
            this.placehead.on('pointerupoutside', this.onHeadDragEnd.bind(this));

            this.contents.addChild(this.globalPlayhead);
            this.globalPlayhead.clear();
            this.globalPlayhead.beginFill(0x00000FF);
            this.globalPlayhead.drawRect(0, 0, model.frameWidth, n * model.frameWidth); // x, y, width, height
            this.globalPlayhead.endFill();
            this.globalPlayhead.alpha = 0.5;
            this.globalPlayhead.x = startX;
            this.globalPlayhead.y = y;
        }

    }

    private onHeadPointerDown(e: any): void {
        let model = Model.getInstance();
        model.dragTargetPanel = this.view;
        this.headMoving = true;
    }

    public update() {
        super.update();
        let model = Model.getInstance();
        if(this.headMoving)
        {
            
            let startX = this.timelines[0].view.x + this.timelines[0].timelineHolder.x;
            let startY = this.timelines[0].view.y + this.timelines[0].timelineHolder.y;
            
            let calculatedX = model.mouseX - this.view.x - this.contents.x;
            let calculatedY = model.mouseY - this.view.y - this.contents.y;
            
            if (calculatedX < startX) {
                calculatedX = startX;
            }
            if (calculatedY < startY) {
                calculatedY = startY;
            }

            // Calculate the offset from startX
            let offsetFromStartX = calculatedX - startX;
            let offsetFromStartY = calculatedY - startY;

            // Snap the offset to the nearest 12th pixel and add startX
            let numX = Math.floor(offsetFromStartX / model.frameWidth);
            this.placehead.x = startX + (numX * model.frameWidth);
            this.globalPlayhead.x = startX + (numX * model.frameWidth);

            let numY = Math.floor(offsetFromStartY / model.frameWidth);
            let posY = startY + (numY * model.frameWidth);
            if(posY > this.timelines[this.timelines.length-1].view.y )
            {
                posY = this.timelines[this.timelines.length-1].view.y;
            }
            this.placehead.y = posY;


            model.currentFrame = numX;
            model.currentLayer = numY;
            this.frameChange();
        }

        
    }

    


    private onHeadDragEnd(e: any): void {
        let model = Model.getInstance();
        this.headMoving = false;
        model.dragTargetPanel = null;
    }



    private frameChange():void
    {
        let model = Model.getInstance();
        console.log("frameChange", model.currentFrame);

        let lastEnt: PIXI.Container = model.currentHierarchy[model.currentHierarchy.length - 1];
        let n = 0;
        for(let j = 0; j < lastEnt.children.length; j++)
        {
            let child:PIXI.DisplayObject = lastEnt.children[j];
            if (child instanceof PIXI.Graphics) 
            {
                continue;
            }
            let c1:PIXI.Container = child as PIXI.Container;
            let sc: BaseController | null = model.assetsMap.get(c1!) ?? null;
            if(sc)
            {
                console.log("sc!", sc.view?.name, sc.uniqueId);
                let ts:TimeLineAsset = model.timeLineAssetsMap.get(sc.uniqueId) as TimeLineAsset;
                if(ts)
                {
                    let frame:PIXI.Graphics = this.timelines[n].timelineHolder.getChildByName("frame_" + model.currentFrame) as PIXI.Graphics;
                    if(frame.tint !== 0x00ff00)
                    {
                        sc.hide();
                        continue;
                    }
                    for(let i:number = model.currentFrame; i >= 0; i--)
                    {
                        let props:AssetProps | undefined = ts.frames.get(i);
                        if(props)
                        {
                            c1!.x = props.x;
                            c1!.y = props.y;
                            c1!.rotation = props.rotation;
                            c1!.scale.x = props.scaleX;
                            c1!.scale.y = props.scaleY;
                            c1!.alpha = props.alpha;
                            c1!.pivot.x = props.pivotX;
                            c1!.pivot.y = props.pivotY;
                            c1!.visible = true;
                            break;
                        }
                    }
                }
                n++;
            }
        }
    }
}