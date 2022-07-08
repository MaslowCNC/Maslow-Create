import { measureBoundingBox, section, disjoint, scale, linearize, isNotTypeGhost, transformCoordinate, transformingCoordinates } from './jsxcad-geometry.js';
import { toRgbFromTags } from './jsxcad-algorithm-color.js';

const X = 0;
const Y = 1;

const toFillColor = (rgb) =>
  `${(rgb[0] / 255).toFixed(9)} ${(rgb[1] / 255).toFixed(9)} ${(
    rgb[2] / 255
  ).toFixed(9)} rg`;
const toStrokeColor = (rgb) =>
  `${(rgb[0] / 255).toFixed(9)} ${(rgb[1] / 255).toFixed(9)} ${(
    rgb[2] / 255
  ).toFixed(9)} RG`;

const black = [0, 0, 0];

// Not entirely sure how conformant this is, but it seems to work for simple
// cases.

// Width and height are in post-script points.
const header = ({
  min,
  max,
  scale = 1,
  width = 210,
  height = 297,
  trim = 5,
  lineWidth = 0.096,
}) => {
  const mediaX1 = (min[X] - trim) * scale;
  const mediaY1 = (min[Y] - trim) * scale;
  const mediaX2 = (max[X] + trim) * scale;
  const mediaY2 = (max[Y] + trim) * scale;
  const trimX1 = min[X] * scale;
  const trimY1 = min[Y] * scale;
  const trimX2 = max[X] * scale;
  const trimY2 = max[Y] * scale;
  return [
    `%PDF-1.5`,
    `1 0 obj << /Pages 2 0 R /Type /Catalog >> endobj`,
    `2 0 obj << /Count 1 /Kids [ 3 0 R ] /Type /Pages >> endobj`,
    `3 0 obj <<`,
    `  /Contents 4 0 R`,
    `  /MediaBox [ ${mediaX1.toFixed(9)} ${mediaY1.toFixed(
      9
    )} ${mediaX2.toFixed(9)} ${mediaY2.toFixed(9)} ]`,
    `  /TrimBox [ ${trimX1.toFixed(9)} ${trimY1.toFixed(9)} ${trimX2.toFixed(
      9
    )} ${trimY2.toFixed(9)} ]`,
    `  /Parent 2 0 R`,
    `  /Type /Page`,
    `>>`,
    `endobj`,
    `4 0 obj << >>`,
    `stream`,
    `${lineWidth.toFixed(9)} w`,
  ];
};

const footer = [
  `endstream`,
  `endobj`,
  `trailer << /Root 1 0 R /Size 4 >>`,
  `%%EOF`,
];

const toPdf = async (
  geometry,
  { lineWidth = 0.096, size = [210, 297], definitions } = {}
) => {
  const [min, max] = measureBoundingBox(geometry);
  // This is the size of a post-script point in mm.
  const pointSize = 0.352777778;
  const scale$1 = 1 / pointSize;
  const width = max[X] - min[X];
  const height = max[Y] - min[Y];
  const lines = [];
  const section$1 = section(await geometry, [
    { type: 'points', tags: [] },
  ]);
  const disjoint$1 = disjoint([section$1]);
  const prepared = scale([scale$1, scale$1, scale$1], disjoint$1);

  for (const { matrix, tags, polygonsWithHoles } of linearize(
    prepared,
    (geometry) =>
      geometry.type === 'polygonsWithHoles' && isNotTypeGhost(geometry)
  )) {
    for (const { points, holes } of polygonsWithHoles) {
      lines.push(toFillColor(toRgbFromTags(tags, definitions, black)));
      lines.push(toStrokeColor(toRgbFromTags(tags, definitions, black)));
      const drawLines = (points) => {
        points.forEach(
          transformingCoordinates(matrix, ([x, y, z], nth) => {
            if (nth === 0) {
              lines.push(`${x.toFixed(9)} ${y.toFixed(9)} m`); // move-to.
            } else {
              lines.push(`${x.toFixed(9)} ${y.toFixed(9)} l`); // line-to.
            }
          })
        );
        lines.push(`h`); // Polygons are always closed.
      };
      drawLines(points);
      for (const { points } of holes) {
        drawLines(points);
      }
      // This should be controlled by tags.
      lines.push(`f`); // Surface paths are always filled.
    }
  }

  for (const { matrix, tags, segments } of linearize(
    prepared,
    (geometry) => geometry.type === 'segments' && isNotTypeGhost(geometry)
  )) {
    lines.push(toStrokeColor(toRgbFromTags(tags, definitions, black)));
    let last;
    for (let [start, end] of segments) {
      start = transformCoordinate(start, matrix);
      end = transformCoordinate(end, matrix);
      if (!last || start[X] !== last[X] || start[Y] !== last[Y]) {
        if (last) {
          lines.push(`S`); // stroke.
        }
        lines.push(`${start[X].toFixed(9)} ${start[Y].toFixed(9)} m`); // move-to.
      }
      lines.push(`${end[X].toFixed(9)} ${end[Y].toFixed(9)} l`); // line-to.
      last = end;
    }
    lines.push(`S`); // stroke.
  }

  const output = []
    .concat(
      header({ scale: scale$1, min, max, width, height, lineWidth }),
      lines,
      footer
    )
    .join('\n');
  return new TextEncoder('utf8').encode(output);
};

export { toPdf };
