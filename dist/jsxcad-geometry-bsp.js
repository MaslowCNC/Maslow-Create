import { toPolygons, alignVertices, fromPolygons as fromPolygons$1 } from './jsxcad-geometry-solid.js';
import { equals, splitLineByPlane, toPolygon } from './jsxcad-math-plane.js';
import { pushWhenValid, doesNotOverlap, measureBoundingBox, flip } from './jsxcad-geometry-polygons.js';
import { toPlane } from './jsxcad-math-poly3.js';
import { max, min, scale, add, subtract, dot as dot$1 } from './jsxcad-math-vec3.js';
import { createNormalize3 } from './jsxcad-algorithm-quantize.js';
import { toPlane as toPlane$1, translate, flip as flip$1 } from './jsxcad-geometry-surface.js';
import { getEdges, createOpenPath } from './jsxcad-geometry-path.js';
import { outlineSurface } from './jsxcad-geometry-halfedge.js';

const EPSILON = 1e-5;
// const EPSILON2 = 1e-10;

const COPLANAR = 1; // Neither front nor back.
const FRONT = 2;
const BACK = 4;

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// const toType = (plane, point) => {
//   // const t = planeDistance(plane, point);
//   const t = plane[0] * point[0] + plane[1] * point[1] + plane[2] * point[2] - plane[3];
//   if (t < -EPSILON) {
//     return BACK;
//   } else if (t > EPSILON) {
//     return FRONT;
//   } else {
//     return COPLANAR;
//   }
// };

const pointType = [];

const splitPolygon = (
  normalize,
  plane,
  polygon,
  back,
  abutting,
  overlapping,
  front
) => {
  /*
    // This slows things down on average, probably due to not having the bounding sphere computed.
    // Check for non-intersection due to distance from the plane.
    const [center, radius] = measureBoundingSphere(polygon);
    let distance = planeDistance(plane, center) + EPSILON;
    if (distance > radius) {
      front.push(polygon);
      return;
    } else if (distance < -radius) {
      back.push(polygon);
      return;
    }
  */
  let polygonType = COPLANAR;
  const polygonPlane = toPlane(polygon);
  if (polygonPlane === undefined) {
    // Degenerate polygon
    return;
  }
  if (!equals(polygonPlane, plane)) {
    for (let nth = 0; nth < polygon.length; nth++) {
      // const type = toType(plane, polygon[nth]);
      // const t = planeDistance(plane, point);
      const point = polygon[nth];
      const t =
        plane[0] * point[0] +
        plane[1] * point[1] +
        plane[2] * point[2] -
        plane[3];
      if (t < -EPSILON) {
        polygonType |= BACK;
        pointType[nth] = BACK;
      } else if (t > EPSILON) {
        polygonType |= FRONT;
        pointType[nth] = FRONT;
      } else {
        polygonType |= COPLANAR;
        pointType[nth] = COPLANAR;
      }
    }
  }

  // Put the polygon in the correct list, splitting it when necessary.
  switch (polygonType) {
    case COPLANAR:
      if (dot(plane, polygonPlane) > 0) {
        // The plane and the polygon face the same way, so the spaces overlap.
        overlapping.push(polygon);
      } else {
        // The plane and the polygon face the opposite directions, so the spaces abut.
        abutting.push(polygon);
      }
      return;
    case FRONT:
      front.push(polygon);
      return;
    case BACK:
      back.push(polygon);
      return;
    default: {
      // SPANNING
      const frontPoints = [];
      const backPoints = [];

      const last = polygon.length - 1;
      let startPoint = polygon[last];
      let startType = pointType[last];
      for (let nth = 0; nth < polygon.length; nth++) {
        const endPoint = polygon[nth];
        const endType = pointType[nth];
        if (startType !== BACK) {
          // The inequality is important as it includes COPLANAR points.
          frontPoints.push(startPoint);
        }
        if (startType !== FRONT) {
          // The inequality is important as it includes COPLANAR points.
          backPoints.push(startPoint);
        }
        if (
          (startType === FRONT && endType !== FRONT) ||
          (startType === BACK && endType !== BACK)
        ) {
          // This should include COPLANAR points.
          // Compute the point that touches the splitting plane.
          const spanPoint = normalize(
            splitLineByPlane(plane, startPoint, endPoint)
          );
          frontPoints.push(spanPoint);
          backPoints.push(spanPoint);
        }
        startPoint = endPoint;
        startType = endType;
      }
      pushWhenValid(front, frontPoints, polygonPlane);
      pushWhenValid(back, backPoints, polygonPlane);
    }
  }
};

const BRANCH = 0;
const IN_LEAF = 1;
const OUT_LEAF = 2;

/**
 * @typedef {object} Bsp
 * @property {Plane} plane
 * @property {Polygon[]} same
 * @property {BRANCH|IN_LEAF|OUT_LEAF} kind
 * @property {Bsp} back
 * @property {Bsp} front
 */

