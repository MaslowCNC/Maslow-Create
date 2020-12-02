import { dot, length, scale } from './jsxcad-math-vec3.js';
import { toPlane as toPlane$1, flip } from './jsxcad-math-poly3.js';
import { pushWhenValid } from './jsxcad-geometry-polygons.js';

const THRESHOLD = 0.99999;

/**
 * equalsPlane
 *
 * @function
 * @param {Plane} a
 * @param {Plane} b
 * @returns {boolean} b
 */
const equalsPlane = (a, b) => {
  if (a === undefined || b === undefined) {
    return false;
  }
  const t = dot(a, b);
  if (t >= THRESHOLD) {
    return true;
  } else {
    return false;
  }
};

/**
 * getPlanesOfPoint
 *
 * @param {Point} point
 * @returns {Plane[]}
 */
const getPlanesOfPoint = (planesOfPoint, point) => {
  if (!Array.isArray(point)) {
    throw Error(`die: Expected point`);
  }
  let planes = planesOfPoint.get(point);
  if (planes === undefined) {
    planes = [];
    planesOfPoint.set(point, planes);
  }
  return planes;
};

const fromSolidToJunctions = (solid, normalize) => {
  const polygons = [];
  for (const surface of solid) {
    polygons.push(...surface);
  }
  return fromPolygonsToJunctions(polygons, normalize);
};

const fromPolygonsToJunctions = (polygons, normalize) => {
  const planesOfPoint = new Map();

  /**
   * considerJunction
   *
   * @param {Point} point
   * @param {Plane} planeOfPath
   * @returns {undefined}
   */
  const considerJunction = (point, planeOfPolygon) => {
    let planes = getPlanesOfPoint(planesOfPoint, point);
    for (const plane of planes) {
      if (equalsPlane(plane, planeOfPolygon)) {
        return;
      }
    }
    planes.push(planeOfPolygon);
    // A point can be at the corner of more than three polygons.
  };

  for (const polygon of polygons) {
    for (const point of polygon) {
      considerJunction(normalize(point), toPlane$1(polygon));
    }
  }

  return planesOfPoint;
};

/**
 * junctionSelector
 *
 * @function
 * @param {Solid} solid
 * @param {Normalizer} normalize
 * @returns {PointSelector}
 */
const junctionSelector = (junctions, normalize) => {
  const select = (point) => getPlanesOfPoint(junctions, point).length >= 3;

  return select;
};

/**
 * clean
 * @param {Edge} loop
 * @returns {Edge|undefined}
 */
const clean = (loop) => {
  /** @type {Edge} */
  let link = loop;
  do {
    if (link.start === false) {
      throw Error(`die: start is false`);
    }
    if (link.next === undefined) {
      throw Error(`die: ${link.id} ${link.dead}`);
    }
    if (link.to !== undefined) {
      throw Error(`die: to`);
    }
    while (link.next.twin === link.next.next) {
      if (link.next === link.next.next.next) {
        // The loop is degenerate.
        return undefined;
      }
      // We have found a degenerate spur -- trim it off.
      link.next.cleaned = true;
      link.next.next.cleaned = true;
      link.next = link.next.next.next;
      // Make sure we walk around the loop to this point again,
      // in case this exposed another spur.
      loop = link;
    }
    link = link.next;
    link.face = loop;
  } while (link !== loop);

  // Check that the spurs are gone.
  let violations = 0;
  do {
    const twin = link.twin;
    if (twin === undefined || twin.face !== link.face) ; else if (twin.next.next === link.next) {
      // The twin links backward along a spur.
      // These should have been removed in the cleaning phase.
      violations += 1;
    }
    link = link.next;
  } while (link !== loop);

  if (violations > 0) {
    throw Error(`die: twin links backward along a spur ${violations}`);
  }
  return link.face;
};

// This produces a half-edge link.

/**
 * createEdge
 *
 * @function
 * @param {Point=} start
 * @param {Edge=} face
 * @param {Edge=} next
 * @param {Edge=} twin
 * @param {Edge[]=} holes
 * @param {Plane=} plane
 * @param {number=} id
 * @param {boolean=} dead
 * @param {boolean=} spurLinkage
 * @returns {Edge}
 */
