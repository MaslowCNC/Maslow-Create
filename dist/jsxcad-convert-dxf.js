import { translate, scale, toKeptGeometry, getNonVoidPaths, getPathEdges } from './jsxcad-geometry.js';
import { fromAngleRadians } from './jsxcad-math-vec2.js';
import { toTagFromRgbInt } from './jsxcad-algorithm-color.js';

/**
 * DxfArrayScanner
 *
 * Based off the AutoCad 2012 DXF Reference
 * http://images.autodesk.com/adsk/files/autocad_2012_pdf_dxf-reference_enu.pdf
 *
 * Reads through an array representing lines of a dxf file. Takes an array and
 * provides an easy interface to extract group code and value pairs.
 * @param data - an array where each element represents a line in the dxf file
 * @constructor
 */
class DxfArrayScanner {
    constructor(data) {
        this._pointer = 0;
        this._eof = false;
        this._data = data;
    }
    /**
     * Gets the next group (code, value) from the array. A group is two consecutive elements
     * in the array. The first is the code, the second is the value.
     * @returns {{code: Number}|*}
     */
    next() {
        if (!this.hasNext()) {
            if (!this._eof)
                throw new Error('Unexpected end of input: EOF group not read before end of file. Ended on code ' + this._data[this._pointer]);
            else
                throw new Error('Cannot call \'next\' after EOF group has been read');
        }
        const group = {
            code: parseInt(this._data[this._pointer])
        };
        this._pointer++;
        group.value = parseGroupValue(group.code, this._data[this._pointer].trim());
        this._pointer++;
        if (group.code === 0 && group.value === 'EOF')
            this._eof = true;
        this.lastReadGroup = group;
        return group;
    }
    peek() {
        if (!this.hasNext()) {
            if (!this._eof)
                throw new Error('Unexpected end of input: EOF group not read before end of file. Ended on code ' + this._data[this._pointer]);
            else
                throw new Error('Cannot call \'next\' after EOF group has been read');
        }
        const group = {
            code: parseInt(this._data[this._pointer])
        };
        group.value = parseGroupValue(group.code, this._data[this._pointer + 1].trim());
        return group;
    }
    rewind(numberOfGroups = 1) {
        this._pointer = this._pointer - numberOfGroups * 2;
    }
    /**
     * Returns true if there is another code/value pair (2 elements in the array).
     * @returns {boolean}
     */
    hasNext() {
        // Check if we have read EOF group code
        if (this._eof) {
            return false;
        }
        // We need to be sure there are two lines available
        if (this._pointer > this._data.length - 2) {
            return false;
        }
        return true;
    }
    /**
     * Returns true if the scanner is at the end of the array
     * @returns {boolean}
     */
    isEOF() {
        return this._eof;
    }
}
/**
 * Parse a value to its proper type.
 * See pages 3 - 10 of the AutoCad DXF 2012 reference given at the top of this file
 *
 * @param code
 * @param value
 * @returns {*}
 */
function parseGroupValue(code, value) {
    if (code <= 9)
        return value;
    if (code >= 10 && code <= 59)
        return parseFloat(value);
    if (code >= 60 && code <= 99)
        return parseInt(value);
    if (code >= 100 && code <= 109)
        return value;
    if (code >= 110 && code <= 149)
        return parseFloat(value);
    if (code >= 160 && code <= 179)
        return parseInt(value);
    if (code >= 210 && code <= 239)
        return parseFloat(value);
    if (code >= 270 && code <= 289)
        return parseInt(value);
    if (code >= 290 && code <= 299)
        return parseBoolean(value);
    if (code >= 300 && code <= 369)
        return value;
    if (code >= 370 && code <= 389)
        return parseInt(value);
    if (code >= 390 && code <= 399)
        return value;
    if (code >= 400 && code <= 409)
        return parseInt(value);
    if (code >= 410 && code <= 419)
        return value;
    if (code >= 420 && code <= 429)
        return parseInt(value);
    if (code >= 430 && code <= 439)
        return value;
    if (code >= 440 && code <= 459)
        return parseInt(value);
    if (code >= 460 && code <= 469)
        return parseFloat(value);
    if (code >= 470 && code <= 481)
        return value;
    if (code === 999)
        return value;
    if (code >= 1000 && code <= 1009)
        return value;
    if (code >= 1010 && code <= 1059)
        return parseFloat(value);
    if (code >= 1060 && code <= 1071)
        return parseInt(value);
    console.log('WARNING: Group code does not have a defined type: %j', { code: code, value: value });
    return value;
}
/**
 * Parse a boolean according to a 1 or 0 value
 * @param str
 * @returns {boolean}
 */
function parseBoolean(str) {
    if (str === '0')
        return false;
    if (str === '1')
        return true;
    throw TypeError('String \'' + str + '\' cannot be cast to Boolean type');
}

/**
 * AutoCad files sometimes use an indexed color value between 1 and 255 inclusive.
 * Each value corresponds to a color. index 1 is red, that is 16711680 or 0xFF0000.
 * index 0 and 256, while included in this array, are actually reserved for inheritance
 * values in AutoCad so they should not be used for index color lookups.
 */
var AUTO_CAD_COLOR_INDEX = [
    0,
    16711680,
    16776960,
    65280,
    65535,
    255,
    16711935,
    16777215,
    8421504,
    12632256,
    16711680,
    16744319,
    13369344,
    13395558,
    10027008,
    10046540,
    8323072,
    8339263,
    4980736,
    4990502,
    16727808,
    16752511,
    13382400,
    13401958,
    10036736,
    10051404,
    8331008,
    8343359,
    4985600,
    4992806,
    16744192,
    16760703,
    13395456,
    13408614,
    10046464,
    10056268,
    8339200,
    8347455,
    4990464,
    4995366,
    16760576,
    16768895,
    13408512,
    13415014,
    10056192,
    10061132,
    8347392,
    8351551,
    4995328,
    4997670,
    16776960,
    16777087,
    13421568,
    13421670,
    10000384,
    10000460,
    8355584,
    8355647,
    5000192,
    5000230,
    12582656,
    14679935,
    10079232,
    11717734,
    7510016,
    8755276,
    6258432,
    7307071,
    3755008,
    4344870,
    8388352,
    12582783,
    6736896,
    10079334,
    5019648,
    7510092,
    4161280,
    6258495,
    2509824,
    3755046,
    4194048,
    10485631,
    3394560,
    8375398,
    2529280,
    6264908,
    2064128,
    5209919,
    1264640,
    3099686,
    65280,
    8388479,
    52224,
    6736998,
    38912,
    5019724,
    32512,
    4161343,
    19456,
    2509862,
    65343,
    8388511,
    52275,
    6737023,
    38950,
    5019743,
    32543,
    4161359,
    19475,
    2509871,
    65407,
    8388543,
    52326,
    6737049,
    38988,
    5019762,
    32575,
    4161375,
    19494,
    2509881,
    65471,
    8388575,
    52377,
    6737074,
    39026,
    5019781,
    32607,
    4161391,
    19513,
    2509890,
    65535,
    8388607,
    52428,
    6737100,
    39064,
    5019800,
    32639,
    4161407,
    19532,
    2509900,
    49151,
    8380415,
    39372,
    6730444,
    29336,
    5014936,
    24447,
    4157311,
    14668,
    2507340,
    32767,
    8372223,
    26316,
    6724044,
    19608,
    5010072,
    16255,
    4153215,
    9804,
    2505036,
    16383,
    8364031,
    13260,
    6717388,
    9880,
    5005208,
    8063,
    4149119,
    4940,
    2502476,
    255,
    8355839,
    204,
    6710988,
    152,
    5000344,
    127,
    4145023,
    76,
    2500172,
    4129023,
    10452991,
    3342540,
    8349388,
    2490520,
    6245528,
    2031743,
    5193599,
    1245260,
    3089996,
    8323327,
    12550143,
    6684876,
    10053324,
    4980888,
    7490712,
    4128895,
    6242175,
    2490444,
    3745356,
    12517631,
    14647295,
    10027212,
    11691724,
    7471256,
    8735896,
    6226047,
    7290751,
    3735628,
    4335180,
    16711935,
    16744447,
    13369548,
    13395660,
    9961624,
    9981080,
    8323199,
    8339327,
    4980812,
    4990540,
    16711871,
    16744415,
    13369497,
    13395634,
    9961586,
    9981061,
    8323167,
    8339311,
    4980793,
    4990530,
    16711807,
    16744383,
    13369446,
    13395609,
    9961548,
    9981042,
    8323135,
    8339295,
    4980774,
    4990521,
    16711743,
    16744351,
    13369395,
    13395583,
    9961510,
    9981023,
    8323103,
    8339279,
    4980755,
    4990511,
    3355443,
    5987163,
    8684676,
    11382189,
    14079702,
    16777215
];

/**
 * Returns the truecolor value of the given AutoCad color index value
 * @return {Number} truecolor value as a number
 */
function getAcadColor$1(index) {
    return AUTO_CAD_COLOR_INDEX[index];
}
/**
 * Parses the 2D or 3D coordinate, vector, or point. When complete,
 * the scanner remains on the last group of the coordinate.
 * @param {*} scanner
 */
function parsePoint(scanner) {
    const point = {};
    // Reread group for the first coordinate
    scanner.rewind();
    let curr = scanner.next();
    let code = curr.code;
    point.x = curr.value;
    code += 10;
    curr = scanner.next();
    if (curr.code != code)
        throw new Error('Expected code for point value to be ' + code +
            ' but got ' + curr.code + '.');
    point.y = curr.value;
    code += 10;
    curr = scanner.next();
    if (curr.code != code) {
        // Only the x and y are specified. Don't read z.
        scanner.rewind(); // Let the calling code advance off the point
        return point;
    }
    point.z = curr.value;
    return point;
}
/**
 * Attempts to parse codes common to all entities. Returns true if the group
 * was handled by this function.
 * @param {*} entity - the entity currently being parsed
 * @param {*} curr - the current group being parsed
 */
function checkCommonEntityProperties(entity, curr, scanner) {
    switch (curr.code) {
        case 0:
            entity.type = curr.value;
            break;
        case 5:
            entity.handle = curr.value;
            break;
        case 6:
            entity.lineType = curr.value;
            break;
        case 8: // Layer name
            entity.layer = curr.value;
            break;
        case 48:
            entity.lineTypeScale = curr.value;
            break;
        case 60:
            entity.visible = curr.value === 0;
            break;
        case 62: // Acad Index Color. 0 inherits ByBlock. 256 inherits ByLayer. Default is bylayer
            entity.colorIndex = curr.value;
            entity.color = getAcadColor$1(Math.abs(curr.value));
            break;
        case 67:
            entity.inPaperSpace = curr.value !== 0;
            break;
        case 100:
            //ignore
            break;
        case 101: // Embedded Object in ACAD 2018.
            // See https://ezdxf.readthedocs.io/en/master/dxfinternals/dxftags.html#embedded-objects
            while (curr.code != 0) {
                curr = scanner.next();
            }
            scanner.rewind();
            break;
        case 330:
            entity.ownerHandle = curr.value;
            break;
        case 347:
            entity.materialObjectHandle = curr.value;
            break;
        case 370:
            //From https://www.woutware.com/Forum/Topic/955/lineweight?returnUrl=%2FForum%2FUserPosts%3FuserId%3D478262319
            // An integer representing 100th of mm, must be one of the following values:
            // 0, 5, 9, 13, 15, 18, 20, 25, 30, 35, 40, 50, 53, 60, 70, 80, 90, 100, 106, 120, 140, 158, 200, 211.
            // -3 = STANDARD, -2 = BYLAYER, -1 = BYBLOCK
            entity.lineweight = curr.value;
            break;
        case 420: // TrueColor Color
            entity.color = curr.value;
            break;
        case 1000:
            entity.extendedData = entity.extendedData || {};
            entity.extendedData.customStrings = entity.extendedData.customStrings || [];
            entity.extendedData.customStrings.push(curr.value);
            break;
        case 1001:
            entity.extendedData = entity.extendedData || {};
            entity.extendedData.applicationName = curr.value;
            break;
        default:
            return false;
    }
    return true;
}

class ThreeDface {
    constructor() {
        this.ForEntityName = '3DFACE';
    }
    parseEntity(scanner, curr) {
        const entity = { type: curr.value, vertices: [] };
        curr = scanner.next();
        while (!scanner.isEOF()) {
            if (curr.code === 0)
                break;
            switch (curr.code) {
                case 70: // 1 = Closed shape, 128 = plinegen?, 0 = default
                    entity.shape = ((curr.value & 1) === 1);
                    entity.hasContinuousLinetypePattern = ((curr.value & 128) === 128);
                    break;
                case 10: // X coordinate of point
                    entity.vertices = parse3dFaceVertices(scanner, curr);
                    curr = scanner.lastReadGroup;
                    break;
                default:
                    checkCommonEntityProperties(entity, curr, scanner);
                    break;
            }
            curr = scanner.next();
        }
        return entity;
    }
}
function parse3dFaceVertices(scanner, curr) {
    var vertices = [];
    var vertexIsStarted = false;
    var vertexIsFinished = false;
    var verticesPer3dFace = 4; // there can be up to four vertices per face, although 3 is most used for TIN
    for (let i = 0; i <= verticesPer3dFace; i++) {
        var vertex = {};
        while (!scanner.isEOF()) {
            if (curr.code === 0 || vertexIsFinished)
                break;
            switch (curr.code) {
                case 10: // X0
                case 11: // X1
                case 12: // X2
                case 13: // X3
                    if (vertexIsStarted) {
                        vertexIsFinished = true;
                        continue;
                    }
                    vertex.x = curr.value;
                    vertexIsStarted = true;
                    break;
                case 20: // Y
                case 21:
                case 22:
                case 23:
                    vertex.y = curr.value;
                    break;
                case 30: // Z
                case 31:
                case 32:
                case 33:
                    vertex.z = curr.value;
                    break;
                default:
                    // it is possible to have entity codes after the vertices.  
                    // So if code is not accounted for return to entity parser where it might be accounted for
                    return vertices;
            }
            curr = scanner.next();
        }
        // See https://groups.google.com/forum/#!topic/comp.cad.autocad/9gn8s5O_w6E
        vertices.push(vertex);
        vertexIsStarted = false;
        vertexIsFinished = false;
    }
    scanner.rewind();
    return vertices;
}