const X = 0;
const Y = 1;
const Z = 2;

/** @type {Bsp} */
const inLeaf = {
  plane: null,
  same: [],
  kind: IN_LEAF,
  back: null,
  front: null,
};

/** @type {Bsp} */
const outLeaf = {
  plane: null,
  same: [],
  kind: OUT_LEAF,
  back: null,
  front: null,
};

const fromBoundingBoxes = (
  [aMin, aMax],
  [bMin, bMax],
  front = outLeaf,
  back = inLeaf
) => {
  const cMin = max(aMin, bMin);
  const cMax = min(aMax, bMax);
  const bsp = {
    // Bottom
    kind: BRANCH,
    plane: [0, 0, -1, -cMin[Z] + EPSILON * 1000],
    front,
    back: {
      // Top
      kind: BRANCH,
      plane: [0, 0, 1, cMax[Z] + EPSILON * 1000],
      front,
      back: {
        // Left
        kind: BRANCH,
        plane: [-1, 0, 0, -cMin[X] + EPSILON * 1000],
        front,
        back: {
          // Right
          kind: BRANCH,
          plane: [1, 0, 0, cMax[X] + EPSILON * 1000],
          front,
          back: {
            // Back
            kind: BRANCH,
            plane: [0, -1, 0, -cMin[Y] + EPSILON * 1000],
            front,
            back: {
              // Front
              kind: BRANCH,
              plane: [0, 1, 0, cMax[Y] + EPSILON * 1000],
              front: outLeaf,
              back,
            },
          },
        },
      },
    },
  };
  return bsp;
};

/**
 * Builds a BspTree from polygon soup.
 * The bsp tree is constructed from the planes of the polygons.
 * The polygons allow us to determine when a half-plane is uninhabited.
 */
const fromPolygonsToBspTree = (polygons, normalize) => {
  if (polygons.length === 0) {
    // Everything is outside of an empty geometry.
    return outLeaf;
  }
  let same = [];
  let front = [];
  let back = [];
  let plane = toPlane(polygons[polygons.length >> 1]);

  if (plane === undefined) {
    throw Error('die');
  }

  for (const polygon of polygons) {
    splitPolygon(
      normalize,
      plane,
      polygon,
      /* back= */ back,
      /* abutting= */ back,
      /* overlapping= */ same,
      /* front= */ front
    );
  }

  const bsp = {
    back: back.length === 0 ? inLeaf : fromPolygonsToBspTree(back, normalize),
    front:
      front.length === 0 ? outLeaf : fromPolygonsToBspTree(front, normalize),
    kind: BRANCH,
    plane,
    same,
  };

  return bsp;
};

const fromPolygons = (polygons, normalize) =>
  fromPolygonsToBspTree(polygons, normalize);

const fromSolid = (solid, normalize) => {
  const polygons = [];
  for (const surface of solid) {
    polygons.push(...surface);
  }
  return fromPolygons(polygons, normalize);
};

const fromSolids = (solids, normalize) => {
  const polygons = [];
  for (const solid of solids) {
    for (const surface of solid) {
      polygons.push(...surface);
    }
  }
  return fromPolygons(polygons, normalize);
};

const keepIn = (polygons) => {
  for (const polygon of polygons) {
    polygon.leaf = inLeaf;
  }
  return polygons;
};

const keepOut = (polygons) => {
  for (const polygon of polygons) {
    polygon.leaf = outLeaf;
  }
  return polygons;
};

// Merge the result of a split.
const merge = (front, back) => {
  const merged = [];
  const scan = (polygons) => {
    for (const polygon of polygons) {
      if (polygon.leaf) {
        if (polygon.sibling && polygon.sibling.leaf === polygon.leaf) {
          polygon.parent.leaf = polygon.leaf;
          polygon.leaf = null;
          polygon.sibling.leaf = undefined;
          merged.push(polygon.parent);
        } else {
          merged.push(polygon);
        }
      }
    }
  };
  scan(front);
  scan(back);
  return merged;
};

const clean = (polygons) => {
  for (const polygon of polygons) {
    delete polygon.parent;
    delete polygon.sibling;
  }
  return polygons;
};

const removeInteriorPolygonsForUnionKeepingOverlap = (
  bsp,
  polygons,
  normalize
) => {
  if (bsp === inLeaf) {
    return [];
  } else if (bsp === outLeaf) {
    return keepOut(polygons);
  } else {
    const front = [];
    const back = [];
    for (let i = 0; i < polygons.length; i++) {
      splitPolygon(
        normalize,
        bsp.plane,
        polygons[i],
        /* back= */ back,
        /* abutting= */ back,
        /* overlapping= */ front,
        /* front= */ front
      );
    }
    const trimmedFront = removeInteriorPolygonsForUnionKeepingOverlap(
      bsp.front,
      front,
      normalize
    );
    const trimmedBack = removeInteriorPolygonsForUnionKeepingOverlap(
      bsp.back,
      back,
      normalize
    );

    if (trimmedFront.length === 0) {
      return trimmedBack;
    } else if (trimmedBack.length === 0) {
      return trimmedFront;
    } else {
      return merge(trimmedFront, trimmedBack);
    }
  }
};