const createEdge = (
  start = [0, 0, 0],
  face,
  next,
  twin,
  holes,
  plane,
  id,
  dead,
  spurLinkage
) => ({ start, face, next, twin, holes, plane, id, dead, spurLinkage });

/**
 * @typedef {function(Edge):undefined} Thunk
 * @returns {undefined}
 */

/* @type {function(Edge, Thunk):undefined} */

/**
 * eachLink
 *
 * @function
 * @param {Edge} loop
 * @param {Thunk} thunk
 * @returns {undefined}
 */
const eachLink = (loop, thunk) => {
  let link = loop;
  do {
    thunk(link);
    if (link.dead === true) {
      throw Error('die/dead');
    }
    if (link.next === undefined) {
      throw Error('die/next');
    }
    link = link.next;
  } while (link !== loop);
};

let id = 0;

/**
 * fromSolid
 *
 * @function
 * @param {Solid} solid
 * @param {Normalizer} normalize
 * @param {boolean} closed
 * @returns {Loops}
 */
const fromSolid = (solid, normalize, closed = true, verbose = false) => {
  const twinMap = new Map();
  /**
   * getTwins
   *
   * @param {Point} point
   * @returns {Edge[]}
   */
  const getTwins = (point) => {
    let twins = twinMap.get(point);
    if (twins === undefined) {
      twins = [];
      twinMap.set(point, twins);
    }
    return twins;
  };
  const loops = [];

  for (const surface of solid) {
    for (const path of surface) {
      let first;
      let last;
      for (let nth = 0; nth < path.length; nth++) {
        const thisPoint = normalize(path[nth]);
        const nextPoint = normalize(path[(nth + 1) % path.length]);
        const edge = createEdge(thisPoint);
        edge.id = id++;
        // nextPoint will be the start of the twin.
        getTwins(nextPoint).push(edge);
        if (first === undefined) {
          first = edge;
        }
        if (last !== undefined) {
          last.next = edge;
        }
        // Any arbitrary link will serve for face identity.
        edge.face = first;
        last = edge;
      }
      if (first === undefined) {
        throw Error(`die: ${JSON.stringify(path)}`);
      }
      // Close the loop.
      last.next = first;
      // And collect the closed loop.
      loops.push(first);
    }
  }

  // Bridge the edges.
  let duplicateEdgeCount = 0;
  for (const loop of loops) {
    let link = loop;
    do {
      if (link.twin === undefined) {
        const candidates = twinMap.get(link.start);
        if (candidates === undefined) {
          throw Error('die');
        }
        for (const candidate of candidates) {
          if (candidate.start === link.next.start) {
            if (candidate.twin === undefined) {
              candidate.twin = link;
              link.twin = candidate;
            } else {
              duplicateEdgeCount += 1;
              // throw Error('die');
            }
          }
        }
      }
      link = link.next;
    } while (link !== loop);
  }

  if (duplicateEdgeCount > 0) {
    console.log(`warning: duplicateEdgeCount = ${duplicateEdgeCount}`);
    // throw Error(`die: duplicateEdgeCount = ${duplicateEdgeCount}`);
  }

  let holeCount = 0;
  let edgeCount = 0;

  if (closed) {
    for (const loop of loops) {
      if (loop.face === undefined) continue;
      eachLink(loop, (edge) => {
        edgeCount += 1;
        if (edge.twin === undefined) {
          // A hole in the 2-manifold.
          holeCount += 1;
        }
      });
    }
  }

  if (verbose && holeCount > 0) {
    console.log(`QQ/halfedge/fromSolid/holeCount: ${holeCount}`);
    console.log(`QQ/halfedge/fromSolid/edgeCount: ${edgeCount}`);
  }

  return loops;
};

/**
 * fromSurface
 *
 * @function
 * @param {Surface} surface
 * @param {Normalizer} normalize
 * @returns {Loops}
 */
const fromSurface = (surface, normalize) =>
  fromSolid([surface], normalize, /* closed= */ false);

/**
 * fromPolygons
 *
 * @function
 * @param {Polygons} polygons
 * @param {Normalizer} normalize
 * @returns {Loops}
 */
const fromPolygons = (polygons, normalize) =>
  fromSurface(polygons, normalize);

