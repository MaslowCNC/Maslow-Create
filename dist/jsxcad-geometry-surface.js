import { canonicalize as canonicalize$1, transform as transform$1, toPlane as toPlane$1, flip as flip$1, measureArea as measureArea$1 } from './jsxcad-math-poly3.js';
import { fromTranslation, fromZRotation, fromScaling } from './jsxcad-math-mat4.js';
import { subtract, scale as scale$1, dot, distance, add } from './jsxcad-math-vec3.js';
import { equals as equals$1, splitLineSegmentByPlane, signedDistanceToPoint, toPolygon } from './jsxcad-math-plane.js';
import { cacheCut } from './jsxcad-cache.js';
import { assertUnique, getEdges } from './jsxcad-geometry-path.js';
import { createNormalize3 } from './jsxcad-algorithm-quantize.js';
import { pushWhenValid } from './jsxcad-geometry-polygons.js';
export { outlineSurface as outline } from './jsxcad-geometry-halfedge.js';

// export const toPlane = (surface) => toPlaneOfPolygon(surface[0]);
const canonicalize = (surface) => {
  const canonicalizedSurface = surface.map(canonicalize$1);
  if (canonicalizedSurface.plane) {
    throw Error('die');
  }
  return canonicalizedSurface;
};

// Transforms
const transform = (matrix, surface) =>
  surface.map((polygon) => transform$1(matrix, polygon));
const translate = (vector, surface) =>
  transform(fromTranslation(vector), surface);
const rotateZ = (angle, surface) =>
  transform(fromZRotation(angle), surface);
const scale = (vector, surface) =>
  transform(fromScaling(vector), surface);

// FIX: This is incorrect, since it assumes the first non-degenerate polygon is representative.

const toPlane = (surface) => {
  if (surface.plane !== undefined) {
    return surface.plane;
  } else {
    for (const polygon of surface) {
      const plane = toPlane$1(polygon);
      if (plane !== undefined) {
        surface.plane = plane;
        return surface.plane;
      }
    }
  }
};

const EPSILON = 1e-5;

const COPLANAR = 0; // Neither front nor back.
const FRONT = 1;
const BACK = 2;
const SPANNING = 3; // Both front and back.

const toType = (plane, point) => {
  let t = signedDistanceToPoint(plane, point);
  if (t < -EPSILON) {
    return BACK;
  } else if (t > EPSILON) {
    return FRONT;
  } else {
    return COPLANAR;
  }
};

const pointType = [];

