import api from './jsxcad-api.js';

import {
  boot,
  createConversation,
  read,
  setupFilesystem,
  getFilesystem,
  touch,
  listFiles,
} from './jsxcad-sys.js';


import { toThreejsGeometry } from './jsxcad-convert-threejs.js';
import { toStl } from './jsxcad-convert-stl.js';
import { toSvg } from './jsxcad-convert-svg.js';
import { toGcode } from './jsxcad-convert-gcode.js';
import { toDisplayGeometry } from './jsxcad-geometry.js';

const say = (message) => postMessage(message);


const returnEmptyGeometryText = () => {
    return api.Hershey('No Geometry', 20).align('xy');
}

const maslowRead = async (path) => {
    if(typeof path == 'string'){
        return await api.loadGeometry(path, {otherwise: returnEmptyGeometryText});
    }
    else{
        return returnEmptyGeometryText();
    }
}


const agent = async ({ ask, message }) => {
  try {
    const { id, op, path, value, workspace } = message;
    if (workspace) {
      setupFilesystem({ fileBase: workspace });
    }
    console.log("Op: " + op);
    switch(op) {
      case 'sys/attach':
        self.id = id;
        return;
      case 'sys/touch':
        if (id === undefined || id !== self.id) {
          // Don't respond to touches from ourselves.
          await touch(path, { workspace, clear: true, broadcast: false });
        }
        return;
      case "rectangle":
        const aSquare = api.Box(message.x, message.y);
        await api.saveGeometry(message.writePath, aSquare);
        return 1;
        break;
      case "circle":
        const aCircle = api.Arc(message.diameter).hasSides(message.numSegments);
        await api.saveGeometry(message.writePath, aCircle);
        return 1;
        break;
      case "extrude":
        const aShape = await maslowRead(message.readPath);
        const extrudedShape = aShape.ex(message.distance);
        await api.saveGeometry(message.writePath, extrudedShape);
        return 1;
        break;
     case "move":
        const aShape2Translate = await maslowRead(message.readPath);
        const translatedShape = aShape2Translate.move(message.x, message.y, message.z);
        await api.saveGeometry(message.writePath, translatedShape);
        return 1;
        break;
     case "simplify":
        const aShape2Smiplify = await maslowRead(message.readPath);
        const simplified = aShape2Smiplify.noVoid().each((s) =>
            api.Group(
              ...s.map((e) =>
                e.size(({ min, max }) => {
                  const tags = e.toGeometry().tags;
                  if(tags.includes("user/Do not simplify")){
                      return e;
                  }
                  else{
                      const rBox = api.Box()
                        .c1(...min)
                        .c2(...max);
                      const coloredBox = api.Shape.fromGeometry({
                        ...rBox.toGeometry(),
                        tags: tags,
                      });
                      return coloredBox;
                  }
                })
              )
            )
          )
        await api.saveGeometry(message.writePath, simplified);
        return 1;
        break;
    case "rotate":
        const aShape2Rotate = await maslowRead(message.readPath);
        const rotatedShape = aShape2Rotate.rotateX(-1*(message.x/360)).rotateY(-1*(message.y/360)).rotateZ(-1*(message.z/360));
        await api.saveGeometry(message.writePath, rotatedShape);
        return 1;
        break;
    case "difference":
        const aShape2Difference1 = await maslowRead(message.readPath1);
        const aShape2Difference2 = await maslowRead(message.readPath2);
        const cutShape = aShape2Difference1.cut(aShape2Difference2);
        await api.saveGeometry(message.writePath, cutShape);
        return 1;
        break;
    case "intersection":
        const aShape2Intersect1 = await maslowRead(message.readPath1);
        const aShape2Intersect2 = await maslowRead(message.readPath2);
        const intersectionShape = aShape2Intersect1.clip(aShape2Intersect2);
        await api.saveGeometry(message.writePath, intersectionShape);
        return 1;
        break;
    case "group":
        var geometries = [];
        for (const path of message.paths) {
            const unionGeometry = await maslowRead(path);
            geometries.push(unionGeometry);
        }
        const unionShape = api.Shape.fromGeometry(api.Group(...geometries).toDisjointGeometry());
        await api.saveGeometry(message.writePath, unionShape);
        return 1;
        break;
    case "hull":
        var hullGeometries = [];
        for (const path of message.paths) {
            const hullGeometry = await maslowRead(path);
            hullGeometries.push(hullGeometry);
        }
        const hullShape = api.Hull(...hullGeometries);
        await api.saveGeometry(message.writePath, hullShape);
        return 1;
        break;
    case "assembly":
        var assemblyGeometries = [];
        for (const path of message.paths) {
            const assemblyGeometry = await maslowRead(path);
            assemblyGeometries.push(assemblyGeometry);
        }
        
        const assemblyShape = api.Assembly(...assemblyGeometries);
        
        await api.saveGeometry(message.writePath, assemblyShape);
        return 1;
        break;
    case "color":
        if(message.color == "Keep Out"){
            const shape2Color = await maslowRead(message.readPath);
            const coloredShape = shape2Color.void();
            await api.saveGeometry(message.writePath, coloredShape);
        }
        else{
            const shape2Color = await maslowRead(message.readPath);
            const coloredShape = shape2Color.color(message.color.toLowerCase());
            await api.saveGeometry(message.writePath, coloredShape);
        }
        return 1;
        break;
    case "tag":
        const shape2tag = await maslowRead(message.readPath);
        const taggedShape = shape2tag.tag(message.tag);
        await api.saveGeometry(message.writePath, taggedShape);
        return 1;
        break;
    case "copy":
        const shape2copy = await maslowRead(message.readPath);
        await api.saveGeometry(message.writePath, shape2copy);
        return 1;
        break;
    case "listTags":
        const shape2ListTags = await maslowRead(message.readPath);
        return shape2ListTags.tags();
        break;
    case "item":
        const shape2item = await maslowRead(message.readPath);
        const itemShape = shape2item.asPart(message.tag);
        await api.saveGeometry(message.writePath, itemShape);
        return 1;
        break;
    case "listItems":
        const shape2ListItems = await maslowRead(message.readPath);
        return shape2ListItems.bom();
        break;
    case "extractTag":
        const shape2extractFrom = await maslowRead(message.readPath);
        const extractedShape = shape2extractFrom.get('user:'+message.tag);
        await api.saveGeometry(message.writePath, extractedShape);
        return 1;
        break;
    case "code":
        
        let inputs = {};
        for (const key in message.paths) {
            if ( !isNaN(Number(message.paths[key]))) { //Check to see if input can be parsed as a number
                inputs[key] = message.paths[key];
            } else {
                inputs[key] = await maslowRead(message.paths[key]);
            }
        }
        
        const signature =
          '{ ' +
          Object.keys(api).join(', ') + ', ' +
          Object.keys(inputs).join(', ') +
          ' }';
        const foo = new Function(signature, message.code);
        
        try{
            const returnedGeometry = foo({...inputs, ...api });
            await api.saveGeometry(message.writePath, returnedGeometry);
            return 1;
        }
        catch(err){
            console.warn(err);
            return -1;
        }
        break;
    case "stl":
        const geometryToStl = await maslowRead(message.readPath);
        const stlString = await toStl(geometryToStl.toGeometry());
        return stlString;
        break;
    case "svg":
        const geometryToSvg = await maslowRead(message.readPath);
        const svgShapeHeight = geometryToSvg.size().height;
        const rotatedShapeSVG = geometryToSvg.rotateY(-.625).rotateZ(.25).move(0, svgShapeHeight/-3, 2*svgShapeHeight);
        const svgString = await toSvg(rotatedShapeSVG.toKeptGeometry());
        return svgString;
        break;
    case "outline":
        const geometryToOutline = await maslowRead(message.readPath);
        
        const outlineShape = geometryToOutline.align('z').section().fuse().outline();
        await api.saveGeometry(message.writePath, outlineShape);
        
        
        return true
        break;
    case "svgOutline":
        const geometryToSvgOutline = await maslowRead(message.readPath);
        
        const svgOutlineBuffer = await toSvg(geometryToSvgOutline.toKeptGeometry());
        return svgOutlineBuffer;
        break;
    case "gcode":
        
        const geometryToGcode = await maslowRead(message.readPath);
        
        const shapeHeight = geometryToGcode.size().height;
        
        const cutDepth = shapeHeight / message.passes;
        
        api.defGrblSpindle('cnc', { rpm: 700, cutDepth: cutDepth, feedRate: message.speed, diameter: message.toolSize, type: 'spindle' });
        
        const toolPath = geometryToGcode.section().offset(message.toolSize/2).tool('cnc').engrave(shapeHeight);
        await api.saveGeometry(message.writePath, toolPath);
        
        return new TextDecoder().decode(await toGcode(toolPath.toGeometry(), {definitions: getDefinitions()}));
        
        break;
    case "getHash":
        const shape2getHash = await maslowRead(message.readPath);
        return shape2getHash.geometry.hash;
        break;
    case "getJSON":
        const shape2getJSON = await maslowRead(message.readPath);
        return JSON.stringify(shape2getJSON.toGeometry());
        break;
    case "fromJSON":
        const fromJson = api.Shape.fromGeometry(JSON.parse(message.json))
        await api.saveGeometry(message.writePath, fromJson);
        return false;
        break;
    case "fromSVG":
        const shapeFromSVG = await api.readSvg(message.svgPath);
        await api.saveGeometry(message.writePath, shapeFromSVG);
        return true;
        break;
    case "getPathsList":
        const listedFiles = await listFiles();
        return listedFiles
        break;
    case "deletePath":
        deleteFile({}, message.path);
        return 1
        break;
    case "display":
        const geometryToDisplay = await maslowRead(message.readPath);
        const threejsGeometry = toThreejsGeometry(toDisplayGeometry(geometryToDisplay.toKeptGeometry(),{triangles: message.triangles, outline: message.outline, wireframe: message.wireframe }));
        return threejsGeometry;
        break;
    }
    }
    catch(err){
        console.warn(err);
        console.log(message);
        return -1;
    }
}; 


const messageBootQueue = [];
onmessage = ({ data }) => messageBootQueue.push(data);

const bootstrap = async () => {
  await boot();
  const { ask, hear, tell } = createConversation({ agent, say });
  self.ask = ask;
  self.tell = tell;

  // Handle any messages that came in while we were booting up.
  if (messageBootQueue.length > 0) {
    do {
      hear(messageBootQueue.shift());
    } while(messageBootQueue.length > 0);
  }

  // The boot queue must be empty at this point.
  onmessage = ({ data }) => hear(data);

  if (onmessage === undefined) throw Error('die');
};

bootstrap();