class Arc$1 {
    constructor() {
        this.ForEntityName = 'ARC';
    }
    parseEntity(scanner, curr) {
        const entity = { type: curr.value };
        curr = scanner.next();
        while (!scanner.isEOF()) {
            if (curr.code === 0)
                break;
            switch (curr.code) {
                case 10: // X coordinate of point
                    entity.center = parsePoint(scanner);
                    break;
                case 40: // radius
                    entity.radius = curr.value;
                    break;
                case 50: // start angle
                    entity.startAngle = Math.PI / 180 * curr.value;
                    break;
                case 51: // end angle
                    entity.endAngle = Math.PI / 180 * curr.value;
                    entity.angleLength = entity.endAngle - entity.startAngle; // angleLength is deprecated
                    break;
                case 210:
                    entity.extrusionDirectionX = curr.value;
                    break;
                case 220:
                    entity.extrusionDirectionY = curr.value;
                    break;
                case 230:
                    entity.extrusionDirectionZ = curr.value;
                    break;
                default: // ignored attribute
                    checkCommonEntityProperties(entity, curr, scanner);
                    break;
            }
            curr = scanner.next();
        }
        return entity;
    }
}

class Attdef {
    constructor() {
        this.ForEntityName = 'ATTDEF';
    }
    parseEntity(scanner, curr) {
        var entity = {
            type: curr.value,
            scale: 1,
            textStyle: 'STANDARD'
        };
        curr = scanner.next();
        while (!scanner.isEOF()) {
            if (curr.code === 0) {
                break;
            }
            switch (curr.code) {
                case 1:
                    entity.text = curr.value;
                    break;
                case 2:
                    entity.tag = curr.value;
                    break;
                case 3:
                    entity.prompt = curr.value;
                    break;
                case 7:
                    entity.textStyle = curr.value;
                    break;
                case 10: // X coordinate of 'first alignment point'
                    entity.startPoint = parsePoint(scanner);
                    break;
                case 11: // X coordinate of 'second alignment point'
                    entity.endPoint = parsePoint(scanner);
                    break;
                case 39:
                    entity.thickness = curr.value;
                    break;
                case 40:
                    entity.textHeight = curr.value;
                    break;
                case 41:
                    entity.scale = curr.value;
                    break;
                case 50:
                    entity.rotation = curr.value;
                    break;
                case 51:
                    entity.obliqueAngle = curr.value;
                    break;
                case 70:
                    entity.invisible = !!(curr.value & 0x01);
                    entity.constant = !!(curr.value & 0x02);
                    entity.verificationRequired = !!(curr.value & 0x04);
                    entity.preset = !!(curr.value & 0x08);
                    break;
                case 71:
                    entity.backwards = !!(curr.value & 0x02);
                    entity.mirrored = !!(curr.value & 0x04);
                    break;
                case 72:
                    // TODO: enum values?
                    entity.horizontalJustification = curr.value;
                    break;
                case 73:
                    entity.fieldLength = curr.value;
                    break;
                case 74:
                    // TODO: enum values?
                    entity.verticalJustification = curr.value;
                    break;
                case 100:
                    break;
                case 210:
                    entity.extrusionDirectionX = curr.value;
                    break;
                case 220:
                    entity.extrusionDirectionY = curr.value;
                    break;
                case 230:
                    entity.extrusionDirectionZ = curr.value;
                    break;
                default:
                    checkCommonEntityProperties(entity, curr, scanner);
                    break;
            }
            curr = scanner.next();
        }
        return entity;
    }
}

class Circle$1 {
    constructor() {
        this.ForEntityName = 'CIRCLE';
    }
    parseEntity(scanner, curr) {
        const entity = { type: curr.value };
        curr = scanner.next();
        while (!scanner.isEOF()) {
            if (curr.code === 0)
                break;
            switch (curr.code) {
                case 10: // X coordinate of point
                    entity.center = parsePoint(scanner);
                    break;
                case 40: // radius
                    entity.radius = curr.value;
                    break;
                case 50: // start angle
                    entity.startAngle = Math.PI / 180 * curr.value;
                    break;
                case 51: // end angle
                    const endAngle = Math.PI / 180 * curr.value;
                    if (endAngle < entity.startAngle)
                        entity.angleLength = endAngle + 2 * Math.PI - entity.startAngle;
                    else
                        entity.angleLength = endAngle - entity.startAngle;
                    entity.endAngle = endAngle;
                    break;
                default: // ignored attribute
                    checkCommonEntityProperties(entity, curr, scanner);
                    break;
            }
            curr = scanner.next();
        }
        return entity;
    }
}

class Dimension {
    constructor() {
        this.ForEntityName = 'DIMENSION';
    }
    parseEntity(scanner, curr) {
        const entity = { type: curr.value };
        curr = scanner.next();
        while (!scanner.isEOF()) {
            if (curr.code === 0)
                break;
            switch (curr.code) {
                case 2: // Referenced block name
                    entity.block = curr.value;
                    break;
                case 10: // X coordinate of 'first alignment point'
                    entity.anchorPoint = parsePoint(scanner);
                    break;
                case 11:
                    entity.middleOfText = parsePoint(scanner);
                    break;
                case 12: // Insertion point for clones of a dimension
                    entity.insertionPoint = parsePoint(scanner);
                    break;
                case 13: // Definition point for linear and angular dimensions 
                    entity.linearOrAngularPoint1 = parsePoint(scanner);
                    break;
                case 14: // Definition point for linear and angular dimensions 
                    entity.linearOrAngularPoint2 = parsePoint(scanner);
                    break;
                case 15: // Definition point for diameter, radius, and angular dimensions
                    entity.diameterOrRadiusPoint = parsePoint(scanner);
                    break;
                case 16: // Point defining dimension arc for angular dimensions
                    entity.arcPoint = parsePoint(scanner);
                    break;
                case 70: // Dimension type
                    entity.dimensionType = curr.value;
                    break;
                case 71: // 5 = Middle center
                    entity.attachmentPoint = curr.value;
                    break;
                case 42: // Actual measurement
                    entity.actualMeasurement = curr.value;
                    break;
                case 1: // Text entered by user explicitly
                    entity.text = curr.value;
                    break;
                case 50: // Angle of rotated, horizontal, or vertical dimensions
                    entity.angle = curr.value;
                    break;
                default: // check common entity attributes
                    checkCommonEntityProperties(entity, curr, scanner);
                    break;
            }
            curr = scanner.next();
        }
        return entity;
    }
}

class Ellipse$1 {
    constructor() {
        this.ForEntityName = 'ELLIPSE';
    }
    parseEntity(scanner, curr) {
        const entity = { type: curr.value };
        curr = scanner.next();
        while (!scanner.isEOF()) {
            if (curr.code === 0)
                break;
            switch (curr.code) {
                case 10:
                    entity.center = parsePoint(scanner);
                    break;
                case 11:
                    entity.majorAxisEndPoint = parsePoint(scanner);
                    break;
                case 40:
                    entity.axisRatio = curr.value;
                    break;
                case 41:
                    entity.startAngle = curr.value;
                    break;
                case 42:
                    entity.endAngle = curr.value;
                    break;
                case 2:
                    entity.name = curr.value;
                    break;
                default: // check common entity attributes
                    checkCommonEntityProperties(entity, curr, scanner);
                    break;
            }
            curr = scanner.next();
        }
        return entity;
    }
}

class Insert {
    constructor() {
        this.ForEntityName = 'INSERT';
    }
    parseEntity(scanner, curr) {
        const entity = { type: curr.value };
        curr = scanner.next();
        while (!scanner.isEOF()) {
            if (curr.code === 0)
                break;
            switch (curr.code) {
                case 2:
                    entity.name = curr.value;
                    break;
                case 41:
                    entity.xScale = curr.value;
                    break;
                case 42:
                    entity.yScale = curr.value;
                    break;
                case 43:
                    entity.zScale = curr.value;
                    break;
                case 10:
                    entity.position = parsePoint(scanner);
                    break;
                case 50:
                    entity.rotation = curr.value;
                    break;
                case 70:
                    entity.columnCount = curr.value;
                    break;
                case 71:
                    entity.rowCount = curr.value;
                    break;
                case 44:
                    entity.columnSpacing = curr.value;
                    break;
                case 45:
                    entity.rowSpacing = curr.value;
                    break;
                case 210:
                    entity.extrusionDirection = parsePoint(scanner);
                    break;
                default: // check common entity attributes
                    checkCommonEntityProperties(entity, curr, scanner);
                    break;
            }
            curr = scanner.next();
        }
        return entity;
    }
}

class Line$1 {
    constructor() {
        this.ForEntityName = 'LINE';
    }
    parseEntity(scanner, curr) {
        const entity = { type: curr.value, vertices: [] };
        curr = scanner.next();
        while (!scanner.isEOF()) {
            if (curr.code === 0)
                break;
            switch (curr.code) {
                case 10: // X coordinate of point
                    entity.vertices.unshift(parsePoint(scanner));
                    break;
                case 11:
                    entity.vertices.push(parsePoint(scanner));
                    break;
                case 210:
                    entity.extrusionDirection = parsePoint(scanner);
                    break;
                case 100:
                    break;
                default:
                    checkCommonEntityProperties(entity, curr, scanner);
                    break;
            }
            curr = scanner.next();
        }
        return entity;
    }
}

class Lwpolyline {
    constructor() {
        this.ForEntityName = 'LWPOLYLINE';
    }
    parseEntity(scanner, curr) {
        const entity = { type: curr.value, vertices: [] };
        let numberOfVertices = 0;
        curr = scanner.next();
        while (!scanner.isEOF()) {
            if (curr.code === 0)
                break;
            switch (curr.code) {
                case 38:
                    entity.elevation = curr.value;
                    break;
                case 39:
                    entity.depth = curr.value;
                    break;
                case 70: // 1 = Closed shape, 128 = plinegen?, 0 = default
                    entity.shape = ((curr.value & 1) === 1);
                    entity.hasContinuousLinetypePattern = ((curr.value & 128) === 128);
                    break;
                case 90:
                    numberOfVertices = curr.value;
                    break;
                case 10: // X coordinate of point
                    entity.vertices = parseLWPolylineVertices(numberOfVertices, scanner);
                    break;
                case 43:
                    if (curr.value !== 0)
                        entity.width = curr.value;
                    break;
                case 210:
                    entity.extrusionDirectionX = curr.value;
                    break;
                case 220:
                    entity.extrusionDirectionY = curr.value;
                    break;
                case 230:
                    entity.extrusionDirectionZ = curr.value;
                    break;
                default:
                    checkCommonEntityProperties(entity, curr, scanner);
                    break;
            }
            curr = scanner.next();
        }
        return entity;
    }
}
function parseLWPolylineVertices(n, scanner) {
    if (!n || n <= 0)
        throw Error('n must be greater than 0 verticies');
    const vertices = [];
    let vertexIsStarted = false;
    let vertexIsFinished = false;
    let curr = scanner.lastReadGroup;
    for (let i = 0; i < n; i++) {
        const vertex = {};
        while (!scanner.isEOF()) {
            if (curr.code === 0 || vertexIsFinished)
                break;
            switch (curr.code) {
                case 10: // X
                    if (vertexIsStarted) {
                        vertexIsFinished = true;
                        continue;
                    }
                    vertex.x = curr.value;
                    vertexIsStarted = true;
                    break;
                case 20: // Y
                    vertex.y = curr.value;
                    break;
                case 30: // Z
                    vertex.z = curr.value;
                    break;
                case 40: // start width
                    vertex.startWidth = curr.value;
                    break;
                case 41: // end width
                    vertex.endWidth = curr.value;
                    break;
                case 42: // bulge
                    if (curr.value != 0)
                        vertex.bulge = curr.value;
                    break;
                default:
                    // if we do not hit known code return vertices.  Code might belong to entity
                    scanner.rewind();
                    if (vertexIsStarted) {
                        vertices.push(vertex);
                    }
                    scanner.rewind();
                    return vertices;
            }
            curr = scanner.next();
        }
        // See https://groups.google.com/forum/#!topic/comp.cad.autocad/9gn8s5O_w6E
        vertices.push(vertex);
        vertexIsStarted = false;
        vertexIsFinished = false;
    }
    scanner.rewind();
    return vertices;
}