const cutSurface = (
  plane,
  coplanarFrontSurfaces,
  coplanarBackSurfaces,
  frontSurfaces,
  backSurfaces,
  frontEdges,
  backEdges,
  surface
) => {
  const surfacePlane = toPlane(surface);
  if (surfacePlane === undefined) {
    // Degenerate.
    return;
  }
  let coplanarFrontPolygons;
  let coplanarBackPolygons;
  let frontPolygons;
  let backPolygons;
  for (let polygon of surface) {
    pointType.length = 0;
    let polygonType = COPLANAR;
    if (!equals$1(surfacePlane, plane)) {
      for (const point of polygon) {
        const type = toType(plane, point);
        polygonType |= type;
        pointType.push(type);
      }
    }

    // Put the polygon in the correct list, splitting it when necessary.
    switch (polygonType) {
      case COPLANAR: {
        if (dot(plane, surfacePlane) > 0) {
          if (coplanarFrontPolygons === undefined) {
            coplanarFrontPolygons = [];
          }
          coplanarFrontPolygons.push(polygon);
        } else {
          if (coplanarBackPolygons === undefined) {
            coplanarBackPolygons = [];
          }
          coplanarBackPolygons.push(polygon);
        }
        break;
      }
      case FRONT: {
        if (frontPolygons === undefined) {
          frontPolygons = [];
        }
        frontPolygons.push(polygon);
        let startPoint = polygon[polygon.length - 1];
        let startType = pointType[polygon.length - 1];
        for (let nth = 0; nth < polygon.length; nth++) {
          const endPoint = polygon[nth];
          const endType = pointType[nth];
          if (startType === COPLANAR && endType === COPLANAR) {
            frontEdges.push([startPoint, endPoint]);
          }
          startPoint = endPoint;
          startType = endType;
        }
        break;
      }
      case BACK: {
        if (backPolygons === undefined) {
          backPolygons = [];
        }
        backPolygons.push(polygon);
        let startPoint = polygon[polygon.length - 1];
        let startType = pointType[polygon.length - 1];
        for (let nth = 0; nth < polygon.length; nth++) {
          const endPoint = polygon[nth];
          const endType = pointType[nth];
          if (startType === COPLANAR && endType === COPLANAR) {
            backEdges.push([startPoint, endPoint]);
          }
          startPoint = endPoint;
          startType = endType;
        }
        break;
      }
      case SPANNING: {
        // Make a local copy so that mutation does not propagate.
        polygon = polygon.slice();
        let backPoints = [];
        let frontPoints = [];
        // Add the colinear spanning point to the polygon.
        {
          let last = polygon.length - 1;
          for (let current = 0; current < polygon.length; last = current++) {
            const lastType = pointType[last];
            const lastPoint = polygon[last];
            if ((lastType | pointType[current]) === SPANNING) {
              // Break spanning segments at the point of intersection.
              const rawSpanPoint = splitLineSegmentByPlane(
                plane,
                lastPoint,
                polygon[current]
              );
              const spanPoint = subtract(
                rawSpanPoint,
                scale$1(signedDistanceToPoint(surfacePlane, rawSpanPoint), plane)
              );
              // Note: Destructive modification of polygon here.
              polygon.splice(current, 0, spanPoint);
              pointType.splice(current, 0, COPLANAR);
            }
          }
        }
        // Spanning points have been inserted.
        {
          let last = polygon.length - 1;
          let lastCoplanar = polygon[pointType.lastIndexOf(COPLANAR)];
          for (let current = 0; current < polygon.length; last = current++) {
            const point = polygon[current];
            const type = pointType[current];
            const lastType = pointType[last];
            const lastPoint = polygon[last];
            if (type !== FRONT) {
              backPoints.push(point);
            }
            if (type !== BACK) {
              frontPoints.push(point);
            }
            if (type === COPLANAR) {
              if (lastType === COPLANAR) {
                frontEdges.push([lastPoint, point]);
                backEdges.push([lastPoint, point]);
              } else if (lastType === BACK) {
                frontEdges.push([lastCoplanar, point]);
              } else if (lastType === FRONT) {
                backEdges.push([lastCoplanar, point]);
              }
              lastCoplanar = point;
            }
          }
        }
        if (frontPoints.length >= 3) {
          // Add the polygon that sticks out the front of the plane.
          if (frontPolygons === undefined) {
            frontPolygons = [];
          }
          frontPolygons.push(frontPoints);
        }
        if (backPoints.length >= 3) {
          // Add the polygon that sticks out the back of the plane.
          if (backPolygons === undefined) {
            backPolygons = [];
          }
          backPolygons.push(backPoints);
        }
        break;
      }
    }
  }
  if (coplanarFrontPolygons !== undefined) {
    coplanarFrontSurfaces.push(coplanarFrontPolygons);
  }
  if (coplanarBackPolygons !== undefined) {
    coplanarBackSurfaces.push(coplanarBackPolygons);
  }
  if (frontPolygons !== undefined) {
    frontSurfaces.push(frontPolygons);
  }
  if (backPolygons !== undefined) {
    backSurfaces.push(backPolygons);
  }
};

const cutImpl = (planeSurface, surface) => {
  const front = [];
  const back = [];
  const frontEdges = [];
  const backEdges = [];

  cutSurface(
    toPlane(planeSurface),
    front,
    back,
    front,
    back,
    frontEdges,
    backEdges,
    surface
  );
  if (frontEdges.some((edge) => edge[1] === undefined)) {
    throw Error(`die/end/missing: ${JSON.stringify(frontEdges)}`);
  }

  return [].concat(...back);
};

const cut = cacheCut(cutImpl);

// import { isCoplanar } from './jsxcad-math-poly3.js';
//
// const assertCoplanarPolygon = (polygon) => {
//   // Disabled
//   //
//   // if (!isCoplanar(polygon)) {
//   //   throw Error(`die`);
//   // }
// };

const assertCoplanar = (surface) => {
  // Disabled
  //
  // for (const polygon of surface) {
  //  assertCoplanarPolygon(polygon);
  // }
};

