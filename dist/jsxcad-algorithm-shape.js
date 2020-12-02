import { fromPoints } from './jsxcad-math-poly3.js';
import { scale, add, unit } from './jsxcad-math-vec3.js';
import { cachePoints, cache as cache$1 } from './jsxcad-cache.js';
import { fromAngleRadians } from './jsxcad-math-vec2.js';
import { scale as scale$1, translate, flip, assertGood, deduplicate, rotateX, isClosed } from './jsxcad-geometry-path.js';
import { fromPolygons } from './jsxcad-geometry-solid.js';

const sin = (a) => Math.sin((a / 360) * Math.PI * 2);

const regularPolygonEdgeLengthToRadius = (length, edges) =>
  length / (2 * sin(180 / edges));

function clone(point) { //TODO: use gl-vec2 for this
    return [point[0], point[1]]
}

function vec2(x, y) {
    return [x, y]
}

var _function = function createBezierBuilder(opt) {
    opt = opt||{};

    var RECURSION_LIMIT = typeof opt.recursion === 'number' ? opt.recursion : 8;
    var FLT_EPSILON = typeof opt.epsilon === 'number' ? opt.epsilon : 1.19209290e-7;
    var PATH_DISTANCE_EPSILON = typeof opt.pathEpsilon === 'number' ? opt.pathEpsilon : 1.0;

    var curve_angle_tolerance_epsilon = typeof opt.angleEpsilon === 'number' ? opt.angleEpsilon : 0.01;
    var m_angle_tolerance = opt.angleTolerance || 0;
    var m_cusp_limit = opt.cuspLimit || 0;

    return function bezierCurve(start, c1, c2, end, scale, points) {
        if (!points)
            points = [];

        scale = typeof scale === 'number' ? scale : 1.0;
        var distanceTolerance = PATH_DISTANCE_EPSILON / scale;
        distanceTolerance *= distanceTolerance;
        begin(start, c1, c2, end, points, distanceTolerance);
        return points
    }


    ////// Based on:
    ////// https://github.com/pelson/antigrain/blob/master/agg-2.4/src/agg_curves.cpp

    function begin(start, c1, c2, end, points, distanceTolerance) {
        points.push(clone(start));
        var x1 = start[0],
            y1 = start[1],
            x2 = c1[0],
            y2 = c1[1],
            x3 = c2[0],
            y3 = c2[1],
            x4 = end[0],
            y4 = end[1];
        recursive(x1, y1, x2, y2, x3, y3, x4, y4, points, distanceTolerance, 0);
        points.push(clone(end));
    }

    function recursive(x1, y1, x2, y2, x3, y3, x4, y4, points, distanceTolerance, level) {
        if(level > RECURSION_LIMIT) 
            return

        var pi = Math.PI;

        // Calculate all the mid-points of the line segments
        //----------------------
        var x12   = (x1 + x2) / 2;
        var y12   = (y1 + y2) / 2;
        var x23   = (x2 + x3) / 2;
        var y23   = (y2 + y3) / 2;
        var x34   = (x3 + x4) / 2;
        var y34   = (y3 + y4) / 2;
        var x123  = (x12 + x23) / 2;
        var y123  = (y12 + y23) / 2;
        var x234  = (x23 + x34) / 2;
        var y234  = (y23 + y34) / 2;
        var x1234 = (x123 + x234) / 2;
        var y1234 = (y123 + y234) / 2;

        if(level > 0) { // Enforce subdivision first time
            // Try to approximate the full cubic curve by a single straight line
            //------------------
            var dx = x4-x1;
            var dy = y4-y1;

            var d2 = Math.abs((x2 - x4) * dy - (y2 - y4) * dx);
            var d3 = Math.abs((x3 - x4) * dy - (y3 - y4) * dx);

            var da1, da2;

            if(d2 > FLT_EPSILON && d3 > FLT_EPSILON) {
                // Regular care
                //-----------------
                if((d2 + d3)*(d2 + d3) <= distanceTolerance * (dx*dx + dy*dy)) {
                    // If the curvature doesn't exceed the distanceTolerance value
                    // we tend to finish subdivisions.
                    //----------------------
                    if(m_angle_tolerance < curve_angle_tolerance_epsilon) {
                        points.push(vec2(x1234, y1234));
                        return
                    }

                    // Angle & Cusp Condition
                    //----------------------
                    var a23 = Math.atan2(y3 - y2, x3 - x2);
                    da1 = Math.abs(a23 - Math.atan2(y2 - y1, x2 - x1));
                    da2 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - a23);
                    if(da1 >= pi) da1 = 2*pi - da1;
                    if(da2 >= pi) da2 = 2*pi - da2;

                    if(da1 + da2 < m_angle_tolerance) {
                        // Finally we can stop the recursion
                        //----------------------
                        points.push(vec2(x1234, y1234));
                        return
                    }

                    if(m_cusp_limit !== 0.0) {
                        if(da1 > m_cusp_limit) {
                            points.push(vec2(x2, y2));
                            return
                        }

                        if(da2 > m_cusp_limit) {
                            points.push(vec2(x3, y3));
                            return
                        }
                    }
                }
            }
            else {
                if(d2 > FLT_EPSILON) {
                    // p1,p3,p4 are collinear, p2 is considerable
                    //----------------------
                    if(d2 * d2 <= distanceTolerance * (dx*dx + dy*dy)) {
                        if(m_angle_tolerance < curve_angle_tolerance_epsilon) {
                            points.push(vec2(x1234, y1234));
                            return
                        }

                        // Angle Condition
                        //----------------------
                        da1 = Math.abs(Math.atan2(y3 - y2, x3 - x2) - Math.atan2(y2 - y1, x2 - x1));
                        if(da1 >= pi) da1 = 2*pi - da1;

                        if(da1 < m_angle_tolerance) {
                            points.push(vec2(x2, y2));
                            points.push(vec2(x3, y3));
                            return
                        }

                        if(m_cusp_limit !== 0.0) {
                            if(da1 > m_cusp_limit) {
                                points.push(vec2(x2, y2));
                                return
                            }
                        }
                    }
                }
                else if(d3 > FLT_EPSILON) {
                    // p1,p2,p4 are collinear, p3 is considerable
                    //----------------------
                    if(d3 * d3 <= distanceTolerance * (dx*dx + dy*dy)) {
                        if(m_angle_tolerance < curve_angle_tolerance_epsilon) {
                            points.push(vec2(x1234, y1234));
                            return
                        }

                        // Angle Condition
                        //----------------------
                        da1 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - Math.atan2(y3 - y2, x3 - x2));
                        if(da1 >= pi) da1 = 2*pi - da1;

                        if(da1 < m_angle_tolerance) {
                            points.push(vec2(x2, y2));
                            points.push(vec2(x3, y3));
                            return
                        }

                        if(m_cusp_limit !== 0.0) {
                            if(da1 > m_cusp_limit)
                            {
                                points.push(vec2(x3, y3));
                                return
                            }
                        }
                    }
                }
                else {
                    // Collinear case
                    //-----------------
                    dx = x1234 - (x1 + x4) / 2;
                    dy = y1234 - (y1 + y4) / 2;
                    if(dx*dx + dy*dy <= distanceTolerance) {
                        points.push(vec2(x1234, y1234));
                        return
                    }
                }
            }
        }

        // Continue subdivision
        //----------------------
        recursive(x1, y1, x12, y12, x123, y123, x1234, y1234, points, distanceTolerance, level + 1); 
        recursive(x1234, y1234, x234, y234, x34, y34, x4, y4, points, distanceTolerance, level + 1); 
    }
};

