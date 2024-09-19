import { DropShadowFilter } from "@pixi/filter-drop-shadow";
import * as PIXI from 'pixi.js';
import { EventDispatcher } from "../EventDispatcher";
import { Model } from "../Model";

export class Panel  extends EventDispatcher{


    public view:PIXI.Container = new PIXI.Container();

    protected contents:PIXI.Container = new PIXI.Container();
    dragOffsetX: number = 0;
    dragOffsetY: number = 0;
    bg = new PIXI.Graphics();
    topBar:PIXI.Container = new PIXI.Container();
    topBarbG = new PIXI.Graphics();
    mask = new PIXI.Graphics();
    horizontalScrollbar = new PIXI.Graphics();
    verticalScrollbar = new PIXI.Graphics();

    ////
    resizeThreshold = 10; // Distance from the edge where resizing is possible
    isResizing = false;
    resizeDirection:string | null = null;
    initialMousePosition: PIXI.IPointData | null = null;
    initialSquareSize:any = null;
    bgW:number = 100;
    bgH:number = 100;
    origWidth:number = 0;
    origHeight:number = 0;
    vsbh:number = 10;
    scrollingH:boolean = false;
    scrollingV:boolean = false;
    vsbw:number = 50;

    private dropShadowFilter = new DropShadowFilter({
        color: 0x000000, // Shadow color
        alpha: 0.5,      // Shadow opacity
        blur: 5,         // Shadow blur
        distance: 10,    // Distance of the shadow from the object
        rotation: 45,    // Angle of the shadow
        resolution: 2,   // Resolution of the filter
    });


    constructor() {
        super();
        console.log("Panel constructor");
        this.view.addChild(this.contents);

        this.view.filters = [this.dropShadowFilter];

        
        
        this.bg.beginFill(0x2F2F2F);
        this.bg.drawRect(0, 0, this.bgW, this.bgH); // x, y, width, height
        this.bg.endFill();
        this.bg.interactive = true;
        this.bg.cursor = 'default';
        this.view.addChildAt(this.bg, 0);

        this.bg.on('mousemove', (event) => {
            const mousePosition = event.data.getLocalPosition(this.bg);
            //console.log("mousePosition", mousePosition);
            const isNearRightEdge = mousePosition.x > (this.bgW - this.resizeThreshold);
            const isNearBottomEdge = mousePosition.y > (this.bgH - this.resizeThreshold);
            //console.log("isNearRightEdge", isNearRightEdge);
        
            if (isNearRightEdge) {
                this.bg.cursor = 'ew-resize';
                this.resizeDirection = 'right';
            } else if (isNearBottomEdge) {
                this.bg.cursor = 'ns-resize';
                this.resizeDirection = 'bottom';
            } else {
                this.bg.cursor = 'default';
                this.resizeDirection = null;
            }
        });

        this.bg.on('mousedown', (event) => {

            model.stage!.addChild(this.view);
            if (this.resizeDirection) {
                this.isResizing = true;
                let model = Model.getInstance();
                this.origWidth = this.bgW;
                this.origHeight = this.bgH;
                this.initialMousePosition = {x:model.mouseX, y : model.mouseY}
                //console.log("this.initialMousePosition", this.initialMousePosition);
                model.dragTargetPanel = this.view;

            }
        });

        this.bg.on('pointerup', this.onBGup.bind(this));
        this.bg.on('pointerupoutside', this.onBGup.bind(this));


        this.view.addChild(this.mask);
        
        this.setMask();
        let model = Model.getInstance();
        model.panelsMap.set(this.view, this);

        this.createScrollBars();
        this.setBGSize(this.bgW, this.bgH);
        
    }