const assertGood = (surface) => {
  for (const path of surface) {
    assertUnique(path);
    if (toPlane$1(path) === undefined) {
      console.log(`QQ/path: ${JSON.stringify(path)}`);
      throw Error('die');
    }
  }
};

const eachPoint = (thunk, surface) => {
  for (const polygon of surface) {
    for (const [x = 0, y = 0, z = 0] of polygon) {
      thunk([x, y, z]);
    }
  }
};

/**
 * Transforms each polygon of the surface.
 *
 * @param {Polygons} original - the Polygons to transform.
 * @param {Function} [transform=identity] - function used to transform the polygons.
 * @returns {Polygons} a copy with transformed polygons.
 */
const map = (original, transform) => {
  if (original === undefined) {
    original = [];
  }
  if (transform === undefined) {
    transform = (_) => _;
  }
  return original.map((polygon) => transform(polygon));
};

const flip = (surface) => map(surface, flip$1);

const fromPlane = (plane) => [toPolygon(plane)];

const fromPolygons = ({ plane }, polygons) => {
  throw Error('die');
};

var earcut_1 = earcut;
var default_1 = earcut;

function earcut(data, holeIndices, dim) {

    dim = dim || 2;

    var hasHoles = holeIndices && holeIndices.length,
        outerLen = hasHoles ? holeIndices[0] * dim : data.length,
        outerNode = linkedList(data, 0, outerLen, dim, true),
        triangles = [];

    if (!outerNode || outerNode.next === outerNode.prev) return triangles;

    var minX, minY, maxX, maxY, x, y, invSize;

    if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim);

    // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
    if (data.length > 80 * dim) {
        minX = maxX = data[0];
        minY = maxY = data[1];

        for (var i = dim; i < outerLen; i += dim) {
            x = data[i];
            y = data[i + 1];
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }

        // minX, minY and invSize are later used to transform coords into integers for z-order calculation
        invSize = Math.max(maxX - minX, maxY - minY);
        invSize = invSize !== 0 ? 1 / invSize : 0;
    }

    earcutLinked(outerNode, triangles, dim, minX, minY, invSize);

    return triangles;
}

// create a circular doubly linked list from polygon points in the specified winding order
function linkedList(data, start, end, dim, clockwise) {
    var i, last;

    if (clockwise === (signedArea(data, start, end, dim) > 0)) {
        for (i = start; i < end; i += dim) last = insertNode(i, data[i], data[i + 1], last);
    } else {
        for (i = end - dim; i >= start; i -= dim) last = insertNode(i, data[i], data[i + 1], last);
    }

    if (last && equals(last, last.next)) {
        removeNode(last);
        last = last.next;
    }

    return last;
}

// eliminate colinear or duplicate points
function filterPoints(start, end) {
    if (!start) return start;
    if (!end) end = start;

    var p = start,
        again;
    do {
        again = false;

        if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
            removeNode(p);
            p = end = p.prev;
            if (p === p.next) break;
            again = true;

        } else {
            p = p.next;
        }
    } while (again || p !== end);

    return end;
}

// main ear slicing loop which triangulates a polygon (given as a linked list)
function earcutLinked(ear, triangles, dim, minX, minY, invSize, pass) {
    if (!ear) return;

    // interlink polygon nodes in z-order
    if (!pass && invSize) indexCurve(ear, minX, minY, invSize);

    var stop = ear,
        prev, next;

    // iterate through ears, slicing them one by one
    while (ear.prev !== ear.next) {
        prev = ear.prev;
        next = ear.next;

        if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
            // cut off the triangle
            triangles.push(prev.i / dim);
            triangles.push(ear.i / dim);
            triangles.push(next.i / dim);

            removeNode(ear);

            // skipping the next vertex leads to less sliver triangles
            ear = next.next;
            stop = next.next;

            continue;
        }

        ear = next;

        // if we looped through the whole remaining polygon and can't find any more ears
        if (ear === stop) {
            // try filtering points and slicing again
            if (!pass) {
                earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1);

            // if this didn't work, try curing all small self-intersections locally
            } else if (pass === 1) {
                ear = cureLocalIntersections(filterPoints(ear), triangles, dim);
                earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);

            // as a last resort, try splitting the remaining polygon into two
            } else if (pass === 2) {
                splitEarcut(ear, triangles, dim, minX, minY, invSize);
            }

            break;
        }
    }
}