var adaptiveBezierCurve = _function();
var adaptiveBezierCurve_1 = adaptiveBezierCurve.bezier;

const buildAdaptiveCubicBezierCurve = (
  { scale = 2 },
  [start, c1, c2, end]
) => adaptiveBezierCurve(start, c1, c2, end, scale);

/** @type {function(Point[], Path[]):Triangle[]} */
const fromPointsAndPaths = (points = [], paths = []) => {
  /** @type {Polygon[]} */
  const polygons = [];
  for (const path of paths) {
    polygons.push(fromPoints(path.map((nth) => points[nth])));
  }
  return polygons;
};

// Unit icosahedron vertices.
/** @type {Point[]} */
const points = [
  [0.850651, 0.0, -0.525731],
  [0.850651, -0.0, 0.525731],
  [-0.850651, -0.0, 0.525731],
  [-0.850651, 0.0, -0.525731],
  [0.0, -0.525731, 0.850651],
  [0.0, 0.525731, 0.850651],
  [0.0, 0.525731, -0.850651],
  [0.0, -0.525731, -0.850651],
  [-0.525731, -0.850651, -0.0],
  [0.525731, -0.850651, -0.0],
  [0.525731, 0.850651, 0.0],
  [-0.525731, 0.850651, 0.0],
];

