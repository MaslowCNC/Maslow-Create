import { fromSurfaceMeshToGraph, fromPointsToAlphaShapeAsSurfaceMesh, fromSurfaceMeshToLazyGraph, fromPointsToConvexHullAsSurfaceMesh, deserializeSurfaceMesh, fromGraphToSurfaceMesh, fromSurfaceMeshEmitBoundingBox, differenceOfSurfaceMeshes, extrudeSurfaceMesh, extrudeToPlaneOfSurfaceMesh, fromFunctionToSurfaceMesh, arrangePathsIntoTriangles, fromPolygonsToSurfaceMesh, fromPointsToSurfaceMesh, arrangePaths, growSurfaceMesh, fromSurfaceMeshToPolygonsWithHoles, insetOfPolygonWithHoles, intersectionOfSurfaceMeshes, minkowskiDifferenceOfSurfaceMeshes, minkowskiShellOfSurfaceMeshes, minkowskiSumOfSurfaceMeshes, offsetOfPolygonWithHoles, outlineSurfaceMesh, serializeSurfaceMesh, projectToPlaneOfSurfaceMesh, pushSurfaceMesh, remeshSurfaceMesh, reverseFaceOrientationsOfSurfaceMesh, sectionOfSurfaceMesh, subdivideSurfaceMesh, doesSelfIntersectOfSurfaceMesh, fromSurfaceMeshToTriangles, transformSurfaceMesh, twistSurfaceMesh, unionOfSurfaceMeshes } from './jsxcad-algorithm-cgal.js';
export { arrangePolygonsWithHoles } from './jsxcad-algorithm-cgal.js';
import { min, max, scale } from './jsxcad-math-vec3.js';
import { info } from './jsxcad-sys.js';
import { isClockwise, flip, deduplicate } from './jsxcad-geometry-path.js';

const graphSymbol = Symbol('graph');
const surfaceMeshSymbol = Symbol('surfaceMeshSymbol');

const eachEdge = (graph, op) =>
  graph.edges.forEach((node, nth) => {
    if (node && node.isRemoved !== true) {
      op(nth, node);
    }
  });

const getEdgeNode = (graph, edge) => graph.edges[edge];
const getLoopNode = (graph, loop) => graph.loops[loop];

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
    throw Error('No surface mesh provided');
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

const fromSurfaceMeshLazy = (surfaceMesh, forceNewGraph = false) => {
  let graph = surfaceMesh[graphSymbol];
  if (forceNewGraph || graph === undefined) {
    graph = fromSurfaceMeshToLazyGraph(surfaceMesh);
    surfaceMesh[graphSymbol] = graph;
    graph[surfaceMeshSymbol] = surfaceMesh;
  }
  return graph;
};

const convexHull = (points) =>
  fromSurfaceMeshLazy(fromPointsToConvexHullAsSurfaceMesh(points));

