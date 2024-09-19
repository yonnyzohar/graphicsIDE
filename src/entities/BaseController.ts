import * as PIXI from 'pixi.js'; // Import the 'PIXI' module
import { v4 as uuidv4 } from 'uuid';
import { ColorChanger } from "../ColorChanger";
import { EventDispatcher } from "../EventDispatcher";
import { GraphicsController } from "../GraphicsController";
import { Model } from "../Model";
import { TimeLineAsset } from "../TimelineAsset";



export class BaseController extends EventDispatcher {
    

    private lastClickTime = 0;
    private doubleClickThreshold = 300;

    public startDragPosX = 0;
    public startDragPosY = 0;
    public startDragRotation = 0;
    public dragOffsetX = 0;
    public dragOffsetY = 0;
    public startDragMouseX = 0;
    public startDragMouseY = 0;
    public currAnchorPosX = 0;
    public currAnchorPosY = 0;
    public topLeftGlobal: PIXI.Point | undefined;
    public topRightGlobal: PIXI.Point | undefined;
    public bottomLeftGlobal: PIXI.Point | undefined;
    public bottomRightGlobal: PIXI.Point | undefined;
    public view: PIXI.Container | undefined;

    private onDragStartBound:Function | undefined;
    private handleClickBound:Function | undefined;
    private handleRightClickBound:Function | undefined;
    public color:number = 0xffffff * Math.random();
    public uniqueId:string = uuidv4();

    private isDragging: boolean = false;

    constructor() {
        super();
        console.log("uniqueId",this.uniqueId);
        let baseColor = 0x1099bb;
        this.color = ColorChanger.getRandomSimilarColor(baseColor, 0.4);

        
    }

    hide() {
        let view = this.view as PIXI.Container;
        view.visible = false;
        let model = Model.getInstance();
        model.inputFocus = false;
        model.linesHolder!.clear();
    }

    

    private handleRightClick = (e: any): void => {
        let model = Model.getInstance();
        model.inputFocus = false;
        model.linesHolder!.clear();
    }

    protected setView(view: PIXI.Container) {
        let model = Model.getInstance();
        this.view = view;
       // console.log(this.view.name, "added to Model.assetsMap!");
        model.assetsMap.set(this.view, this);
        model.timeLineAssetsMap.set(this.uniqueId, new TimeLineAsset(this));

        this.onDragStartBound = this.onDragStart.bind(this);
        this.handleClickBound = this.handleClick.bind(this);
        this.handleRightClickBound = this.handleRightClick.bind(this);
        
        this.addListeners();
        
    }

    public removeListeners() {
        let view = this.view as PIXI.Container;
        console.log(view.name + " removing listeners");
        view.eventMode = 'dynamic';
        view.interactive = false;
        view.off('pointerdown', this.onDragStartBound as any);
        view.off('click', this.handleClickBound as any);
        view.off('rightdown', this.handleRightClickBound as any);
        view.hitArea = null
    }
    

    public addListeners() {
        let view = this.view as PIXI.Container;
        console.log(view.name + " adding listeners");
        view.eventMode = 'dynamic';
        view.interactive = true;
        view.on('pointerdown', this.onDragStartBound as any);
        view.on('click', this.handleClickBound as any);
        view.on('rightdown', this.handleRightClickBound as any);
        this.updateHitArea(view);
    }

