import { fromSurfaceMeshToGraph, fromPointsToAlphaShapeAsSurfaceMesh, fromSurfaceMeshToLazyGraph, fromPointsToConvexHullAsSurfaceMesh, fromPolygonsToSurfaceMesh, fromGraphToSurfaceMesh, fromSurfaceMeshEmitBoundingBox, extrudeSurfaceMesh, arrangePaths, sectionOfSurfaceMesh, differenceOfSurfaceMeshes, extrudeToPlaneOfSurfaceMesh, fromSurfaceMeshToTriangles, fromPointsToSurfaceMesh, outlineOfSurfaceMesh, insetOfPolygon, intersectionOfSurfaceMeshes, offsetOfPolygon, smoothSurfaceMesh, transformSurfaceMesh, unionOfSurfaceMeshes } from './jsxcad-algorithm-cgal.js';
import { equals as equals$1, dot, min, max, scale } from './jsxcad-math-vec3.js';
import { deduplicate as deduplicate$1, isClockwise, flip as flip$1 } from './jsxcad-geometry-path.js';
import { toPlane, flip } from './jsxcad-math-poly3.js';
import { canonicalize } from './jsxcad-geometry-paths.js';
import { canonicalize as canonicalize$1 } from './jsxcad-math-plane.js';

const graphSymbol = Symbol('graph');
const surfaceMeshSymbol = Symbol('surfaceMeshSymbol');

const create = () => ({ points: [], edges: [], loops: [], faces: [] });

const addEdge = (graph, { point, next = -1, loop = -1, twin = -1 }) => {
  const edge = graph.edges.length;
  graph.edges.push({ point, loop, twin, next });
  return edge;
};

const addFace = (graph, { plane, loop = -1 } = {}) => {
  const face = graph.faces.length;
  graph.faces.push({ plane, loop });
  return face;
};

const addLoop = (graph, { edge = -1, face = -1 } = {}) => {
  const loop = graph.loops.length;
  graph.loops.push({ edge, face });
  if (face !== -1) {
    getFaceNode(graph, face).loop = loop;
  }
  return loop;
};

const addLoopFromPoints = (graph, points, { face }) => {
  const loop = addLoop(graph);
  fillLoopFromPoints(graph, loop, points);
  const loopNode = getLoopNode(graph, loop);
  const faceNode = getFaceNode(graph, face);
  faceNode.loop = loop;
  loopNode.face = face;
  return loop;
};

const addHoleFromPoints = (graph, points, { face }) => {
  const loop = addLoop(graph);
  fillLoopFromPoints(graph, loop, points);
  const loopNode = getLoopNode(graph, loop);
  const faceNode = getFaceNode(graph, face);
  if (!faceNode.holes) {
    faceNode.holes = [];
  }
  faceNode.holes.push(loop);
  loopNode.face = face;
  return loop;
};

const fillLoopFromPoints = (graph, loop, points) => {
  const loopNode = getLoopNode(graph, loop);
  let lastEdgeNode;
  for (const coord of points) {
    const point = addPoint(graph, coord);
    const edge = addEdge(graph, { loop, point });
    if (lastEdgeNode) {
      lastEdgeNode.next = edge;
    } else {
      loopNode.edge = edge;
    }
    lastEdgeNode = getEdgeNode(graph, edge);
  }
  lastEdgeNode.next = loopNode.edge;
  return loop;
};

const addPoint = (graph, point) => {
  for (let nth = 0; nth < graph.points.length; nth++) {
    if (equals$1(graph.points[nth], point)) {
      return nth;
    }
  }
  const id = graph.points.length;
  graph.points.push(point);
  return id;
};

const eachEdge = (graph, op) =>
  graph.edges.forEach((node, nth) => {
    if (node && node.isRemoved !== true) {
      op(nth, node);
    }
  });

const eachFace = (graph, op) =>
  graph.faces.forEach((faceNode, face) => op(face, faceNode));

const eachFaceEdge = (graph, face, op) =>
  eachFaceLoop(graph, face, (loop) => eachLoopEdge(graph, loop, op));