class Mtext {
    constructor() {
        this.ForEntityName = 'MTEXT';
    }
    parseEntity(scanner, curr) {
        const entity = { type: curr.value };
        curr = scanner.next();
        while (!scanner.isEOF()) {
            if (curr.code === 0)
                break;
            switch (curr.code) {
                case 3:
                    entity.text ? entity.text += curr.value : entity.text = curr.value;
                    break;
                case 1:
                    entity.text ? entity.text += curr.value : entity.text = curr.value;
                    break;
                case 10:
                    entity.position = parsePoint(scanner);
                    break;
                case 11:
                    entity.directionVector = parsePoint(scanner);
                    break;
                case 40:
                    //Note: this is the text height
                    entity.height = curr.value;
                    break;
                case 41:
                    entity.width = curr.value;
                    break;
                case 50:
                    entity.rotation = curr.value;
                    break;
                case 71:
                    entity.attachmentPoint = curr.value;
                    break;
                case 72:
                    entity.drawingDirection = curr.value;
                    break;
                default:
                    checkCommonEntityProperties(entity, curr, scanner);
                    break;
            }
            curr = scanner.next();
        }
        return entity;
    }
}

class Point$1 {
    constructor() {
        this.ForEntityName = 'POINT';
    }
    parseEntity(scanner, curr) {
        const type = curr.value;
        const entity = { type };
        curr = scanner.next();
        while (!scanner.isEOF()) {
            if (curr.code === 0)
                break;
            switch (curr.code) {
                case 10:
                    entity.position = parsePoint(scanner);
                    break;
                case 39:
                    entity.thickness = curr.value;
                    break;
                case 210:
                    entity.extrusionDirection = parsePoint(scanner);
                    break;
                case 100:
                    break;
                default: // check common entity attributes
                    checkCommonEntityProperties(entity, curr, scanner);
                    break;
            }
            curr = scanner.next();
        }
        return entity;
    }
}

class Vertex {
    constructor() {
        this.ForEntityName = 'VERTEX';
    }
    parseEntity(scanner, curr) {
        var entity = { type: curr.value };
        curr = scanner.next();
        while (!scanner.isEOF()) {
            if (curr.code === 0)
                break;
            switch (curr.code) {
                case 10: // X
                    entity.x = curr.value;
                    break;
                case 20: // Y
                    entity.y = curr.value;
                    break;
                case 30: // Z
                    entity.z = curr.value;
                    break;
                case 40: // start width
                    break;
                case 41: // end width
                    break;
                case 42: // bulge
                    if (curr.value != 0)
                        entity.bulge = curr.value;
                    break;
                case 70: // flags
                    entity.curveFittingVertex = (curr.value & 1) !== 0;
                    entity.curveFitTangent = (curr.value & 2) !== 0;
                    entity.splineVertex = (curr.value & 8) !== 0;
                    entity.splineControlPoint = (curr.value & 16) !== 0;
                    entity.threeDPolylineVertex = (curr.value & 32) !== 0;
                    entity.threeDPolylineMesh = (curr.value & 64) !== 0;
                    entity.polyfaceMeshVertex = (curr.value & 128) !== 0;
                    break;
                case 50: // curve fit tangent direction
                    break;
                case 71: // polyface mesh vertex index
                    entity.faceA = curr.value;
                    break;
                case 72: // polyface mesh vertex index
                    entity.faceB = curr.value;
                    break;
                case 73: // polyface mesh vertex index
                    entity.faceC = curr.value;
                    break;
                case 74: // polyface mesh vertex index
                    entity.faceD = curr.value;
                    break;
                default:
                    checkCommonEntityProperties(entity, curr, scanner);
                    break;
            }
            curr = scanner.next();
        }
        return entity;
    }
}

class Polyline$1 {
    constructor() {
        this.ForEntityName = 'POLYLINE';
    }
    parseEntity(scanner, curr) {
        var entity = { type: curr.value, vertices: [] };
        curr = scanner.next();
        while (!scanner.isEOF()) {
            if (curr.code === 0)
                break;
            switch (curr.code) {
                case 10: // always 0
                    break;
                case 20: // always 0
                    break;
                case 30: // elevation
                    break;
                case 39: // thickness
                    entity.thickness = curr.value;
                    break;
                case 40: // start width
                    break;
                case 41: // end width
                    break;
                case 70:
                    entity.shape = (curr.value & 1) !== 0;
                    entity.includesCurveFitVertices = (curr.value & 2) !== 0;
                    entity.includesSplineFitVertices = (curr.value & 4) !== 0;
                    entity.is3dPolyline = (curr.value & 8) !== 0;
                    entity.is3dPolygonMesh = (curr.value & 16) !== 0;
                    entity.is3dPolygonMeshClosed = (curr.value & 32) !== 0; // 32 = The polygon mesh is closed in the N direction
                    entity.isPolyfaceMesh = (curr.value & 64) !== 0;
                    entity.hasContinuousLinetypePattern = (curr.value & 128) !== 0;
                    break;
                case 71: // Polygon mesh M vertex count
                    break;
                case 72: // Polygon mesh N vertex count
                    break;
                case 73: // Smooth surface M density
                    break;
                case 74: // Smooth surface N density
                    break;
                case 75: // Curves and smooth surface type
                    break;
                case 210:
                    entity.extrusionDirection = parsePoint(scanner);
                    break;
                default:
                    checkCommonEntityProperties(entity, curr, scanner);
                    break;
            }
            curr = scanner.next();
        }
        entity.vertices = parsePolylineVertices(scanner, curr);
        return entity;
    }
}
function parsePolylineVertices(scanner, curr) {
    const vertexParser = new Vertex();
    const vertices = [];
    while (!scanner.isEOF()) {
        if (curr.code === 0) {
            if (curr.value === 'VERTEX') {
                vertices.push(vertexParser.parseEntity(scanner, curr));
                curr = scanner.lastReadGroup;
            }
            else if (curr.value === 'SEQEND') {
                parseSeqEnd(scanner, curr);
                break;
            }
        }
    }
    return vertices;
}
function parseSeqEnd(scanner, curr) {
    const entity = { type: curr.value };
    curr = scanner.next();
    while (!scanner.isEOF()) {
        if (curr.code == 0)
            break;
        checkCommonEntityProperties(entity, curr, scanner);
        curr = scanner.next();
    }
    return entity;
}

class Solid {
    constructor() {
        this.ForEntityName = 'SOLID';
    }
    parseEntity(scanner, curr) {
        const entity = { type: curr.value, points: [] };
        curr = scanner.next();
        while (!scanner.isEOF()) {
            if (curr.code === 0)
                break;
            switch (curr.code) {
                case 10:
                    entity.points[0] = parsePoint(scanner);
                    break;
                case 11:
                    entity.points[1] = parsePoint(scanner);
                    break;
                case 12:
                    entity.points[2] = parsePoint(scanner);
                    break;
                case 13:
                    entity.points[3] = parsePoint(scanner);
                    break;
                case 210:
                    entity.extrusionDirection = parsePoint(scanner);
                    break;
                default: // check common entity attributes
                    checkCommonEntityProperties(entity, curr, scanner);
                    break;
            }
            curr = scanner.next();
        }
        return entity;
    }
}

class Spline$1 {
    constructor() {
        this.ForEntityName = 'SPLINE';
    }
    parseEntity(scanner, curr) {
        const entity = { type: curr.value };
        curr = scanner.next();
        while (!scanner.isEOF()) {
            if (curr.code === 0)
                break;
            switch (curr.code) {
                case 10:
                    if (!entity.controlPoints)
                        entity.controlPoints = [];
                    entity.controlPoints.push(parsePoint(scanner));
                    break;
                case 11:
                    if (!entity.fitPoints)
                        entity.fitPoints = [];
                    entity.fitPoints.push(parsePoint(scanner));
                    break;
                case 12:
                    entity.startTangent = parsePoint(scanner);
                    break;
                case 13:
                    entity.endTangent = parsePoint(scanner);
                    break;
                case 40:
                    if (!entity.knotValues)
                        entity.knotValues = [];
                    entity.knotValues.push(curr.value);
                    break;
                case 70:
                    if ((curr.value & 1) != 0)
                        entity.closed = true;
                    if ((curr.value & 2) != 0)
                        entity.periodic = true;
                    if ((curr.value & 4) != 0)
                        entity.rational = true;
                    if ((curr.value & 8) != 0)
                        entity.planar = true;
                    if ((curr.value & 16) != 0) {
                        entity.planar = true;
                        entity.linear = true;
                    }
                    break;
                case 71:
                    entity.degreeOfSplineCurve = curr.value;
                    break;
                case 72:
                    entity.numberOfKnots = curr.value;
                    break;
                case 73:
                    entity.numberOfControlPoints = curr.value;
                    break;
                case 74:
                    entity.numberOfFitPoints = curr.value;
                    break;
                case 210:
                    entity.normalVector = parsePoint(scanner);
                    break;
                default:
                    checkCommonEntityProperties(entity, curr, scanner);
                    break;
            }
            curr = scanner.next();
        }
        return entity;
    }
}

class Text$1 {
    constructor() {
        this.ForEntityName = 'TEXT';
    }
    parseEntity(scanner, curr) {
        const entity = { type: curr.value };
        curr = scanner.next();
        while (!scanner.isEOF()) {
            if (curr.code === 0)
                break;
            switch (curr.code) {
                case 10: // X coordinate of 'first alignment point'
                    entity.startPoint = parsePoint(scanner);
                    break;
                case 11: // X coordinate of 'second alignment point'
                    entity.endPoint = parsePoint(scanner);
                    break;
                case 40: // Text height
                    entity.textHeight = curr.value;
                    break;
                case 41:
                    entity.xScale = curr.value;
                    break;
                case 50: // Rotation in degrees
                    entity.rotation = curr.value;
                    break;
                case 1: // Text
                    entity.text = curr.value;
                    break;
                // NOTE: 72 and 73 are meaningless without 11 (second alignment point)
                case 72: // Horizontal alignment
                    entity.halign = curr.value;
                    break;
                case 73: // Vertical alignment
                    entity.valign = curr.value;
                    break;
                default: // check common entity attributes
                    checkCommonEntityProperties(entity, curr, scanner);
                    break;
            }
            curr = scanner.next();
        }
        return entity;
    }
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var loglevel = createCommonjsModule(function (module) {
/*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/
(function (root, definition) {
    if (module.exports) {
        module.exports = definition();
    } else {
        root.log = definition();
    }
}(commonjsGlobal, function () {

    // Slightly dubious tricks to cut down minimized file size
    var noop = function() {};
    var undefinedType = "undefined";
    var isIE = (typeof window !== undefinedType) && (typeof window.navigator !== undefinedType) && (
        /Trident\/|MSIE /.test(window.navigator.userAgent)
    );

    var logMethods = [
        "trace",
        "debug",
        "info",
        "warn",
        "error"
    ];

    // Cross-browser bind equivalent that works at least back to IE6
    function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') {
            return method.bind(obj);
        } else {
            try {
                return Function.prototype.bind.call(method, obj);
            } catch (e) {
                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                return function() {
                    return Function.prototype.apply.apply(method, [obj, arguments]);
                };
            }
        }
    }

    // Trace() doesn't print the message in IE, so for that case we need to wrap it
    function traceForIE() {
        if (console.log) {
            if (console.log.apply) {
                console.log.apply(console, arguments);
            } else {
                // In old IE, native console methods themselves don't have apply().
                Function.prototype.apply.apply(console.log, [console, arguments]);
            }
        }
        if (console.trace) console.trace();
    }

    // Build the best logging method possible for this env
    // Wherever possible we want to bind, not wrap, to preserve stack traces
    function realMethod(methodName) {
        if (methodName === 'debug') {
            methodName = 'log';
        }

        if (typeof console === undefinedType) {
            return false; // No method possible, for now - fixed later by enableLoggingWhenConsoleArrives
        } else if (methodName === 'trace' && isIE) {
            return traceForIE;
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

    // These private functions always need `this` to be set properly

    function replaceLoggingMethods(level, loggerName) {
        /*jshint validthis:true */
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            this[methodName] = (i < level) ?
                noop :
                this.methodFactory(methodName, level, loggerName);
        }

        // Define log.log as an alias for log.debug
        this.log = this.debug;
    }