    protected updateHitArea(container: PIXI.Container) {
        const bounds = container.getLocalBounds();
        console.log(container.name, "bounds", bounds);
        container.hitArea = new PIXI.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height);
    }
    
    public getView(): PIXI.Container | undefined {
        return this.view as PIXI.Container;
    }

    public update() {
        let model = Model.getInstance();
        model.view!.style.cursor = 'default';
        if (this.isDragging) {
            if (Model.keysPressed[Model.KEYS.ROTATE]) {
                this.rotate();
            }
            else if (Model.keysPressed[Model.KEYS.MOVE_AXIS]) {
                this.moveAxis();
            }
            else {
                this.moveDragTarget();
            }
            this.dragging();
        }

        if (Model.keysPressed[Model.KEYS.RESIZE]) {
            this.resizeHover();
            if (Model.keysPressed[Model.KEYS.LEFT]) {
                this.view!.scale.x -= 0.01;
            }
            if (Model.keysPressed[Model.KEYS.RIGHT]) {
                this.view!.scale.x += 0.01;
            }
            if (Model.keysPressed[Model.KEYS.UP]) {
                this.view!.scale.y += 0.01;
            }
            if (Model.keysPressed[Model.KEYS.DOWN]) {
                this.view!.scale.y -= 0.01;
            }
        }
        else
        {
            let speed = 1;
            if (Model.keysPressed[Model.KEYS.SHIFT]) {
                speed = 5;
            }
            if (Model.keysPressed[Model.KEYS.LEFT]) {
                this.view!.x-=speed;
            }
            if (Model.keysPressed[Model.KEYS.RIGHT]) {
                this.view!.x+=speed;
            }
            if (Model.keysPressed[Model.KEYS.UP]) {
                this.view!.y-=speed;
            }
            if (Model.keysPressed[Model.KEYS.DOWN]) {
                this.view!.y+=speed;
            }
        }
        if(this.view && !Model.keysPressed[Model.KEYS.MOVE_AXIS])
        {
            GraphicsController.drawSquareAroundSprite(this.view);
            const { x, y } = this.view.getGlobalPosition();
            GraphicsController.drawCircleAroundAnchor(x, y);
        }

        this.setFrameProps();
        
        
    }
    setFrameProps() {
        let model = Model.getInstance();
        let ts:TimeLineAsset = model.timeLineAssetsMap.get(this.uniqueId) as TimeLineAsset;
        if(ts)
        {
            let x = this.view!.x;
            let y = this.view!.y;
            let rotation = this.view!.rotation;
            let scaleX = this.view!.scale.x;
            let scaleY = this.view!.scale.y;
            let alpha = this.view!.alpha;
            let pivotX = this.view!.pivot.x;
            let pivotY = this.view!.pivot.y;
            console.log("setFrameProps", model.currentFrame, x, y, rotation, scaleX, scaleY, alpha, pivotX,pivotY);
            ts.setFrameProps(model.currentFrame, x, y, rotation, scaleX, scaleY, alpha, pivotX,pivotY);
        }
    }

    public dragging() {
        //empty
    }

    private resizeHover() {
        let model = Model.getInstance();
        if (this.view) {
            const offset = 5;
            const { x, y, width, height } = this.view.getBounds();
            if (
                this.isOnCol(x - offset, x + offset, y, y + height) ||
                this.isOnCol(x + width - offset, x + width + offset, y, y + height)
            ) {
                model.view!.style.cursor = 'col-resize';
            }
            else if (
                this.isOnCol(x, x + width, y - offset, y + offset) ||
                this.isOnCol(x, x + width, y + height - offset, y + height + offset)
            ) {
                model.view!.style.cursor = 'row-resize';
            }
            else {
                model.view!.style.cursor = 'default';
            }
        }
    }

    private isOnCol(left: number, right: number, top: number, btm: number): boolean {
        let model = Model.getInstance();
        let a = model.mouseX >= left;
        let b = model.mouseX <= right;
        let c = model.mouseY >= top;
        let d = model.mouseY <= btm;
        return a && b && c && d;
    }

    public rotate() {
        let model = Model.getInstance();
        const parent = model.dragTarget!.parent;
        const localMousePosition = parent.toLocal(new PIXI.Point(model.mouseX, model.mouseY));
        let rot = (localMousePosition.x - this.startDragMouseX) * 0.05;
        if (this.view) {
            this.view.rotation = this.startDragRotation + rot;
            GraphicsController.drawSquareAroundSprite(this.view);
            const { x, y } = this.view.getGlobalPosition();
            GraphicsController.drawCircleAroundAnchor(x, y);
        }
    }

    public setObj(target: PIXI.Container, notify: boolean = true) {
        let model = Model.getInstance();
        model.dragTarget = target;
        GraphicsController.drawSquareAroundSprite(target);
        const { x, y } = target.getGlobalPosition();
        GraphicsController.drawCircleAroundAnchor(x, y);
        if(notify)
        {
            this.dispatchEvent("ASSET_SELECTED", target);
        }
        
    }

    private handleClick = (e: any): void => {
        let model = Model.getInstance();
        console.log("click", e.target.name);

        const currentTime = Date.now();
        if (currentTime - this.lastClickTime < this.doubleClickThreshold) 
        {
            let a:PIXI.Container[] = [];
            let asset1 = this.view as PIXI.Container;
            while(asset1.parent)
            {
                a.push(asset1);
                asset1 = asset1.parent;
            }
            
            model.currentHierarchy = a.reverse();
            this.dispatchEvent("DRILL_DOWN");
        } 
        else {
            this.setObj(e.target);
            model.inputFocus = false;
        }

        this.lastClickTime = currentTime;
        this.setFrameProps();
    }

    private onDragStart(e: any) {
        let model = Model.getInstance();
        model.inputFocus = false;
        model.dragTarget = e.target;
        if (model.dragTarget) {
            this.isDragging = true;
            this.currAnchorPosX = model.dragTarget!.pivot.x;
            this.currAnchorPosY = model.dragTarget!.pivot.y;
    
            const parent = model.dragTarget!.parent;
            const localMousePosition = parent.toLocal(new PIXI.Point(model.mouseX, model.mouseY));
    
            this.startDragMouseX = localMousePosition.x;
            this.startDragMouseY = localMousePosition.y;
            this.dragOffsetX = model.dragTarget!.x - this.startDragMouseX;
            this.dragOffsetY = model.dragTarget!.y - this.startDragMouseY;
            this.startDragPosX = model.dragTarget!.x;
            this.startDragPosY = model.dragTarget!.y;
            this.startDragRotation = model.dragTarget!.rotation;
            model.dragTarget!.on('pointerup', this.onDragEnd.bind(this));
            model.dragTarget!.on('pointerupoutside', this.onDragEnd.bind(this));
        }
    }

    private onDragEnd() {
        let model = Model.getInstance();

        if (this.isDragging) {
            if (Model.keysPressed[Model.KEYS.MOVE_AXIS]) {
                const newPosition = this.setNewPivot(this.view!);
                GraphicsController.drawSquareAroundSprite(this.view!);
                GraphicsController.drawCircleAroundAnchor(newPosition.x, newPosition.y);
            }

            this.isDragging = false;
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;
            this.startDragPosX = 0;
            this.startDragPosY = 0;
            this.startDragRotation = 0;
            this.setFrameProps();
        }
    }

    public moveDragTarget() {
        if (this.view) {
            let model = Model.getInstance();
            const parent = this.view.parent;
            const localMousePosition = parent.toLocal(
                new PIXI.Point(model.mouseX, model.mouseY)
            );
            
            const newPosition = new PIXI.Point(localMousePosition.x + this.dragOffsetX, localMousePosition.y + this.dragOffsetY);
            this.view.position.set(newPosition.x, newPosition.y);
    
            GraphicsController.drawSquareAroundSprite(this.view);
            const { x, y } = this.view.getGlobalPosition();
            GraphicsController.drawCircleAroundAnchor(x, y);
        }
    }
    
    public moveAxis() {
        if (this.view) {
            let model = Model.getInstance();
            const parent = this.view.parent;
            let localMousePosition = parent.toLocal(
                new PIXI.Point(model.mouseX , model.mouseY)
            );

            if (model.assetsHolder) {
                const newPosition = new PIXI.Point(localMousePosition.x + this.dragOffsetX, localMousePosition.y + this.dragOffsetY);
                const globalPosition = this.view.parent.toGlobal(newPosition);
                newPosition.x = globalPosition.x;
                newPosition.y = globalPosition.y;
                GraphicsController.drawSquareAroundSprite(this.view);
                GraphicsController.drawCircleAroundAnchor(newPosition.x, newPosition.y );
            }
        }
    }

    public setNewPivot(sprite: PIXI.Container): PIXI.Point {
        let model = Model.getInstance();
        const newPosition = sprite.parent.toLocal(new PIXI.Point(model.mouseX + this.dragOffsetX, model.mouseY + this.dragOffsetY));
        const globalPosition = sprite.parent.toGlobal(newPosition);
        newPosition.x = globalPosition.x;
        newPosition.y = globalPosition.y;
        const newPivot = sprite.toLocal(newPosition);
        
        // Calculate the offset before changing the pivot
        const offsetX = (newPivot.x - sprite.pivot.x) * sprite.scale.x;
        const offsetY = (newPivot.y - sprite.pivot.y) * sprite.scale.y;

        // Calculate the offset considering the rotation
        const rotatedOffsetX = offsetX * Math.cos(sprite.rotation) - offsetY * Math.sin(sprite.rotation);
        const rotatedOffsetY = offsetX * Math.sin(sprite.rotation) + offsetY * Math.cos(sprite.rotation);

        // Set the new pivot point
        sprite.pivot.set(newPivot.x, newPivot.y);

        // Adjust the sprite's position to keep it in the same place
        sprite.position.x += rotatedOffsetX;
        sprite.position.y += rotatedOffsetY;

        // Log the adjustments made
        //console.log("Adjusted position:", sprite.position);
        return newPosition;
    }

    toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    // Function to calculate the rotated position
    calculateRotatedPosition(sprite: PIXI.Sprite, x: number, y: number): PIXI.Point {
        const angle = this.toRadians(sprite.rotation);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const dx = x - sprite.x;
        const dy = y - sprite.y;

        const rotatedX = cos * dx - sin * dy + sprite.x;
        const rotatedY = sin * dx + cos * dy + sprite.y;

        return new PIXI.Point(rotatedX, rotatedY);
    }
}