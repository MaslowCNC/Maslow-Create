import { multiply, fromTranslation, fromScaling } from './jsxcad-math-mat4.js';
import { toKeptGeometry, transform, getNonVoidSurfaces, getNonVoidGraphs, outline, getNonVoidPaths } from './jsxcad-geometry-tagged.js';
import { toRgbFromTags } from './jsxcad-algorithm-color.js';

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
  scale = 1,
  width = 210,
  height = 297,
  trim = 5,
  lineWidth = 0.096,
}) => {
  const mediaX1 = 0 * scale;
  const mediaY1 = 0 * scale;
  const mediaX2 = width * scale;
  const mediaY2 = height * scale;
  const trimX1 = trim * scale;
  const trimY1 = trim * scale;
  const trimX2 = (width - trim) * scale;
  const trimY2 = (height - trim) * scale;
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
  // This is the size of a post-script point in mm.
  const pointSize = 0.352777778;
  const scale = 1 / pointSize;
  const [width, height] = size;
  const lines = [];
  const matrix = multiply(
    fromTranslation([(width * scale) / 2, (height * scale) / 2, 0]),
    fromScaling([scale, scale, scale])
  );
  const keptGeometry = toKeptGeometry(transform(matrix, await geometry));
  for (const surface of [
    ...getNonVoidSurfaces(keptGeometry),
    ...getNonVoidGraphs(keptGeometry),
  ]) {
    for (const { tags, paths } of outline(surface)) {
      lines.push(toFillColor(toRgbFromTags(tags, definitions, black)));
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
        lines.push(`h`); // Surface paths are always closed.
      }
      lines.push(`f`); // Surface paths are always filled.
    }
  }
  for (const { tags, paths } of getNonVoidPaths(keptGeometry)) {
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
    .concat(header({ scale, width, height, lineWidth }), lines, footer)
    .join('\n');
  return new TextEncoder('utf8').encode(output);
};

export { toPdf };