// check whether a polygon node forms a valid ear with adjacent nodes
function isEar(ear) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // now make sure we don't have other points inside the potential ear
    var p = ear.next.next;

    while (p !== ear.prev) {
        if (pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.next;
    }

    return true;
}

function isEarHashed(ear, minX, minY, invSize) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // triangle bbox; min & max are calculated like this for speed
    var minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : (b.x < c.x ? b.x : c.x),
        minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : (b.y < c.y ? b.y : c.y),
        maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : (b.x > c.x ? b.x : c.x),
        maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : (b.y > c.y ? b.y : c.y);

    // z-order range for the current triangle bbox;
    var minZ = zOrder(minTX, minTY, minX, minY, invSize),
        maxZ = zOrder(maxTX, maxTY, minX, minY, invSize);

    var p = ear.prevZ,
        n = ear.nextZ;

    // look for points inside the triangle in both directions
    while (p && p.z >= minZ && n && n.z <= maxZ) {
        if (p !== ear.prev && p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.prevZ;

        if (n !== ear.prev && n !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
            area(n.prev, n, n.next) >= 0) return false;
        n = n.nextZ;
    }

    // look for remaining points in decreasing z-order
    while (p && p.z >= minZ) {
        if (p !== ear.prev && p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.prevZ;
    }

    // look for remaining points in increasing z-order
    while (n && n.z <= maxZ) {
        if (n !== ear.prev && n !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
            area(n.prev, n, n.next) >= 0) return false;
        n = n.nextZ;
    }

    return true;
}

// go through all polygon nodes and cure small local self-intersections
function cureLocalIntersections(start, triangles, dim) {
    var p = start;
    do {
        var a = p.prev,
            b = p.next.next;

        if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {

            triangles.push(a.i / dim);
            triangles.push(p.i / dim);
            triangles.push(b.i / dim);

            // remove two nodes involved
            removeNode(p);
            removeNode(p.next);

            p = start = b;
        }
        p = p.next;
    } while (p !== start);

    return filterPoints(p);
}

// try splitting polygon into two and triangulate them independently
function splitEarcut(start, triangles, dim, minX, minY, invSize) {
    // look for a valid diagonal that divides the polygon into two
    var a = start;
    do {
        var b = a.next.next;
        while (b !== a.prev) {
            if (a.i !== b.i && isValidDiagonal(a, b)) {
                // split the polygon in two by the diagonal
                var c = splitPolygon(a, b);

                // filter colinear points around the cuts
                a = filterPoints(a, a.next);
                c = filterPoints(c, c.next);

                // run earcut on each half
                earcutLinked(a, triangles, dim, minX, minY, invSize);
                earcutLinked(c, triangles, dim, minX, minY, invSize);
                return;
            }
            b = b.next;
        }
        a = a.next;
    } while (a !== start);
}

// link every hole into the outer loop, producing a single-ring polygon without holes
function eliminateHoles(data, holeIndices, outerNode, dim) {
    var queue = [],
        i, len, start, end, list;

    for (i = 0, len = holeIndices.length; i < len; i++) {
        start = holeIndices[i] * dim;
        end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
        list = linkedList(data, start, end, dim, false);
        if (list === list.next) list.steiner = true;
        queue.push(getLeftmost(list));
    }

    queue.sort(compareX);

    // process holes from left to right
    for (i = 0; i < queue.length; i++) {
        eliminateHole(queue[i], outerNode);
        outerNode = filterPoints(outerNode, outerNode.next);
    }

    return outerNode;
}

function compareX(a, b) {
    return a.x - b.x;
}

// find a bridge between vertices that connects hole with an outer ring and and link it
function eliminateHole(hole, outerNode) {
    outerNode = findHoleBridge(hole, outerNode);
    if (outerNode) {
        var b = splitPolygon(outerNode, hole);

        // filter collinear points around the cuts
        filterPoints(outerNode, outerNode.next);
        filterPoints(b, b.next);
    }
}

// David Eberly's algorithm for finding a bridge between hole and outer polygon
function findHoleBridge(hole, outerNode) {
    var p = outerNode,
        hx = hole.x,
        hy = hole.y,
        qx = -Infinity,
        m;

    // find a segment intersected by a ray from the hole's leftmost point to the left;
    // segment's endpoint with lesser x will be potential connection point
    do {
        if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
            var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
            if (x <= hx && x > qx) {
                qx = x;
                if (x === hx) {
                    if (hy === p.y) return p;
                    if (hy === p.next.y) return p.next;
                }
                m = p.x < p.next.x ? p : p.next;
            }
        }
        p = p.next;
    } while (p !== outerNode);

    if (!m) return null;

    if (hx === qx) return m; // hole touches outer segment; pick leftmost endpoint

    // look for points inside the triangle of hole point, segment intersection and endpoint;
    // if there are no points found, we have a valid connection;
    // otherwise choose the point of the minimum angle with the ray as connection point

    var stop = m,
        mx = m.x,
        my = m.y,
        tanMin = Infinity,
        tan;

    p = m;

    do {
        if (hx >= p.x && p.x >= mx && hx !== p.x &&
                pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {

            tan = Math.abs(hy - p.y) / (hx - p.x); // tangential

            if (locallyInside(p, hole) &&
                (tan < tanMin || (tan === tanMin && (p.x > m.x || (p.x === m.x && sectorContainsSector(m, p)))))) {
                m = p;
                tanMin = tan;
            }
        }

        p = p.next;
    } while (p !== stop);

    return m;
}

// whether sector in vertex m contains sector in vertex p in the same coordinates
function sectorContainsSector(m, p) {
    return area(m.prev, m, p.prev) < 0 && area(p.next, m, m.next) < 0;
}

// interlink polygon nodes in z-order
function indexCurve(start, minX, minY, invSize) {
    var p = start;
    do {
        if (p.z === null) p.z = zOrder(p.x, p.y, minX, minY, invSize);
        p.prevZ = p.prev;
        p.nextZ = p.next;
        p = p.next;
    } while (p !== start);

    p.prevZ.nextZ = null;
    p.prevZ = null;

    sortLinked(p);
}

// Simon Tatham's linked list merge sort algorithm
// http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
function sortLinked(list) {
    var i, p, q, e, tail, numMerges, pSize, qSize,
        inSize = 1;

    do {
        p = list;
        list = null;
        tail = null;
        numMerges = 0;

        while (p) {
            numMerges++;
            q = p;
            pSize = 0;
            for (i = 0; i < inSize; i++) {
                pSize++;
                q = q.nextZ;
                if (!q) break;
            }
            qSize = inSize;

            while (pSize > 0 || (qSize > 0 && q)) {

                if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
                    e = p;
                    p = p.nextZ;
                    pSize--;
                } else {
                    e = q;
                    q = q.nextZ;
                    qSize--;
                }

                if (tail) tail.nextZ = e;
                else list = e;

                e.prevZ = tail;
                tail = e;
            }

            p = q;
        }

        tail.nextZ = null;
        inSize *= 2;

    } while (numMerges > 1);

    return list;
}

