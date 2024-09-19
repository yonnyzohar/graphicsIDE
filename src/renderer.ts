import * as PIXI from "pixi.js";
import { AssetHolderController } from "./AssetHolderController";
import { BaseController } from "./entities/BaseController";
import { ContainerController } from "./entities/ContainerController";
import { SpriteController } from "./entities/SpriteController";
import { Model } from "./Model";
import { HierarchyPanel } from "./panels/HierarchyPanel";
import { Panel } from "./panels/Panel";
import { PathPanel } from "./panels/PathPanel";
import { PropertiesPanel } from "./panels/PropertiesPanel";
import { TimelinePanel } from "./panels/TimelinePanel";

let propertiesPanel: PropertiesPanel;
let hierarchyPanel: HierarchyPanel;
let pathPanel: PathPanel;
let timelinePanel:TimelinePanel;

// Create the canvas and set initial styles
let view: HTMLCanvasElement = document.createElement("canvas");
view.style.position = "fixed";
view.style.padding = "0";
view.style.margin = "0";
view.style.width = "100%";
view.style.height = "100%";
view.style.display = "block";

// Initialize the model
let model = Model.getInstance();
model.view = view;

// Create the renderer
const renderer = PIXI.autoDetectRenderer({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0x1099bb,
  view: view,
});

document.body.appendChild(view);
model.renderer = renderer;

timelinePanel = new TimelinePanel();

let assetHolderController = new AssetHolderController();
model.stage = new PIXI.Container();
model.assetsHolder = assetHolderController.view;
model.assetsHolder!.name = "main";
model.linesHolder = new PIXI.Graphics();
model.stage!.addChild(model.assetsHolder!);
model.stage!.addChild(model.linesHolder!);
model.currentHierarchy.push(model.assetsHolder!);
assetHolderController.addGridScaling();

propertiesPanel = new PropertiesPanel();
propertiesPanel.addEventListener("PROPERTIES_CHANGED", (e) => {
  hierarchyPanel.display();
  timelinePanel.render();
  
});

model.stage!.addChild(propertiesPanel.view);


model.stage!.addChild(timelinePanel.view);

hierarchyPanel = new HierarchyPanel();
model.stage!.addChild(hierarchyPanel.view);
hierarchyPanel.addEventListener("EXPORT_PRESSED", () => {
  console.log("EXPORT_PRESSED");
  let obj = {};
  grabHierarchy(model.assetsHolder, obj);
  console.log(obj);
});
hierarchyPanel.addEventListener("SET_SELECTED_ASSET", (e) => {
  timelinePanel.onAssetSelected(e as PIXI.Container);
});
hierarchyPanel.addEventListener("CREATE_CONTAINER_PRESSED", () => {
  console.log("CREATE_CONTAINER_PRESSED");
  model.currentFrame = 0;
  let container = addContainer();
  let lastEnt: PIXI.Container =
    model.currentHierarchy[model.currentHierarchy.length - 1];
  if (container) {
    lastEnt.addChild(container);
  }

  if (hierarchyPanel) {
    hierarchyPanel.display();
  }
  timelinePanel.render();
});

function addContainer(): PIXI.Container | undefined {
  let cc = new ContainerController(
    "instance_" + Model.getInstanceCount(),
    renderer
  );
  cc.addEventListener("ASSET_SELECTED", (e) => {
    if (hierarchyPanel) {
      model.dragTarget = e as PIXI.Container;
      hierarchyPanel.display(e as PIXI.Container);
      timelinePanel.onAssetSelected(e as PIXI.Container);
      //showHide();
    }
  });
  cc.addEventListener("DRILL_DOWN", () => {
    showHide();
    pathPanel.render();
    timelinePanel.render();
  });

  return cc.view;
}

// Function to resize the canvas
function resize() {
  renderer.resize(window.innerWidth, window.innerHeight);
  view.style.width = `${window.innerWidth}px`;
  view.style.height = `${window.innerHeight}px`;
  assetHolderController.drawGrid();
  pathPanel.resize();
  assetHolderController.addGridScaling();
}

