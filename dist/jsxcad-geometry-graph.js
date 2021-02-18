import { fromSurfaceMeshToGraph, fromPointsToAlphaShapeAsSurfaceMesh, fromSurfaceMeshToLazyGraph, fromPointsToConvexHullAsSurfaceMesh, fromPolygonsToSurfaceMesh, fromGraphToSurfaceMesh, fromSurfaceMeshEmitBoundingBox, extrudeSurfaceMesh, fitPlaneToPoints, arrangePaths, sectionOfSurfaceMesh, differenceOfSurfaceMeshes, extrudeToPlaneOfSurfaceMesh, fromSurfaceMeshToTriangles, fromFunctionToSurfaceMesh, fromPointsToSurfaceMesh, insetOfPolygon, intersectionOfSurfaceMeshes, offsetOfPolygon, projectToPlaneOfSurfaceMesh, subdivideSurfaceMesh, remeshSurfaceMesh, doesSelfIntersectOfSurfaceMesh, transformSurfaceMesh, unionOfSurfaceMeshes } from './jsxcad-algorithm-cgal.js';
import { equals, min, max, scale, dot } from './jsxcad-math-vec3.js';
import { deduplicate as deduplicate$1, isClockwise, flip } from './jsxcad-geometry-path.js';
import { canonicalize } from './jsxcad-geometry-paths.js';

const graphSymbol = Symbol('graph');
const surfaceMeshSymbol = Symbol('surfaceMeshSymbol');

const create = () => ({
  exactPoints: [],
  points: [],
  edges: [],
  faces: [],
  facets: [],
});

const addEdge = (
  graph,
  { point, next = -1, facet = -1, face = -1, twin = -1 }
) => {
  const edge = graph.edges.length;
  graph.edges.push({ point, facet, face, twin, next });
  return edge;
};

const fillFacetFromPoints = (graph, facet, face, points) => {
  let lastEdgeNode;
  let firstEdge;
  for (const coord of points) {
    const point = addPoint(graph, coord);
    const edge = addEdge(graph, { facet, face, point });
    if (lastEdgeNode) {
      lastEdgeNode.next = edge;
    } else {
      firstEdge = edge;
    }
    lastEdgeNode = getEdgeNode(graph, edge);
  }
  lastEdgeNode.next = firstEdge;
  return firstEdge;
};