// z-order of a point given coords and inverse of the longer side of data bbox
function zOrder(x, y, minX, minY, invSize) {
    // coords are transformed into non-negative 15-bit integer range
    x = 32767 * (x - minX) * invSize;
    y = 32767 * (y - minY) * invSize;

    x = (x | (x << 8)) & 0x00FF00FF;
    x = (x | (x << 4)) & 0x0F0F0F0F;
    x = (x | (x << 2)) & 0x33333333;
    x = (x | (x << 1)) & 0x55555555;

    y = (y | (y << 8)) & 0x00FF00FF;
    y = (y | (y << 4)) & 0x0F0F0F0F;
    y = (y | (y << 2)) & 0x33333333;
    y = (y | (y << 1)) & 0x55555555;

    return x | (y << 1);
}

// find the leftmost node of a polygon ring
function getLeftmost(start) {
    var p = start,
        leftmost = start;
    do {
        if (p.x < leftmost.x || (p.x === leftmost.x && p.y < leftmost.y)) leftmost = p;
        p = p.next;
    } while (p !== start);

    return leftmost;
}

// check if a point lies within a convex triangle
function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
    return (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
           (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
           (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
}

// check if a diagonal between two polygon nodes is valid (lies in polygon interior)
function isValidDiagonal(a, b) {
    return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) && // dones't intersect other edges
           (locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b) && // locally visible
            (area(a.prev, a, b.prev) || area(a, b.prev, b)) || // does not create opposite-facing sectors
            equals(a, b) && area(a.prev, a, a.next) > 0 && area(b.prev, b, b.next) > 0); // special zero-length case
}

