import { measureBoundingBox, toDisjointGeometry, translate, scale, toPolygonsWithHoles, getNonVoidPaths } from './jsxcad-geometry.js';
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
  const disjointGeometry = toDisjointGeometry(
    translate(
      [1, 1, 0],
      scale([scale$1, scale$1, scale$1], await geometry)
    )
  );
  for (const { tags, polygonsWithHoles } of toPolygonsWithHoles(
    disjointGeometry
  )) {
    for (const { points, holes } of polygonsWithHoles) {
      lines.push(toFillColor(toRgbFromTags(tags, definitions, black)));
      lines.push(toStrokeColor(toRgbFromTags(tags, definitions, black)));
      const drawLines = (points) => {
        points.forEach(([x, y], nth) => {
          if (nth === 0) {
            lines.push(`${x.toFixed(9)} ${y.toFixed(9)} m`); // move-to.
          } else {
            lines.push(`${x.toFixed(9)} ${y.toFixed(9)} l`); // line-to.
          }
        });
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
  for (const { tags, paths } of getNonVoidPaths(disjointGeometry)) {
    lines.push(toStrokeColor(toRgbFromTags(tags, definitions, black)));
    for (const path of paths) {
      let nth = path[0] === null ? 1 : 0;
      if (nth >= path.length) {
        continue;
      }
      const [x1, y1] = path[nth];
      lines.push(`${x1.toFixed(9)} ${y1.toFixed(9)} m`); // move-to.
      for (nth++; nth < path.length; nth++) {
        const [x2, y2] = path[nth];
        lines.push(`${x2.toFixed(9)} ${y2.toFixed(9)} l`); // line-to.
      }
      if (path[0] !== null) {
        // A leading null indicates an open path.
        lines.push(`h`); // close path.
      }
      lines.push(`S`); // stroke.
    }
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