function animate() {
  renderer.render(model.stage!);
  requestAnimationFrame(animate);

  assetHolderController.update();

  if (model.dragTargetPanel) {
    let panel: Panel = model.panelsMap.get(model.dragTargetPanel)!;
    if (panel) {
      panel.update();
    } else {
      model.draggingPanel = false;
      model.dragTargetPanel = null;
    }
  }

  if (Model.keysPressed[Model.KEYS.F5]) {
    timelinePanel.timelines[model.currentLayer].addFrames();
  }

  if (Model.keysPressed[Model.KEYS.F6]) {
    timelinePanel.timelines[model.currentLayer].addKeyFrame();
  }

  if (model.dragTarget) {
    let sprite = model.dragTarget;
    let sc: BaseController | null = model.assetsMap.get(sprite!) ?? null;
    if (sc) {
      sc.update();
    }

    if (propertiesPanel) {
      if (model.inputFocus == false) {
        if (sprite!.name !== null) {
          propertiesPanel.setName(sprite!.name);
        }
        propertiesPanel.setW(Math.floor(sprite!.width).toString());
        propertiesPanel.setH(Math.floor(sprite!.height).toString());
        propertiesPanel.setX(Math.floor(sprite!.x).toString());
        propertiesPanel.setY(Math.floor(sprite!.y).toString());
        propertiesPanel.setRot(
          Math.floor(radiansToDegrees(sprite!.rotation)).toString()
        );
        propertiesPanel.setScaleX(sprite!.scale.x.toString());
        propertiesPanel.setScaleY(sprite!.scale.y.toString());
        propertiesPanel.setAlpha(sprite!.alpha.toString());
      }
      propertiesPanel.render();
    }

    
    if (Model.keysPressed[Model.KEYS.DELETE]) {
      if (model.inputFocus == false) {
        sprite!.removeFromParent();
        model.assetsMap.delete(sprite!);
        console.log(sprite!.name, "removed from Model.assetsMap!");
        model.dragTarget = null;
        model.linesHolder!.clear();
        if (hierarchyPanel) {
          hierarchyPanel.display();
        }
      }
    }
  } else {
    if (propertiesPanel) {
      propertiesPanel.setName("");
      propertiesPanel.setW("");
      propertiesPanel.setH("");
      propertiesPanel.setX("");
      propertiesPanel.setY("");
      propertiesPanel.setRot("");
      propertiesPanel.setScaleX("");
      propertiesPanel.setScaleY("");
      propertiesPanel.setAlpha("");
    }
  }
}

function radiansToDegrees(radians: number) {
  return radians * (180 / Math.PI);
}

function removeAllStageListeners(asset: PIXI.Container | undefined) {
  if (asset) {
    let controller: BaseController | undefined = model.assetsMap.get(asset);
    if (controller) {
      controller.removeListeners();
    }
    if (asset.children) {
      for (let i = 0; i < asset.children.length; i++) {
        removeAllStageListeners(asset.children[i] as PIXI.Container);
      }
    }
  }
}

function showHide() {
  removeAllStageListeners(model.assetsHolder);

  let p: PIXI.DisplayObject =
    model.currentHierarchy[model.currentHierarchy.length - 1];
  let c: BaseController | undefined = model.assetsMap.get(p as PIXI.Container);
  if (c) {
    renderer.background.color = c.color;
  } else {
    renderer.background.color = 0x1099bb;
  }

  console.log("inside", p.name);
  if (p.children) {
    for (let i = 0; i < p.children.length; i++) {
      let child = p.children[i] as PIXI.Container;

      let controller: BaseController | undefined = model.assetsMap.get(child);
      if (controller) {
        console.log("turning on", child.name);
        controller.addListeners();
      }
    }
  }
  timelinePanel.render();
}

