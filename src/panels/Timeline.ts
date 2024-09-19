import * as PIXI from "pixi.js";

// Rest of the code...
import { BaseController } from "../entities/BaseController";
import { EventDispatcher } from "../EventDispatcher";
import { Model } from "../Model";
import { AssetProps, TimeLineAsset } from "../TimelineAsset";

export class Timeline extends EventDispatcher{
    
    public view: PIXI.Container = new PIXI.Container();
    public timelineHolder: PIXI.Container = new PIXI.Container();
    public sc:BaseController | null = null;
    circles:PIXI.Graphics[] = [];
    

    constructor(entName:string, sc:BaseController | null) {
        super();

        let textName = new PIXI.Text(entName, Model.style);
        this.view.addChild(textName);
        this.sc = sc;

        this.view.addChild(this.timelineHolder);
        this.timelineHolder.x = 60;
        let model = Model.getInstance();
        let boxW = model.frameWidth;

        for(let i = 0; i < 100; i++)
        {
            let frame = new PIXI.Graphics();
            frame.lineStyle(1, 0x000000);
            frame.beginFill(0xffffff);
            frame.drawRect(0, 0, boxW, boxW); // x, y, width, height
            frame.endFill();
            frame.name = "frame_" + i;
            frame.x = i * boxW;
            this.timelineHolder.addChild(frame);
            //frame.interactive = true;
            //frame.on("click", this.onClick.bind(this));
        }
        this.drawAssetOverlay();
        
    }

    drawAssetOverlay()
    {
        let model = Model.getInstance();
        let sc = this.sc;
        while(this.circles.length > 0)
        {
            this.circles[0].removeFromParent();
            this.circles.shift();
        }

        if(sc)
        {
            let ts:TimeLineAsset = model.timeLineAssetsMap.get(sc.uniqueId) as TimeLineAsset;
            if(ts)
            {
    
                for(let [key, assetProps] of ts.frames)
                {
                    for(let j:number = key; j <= assetProps.endFrame; j++)
                    {
                        let frame = this.timelineHolder.getChildByName("frame_" + j) as PIXI.Graphics;
                        if(frame)
                        {
                            frame.tint = 0x00ff00;
    
                            if(j == key)
                            {
                                this.createCircle(frame, model.frameWidth);
                            }
                        }
                    }
                }
            }
            if(sc.view)
            {
                sc.view.visible = true;
            }
        }
    }

    createCircle(frame: PIXI.Graphics, boxW: number) {
        const circle = new PIXI.Graphics();
        circle.beginFill(0xFF0000); // Red color in hex
        circle.drawCircle(frame.x + boxW/2, frame.y + boxW/2, boxW * 0.2);
        circle.endFill();
        this.timelineHolder.addChild(circle);
        this.circles.push(circle);
    }

    private onClick(e: any): void {
        console.log(e.target.name, "click");
        this.dispatchEvent("click", e);
    }

    addFrames() {
        let model = Model.getInstance();
        let sc = this.sc;
        if(sc)
        {
            console.log("addFrames", model.currentFrame);
            let ts:TimeLineAsset = model.timeLineAssetsMap.get(sc.uniqueId) as TimeLineAsset;
            for(let i = model.currentFrame; i >= 0; i--)
            {
                let assetProps:AssetProps | undefined = ts.getFrame(i);
                if(assetProps)
                {
                    assetProps.endFrame = model.currentFrame;
                }
            }
        }
        this.drawAssetOverlay();
        
    }

    addKeyFrame(){
        let model = Model.getInstance();
        let assetProps:AssetProps | undefined = undefined;
        let sc = this.sc;
        if(sc)
        {
            console.log("addFrames", model.currentFrame);
            let ts:TimeLineAsset = model.timeLineAssetsMap.get(sc.uniqueId) as TimeLineAsset;
            for(let i = model.currentFrame; i >= 0; i--)
            {
                assetProps = ts.getFrame(i);
                if(assetProps)
                {
                    break;
                }
            }

            if(assetProps)
            {
                assetProps.endFrame = model.currentFrame-1;
                ts.setKeyFrame(model.currentFrame, assetProps.x, assetProps.y, assetProps.rotation, assetProps.scaleX, assetProps.scaleY, assetProps.alpha, assetProps.pivotX, assetProps.pivotY);
                this.drawAssetOverlay();
            }
           
        }
    }

    

    
}