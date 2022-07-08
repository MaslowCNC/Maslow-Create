import { fromPolygons } from './jsxcad-geometry.js';

// First line (optional): the letters OFF to mark the file type.
// Second line: the number of vertices, number of faces, and number of edges, in order (the latter can be ignored by writing 0 instead).
// List of vertices: X, Y and Z coordinates.
// List of faces: number of vertices, followed by the indexes of the composing vertices, in order (indexed from zero).
// Optionally, the RGB values for the face color can follow the elements of the faces.

const split = (text) => text.match(/\S+/g) || [];

const fromOffSync = (data) => {
  const text = new TextDecoder('utf8').decode(data);
  let line = 0;
  const lines = text.split('\n').filter((line) => !line.startsWith('#'));
  if (lines[line++] !== 'OFF') {
    throw Error('Not OFF');
  }
  const [vertexCount = 0, faceCount = 0] = lines[line++]
    .split(' ')
    .map((span) => parseInt(span, 10));
  const points = [];
  for (let nth = 0; nth < vertexCount; nth++) {
    const text = lines[line++];
    const [x, y, z] = split(text);
    points[nth] = [parseFloat(x), parseFloat(y), parseFloat(z)];
  }
  const polygons = [];
  for (let nthFacet = 0; nthFacet < faceCount; nthFacet++) {
    const [, /* vertexCount */ ...vertices] = split(lines[line++]).map((span) =>
      parseInt(span, 10)
    );
    const polygon = vertices.map((nthVertex) => points[nthVertex]);
    polygons.push({ points: polygon });
  }
  return fromPolygons(polygons);
};

const fromOff = async (data) => fromOffSync(data);

export { fromOff, fromOffSync };