const removeInteriorPolygonsForUnionDroppingOverlap = (
  bsp,
  polygons,
  normalize
) => {
  if (bsp === inLeaf) {
    return [];
  } else if (bsp === outLeaf) {
    return keepOut(polygons);
  } else {
    const front = [];
    const back = [];
    for (let i = 0; i < polygons.length; i++) {
      splitPolygon(
        normalize,
        bsp.plane,
        polygons[i],
        /* back= */ back,
        /* abutting= */ back,
        /* overlapping= */ back,
        /* front= */ front
      );
    }
    const trimmedFront = removeInteriorPolygonsForUnionDroppingOverlap(
      bsp.front,
      front,
      normalize
    );
    const trimmedBack = removeInteriorPolygonsForUnionDroppingOverlap(
      bsp.back,
      back,
      normalize
    );

    if (trimmedFront.length === 0) {
      return trimmedBack;
    } else if (trimmedBack.length === 0) {
      return trimmedFront;
    } else {
      return merge(trimmedFront, trimmedBack);
    }
  }
};

const removeExteriorPolygonsForSection = (bsp, polygons, normalize) => {
  if (bsp === inLeaf) {
    return keepIn(polygons);
  } else if (bsp === outLeaf) {
    return [];
  } else {
    const front = [];
    const back = [];
    for (let i = 0; i < polygons.length; i++) {
      splitPolygon(
        normalize,
        bsp.plane,
        polygons[i],
        /* back= */ back,
        /* abutting= */ front,
        /* overlapping= */ back,
        /* front= */ front
      );
    }
    const trimmedFront = removeExteriorPolygonsForSection(
      bsp.front,
      front,
      normalize
    );
    const trimmedBack = removeExteriorPolygonsForSection(
      bsp.back,
      back,
      normalize
    );

    if (trimmedFront.length === 0) {
      return trimmedBack;
    } else if (trimmedBack.length === 0) {
      return trimmedFront;
    } else {
      return merge(trimmedFront, trimmedBack);
    }
  }
};

const removeExteriorPolygonsForCutDroppingOverlap = (
  bsp,
  polygons,
  normalize
) => {
  if (bsp === inLeaf) {
    return keepIn(polygons);
  } else if (bsp === outLeaf) {
    return [];
  } else {
    const front = [];
    const back = [];
    for (let i = 0; i < polygons.length; i++) {
      splitPolygon(
        normalize,
        bsp.plane,
        polygons[i],
        /* back= */ back, // keepward
        /* abutting= */ back, // keepward
        /* overlapping= */ front, // dropward
        /* front= */ front
      ); // dropward
    }
    const trimmedFront = removeExteriorPolygonsForCutDroppingOverlap(
      bsp.front,
      front,
      normalize
    );
    const trimmedBack = removeExteriorPolygonsForCutDroppingOverlap(
      bsp.back,
      back,
      normalize
    );

    if (trimmedFront.length === 0) {
      return trimmedBack;
    } else if (trimmedBack.length === 0) {
      return trimmedFront;
    } else {
      return merge(trimmedFront, trimmedBack);
    }
  }
};

const removeExteriorPolygonsForCutKeepingOverlap = (
  bsp,
  polygons,
  normalize
) => {
  if (bsp === inLeaf) {
    return keepIn(polygons);
  } else if (bsp === outLeaf) {
    return [];
  } else {
    const front = [];
    const back = [];
    for (let i = 0; i < polygons.length; i++) {
      splitPolygon(
        normalize,
        bsp.plane,
        polygons[i],
        /* back= */ back, // keepward
        /* abutting= */ front, // dropward
        /* overlapping= */ back, // keepward
        /* front= */ front
      ); // dropward
    }
    const trimmedFront = removeExteriorPolygonsForCutKeepingOverlap(
      bsp.front,
      front,
      normalize
    );
    const trimmedBack = removeExteriorPolygonsForCutKeepingOverlap(
      bsp.back,
      back,
      normalize
    );

    if (trimmedFront.length === 0) {
      return trimmedBack;
    } else if (trimmedBack.length === 0) {
      return trimmedFront;
    } else {
      return merge(trimmedFront, trimmedBack);
    }
  }
};

const removeInteriorPolygonForDifference = (bsp, polygon, normalize, emit) => {
  if (polygon === undefined) return;
  if (bsp === inLeaf) ; else if (bsp === outLeaf) {
    return polygon;
  } else {
    const outward = [];
    const inward = [];
    splitPolygon(
      normalize,
      bsp.plane,
      polygon,
      /* back= */ inward,
      /* abutting= */ outward, // dropward
      /* overlapping= */ inward, // dropward
      /* front= */ outward
    );
    const front = removeInteriorPolygonForDifference(
      bsp.front,
      outward[0],
      normalize,
      emit
    );
    const back = removeInteriorPolygonForDifference(
      bsp.back,
      inward[0],
      normalize,
      emit
    );
    if (front && back) {
      return polygon;
    } else if (front) {
      emit(front);
    } else if (back) {
      emit(back);
    }
  }
};