// signed area of a triangle
function area(p, q, r) {
    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
}

// check if two points are equal
function equals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}

// check if two segments intersect
function intersects(p1, q1, p2, q2) {
    var o1 = sign(area(p1, q1, p2));
    var o2 = sign(area(p1, q1, q2));
    var o3 = sign(area(p2, q2, p1));
    var o4 = sign(area(p2, q2, q1));

    if (o1 !== o2 && o3 !== o4) return true; // general case

    if (o1 === 0 && onSegment(p1, p2, q1)) return true; // p1, q1 and p2 are collinear and p2 lies on p1q1
    if (o2 === 0 && onSegment(p1, q2, q1)) return true; // p1, q1 and q2 are collinear and q2 lies on p1q1
    if (o3 === 0 && onSegment(p2, p1, q2)) return true; // p2, q2 and p1 are collinear and p1 lies on p2q2
    if (o4 === 0 && onSegment(p2, q1, q2)) return true; // p2, q2 and q1 are collinear and q1 lies on p2q2

    return false;
}

// for collinear points p, q, r, check if point q lies on segment pr
function onSegment(p, q, r) {
    return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
}

function sign(num) {
    return num > 0 ? 1 : num < 0 ? -1 : 0;
}

// check if a polygon diagonal intersects any polygon segments
function intersectsPolygon(a, b) {
    var p = a;
    do {
        if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i &&
                intersects(p, p.next, a, b)) return true;
        p = p.next;
    } while (p !== a);

    return false;
}

// check if a polygon diagonal is locally inside the polygon
function locallyInside(a, b) {
    return area(a.prev, a, a.next) < 0 ?
        area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 :
        area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
}

// check if the middle point of a polygon diagonal is inside the polygon
function middleInside(a, b) {
    var p = a,
        inside = false,
        px = (a.x + b.x) / 2,
        py = (a.y + b.y) / 2;
    do {
        if (((p.y > py) !== (p.next.y > py)) && p.next.y !== p.y &&
                (px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x))
            inside = !inside;
        p = p.next;
    } while (p !== a);

    return inside;
}

// link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
// if one belongs to the outer ring and another to a hole, it merges it into a single ring
function splitPolygon(a, b) {
    var a2 = new Node(a.i, a.x, a.y),
        b2 = new Node(b.i, b.x, b.y),
        an = a.next,
        bp = b.prev;

    a.next = b;
    b.prev = a;

    a2.next = an;
    an.prev = a2;

    b2.next = a2;
    a2.prev = b2;

    bp.next = b2;
    b2.prev = bp;

    return b2;
}

// create a node and optionally link it with previous one (in a circular doubly linked list)
function insertNode(i, x, y, last) {
    var p = new Node(i, x, y);

    if (!last) {
        p.prev = p;
        p.next = p;

    } else {
        p.next = last.next;
        p.prev = last;
        last.next.prev = p;
        last.next = p;
    }
    return p;
}

function removeNode(p) {
    p.next.prev = p.prev;
    p.prev.next = p.next;

    if (p.prevZ) p.prevZ.nextZ = p.nextZ;
    if (p.nextZ) p.nextZ.prevZ = p.prevZ;
}

function Node(i, x, y) {
    // vertex index in coordinates array
    this.i = i;

    // vertex coordinates
    this.x = x;
    this.y = y;

    // previous and next vertex nodes in a polygon ring
    this.prev = null;
    this.next = null;

    // z-order curve value
    this.z = null;

    // previous and next nodes in z-order
    this.prevZ = null;
    this.nextZ = null;

    // indicates whether this is a steiner point
    this.steiner = false;
}