    // In old IE versions, the console isn't present until you first open it.
    // We build realMethod() replacements here that regenerate logging methods
    function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
        return function () {
            if (typeof console !== undefinedType) {
                replaceLoggingMethods.call(this, level, loggerName);
                this[methodName].apply(this, arguments);
            }
        };
    }

    // By default, we use closely bound real methods wherever possible, and
    // otherwise we wait for a console to appear, and then try again.
    function defaultMethodFactory(methodName, level, loggerName) {
        /*jshint validthis:true */
        return realMethod(methodName) ||
               enableLoggingWhenConsoleArrives.apply(this, arguments);
    }

    function Logger(name, defaultLevel, factory) {
      var self = this;
      var currentLevel;
      defaultLevel = defaultLevel == null ? "WARN" : defaultLevel;

      var storageKey = "loglevel";
      if (typeof name === "string") {
        storageKey += ":" + name;
      } else if (typeof name === "symbol") {
        storageKey = undefined;
      }

      function persistLevelIfPossible(levelNum) {
          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

          if (typeof window === undefinedType || !storageKey) return;

          // Use localStorage if available
          try {
              window.localStorage[storageKey] = levelName;
              return;
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=" + levelName + ";";
          } catch (ignore) {}
      }

      function getPersistedLevel() {
          var storedLevel;

          if (typeof window === undefinedType || !storageKey) return;

          try {
              storedLevel = window.localStorage[storageKey];
          } catch (ignore) {}

          // Fallback to cookies if local storage gives us nothing
          if (typeof storedLevel === undefinedType) {
              try {
                  var cookie = window.document.cookie;
                  var location = cookie.indexOf(
                      encodeURIComponent(storageKey) + "=");
                  if (location !== -1) {
                      storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
                  }
              } catch (ignore) {}
          }

          // If the stored level is not valid, treat it as if nothing was stored.
          if (self.levels[storedLevel] === undefined) {
              storedLevel = undefined;
          }

          return storedLevel;
      }

      function clearPersistedLevel() {
          if (typeof window === undefinedType || !storageKey) return;

          // Use localStorage if available
          try {
              window.localStorage.removeItem(storageKey);
              return;
          } catch (ignore) {}

          // Use session cookie as fallback
          try {
              window.document.cookie =
                encodeURIComponent(storageKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
          } catch (ignore) {}
      }

      /*
       *
       * Public logger API - see https://github.com/pimterry/loglevel for details
       *
       */

      self.name = name;

      self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
          "ERROR": 4, "SILENT": 5};

      self.methodFactory = factory || defaultMethodFactory;

      self.getLevel = function () {
          return currentLevel;
      };

      self.setLevel = function (level, persist) {
          if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
              level = self.levels[level.toUpperCase()];
          }
          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
              currentLevel = level;
              if (persist !== false) {  // defaults to true
                  persistLevelIfPossible(level);
              }
              replaceLoggingMethods.call(self, level, name);
              if (typeof console === undefinedType && level < self.levels.SILENT) {
                  return "No console available for logging";
              }
          } else {
              throw "log.setLevel() called with invalid level: " + level;
          }
      };

      self.setDefaultLevel = function (level) {
          defaultLevel = level;
          if (!getPersistedLevel()) {
              self.setLevel(level, false);
          }
      };

      self.resetLevel = function () {
          self.setLevel(defaultLevel, false);
          clearPersistedLevel();
      };

      self.enableAll = function(persist) {
          self.setLevel(self.levels.TRACE, persist);
      };

      self.disableAll = function(persist) {
          self.setLevel(self.levels.SILENT, persist);
      };

      // Initialize with the right level
      var initialLevel = getPersistedLevel();
      if (initialLevel == null) {
          initialLevel = defaultLevel;
      }
      self.setLevel(initialLevel, false);
    }

    /*
     *
     * Top-level API
     *
     */

    var defaultLogger = new Logger();

    var _loggersByName = {};
    defaultLogger.getLogger = function getLogger(name) {
        if ((typeof name !== "symbol" && typeof name !== "string") || name === "") {
          throw new TypeError("You must supply a name when creating a logger.");
        }

        var logger = _loggersByName[name];
        if (!logger) {
          logger = _loggersByName[name] = new Logger(
            name, defaultLogger.getLevel(), defaultLogger.methodFactory);
        }
        return logger;
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window !== undefinedType) ? window.log : undefined;
    defaultLogger.noConflict = function() {
        if (typeof window !== undefinedType &&
               window.log === defaultLogger) {
            window.log = _log;
        }

        return defaultLogger;
    };

    defaultLogger.getLoggers = function getLoggers() {
        return _loggersByName;
    };

    // ES6 default export, for compatibility
    defaultLogger['default'] = defaultLogger;

    return defaultLogger;
}));
});

