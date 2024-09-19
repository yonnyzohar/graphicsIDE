import * as PIXI from 'pixi.js';
import { BaseController } from "./entities/BaseController";
import { Panel } from "./panels/Panel";
import { TimeLineAsset } from "./TimelineAsset";

type KeysPressed = {
    [key: string]: boolean;
};

type KeysMap = {
    [key: string]: string;
}



export class Model{
    
    view:HTMLCanvasElement | undefined;
    mouseX = 0;
    mouseY = 0;

    public static style:PIXI.TextStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 12,
        fill: '#ffffff',
        wordWrap: true,
        lineJoin: 'round',
    });


    dragTarget: PIXI.Container | null = null;
    stage:PIXI.Container | undefined;
    currentFrame:number = 0;
    currentLayer: number = 0;
    frameWidth:number = 20;

    
    assetsHolder:PIXI.Container | undefined;
    linesHolder:PIXI.Graphics | undefined;
    isZKeyPressed = false;
    
    assetsMap = new Map<PIXI.Container, BaseController>();
    panelsMap = new Map<PIXI.Container, Panel>();
    timeLineAssetsMap = new Map<string, TimeLineAsset>();

    currentHierarchy:PIXI.Container[] = [];

    static KEYS:KeysMap = {
        ROTATE:"z",
        MOVE_AXIS:"x",
        RESIZE:"c",
        LEFT:"ArrowLeft",
        RIGHT:"ArrowRight",
        UP:"ArrowUp",
        DOWN:"ArrowDown",
        DELETE:"Backspace",
        ENTER:"Enter",
        SHIFT:"Shift",
        F5:"F5",
        F6:"F6"
    }

    static keysPressed:KeysPressed = {
        "z": false,
        "x": false,
        "c":false,
        "ArrowUp": false,
        "ArrowDown": false,
        "ArrowLeft": false,
        "ArrowRight": false,
        "Backspace" : false,
        "Enter": false,
        "Shift": false,
        "F5": false,
        "F6": false
    };
    
    
    draggingPanel: boolean = false;
    dragTargetPanel: any;
    static INSTNACE_COUNT: number = -1;
    inputFocus: boolean = false;
    renderer: PIXI.IRenderer<PIXI.ICanvas> | undefined;
    

    static getInstanceCount() {
        Model.INSTNACE_COUNT++;
        return Model.INSTNACE_COUNT;
    }

    static setInstanceCount(name:string){
        if(name)
        {
            if(name.indexOf("instance_") !== -1){
                let num = parseInt(name.split("_")[1]);
                if(num > Model.INSTNACE_COUNT)
                {
                    Model.INSTNACE_COUNT = num;
                }
            }
        }
        
        
    }

    private static instance: Model;

    private constructor() {
        console.log("Model instance created");
    }

    public static getInstance(): Model {
        if (!Model.instance) {
            Model.instance = new Model();
            (window as any).Model = Model.instance;
        }
        return Model.instance;
    }

    public static initialize() {
        if (!Model.instance) {
            Model.instance = new Model();
            (window as any).Model = Model.instance;
        }
    }
}