// return a percentage difference between the polygon area and its triangulation area;
// used to verify correctness of triangulation
earcut.deviation = function (data, holeIndices, dim, triangles) {
    var hasHoles = holeIndices && holeIndices.length;
    var outerLen = hasHoles ? holeIndices[0] * dim : data.length;

    var polygonArea = Math.abs(signedArea(data, 0, outerLen, dim));
    if (hasHoles) {
        for (var i = 0, len = holeIndices.length; i < len; i++) {
            var start = holeIndices[i] * dim;
            var end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
            polygonArea -= Math.abs(signedArea(data, start, end, dim));
        }
    }

    var trianglesArea = 0;
    for (i = 0; i < triangles.length; i += 3) {
        var a = triangles[i] * dim;
        var b = triangles[i + 1] * dim;
        var c = triangles[i + 2] * dim;
        trianglesArea += Math.abs(
            (data[a] - data[c]) * (data[b + 1] - data[a + 1]) -
            (data[a] - data[b]) * (data[c + 1] - data[a + 1]));
    }

    return polygonArea === 0 && trianglesArea === 0 ? 0 :
        Math.abs((trianglesArea - polygonArea) / polygonArea);
};

function signedArea(data, start, end, dim) {
    var sum = 0;
    for (var i = start, j = end - dim; i < end; i += dim) {
        sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
        j = i;
    }
    return sum;
}

// turn a polygon in a multi-dimensional array form (e.g. as in GeoJSON) into a form Earcut accepts
earcut.flatten = function (data) {
    var dim = data[0][0].length,
        result = {vertices: [], holes: [], dimensions: dim},
        holeIndex = 0;

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            for (var d = 0; d < dim; d++) result.vertices.push(data[i][j][d]);
        }
        if (i > 0) {
            holeIndex += data[i - 1].length;
            result.holes.push(holeIndex);
        }
    }
    return result;
};
earcut_1.default = default_1;

const X = 0;
const Y = 1;
const Z = 2;

const buildContourXy = (polygon) => {
  const contour = [];
  for (const point of polygon) {
    contour.push(point[X], point[Y]);
  }
  return contour;
};

const buildContourXz = (polygon) => {
  const contour = [];
  for (const point of polygon) {
    contour.push(point[X], point[Z]);
  }
  return contour;
};

const buildContourYz = (polygon) => {
  const contour = [];
  for (const point of polygon) {
    contour.push(point[Y], point[Z]);
  }
  return contour;
};

const selectBuildContour = (plane) => {
  const tZ = dot(plane, [0, 0, 1, 0]);
  if (tZ >= 0.5) {
    // Best aligned with the Z axis.
    return buildContourXy;
  } else if (tZ <= -0.5) {
    return buildContourXy;
  }
  const tY = dot(plane, [0, 1, 0, 0]);
  if (tY >= 0.5) {
    // Best aligned with the Y axis.
    return buildContourXz;
  } else if (tY <= -0.5) {
    return buildContourXz;
  }
  const tX = dot(plane, [1, 0, 0, 0]);
  if (tX >= 0) {
    return buildContourYz;
  } else {
    return buildContourYz;
  }
};

const makeConvexNoHoles = (
  surface,
  normalize3 = createNormalize3(),
  plane
) => {
  if (surface.length === undefined) {
    throw Error('die');
  }
  if (surface.length === 0) {
    // An empty surface is not non-convex.
    return surface;
  }
  if (surface.length === 1) {
    const polygon = surface[0];
    if (polygon.length === 3) {
      // A triangle is already convex.
      return surface;
    }
  }
  if (plane === undefined) {
    plane = toPlane(surface);
    if (plane === undefined) {
      return [];
    }
  }

  const convexSurface = [];
  const buildContour = selectBuildContour(plane);
  for (const polygon of surface) {
    const contour = buildContour(polygon);
    const triangles = earcut_1(contour);
    for (let i = 0; i < triangles.length; i += 3) {
      const a = triangles[i + 0];
      const b = triangles[i + 1];
      const c = triangles[i + 2];
      const triangle = [polygon[a], polygon[b], polygon[c]];
      const trianglePlane = toPlane$1(triangle);
      if (trianglePlane === undefined) {
        // Degenerate.
        continue;
      }
      if (dot(trianglePlane, plane) < 0) {
        convexSurface.push(flip$1(triangle));
      } else {
        convexSurface.push(triangle);
      }
    }
  }

  return convexSurface;
};

const THRESHOLD = 1e-5;

const watertight = Symbol('watertight');

const X$1 = 0;
const Y$1 = 1;
const Z$1 = 2;

