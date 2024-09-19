import * as PIXI from 'pixi.js';
import { BaseController } from "./entities/BaseController";
import { Model } from "./Model";

export class AssetProps{
    public x: number = 0;
    public y: number = 0;
    public rotation: number = 0;
    public scaleX: number = 1;
    public scaleY: number = 1;
    public alpha: number = 1;
    public pivotX: number = 0;
    public pivotY: number = 0;
    public endFrame: number = 0;
}

export class TimeLineAsset{
    public controller:BaseController | undefined;
    public frames:Map<number, AssetProps> = new Map<number, AssetProps>();
    constructor(_controller:BaseController){
        this.controller = _controller;
        let model = Model.getInstance();
        let view:PIXI.Container | undefined = _controller.view;
        if(view)
        {
            this.setKeyFrame(model.currentFrame,view?.x, view?.y, view?.rotation, view?.scale.x, view?.scale.y, view?.alpha, view?.pivot.x, view?.pivot.y);
        }
    }

    public getFrame(currentFrame:number):AssetProps | undefined{
        return this.frames.get(currentFrame);
    }
  

    public setKeyFrame(_frame:number, x:number, 
        y:number, 
        rotation:number, 
        scaleX:number, 
        scaleY:number, 
        alpha:number, 
        pivotX:number, 
        pivotY:number)
    {
        let _assetProps:AssetProps = new AssetProps();
        _assetProps.x = x;
        _assetProps.y = y;
        _assetProps.rotation = rotation;
        _assetProps.scaleX = scaleX;
        _assetProps.scaleY = scaleY;
        _assetProps.alpha = alpha;
        _assetProps.pivotX = pivotX;
        _assetProps.pivotY = pivotY;
        _assetProps.endFrame = _frame
        this.frames.set(_frame, _assetProps);
    }

    public setFrameProps(
        _frame:number, 
        x:number, 
        y:number, 
        rotation:number, 
        scaleX:number, 
        scaleY:number, 
        alpha:number, 
        pivotX:number, 
        pivotY:number
    ){

        for(let i:number = _frame; i >= 0; i--)
        {
            let _assetProps:AssetProps | undefined = this.frames.get(i);
            console.log("searching for key frame",i,_assetProps);
            if(_assetProps)
            {
                _assetProps.x = x;
                _assetProps.y = y;
                _assetProps.rotation = rotation;
                _assetProps.scaleX = scaleX;
                _assetProps.scaleY = scaleY;
                _assetProps.alpha = alpha;
                _assetProps.pivotX = pivotX;
                _assetProps.pivotY = pivotY;
                _assetProps.endFrame = _frame;
                console.log("found key frame",i);
                break;
                //this.frames.set(_frame, _assetProps);
            }
        }        
    }
}