const eachFaceLoop = (graph, face, op) => {
  const loop = getFaceNode(graph, face).loop;
  op(loop, getLoopNode(graph, loop));
};

const eachFaceHole = (graph, face, op) => {
  const faceNode = getFaceNode(graph, face);
  if (faceNode.holes) {
    for (const hole of faceNode.holes) {
      op(hole, getLoopNode(graph, hole));
    }
  }
};

const eachLoopEdge = (graph, loop, op) => {
  const start = getLoopNode(graph, loop).edge;
  if (start === -1) {
    return;
  }
  const limit = graph.edges.length;
  let count = 0;
  let edge = start;
  do {
    const edgeNode = graph.edges[edge];
    op(edge, edgeNode);
    edge = edgeNode.next;
    if (count++ > limit) {
      throw Error(`Infinite edge loop`);
    }
  } while (edge !== start);
};

const getEdgeNode = (graph, edge) => graph.edges[edge];
const getFaceNode = (graph, face) => graph.faces[face];
const getLoopNode = (graph, loop) => graph.loops[loop];
const getPointNode = (graph, point) => graph.points[point];

const removeZeroLengthEdges = (graph) => {
  let removed = false;
  eachEdge(graph, (edge, edgeNode) => {
    const nextEdgeNode = getEdgeNode(graph, edgeNode.next);
    if (edgeNode.point === nextEdgeNode.point) {
      // Cut the edge out of the loop.
      edgeNode.next = nextEdgeNode.next;
      // Ensure that the loop doesn't enter on the removed edge.
      getLoopNode(graph, edgeNode.loop).edge = edge;
      // Mark as removed for debugging purposes.
      nextEdgeNode.isRemoved = true;
      nextEdgeNode.next = -1;
      // Any twin should be in the same situation and remove itself.
      removed = true;
    }
  });
  return removed;
};

const repair = (graph) => {
  if (removeZeroLengthEdges(graph)) {
    if (!checkGraph(graph)) ;
    return true;
  }
  return false;
};

const checkTwins = (graph) => {
  eachEdge(graph, (edge, edgeNode) => {
    if (edgeNode.twin === -1) {
      return;
    }
    const twinNode = getEdgeNode(graph, edge.twin);
    if (!twinNode) {
      return;
    }
    if (twinNode.isRemoved) {
      throw Error('removed twin');
    }
  });
  return true;
};

const checkGraph = (graph) => {
  return checkTwins(graph);
};

const fromSurfaceMesh = (surfaceMesh) => {
  if (surfaceMesh === undefined) {
    throw Error('die');
  }
  let graph = surfaceMesh[graphSymbol];
  if (graph === undefined || graph.isLazy) {
    const converted = fromSurfaceMeshToGraph(surfaceMesh);
    if (graph.isLazy) {
      Object.assign(graph, converted, { isLazy: false });
    } else {
      graph = converted;
    }
    if (!repair(graph)) {
      // If the graph wasn't repaired, we can re-use the input mesh.
      surfaceMesh[graphSymbol] = graph;
      graph[surfaceMeshSymbol] = surfaceMesh;
    }
  }
  return graph;
};

const alphaShape = (points, componentLimit) =>
  fromSurfaceMesh(fromPointsToAlphaShapeAsSurfaceMesh(points, componentLimit));

const fromSurfaceMeshLazy = (surfaceMesh) => {
  let graph = surfaceMesh[graphSymbol];
  if (graph === undefined) {
    graph = fromSurfaceMeshToLazyGraph(surfaceMesh);
    surfaceMesh[graphSymbol] = graph;
    graph[surfaceMeshSymbol] = surfaceMesh;
  }
  return graph;
};

const convexHull = (points) =>
  fromSurfaceMeshLazy(fromPointsToConvexHullAsSurfaceMesh(points));

const deduplicate = (surface) => surface.map(deduplicate$1);

const fromSurface = (surface) =>
  fromSurfaceMeshLazy(fromPolygonsToSurfaceMesh(deduplicate(surface)));

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