const removeExteriorPolygonForDifference = (bsp, polygon, normalize, emit) => {
  if (polygon === undefined) return;
  if (bsp === inLeaf) {
    return polygon;
  } else if (bsp === outLeaf) ; else {
    const outward = [];
    const inward = [];
    splitPolygon(
      normalize,
      bsp.plane,
      polygon,
      /* back= */ inward,
      /* abutting= */ outward, // dropward
      /* overlapping= */ outward, // dropward
      /* front= */ outward
    );
    const front = removeExteriorPolygonForDifference(
      bsp.front,
      outward[0],
      normalize,
      emit
    );
    const back = removeExteriorPolygonForDifference(
      bsp.back,
      inward[0],
      normalize,
      emit
    );
    if (front && back) {
      return polygon;
    } else if (front) {
      emit(front);
    } else if (back) {
      emit(back);
    }
  }
};

const removeExteriorPolygonsForIntersectionKeepingOverlap = (
  bsp,
  polygons,
  normalize
) => {
  if (bsp === inLeaf) {
    return keepIn(polygons);
  } else if (bsp === outLeaf) {
    return [];
  } else {
    const front = [];
    const back = [];
    for (let i = 0; i < polygons.length; i++) {
      splitPolygon(
        normalize,
        bsp.plane,
        polygons[i],
        /* back= */ back,
        /* abutting= */ front,
        /* overlapping= */ back,
        /* front= */ front
      );
    }
    const trimmedFront = removeExteriorPolygonsForIntersectionKeepingOverlap(
      bsp.front,
      front,
      normalize
    );
    const trimmedBack = removeExteriorPolygonsForIntersectionKeepingOverlap(
      bsp.back,
      back,
      normalize
    );

    if (trimmedFront.length === 0) {
      return trimmedBack;
    } else if (trimmedBack.length === 0) {
      return trimmedFront;
    } else {
      return merge(trimmedFront, trimmedBack);
    }
  }
};

const removeExteriorPolygonsForIntersectionDroppingOverlap = (
  bsp,
  polygons,
  normalize
) => {
  if (bsp === inLeaf) {
    return keepIn(polygons);
  } else if (bsp === outLeaf) {
    return [];
  } else {
    const front = [];
    const back = [];
    for (let i = 0; i < polygons.length; i++) {
      splitPolygon(
        normalize,
        bsp.plane,
        polygons[i],
        /* back= */ back,
        /* abutting= */ front,
        /* overlapping= */ front,
        /* front= */ front
      );
    }
    const trimmedFront = removeExteriorPolygonsForIntersectionDroppingOverlap(
      bsp.front,
      front,
      normalize
    );
    const trimmedBack = removeExteriorPolygonsForIntersectionDroppingOverlap(
      bsp.back,
      back,
      normalize
    );

    if (trimmedFront.length === 0) {
      return trimmedBack;
    } else if (trimmedBack.length === 0) {
      return trimmedFront;
    } else {
      return merge(trimmedFront, trimmedBack);
    }
  }
};

// Don't merge the fragments for this one.
const dividePolygons = (bsp, polygons, normalize) => {
  if (bsp === inLeaf) {
    return polygons;
  } else if (bsp === outLeaf) {
    return polygons;
  } else {
    const front = [];
    const back = [];
    for (let i = 0; i < polygons.length; i++) {
      splitPolygon(
        normalize,
        bsp.plane,
        polygons[i],
        /* back= */ back,
        /* abutting= */ front,
        /* overlapping= */ back,
        /* front= */ front
      );
    }
    const trimmedFront = dividePolygons(bsp.front, front, normalize);
    const trimmedBack = dividePolygons(bsp.back, back, normalize);

    if (trimmedFront.length === 0) {
      return trimmedBack;
    } else if (trimmedBack.length === 0) {
      return trimmedFront;
    } else {
      return [].concat(trimmedFront, trimmedBack);
    }
  }
};

const replaceLeafs = (bsp, inBsp = inLeaf, outBsp = outLeaf) => {
  switch (bsp.kind) {
    case IN_LEAF:
      return inBsp;
    case OUT_LEAF:
      return outBsp;
    case BRANCH:
      return {
        ...bsp,
        front: replaceLeafs(bsp.front, inBsp, outBsp),
        back: replaceLeafs(bsp.back, inBsp, outBsp),
      };
    default:
      throw Error(`Unexpected bsp kind: ${bsp.kind}`);
  }
};

// Anything in either bsp is in.
const unifyBspTrees = (a, b) => replaceLeafs(a, inLeaf, b);