//log.setLevel('trace');
//log.setLevel('debug');
//log.setLevel('info');
//log.setLevel('warn');
loglevel.setLevel('error');
function registerDefaultEntityHandlers(dxfParser) {
    // Supported entities here (some entity code is still being refactored into this flow)
    dxfParser.registerEntityHandler(ThreeDface);
    dxfParser.registerEntityHandler(Arc$1);
    dxfParser.registerEntityHandler(Attdef);
    dxfParser.registerEntityHandler(Circle$1);
    dxfParser.registerEntityHandler(Dimension);
    dxfParser.registerEntityHandler(Ellipse$1);
    dxfParser.registerEntityHandler(Insert);
    dxfParser.registerEntityHandler(Line$1);
    dxfParser.registerEntityHandler(Lwpolyline);
    dxfParser.registerEntityHandler(Mtext);
    dxfParser.registerEntityHandler(Point$1);
    dxfParser.registerEntityHandler(Polyline$1);
    dxfParser.registerEntityHandler(Solid);
    dxfParser.registerEntityHandler(Spline$1);
    dxfParser.registerEntityHandler(Text$1);
    //dxfParser.registerEntityHandler(require('./entities/vertex'));
}
class DxfParser {
    constructor() {
        this._entityHandlers = {};
        registerDefaultEntityHandlers(this);
    }
    parse(source) {
        if (typeof source === 'string') {
            return this._parse(source);
        }
        else {
            console.error('Cannot read dxf source of type `' + typeof (source));
            return null;
        }
    }
    registerEntityHandler(handlerType) {
        const instance = new handlerType();
        this._entityHandlers[instance.ForEntityName] = instance;
    }
    parseSync(source) {
        return this.parse(source);
    }
    parseStream(stream) {
        let dxfString = "";
        const self = this;
        return new Promise((res, rej) => {
            stream.on('data', (chunk) => {
                dxfString += chunk;
            });
            stream.on('end', () => {
                try {
                    res(self._parse(dxfString));
                }
                catch (err) {
                    rej(err);
                }
            });
            stream.on('error', (err) => {
                rej(err);
            });
        });
    }
    _parse(dxfString) {
        const dxf = {};
        let lastHandle = 0;
        const dxfLinesArray = dxfString.split(/\r\n|\r|\n/g);
        const scanner = new DxfArrayScanner(dxfLinesArray);
        if (!scanner.hasNext())
            throw Error('Empty file');
        const self = this;
        let curr;
        function parseAll() {
            curr = scanner.next();
            while (!scanner.isEOF()) {
                if (curr.code === 0 && curr.value === 'SECTION') {
                    curr = scanner.next();
                    // Be sure we are reading a section code
                    if (curr.code !== 2) {
                        console.error('Unexpected code %s after 0:SECTION', debugCode(curr));
                        curr = scanner.next();
                        continue;
                    }
                    if (curr.value === 'HEADER') {
                        loglevel.debug('> HEADER');
                        dxf.header = parseHeader();
                        loglevel.debug('<');
                    }
                    else if (curr.value === 'BLOCKS') {
                        loglevel.debug('> BLOCKS');
                        dxf.blocks = parseBlocks();
                        loglevel.debug('<');
                    }
                    else if (curr.value === 'ENTITIES') {
                        loglevel.debug('> ENTITIES');
                        dxf.entities = parseEntities(false);
                        loglevel.debug('<');
                    }
                    else if (curr.value === 'TABLES') {
                        loglevel.debug('> TABLES');
                        dxf.tables = parseTables();
                        loglevel.debug('<');
                    }
                    else if (curr.value === 'EOF') {
                        loglevel.debug('EOF');
                    }
                    else {
                        loglevel.warn('Skipping section \'%s\'', curr.value);
                    }
                }
                else {
                    curr = scanner.next();
                }
                // If is a new section
            }
        }
        /**
         *
         * @return {object} header
         */
        function parseHeader() {
            // interesting variables:
            //  $ACADVER, $VIEWDIR, $VIEWSIZE, $VIEWCTR, $TDCREATE, $TDUPDATE
            // http://www.autodesk.com/techpubs/autocad/acadr14/dxf/header_section_al_u05_c.htm
            // Also see VPORT table entries
            let currVarName = null;
            let currVarValue = null;
            const header = {};
            // loop through header variables
            curr = scanner.next();
            while (true) {
                if (groupIs(curr, 0, 'ENDSEC')) {
                    if (currVarName)
                        header[currVarName] = currVarValue;
                    break;
                }
                else if (curr.code === 9) {
                    if (currVarName)
                        header[currVarName] = currVarValue;
                    currVarName = curr.value;
                    // Filter here for particular variables we are interested in
                }
                else {
                    if (curr.code === 10) {
                        currVarValue = { x: curr.value };
                    }
                    else if (curr.code === 20) {
                        currVarValue.y = curr.value;
                    }
                    else if (curr.code === 30) {
                        currVarValue.z = curr.value;
                    }
                    else {
                        currVarValue = curr.value;
                    }
                }
                curr = scanner.next();
            }
            // console.log(util.inspect(header, { colors: true, depth: null }));
            curr = scanner.next(); // swallow up ENDSEC
            return header;
        }
        /**
         *
         */
        function parseBlocks() {
            const blocks = {};
            curr = scanner.next();
            while (curr.value !== 'EOF') {
                if (groupIs(curr, 0, 'ENDSEC')) {
                    break;
                }
                if (groupIs(curr, 0, 'BLOCK')) {
                    loglevel.debug('block {');
                    const block = parseBlock();
                    loglevel.debug('}');
                    ensureHandle(block);
                    if (!block.name)
                        loglevel.error('block with handle "' + block.handle + '" is missing a name.');
                    else
                        blocks[block.name] = block;
                }
                else {
                    logUnhandledGroup(curr);
                    curr = scanner.next();
                }
            }
            return blocks;
        }
        function parseBlock() {
            const block = {};
            curr = scanner.next();
            while (curr.value !== 'EOF') {
                switch (curr.code) {
                    case 1:
                        block.xrefPath = curr.value;
                        curr = scanner.next();
                        break;
                    case 2:
                        block.name = curr.value;
                        curr = scanner.next();
                        break;
                    case 3:
                        block.name2 = curr.value;
                        curr = scanner.next();
                        break;
                    case 5:
                        block.handle = curr.value;
                        curr = scanner.next();
                        break;
                    case 8:
                        block.layer = curr.value;
                        curr = scanner.next();
                        break;
                    case 10:
                        block.position = parsePoint(curr);
                        curr = scanner.next();
                        break;
                    case 67:
                        block.paperSpace = (curr.value && curr.value == 1) ? true : false;
                        curr = scanner.next();
                        break;
                    case 70:
                        if (curr.value != 0) {
                            //if(curr.value & BLOCK_ANONYMOUS_FLAG) console.log('  Anonymous block');
                            //if(curr.value & BLOCK_NON_CONSTANT_FLAG) console.log('  Non-constant attributes');
                            //if(curr.value & BLOCK_XREF_FLAG) console.log('  Is xref');
                            //if(curr.value & BLOCK_XREF_OVERLAY_FLAG) console.log('  Is xref overlay');
                            //if(curr.value & BLOCK_EXTERNALLY_DEPENDENT_FLAG) console.log('  Is externally dependent');
                            //if(curr.value & BLOCK_RESOLVED_OR_DEPENDENT_FLAG) console.log('  Is resolved xref or dependent of an xref');
                            //if(curr.value & BLOCK_REFERENCED_XREF) console.log('  This definition is a referenced xref');
                            block.type = curr.value;
                        }
                        curr = scanner.next();
                        break;
                    case 100:
                        // ignore class markers
                        curr = scanner.next();
                        break;
                    case 330:
                        block.ownerHandle = curr.value;
                        curr = scanner.next();
                        break;
                    case 0:
                        if (curr.value == 'ENDBLK')
                            break;
                        block.entities = parseEntities(true);
                        break;
                    default:
                        logUnhandledGroup(curr);
                        curr = scanner.next();
                }
                if (groupIs(curr, 0, 'ENDBLK')) {
                    curr = scanner.next();
                    break;
                }
            }
            return block;
        }
        /**
         * parseTables
         * @return {Object} Object representing tables
         */
        function parseTables() {
            const tables = {};
            curr = scanner.next();
            while (curr.value !== 'EOF') {
                if (groupIs(curr, 0, 'ENDSEC'))
                    break;
                if (groupIs(curr, 0, 'TABLE')) {
                    curr = scanner.next();
                    const tableDefinition = tableDefinitions[curr.value];
                    if (tableDefinition) {
                        loglevel.debug(curr.value + ' Table {');
                        tables[tableDefinitions[curr.value].tableName] = parseTable(curr);
                        loglevel.debug('}');
                    }
                    else {
                        loglevel.debug('Unhandled Table ' + curr.value);
                    }
                }
                else {
                    // else ignored
                    curr = scanner.next();
                }
            }
            curr = scanner.next();
            return tables;
        }
        const END_OF_TABLE_VALUE = 'ENDTAB';
        function parseTable(group) {
            const tableDefinition = tableDefinitions[group.value];
            const table = {};
            let expectedCount = 0;
            curr = scanner.next();
            while (!groupIs(curr, 0, END_OF_TABLE_VALUE)) {
                switch (curr.code) {
                    case 5:
                        table.handle = curr.value;
                        curr = scanner.next();
                        break;
                    case 330:
                        table.ownerHandle = curr.value;
                        curr = scanner.next();
                        break;
                    case 100:
                        if (curr.value === 'AcDbSymbolTable') {
                            // ignore
                            curr = scanner.next();
                        }
                        else {
                            logUnhandledGroup(curr);
                            curr = scanner.next();
                        }
                        break;
                    case 70:
                        expectedCount = curr.value;
                        curr = scanner.next();
                        break;
                    case 0:
                        if (curr.value === tableDefinition.dxfSymbolName) {
                            table[tableDefinition.tableRecordsProperty] = tableDefinition.parseTableRecords();
                        }
                        else {
                            logUnhandledGroup(curr);
                            curr = scanner.next();
                        }
                        break;
                    default:
                        logUnhandledGroup(curr);
                        curr = scanner.next();
                }
            }
            const tableRecords = table[tableDefinition.tableRecordsProperty];
            if (tableRecords) {
                let actualCount = (() => {
                    if (tableRecords.constructor === Array) {
                        return tableRecords.length;
                    }
                    else if (typeof (tableRecords) === 'object') {
                        return Object.keys(tableRecords).length;
                    }
                    return undefined;
                })();
                if (expectedCount !== actualCount)
                    loglevel.warn('Parsed ' + actualCount + ' ' + tableDefinition.dxfSymbolName + '\'s but expected ' + expectedCount);
            }
            curr = scanner.next();
            return table;
        }
        function parseViewPortRecords() {
            const viewPorts = []; // Multiple table entries may have the same name indicating a multiple viewport configuration
            let viewPort = {};
            loglevel.debug('ViewPort {');
            curr = scanner.next();
            while (!groupIs(curr, 0, END_OF_TABLE_VALUE)) {
                switch (curr.code) {
                    case 2: // layer name
                        viewPort.name = curr.value;
                        curr = scanner.next();
                        break;
                    case 10:
                        viewPort.lowerLeftCorner = parsePoint(curr);
                        curr = scanner.next();
                        break;
                    case 11:
                        viewPort.upperRightCorner = parsePoint(curr);
                        curr = scanner.next();
                        break;
                    case 12:
                        viewPort.center = parsePoint(curr);
                        curr = scanner.next();
                        break;
                    case 13:
                        viewPort.snapBasePoint = parsePoint(curr);
                        curr = scanner.next();
                        break;
                    case 14:
                        viewPort.snapSpacing = parsePoint(curr);
                        curr = scanner.next();
                        break;
                    case 15:
                        viewPort.gridSpacing = parsePoint(curr);
                        curr = scanner.next();
                        break;
                    case 16:
                        viewPort.viewDirectionFromTarget = parsePoint(curr);
                        curr = scanner.next();
                        break;
                    case 17:
                        viewPort.viewTarget = parsePoint(curr);
                        curr = scanner.next();
                        break;
                    case 42:
                        viewPort.lensLength = curr.value;
                        curr = scanner.next();
                        break;
                    case 43:
                        viewPort.frontClippingPlane = curr.value;
                        curr = scanner.next();
                        break;
                    case 44:
                        viewPort.backClippingPlane = curr.value;
                        curr = scanner.next();
                        break;
                    case 45:
                        viewPort.viewHeight = curr.value;
                        curr = scanner.next();
                        break;
                    case 50:
                        viewPort.snapRotationAngle = curr.value;
                        curr = scanner.next();
                        break;
                    case 51:
                        viewPort.viewTwistAngle = curr.value;
                        curr = scanner.next();
                        break;
                    case 79:
                        viewPort.orthographicType = curr.value;
                        curr = scanner.next();
                        break;
                    case 110:
                        viewPort.ucsOrigin = parsePoint(curr);
                        curr = scanner.next();
                        break;
                    case 111:
                        viewPort.ucsXAxis = parsePoint(curr);
                        curr = scanner.next();
                        break;
                    case 112:
                        viewPort.ucsYAxis = parsePoint(curr);
                        curr = scanner.next();
                        break;
                    case 110:
                        viewPort.ucsOrigin = parsePoint(curr);
                        curr = scanner.next();
                        break;
                    case 281:
                        viewPort.renderMode = curr.value;
                        curr = scanner.next();
                        break;
                    case 281:
                        // 0 is one distant light, 1 is two distant lights
                        viewPort.defaultLightingType = curr.value;
                        curr = scanner.next();
                        break;
                    case 292:
                        viewPort.defaultLightingOn = curr.value;
                        curr = scanner.next();
                        break;
                    case 330:
                        viewPort.ownerHandle = curr.value;
                        curr = scanner.next();
                        break;
                    case 63: // These are all ambient color. Perhaps should be a gradient when multiple are set.
                    case 421:
                    case 431:
                        viewPort.ambientColor = curr.value;
                        curr = scanner.next();
                        break;
                    case 0:
                        // New ViewPort
                        if (curr.value === 'VPORT') {
                            loglevel.debug('}');
                            viewPorts.push(viewPort);
                            loglevel.debug('ViewPort {');
                            viewPort = {};
                            curr = scanner.next();
                        }
                        break;
                    default:
                        logUnhandledGroup(curr);
                        curr = scanner.next();
                        break;
                }
            }
            // Note: do not call scanner.next() here,
            //  parseTable() needs the current group
            loglevel.debug('}');
            viewPorts.push(viewPort);
            return viewPorts;
        }
        function parseLineTypes() {
            const ltypes = {};
            let ltype = {};
            let length = 0;
            let ltypeName;
            loglevel.debug('LType {');
            curr = scanner.next();
            while (!groupIs(curr, 0, 'ENDTAB')) {
                switch (curr.code) {
                    case 2:
                        ltype.name = curr.value;
                        ltypeName = curr.value;
                        curr = scanner.next();
                        break;
                    case 3:
                        ltype.description = curr.value;
                        curr = scanner.next();
                        break;
                    case 73: // Number of elements for this line type (dots, dashes, spaces);
                        length = curr.value;
                        if (length > 0)
                            ltype.pattern = [];
                        curr = scanner.next();
                        break;
                    case 40: // total pattern length
                        ltype.patternLength = curr.value;
                        curr = scanner.next();
                        break;
                    case 49:
                        ltype.pattern.push(curr.value);
                        curr = scanner.next();
                        break;
                    case 0:
                        loglevel.debug('}');
                        if (length > 0 && length !== ltype.pattern.length)
                            loglevel.warn('lengths do not match on LTYPE pattern');
                        ltypes[ltypeName] = ltype;
                        ltype = {};
                        loglevel.debug('LType {');
                        curr = scanner.next();
                        break;
                    default:
                        curr = scanner.next();
                }
            }
            loglevel.debug('}');
            ltypes[ltypeName] = ltype;
            return ltypes;
        }
        function parseLayers() {
            const layers = {};
            let layer = {};
            let layerName;
            loglevel.debug('Layer {');
            curr = scanner.next();
            while (!groupIs(curr, 0, 'ENDTAB')) {
                switch (curr.code) {
                    case 2: // layer name
                        layer.name = curr.value;
                        layerName = curr.value;
                        curr = scanner.next();
                        break;
                    case 62: // color, visibility
                        layer.visible = curr.value >= 0;
                        // TODO 0 and 256 are BYBLOCK and BYLAYER respectively. Need to handle these values for layers?.
                        layer.colorIndex = Math.abs(curr.value);
                        layer.color = getAcadColor(layer.colorIndex);
                        curr = scanner.next();
                        break;
                    case 70: // frozen layer
                        layer.frozen = ((curr.value & 1) != 0 || (curr.value & 2) != 0);
                        curr = scanner.next();
                        break;
                    case 0:
                        // New Layer
                        if (curr.value === 'LAYER') {
                            loglevel.debug('}');
                            layers[layerName] = layer;
                            loglevel.debug('Layer {');
                            layer = {};
                            layerName = undefined;
                            curr = scanner.next();
                        }
                        break;
                    default:
                        logUnhandledGroup(curr);
                        curr = scanner.next();
                        break;
                }
            }
            // Note: do not call scanner.next() here,
            //  parseLayerTable() needs the current group
            loglevel.debug('}');
            layers[layerName] = layer;
            return layers;
        }
        const tableDefinitions = {
            VPORT: {
                tableRecordsProperty: 'viewPorts',
                tableName: 'viewPort',
                dxfSymbolName: 'VPORT',
                parseTableRecords: parseViewPortRecords
            },
            LTYPE: {
                tableRecordsProperty: 'lineTypes',
                tableName: 'lineType',
                dxfSymbolName: 'LTYPE',
                parseTableRecords: parseLineTypes
            },
            LAYER: {
                tableRecordsProperty: 'layers',
                tableName: 'layer',
                dxfSymbolName: 'LAYER',
                parseTableRecords: parseLayers
            }
        };
        /**
         * Is called after the parser first reads the 0:ENTITIES group. The scanner
         * should be on the start of the first entity already.
         * @return {Array} the resulting entities
         */
        function parseEntities(forBlock) {
            const entities = [];
            const endingOnValue = forBlock ? 'ENDBLK' : 'ENDSEC';
            if (!forBlock) {
                curr = scanner.next();
            }
            while (true) {
                if (curr.code === 0) {
                    if (curr.value === endingOnValue) {
                        break;
                    }
                    const handler = self._entityHandlers[curr.value];
                    if (handler != null) {
                        loglevel.debug(curr.value + ' {');
                        const entity = handler.parseEntity(scanner, curr);
                        curr = scanner.lastReadGroup;
                        loglevel.debug('}');
                        ensureHandle(entity);
                        entities.push(entity);
                    }
                    else {
                        loglevel.warn('Unhandled entity ' + curr.value);
                        curr = scanner.next();
                        continue;
                    }
                }
                else {
                    // ignored lines from unsupported entity
                    curr = scanner.next();
                }
            }
            if (endingOnValue == 'ENDSEC')
                curr = scanner.next(); // swallow up ENDSEC, but not ENDBLK
            return entities;
        }
        /**
         * Parses a 2D or 3D point, returning it as an object with x, y, and
         * (sometimes) z property if it is 3D. It is assumed the current group
         * is x of the point being read in, and scanner.next() will return the
         * y. The parser will determine if there is a z point automatically.
         * @return {Object} The 2D or 3D point as an object with x, y[, z]
         */
        function parsePoint(curr) {
            const point = {};
            let code = curr.code;
            point.x = curr.value;
            code += 10;
            curr = scanner.next();
            if (curr.code != code)
                throw new Error('Expected code for point value to be ' + code +
                    ' but got ' + curr.code + '.');
            point.y = curr.value;
            code += 10;
            curr = scanner.next();
            if (curr.code != code) {
                scanner.rewind();
                return point;
            }
            point.z = curr.value;
            return point;
        }
        function ensureHandle(entity) {
            if (!entity)
                throw new TypeError('entity cannot be undefined or null');
            if (!entity.handle)
                entity.handle = lastHandle++;
        }
        parseAll();
        return dxf;
    }
}
function groupIs(group, code, value) {
    return group.code === code && group.value === value;
}
function logUnhandledGroup(curr) {
    loglevel.debug('unhandled group ' + debugCode(curr));
}
function debugCode(curr) {
    return curr.code + ':' + curr.value;
}
/**
 * Returns the truecolor value of the given AutoCad color index value
 * @return {Number} truecolor value as a number
 */
function getAcadColor(index) {
    return AUTO_CAD_COLOR_INDEX[index];
}
// const BLOCK_ANONYMOUS_FLAG = 1;
// const BLOCK_NON_CONSTANT_FLAG = 2;
// const BLOCK_XREF_FLAG = 4;
// const BLOCK_XREF_OVERLAY_FLAG = 8;
// const BLOCK_EXTERNALLY_DEPENDENT_FLAG = 16;
// const BLOCK_RESOLVED_OR_DEPENDENT_FLAG = 32;
// const BLOCK_REFERENCED_XREF = 64;
/* Notes */
// Code 6 of an entity indicates inheritance of properties (eg. color).
//   BYBLOCK means inherits from block
//   BYLAYER (default) mean inherits from layer

const buildRegularPolygon = (sides = 32) => {
  let points = [];
  for (let i = 0; i < sides; i++) {
    let radians = (2 * Math.PI * i) / sides;
    let [x, y] = fromAngleRadians(radians);
    points.push([x, y, 0]);
  }
  return points;
};

const fromDxf = async (data) => {
  const parser = new DxfParser();
  const dxf = parser.parseSync(data);
  const assembly = [];
  for (const entity of dxf.entities) {
    const { handle, layer } = entity;
    let tags = [];
    if (handle !== undefined) {
      tags.push(`user:dxf:handle:${handle}`);
    }
    if (layer !== undefined) {
      tags.push(`user:dxf:layer:${layer}`);
      if (dxf.tables && dxf.tables.layer && dxf.tables.layer.layers) {
        const color = dxf.tables.layer.layers[layer].color;
        if (color !== undefined) {
          tags.push(toTagFromRgbInt(color));
        }
      }
    }
    if (tags.length === 0) tags = undefined;
    switch (entity.type) {
      case 'LINE':
      case 'LWPOLYLINE':
      case 'POLYLINE': {
        const { shape, vertices } = entity;
        const path = vertices.map(({ x = 0, y = 0, z = 0 }) => [x, y, z]);
        if (shape !== true) {
          // Shape false means closed.
          path.unshift(null);
        }
        assembly.push({ type: 'paths', paths: [path], tags });
        break;
      }
      case 'INSERT': {
        // const { x = 0, y = 0, z = 0 } = entity.position;
        // const { xScale, rotation } = entity;
        break;
      }
      case 'CIRCLE': {
        const { x = 0, y = 0, z = 0 } = entity.center;
        const { radius = 1 } = entity;
        assembly.push(
          translate(
            [x, y, z],
            scale([radius, radius, radius], {
              ...buildRegularPolygon(32),
              tags,
            })
          )
        );
        break;
      }
      default:
        throw Error(`die due to entity: ${JSON.stringify(entity)}`);
    }
  }
  return { type: 'assembly', content: assembly };
};