const buildContourXy = (points, contour, graph, loop, selectJunction) => {
  const index = contour.length >>> 1;
  eachLoopEdge(graph, loop, (edge, edgeNode) => {
    const point = getPointNode(graph, edgeNode.point);
    if (selectJunction(point)) {
      points.push(point);
      contour.push(point[X], point[Y]);
    }
  });
  return index;
};

const buildContourXz = (points, contour, graph, loop, selectJunction) => {
  const index = contour.length >>> 1;
  eachLoopEdge(graph, loop, (edge, edgeNode) => {
    const point = getPointNode(graph, edgeNode.point);
    if (selectJunction(edgeNode.point)) {
      points.push(point);
      contour.push(point[X], point[Z]);
    }
  });
  return index;
};

const buildContourYz = (points, contour, graph, loop, selectJunction) => {
  const index = contour.length >>> 1;
  eachLoopEdge(graph, loop, (edge, edgeNode) => {
    const point = getPointNode(graph, edgeNode.point);
    if (selectJunction(edgeNode.point)) {
      points.push(point);
      contour.push(point[Y], point[Z]);
    }
  });
  return index;
};

const selectBuildContour = (plane) => {
  const tZ = dot(plane, [0, 0, 1, 0]);
  if (tZ >= 0.5) {
    // Best aligned with the Z axis.
    return buildContourXy;
  } else if (tZ <= -0.5) {
    // Best aligned with the Z axis.
    return buildContourXy;
  }
  const tY = dot(plane, [0, 1, 0, 0]);
  if (tY >= 0.5) {
    // Best aligned with the Y axis.
    return buildContourXz;
  } else if (tY <= -0.5) {
    // Best aligned with the Y axis.
    return buildContourXz;
  }
  // Best aligned with the X axis.
  return buildContourYz;
};