const cut = (solid, surface, normalize = createNormalize3()) => {
  // Build a classifier from the planar polygon.
  const cutBsp = fromPolygons(surface, normalize);
  const solidPolygons = toPolygons(alignVertices(solid, normalize));

  // Classify the solid with it.
  const trimmedSolid = removeExteriorPolygonsForCutDroppingOverlap(
    cutBsp,
    solidPolygons,
    normalize
  );

  // The solid will have holes that need to be patched with the parts of the
  // planar polygon that are on the solid boundary.
  const solidBsp = fromPolygons(solidPolygons, normalize);
  const trimmedPolygons = removeExteriorPolygonsForCutKeepingOverlap(
    solidBsp,
    surface,
    normalize
  );

  return fromPolygons$1([...trimmedSolid, ...trimmedPolygons], normalize);
};

const cutOpen = (solid, surface, normalize = createNormalize3()) => {
  // Build a classifier from the planar polygon.
  const cutBsp = fromPolygons(surface, normalize);
  const solidPolygons = toPolygons(alignVertices(solid, normalize));

  // Classify the solid with it.
  const trimmedSolid = removeExteriorPolygonsForCutDroppingOverlap(
    cutBsp,
    solidPolygons,
    normalize
  );

  return fromPolygons$1(trimmedSolid, normalize);
};

const containsPoint = (bsp, point, history = []) => {
  while (true) {
    history.push(bsp);
    if (bsp === inLeaf) {
      return true;
    } else if (bsp === outLeaf) {
      return false;
    } else {
      const plane = bsp.plane;
      // const t = planeDistance(plane, point);
      const t =
        plane[0] * point[0] +
        plane[1] * point[1] +
        plane[2] * point[2] -
        plane[3];
      if (t <= 0) {
        // Consider points on the surface to be contained.
        bsp = bsp.back;
      } else {
        bsp = bsp.front;
      }
    }
  }
};

const X$1 = 0;
const Y$1 = 1;
const Z$1 = 2;

const walkX = (min, max, resolution) => {
  const midX = Math.floor((min[X$1] + max[X$1]) / 2);
  if (midX === min[X$1]) {
    return walkY(min, max, resolution);
  }
  return {
    back: walkX(min, [midX, max[Y$1], max[Z$1]], resolution),
    front: walkX([midX, min[Y$1], min[Z$1]], max, resolution),
    kind: BRANCH,
    plane: [1, 0, 0, midX * resolution],
    same: [],
  };
};

const walkY = (min, max, resolution) => {
  const midY = Math.floor((min[Y$1] + max[Y$1]) / 2);
  if (midY === min[Y$1]) {
    return walkZ(min, max, resolution);
  }
  return {
    back: walkY(min, [max[X$1], midY, max[Z$1]], resolution),
    front: walkY([min[X$1], midY, min[Z$1]], max, resolution),
    kind: BRANCH,
    plane: [0, 1, 0, midY * resolution],
    same: [],
  };
};

const walkZ = (min, max, resolution) => {
  const midZ = Math.floor((min[Z$1] + max[Z$1]) / 2);
  if (midZ === min[Z$1]) {
    return inLeaf;
  }
  return {
    back: walkZ(min, [max[X$1], max[Y$1], midZ], resolution),
    front: walkZ([min[X$1], min[Y$1], midZ], max, resolution),
    kind: BRANCH,
    plane: [0, 0, 1, midZ * resolution],
    same: [],
  };
};

const deform = (solid, transform, min, max, resolution) => {
  const normalize = createNormalize3();

  const solidPolygons = toPolygons(alignVertices(solid));

  const floor = ([x, y, z]) => [
    Math.floor(x / resolution),
    Math.floor(y / resolution),
    Math.floor(z / resolution),
  ];
  const ceil = ([x, y, z]) => [
    Math.ceil(x / resolution),
    Math.ceil(y / resolution),
    Math.ceil(z / resolution),
  ];

  const bsp = walkX(floor(min), ceil(max), resolution);

  // Classify the solid with it.
  const dividedPolygons = [];

  for (const polygon of dividePolygons(bsp, solidPolygons, normalize)) {
    if (polygon.length > 3) {
      for (let nth = 2; nth < polygon.length; nth++) {
        dividedPolygons.push([polygon[0], polygon[nth - 1], polygon[nth]]);
      }
    } else if (polygon.length === 3) {
      dividedPolygons.push(polygon);
    }
  }

  const realignedPolygons = alignVertices([dividedPolygons])[0];

  const vertices = new Map();

  // We only need this for non-deterministic transforms.
  // Let's require transforms be deterministic functions.
  for (const path of realignedPolygons) {
    for (const point of path) {
      const tag = JSON.stringify(point);
      if (!vertices.has(tag)) {
        vertices.set(tag, transform(point));
      }
    }
  }

  // Now the solid should have vertexes at the given heights, and we can apply the transform.
  const transformedPolygons = realignedPolygons.map((path) =>
    path.map((point) => vertices.get(JSON.stringify(point)))
  );

  return fromPolygons$1(transformedPolygons);
};