function addSprite(texture: PIXI.Texture, filePath: string) {
  let sp: SpriteController = new SpriteController(
    texture,
    getFileNameFromPath(filePath),
    renderer,
    filePath
  );

  let lastEnt: PIXI.Container =
    model.currentHierarchy[model.currentHierarchy.length - 1];
  if (sp.view) {

    let index = lastEnt.children.length - 1; // Get the index one less than the top
    if (index < 0) index = 0; // Ensure index is not negative, for safety
    lastEnt.addChildAt(sp.view, index);
  }
  sp.addEventListener("ASSET_SELECTED", (e) => {
    if (hierarchyPanel) {
      hierarchyPanel.display(e as PIXI.Container);
      model.dragTarget = e as PIXI.Container;
      timelinePanel.onAssetSelected(e as PIXI.Container);
      showHide();
    }
  });
  if (hierarchyPanel) {
    hierarchyPanel.display();
  }
}

function loadImage(filePath: string) {
  PIXI.Assets.load(filePath)
    .then((texture: PIXI.Texture) => {
      addSprite(texture, filePath);
    })
    .catch((err) => {
      console.error("Failed to load image:", err);
    });
}

function getFileNameFromPath(filePath: string): string {
  const lastSlashIndex = filePath.lastIndexOf("/");
  if (lastSlashIndex === -1) {
    return filePath; // If there's no slash, the filePath itself is the file name
  }
  return filePath.substring(lastSlashIndex + 1);
}

window.addEventListener("resize", resize);
window.addEventListener("mousemove", (event) => {
  model.mouseX = event.clientX;
  model.mouseY = event.clientY;
});
window.addEventListener("drop", (e) => {
  e.preventDefault();
  if (e.dataTransfer && e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0];
    const filePath = file.path;
    console.log("Dropped file:", filePath);
    loadImage(filePath);
  }
});
window.addEventListener("dragover", (e) => {
  e.preventDefault();
});

window.addEventListener("keydown", (event) => {
  let str: string = event.key;
  if (Model.keysPressed[str] != undefined) {
    Model.keysPressed[str] = true;
  }
});

window.addEventListener("keyup", (event) => {
  let str: string = event.key;
  console.log("keyup", str);
  if (Model.keysPressed[str] != undefined) {
    Model.keysPressed[str] = false;
    console.log("setting " + str + " to false");
  }
});

model.stage!.on("rightdown", () => {
  model.linesHolder!.clear();
  model.inputFocus = false;
  model.dragTargetPanel = null;
  model.dragTarget = null;
});

document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  const element = document.elementFromPoint(event.clientX, event.clientY);

  // Check if the element is a PIXI sprite
  if (element === view) {
    model.inputFocus = false;
    model.linesHolder!.clear();
    model.dragTargetPanel = null;
    model.dragTarget = null;
  }
});

document.addEventListener("wheel", (event) => {
  assetHolderController.zoom(event);
});


pathPanel = new PathPanel();

pathPanel.addEventListener("DRILL_DOWN", () => {
  showHide();
  pathPanel.render();
  let p: PIXI.DisplayObject =
    model.currentHierarchy[model.currentHierarchy.length - 1];
  hierarchyPanel.display(p as PIXI.Container<PIXI.DisplayObject>);
});
hierarchyPanel.addEventListener("DRILL_DOWN", () => {
  showHide();
  pathPanel.render();
});

function grabHierarchy(mc: PIXI.DisplayObject | undefined, obj: any) {
  obj.name = mc?.name;
  if (mc instanceof PIXI.Sprite) {
    obj.type = "Sprite";
    let sc: BaseController = model.assetsMap.get(mc)!;
    if (sc) {
      let spC: SpriteController = sc as SpriteController;
      obj.filePath = spC.filePath;
    }
  } else if (mc instanceof PIXI.Container) {
    obj.type = "Container";
  }
  obj.rotation = mc?.rotation;
  obj.x = mc?.x;
  obj.y = mc?.y;
  obj.sx = mc?.scale.x;
  obj.sy = mc?.scale.y;
  obj.alpha = mc?.alpha;
  let pivot = mc?.pivot;
  if (pivot) {
    obj.pivot = { x: pivot.x, y: pivot.y };
  }

  if (mc?.children) {
    obj.children = [];
    for (let i = 0; i < mc.children.length; i++) {
      let child = mc.children[i] as PIXI.Container;
      if (child.name == "crosshair") {
        continue;
      }
      let childObj = {};
      obj.children.push(childObj);
      grabHierarchy(child, childObj);
    }
  }
}