const pushConvexPolygons = (
  polygons,
  graph,
  face,
  selectJunction = (any) => true,
  concavePolygons
) => {
  const faceNode = getFaceNode(graph, face);
  let plane = faceNode.plane;
  if (plane === undefined) {
    return;
  }
  const buildContour = selectBuildContour(plane);
  const points = [];
  const contour = [];
  buildContour(points, contour, graph, faceNode.loop, selectJunction);
  if (points.length < 3) {
    // We can't build a polygon from this.
    return;
  }
  if (points.length === 3) {
    // Triangles are easy.
    polygons.push(points);
    return;
  }
  if (concavePolygons) {
    concavePolygons.push(...points);
  }
  if (dot(toPlane(points), plane) < 0.9) {
    console.log(`QQ/plane drift`);
  }
  const holes = [];
  if (faceNode.holes) {
    for (const hole of faceNode.holes) {
      const index = buildContour(points, contour, graph, hole, selectJunction);
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
    const trianglePlane = toPlane(triangle);
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

const realizeGraph = (graph) => {
  if (graph.isLazy) {
    return fromSurfaceMesh(graph[surfaceMeshSymbol]);
  } else {
    return graph;
  }
};

// FIX: Check coplanarity?
const toSurface = (graph) => {
  const surface = [];
  eachFace(realizeGraph(graph), (face) => {
    pushConvexPolygons(surface, graph, face);
  });
  return surface;
};

const toSurfaceMesh = (graph) => {
  let surfaceMesh = graph[surfaceMeshSymbol];
  if (surfaceMesh === undefined) {
    if (graph.isOutline) {
      // SurfaceMesh can't handle outlines -- rebuild as a surface.
      return toSurfaceMesh(fromSurface(toSurface(graph)));
    } else {
      surfaceMesh = fromGraphToSurfaceMesh(graph);
    }
    graph[surfaceMeshSymbol] = surfaceMesh;
    surfaceMesh[graphSymbol] = graph;
  }
  return surfaceMesh;
};

const measureBoundingBox = (graph) => {
  if (graph.boundingBox === undefined) {
    if (graph.isLazy) {
      fromSurfaceMeshEmitBoundingBox(
        toSurfaceMesh(graph),
        (xMin, yMin, zMin, xMax, yMax, zMax) => {
          graph.boundingBox = [
            [xMin, yMin, zMin],
            [xMax, yMax, zMax],
          ];
        }
      );
    } else {
      let minPoint = [Infinity, Infinity, Infinity];
      let maxPoint = [-Infinity, -Infinity, -Infinity];
      if (graph.points) {
        for (const point of graph.points) {
          if (point !== undefined) {
            minPoint = min(minPoint, point);
            maxPoint = max(maxPoint, point);
          }
        }
      }
      graph.boundingBox = [minPoint, maxPoint];
    }
  }
  return graph.boundingBox;
};

const iota = 1e-5;
const X$1 = 0;
const Y$1 = 1;
const Z$1 = 2;

// Requires a conservative gap.
const doesNotOverlap = (a, b) => {
  if (a.isEmpty || b.isEmpty) {
    return true;
  }
  const [minA, maxA] = measureBoundingBox(a);
  const [minB, maxB] = measureBoundingBox(b);
  if (maxA[X$1] <= minB[X$1] - iota * 10) {
    return true;
  }
  if (maxA[Y$1] <= minB[Y$1] - iota * 10) {
    return true;
  }
  if (maxA[Z$1] <= minB[Z$1] - iota * 10) {
    return true;
  }
  if (maxB[X$1] <= minA[X$1] - iota * 10) {
    return true;
  }
  if (maxB[Y$1] <= minA[Y$1] - iota * 10) {
    return true;
  }
  if (maxB[Z$1] <= minA[Z$1] - iota * 10) {
    return true;
  }
  return false;
};

const extrude = (graph, height, depth) => {
  realizeGraph(graph);
  if (graph.faces.length > 0) {
    // Arbitrarily pick the plane of the first graph to extrude along.
    let normal;
    for (const face of graph.faces) {
      if (face && face.plane) {
        normal = face.plane;
        break;
      }
    }
    return fromSurfaceMeshLazy(
      extrudeSurfaceMesh(
        toSurfaceMesh(graph),
        ...scale(height, normal),
        ...scale(depth, normal)
      )
    );
  } else {
    return graph;
  }
};

const orientClockwise = (path) => (isClockwise(path) ? path : flip$1(path));
const orientCounterClockwise = (path) =>
  isClockwise(path) ? flip$1(path) : path;

const Z$2 = 2;
const W = 3;

const fromPaths = (inputPaths) => {
  const paths = canonicalize(inputPaths);
  const graph = create();
  let plane = [0, 0, 1, 0];
  let updated = false;
  // FIX: Figure out a better way to get a principle plane.
  // Pick some point elevation.
  for (const path of paths) {
    for (const point of path) {
      if (point === null) {
        continue;
      }
      plane[W] = point[Z$2];
      updated = true;
      break;
    }
    if (updated) {
      break;
    }
  }
  if (plane) {
    const arrangement = arrangePaths(...plane, paths);
    for (const { points, holes } of arrangement) {
      const face = addFace(graph, { plane });
      const exterior = orientCounterClockwise(points);
      addLoopFromPoints(graph, deduplicate$1(exterior), { face });
      for (const hole of holes) {
        const interior = orientClockwise(hole);
        addHoleFromPoints(graph, deduplicate$1(interior), { face });
      }
    }
  }
  if (graph.edges.length === 0) {
    graph.isEmpty = true;
  }
  graph.isClosed = false;
  graph.isOutline = true;
  graph.isWireframe = true;
  return graph;
};

// FIX: Actually determine the principle plane.
const principlePlane = (graph) => {
  for (const face of realizeGraph(graph).faces) {
    if (face && face.plane) {
      return face.plane;
    }
  }
};

const section = (graph, planes) =>
  sectionOfSurfaceMesh(toSurfaceMesh(graph), planes);

const far = 10000;

const difference = (a, b) => {
  if (a.isEmpty || b.isEmpty) {
    return a;
  }
  if (!a.isClosed) {
    return fromPaths(
      section(difference(extrude(a, far, 0), b), [principlePlane(a)])[0]
    );
  }
  if (!b.isClosed) {
    b = extrude(b, far, 0);
  }
  if (doesNotOverlap(a, b)) {
    return a;
  }
  // return fromNefPolyhedron(differenceOfNefPolyhedrons(toNefPolyhedron(a), toNefPolyhedron(b)));
  return fromSurfaceMeshLazy(
    differenceOfSurfaceMeshes(toSurfaceMesh(a), toSurfaceMesh(b))
  );
};

const eachPoint = (graph, op) => {
  for (const point of realizeGraph(graph).points) {
    if (point !== undefined) {
      op(point);
    }
  }
};

const extrudeToPlane = (graph, highPlane, lowPlane) => {
  if (realizeGraph(graph).faces.length > 0) {
    // Arbitrarily pick the plane of the first graph to extrude along.
    let normal;
    for (const face of graph.faces) {
      if (face && face.plane) {
        normal = face.plane;
        break;
      }
    }
    return fromSurfaceMeshLazy(
      extrudeToPlaneOfSurfaceMesh(
        toSurfaceMesh(graph),
        ...scale(1, normal),
        ...highPlane,
        ...scale(-1, normal),
        ...lowPlane
      )
    );
  } else {
    return graph;
  }
};

const fromPolygons = (polygons) =>
  fromSurfaceMeshLazy(fromPolygonsToSurfaceMesh(polygons));

const toTriangles = (graph) => {
  if (graph.isOutline) {
    // Outlines aren't compatible with SurfaceMesh.
    return toSurface(graph);
  } else {
    return fromSurfaceMeshToTriangles(toSurfaceMesh(graph));
  }
};

// Convert an outline graph to a possibly closed surface.
const fill = (graph) => fromPolygons(toTriangles(graph));

const fromPoints = (points) =>
  fromSurfaceMeshLazy(fromPointsToSurfaceMesh(points));

const fromSolid = (solid) => {
  const polygons = [];
  for (const surface of solid) {
    polygons.push(...surface);
  }
  return fromPolygons(polygons);
};

// FIX: Rename to 'wire'?
const outline = (graph) => {
  if (graph.isOutline) {
    if (graph.isWireframe) {
      return graph;
    } else {
      return { ...graph, isWireframe: true };
    }
  }
  const outlineGraph = fromSurfaceMeshLazy(
    outlineOfSurfaceMesh(toSurfaceMesh(graph))
  );
  outlineGraph.isOutline = true;
  outlineGraph.isWireframe = true;
  return outlineGraph;
};

const inset = (graph, initial, step, limit) => {
  const outlineGraph = outline(graph);
  const offsetGraph = create();
  eachFace(realizeGraph(outlineGraph), (face, { plane, loop, holes }) => {
    const polygon = [];
    eachLoopEdge(outlineGraph, loop, (edge, { point }) => {
      polygon.push(getPointNode(outlineGraph, point));
    });
    const polygonHoles = [];
    if (holes) {
      for (const hole of holes) {
        const polygon = [];
        eachLoopEdge(outlineGraph, hole, (edge, { point }) => {
          polygon.push(getPointNode(outlineGraph, point));
        });
        polygonHoles.push(polygon);
      }
    }
    for (const { boundary, holes } of insetOfPolygon(
      initial,
      step,
      limit,
      canonicalize$1(plane), // FIX: Use exact transforms to avoid drift.
      polygon,
      polygonHoles
    )) {
      let offsetFace = addFace(offsetGraph, { plane });
      addLoopFromPoints(offsetGraph, boundary, { face: offsetFace });
      for (const hole of holes) {
        addHoleFromPoints(offsetGraph, hole, { face: offsetFace });
      }
    }
  });
  offsetGraph.isClosed = false;
  offsetGraph.isOutline = true;
  if (offsetGraph.points.length === 0) {
    offsetGraph.isEmpty = true;
  }
  return offsetGraph;
};

const far$1 = 10000;

const intersection = (a, b) => {
  if (a.isEmpty) {
    return a;
  }
  if (b.isEmpty) {
    return b;
  }
  if (!a.isClosed) {
    return fromPaths(
      section(intersection(extrude(a, far$1, 0), b), [principlePlane(a)])[0]
    );
  }
  if (!b.isClosed) {
    b = extrude(b, far$1, 0);
  }
  if (doesNotOverlap(a, b)) {
    return { isEmpty: true };
  }
  // return fromNefPolyhedron(intersectionOfNefPolyhedrons(toNefPolyhedron(a), toNefPolyhedron(b)));
  return fromSurfaceMeshLazy(
    intersectionOfSurfaceMeshes(toSurfaceMesh(a), toSurfaceMesh(b))
  );
};

const offset = (graph, initial, step, limit) => {
  const outlineGraph = outline(graph);
  const offsetGraph = create();
  eachFace(realizeGraph(outlineGraph), (face, { plane, loop, holes }) => {
    const polygon = [];
    eachLoopEdge(outlineGraph, loop, (edge, { point }) => {
      polygon.push(getPointNode(outlineGraph, point));
    });
    const polygonHoles = [];
    if (holes) {
      for (const hole of holes) {
        const polygon = [];
        eachLoopEdge(outlineGraph, hole, (edge, { point }) => {
          polygon.push(getPointNode(outlineGraph, point));
        });
        polygonHoles.push(polygon);
      }
    }
    for (const { boundary, holes } of offsetOfPolygon(
      initial,
      step,
      limit,
      plane,
      polygon,
      polygonHoles
    )) {
      let offsetFace = addFace(offsetGraph, { plane });
      addLoopFromPoints(offsetGraph, boundary, { face: offsetFace });
      for (const hole of holes) {
        addHoleFromPoints(offsetGraph, hole, { face: offsetFace });
      }
    }
  });
  offsetGraph.isClosed = false;
  offsetGraph.isOutline = true;
  if (offsetGraph.points.length === 0) {
    offsetGraph.isEmpty = true;
  }
  return offsetGraph;
};

const smooth = (graph, options) => {
  const smoothedGraph = fromSurfaceMeshLazy(
    smoothSurfaceMesh(toSurfaceMesh(graph), options)
  );
  smoothedGraph.isWireframe = true;
  return smoothedGraph;
};

const toPaths = (graph) => {
  const paths = [];
  eachFace(realizeGraph(graph), (face) => {
    const path = [];
    eachFaceEdge(graph, face, (edge, { point }) => {
      path.push(getPointNode(graph, point));
    });
    paths.push(path);
    eachFaceHole(graph, face, (hole) => {
      const path = [];
      eachLoopEdge(graph, hole, (edge, { point }) => {
        path.push(getPointNode(graph, point));
      });
      paths.push(path);
    });
  });
  return paths;
};

const toSolid = (graph) => {
  const solid = [];
  eachFace(realizeGraph(graph), (face) => {
    const surface = [];
    try {
      pushConvexPolygons(surface, graph, face);
    } catch (e) {
      console.log(e.stack);
    }
    if (surface.length > 0) {
      solid.push(surface);
    }
  });
  return solid;
};

const transform = (matrix, graph) =>
  fromSurfaceMeshLazy(transformSurfaceMesh(toSurfaceMesh(graph), matrix));

const far$2 = 10000;

const union = (a, b) => {
  if (a.isEmpty || b.isEmpty) {
    return a;
  }
  if (!a.isClosed) {
    if (!b.isClosed) {
      b = extrude(b, far$2, 0);
    }
    return fromPaths(
      section(union(extrude(a, far$2, 0), b), [principlePlane(a)])[0]
    );
  }
  if (!b.isClosed) {
    // The union of a surface and a solid is the solid.
    // Otherwise we'd end up with a union with the far extrusion.
    return a;
  }
  // return fromNefPolyhedron(unionOfNefPolyhedrons(toNefPolyhedron(b), toNefPolyhedron(a)));
  return fromSurfaceMeshLazy(
    unionOfSurfaceMeshes(toSurfaceMesh(a), toSurfaceMesh(b))
  );
};

export { alphaShape, convexHull, difference, eachPoint, extrude, extrudeToPlane, fill, fromPaths, fromPoints, fromPolygons, fromSolid, fromSurface, inset, intersection, measureBoundingBox, offset, outline, realizeGraph, section, smooth, toPaths, toSolid, toSurface, toTriangles, transform, union };
