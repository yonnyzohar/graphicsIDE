import { Input } from "@pixi/ui";
import * as PIXI from "pixi.js";
import { TextStyle } from "pixi.js";
import { Model } from "../Model";
import { Panel } from "./Panel";

export class PropertiesPanel extends Panel{

    private inputTextStyle: TextStyle = new TextStyle({
        fontFamily: ['Helvetica', 'Arial', 'sans-serif'],
        fontSize: 12,
    });
    private instanceNameField: Input | undefined;
    private wField:Input | undefined;
    private hField:Input | undefined;
    private xField:Input | undefined;
    private yField:Input | undefined;
    private rotField:Input | undefined;
    private sXField:Input | undefined;
    private sYField:Input | undefined;
    private alphaField:Input | undefined;
    

    constructor() {
        super();
        let _x = 10;
        let _y = 10;
        let offset = 35;
        let textName = new PIXI.Text('name:', Model.style);
        textName.position.set(_x, _y);
        this.contents.addChild(textName);

        this.instanceNameField = new Input({
            textStyle : this.inputTextStyle,
            value: '',
            bg: new PIXI.Graphics().beginFill(0xffffff).drawRect(0, 0, 100, 14).endFill()
        });
        this.initBtn(this.instanceNameField, _x+offset, _y);
        
        ///////////////////

        _y+=20;
        let textW = new PIXI.Text('w:', Model.style);
        textW.position.set(_x, _y);
        this.contents.addChild(textW);
        this.wField = new Input({
            textStyle : this.inputTextStyle,
            value: '',
            bg: new PIXI.Graphics().beginFill(0xffffff).drawRect(0, 0, 100, 14).endFill()
        });
        this.initBtn(this.wField, _x+offset, _y);
        ///////

        _y+=20;
        let textH = new PIXI.Text('h:', Model.style);
        textH.position.set(_x, _y);
        this.contents.addChild(textH);
        this.hField = new Input({
            textStyle : this.inputTextStyle,
            value: '',
            bg: new PIXI.Graphics().beginFill(0xffffff).drawRect(0, 0, 100, 14).endFill()
        });
        this.initBtn(this.hField, _x+offset, _y);
        //////

        _y+=20;
        let textX = new PIXI.Text('x:', Model.style);
        textX.position.set(_x, _y);
        this.contents.addChild(textX);
        this.xField = new Input({
            textStyle : this.inputTextStyle,
            value: '',
            bg: new PIXI.Graphics().beginFill(0xffffff).drawRect(0, 0, 100, 14).endFill()
        });
        this.initBtn(this.xField, _x+offset, _y);

        _y+=20;
        let textY = new PIXI.Text('y:', Model.style);
        textY.position.set(_x, _y);
        this.contents.addChild(textY);
        this.yField = new Input({
            textStyle : this.inputTextStyle,
            value: '',
            bg: new PIXI.Graphics().beginFill(0xffffff).drawRect(0, 0, 100, 14).endFill()
        });
        this.initBtn(this.yField, _x+offset, _y);

        _y+=20;
        let textRot = new PIXI.Text('rot:', Model.style);
        textRot.position.set(_x, _y);
        this.contents.addChild(textRot);
        this.rotField = new Input({
            textStyle : this.inputTextStyle,
            value: '',
            bg: new PIXI.Graphics().beginFill(0xffffff).drawRect(0, 0, 100, 14).endFill()
        });
        this.initBtn(this.rotField, _x+offset, _y);


        _y+=20;
        let textScaleX = new PIXI.Text('sX:', Model.style);
        textScaleX.position.set(_x, _y);
        this.contents.addChild(textScaleX);
        this.sXField = new Input({
            textStyle : this.inputTextStyle,
            value: '',
            bg: new PIXI.Graphics().beginFill(0xffffff).drawRect(0, 0, 100, 14).endFill()
        });
        this.initBtn(this.sXField, _x+offset, _y);

        _y+=20;
        let textScaleY = new PIXI.Text('sY:', Model.style);
        textScaleY.position.set(_x, _y);
        this.contents.addChild(textScaleY);
        this.sYField = new Input({
            textStyle : this.inputTextStyle,
            value: '',
            bg: new PIXI.Graphics().beginFill(0xffffff).drawRect(0, 0, 100, 14).endFill()
        });
        this.initBtn(this.sYField, _x+offset, _y);

        _y+=20;
        let alphaVal = new PIXI.Text('alpha:', Model.style);
        alphaVal.position.set(_x, _y);
        this.contents.addChild(alphaVal);
        this.alphaField = new Input({
            textStyle : this.inputTextStyle,
            value: '',
            bg: new PIXI.Graphics().beginFill(0xffffff).drawRect(0, 0, 100, 14).endFill()
        });
        this.initBtn(this.alphaField, _x+offset, _y);
        this.addTopBar("Properties");
        this.setBGSize(150, _y + 50);
        

        let model:Model = Model.getInstance();
        
        this.view.x = model.renderer!.width - this.view.width - 300;
        this.view.y = 100;
        /*
        this.instanceNameField.on('input', (value: string) => {
            //console.log('Input value:', value);
        });
        */
    }
    initBtn(input:PIXI.Container, _x: number, _y: number) {
        input.position.set(_x, _y);
        this.contents.addChild(input);
        input.on('focus', () => {
            Model.getInstance().inputFocus = true;
            
        });
        input.on('pointerdown', () => {
            Model.getInstance().inputFocus = true;
        });
        input.on('blur', () => {
            Model.getInstance().inputFocus = false;
            console.log('Input field blurred');
        });
    }

    public setX(value:string){
        if(this.xField){
            this.xField.value = value;
        }
    }
    public setY(value:string){
        if(this.yField){
            this.yField.value = value;
        }
    }
    public setW(value:string){
        if(this.wField){
            this.wField.value = value;
        }
    }
    public setH(value:string){
        if(this.hField){
            this.hField.value = value;
        }
    }
    public setRot(value:string){
        if(this.rotField){
            this.rotField.value = value;
        }
    }
    public setName(value:string){
        if(this.instanceNameField){
            this.instanceNameField.value = value;
        }
    }

    public setScaleX(value:string){
        if(this.sXField){
            this.sXField.value = value;
        }
    }
    public setScaleY(value:string){
        if(this.sYField){
            this.sYField.value = value;
        }
    }
    public setAlpha(value:string){
        if(this.alphaField){
            this.alphaField.value = value;
        }
    }

    public render()
    {
        if (Model.keysPressed[Model.KEYS.ENTER]) 
        {
            let sprite = Model.getInstance().dragTarget;
            if(sprite)
            {
                sprite.name = this.instanceNameField?.value || '';
                sprite.x = parseInt(this.xField?.value || '0');
                sprite.y = parseInt(this.yField?.value || '0');
                console.log('rotation:', this.rotField?.value);
                sprite.rotation = parseInt(this.rotField?.value || '0');
                sprite.width = parseInt(this.wField?.value || '0');
                sprite.height = parseInt(this.hField?.value || '0');
                sprite.scale.x = parseFloat(this.sXField?.value || '1');
                sprite.scale.y = parseFloat(this.sYField?.value || '1');
                sprite.alpha = parseFloat(this.alphaField?.value || '1');
                this.dispatchEvent("PROPERTIES_CHANGED");
            }
        }
    }
}