    createScrollBars()
    {
        //horizontal scrollbar
        this.horizontalScrollbar.beginFill(0x666666);
        this.horizontalScrollbar.drawRect(0, 0, this.vsbw, this.vsbh);
        this.horizontalScrollbar.endFill();
        this.horizontalScrollbar.y = this.bgH - this.vsbh;
        this.horizontalScrollbar.interactive = true;
        this.horizontalScrollbar.cursor = 'pointer';
        this.view.addChild(this.horizontalScrollbar);
        this.horizontalScrollbar.on('pointerdown', this.onHorizontalScrollbarDown.bind(this));
        this.horizontalScrollbar.on('pointerup', this.onHorizontalScrollbarUp.bind(this));
        this.horizontalScrollbar.on('pointerupoutside', this.onHorizontalScrollbarUp.bind(this));

        //vertical scrollbar
        this.verticalScrollbar.beginFill(0x666666);
        this.verticalScrollbar.drawRect(0, 0, this.vsbh, this.vsbw );
        this.verticalScrollbar.endFill();
        this.verticalScrollbar.x = this.mask.width - this.vsbh;
        this.verticalScrollbar.interactive = true;
        this.verticalScrollbar.cursor = 'pointer';
        this.view.addChild(this.verticalScrollbar);
        this.verticalScrollbar.on('pointerdown', this.onVerticalScrollbarDown.bind(this));
        this.verticalScrollbar.on('pointerup', this.onVerticalScrollbarUp.bind(this));
        this.verticalScrollbar.on('pointerupoutside', this.onVerticalScrollbarUp.bind(this));
    }

    onVerticalScrollbarDown(event:any) {
        this.scrollingV = true;

        let model = Model.getInstance();
        model.dragTargetPanel = this.view;
        
    }

    onVerticalScrollbarUp(event:any)
    {
        this.scrollingV = false;
        let model = Model.getInstance();
        model.dragTargetPanel = null;
    }

    onHorizontalScrollbarUp(event:any)
    {
        this.scrollingH = false;
        let model = Model.getInstance();
        model.dragTargetPanel = null;
    }

    onHorizontalScrollbarDown(event:any) {
        this.scrollingH = true;

        let model = Model.getInstance();
        model.dragTargetPanel = this.view;
        
    }

    updateVScrollbar(){
        let model = Model.getInstance();
        let posY = model.mouseY - this.view.y;
        if(posY < 0)
        {
            posY = 0;
        }
        if(posY > this.mask.height - this.vsbw)
        {
            posY = this.mask.height - this.vsbw;
        }

        const scrollPercentage = posY / (this.mask.height - this.vsbh);

        this.contents.y = -scrollPercentage * (this.contents.height - this.mask.height);
        this.verticalScrollbar.y = posY;
        if(this.verticalScrollbar.y < 0)
        {
            this.verticalScrollbar.y = 0;
        }
    }

    updateHScrollbar() {
        let model = Model.getInstance();
        let posX = model.mouseX - this.view.x;
        if(posX < 0)
        {
            posX = 0;
        }
        if(posX > this.mask.width - this.vsbw)
        {
            posX = this.mask.width - this.vsbw;
        }

        const scrollPercentage = posX / (this.mask.width - this.vsbw);

        this.contents.x = -scrollPercentage * (this.contents.width - this.mask.width);
        this.horizontalScrollbar.x = posX;
        if(this.horizontalScrollbar.x < 0)
        {
            this.horizontalScrollbar.x = 0;
        }
    }
    

    protected addTopBar(name:string){
        this.topBarbG = new PIXI.Graphics();
        this.topBarbG.beginFill(0x000000);
        this.topBarbG.drawRect(0, 0, 100, 20); // x, y, width, height
        this.topBarbG.endFill();
        this.topBar.addChildAt(this.topBarbG, 0);
        this.topBar.y = -20;
        this.view.addChild(this.topBar);
        this.topBar.name = "topBar";
        this.topBar.interactive = true;
        this.topBar.on('pointerdown', this.onDragStart.bind(this));

        let textName = new PIXI.Text(name, Model.style);
        this.topBar.addChild(textName);
    }