const differenceSurface = (bsp, surface, normalize, emit) => {
  if (bsp === outLeaf) {
    emit(surface);
  } else if (bsp !== inLeaf) {
    const front = [];
    const back = [];
    for (let i = 0; i < surface.length; i++) {
      splitPolygon(
        normalize,
        bsp.plane,
        surface[i],
        /* back= */ back,
        /* abutting= */ back,
        /* overlapping= */ back,
        /* front= */ front
      );
    }
    differenceSurface(bsp.front, front, normalize, emit);
    differenceSurface(bsp.back, back, normalize, emit);
  }
};

const nullPartition = (
  bbBsp,
  aBB,
  bBB,
  bbOutLeaf,
  aPolygons,
  normalize
) => {
  const aIn = aPolygons;
  const aBsp = fromPolygons(aIn, normalize);
  return [aIn, [], aBsp];
};

const MIN = 0;

const difference = (aSolid, ...bSolids) => {
  if (bSolids.length === 0) {
    return aSolid;
  }

  const normalize = createNormalize3();
  let a = toPolygons(alignVertices(aSolid, normalize));
  if (a.length === 0) {
    return [];
  }
  let bs = bSolids
    .map((b) => toPolygons(alignVertices(b, normalize)))
    .filter((b) => b.length > 0 && !doesNotOverlap(a, b));

  while (bs.length > 0) {
    const b = bs.shift();

    const aBB = measureBoundingBox(a);
    const bBB = measureBoundingBox(b);
    const bbBsp = fromBoundingBoxes(aBB, bBB, outLeaf, inLeaf);

    const [aIn, aOut, aBsp] = nullPartition(bbBsp, aBB, bBB, inLeaf, a, normalize);
    const [bIn, , bBsp] = nullPartition(bbBsp, aBB, bBB, outLeaf, b, normalize);

    if (aIn.length === 0) {
      const bbMin = max(aBB[MIN], bBB[MIN]);
      // There are two ways for aIn to be empty: the space is fully enclosed or fully vacated.
      const aBsp = fromPolygons(a, normalize);
      if (containsPoint(aBsp, bbMin)) {
        // The space is fully enclosed; invert b.
        a = [...aOut, ...flip(bIn)];
      } else {
        // The space is fully vacated; nothing to be cut.
        continue;
      }
    } else if (bIn.length === 0) {
      const bbMin = max(aBB[MIN], bBB[MIN]);
      // There are two ways for bIn to be empty: the space is fully enclosed or fully vacated.
      const bBsp = fromPolygons(b, normalize);
      if (containsPoint(bBsp, bbMin)) {
        // The space is fully enclosed; only the out region remains.
        a = aOut;
      } else {
        // The space is fully vacated; nothing to cut with.
        continue;
      }
    } else {
      // Remove the parts of a that are inside b.
      const aTrimmed = [];
      const aEmit = (polygon) => aTrimmed.push(polygon);
      for (const aPolygon of aIn) {
        const kept = removeInteriorPolygonForDifference(
          bBsp,
          aPolygon,
          normalize,
          aEmit
        );
        if (kept) {
          aEmit(kept);
        }
      }
      // Remove the parts of b that are outside a.
      const bTrimmed = [];
      const bEmit = (polygon) => bTrimmed.push(polygon);
      for (const bPolygon of bIn) {
        const kept = removeExteriorPolygonForDifference(
          aBsp,
          bPolygon,
          normalize,
          bEmit
        );
        if (kept) {
          bEmit(kept);
        }
      }
      a = clean([...aOut, ...aTrimmed, ...flip(bTrimmed)]);
    }
  }
  return fromPolygons$1(a, normalize);
};

const fromPlanes = (planes, normalize) => {
  const polygons = [];
  for (const plane of planes) {
    polygons.push(toPolygon(plane));
  }
  return fromPolygons(polygons, normalize);
};

const LARGE = 1e10;

const fromSurface = (surface, normalize) => {
  const polygons = [];
  const normal = toPlane$1(surface);
  if (normal !== undefined) {
    const top = scale(LARGE, normal);
    const bottom = scale(0, normal);
    for (const path of outlineSurface(surface, normalize)) {
      for (const [start, end] of getEdges(path)) {
        // Build a large wall.
        polygons.push([
          add(start, top),
          add(start, bottom),
          add(end, bottom),
          add(end, top),
        ]);
      }
    }
    // Build a tall prism.
    polygons.push(...translate(bottom, flip$1(surface)));
    polygons.push(...translate(top, surface));
  }
  return fromPolygons(polygons, normalize);
};

const intersectSurface = (bsp, surface, normalize, emit) => {
  if (bsp === inLeaf) {
    emit(surface);
  } else if (bsp !== outLeaf) {
    const front = [];
    const back = [];
    for (let i = 0; i < surface.length; i++) {
      splitPolygon(
        normalize,
        bsp.plane,
        surface[i],
        /* back= */ back,
        /* abutting= */ back,
        /* overlapping= */ back,
        /* front= */ front
      );
    }
    intersectSurface(bsp.front, front, normalize, emit);
    intersectSurface(bsp.back, back, normalize, emit);
  }
};

