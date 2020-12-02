const X = 0;
const Y = 1;

// The resolution is 1 / multiplier.
/** @type {function(multiplier:number):Normalizer} */
const createNormalize2 = (multiplier = 1e5) => {
  const map = new Map();
  const update = (key, value) => {
    if (!map.has(key)) {
      map.set(key, value);
    }
  };
  const normalize2 = (coordinate) => {
    // Apply a spatial quantization to the 2 dimensional coordinate.
    const nx = Math.floor(coordinate[X] * multiplier - 0.5);
    const ny = Math.floor(coordinate[Y] * multiplier - 0.5);
    // Look for an existing inhabitant.
    const value = map.get(`${nx}/${ny}`);
    if (value !== undefined) {
      return value;
    }
    // One of the ~0 or ~1 values will match the rounded values above.
    // The other will match the adjacent cell.
    const nx0 = nx;
    const ny0 = ny;
    const nx1 = nx + 1;
    const ny1 = ny + 1;
    // Populate the space of the quantized coordinate and its adjacencies.
    const normalized = coordinate;
    update(`${nx0}/${ny0}`, normalized);
    update(`${nx0}/${ny1}`, normalized);
    update(`${nx1}/${ny0}`, normalized);
    update(`${nx1}/${ny1}`, normalized);
    // This is now the normalized coordinate for this region.
    return normalized;
  };
  return normalize2;
};

const X$1 = 0;
const Y$1 = 1;
const Z = 2;

// The resolution is 1 / multiplier.
// export const createNormalize3 = (multiplier = 1e5) => {

/** @type {function():Normalizer} */
const createNormalize3 = (multiplier = 1e5 * 2) => {
  const map = new Map();
  const update = (key, value) => {
    if (!map.has(key)) {
      map.set(key, value);
    }
  };
  const normalize3 = (coordinate) => {
    // Apply a spatial quantization to the 2 dimensional coordinate.
    const nx = Math.floor(coordinate[X$1] * multiplier - 0.5);
    const ny = Math.floor(coordinate[Y$1] * multiplier - 0.5);
    const nz = Math.floor(coordinate[Z] * multiplier - 0.5);
    // Look for an existing inhabitant.
    const value = map.get(`${nx}/${ny}/${nz}`);
    if (value !== undefined) {
      return value;
    }
    // One of the ~0 or ~1 values will match the rounded values above.
    // The other will match the adjacent cell.
    const nx0 = nx;
    const ny0 = ny;
    const nz0 = nz;
    const nx1 = nx + 1;
    const ny1 = ny + 1;
    const nz1 = nz + 1;
    // Populate the space of the quantized coordinate and its adjacencies.
    const normalized = coordinate;
    update(`${nx0}/${ny0}/${nz0}`, normalized);
    update(`${nx0}/${ny0}/${nz1}`, normalized);
    update(`${nx0}/${ny1}/${nz0}`, normalized);
    update(`${nx0}/${ny1}/${nz1}`, normalized);
    update(`${nx1}/${ny0}/${nz0}`, normalized);
    update(`${nx1}/${ny0}/${nz1}`, normalized);
    update(`${nx1}/${ny1}/${nz0}`, normalized);
    update(`${nx1}/${ny1}/${nz1}`, normalized);
    // This is now the normalized coordinate for this region.
    return normalized;
  };
  return normalize3;
};

export { createNormalize2, createNormalize3 };
