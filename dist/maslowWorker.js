import api from './jsxcad-api.js';
import { setPendingErrorHandler, emit, log, boot, createConversation, setupFilesystem, clearEmitted, addOnEmitHandler, pushModule, popModule, resolvePending, removeOnEmitHandler, getEmitted, writeFile, readFile, deleteFile, touch, getDefinitions, listFiles} from './jsxcad-sys.js';
import { toThreejsGeometry } from './jsxcad-convert-threejs.js';
import { toStl } from './jsxcad-convert-stl.js';
import { toSvg } from './jsxcad-convert-svg.js';
import { toGcode } from './jsxcad-convert-gcode.js';
import { toDisplayGeometry } from './jsxcad-geometry.js';

function pad (hash, len) {
  while (hash.length < len) {
    hash = '0' + hash;
  }
  return hash;
}

function fold (hash, text) {
  var i;
  var chr;
  var len;
  if (text.length === 0) {
    return hash;
  }
  for (i = 0, len = text.length; i < len; i++) {
    chr = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash < 0 ? hash * -2 : hash;
}

function foldObject (hash, o, seen) {
  return Object.keys(o).sort().reduce(foldKey, hash);
  function foldKey (hash, key) {
    return foldValue(hash, o[key], key, seen);
  }
}

function foldValue (input, value, key, seen) {
  var hash = fold(fold(fold(input, key), toString(value)), typeof value);
  if (value === null) {
    return fold(hash, 'null');
  }
  if (value === undefined) {
    return fold(hash, 'undefined');
  }
  if (typeof value === 'object' || typeof value === 'function') {
    if (seen.indexOf(value) !== -1) {
      return fold(hash, '[Circular]' + key);
    }
    seen.push(value);

    var objHash = foldObject(hash, value, seen);

    if (!('valueOf' in value) || typeof value.valueOf !== 'function') {
      return objHash;
    }

    try {
      return fold(objHash, String(value.valueOf()))
    } catch (err) {
      return fold(objHash, '[valueOf exception]' + (err.stack || err.message))
    }
  }
  return fold(hash, value.toString());
}

function toString (o) {
  return Object.prototype.toString.call(o);
}

function sum (o) {
  return pad(foldValue(0, o, '', []).toString(16), 8);
}

var hashSum = sum;

/* global postMessage, onmessage:writable, self */

const resolveNotebook = async () => {
  await resolvePending(); // Update the notebook.

  const notebook = getEmitted(); // Resolve any promises.

  for (const note of notebook) {
    if (note.download) {
      for (const entry of note.download.entries) {
        entry.data = await entry.data;
      }
    }
  }
};

const say = message => postMessage(message);

const reportError = error => {
  const entry = {
    text: error.stack ? error.stack : error,
    level: 'serious'
  };
  const hash = hashSum(entry);
  emit({
    error: entry,
    hash
  });
  log({
    op: 'text',
    text: error.stack ? error.stack : error,
    level: 'serious'
  });
};

setPendingErrorHandler(reportError);

setupFilesystem({ fileBase: 'maslow' });

const returnEmptyGeometryText = () => {
    return api.Hershey(20)('No Geometry').align('xy');
}

const maslowRead = async (path) => {
    if(typeof path == 'string'){
        return await api.loadGeometry(path, {otherwise: returnEmptyGeometryText});
    }
    else{
        return returnEmptyGeometryText();
    }
}

const agent = async ({
  ask,
  message,
  type,
  tell
}) => {
    const {
      op
    } = message;
    const {
    script,
    path,
    workspace,
    view,
    offscreenCanvas,
    sha = 'master'
  } = message;
    if ( op === "touchFile") {
        await touch(path, { workspace });
        return;
    }
    
    try{
        if(message.key){
            console.log(message.key);
        }
        switch(message.key) {
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
         case "translate":
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
        case "copy":
            const shape2Copy = await maslowRead(message.readPath);
            await api.saveGeometry(message.writePath, shape2Copy);
            return 1;
            break;
        case "tag":
            const shape2tag = await maslowRead(message.readPath);
            const taggedShape = shape2tag.as(message.tag);
            await api.saveGeometry(message.writePath, taggedShape);
            return 1;
            break;
        case "listTags":
            const shape2ListTags = await maslowRead(message.readPath);
            return shape2ListTags.tags();
            break;
        case "extractTag":
            const shape2extractFrom = await maslowRead(message.readPath);
            const extractedShape = shape2extractFrom.keep(message.tag).noVoid();//.toDisjointGeometry();
            await api.saveGeometry(message.writePath, extractedShape);
            return 1;
            break;
        case "code":
            
            let inputs = {};
            for (const key in message.paths) {
                if ( !isNaN(Number(message.paths[key]))) { //Check to see if input can be parsed as a number
                    inputs[key] = message.paths[key];
                } else {
                    console.log(key);
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
            
            const svgString = await toSvg(geometryToSvg.toKeptGeometry());
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
            
            console.log("Gcode generation ran");
            
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
        case "getPathsList":
            const listedFiles = await listFiles();
            const inThisProject = listedFiles.filter((path) => path.startsWith(message.prefacePath));
            return inThisProject
            break;
        case "deletePath":
            deleteFile({}, message.path);
            return 1
            break;
        case "display":
            console.log("Displaying path: " + message.readPath);
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

onmessage = ({
  data
}) => messageBootQueue.push(data);

const bootstrap = async () => {
  
  const {
    ask,
    hear,
    tell
  } = createConversation({
    agent,
    say
  });
  self.ask = ask;
  self.tell = tell; 
  
  await boot();

  onmessage = ({
    data
  }) => {
      if(typeof(data) == "object"){
        hear(data); // Now that we're ready, drain the buffer.
      }
  }


  if (self.messageBootQueue !== undefined) {
    while (self.messageBootQueue.length > 0) {
      hear(self.messageBootQueue.shift());
    }
  }

  while (messageBootQueue.length > 0) {
    hear(messageBootQueue.shift());
  }

  if (onmessage === undefined) throw Error('die');
};

bootstrap();