// Triangular decomposition structure.
/** @type {Path[]} */
const paths = [
  [1, 9, 0],
  [0, 10, 1],
  [0, 7, 6],
  [0, 6, 10],
  [0, 9, 7],
  [4, 1, 5],
  [9, 1, 4],
  [1, 10, 5],
  [3, 8, 2],
  [2, 11, 3],
  [4, 5, 2],
  [2, 8, 4],
  [5, 11, 2],
  [6, 7, 3],
  [3, 11, 6],
  [3, 7, 8],
  [4, 8, 9],
  [5, 10, 11],
  [6, 11, 10],
  [7, 9, 8],
];

// FIX: Why aren't we computing the convex hull?

/**
 * Computes the polygons of a unit icosahedron.
 * @type {function():Triangle[]}
 */
const buildRegularIcosahedron = () => {
  return fromPointsAndPaths(points, paths);
};

//      0
//     /\
//  10/__\20
//   /\  /\
// 1/__\/__\2
//     21

/** @typedef {vec3[]} Triangle */

/** @type {function(triangle:Triangle):Polygon[]} */
const subdivideTriangle = (triangle) => {
  /** @type {vec3} */
  const t0 = triangle[0];
  /** @type {vec3} */
  const t1 = triangle[1];
  /** @type {vec3} */
  const t2 = triangle[2];

  const t10 = scale(1 / 2, add(t1, t0));
  const t20 = scale(1 / 2, add(t2, t0));
  const t21 = scale(1 / 2, add(t2, t1));

  // Turning CCW.
  /** @type {Polygon[]} */
  return [
    [t0, t10, t20],
    [t10, t1, t21],
    [t20, t21, t2],
    [t10, t21, t20],
  ];
};

/** @type {function(mesh:Triangle[]):Triangle[]} */
const subdivideTriangularMesh = (mesh) => {
  /** @type {Triangle[]} */
  const subdividedMesh = [];
  for (const triangle of mesh) {
    for (const subTriangle of subdivideTriangle(triangle)) {
      subdividedMesh.push(subTriangle);
    }
  }
  return subdividedMesh;
};

/**
 *
 * Builds a sphere with at least the number of faces requested, and less than
 *   four times the number of faces requested.
 * @type {function(faces:number):Triangle[]}
 */
const buildGeodesicSphere = (faces = 20) => {
  /** @type {Triangle[]} */
  let mesh = buildRegularIcosahedron();
  while (mesh.length < faces) {
    mesh = subdivideTriangularMesh(mesh);
  }
  return mesh.map((triangle) => triangle.map(unit));
};

const buildPolygonFromPointsImpl = (points) => ({
  type: 'surface',
  surface: [points.map(([x = 0, y = 0, z = 0]) => [x, y, z])],
});

const buildPolygonFromPoints = cachePoints(buildPolygonFromPointsImpl);

/**
 * Construct a regular unit polygon of a given edge count.
 * Note: radius and length must not conflict.
 *
 * @param {Object} [options] - options for construction
 * @param {Integer} [options.sides=32] - how many sides the polygon has.
 * @returns {PointArray} Array of points along the path of the circle in CCW winding.
 *
 * @example
 * const circlePoints = regularPolygon(32)
 *
 * @example
 * const squarePoints = regularPolygon(4)
 * })
 */
const buildRegularPolygonImpl = (sides = 32) => {
  let points = [];
  for (let i = 0; i < sides; i++) {
    let radians = (2 * Math.PI * i) / sides;
    let [x, y] = fromAngleRadians(radians);
    points.push([x, y, 0]);
  }
  return points;
};

const buildRegularPolygon = cache$1(buildRegularPolygonImpl);

const buildWalls = (polygons, floor, roof) => {
  for (
    let start = floor.length - 1, end = 0;
    end < floor.length;
    start = end++
  ) {
    // Remember that we are walking CCW.
    polygons.push(
      deduplicate([floor[start], floor[end], roof[end], roof[start]])
    );
  }
};