class DatabaseObject {
    constructor(subclass = null)
    {
        /* Handle should be assigned externally by document instance */
        this.handle = null;
        this.ownerHandle = null;
        this.subclassMarkers = [];
        if (subclass) {
            if (Array.isArray(subclass)) {
                for (const sc of subclass) {
                    this.subclassMarkers.push(sc);
                }
            } else {
                this.subclassMarkers.push(subclass);
            }
        }
    }

    toDxfString()
    {
        let s = "";
        if (this.handle) {
            s += `5\n${this.handle.toString(16)}\n`;
        } else {
            console.warn("No handle assigned to entity", this);
        }
        if (this.ownerHandle) {
            s += `330\n${this.ownerHandle.toString(16)}\n`;
        }
        for (const marker of this.subclassMarkers) {
            s += `100\n${marker}\n`;
        }
        return s
    }
}

var DatabaseObject_1 = DatabaseObject;

class LineType extends DatabaseObject_1
{
    /**
     * @param {string} name
     * @param {string} description
     * @param {array} elements - if elem > 0 it is a line, if elem < 0 it is gap, if elem == 0.0 it is a 
     */
    constructor(name, description, elements)
    {
        super(["AcDbSymbolTableRecord", "AcDbLinetypeTableRecord"]);
        this.name = name;
        this.description = description;
        this.elements = elements;
    }

    /**
     * @link https://www.autodesk.com/techpubs/autocad/acadr14/dxf/ltype_al_u05_c.htm
     */
    toDxfString()
    {
        let s = '0\nLTYPE\n';
        s += super.toDxfString();
        s += `2\n${this.name}\n`;
        s += `3\n${this.description}\n`;
        s += '70\n0\n';
        s += '72\n65\n';
        s += `73\n${this.elements.length}\n`;
        s += `40\n${this.getElementsSum()}\n`;
        for (const element of this.elements)
        {
            s += `49\n${element}\n`;
            /* Complex linetype element type, mandatory for AutoCAD */
            s += '74\n0\n';
        }

        return s;
    }

    getElementsSum()
    {
        let sum = 0;
        for (let i = 0; i < this.elements.length; ++i)
        {
            sum += Math.abs(this.elements[i]);
        }

        return sum;
    }
}

var LineType_1 = LineType;

class Layer extends DatabaseObject_1
{
    constructor(name, colorNumber, lineTypeName = null)
    {
        super(["AcDbSymbolTableRecord", "AcDbLayerTableRecord"]);
        this.name = name;
        this.colorNumber = colorNumber;
        this.lineTypeName = lineTypeName;
        this.shapes = [];
        this.trueColor = -1;
    }

    toDxfString()
    {
        let s = '0\nLAYER\n';
        s += super.toDxfString();
        s += `2\n${this.name}\n`;
        if (this.trueColor !== -1)
        {
            s += `420\n${this.trueColor}\n`;
        }
        else
        {
            s += `62\n${this.colorNumber}\n`;
        }
        s += '70\n0\n';
        if (this.lineTypeName) {
            s += `6\n${this.lineTypeName}\n`;
        }
        /* Hard-pointer handle to PlotStyleName object; seems mandatory, but any value seems OK,
         * including 0.
         */
        s += "390\n1\n";
        return s;
    }

    setTrueColor(color)
    {
        this.trueColor = color;
    }

    addShape(shape)
    {
        this.shapes.push(shape);
        shape.layer = this;
    }

    getShapes()
    {
        return this.shapes;
    }

    shapesToDxf()
    {
        let s = '';
        for (let i = 0; i < this.shapes.length; ++i)
        {
            s += this.shapes[i].toDxfString();
        } 
        
        
        return s;
    }
}

var Layer_1 = Layer;

class Table extends DatabaseObject_1 {
    constructor(name) {
        super("AcDbSymbolTable");
        this.name = name;
        this.elements = [];
    }

    add(element) {
        this.elements.push(element);
    }

    toDxfString()
    {
        let s = "0\nTABLE\n";
        s += `2\n${this.name}\n`;
        s += super.toDxfString();
        s += `70\n${this.elements.length}\n`;
        for (const element of this.elements) {
            s += element.toDxfString();
        }
        s += "0\nENDTAB\n";
        return s
    }
}

var Table_1 = Table;

class DimStyleTable extends Table_1 {
    constructor(name) {
        super(name);
        this.subclassMarkers.push("AcDbDimStyleTable");
    }

    toDxfString()
    {
        let s = "0\nTABLE\n";
        s += `2\n${this.name}\n`;
        s += DatabaseObject_1.prototype.toDxfString.call(this);
        s += `70\n${this.elements.length}\n`;
        /* DIMTOL */
        s += "71\n1\n";
        for (const element of this.elements) {
            s += element.toDxfString();
        }
        s += "0\nENDTAB\n";
        return s
    }
}

var DimStyleTable_1 = DimStyleTable;

class TextStyle extends DatabaseObject_1 {
    constructor(name) {
        super(["AcDbSymbolTableRecord", "AcDbTextStyleTableRecord"]);
        this.name = name;
    }

    toDxfString()
    {
        let s = "0\nSTYLE\n";
        s += super.toDxfString();
        s += `2\n${this.name}\n`;
        /* No flags set */
        s += "70\n0\n";
        s += "40\n0\n";
        s += "41\n1\n";
        s += "50\n0\n";
        s += "71\n0\n";
        s += "42\n1\n";
        s += `3\n${this.name}\n`;
        s += "4\n\n";
        return s
    }
}

var TextStyle_1 = TextStyle;

class Viewport extends DatabaseObject_1 {
    constructor(name, height)
    {
        super(["AcDbSymbolTableRecord", "AcDbViewportTableRecord"]);
        this.name = name;
        this.height = height;
    }

    toDxfString()
    {
        let s = "0\nVPORT\n";
        s += super.toDxfString();
        s += `2\n${this.name}\n`;
        s += `40\n${this.height}\n`;
        /* No flags set */
        s += "70\n0\n";
        return s
    }
}

var Viewport_1 = Viewport;

class AppId extends DatabaseObject_1 {
    constructor(name) {
        super(["AcDbSymbolTableRecord", "AcDbRegAppTableRecord"]);
        this.name = name;
    }

    toDxfString()
    {
        let s = "0\nAPPID\n";
        s += super.toDxfString();
        s += `2\n${this.name}\n`;
        /* No flags set */
        s += "70\n0\n";
        return s
    }
}

var AppId_1 = AppId;

class Block extends DatabaseObject_1 {
    constructor(name)
    {
        super(["AcDbEntity", "AcDbBlockBegin"]);
        this.name = name;
        this.end = new DatabaseObject_1(["AcDbEntity","AcDbBlockEnd"]);
        this.recordHandle = null;
    }

    /* Internal method to set handle value for block end separator entity. */
    setEndHandle(handle) {
        this.end.handle = handle;
    }

    /* Internal method to set handle value for block record in block records table. */
    setRecordHandle(handle) {
        this.recordHandle = handle;
    }

    //XXX need some API to add content

    toDxfString()
    {
        let s = "0\nBLOCK\n";
        s += super.toDxfString();
        s += `2\n${this.name}\n`;
        /* No flags set */
        s += "70\n0\n";
        /* Block top left corner */
        s += "10\n0\n";
        s += "20\n0\n";
        s += "30\n0\n";
        s += `3\n${this.name}\n`;
        /* xref path name - nothing */
        s += "1\n\n";

        //XXX dump content here

        s += "0\nENDBLK\n";
        s += this.end.toDxfString();
        return s
    }
}

var Block_1 = Block;

class BlockRecord extends DatabaseObject_1 {
    constructor(name) {
        super(["AcDbSymbolTableRecord", "AcDbBlockTableRecord"]);
        this.name = name;
    }

    toDxfString()
    {
        let s = "0\nBLOCK_RECORD\n";
        s += super.toDxfString();
        s += `2\n${this.name}\n`;
        /* No flags set */
        s += "70\n0\n";
        /* Block explodability */
        s += "280\n1\n";
        /* Block scalability */
        s += "281\n0\n";
        return s
    }
}

var BlockRecord_1 = BlockRecord;

class Dictionary extends DatabaseObject_1 {
    constructor()
    {
        super("AcDbDictionary");
        this.children = {};
    }

    addChildDictionary(name, dictionary) {
        if (!this.handle) {
            throw new Error("Handle must be set before adding children")
        }
        dictionary.ownerHandle = this.handle;
        this.children[name] = dictionary;
    }

    toDxfString()
    {
        let s = "0\nDICTIONARY\n";
        s += super.toDxfString();
        /* Duplicate record cloning flag - keep existing */
        s += "281\n1\n";
        for (const [name, item] of Object.entries(this.children)) {
            s += `3\n${name}\n`;
            s += `350\n${item.handle.toString(16)}\n`;
        }
        for (const item of Object.values(this.children)) {
            s += item.toDxfString();
        }
        return s
    }
}

var Dictionary_1 = Dictionary;

class Line extends DatabaseObject_1
{
    constructor(x1, y1, x2, y2)
    {
        super(["AcDbEntity", "AcDbLine"]);
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    toDxfString()
    {
        //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/line_al_u05_c.htm
        let s = `0\nLINE\n`;
        s += super.toDxfString();
        s += `8\n${this.layer.name}\n`;
        s += `10\n${this.x1}\n20\n${this.y1}\n30\n0\n`;
        s += `11\n${this.x2}\n21\n${this.y2}\n31\n0\n`;
        return s;
    }
}

var Line_1 = Line;

class Line3d extends DatabaseObject_1
{
    constructor(x1, y1, z1, x2, y2, z2)
    {
        super(["AcDbEntity", "AcDbLine"]);
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;
        this.x2 = x2;
        this.y2 = y2;
        this.z2 = z2;
    }

    toDxfString()
    {
        //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/line_al_u05_c.htm
        let s = `0\nLINE\n`;
        s += super.toDxfString();
        s += `8\n${this.layer.name}\n`;
        s += `10\n${this.x1}\n20\n${this.y1}\n30\n${this.z1}\n`;
        s += `11\n${this.x2}\n21\n${this.y2}\n31\n${this.z2}\n`;
        return s;
    }
}

var Line3d_1 = Line3d;

class Arc extends DatabaseObject_1
{
    /**
     * @param {number} x1 - Center x
     * @param {number} y1 - Center y
     * @param {number} r - radius
     * @param {number} startAngle - degree 
     * @param {number} endAngle - degree 
     */
    constructor(x1, y1, r, startAngle, endAngle)
    {
        super(["AcDbEntity", "AcDbArc"]);
        this.x1 = x1;
        this.y1 = y1;
        this.r = r;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
    }

    toDxfString()
    {
        //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/line_al_u05_c.htm
        let s = `0\nARC\n`;
        s += super.toDxfString();
        s += `8\n${this.layer.name}\n`;
        s += `10\n${this.x1}\n20\n${this.y1}\n30\n0\n`;
        s += `40\n${this.r}\n50\n${this.startAngle}\n51\n${this.endAngle}\n`;
        return s;
    }
}

var Arc_1 = Arc;

class Circle extends DatabaseObject_1
{
    /**
     * @param {number} x1 - Center x
     * @param {number} y1 - Center y
     * @param {number} r - radius
     */
    constructor(x1, y1, r)
    {
        super(["AcDbEntity", "AcDbCircle"]);
        this.x1 = x1;
        this.y1 = y1;
        this.r = r;
    }

    toDxfString()
    {
        //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/circle_al_u05_c.htm
        let s = `0\nCIRCLE\n`;
        s += super.toDxfString();
        s += `8\n${this.layer.name}\n`;
        s += `10\n${this.x1}\n20\n${this.y1}\n30\n0\n`;
        s += `40\n${this.r}\n`;
        return s;
    }
}

var Circle_1 = Circle;

const H_ALIGN_CODES = ['left', 'center', 'right'];
const V_ALIGN_CODES = ['baseline','bottom', 'middle', 'top'];

class Text extends DatabaseObject_1
{
    /**
     * @param {number} x1 - x
     * @param {number} y1 - y
     * @param {number} height - Text height
     * @param {number} rotation - Text rotation
     * @param {string} value - the string itself
     * @param {string} [horizontalAlignment="left"] left | center | right
     * @param {string} [verticalAlignment="baseline"] baseline | bottom | middle | top
     */
    constructor(x1, y1, height, rotation, value, horizontalAlignment = 'left', verticalAlignment = 'baseline')
    {
        super(["AcDbEntity", "AcDbText"]);
        this.x1 = x1;
        this.y1 = y1;
        this.height = height;
        this.rotation = rotation;
        this.value = value;
        this.hAlign = horizontalAlignment;
        this.vAlign = verticalAlignment;
    }