    protected setBGSize(_width:number, _height:number){
        this.bg.clear();
        this.bg.beginFill(0x2F2F2F);
        this.bg.drawRect(0, 0, _width, _height); // x, y, width, height
        this.bg.endFill();
        this.bgW = _width;
        this.bgH = _height;
        this.topBarbG.clear();
        this.topBarbG.beginFill(0x000000);
        this.topBarbG.drawRect(0, 0, _width, 20); // x, y, width, height
        this.topBarbG.endFill();
        this.horizontalScrollbar.y = this.bgH - this.vsbh;
        this.verticalScrollbar.x = this.bgW - this.vsbh;
        this.setMask();

        if(this.mask.width < this.contents.width)
        {
            this.horizontalScrollbar.visible = true;
        }
        else
        {
            this.horizontalScrollbar.visible = false;
        }

        if(this.mask.height < this.contents.height)
        {
            this.verticalScrollbar.visible = true;
        }
        else
        {
            this.verticalScrollbar.visible = false;
        }
       
    }

    setMask() {
        this.mask.clear();
        this.mask.beginFill(0xffffff);
        this.mask.drawRect(0, 0, this.bgW, this.bgH);
        this.mask.endFill();
        this.contents.mask = this.mask;
    }

    onDragStart(e: any) {
        let model = Model.getInstance();

        //console.log("onDragStart 1", e.target.name);
        if(e.target !== this.topBar)
        {
            return;
        }
        model.stage!.addChild(this.view);
        //console.log("onDragStart 2", e.target.name);
        model.dragTargetPanel = this.view;
        if (model.dragTargetPanel) {
            model.draggingPanel = true;
            this.dragOffsetX = this.view.x - model.mouseX;
            this.dragOffsetY = this.view.y - model.mouseY;

            this.topBar.on('pointerup', this.onDragEnd.bind(this));
            this.topBar.on('pointerupoutside', this.onDragEnd.bind(this));
        }

    }

    onBGup()
    {
        this.isResizing = false;
        let model = Model.getInstance();
        model.dragTargetPanel = null;
    }

    onDragEnd() {
        let model = Model.getInstance();
        if ( model.draggingPanel) {
            
            model.draggingPanel = false;
            model.dragTargetPanel = null;
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;
            
        }

        this.isResizing = false;
    }

    public update() {
        let model = Model.getInstance();
        if (this.view) {
            
            if (this.isResizing && this.initialMousePosition) {
                const deltaX = model.mouseX - this.initialMousePosition.x;
                const deltaY = model.mouseY - this.initialMousePosition.y;

                //console.log("this.resizeDirection", this.resizeDirection,deltaX);
        
                switch (this.resizeDirection) {
                    case 'right':
                        this.setBGSize(this.origWidth + deltaX, this.bgH);
                        break;
                    case 'bottom':
                        this.setBGSize(this.bgW, this.origHeight + deltaY);
                        break;
                    
                }
            }
            else if(this.scrollingH){
               this.updateHScrollbar();
            }
            else if(this.scrollingV)
            {
                this.updateVScrollbar();
            }
            else if(model.draggingPanel)
            {
                const newPosition = this.view.parent.toLocal(new PIXI.Point(model.mouseX + this.dragOffsetX, model.mouseY + this.dragOffsetY));
                this.view.position.set(newPosition.x, newPosition.y);
                this.fixOutOfBounds();
            }
        }
    }

    protected fixOutOfBounds() {
        let model = Model.getInstance();
        if (this.view) {
            if (this.view.x < 0) {
                this.view.x = 0;
            }
            if (this.view.y < 0) {
                this.view.y = 0;
            }
            if (this.view.x + this.view.width > model.renderer!.width) {
                this.view.x = model.renderer!.width - this.view.width;
            }
            if (this.view.y + this.view.height > model.renderer!.height) {
                this.view.y = model.renderer!.height - this.view.height;
            }
        }
    }

    
}