// Approximates a UV sphere.
const buildRingSphereImpl = (resolution = 20) => {
  /** @type {Polygon[]} */
  const polygons = [];
  let lastPath;

  const latitudinalResolution = 2 + resolution;
  const longitudinalResolution = 2 * latitudinalResolution;

  // Trace out latitudinal rings.
  const ring = buildRegularPolygon(longitudinalResolution);
  let path;
  const getEffectiveSlice = (slice) => {
    if (slice === 0) {
      return 0.5;
    } else if (slice === latitudinalResolution) {
      return latitudinalResolution - 0.5;
    } else {
      return slice;
    }
  };
  for (let slice = 0; slice <= latitudinalResolution; slice++) {
    const angle =
      (Math.PI * 1.0 * getEffectiveSlice(slice)) / latitudinalResolution;
    const height = Math.cos(angle);
    const radius = Math.sin(angle);
    const points = ring;
    const scaledPath = scale$1([radius, radius, radius], points);
    const translatedPath = translate([0, 0, height], scaledPath);
    path = translatedPath;
    if (lastPath !== undefined) {
      buildWalls(polygons, path, lastPath);
    } else {
      polygons.push(path);
    }
    lastPath = path;
  }
  if (path) {
    polygons.push(flip(path));
  }
  for (const polygon of polygons) {
    assertGood(polygon);
  }
  return fromPolygons(polygons);
};

const buildRingSphere = cache$1(buildRingSphereImpl);

var cache = {
    '1': bezier1
  , '2': bezier2
  , '3': bezier3
  , '4': bezier4
};

var bezier = neat;
var prepare_1 = prepare;

function neat(arr, t) {
  return prepare(arr.length)(arr, t)
}

function prepare(pieces) {
  pieces = +pieces|0;
  if (!pieces) throw new Error('Cannot create a interpolator with no elements')
  if (cache[pieces]) return cache[pieces]

  var fn = ['var ut = 1 - t', ''];

  var n = pieces;
  while (n--) {
    for (var j = 0; j < n; j += 1) {
      if (n+1 === pieces) {
        fn.push('var p'+j+' = arr['+j+'] * ut + arr['+(j+1)+'] * t');
      } else
      if (n > 1) {
        fn.push('p'+j+' = p'+j+' * ut + p'+(j+1)+' * t');
      } else {
        fn.push('return p'+j+' * ut + p'+(j+1)+' * t');
      }
    }
    if (n > 1) fn.push('');
  }

  fn = [
    'return function bezier'+pieces+'(arr, t) {'
    , fn.map(function(s) { return '  ' + s }).join('\n')
    , '}'
  ].join('\n');

  return Function(fn)()
}

//
// Including the first four degrees
// manually - there's a slight performance penalty
// to generated code. It's outweighed by
// the gains of the optimisations, but always
// helps to cover the most common cases :)
//

function bezier1(arr) {
  return arr[0]
}

function bezier2(arr, t) {
  return arr[0] + (arr[1] - arr[0]) * t
}

function bezier3(arr, t) {
  var ut = 1 - t;
  return (arr[0] * ut + arr[1] * t) * ut + (arr[1] * ut + arr[2] * t) * t
}

function bezier4(arr, t) {
  var ut = 1 - t;
  var a1 = arr[1] * ut + arr[2] * t;
  return ((arr[0] * ut + arr[1] * t) * ut + a1 * t) * ut + (a1 * ut + (arr[2] * ut + arr[3] * t) * t) * t
}
bezier.prepare = prepare_1;

const interpolateCubicBezier = bezier.prepare(4);

// Approximate a cubic bezier by dividing the curve into a uniform number of segments.

const buildUniformCubicBezierCurve = ({ segments = 8 }, points) => {
  const xPoints = points.map((point) => point[0]);
  const yPoints = points.map((point) => point[1]);
  const path = [];
  for (let t = 0; t <= 1; t += 1 / segments) {
    path.push([
      interpolateCubicBezier(xPoints, t),
      interpolateCubicBezier(yPoints, t),
    ]);
  }
  return path;
};

const buildWalls$1 = (polygons, floor, roof) => {
  for (
    let start = floor.length - 1, end = 0;
    end < floor.length;
    start = end++
  ) {
    if (floor[start] === null || floor[end] === null) {
      continue;
    }
    // Remember that we are walking CCW.
    polygons.push([roof[start], roof[end], floor[start]]);
    polygons.push([roof[end], floor[end], floor[start]]);
  }
};