const toSurfaceMesh = (graph) => {
  let surfaceMesh = graph[surfaceMeshSymbol];
  if (surfaceMesh !== undefined) {
    return surfaceMesh;
  }
  if (graph.serializedSurfaceMesh) {
    surfaceMesh = deserializeSurfaceMesh(graph.serializedSurfaceMesh);
  } else {
    surfaceMesh = fromGraphToSurfaceMesh(graph);
  }
  graph[surfaceMeshSymbol] = surfaceMesh;
  surfaceMesh[graphSymbol] = graph;
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

const difference = (a, b) => {
  if (a.isEmpty || b.isEmpty) {
    return a;
  }
  if (a.isClosed && b.isClosed && doesNotOverlap(a, b)) {
    return a;
  }
  info('difference begin');
  const result = fromSurfaceMeshLazy(
    differenceOfSurfaceMeshes(toSurfaceMesh(a), toSurfaceMesh(b))
  );
  info('difference end');
  return result;
};

const realizeGraph = (graph) => {
  if (graph.isLazy) {
    return fromSurfaceMesh(toSurfaceMesh(graph));
  } else {
    return graph;
  }
};

const eachPoint = (graph, op) => {
  for (const point of realizeGraph(graph).points) {
    if (point !== undefined) {
      op(point);
    }
  }
};

const extrude = (graph, height, depth) =>
  fromSurfaceMeshLazy(extrudeSurfaceMesh(toSurfaceMesh(graph), height, depth));

const extrudeToPlane = (graph, highPlane, lowPlane, direction) => {
  graph = realizeGraph(graph);
  if (graph.faces.length > 0) {
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

// import { fromPolygons } from './fromPolygons.js';
// import { toTriangles } from './toTriangles.js';

// Convert an outline graph to a possibly closed surface.
// export const fill = (graph) => fromPolygons(toTriangles(graph));

const fill = (graph) => ({ ...graph, isOutline: false });

const fromFunction = (op, options) =>
  fromSurfaceMeshLazy(
    fromFunctionToSurfaceMesh((x = 0, y = 0, z = 0) => op([x, y, z]), options)
  );

const fromEmpty = () => ({ isEmpty: true });

const clean = (path) => deduplicate(path);

const orientCounterClockwise = (path) =>
  isClockwise(path) ? flip(path) : path;

// This imposes a planar arrangement.
const fromPaths = (paths, plane = [0, 0, 1, 0]) => {
  if (plane[0] === 0 && plane[1] === 0 && plane[2] === 0 && plane[3] === 0) {
    throw Error(`Zero plane`);
  }
  const orientedPolygons = [];
  for (const { points } of arrangePathsIntoTriangles(plane, undefined, paths)) {
    const exterior = orientCounterClockwise(points);
    const cleaned = clean(exterior);
    if (cleaned.length < 3) {
      continue;
    }
    const orientedPolygon = { points: cleaned, plane };
    orientedPolygons.push(orientedPolygon);
  }
  return fromSurfaceMeshLazy(fromPolygonsToSurfaceMesh(orientedPolygons));
};

const fromPoints = (points) =>
  fromSurfaceMeshLazy(fromPointsToSurfaceMesh(points));

const fromPolygons = (polygons) =>
  fromSurfaceMeshLazy(fromPolygonsToSurfaceMesh(polygons));

const fromPolygonsWithHolesToTriangles = (polygonsWithHoles) => {
  const triangles = [];
  for (const polygonWithHoles of polygonsWithHoles) {
    const paths = [polygonWithHoles, ...polygonWithHoles.holes];
    triangles.push(
      ...arrangePaths(
        polygonWithHoles.plane,
        polygonWithHoles.exactPlane,
        paths,
        /* triangulate= */ true
      )
    );
  }
  return triangles;
};

const fromTriangles = (triangles) =>
  fromSurfaceMeshLazy(fromPolygonsToSurfaceMesh(triangles));

const grow = (graph, amount) => {
  return fromSurfaceMeshLazy(growSurfaceMesh(toSurfaceMesh(graph), amount));
};

const fromPolygonsWithHoles = (polygonsWithHoles) =>
  fromTriangles(fromPolygonsWithHolesToTriangles(polygonsWithHoles));

const toPolygonsWithHoles = (graph) => {
  const mesh = toSurfaceMesh(graph);
  const polygonsWithHoles = fromSurfaceMeshToPolygonsWithHoles(mesh);
  return polygonsWithHoles;
};

/*
export const toPolygonsWithHoles = (graph) => {
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

  const polygonWithHoles = [];

  // Arrange the edges per face.
  for (const [face, edges] of faceEdges) {
    if (face === -1) {
      // We can't arrange edges that aren't in a face.
      // FIX: Sometimes we'll want edges that aren't in faces or facets.
      continue;
    }
    const paths = [];
    // FIX: Use exact plane.
    const { plane, exactPlane } = graph.faces[face];
    for (const { point, next } of edges) {
      paths.push({
        points: [
          null,
          graph.points[point],
          graph.points[graph.edges[next].point],
        ],
        exactPoints: [
          null,
          graph.exactPoints[point],
          graph.exactPoints[graph.edges[next].point],
        ],
      });
    }
    polygonWithHoles.push(
      ...arrangePaths(plane, exactPlane, paths, // triangulate= // false)
    );
  }

  return polygonWithHoles;
};
*/

const inset = (graph, initial, step, limit) => {
  info('inset begin');
  const insetGraphs = [];
  for (const { polygonsWithHoles } of toPolygonsWithHoles(graph)) {
    for (const polygonWithHoles of polygonsWithHoles) {
      for (const insetPolygon of insetOfPolygonWithHoles(
        initial,
        step,
        limit,
        polygonWithHoles
      )) {
        insetGraphs.push(fromPolygonsWithHoles([insetPolygon]));
      }
    }
  }
  info('inset end');
  return insetGraphs;
};

const intersection = (a, b) => {
  if (a.isEmpty || b.isEmpty) {
    return fromEmpty();
  }
  if (a.isClosed && b.isClosed && doesNotOverlap(a, b)) {
    return fromEmpty();
  }
  info('intersection begin');
  const result = fromSurfaceMeshLazy(
    intersectionOfSurfaceMeshes(toSurfaceMesh(a), toSurfaceMesh(b))
  );
  info('intersection end');
  return result;
};

const minkowskiDifference = (a, b) => {
  if (a.isEmpty || b.isEmpty) {
    return a;
  }
  return fromSurfaceMeshLazy(
    minkowskiDifferenceOfSurfaceMeshes(toSurfaceMesh(a), toSurfaceMesh(b))
  );
};

const minkowskiShell = (a, b) => {
  if (a.isEmpty || b.isEmpty) {
    return a;
  }
  return fromSurfaceMeshLazy(
    minkowskiShellOfSurfaceMeshes(toSurfaceMesh(a), toSurfaceMesh(b))
  );
};

const minkowskiSum = (a, b) => {
  if (a.isEmpty || b.isEmpty) {
    return a;
  }
  return fromSurfaceMeshLazy(
    minkowskiSumOfSurfaceMeshes(toSurfaceMesh(a), toSurfaceMesh(b))
  );
};

const offset = (graph, initial, step, limit) => {
  info('offset begin');
  const offsetGraphs = [];
  for (const { polygonsWithHoles } of toPolygonsWithHoles(graph)) {
    for (const polygonWithHoles of polygonsWithHoles) {
      for (const offsetPolygon of offsetOfPolygonWithHoles(
        initial,
        step,
        limit,
        polygonWithHoles
      )) {
        offsetGraphs.push(fromPolygonsWithHoles([offsetPolygon]));
      }
    }
  }
  info('offset end');
  return offsetGraphs;
};

const outline = (graph) => {
  info('outline begin');
  const result = outlineSurfaceMesh(toSurfaceMesh(graph));
  info('outline end');
  return result;
};

const prepareForSerialization = (graph) => {
  if (!graph.serializedSurfaceMesh) {
    measureBoundingBox(graph);
    graph.serializedSurfaceMesh = serializeSurfaceMesh(toSurfaceMesh(graph));
  }
  return graph;
};

const projectToPlane = (graph, plane, direction) => {
  graph = realizeGraph(graph);
  if (graph.faces.length > 0) {
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

const push = (graph, force, minimumDistance, maximumDistance) =>
  fromSurfaceMeshLazy(
    pushSurfaceMesh(
      toSurfaceMesh(graph),
      force,
      minimumDistance,
      maximumDistance
    )
  );

const remesh = (graph, options = {}) =>
  fromSurfaceMeshLazy(remeshSurfaceMesh(toSurfaceMesh(graph), options));

const rerealizeGraph = (graph) =>
  fromSurfaceMeshLazy(toSurfaceMesh(graph), /* forceNewGraph= */ true);

const reverseFaceOrientations = (graph) =>
  fromSurfaceMeshLazy(
    reverseFaceOrientationsOfSurfaceMesh(toSurfaceMesh(graph))
  );

const section = (graph, plane) => {
  for (const planarMesh of sectionOfSurfaceMesh(toSurfaceMesh(graph), [
    plane,
    /* profile= */ false,
  ])) {
    return fromSurfaceMeshLazy(planarMesh);
  }
};

const sections = (graph, planes, { profile = false } = {}) => {
  const graphs = [];
  for (const planarMesh of sectionOfSurfaceMesh(
    toSurfaceMesh(graph),
    planes,
    /* profile= */ profile
  )) {
    graphs.push(fromSurfaceMeshLazy(planarMesh));
  }
  return graphs;
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
  for (const { points, holes } of toPolygonsWithHoles(graph)) {
    paths.push(points);
    for (const { points } of holes) {
      paths.push(points);
    }
  }
  return paths;
};

Error.stackTraceLimit = Infinity;

const toTriangles = (graph) => {
  if (graph.isLazy) {
    return fromSurfaceMeshToTriangles(toSurfaceMesh(graph));
  } else {
    const triangles = [];
    // A realized graph should already be triangulated.
    for (let { edge } of graph.facets) {
      const triangle = [];
      const start = edge;
      do {
        triangle.push(graph.points[graph.edges[edge].point]);
        edge = graph.edges[edge].next;
      } while (start !== edge);
      triangles.push(triangle);
    }
    return triangles;
  }
};

const transform = (matrix, graph) =>
  fromSurfaceMeshLazy(transformSurfaceMesh(toSurfaceMesh(graph), matrix));

const twist = (graph, degreesPerZ) =>
  fromSurfaceMeshLazy(twistSurfaceMesh(toSurfaceMesh(graph), degreesPerZ));

const union = (a, b) => {
  if (a.isEmpty) {
    return b;
  }
  if (b.isEmpty) {
    return a;
  }
  // FIX: In an ideal world, if a and b do not overlap, we would generate a disjointAssembly of the two.
  info('union begin');
  const result = fromSurfaceMeshLazy(
    unionOfSurfaceMeshes(toSurfaceMesh(a), toSurfaceMesh(b))
  );
  info('union end');
  return result;
};

export { alphaShape, convexHull, difference, eachPoint, extrude, extrudeToPlane, fill, fromEmpty, fromFunction, fromPaths, fromPoints, fromPolygons, fromPolygonsWithHolesToTriangles, fromTriangles, grow, inset, intersection, measureBoundingBox, minkowskiDifference, minkowskiShell, minkowskiSum, offset, outline, prepareForSerialization, projectToPlane, push, realizeGraph, remesh, rerealizeGraph, reverseFaceOrientations, section, sections, smooth, test, toPaths, toPolygonsWithHoles, toTriangles, transform, twist, union };
