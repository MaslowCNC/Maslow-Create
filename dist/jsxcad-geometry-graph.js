import { fromSurfaceMeshToGraph, fromPointsToAlphaShapeAsSurfaceMesh, fromSurfaceMeshToLazyGraph, fromPointsToConvexHullAsSurfaceMesh, fromGraphToSurfaceMesh, differenceOfSurfaceMeshes, extrudeSurfaceMesh, extrudeToPlaneOfSurfaceMesh, fromFunctionToSurfaceMesh, arrangePathsIntoTriangles, fromPolygonsToSurfaceMesh, fromPointsToSurfaceMesh, arrangePaths, insetOfPolygonWithHoles, intersectionOfSurfaceMeshes, fromSurfaceMeshEmitBoundingBox, offsetOfPolygonWithHoles, projectToPlaneOfSurfaceMesh, reverseFaceOrientationsOfSurfaceMesh, sectionOfSurfaceMesh, subdivideSurfaceMesh, remeshSurfaceMesh, doesSelfIntersectOfSurfaceMesh, transformSurfaceMesh, unionOfSurfaceMeshes } from './jsxcad-algorithm-cgal.js';
import { scale, min, max } from './jsxcad-math-vec3.js';
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
  if (surfaceMesh === undefined) {
    surfaceMesh = fromGraphToSurfaceMesh(graph);
    graph[surfaceMeshSymbol] = surfaceMesh;
    surfaceMesh[graphSymbol] = graph;
  }
  return surfaceMesh;
};

const difference = (a, b) => {
  if (a.isEmpty || b.isEmpty) {
    return a;
  }
  return fromSurfaceMeshLazy(
    differenceOfSurfaceMeshes(toSurfaceMesh(a), toSurfaceMesh(b))
  );
};

const realizeGraph = (graph) => {
  if (graph.isLazy) {
    return fromSurfaceMesh(graph[surfaceMeshSymbol]);
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

const fromPolygonsWithHoles = (polygonsWithHoles) =>
  fromTriangles(fromPolygonsWithHolesToTriangles(polygonsWithHoles));

const toPolygonsWithHoles = (graph) => {
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
      ...arrangePaths(plane, exactPlane, paths, /* triangulate= */ false)
    );
  }

  return polygonWithHoles;
};

const outline = (graph) => toPolygonsWithHoles(graph);

const inset = (graph, initial, step, limit) => {
  const insetGraphs = [];
  for (const polygonWithHoles of outline(graph)) {
    for (const insetPolygon of insetOfPolygonWithHoles(
      initial,
      step,
      limit,
      polygonWithHoles
    )) {
      insetGraphs.push(fromPolygonsWithHoles([insetPolygon]));
    }
  }
  return insetGraphs;
};

const intersection = (a, b) => {
  if (a.isEmpty || b.isEmpty) {
    return fromEmpty();
  }
  return fromSurfaceMeshLazy(
    intersectionOfSurfaceMeshes(toSurfaceMesh(a), toSurfaceMesh(b))
  );
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

const offset = (graph, initial, step, limit) => {
  const offsetGraphs = [];
  for (const polygonWithHoles of outline(graph)) {
    for (const offsetPolygon of offsetOfPolygonWithHoles(
      initial,
      step,
      limit,
      polygonWithHoles
    )) {
      offsetGraphs.push(fromPolygonsWithHoles([offsetPolygon]));
    }
  }
  return offsetGraphs;
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

const rerealizeGraph = (graph) =>
  fromSurfaceMeshLazy(toSurfaceMesh(graph), /* forceNewGraph= */ true);

const reverseFaceOrientations = (graph) =>
  fromSurfaceMeshLazy(
    reverseFaceOrientationsOfSurfaceMesh(toSurfaceMesh(graph))
  );

const section = (graph, plane) => {
  for (const planarMesh of sectionOfSurfaceMesh(toSurfaceMesh(graph), [
    plane,
  ])) {
    return fromSurfaceMeshLazy(planarMesh);
  }
};

const sections = (graph, planes) => {
  console.log(`QQ/section/planes: ${JSON.stringify(planes)}`);
  const graphs = [];
  for (const planarMesh of sectionOfSurfaceMesh(toSurfaceMesh(graph), planes)) {
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

const toTriangles = (graph) => {
  const triangles = [];
  // The realized graph should already be triangulated.
  graph = realizeGraph(graph);
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
};

const transform = (matrix, graph) =>
  fromSurfaceMeshLazy(transformSurfaceMesh(toSurfaceMesh(graph), matrix));

const union = (a, b) => {
  if (a.isEmpty) {
    return b;
  }
  if (b.isEmpty) {
    return a;
  }
  return fromSurfaceMeshLazy(
    unionOfSurfaceMeshes(toSurfaceMesh(a), toSurfaceMesh(b))
  );
};

export { alphaShape, convexHull, difference, eachPoint, extrude, extrudeToPlane, fill, fromEmpty, fromFunction, fromPaths, fromPoints, fromPolygons, inset, intersection, measureBoundingBox, offset, outline, projectToPlane, realizeGraph, rerealizeGraph, reverseFaceOrientations, section, sections, smooth, test, toPaths, toPolygonsWithHoles, toTriangles, transform, union };