/**
 * @typedef {import("./types").Edge} Edge
 * @typedef {import("./types").Plane} Plane
 */

const X = 0;
const Y = 1;
const Z = 2;
const W = 3;

/**
 * toPlane
 *
 * @function
 * @param {Edge} loop
 * @param {boolean} recompute
 * @returns {Plane}
 */
const toPlane = (loop, recompute = false) => {
  if (loop.face.plane === undefined || recompute) {
    loop.face.plane = toPlaneFromLoop(loop.face);
  }
  return loop.face.plane;
};

/**
 * Newell's method for computing the plane of a polygon.
 *
 * @function
 * @param {Edge} start
 * @returns {Plane}
 */
const toPlaneFromLoop = (start) => {
  const normal = [0, 0, 0];
  const reference = [0, 0, 0];
  // Run around the ring.
  let size = 0;
  let link = start;
  do {
    const lastPoint = link.start;
    const thisPoint = link.next.start;
    if (lastPoint !== thisPoint) {
      normal[X] +=
        (lastPoint[Y] - thisPoint[Y]) * (lastPoint[Z] + thisPoint[Z]);
      normal[Y] +=
        (lastPoint[Z] - thisPoint[Z]) * (lastPoint[X] + thisPoint[X]);
      normal[Z] +=
        (lastPoint[X] - thisPoint[X]) * (lastPoint[Y] + thisPoint[Y]);
      reference[X] += lastPoint[X];
      reference[Y] += lastPoint[Y];
      reference[Z] += lastPoint[Z];
      size += 1;
    }
    link = link.next;
  } while (link !== start);
  const factor = 1 / length(normal);
  const plane = scale(factor, normal);
  plane[W] = (dot(reference, normal) * factor) / size;
  if (isNaN(plane[X])) {
    return undefined;
  } else {
    return plane;
  }
};

/**
 * @typedef {import("./types").Edge} Edge
 * @typedef {import("./types").Loops} Loops
 */

const merged = Symbol('merged');

/**
 * merge
 *
 * @function
 * @param {Loops} loops
 * @returns {Loops}
 */
const merge = (loops) => {
  const faces = new Set();
  for (const loop of loops) {
    faces.add(loop.face);
  }
  /**
   * walk
   *
   * @param {Edge} loop
   * @returns {Edge}
   */
  const walk = (loop) => {
    if (loop[merged] || loop.next === undefined) return;
    eachLink(loop, (link) => {
      link[merged] = true;
    });
    let link = loop;
    do {
      if (link.face !== link.next.face) {
        throw Error('die');
      }
      const twin = link.twin;
      if (twin === undefined) ; else if (twin.face === link.face) ; else if (link.next === twin) ; else if (equalsPlane(toPlane(link), toPlane(twin))) {
        faces.delete(link.face);
        faces.delete(twin.face);
        // Merge the loops.
        const linkNext = link.next;
        const twinNext = twin.next;

        if (linkNext.dead) throw Error('die');
        if (twinNext.dead) throw Error('die');
        if (twin.twin !== link) throw Error('die');

        if (twinNext === link) throw Error('die');
        if (linkNext === twin) throw Error('die');

        link.twin = undefined;
        twin.twin = undefined;

        Object.assign(link, twinNext);
        link.from = twinNext;
        twinNext.to = link;

        Object.assign(twin, linkNext);
        twin.from = linkNext;
        linkNext.to = twin;

        if (link.twin) {
          link.twin.twin = link;
        }
        if (twin.twin) {
          twin.twin.twin = twin;
        }

        if (twin.next === twin) throw Error('die');

        linkNext.face = undefined;
        linkNext.next = undefined;
        linkNext.twin = undefined;
        linkNext.dead = true;
        linkNext.id -= 1000000;

        twinNext.face = undefined;
        twinNext.next = undefined;
        twinNext.twin = undefined;
        twinNext.dead = true;
        twinNext.id -= 1000000;

        // Ensure we do a complete pass over the merged loop.
        loop = link;

        if (faces.has(loop)) {
          throw Error('die');
        }
        faces.add(loop);

        // Update face affinity to detect self-merging.
        do {
          link.face = loop;
          link = link.next;
        } while (link !== loop);
      }
      if (link.next === undefined) {
        throw Error('die');
      }
      link = link.next;
      if (link.to !== undefined) {
        throw Error('die');
      }
    } while (link !== loop);
    while (link !== link.face) link = link.face;
    return link.face;
  };

  // Test preconditions.
  for (const loop of loops) {
    let link = loop;
    let face = link.face;
    let containsFace = false;
    do {
      if (link.twin) {
        if (link.twin.start !== link.next.start) throw Error('die');
        if (link.twin.next.start !== link.start) throw Error('die');
      }
      if (link.dead) {
        throw Error('die');
      }
      if (link === face) {
        containsFace = true;
      }
      link = link.next;
    } while (link !== loop);
    if (containsFace === false) {
      throw Error('die: Does not contain face');
    }
  }

  const seen = new Set();
  const filtered = [];
  for (const loop of loops.map(walk)) {
    if (loop === undefined) continue;
    if (loop.next === undefined) continue;
    if (loop.face === undefined) continue;
    if (loop.dead !== undefined) continue;
    // Test postconditions.
    let link = loop;
    do {
      if (link.face.id !== loop.face.id) throw Error('die');
      link = link.next;
    } while (link !== loop);
    if (seen.has(loop.face)) ; else {
      seen.add(loop.face);
      // We're getting the wrong ones in here, sometimes.
      filtered.push(loop);
    }
  }
  return filtered;
};

