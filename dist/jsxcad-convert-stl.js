import { taggedPaths, taggedGraph, toDisjointGeometry, getNonVoidGraphs } from './jsxcad-geometry-tagged.js';
import { fromPolygons, toTriangles } from './jsxcad-geometry-graph.js';
import { toPlane } from './jsxcad-math-poly3.js';

function parse(str) {
  if(typeof str !== 'string') {
    str = str.toString();
  }

  var positions = [];
  var cells = [];
  var faceNormals = [];
  var name = null;

  var lines = str.split('\n');
  var cell = [];

  for(var i=0; i<lines.length; i++) {

    var parts = lines[i]
      .trim()
      .split(' ')
      .filter(function(part) {
        return part !== '';
      });

    switch(parts[0]) {
      case 'solid':
        name = parts.slice(1).join(' ');
        break;
      case 'facet':
        var normal = parts.slice(2).map(Number);
        faceNormals.push(normal);
        break;
      case 'vertex':
        var position = parts.slice(1).map(Number);
        cell.push(positions.length);
        positions.push(position);
        break;
      case 'endfacet':
        cells.push(cell);
        cell = [];
        // skip
    }
  }

  return {
    positions: positions,
    cells: cells,
    faceNormals: faceNormals,
    name: name
  };
}

var parseStlAscii = parse;

// Adapted for ArrayBuffer from parse-stl-binary version ^1.0.1.

const LITTLE_ENDIAN = true;

const readVector = (view, off) => [
  view.getFloat32(off + 0, LITTLE_ENDIAN),
  view.getFloat32(off + 4, LITTLE_ENDIAN),
  view.getFloat32(off + 8, LITTLE_ENDIAN),
];

const parse$1 = (data) => {
  const view = new DataView(data.buffer);
  var off = 80; // skip header

  var triangleCount = view.getUint32(off, LITTLE_ENDIAN);
  off += 4;

  var cells = [];
  var positions = [];
  var faceNormals = [];

  for (var i = 0; i < triangleCount; i++) {
    var cell = [];
    var normal = readVector(view, off);
    off += 12; // 3 floats

    faceNormals.push(normal);

    for (var j = 0; j < 3; j++) {
      var position = readVector(view, off);
      off += 12;
      cell.push(positions.length);
      positions.push(position);
    }

    cells.push(cell);
    off += 2; // skip attribute byte count
  }

  return {
    positions: positions,
    cells: cells,
    faceNormals: faceNormals,
  };
};

const toParser = (format) => {
  switch (format) {
    case 'ascii':
      return (data) => parseStlAscii(new TextDecoder('utf8').decode(data));
    case 'binary':
      return parse$1;
    default:
      throw Error('die');
  }
};

const fromStl = async (
  stl,
  { format = 'ascii', geometry = 'graph' } = {}
) => {
  const parse = toParser(format);
  const { positions, cells } = parse(stl);
  const polygons = [];
  for (const [a, b, c] of cells) {
    const pa = positions[a];
    const pb = positions[b];
    const pc = positions[c];
    if (pa.some((value) => !isFinite(value))) continue;
    if (pb.some((value) => !isFinite(value))) continue;
    if (pc.some((value) => !isFinite(value))) continue;
    polygons.push([[...pa], [...pb], [...pc]]);
  }
  for (const polygon of polygons) {
    for (const point of polygon) {
      for (const value of point) {
        if (!isFinite(value)) {
          throw Error('die');
        }
      }
    }
  }
  switch (geometry) {
    case 'graph':
      return taggedGraph({}, fromPolygons(polygons));
    case 'paths':
      return taggedPaths({}, polygons);
    default:
      throw Error(`Unknown geometry type ${geometry}`);
  }
};

const convertToFacets = (polygons) =>
  polygons
    .map(convertToFacet)
    .filter((facet) => facet !== undefined)
    .join('\n');

const toStlVector = (vector) => `${vector[0]} ${vector[1]} ${vector[2]}`;

const toStlVertex = (vertex) => `vertex ${toStlVector(vertex)}`;

const convertToFacet = (polygon) => {
  const plane = toPlane(polygon);
  if (plane !== undefined) {
    return (
      `facet normal ${toStlVector(toPlane(polygon))}\n` +
      `outer loop\n` +
      `${toStlVertex(polygon[0])}\n` +
      `${toStlVertex(polygon[1])}\n` +
      `${toStlVertex(polygon[2])}\n` +
      `endloop\n` +
      `endfacet`
    );
  }
};

const toStl = async (geometry, options = {}) => {
  const keptGeometry = toDisjointGeometry(await geometry);
  const triangles = [];
  for (const { graph } of getNonVoidGraphs(keptGeometry)) {
    triangles.push(...toTriangles(graph));
  }
  const output = `solid JSxCAD\n${convertToFacets(
    triangles
  )}\nendsolid JSxCAD\n`;
  return new TextEncoder('utf8').encode(output);
};

export { fromStl, toStl };