    toDxfString()
    {
        //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/text_al_u05_c.htm
        let s = `0\nTEXT\n`;
        s += super.toDxfString();
        s += `8\n${this.layer.name}\n`;
        s += `10\n${this.x1}\n20\n${this.y1}\n30\n0\n`;
        s += `40\n${this.height}\n`;
        s += `1\n${this.value}\n`;
        s += `50\n${this.rotation}\n`;
        if (H_ALIGN_CODES.includes(this.hAlign, 1) || V_ALIGN_CODES.includes(this.vAlign, 1)) {
            s += `72\n${Math.max(H_ALIGN_CODES.indexOf(this.hAlign), 0)}\n`;
            s += `11\n${this.x1}\n21\n${this.y1}\n31\n0\n`;
            /* AutoCAD needs this one more time, yes, exactly here. */
            s += "100\nAcDbText\n";
            s += `73\n${Math.max(V_ALIGN_CODES.indexOf(this.vAlign), 0)}\n`;
        } else {
            /* AutoCAD needs this one more time. */
            s += "100\nAcDbText\n";
        }
        return s;
    }
}

var Text_1 = Text;

class Polyline extends DatabaseObject_1
{
    /**
     * @param {array} points - Array of points like [ [x1, y1], [x2, y2, bulge]... ]
     * @param {boolean} closed
     * @param {number} startWidth
     * @param {number} endWidth
     */
    constructor(points, closed = false, startWidth = 0, endWidth = 0)
    {
        super(["AcDbEntity", "AcDbPolyline"]);
        this.points = points;
        this.closed = closed;
        this.startWidth = startWidth;
        this.endWidth = endWidth;
    }

    toDxfString()
    {
        let s = `0\nLWPOLYLINE\n`;
        s += super.toDxfString();
        s += `8\n${this.layer.name}\n`;
        s += "6\nByLayer\n";
        s += "62\n256\n";
        s += "370\n-1\n";
        s += `70\n${this.closed ? 1 : 0}\n`;
        s += `90\n${this.points.length}\n`;

        for (const p of this.points) {
            s += `10\n${p[0]}\n20\n${p[1]}\n`;
            if (this.startWidth !== 0 || this.endWidth !== 0) {
                s += `40\n${this.startWidth}\n41\n${this.endWidth}\n`;
            }
            if (p[2] !== undefined) {
                s += `42\n${p[2]}\n`;
            }
        }

        return s;
    }
}

var Polyline_1 = Polyline;

class Polyline3d extends DatabaseObject_1
{
    /**
     * @param {array} points - Array of points like [ [x1, y1, z1], [x2, y2, z2]... ]
     */
    constructor(points)
    {
        super(["AcDbEntity", "AcDbPolyline3D"]);
        this.points = points;
        this.pointHandles = null;
    }

    assignVertexHandles(handleProvider) {
        this.pointHandles = this.points.map(() => handleProvider());
    }

    toDxfString()
    {
        //https://www.autodesk.com/techpubs/autocad/acad2000/dxf/polyline_dxf_06.htm
        //https://www.autodesk.com/techpubs/autocad/acad2000/dxf/vertex_dxf_06.htm
        let s = `0\nPOLYLINE\n`;
        s += super.toDxfString();
        s += `8\n${this.layer.name}\n`;
        s += `66\n1\n70\n8\n`;

        for (let i = 0; i < this.points.length; ++i)
        {
            s += `0\nVERTEX\n`;
            s += "100\nAcDbEntity\n";
            s += "100\nAcDbVertex\n";
            s += `5\n${this.pointHandles[i].toString(16)}\n`;
            s += `8\n${this.layer.name}\n`;
            s += `70\n0\n`;
            s += `10\n${this.points[i][0]}\n20\n${this.points[i][1]}\n30\n${this.points[i][2]}\n`;
        }
        
        s += `0\nSEQEND\n`;
        return s;
    }
}

var Polyline3d_1 = Polyline3d;

class Face extends DatabaseObject_1
{
    constructor(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4)
    {
        super(["AcDbEntity", "AcDbFace"]);
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;
        this.x2 = x2;
        this.y2 = y2;
        this.z2 = z2;
        this.x3 = x3;
        this.y3 = y3;
        this.z3 = z3;
        this.x4 = x4;
        this.y4 = y4;
        this.z4 = z4;
    }

    toDxfString()
    {
        //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/3dface_al_u05_c.htm
        let s = `0\n3DFACE\n`;
        s += super.toDxfString();
        s += `8\n${this.layer.name}\n`;
        s += `10\n${this.x1}\n20\n${this.y1}\n30\n${this.z1}\n`;
        s += `11\n${this.x2}\n21\n${this.y2}\n31\n${this.z2}\n`;
        s += `12\n${this.x3}\n22\n${this.y3}\n32\n${this.z3}\n`;
        s += `13\n${this.x4}\n23\n${this.y4}\n33\n${this.z4}\n`;
        return s;
    }
}

var Face_1 = Face;

class Point extends DatabaseObject_1
{
    constructor(x, y)
    {
        super(["AcDbEntity", "AcDbPoint"]);
        this.x = x;
        this.y = y;
    }

    toDxfString()
    {
        //https://www.autodesk.com/techpubs/autocad/acadr14/dxf/point_al_u05_c.htm
        let s = `0\nPOINT\n`;
        s += super.toDxfString();
        s += `8\n${this.layer.name}\n`;
        s += `10\n${this.x}\n20\n${this.y}\n30\n0\n`;
        return s;
    }
}

var Point_1 = Point;

class Spline extends DatabaseObject_1
{
    /**
     * Creates a spline. See https://www.autodesk.com/techpubs/autocad/acad2000/dxf/spline_dxf_06.htm
     * @param {[Array]} controlPoints - Array of control points like [ [x1, y1], [x2, y2]... ]
     * @param {number} degree - Degree of spline: 2 for quadratic, 3 for cubic. Default is 3
     * @param {[number]} knots - Knot vector array. If null, will use a uniform knot vector. Default is null
     * @param {[number]} weights - Control point weights. If provided, must be one weight for each control point. Default is null
     * @param {[Array]} fitPoints - Array of fit points like [ [x1, y1], [x2, y2]... ]
     */
    constructor(controlPoints, degree = 3, knots = null, weights = null, fitPoints = [])
    {
        super(["AcDbEntity", "AcDbSpline"]);
        if (controlPoints.length < degree + 1) {
            throw new Error(`For degree ${degree} spline, expected at least ${degree + 1} control points, but received only ${controlPoints.length}`);
        }

        if (knots == null) {
            // Examples:
            // degree 2, 3 pts:  0 0 0 1 1 1
            // degree 2, 4 pts:  0 0 0 1 2 2 2
            // degree 2, 5 pts:  0 0 0 1 2 3 3 3
            // degree 3, 4 pts:  0 0 0 0 1 1 1 1
            // degree 3, 5 pts:  0 0 0 0 1 2 2 2 2

            knots = [];
            for (let i = 0; i < degree + 1; i++) {
                knots.push(0);
            }
            for (let i = 1; i < controlPoints.length - degree; i++) {
                knots.push(i);
            }
            for (let i = 0; i < degree + 1; i++) {
                knots.push(controlPoints.length - degree);
            }
        }

        if (knots.length !== controlPoints.length + degree + 1) {
            throw new Error(`Invalid knot vector length. Expected ${controlPoints.length + degree + 1} but received ${knots.length}.`);
        }

        this.controlPoints = controlPoints;
        this.knots = knots;
        this.fitPoints = fitPoints;
        this.degree = degree;
        this.weights = weights;

        const closed = 0;
        const periodic = 0;
        const rational = this.weights ? 1 : 0;
        const planar = 1;
        const linear = 0;

        this.type =
            closed * 1 +
            periodic * 2 +
            rational * 4 +
            planar * 8 +
            linear * 16;

        // Not certain where the values of these flags came from so I'm going to leave them commented for now
        // const closed = 0
        // const periodic = 0
        // const rational = 1
        // const planar = 1
        // const linear = 0
        // const splineType = 1024 * closed + 128 * periodic + 8 * rational + 4 * planar + 2 * linear

    }

    toDxfString() {
        // https://www.autodesk.com/techpubs/autocad/acad2000/dxf/spline_dxf_06.htm
        let s = `0\nSPLINE\n`;
        s += super.toDxfString();
        s += `8\n${this.layer.name}\n`;
        s += `210\n0.0\n220\n0.0\n230\n1.0\n`;

        s += `70\n${this.type}\n`;
        s += `71\n${this.degree}\n`;
        s += `72\n${this.knots.length}\n`;
        s += `73\n${this.controlPoints.length}\n`;
        s += `74\n${this.fitPoints.length}\n`;
        s += `42\n1e-7\n`;
        s += `43\n1e-7\n`;
        s += `44\n1e-10\n`;

        for (let i = 0; i < this.knots.length; ++i) {
            s += `40\n${this.knots[i]}\n`;
        }

        if (this.weights) {
            for (let i = 0; i < this.knots.length; ++i) {
                s += `41\n${this.weights[i]}\n`;
            }
        }

        for (let i = 0; i < this.controlPoints.length; ++i) {
            s += `10\n${this.controlPoints[i][0]}\n`;
            s += `20\n${this.controlPoints[i][1]}\n`;
            s += `30\n0\n`;
        }

        return s;
    }
}

var Spline_1 = Spline;

class Ellipse extends DatabaseObject_1 {
    /**
     * Creates an ellipse.
     * @param {number} x1 - Center x
     * @param {number} y1 - Center y
     * @param {number} majorAxisX - Endpoint x of major axis, relative to center
     * @param {number} majorAxisY - Endpoint y of major axis, relative to center
     * @param {number} axisRatio - Ratio of minor axis to major axis
     * @param {number} startAngle - Start angle
     * @param {number} endAngle - End angle
     */
    constructor(x1, y1, majorAxisX, majorAxisY, axisRatio, startAngle, endAngle) {
        super(["AcDbEntity", "AcDbEllipse"]);
        this.x1 = x1;
        this.y1 = y1;
        this.majorAxisX = majorAxisX;
        this.majorAxisY = majorAxisY;
        this.axisRatio = axisRatio;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
    }

    toDxfString() {
        // https://www.autodesk.com/techpubs/autocad/acadr14/dxf/ellipse_al_u05_c.htm
        let s = `0\nELLIPSE\n`;
        s += super.toDxfString();
        s += `8\n${this.layer.name}\n`;
        s += `10\n${this.x1}\n`;
        s += `20\n${this.y1}\n`;
        s += `30\n0\n`;
        s += `11\n${this.majorAxisX}\n`;
        s += `21\n${this.majorAxisY}\n`;
        s += `31\n0\n`;
        s += `40\n${this.axisRatio}\n`;
        s += `41\n${this.startAngle}\n`;
        s += `42\n${this.endAngle}\n`;
        return s;
    }
}

var Ellipse_1 = Ellipse;

class Drawing
{
    constructor()
    {
        this.layers = {};
        this.activeLayer = null;
        this.lineTypes = {};
        this.headers = {};
        this.tables = {};
        this.blocks = {};
        this.handleCount = 0;

        this.ltypeTableHandle = this._generateHandle();
        this.layerTableHandle = this._generateHandle();
        this.blockRecordTableHandle = this._generateHandle();

        this.dictionary = new Dictionary_1();
        this._assignHandle(this.dictionary);

        this.setUnits('Unitless');

        for (const lineType of Drawing.LINE_TYPES) {
            this.addLineType(lineType.name, lineType.description, lineType.elements);
        }

        for (const layer of Drawing.LAYERS) {
            this.addLayer(layer.name, layer.colorNumber, layer.lineTypeName);
        }

        this.setActiveLayer('0');
    }


    /**
     * @param {string} name
     * @param {string} description
     * @param {array} elements - if elem > 0 it is a line, if elem < 0 it is gap, if elem == 0.0 it is a
     */
    addLineType(name, description, elements)
    {
        this.lineTypes[name] = this._assignHandle(new LineType_1(name, description, elements));
        return this;
    }

    addLayer(name, colorNumber, lineTypeName)
    {
        this.layers[name] = this._assignHandle(new Layer_1(name, colorNumber, lineTypeName));
        return this;
    }

    setActiveLayer(name)
    {
        this.activeLayer = this.layers[name];
        return this;
    }

    addTable(name) {
        const table = new Table_1(name);
        this._assignHandle(table);
        this.tables[name] = table;
        return table
    }

    addBlock(name) {
        const block = new Block_1(name);
        this._assignHandle(block);
        block.setEndHandle(this._generateHandle());
        block.setRecordHandle(this._generateHandle());
        this.blocks[name] = block;
        return block
    }

    drawLine(x1, y1, x2, y2)
    {
        this.activeLayer.addShape(this._assignHandle(new Line_1(x1, y1, x2, y2)));
        return this;
    }

    drawLine3d(x1, y1, z1, x2, y2, z2)
    {
        this.activeLayer.addShape(this._assignHandle(new Line3d_1(x1, y1, z1, x2, y2, z2)));
        return this;
    }

