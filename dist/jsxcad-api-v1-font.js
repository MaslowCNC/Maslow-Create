import { Shape } from './jsxcad-api-shape.js';
import { read } from './jsxcad-sys.js';
import { toFont } from './jsxcad-algorithm-text.js';

// TODO: (await readFont(...))({ emSize: 16 })("CA");

/**
 *
 * # Read Font
 *
 * readFont reads in a font and produces a function that renders text as a surface with that font.
 *
 * The rendering function takes an option defaulting to { emSize = 10 } and a string of text.
 * This means that one M is 10 mm in height.
 *
 * ::: illustration { "view": { "position": [-50, -50, 50] } }
 * ```
 * const greatVibes = await readFont('font/great-vibes/GreatVibes-Regular.ttf');
 * greatVibes(20)("M").extrude(5).rotateX(90).above().center()
 * ```
 * :::
 * ::: illustration { "view": { "position": [0, -1, 100] } }
 * ```
 * const greatVibes = await readFont('font/great-vibes/GreatVibes-Regular.ttf');
 * greatVibes(10)("M").center()
 * ```
 * :::
 * ::: illustration { "view": { "position": [0, -1, 100] } }
 * ```
 * const greatVibes = await readFont('font/great-vibes/GreatVibes-Regular.ttf');
 * greatVibes(20)("M").center()
 * ```
 * :::
 * ::: illustration { "view": { "position": [0, -1, 50] } }
 * ```
 * const greatVibes = await readFont('font/great-vibes/GreatVibes-Regular.ttf');
 * greatVibes(16)("CA").center()
 * ```
 * :::
 *
 **/

const toEmSizeFromMm = (mm) => mm * 1.5;

const readFont = async (path) => {
  let data = await read(`source/${path}`, { sources: [path] });
  const font = toFont({ path }, data);
  return font;
  // const fontFactory = (size = 1) => (text) =>
  //  Shape.fromGeometry(font({ emSize: toEmSizeFromMm(size) }, text));
  // return fontFactory;
};

const Text = (font, text, size = 10) =>
  Shape.fromGeometry(font({ emSize: toEmSizeFromMm(size) }, text));

export { Text, readFont };