// Rotate a path around the X axis to produce the polygons of a solid.
const loopImpl = (
  path,
  endRadians = Math.PI * 2,
  resolution = 16,
  pitch = 0
) => {
  const stepRadians = (Math.PI * 2) / resolution;
  const pitchPerRadian = pitch / (Math.PI * 2);
  let lastPath;
  /** @type {Polygon[]} */
  const polygons = [];
  if (endRadians !== Math.PI * 2 || pitch !== 0) {
    // Cap the loop.
    polygons.push(
      flip(path),
      translate([pitchPerRadian * endRadians, 0, 0], rotateX(endRadians, path))
    );
  }
  for (let radians = 0; radians < endRadians; radians += stepRadians) {
    const rotatedPath = translate(
      [pitchPerRadian * radians, 0, 0],
      rotateX(radians, path)
    );
    if (lastPath !== undefined) {
      buildWalls$1(polygons, rotatedPath, lastPath);
    }
    lastPath = rotatedPath;
  }
  if (lastPath !== undefined) {
    buildWalls$1(
      polygons,
      translate([pitchPerRadian * endRadians, 0, 0], rotateX(endRadians, path)),
      lastPath
    );
  }
  return { type: 'solid', solid: fromPolygons(polygons) };
};

const loop = cache$1(loopImpl);

function getSqDist(p1, p2) {
    var dx = p1[0] - p2[0],
        dy = p1[1] - p2[1];

    return dx * dx + dy * dy;
}

// basic distance-based simplification
var radialDistance = function simplifyRadialDist(points, tolerance) {
    if (points.length<=1)
        return points;
    tolerance = typeof tolerance === 'number' ? tolerance : 1;
    var sqTolerance = tolerance * tolerance;
    
    var prevPoint = points[0],
        newPoints = [prevPoint],
        point;

    for (var i = 1, len = points.length; i < len; i++) {
        point = points[i];

        if (getSqDist(point, prevPoint) > sqTolerance) {
            newPoints.push(point);
            prevPoint = point;
        }
    }

    if (prevPoint !== point) newPoints.push(point);

    return newPoints;
};

// square distance from a point to a segment
function getSqSegDist(p, p1, p2) {
    var x = p1[0],
        y = p1[1],
        dx = p2[0] - x,
        dy = p2[1] - y;

    if (dx !== 0 || dy !== 0) {

        var t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);

        if (t > 1) {
            x = p2[0];
            y = p2[1];

        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = p[0] - x;
    dy = p[1] - y;

    return dx * dx + dy * dy;
}

function simplifyDPStep(points, first, last, sqTolerance, simplified) {
    var maxSqDist = sqTolerance,
        index;

    for (var i = first + 1; i < last; i++) {
        var sqDist = getSqSegDist(points[i], points[first], points[last]);

        if (sqDist > maxSqDist) {
            index = i;
            maxSqDist = sqDist;
        }
    }

    if (maxSqDist > sqTolerance) {
        if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
        simplified.push(points[index]);
        if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
    }
}

// simplification using Ramer-Douglas-Peucker algorithm
var douglasPeucker = function simplifyDouglasPeucker(points, tolerance) {
    if (points.length<=1)
        return points;
    tolerance = typeof tolerance === 'number' ? tolerance : 1;
    var sqTolerance = tolerance * tolerance;
    
    var last = points.length - 1;

    var simplified = [points[0]];
    simplifyDPStep(points, 0, last, sqTolerance, simplified);
    simplified.push(points[last]);

    return simplified;
};

//simplifies using both algorithms
var simplifyPath = function simplify(points, tolerance) {
    points = radialDistance(points, tolerance);
    points = douglasPeucker(points, tolerance);
    return points;
};

var radialDistance$1 = radialDistance;
var douglasPeucker$1 = douglasPeucker;
simplifyPath.radialDistance = radialDistance$1;
simplifyPath.douglasPeucker = douglasPeucker$1;

const simplifyPath$1 = (path, tolerance = 0.01) => {
  if (isClosed(path)) {
    return simplifyPath(path, tolerance);
  } else {
    return [null, ...simplifyPath(path.slice(1), tolerance)];
  }
};

const toRadiusFromApothem = (apothem, sides) =>
  apothem / Math.cos(Math.PI / sides);
const toRadiusFromEdge = (edge, sides) =>
  edge * regularPolygonEdgeLengthToRadius(1, sides);

export { buildAdaptiveCubicBezierCurve, buildGeodesicSphere, buildPolygonFromPoints, buildRegularIcosahedron, buildRegularPolygon, buildRingSphere, buildUniformCubicBezierCurve, loop, regularPolygonEdgeLengthToRadius, simplifyPath$1 as simplifyPath, subdivideTriangle, subdivideTriangularMesh, toRadiusFromApothem, toRadiusFromEdge };
