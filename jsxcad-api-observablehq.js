import { staticView, dataUrl, image, orbitView } from './jsxcad-ui-threejs.js';
import Shape from './jsxcad-api-v1-shape.js';
import * as v1 from './jsxcad-api-v1.js';
import { boot } from './jsxcad-sys.js';

const bigViewMethod = async function ({
  width = 512,
  height = 256,
  position = [100, -100, 100],
} = {}) {
  return staticView(this, { width, height, position });
};
const bigTopViewMethod = async function ({
  width = 512,
  height = 256,
  position = [0, 0, 100],
} = {}) {
  return staticView(this, { width, height, position });
};
const viewMethod = async function ({
  width = 256,
  height = 128,
  position = [100, -100, 100],
} = {}) {
  return staticView(this, { width, height, position });
};
const topViewMethod = async function ({
  width = 256,
  height = 128,
  position = [0, 0, 100],
} = {}) {
  return staticView(this, { width, height, position });
};
const frontViewMethod = async function ({
  width = 256,
  height = 128,
  position = [0, -100, 0],
} = {}) {
  return staticView(this, { width, height, position });
};

Shape.prototype.view = viewMethod;
Shape.prototype.bigView = bigViewMethod;
Shape.prototype.topView = topViewMethod;
Shape.prototype.bigTopView = bigTopViewMethod;
Shape.prototype.frontView = frontViewMethod;

const bigDataUrlMethod = async function ({
  width = 512,
  height = 256,
  position = [100, -100, 100],
} = {}) {
  return dataUrl(this, { width, height, position });
};
const bigTopDataUrlMethod = async function ({
  width = 512,
  height = 256,
  position = [0, 0, 100],
} = {}) {
  return dataUrl(this, { width, height, position });
};
const dataUrlMethod = async function ({
  width = 256,
  height = 128,
  position = [100, -100, 100],
} = {}) {
  return dataUrl(this, { width, height, position });
};
const topDataUrlMethod = async function ({
  width = 256,
  height = 128,
  position = [0, 0, 100],
} = {}) {
  return dataUrl(this, { width, height, position });
};
const frontDataUrlMethod = async function ({
  width = 256,
  height = 128,
  position = [0, -100, 0],
} = {}) {
  return dataUrl(this, { width, height, position });
};

Shape.prototype.dataUrl = dataUrlMethod;
Shape.prototype.bigDataUrl = bigDataUrlMethod;
Shape.prototype.topDataUrl = topDataUrlMethod;
Shape.prototype.bigTopDataUrl = bigTopDataUrlMethod;
Shape.prototype.frontDataUrl = frontDataUrlMethod;

const bigImageMethod = async function ({
  width = 512,
  height = 256,
  position = [100, -100, 100],
} = {}) {
  return image(this, { width, height, position });
};
const bigTopImageMethod = async function ({
  width = 512,
  height = 256,
  position = [0, 0, 100],
} = {}) {
  return image(this, { width, height, position });
};
const imageMethod = async function ({
  width = 256,
  height = 128,
  position = [100, -100, 100],
} = {}) {
  return image(this, { width, height, position });
};
const topImageMethod = async function ({
  width = 256,
  height = 128,
  position = [0, 0, 100],
} = {}) {
  return image(this, { width, height, position });
};
const frontImageMethod = async function ({
  width = 256,
  height = 128,
  position = [0, -100, 0],
} = {}) {
  return image(this, { width, height, position });
};

Shape.prototype.image = imageMethod;
Shape.prototype.bigImage = bigImageMethod;
Shape.prototype.topImage = topImageMethod;
Shape.prototype.bigTopImage = bigTopImageMethod;
Shape.prototype.frontImage = frontImageMethod;

const orbitViewMethod = async function ({
  width = 512,
  height = 512,
  position = [0, -100, 0],
} = {}) {
  return orbitView(this, { width, height, position });
};
const bigOrbitViewMethod = async function ({
  width = 1024,
  height = 1024,
  position = [0, -100, 0],
} = {}) {
  return orbitView(this, { width, height, position });
};

Shape.prototype.orbitView = orbitViewMethod;
Shape.prototype.bigOrbitView = bigOrbitViewMethod;

/**
 *
 * Defines the interface used by the api to access the rest of the system on
 * behalf of a user. e.g., algorithms and geometries.
 *
 * A user can destructively update this mapping in their code to change what
 * the api uses.
 */

const api = async () => {
  await boot();
  return { ...v1 };
};

export { api };