const MIN$1 = 0;

// An asymmetric binary merge.
const intersection = (...solids) => {
  if (solids.length === 0) {
    return [];
  }
  if (solids.length === 1) {
    return solids[0];
  }
  const normalize = createNormalize3();
  const s = solids.map((solid) =>
    toPolygons(alignVertices(solid, normalize))
  );
  while (s.length > 1) {
    const a = s.shift();
    const b = s.shift();

    if (doesNotOverlap(a, b)) {
      return [];
    }

    const aBB = measureBoundingBox(a);
    const bBB = measureBoundingBox(b);
    const bbBsp = fromBoundingBoxes(aBB, bBB, outLeaf, inLeaf);

    const [aIn, , aBsp] = nullPartition(bbBsp, aBB, bBB, outLeaf, a, normalize);
    const [bIn, , bBsp] = nullPartition(bbBsp, aBB, bBB, outLeaf, b, normalize);

    if (aIn.length === 0) {
      const bbMin = max(aBB[MIN$1], bBB[MIN$1]);
      // There are two ways for aIn to be empty: the space is fully exclosed or fully vacated.
      const aBsp = fromPolygons(a, normalize);
      if (containsPoint(aBsp, bbMin)) {
        // The space is fully enclosed.
        s.push(bIn);
      } else {
        // The space is fully vacated.
        return [];
      }
    } else if (bIn.length === 0) {
      const bbMin = max(aBB[MIN$1], bBB[MIN$1]);
      // There are two ways for bIn to be empty: the space is fully exclosed or fully vacated.
      const bBsp = fromPolygons(b, normalize);
      if (containsPoint(bBsp, bbMin)) {
        // The space is fully enclosed.
        s.push(aIn);
      } else {
        // The space is fully vacated.
        return [];
      }
    } else {
      const aTrimmed = removeExteriorPolygonsForIntersectionKeepingOverlap(
        bBsp,
        aIn,
        normalize
      );
      const bTrimmed = removeExteriorPolygonsForIntersectionDroppingOverlap(
        aBsp,
        bIn,
        normalize
      );

      s.push(clean([...aTrimmed, ...bTrimmed]));
    }
  }
  return fromPolygons$1(s[0], normalize);
};

const planeDistance = (plane, point) =>
  plane[0] * point[0] + plane[1] * point[1] + plane[2] * point[2] - plane[3];

const splitPaths = (normalize, plan, paths, back, front) => {
  for (const path of paths) {
    splitPath(normalize, plan, path, back, front);
  }
};

// FIX: This chops up the path into discrete segments.
const splitPath = (normalize, plane, path, back, front) => {
  for (const [start, end] of getEdges(path)) {
    const t = planeDistance(plane, start);
    const direction = subtract(end, start);
    let lambda = (plane[3] - dot$1(plane, start)) / dot$1(plane, direction);
    if (!Number.isNaN(lambda) && lambda > 0 && lambda < 1) {
      const span = normalize(add(start, scale(lambda, direction)));
      if (t > 0) {
        // Front to back
        front.push(createOpenPath(start, span));
        back.push(createOpenPath(span, end));
      } else {
        back.push(createOpenPath(start, span));
        front.push(createOpenPath(span, end));
      }
    } else {
      if (t > 0) {
        front.push(createOpenPath(start, end));
      } else {
        back.push(createOpenPath(start, end));
      }
    }
  }
};

const removeExteriorPaths = (bsp, paths, normalize, emit) => {
  if (bsp === inLeaf) {
    return emit(paths);
  } else if (bsp === outLeaf) {
    return [];
  } else {
    const front = [];
    const back = [];
    splitPaths(
      normalize,
      bsp.plane,
      paths,
      /* back= */ back,
      /* abutting= */ front);
    removeExteriorPaths(bsp.front, front, normalize, emit);
    removeExteriorPaths(bsp.back, back, normalize, emit);
  }
};

const section = (solid, surfaces, normalize) => {
  const bsp = fromSolid(alignVertices(solid, normalize), normalize);
  return surfaces.map((surface) =>
    removeExteriorPolygonsForSection(bsp, surface, normalize)
  );
};

const toConvexClouds = (bsp, normalize) => {
  const clouds = [];
  const walk = (bsp, polygons) => {
    if (bsp === outLeaf) {
      return null;
    } else if (bsp === inLeaf) {
      const cloud = [];
      for (const polygon of polygons) {
        cloud.push(...polygon.map(normalize));
      }
      clouds.push(cloud);
    } else {
      const back = [...bsp.same];
      const front = [...bsp.same];
      for (const polygon of polygons) {
        splitPolygon(normalize, bsp.plane, polygon, back, front, back, front);
      }
      walk(bsp.front, front);
      walk(bsp.back, back);
    }
  };
  walk(bsp, []);
  return clouds;
};