    drawPoint(x, y)
    {
        this.activeLayer.addShape(this._assignHandle(new Point_1(x, y)));
        return this;
    }

    drawRect(x1, y1, x2, y2, cornerLength, cornerBulge) {
        const w = x2 - x1;
        const h = y2 - y1;
        cornerBulge = cornerBulge || 0;
        let p = null;
        if (!cornerLength) {
            p = new Polyline_1([
                [x1, y1],
                [x1, y1 + h],
                [x1 + w, y1 + h],
                [x1 + w, y1]
            ], true);
        } else {
            p = new Polyline_1([
                [x1 + w - cornerLength, y1, cornerBulge],  // 1
                [x1 + w, y1 + cornerLength], // 2
                [x1 + w, y1 + h - cornerLength, cornerBulge], // 3
                [x1 + w - cornerLength, y1 + h], // 4
                [x1 + cornerLength, y1 + h, cornerBulge], // 5
                [x1, y1 + h - cornerLength], // 6
                [x1, y1 + cornerLength, cornerBulge], // 7
                [x1 + cornerLength, y1], // 8
            ], true);
        }

        this._assignHandle(p);
        this.activeLayer.addShape(p);
        return this;
    }

    /**
     * @param {number} x1 - Center x
     * @param {number} y1 - Center y
     * @param {number} r - radius
     * @param {number} startAngle - degree
     * @param {number} endAngle - degree
     */
    drawArc(x1, y1, r, startAngle, endAngle)
    {
        this.activeLayer.addShape(this._assignHandle(new Arc_1(x1, y1, r, startAngle, endAngle)));
        return this;
    }

    /**
     * @param {number} x1 - Center x
     * @param {number} y1 - Center y
     * @param {number} r - radius
     */
    drawCircle(x1, y1, r)
    {
        this.activeLayer.addShape(this._assignHandle(new Circle_1(x1, y1, r)));
        return this;
    }

    /**
     * @param {number} x1 - x
     * @param {number} y1 - y
     * @param {number} height - Text height
     * @param {number} rotation - Text rotation
     * @param {string} value - the string itself
     * @param {string} [horizontalAlignment="left"] left | center | right
     * @param {string} [verticalAlignment="baseline"] baseline | bottom | middle | top
     */
    drawText(x1, y1, height, rotation, value, horizontalAlignment = 'left',
             verticalAlignment = 'baseline')
    {
        this.activeLayer.addShape(this._assignHandle(
            new Text_1(x1, y1, height, rotation, value, horizontalAlignment, verticalAlignment)));
        return this;
    }

    /**
     * @param {array} points - Array of points like [ [x1, y1], [x2, y2]... ] 
     * @param {boolean} closed - Closed polyline flag
     * @param {number} startWidth - Default start width
     * @param {number} endWidth - Default end width
     */
    drawPolyline(points, closed = false, startWidth = 0, endWidth = 0)
    {
        const p = new Polyline_1(points, closed, startWidth, endWidth);
        this._assignHandle(p);
        this.activeLayer.addShape(p);
        return this;
    }

    /**
     * @param {array} points - Array of points like [ [x1, y1, z1], [x2, y2, z1]... ] 
     */
    drawPolyline3d(points)
    {
        points.forEach(point => {
            if (point.length !== 3){
                throw "Require 3D coordinate"
            }
        });
        const p = new Polyline3d_1(points);
        this._assignHandle(p);
        p.assignVertexHandles(this._generateHandle.bind(this));
        this.activeLayer.addShape(p);
        return this;
    }

    /**
     * 
     * @param {number} trueColor - Integer representing the true color, can be passed as an hexadecimal value of the form 0xRRGGBB
     */
    setTrueColor(trueColor)
    {
        this.activeLayer.setTrueColor(trueColor);
        return this;
    }

    /**
     * Draw a spline.
     * @param {[Array]} controlPoints - Array of control points like [ [x1, y1], [x2, y2]... ]
     * @param {number} degree - Degree of spline: 2 for quadratic, 3 for cubic. Default is 3
     * @param {[number]} knots - Knot vector array. If null, will use a uniform knot vector. Default is null
     * @param {[number]} weights - Control point weights. If provided, must be one weight for each control point. Default is null
     * @param {[Array]} fitPoints - Array of fit points like [ [x1, y1], [x2, y2]... ]
     */
    drawSpline(controlPoints, degree = 3, knots = null, weights = null, fitPoints = [])
    {
        this.activeLayer.addShape(this._assignHandle(
            new Spline_1(controlPoints, degree, knots, weights, fitPoints)));
        return this;
    }

    /**
     * Draw an ellipse.
    * @param {number} x1 - Center x
    * @param {number} y1 - Center y
    * @param {number} majorAxisX - Endpoint x of major axis, relative to center
    * @param {number} majorAxisY - Endpoint y of major axis, relative to center
    * @param {number} axisRatio - Ratio of minor axis to major axis
    * @param {number} startAngle - Start angle
    * @param {number} endAngle - End angle
    */
    drawEllipse(x1, y1, majorAxisX, majorAxisY, axisRatio, startAngle = 0, endAngle = 2 * Math.PI)
    {
        this.activeLayer.addShape(this._assignHandle(
            new Ellipse_1(x1, y1, majorAxisX, majorAxisY, axisRatio, startAngle, endAngle)));
        return this;
    }

    /**
     * @param {number} x1 - x
     * @param {number} y1 - y
     * @param {number} z1 - z
     * @param {number} x2 - x
     * @param {number} y2 - y
     * @param {number} z2 - z
     * @param {number} x3 - x
     * @param {number} y3 - y
     * @param {number} z3 - z
     * @param {number} x4 - x
     * @param {number} y4 - y
     * @param {number} z4 - z
     */
    drawFace(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4)
    {
        this.activeLayer.addShape(this._assignHandle(
            new Face_1(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4)));
        return this;
    }

    _generateHandle()
    {
        return ++this.handleCount
    }

    _assignHandle(entity)
    {
        entity.handle = this._generateHandle();
        return entity
    }

    _getDxfLtypeTable()
    {
        const t = new Table_1("LTYPE");
        t.handle = this.ltypeTableHandle;
        Object.values(this.lineTypes).forEach(v => t.add(v));
        return t.toDxfString()
    }

    _getDxfLayerTable()
    {
        const t = new Table_1("LAYER");
        t.handle = this.layerTableHandle;
        Object.values(this.layers).forEach(v => t.add(v));
        return t.toDxfString()
    }

     /**
      * @see https://www.autodesk.com/techpubs/autocad/acadr14/dxf/header_section_al_u05_c.htm
      * @see https://www.autodesk.com/techpubs/autocad/acad2000/dxf/header_section_group_codes_dxf_02.htm
      * 
      * @param {string} variable 
      * @param {array} values Array of "two elements arrays". [  [value1_GroupCode, value1_value], [value2_GroupCode, value2_value]  ]
      */
    header(variable, values) {
        this.headers[variable] = values;
        return this;
    }

    _getHeader(variable, values){
        let s = '9\n$'+ variable +'\n';

        for (let value of values) {
            s += `${value[0]}\n${value[1]}\n`;
        }

        return s;
    }

    /**
     * 
     * @param {string} unit see Drawing.UNITS
     */
    setUnits(unit) {
        (typeof Drawing.UNITS[unit] != 'undefined') ? Drawing.UNITS[unit]:Drawing.UNITS['Unitless'];
        this.header('INSUNITS', [[70, Drawing.UNITS[unit]]]);
        return this;
    }

    /** Generate additional DXF metadata which are required to successfully open resulted document
     * in AutoDesk products. Call this method before serializing the drawing to get the most
     * compatible result.
     */
    generateAutocadExtras() {
        if (!this.headers["ACADVER"]) {
            /* AutoCAD 2007 version. */
            this.header("ACADVER", [[1, "AC1021"]]);
        }

        if (!this.lineTypes["ByBlock"]) {
            this.addLineType("ByBlock", "", []);
        }
        if (!this.lineTypes["ByLayer"]) {
            this.addLineType("ByLayer", "", []);
        }

        let vpTable = this.tables["VPORT"];
        if (!vpTable) {
            vpTable = this.addTable("VPORT");
        }
        let styleTable = this.tables["STYLE"];
        if (!styleTable) {
            styleTable = this.addTable("STYLE");
        }
        if (!this.tables["VIEW"]) {
            this.addTable("VIEW");
        }
        if (!this.tables["UCS"]) {
            this.addTable("UCS");
        }
        let appIdTable = this.tables["APPID"];
        if (!appIdTable) {
            appIdTable = this.addTable("APPID");
        }
        if (!this.tables["DIMSTYLE"]) {
            const t = new DimStyleTable_1("DIMSTYLE");
            this._assignHandle(t);
            this.tables["DIMSTYLE"] = t;
        }

        vpTable.add(this._assignHandle(new Viewport_1("*ACTIVE", 1000)));

        /* Non-default text alignment is not applied without this entry. */
        styleTable.add(this._assignHandle(new TextStyle_1("standard")));

        appIdTable.add(this._assignHandle(new AppId_1("ACAD")));

        this.addBlock("*Model_Space");
        this.addBlock("*Paper_Space");

        const d = new Dictionary_1();
        this._assignHandle(d);
        this.dictionary.addChildDictionary("ACAD_GROUP", d);
    }

    toDxfString()
    {
        let s = '';

        //start section
        s += '0\nSECTION\n';
        //name section as HEADER section
        s += '2\nHEADER\n';

        s += this._getHeader("HANDSEED", [[5, (this.handleCount + 1).toString(16)]]);
        for (let header in this.headers) {
            s += this._getHeader(header, this.headers[header]);
        }

        //end section
        s += '0\nENDSEC\n';


        //start section
        s += '0\nSECTION\n';
        // Empty CLASSES section for compatibility
        s += '2\nCLASSES\n';
        //end section
        s += '0\nENDSEC\n';


        //start section
        s += '0\nSECTION\n';
        //name section as TABLES section
        s += '2\nTABLES\n';

        s += this._getDxfLtypeTable();
        s += this._getDxfLayerTable();

        for (const table of Object.values(this.tables)) {
            s += table.toDxfString();
        }

        let blockRecordTable = new Table_1("BLOCK_RECORD");
        blockRecordTable.handle = this.blockRecordTableHandle;
        Object.values(this.blocks).forEach(b => {
            const rec = new BlockRecord_1(b.name);
            rec.handle = b.recordHandle;
            blockRecordTable.add(rec);
        });
        s += blockRecordTable.toDxfString();

        //end section
        s += '0\nENDSEC\n';


        //start section
        s += '0\nSECTION\n';
        //name section as BLOCKS section
        s += '2\nBLOCKS\n';

        for (const block of  Object.values(this.blocks)) {
            s += block.toDxfString();
        }

        //end section
        s += '0\nENDSEC\n';


        //ENTITES section
        s += '0\nSECTION\n';
        s += '2\nENTITIES\n';

        for (const layer of Object.values(this.layers)) {
            s += layer.shapesToDxf();
        }

        s += '0\nENDSEC\n';


        //OBJECTS section
        s += '0\nSECTION\n';
        s += '2\nOBJECTS\n';
        s += this.dictionary.toDxfString();
        s += '0\nENDSEC\n';


        //close file
        s += '0\nEOF\n';

        return s;
    }

}

//AutoCAD Color Index (ACI)
//http://sub-atomic.com/~moses/acadcolors.html
Drawing.ACI =
{
    LAYER : 0,
    RED : 1,
    YELLOW : 2,
    GREEN : 3,
    CYAN : 4,
    BLUE : 5,
    MAGENTA : 6,
    WHITE : 7
};

Drawing.LINE_TYPES =
[
    {name: 'CONTINUOUS', description: '______', elements: []},
    {name: 'DASHED',    description: '_ _ _ ', elements: [5.0, -5.0]},
    {name: 'DOTTED',    description: '. . . ', elements: [0.0, -5.0]}
];

Drawing.LAYERS =
[
    {name: '0',  colorNumber: Drawing.ACI.WHITE, lineTypeName: 'CONTINUOUS'}
];

//https://www.autodesk.com/techpubs/autocad/acad2000/dxf/header_section_group_codes_dxf_02.htm
Drawing.UNITS = {
    'Unitless':0,
    'Inches':1,
    'Feet':2,
    'Miles':3,
    'Millimeters':4,
    'Centimeters':5,
    'Meters':6,
    'Kilometers':7,
    'Microinches':8,
    'Mils':9,
    'Yards':10,
    'Angstroms':11,
    'Nanometers':12,
    'Microns':13,
    'Decimeters':14,
    'Decameters':15,
    'Hectometers':16,
    'Gigameters':17,
    'Astronomical units':18,
    'Light years':19,
    'Parsecs':20
};

var Drawing_1 = Drawing;

var dxfWriter = Drawing_1;

const toDxf = async (geometry, options = {}) => {
  const drawing = new dxfWriter();
  const keptGeometry = toKeptGeometry(await geometry);
  for (const { paths } of getNonVoidPaths(keptGeometry)) {
    for (const path of paths) {
      for (const [[x1, y1], [x2, y2]] of getPathEdges(path)) {
        drawing.drawLine(x1, y1, x2, y2);
      }
    }
  }
  return drawing.toDxfString();
};

export { fromDxf, toDxf };