const addPoint = (graph, point) => {
  for (let nth = 0; nth < graph.points.length; nth++) {
    if (equals(graph.points[nth], point)) {
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

const eachFacet = (graph, op) =>
  graph.facets.forEach((facetNode, facet) => op(facet, facetNode));

const eachEdgeLoop = (graph, start, op) => {
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

const realizeGraph = (graph) => {
  if (graph.isLazy) {
    return fromSurfaceMesh(graph[surfaceMeshSymbol]);
  } else {
    return graph;
  }
};

const toPolygons = (graph) => {
  // CHECK: This should already be triangulated.
  const surface = [];
  eachFacet(realizeGraph(graph), (facet, { edge }) => {
    const polygon = [];
    eachEdgeLoop(graph, edge, (edge, { point }) => {
      polygon.push(getPointNode(graph, point));
    });
    surface.push(polygon);
  });
  return surface;
};

const toSurface = (graph) => toPolygons(graph);

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
const X = 0;
const Y = 1;
const Z = 2;

// Requires a conservative gap.
const doesNotOverlap = (a, b) => {
  if (a.isEmpty || b.isEmpty) {
    return true;
  }
  const [minA, maxA] = measureBoundingBox(a);
  const [minB, maxB] = measureBoundingBox(b);
  if (maxA[X] <= minB[X] - iota * 10) {
    return true;
  }
  if (maxA[Y] <= minB[Y] - iota * 10) {
    return true;
  }
  if (maxA[Z] <= minB[Z] - iota * 10) {
    return true;
  }
  if (maxB[X] <= minA[X] - iota * 10) {
    return true;
  }
  if (maxB[Y] <= minA[Y] - iota * 10) {
    return true;
  }
  if (maxB[Z] <= minA[Z] - iota * 10) {
    return true;
  }
  return false;
};

const extrude = (graph, height, depth) => {
  realizeGraph(graph);
  if (graph.faces.length > 0) {
    // Arbitrarily pick the first face normal.
    // FIX: use exactPlane.
    const normal = graph.faces[0].plane;
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

const fromArrangements = (arrangements) => {
  const graph = create();
  let facet = 0;
  for (const { boundary, holes, plane } of arrangements) {
    // FIX: No face association.
    graph.facets[facet] = {
      edge: fillFacetFromPoints(graph, facet, facet, boundary),
    };
    graph.faces[facet] = { plane };
    facet += 1;
    for (const hole of holes) {
      // FIX: No relationship between hole and boundary.
      graph.facets[facet] = {
        edge: fillFacetFromPoints(graph, facet, facet, hole),
      };
      graph.faces[facet] = { plane };
      facet += 1;
    }
  }
  return graph;
};

const clean = (path) => deduplicate$1(path);

const orientClockwise = (path) => (isClockwise(path) ? path : flip(path));
const orientCounterClockwise = (path) =>
  isClockwise(path) ? flip(path) : path;

const Z$1 = 2;

// This imposes a planar arrangement.
const fromPaths = (inputPaths) => {
  const paths = canonicalize(inputPaths);
  const points = [];
  for (const path of paths) {
    for (const point of path) {
      if (point !== null) {
        points.push(point);
      }
    }
  }
  const orientedArrangements = [];
  let plane = fitPlaneToPoints(points);
  if (plane) {
    // Orient planes up by default.
    // FIX: Remove this hack.
    if (dot(plane, [0, 0, 1, 0]) < -0.1) {
      plane[Z$1] *= -1;
    }
    const arrangement = arrangePaths(...plane, paths);
    for (const { boundary, holes } of arrangement) {
      const exterior = orientCounterClockwise(boundary);
      const cleaned = clean(exterior);
      if (cleaned.length < 3) {
        continue;
      }
      const orientedArrangement = { boundary: cleaned, holes: [], plane };
      // const face = addFace(graph, { plane });
      // addLoopFromPoints(graph, cleaned, { face });
      for (const hole of holes) {
        const interior = orientClockwise(hole);
        const cleaned = clean(interior);
        if (cleaned.length < 3) {
          continue;
        }
        orientedArrangement.holes.push(cleaned);
        // addHoleFromPoints(graph, cleaned, { face });
      }
      orientedArrangements.push(orientedArrangement);
    }
  }
  const graph = fromArrangements(orientedArrangements);
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

const extrudeToPlane = (graph, highPlane, lowPlane, direction) => {
  if (realizeGraph(graph).faces.length > 0) {
    // Arbitrarily pick the plane of the first graph to extrude along.
    if (direction === undefined) {
      for (const face of graph.faces) {
        if (face && face.plane) {
          direction = face.plane;
          break;
        }
      }
    }
    return fromSurfaceMeshLazy(
      extrudeToPlaneOfSurfaceMesh(
        toSurfaceMesh(graph),
        ...scale(1, direction),
        ...highPlane,
        ...scale(-1, direction),
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

const fromFunction = (op, options) =>
  fromSurfaceMeshLazy(
    fromFunctionToSurfaceMesh((x = 0, y = 0, z = 0) => op([x, y, z]), options)
  );

const fromEmpty = () => ({ isEmpty: true });

const fromPoints = (points) =>
  fromSurfaceMeshLazy(fromPointsToSurfaceMesh(points));

const fromSolid = (solid) => {
  const polygons = [];
  for (const surface of solid) {
    polygons.push(...surface);
  }
  return fromPolygons(polygons);
};

const outline = (graph) => {
  graph = realizeGraph(graph);

  const faceEdges = new Map();

  const getFaceEdges = (face) => {
    let edges = faceEdges.get(face);
    if (edges === undefined) {
      edges = [];
      faceEdges.set(face, edges);
    }
    return edges;
  };

  // Collect edges per face.
  for (const edge of graph.edges) {
    if (!edge || edge.face === -1) {
      continue;
    }
    const twin = graph.edges[edge.twin];
    if (twin && twin.face === edge.face) {
      // This is an edge within a face.
      continue;
    }
    getFaceEdges(edge.face).push(edge);
  }

  const arrangements = [];

  // Arrange the edges per face.
  for (const [face, edges] of faceEdges) {
    const paths = [];
    // FIX: Use exact plane.
    const plane = graph.faces[face].plane;
    for (const { point, next } of edges) {
      paths.push([
        null,
        graph.points[point],
        graph.points[graph.edges[next].point],
      ]);
    }
    arrangements.push(...arrangePaths(...plane, paths));
  }

  return arrangements;
};

const inset = (graph, initial, step, limit) => {
  const offsetArrangements = [];
  for (const arrangement of outline(graph)) {
    for (const offsetArrangement of insetOfPolygon(
      initial,
      step,
      limit,
      arrangement.plane,
      arrangement.boundary,
      arrangement.holes
    )) {
      offsetArrangements.push(offsetArrangement);
    }
  }
  const offsetGraph = fromArrangements(offsetArrangements);
  offsetGraph.isClosed = false;
  offsetGraph.isOutline = true;
  if (offsetGraph.points.length === 0) {
    offsetGraph.isEmpty = true;
  }
  return offsetGraph;
};

const far$1 = 10000;

const intersection = (a, b) => {
  if (a.isEmpty || b.isEmpty) {
    return fromEmpty();
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
    return fromEmpty();
  }
  return fromSurfaceMeshLazy(
    intersectionOfSurfaceMeshes(toSurfaceMesh(a), toSurfaceMesh(b))
  );
};

const offset = (graph, initial, step, limit) => {
  const offsetArrangements = [];
  for (const arrangement of outline(graph)) {
    for (const offsetArrangement of offsetOfPolygon(
      initial,
      step,
      limit,
      arrangement.plane,
      arrangement.boundary,
      arrangement.holes
    )) {
      offsetArrangements.push(offsetArrangement);
    }
  }
  const offsetGraph = fromArrangements(offsetArrangements);
  offsetGraph.isClosed = false;
  offsetGraph.isOutline = true;
  if (offsetGraph.points.length === 0) {
    offsetGraph.isEmpty = true;
  }
  return offsetGraph;
};

const projectToPlane = (graph, plane, direction) => {
  if (realizeGraph(graph).faces.length > 0) {
    // Arbitrarily pick the plane of the first graph to project along.
    if (direction === undefined) {
      for (const face of graph.faces) {
        if (face && face.plane) {
          direction = face.plane;
          break;
        }
      }
    }
    return fromSurfaceMeshLazy(
      projectToPlaneOfSurfaceMesh(
        toSurfaceMesh(graph),
        ...scale(1, direction),
        ...plane
      )
    );
  } else {
    return graph;
  }
};

const smooth = (graph, options = {}) => {
  const { method = 'Remesh' } = options;
  switch (method) {
    case 'Remesh':
      return fromSurfaceMeshLazy(
        remeshSurfaceMesh(toSurfaceMesh(graph), options)
      );
    default:
      return fromSurfaceMeshLazy(
        subdivideSurfaceMesh(toSurfaceMesh(graph), options)
      );
  }
};

const test = (graph) => {
  if (doesSelfIntersectOfSurfaceMesh(toSurfaceMesh(graph))) {
    throw Error('Self-intersection detected');
  }
  return graph;
};

const toPaths = (graph) => {
  const paths = [];
  for (const { boundary, holes } of outline(graph)) {
    paths.push(boundary, ...holes);
  }
  return paths;
};

// FIX: Replace with toPolygons.
const toSolid = (graph) => [toSurface(graph)];

const transform = (matrix, graph) =>
  fromSurfaceMeshLazy(transformSurfaceMesh(toSurfaceMesh(graph), matrix));

const far$2 = 10000;

const union = (a, b) => {
  if (a.isEmpty) {
    return b;
  }
  if (b.isEmpty) {
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
  return fromSurfaceMeshLazy(
    unionOfSurfaceMeshes(toSurfaceMesh(a), toSurfaceMesh(b))
  );
};

export { alphaShape, convexHull, difference, eachPoint, extrude, extrudeToPlane, fill, fromEmpty, fromFunction, fromPaths, fromPoints, fromPolygons, fromSolid, fromSurface, inset, intersection, measureBoundingBox, offset, outline, projectToPlane, realizeGraph, section, smooth, test, toPaths, toSolid, toSurface, toTriangles, transform, union };