const orderVertices = (a, b) => {
  const dX = a[X$1] - b[X$1];
  if (dX !== 0) return dX;
  const dY = a[Y$1] - b[Y$1];
  if (dY !== 0) return dY;
  const dZ = a[Z$1] - b[Z$1];
  return dZ;
};

const makeWatertight = (surface, normalize, threshold = THRESHOLD) => {
  if (!surface[watertight]) {
    if (isWatertight(surface)) {
      surface[watertight] = surface;
    }
  }

  if (!surface[watertight]) {
    if (normalize === undefined) {
      normalize = createNormalize3(1 / threshold);
    }

    const vertices = new Set();
    for (const path of surface) {
      const reconciledPath = [];
      for (const point of path) {
        const reconciledPoint = normalize(point);
        reconciledPath.push(reconciledPoint);
        vertices.add(reconciledPoint);
      }
      if (toPlane$1(reconciledPath) !== undefined) ;
    }

    const orderedVertices = [...vertices];
    orderedVertices.sort(orderVertices);
    for (let i = 0; i < orderedVertices.length; i++) {
      orderedVertices[i].index = i;
    }

    const watertightPaths = [];
    for (const path of surface) {
      const watertightPath = [];
      for (const [start, end] of getEdges(path)) {
        watertightPath.push(start);
        const span = distance(start, end);
        const colinear = [];
        // let limit = Math.max(start.index, end.index);
        // for (let i = Math.min(start.index, end.index); i < limit; i++) {
        for (let i = 0; i < orderedVertices.length; i++) {
          const vertex = orderedVertices[i];
          // FIX: Threshold
          if (
            Math.abs(distance(start, vertex) + distance(vertex, end) - span) <
            threshold
          ) {
            colinear.push(vertex);
          }
        }
        // Arrange by distance from start.
        colinear.sort((a, b) => distance(start, a) - distance(start, b));
        // Insert into the path.
        watertightPath.push(...colinear);
      }
      pushWhenValid(watertightPaths, watertightPath);
    }

    surface[watertight] = watertightPaths;
  }

  return surface[watertight];
};

const isWatertight = (surface) => {
  const edges = new Set();
  for (const path of surface) {
    for (const [start, end] of getEdges(path)) {
      edges.add(`${JSON.stringify([start, end])}`);
    }
  }
  for (const path of surface) {
    for (const [start, end] of getEdges(path)) {
      if (!edges.has(`${JSON.stringify([end, start])}`)) {
        return false;
      }
    }
  }
  return true;
};

const measureArea = (surface) => {
  // CHECK: That this handles negative area properly.
  let total = 0;
  for (const polygon of surface) {
    total += measureArea$1(polygon);
  }
  return total;
};

// returns an array of two Vector3Ds (minimum coordinates and maximum coordinates)
const measureBoundingBox = (surface) => {
  if (surface.measureBoundingBox === undefined) {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (const path of surface) {
      for (const point of path) {
        if (point[0] < min[0]) min[0] = point[0];
        if (point[1] < min[1]) min[1] = point[1];
        if (point[2] < min[2]) min[2] = point[2];
        if (point[0] > max[0]) max[0] = point[0];
        if (point[1] > max[1]) max[1] = point[1];
        if (point[2] > max[2]) max[2] = point[2];
      }
    }
    surface.measureBoundingBox = [min, max];
  }
  return surface.measureBoundingBox;
};

const measureBoundingSphere = (surface) => {
  if (surface.measureBoundingSphere === undefined) {
    const box = measureBoundingBox(surface);
    const center = scale$1(0.5, add(box[0], box[1]));
    const radius = distance(center, box[1]);
    surface.measureBoundingSphere = [center, radius];
  }
  return surface.measureBoundingSphere;
};

const toGeneric = (surface) =>
  surface.map((path) => path.map((point) => [...point]));

const toPoints = (surface) => {
  const points = [];
  eachPoint((point) => points.push(point), surface);
  return points;
};

const toPolygons = (options = {}, surface) => surface;

export { assertCoplanar, assertGood, canonicalize, cut, cutSurface, eachPoint, flip, fromPlane, fromPolygons, makeConvexNoHoles, makeWatertight, measureArea, measureBoundingBox, measureBoundingSphere, rotateZ, scale, toGeneric, toPlane, toPoints, toPolygons, transform, translate };
