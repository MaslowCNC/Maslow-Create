const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// radians = degrees * PI / 180
const degToRad = (degrees) => degrees * 0.017453292519943295;

// TODO: Clean this up.
const quantizeForSpace = (value) => value;

// degrees = radians * 180 / PI
const radToDeg = (radians) => radians * 57.29577951308232;

const spatialResolution = 1e5;

// Quantize values for use in spatial coordinates, and so on, even if the usual quantizeForSpace is disabled.
const reallyQuantizeForSpace = (value) =>
  Math.round(value * spatialResolution) / spatialResolution;

const solve2Linear = (a, b, c, d, u, v) => {
  const det = a * d - b * c;
  const invdet = 1.0 / det;
  const x = u * d - b * v;
  const y = -u * c + a * v;
  return [x * invdet, y * invdet];
};

export { clamp, degToRad, quantizeForSpace, radToDeg, reallyQuantizeForSpace, solve2Linear };