/**
 * walk
 *
 * @param {Edge} loop
 * @param holes
 * @returns {Edge}
 */
const splitBridges = (uncleanedLoop, holes) => {
  const loop = clean(uncleanedLoop);
  if (loop.face.holes) {
    throw Error('die');
  }
  let link = loop;
  do {
    if (link.holes) {
      throw Error('die');
    }
    const twin = link.twin;
    if (twin === undefined || twin.face !== link.face) ; else if (twin.next.next === link.next) {
      // The twin links backward along a spur.
      // These should have been removed in the cleaning phase.
      // throw Error(`die: ${toDot([link])}`);
      throw Error(`die: ${link.face.id}`);
    } else if (link.next === twin) {
      // Spur
      throw Error('die');
    } else {
      // Found a self-linkage.
      if (twin === link) throw Error('die');
      if (twin.twin !== link) throw Error('die');
      const linkPlane = toPlane(link);
      const linkNext = link.next;
      const twinNext = twin.next;
      link.twin = undefined;
      Object.assign(link, twinNext);
      twin.twin = undefined;
      Object.assign(twin, linkNext);

      if (link.twin) {
        link.twin.twin = link;
      }
      if (twin.twin) {
        twin.twin.twin = twin;
      }

      // One loop was merged with itself, producing a new hole.
      // But we're not sure which loop is the hole and which is the loop around the hole.

      // Elect new faces.
      eachLink(link, (edge) => {
        edge.face = link;
      });
      eachLink(twin, (edge) => {
        edge.face = twin;
      });

      // Check the orientations to see which is the hole.
      const newLinkPlane = toPlane(link, /* recompute= */ true);
      const newTwinPlane = toPlane(twin, /* recompute= */ true);

      if (newLinkPlane === undefined) {
        throw Error('die');
      } else if (newTwinPlane === undefined) {
        throw Error('die');
      } else if (equalsPlane(linkPlane, newLinkPlane)) {
        // The twin loop is the hole.
        if (!equalsPlane(linkPlane, newTwinPlane)) {
          // But they have the same orientation, which means that it isn't a bridge,
          throw Error('die');
        }
        splitBridges(link, holes);
        splitBridges(twin, holes);
      } else {
        // The link loop is the hole.
        if (!equalsPlane(linkPlane, newLinkPlane)) {
          // But they have the same orientation, which means that it isn't a hole,
          // but a region connected by a degenerate bridge.
          throw Error('die');
        }
        splitBridges(link, holes);
        splitBridges(twin, holes);
      }
      // We've delegated hole collection.
      return;
    }
    link = link.next;
  } while (link !== loop);

  holes.push(link.face);
};

/**
 * split
 *
 * @function
 * @param {Loops} loops
 * @returns {Loops}
 */
