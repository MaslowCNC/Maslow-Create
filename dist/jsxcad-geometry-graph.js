import { fromSurfaceMeshToGraph, fromPointsToAlphaShapeAsSurfaceMesh, fromSurfaceMeshToLazyGraph, fromPointsToConvexHullAsSurfaceMesh, fromGraphToSurfaceMesh, fromSurfaceMeshEmitBoundingBox, extrudeSurfaceMesh, arrangePaths, fromPolygonsToSurfaceMesh, sectionOfSurfaceMesh, differenceOfSurfaceMeshes, extrudeToPlaneOfSurfaceMesh, fromFunctionToSurfaceMesh, arrangePathsIntoTriangles, fromPointsToSurfaceMesh, insetOfPolygonWithHoles, intersectionOfSurfaceMeshes, offsetOfPolygonWithHoles, projectToPlaneOfSurfaceMesh, reverseFaceOrientationsOfSurfaceMesh, subdivideSurfaceMesh, remeshSurfaceMesh, doesSelfIntersectOfSurfaceMesh, transformSurfaceMesh, unionOfSurfaceMeshes } from './jsxcad-algorithm-cgal.js';
import { min, max, scale } from './jsxcad-math-vec3.js';
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

const extrude = (graph, height, depth) =>
  fromSurfaceMeshLazy(extrudeSurfaceMesh(toSurfaceMesh(graph), height, depth));

const realizeGraph = (graph) => {
  if (graph.isLazy) {
    return fromSurfaceMesh(graph[surfaceMeshSymbol]);
  } else {
    return graph;
  }
};

// FIX: Actually determine the principle plane.
const principlePlane = (graph) => {
  for (const face of realizeGraph(graph).faces) {
    if (face && face.plane) {
      return face.plane;
    }
  }
};

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

// import { create, fillFacetFromPoints } from './graph.js';
// import { rerealizeGraph } from './rerealizeGraph.js';

// const X = 0;
// const Y = 1;
// const Z = 2;
// const W = 3;

const fromTriangles = (triangles) => {
  return fromSurfaceMeshLazy(fromPolygonsToSurfaceMesh(triangles));
  /*
  const graph = create();
  let facet = 0;
  const ensureFace = (plane, exactPlane) => {
    for (let nth = 0; nth < graph.faces.length; nth++) {
      const face = graph.faces[nth];
      // FIX: Use exactPlane.
      if (
        face.plane[X] === plane[X] &&
        face.plane[Y] === plane[Y] &&
        face.plane[Z] === plane[Z] &&
        face.plane[W] === plane[W]
      ) {
        return nth;
      }
    }
    const faceId = graph.faces.length;
    graph.faces[faceId] = { plane, exactPlane };
  };
  for (const { points, exactPoints, plane, exactPlane } of triangles) {
    if (
      equals(points[0], points[1]) ||
      equals(points[1], points[2]) ||
      equals(points[2], points[0])
    ) {
      // throw Error(`Degenerate triangle: ${JSON.stringify(points)}`);
      console.log(`Degenerate triangle: ${JSON.stringify(points)}`);
      continue;
    }
    // FIX: No face association.
    graph.facets[facet] = {
      edge: fillFacetFromPoints(
        graph,
        facet,
        ensureFace(plane, exactPlane),
        points,
        exactPoints
      ),
    };
    facet += 1;
  }
  // We didn't build a stitched graph.
  const rerealized = rerealizeGraph(graph);
  rerealized.provenance = 'fromPolygonsWithHoles';
  return rerealized;
*/
};

const fromPolygonsWithHoles = (polygonsWithHoles) =>
  fromTriangles(fromPolygonsWithHolesToTriangles(polygonsWithHoles));

const section = (graph, plane) => {
  for (const polygons of sectionOfSurfaceMesh(toSurfaceMesh(graph), [plane])) {
    return fromPolygonsWithHoles(polygons);
  }
};

const sections = (graph, planes) => {
  const graphs = [];
  for (const polygons of sectionOfSurfaceMesh(toSurfaceMesh(graph), planes)) {
    graphs.push(fromPolygonsWithHoles(polygons));
  }
  return graphs;
};

const far = 10000;

const difference = (a, b) => {
  if (a.isEmpty || b.isEmpty) {
    return a;
  }
  if (!a.isClosed) {
    return section(difference(extrude(a, far, 0), b), principlePlane(a));
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

const far$1 = 10000;

const intersection = (a, b) => {
  if (a.isEmpty || b.isEmpty) {
    return fromEmpty();
  }
  if (!a.isClosed) {
    return section(intersection(extrude(a, far$1, 0), b), principlePlane(a));
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
    return section(union(extrude(a, far$2, 0), b), principlePlane(a));
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

export { alphaShape, convexHull, difference, eachPoint, extrude, extrudeToPlane, fill, fromEmpty, fromFunction, fromPaths, fromPoints, fromPolygons, inset, intersection, measureBoundingBox, offset, outline, projectToPlane, realizeGraph, rerealizeGraph, reverseFaceOrientations, section, sections, smooth, test, toPaths, toPolygonsWithHoles, toTriangles, transform, union };
