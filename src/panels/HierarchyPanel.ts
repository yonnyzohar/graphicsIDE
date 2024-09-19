import { Button } from "@pixi/ui";
import * as PIXI from 'pixi.js';
import { BaseController } from "../entities/BaseController";
import { Model } from "../Model";
import { Panel } from "./Panel";

export class HierarchyPanel extends Panel {

    static lastClickTime = 0;
    static doubleClickThreshold = 300;
    private background: PIXI.Graphics = new PIXI.Graphics();
    private container: PIXI.Container = new PIXI.Container();
    private newBtn: Button | undefined;
    //private exportBTN: Button | undefined;

    posY: number = 0;
    constructor() {
        super();
        let model = Model.getInstance();
        this.addTopBar("Hierarchy");

        this.setBGSize(150, 400);
        
        this.contents.addChild(this.container);
        
        

        this.view.position.set(500, 150);
        this.fixOutOfBounds();

        this.newBtn = this.createButton('+ Container');

        this.newBtn.onPress.connect(() => {
            console.log("CREATE_CONTAINER_PRESSED");
            this.dispatchEvent("CREATE_CONTAINER_PRESSED");
        });
        this.newBtn.view.x = this.view.width / 2 - this.newBtn.view.width / 2;
        this.newBtn.view.y = this.view.height - this.newBtn.view.height - 5;

        this.contents.addChild(this.newBtn.view);
        this.setBGSize(this.bgW, this.bgH);

    }

    protected setBGSize(_width:number, _height:number){
        super.setBGSize(_width, _height);
        if(this.newBtn)
        {
            this.newBtn.view.y = _height - this.newBtn.view.height - 5;
            this.newBtn.view.x = _width / 2 - this.newBtn.view.width / 2;
        }
    }

    createButton(name:string): Button {
        let btn = new Button(
            new PIXI.Graphics()
                .beginFill(0xFFFFFF)
                .drawRoundedRect(0, 0, 85, 25, 5)
        );
        const label = new PIXI.Text(name, {
            fontFamily: 'Arial',
            fontSize: 15,
            fill: 0x000000,
            align: 'center'
        });

        // Center the label on the button
        label.anchor.set(0.5);
        label.x = btn.view.width / 2;
        label.y = btn.view.height / 2;

        // Add the label to the button's graphics
        btn.view.addChild(label);
        return btn;
    }

    public display(_selectedAsset: PIXI.Container<PIXI.DisplayObject> | null = null) {
        let model = Model.getInstance();

        while (this.container.children.length > 0) {
            let asset = this.container.children[0];
            this.container.removeChild(asset);
        }
        /**/
        this.posY = 0;
        let assetsHolder: PIXI.Container = model.assetsHolder!;
        this.drillDown(assetsHolder, 10, _selectedAsset);
    }

    drillDown(parent: PIXI.Container, offestX: number,_selectedAsset: PIXI.Container<PIXI.DisplayObject> | null = null) {
        let model = Model.getInstance();

        for (let i = 0; i < parent.children.length; i++) {
            let asset: PIXI.Container = parent.children[i] as PIXI.Container;
            if(asset instanceof PIXI.Graphics)
            {
                continue;
            }
            let text = new PIXI.Text(asset.name || '', { fontFamily: 'Arial', fontSize: 12, fill: 0xff1010, align: 'center' });
            text.position.set(offestX, 10 + this.posY * 20);
            this.posY++;
            this.container.addChild(text);
            text.eventMode = 'dynamic';
            text.on('pointerdown', (e: any) => {
                console.log("pointerdown");
                let target = e.target;
                const currentTime = Date.now();
                if (currentTime - HierarchyPanel.lastClickTime < HierarchyPanel.doubleClickThreshold) {
                    if (!(asset instanceof PIXI.Sprite)) {
                        console.log('Sprite was double-clicked!');

                        let a:PIXI.Container[] = [];
                        let asset1 = asset;
                        while(asset1.parent)
                        {
                            a.push(asset1);
                            asset1 = asset1.parent;
                        }
                        

                        model.currentHierarchy = a.reverse();
                        this.dispatchEvent("DRILL_DOWN");
                    }
                } else {
                    console.log("going to set bg",asset,target,model.assetsMap);
                    this.setBG(asset,target, true);

                }
                HierarchyPanel.lastClickTime = currentTime;

            });
            if(_selectedAsset === asset)
            {
                this.setBG(asset,text, false);
            }
            if (asset.children.length > 0) {
                this.drillDown(asset, offestX + 10,_selectedAsset);
            }
        }
    }
    setBG(asset: PIXI.Container<PIXI.DisplayObject>, target:PIXI.Text, notify:boolean) {
        let model = Model.getInstance();
        this.background.clear();
        this.background.beginFill(0x555555); // Dark grey color
        this.background.drawRect(0, 0, target.width + 10, target.height); // Add padding to the background
        this.background.endFill();
        this.container.addChildAt(this.background, 0);
        this.background.x = target.x;
        this.background.y = target.y;
        if (Model ===  undefined || typeof Model === 'undefined' || !model.assetsMap) {
            console.error("Model is undefined or assetsMap is not available");
            return;
        }
        this.dispatchEvent("SET_SELECTED_ASSET", asset);
        if(notify)
        {
            let sc: BaseController = model.assetsMap.get(asset)!;
            if(!sc)
            {
                console.log("Controller not found for asset");
                return;
            }
            sc.setObj(asset, false);
        }
        
    }
}