const split = (loops) => {
  /**
   * walk
   *
   * @param {Edge} loop
   * @param isHole
   * @returns {Edge}
   */
  const walk = (loop, isHole = false) => {
    let link = loop;
    do {
      let twin = link.twin;
      if (twin === undefined || twin.face !== link.face) ; else if (twin.next.next === link.next) {
        // The bridge is going backward -- catch it on the next cycle.
        loop = link;
      } else if (twin === link.next) {
        // Spur
        throw Error('die/spur1');
      } else if (twin.next === link) {
        // Spur
        throw Error('die/spur2');
      } else {
        // Remember any existing holes, when the face migrates.
        const holes = link.face.holes || [];
        link.face.holes = undefined;

        // Found a self-linkage.
        if (twin === link) throw Error('die');
        if (twin.twin !== link) throw Error('die');
        const linkPlane = toPlane(link);
        const linkNext = link.next;
        const twinNext = twin.next;
        link.twin = undefined;
        Object.assign(link, twinNext);
        twin.twin = undefined;
        Object.assign(twin, linkNext);

        if (link.twin) {
          link.twin.twin = link;
        }
        if (twin.twin) {
          twin.twin.twin = twin;
        }

        // One loop was merged with itself, producing a new hole.
        // But we're not sure which loop is the hole and which is the loop around the hole.

        // Elect new faces.
        eachLink(link, (edge) => {
          edge.face = link;
        });
        eachLink(twin, (edge) => {
          edge.face = twin;
        });

        // Now that the loops are separated, clean up any residual canals.
        link = clean(link);
        twin = clean(twin);

        // Check the orientations to see which is the hole.
        const newLinkPlane = toPlane(link, /* recompute= */ true);
        const newTwinPlane = toPlane(twin, /* recompute= */ true);

        if (newLinkPlane === undefined) {
          // The link loop is a degenerate hole.
          // This is probably nibbling away at the end of a canal.
          twin.face.holes = holes;
          loop = link = twin;
        } else if (newTwinPlane === undefined) {
          // The twin loop is a degenerate hole.
          // This is probably nibbling away at the end of a canal.
          link.face.holes = holes;
          loop = link;
        } else if (equalsPlane(linkPlane, newLinkPlane)) {
          // The twin loop is the hole.
          if (equalsPlane(linkPlane, newTwinPlane)) {
            // But they have the same orientation, which means that it isn't a hole,
            // but a region connected by a degenerate bridge.
            throw Error('die');
          }
          splitBridges(twin, holes);
          link.face.holes = holes;
          loop = link;
        } else {
          // The link loop is the hole.
          if (equalsPlane(linkPlane, newLinkPlane)) {
            // But they have the same orientation, which means that it isn't a hole,
            // but a region connected by a degenerate bridge.
            throw Error('die');
          }
          splitBridges(link, holes);
          twin.face.holes = holes;
          // Switch to traversing the non-hole portion of the loop.
          loop = link = twin;
        }
      }
      link = link.next;
    } while (link !== loop);
    return link.face;
  };

  const splitLoops = loops.map(walk);

  return splitLoops;
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

/**
 * @typedef {import("./types").Edge} Edge
 * @typedef {import("./types").Path} Path
 * @typedef {import("./types").Plane} Plane
 * @typedef {import("./types").PointSelector} PointSelector
 * @typedef {import("./types").Polygons} Polygons
 */

const X$1 = 0;
const Y$1 = 1;
const Z$1 = 2;

/**
 * buildContourXy
 *
 * @function
 * @param {Path} points
 * @param {number[]} contour
 * @param {Edge} loop
 * @param {PointSelector} selectJunction
 * @returns {number}
 */
const buildContourXy = (points, contour, loop, selectJunction) => {
  const index = contour.length >>> 1;
  let link = loop;
  do {
    if (link.start !== link.next.start && selectJunction(link.start)) {
      points.push(link.start);
      contour.push(link.start[X$1], link.start[Y$1]);
    }
    link = link.next;
  } while (link !== loop);
  return index;
};

/**
 * buildContourXz
 *
 * @function
 * @param {Path} points
 * @param {number[]} contour
 * @param {Edge} loop
 * @param {PointSelector} selectJunction
 * @returns {number}
 */
const buildContourXz = (points, contour, loop, selectJunction) => {
  const index = contour.length >>> 1;
  let link = loop;
  do {
    if (link.start !== link.next.start && selectJunction(link.start)) {
      points.push(link.start);
      contour.push(link.start[X$1], link.start[Z$1]);
    }
    link = link.next;
  } while (link !== loop);
  return index;
};

/**
 * buildContourYz
 *
 * @function
 * @param {Path} points
 * @param {number[]} contour
 * @param {Edge} loop
 * @param {PointSelector} selectJunction
 * @returns {number}
 */
const buildContourYz = (points, contour, loop, selectJunction) => {
  const index = contour.length >>> 1;
  let link = loop;
  do {
    if (link.start !== link.next.start && selectJunction(link.start)) {
      points.push(link.start);
      contour.push(link.start[Y$1], link.start[Z$1]);
    }
    link = link.next;
  } while (link !== loop);
  return index;
};

/**
 * selectBuildContour
 *
 * @function
 * @param {Plane} plane
 * @returns {function}
 */
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

/**
 * pushConvexPolygons
 *
 * @function
 * @param {Polygons} polygons
 * @param {Edge} loop
 * @param {PointSelector} selectJunction
 * @returns {undefined}
 */
const pushConvexPolygons = (
  polygons,
  loop,
  selectJunction,
  concavePolygons
) => {
  const plane = toPlane(loop);
  const buildContour = selectBuildContour(plane);
  const points = [];
  const contour = [];
  buildContour(points, contour, loop, selectJunction);
  concavePolygons.push(...points);
  const holes = [];
  if (loop.face.holes) {
    for (const hole of loop.face.holes) {
      const index = buildContour(points, contour, hole, selectJunction);
      if (index !== contour.length >>> 1) {
        holes.push(index);
      }
    }
  }
  const triangles = earcut_1(contour, holes);
  for (let i = 0; i < triangles.length; i += 3) {
    const a = triangles[i + 0];
    const b = triangles[i + 1];
    const c = triangles[i + 2];
    const triangle = [points[a], points[b], points[c]];
    const trianglePlane = toPlane$1(triangle);
    if (trianglePlane === undefined) {
      // Degenerate.
      continue;
    }
    if (dot(trianglePlane, plane) < 0) {
      polygons.push(flip(triangle));
    } else {
      polygons.push(triangle);
    }
  }
};

/**
 * @typedef {import("./types").Edge} Edge
 * @typedef {import("./types").Loops} Loops
 * @typedef {import("./types").PointSelector} PointSelector
 * @typedef {import("./types").Solid} Solid
 */

const walked = Symbol('walked');

/*
const pushPolygon = (polygons, loop) => {
  const polygon = [];
  eachLink(loop, link => polygon.push(link.start));
  polygons.push(polygon);
};
*/

// FIX: Coplanar surface coherence.
/**
 * toSolid
 *
 * @function
 * @param {Loops} loops
 * @param {PointSelector} selectJunction
 * @returns {Solid}
 */
const toSolid = (loops, selectJunction) => {
  const solid = [];

  // Note holes so that we don't try to render them.
  // FIX: Remove this tracking.
  const holes = new Set();
  for (const loop of loops) {
    if (loop === undefined || loop.dead || loop.face === undefined) continue;
    if (loop.face.holes) {
      for (const hole of loop.face.holes) {
        holes.add(hole.face);
      }
    }
  }

  /**
   * walk
   *
   * @param {Edge} loop
   * @returns {undefined}
   */
  const walk = (loop) => {
    if (
      loop === undefined ||
      loop.dead ||
      loop[walked] ||
      loop.face === undefined
    ) {
      return;
    }
    if (holes.has(loop.face)) return;
    eachLink(loop, (link) => {
      link[walked] = true;
    });
    eachLink(loop, (link) => walk(link.twin));
    const polygons = [];
    const concavePolygons = [];
    pushConvexPolygons(polygons, loop, selectJunction, concavePolygons);
    solid.push(polygons);
  };

  for (const loop of loops) {
    walk(loop.face);
  }

  return solid;
};

/**
 * CleanSolid produces a defragmented version of a solid, while maintaining watertightness.
 *
 * @function
 * @param {Solid} solid
 * @param {Normalizer} normalize
 * @returns {Solid}
 */

const fromSolidToCleanSolid = (
  solid,
  normalize,
  isJunction = junctionSelector(fromSolidToJunctions(solid, normalize))
) =>
  fromLoopsToCleanSolid(
    fromSolid(solid, normalize, /* closed= */ true),
    normalize,
    isJunction
  );

const fromPolygonsToCleanSolid = (
  polygons,
  normalize,
  isJunction = junctionSelector(fromPolygonsToJunctions(polygons, normalize))
) =>
  fromLoopsToCleanSolid(
    fromPolygons(polygons, normalize),
    isJunction,
    normalize
  );

const fromLoopsToCleanSolid = (loops, normalize, isJunction) => {
  const mergedLoops = merge(loops);
  /** @type {Edge[]} */
  const cleanedLoops = mergedLoops.map(clean);
  const splitLoops = split(cleanedLoops);
  const cleanedSolid = toSolid(splitLoops, isJunction);
  return cleanedSolid;
};

const toSurface = (loops, selectJunction) => {
  const surface = [];
  const solid = toSolid(loops, selectJunction);
  for (const loops of solid) {
    surface.push(...loops);
  }
  return surface;
};

const fromSurfaceToCleanSurface = (
  surface,
  normalize,
  isJunction = (point) => true
) =>
  fromLoopsToCleanSurface(
    fromSurface(surface, normalize),
    isJunction,
    normalize
  );

const fromLoopsToCleanSurface = (loops, normalize, isJunction) => {
  const mergedLoops = merge(loops);
  /** @type {Edge[]} */
  const cleanedLoops = mergedLoops.map(clean);
  const splitLoops = split(cleanedLoops);
  const cleanedSurface = toSurface(splitLoops, isJunction);
  return cleanedSurface;
};

/**
 * @typedef {import("./types").Loops} Loops
 * @typedef {import("./types").Polygons} Polygons
 */

/**
 * toPolygons
 *
 * @function
 * @param {Loops} loops
 * @returns {Polygons}
 */
const toPolygons = (loops, includeFaces = true, includeHoles = true) => {
  const polygons = [];
  const faces = [];
  for (const loop of loops) {
    if (includeFaces) {
      faces.push(loop.face);
    }
    if (loop.face.holes && includeHoles) {
      faces.push(...loop.face.holes);
    }
  }
  for (const face of faces) {
    const polygon = [];
    eachLink(face, (edge) => {
      if (edge.face !== undefined) {
        polygon.push(edge.start);
      }
    });
    pushWhenValid(polygons, polygon);
  }
  return polygons;
};

/**
 * @typedef {import("./types").Normalizer} Normalizer
 * @typedef {import("./types").Solid} Solid
 */

/**
 * Produces the outline of a surface.
 *
 * @function
 * @param {Surface} surface
 * @param {Normalizer} normalize
 * @returns {Surface}
 */
const outlineSurface = (
  surface,
  normalize,
  includeFaces = true,
  includeHoles = true
) => {
  const loops = fromSurface(surface, normalize);
  const mergedLoops = merge(loops);
  const cleanedLoops = mergedLoops.map(clean);
  const splitLoops = split(cleanedLoops);
  return toPolygons(splitLoops, includeFaces, includeHoles);
};

/**
 * @typedef {import("./types").Normalizer} Normalizer
 * @typedef {import("./types").Solid} Solid
 */

/**
 * Produces the outline of a solid.
 *
 * @function
 * @param {Surface} surface
 * @param {Normalizer} normalize
 * @returns {Surface}
 */
const outlineSolid = (solid, normalize) => {
  const loops = fromSolid(solid, normalize);
  const mergedLoops = merge(loops);
  const cleanedLoops = mergedLoops.map(clean);
  const splitLoops = split(cleanedLoops);
  return toPolygons(splitLoops);
};

export { fromLoopsToCleanSolid, fromLoopsToCleanSurface, fromPolygonsToCleanSolid, fromSolid, fromSolidToCleanSolid, fromSurface, fromSurfaceToCleanSurface, junctionSelector, outlineSolid, outlineSurface, toPlane, toPolygons, toSolid };