const toDot = (bsp) => {
  const lines = [];
  const dot = (text) => lines.push(text);

  dot(`digraph {`);

  const ids = new Map();
  let nextId = 0;

  const walk = (bsp, parent) => {
    if (bsp === inLeaf) {
      return `"IN_${parent}"`;
    } else if (bsp === outLeaf) {
      return `"OUT ${parent}"`;
    } else {
      if (!ids.has(bsp)) {
        ids.set(bsp, nextId++);
      }
      const id = ids.get(bsp);

      dot(
        `  ${id} [label="${bsp.plane.map((v) => v.toFixed(3)).join(', ')}"];`
      );
      dot(`  ${id} -> ${walk(bsp.front, id)} [label="front"];`);
      dot(`  ${id} -> ${walk(bsp.back, id)} [label="back"];`);

      return id;
    }
  };

  walk(bsp);

  dot(`}`);

  return lines.join('\n');
};

const toPlanesFromSolid = (solid) => {
  const planes = [];
  const addPlane = (plane) => {
    // FIX: Inefficient.
    if (!planes.some((entry) => equals(entry, plane))) {
      planes.push(plane);
    }
  };

  for (const surface of solid) {
    addPlane(toPlane$1(surface));
  }

  return planes;
};

const toPolygonsFromPlanes = (planes) => {
  const polygons = [];
  for (const plane of planes) {
    polygons.push(toPolygon(plane));
  }
  return polygons;
};

const toPlanarPolygonsFromSolids = (solids) => {
  const planes = [];
  const addPlane = (plane) => {
    // FIX: Inefficient.
    if (!planes.some((entry) => equals(entry, plane))) {
      planes.push(plane);
    }
  };

  for (const solid of solids) {
    for (const surface of solid) {
      addPlane(toPlane$1(surface));
    }
  }

  return toPolygonsFromPlanes(planes);
};

const MIN$2 = 0;

// An asymmetric binary merge.
const union = (...solids) => {
  if (solids.length === 0) {
    return [];
  }
  if (solids.length === 1) {
    return solids[0];
  }
  const normalize = createNormalize3();
  const s = solids
    .map((solid) => toPolygons(alignVertices(solid, normalize)))
    .filter((s) => s.length > 0);
  while (s.length >= 2) {
    const a = s.shift();
    const b = s.shift();

    if (doesNotOverlap(a, b)) {
      s.push([...a, ...b]);
      continue;
    }

    const aBB = measureBoundingBox(a);
    const bBB = measureBoundingBox(b);
    const bbBsp = fromBoundingBoxes(aBB, bBB, outLeaf, inLeaf);

    const [aIn, aOut, aBsp] = nullPartition(bbBsp, aBB, bBB, inLeaf, a, normalize);
    const [bIn, bOut, bBsp] = nullPartition(bbBsp, aBB, bBB, inLeaf, b, normalize);

    if (aIn.length === 0) {
      const bbMin = max(aBB[MIN$2], bBB[MIN$2]);
      // There are two ways for aIn to be empty: the space is fully enclosed or fully vacated.
      const aBsp = fromPolygons(a, normalize);
      if (containsPoint(aBsp, bbMin)) {
        // The space is fully enclosed; bIn is redundant.
        s.push([...aOut, ...aIn, ...bOut]);
      } else {
        s.push([...aOut, ...aIn, ...bOut]);
        // The space is fully vacated; nothing overlaps b.
        s.push([...a, ...b]);
      }
    } else if (bIn.length === 0) {
      const bbMin = max(aBB[MIN$2], bBB[MIN$2]);
      // There are two ways for bIn to be empty: the space is fully enclosed or fully vacated.
      const bBsp = fromPolygons(b, normalize);
      if (containsPoint(bBsp, bbMin)) {
        // The space is fully enclosed; aIn is redundant.
        s.push([...aOut, ...bIn, ...bOut]);
      } else {
        // The space is fully vacated; nothing overlaps a.
        s.push([...a, ...b]);
      }
    } else {
      const aTrimmed = removeInteriorPolygonsForUnionKeepingOverlap(
        bBsp,
        aIn,
        normalize
      );
      const bTrimmed = removeInteriorPolygonsForUnionDroppingOverlap(
        aBsp,
        bIn,
        normalize
      );

      s.push(clean([...aOut, ...bTrimmed, ...bOut, ...aTrimmed]));
    }
  }
  return fromPolygons$1(s[0], normalize);
};

export { containsPoint, cut, cutOpen, deform, difference, differenceSurface, fromPlanes, fromSolid, fromSolids, fromSurface, intersectSurface, intersection, removeExteriorPaths, removeExteriorPolygonsForSection, section, toConvexClouds, toDot, toPlanarPolygonsFromSolids, toPlanesFromSolid, toPolygonsFromPlanes, unifyBspTrees, union };