function loadHierarchy(obj: any, assetsHolder: PIXI.Container) {
  console.log("loading hierarchy", obj.children.length);
  for (let i = 0; i < obj.children.length; i++) 
  {
    let childObj = obj.children[i];
    console.log("loading", childObj.name,childObj.type);
    if(childObj.name == "main" && assetsHolder.name == "main")
    {
      assetsHolder.rotation = childObj.rotation;
      assetsHolder.x = childObj.x;
      assetsHolder.y = childObj.y;
      assetsHolder.scale.x = childObj.sx;
      assetsHolder.scale.y = childObj.sy;
      assetsHolder.alpha = childObj.alpha;
      if (childObj.pivot) {
        assetsHolder.pivot.x = childObj.pivot.x;
        assetsHolder.pivot.y = childObj.pivot.y;
      }
      if (childObj.children) {
        loadHierarchy(childObj, assetsHolder);
      }
    }
    else
    {
      if (childObj.type == "Sprite") 
        {
          PIXI.Assets.load(childObj.filePath)
            .then((texture: PIXI.Texture) => {
              let sp: SpriteController = new SpriteController(
                texture,
                getFileNameFromPath(childObj.filePath),
                renderer,
                childObj.filePath
              );
              let view = sp.view;
              if (view) {

                let index = assetsHolder.children.length - 1; // Get the index one less than the top
                if (index < 0) index = 0; // Ensure index is not negative, for safety
                assetsHolder.addChildAt(view, index);


                view.rotation = childObj.rotation;
                view.x = childObj.x;
                view.y = childObj.y;
                view.scale.x = childObj.sx;
                view.scale.y = childObj.sy;
                view.alpha = childObj.alpha;
                if (childObj.pivot) {
                  view.pivot.x = childObj.pivot.x;
                  view.pivot.y = childObj.pivot.y;
                }
              }
              sp.addEventListener("ASSET_SELECTED", (e) => {
                if (hierarchyPanel) {
                  hierarchyPanel.display(e as PIXI.Container);
                  model.dragTarget = e as PIXI.Container;
                  timelinePanel.onAssetSelected(e as PIXI.Container);
                  showHide();
                }
              });
            })
            .catch((err) => {
              console.error("Failed to load image:", err);
            });
        } 
        else if (childObj.type == "Container") 
        {
          let cc = new ContainerController(childObj.name, renderer);
          Model.setInstanceCount(childObj.name);
          cc.addEventListener("ASSET_SELECTED", (e) => {
            if (hierarchyPanel) {
              model.dragTarget = e as PIXI.Container;
              hierarchyPanel.display(e as PIXI.Container);
              timelinePanel.onAssetSelected(e as PIXI.Container);
              //showHide();
            }
          });
          cc.addEventListener("DRILL_DOWN", () => {
            showHide();
            pathPanel.render();
          });
          let view = cc.view;
          if (view) {
            assetsHolder?.addChild(view);
            view.rotation = childObj.rotation;
            view.x = childObj.x;
            view.y = childObj.y;
            view.scale.x = childObj.sx;
            view.scale.y = childObj.sy;
            view.alpha = childObj.alpha;
            if (childObj.pivot) {
              view.pivot.x = childObj.pivot.x;
              view.pivot.y = childObj.pivot.y;
            }
            if (childObj.children) {
              loadHierarchy(childObj, view);
            }
          }
        }
    }
    
    
  }
  //loadImage();
}

(window as any)["electron"].fromMain(
  (event: any, data: { message: string; payload: any }) => {
    console.log(data.message);
    if (data.message == "save_file") {
      let obj = {};
      grabHierarchy(model.assetsHolder, obj);
      const dataToSend = { message: "file_contents", payload: obj };
      (window as any)["electron"].fromBrowser(dataToSend);
    }
    if (data.message == "loaded_json") {
      let obj = data.payload;
      //model.assetsHolder!.removeChildren();
      model.assetsMap.clear();
      model.currentHierarchy = [];
      model.currentHierarchy.push(model.assetsHolder!);
      loadHierarchy(obj, model.assetsHolder!);
      hierarchyPanel.display();
    }
  }
);

animate();
resize();
