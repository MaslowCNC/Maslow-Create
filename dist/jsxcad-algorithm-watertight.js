import { eachEdge, fromPoints as fromPoints$1, toPlane } from './jsxcad-math-poly3.js';
import { length, subtract, equals, dot, add, multiply, fromScalar, squaredDistance } from './jsxcad-math-vec3.js';
import { fromPoints } from './jsxcad-math-line3.js';
import { fromPoints as fromPoints$2 } from './jsxcad-math-plane.js';

const ensureMapElement = (map, key, ensurer = (_) => []) => {
  if (!map.has(key)) {
    map.set(key, ensurer());
  }
  return map.get(key);
};

const toIdentity = JSON.stringify;

/**
 * findVertexViolations determines that the vertex's edges are closed.
 *
 * For a watertight vertex, it will consist of unique lines with an even count.
 *
 * @params {start} start - the vertex.
 * @params {Array<point>} ends - the sorted other end of each edge.
 * @returns {Array} violations.
 *
 * Note that checking for pairs of edges isn't sufficient.
 *
 *    A-----B
 *    |     |
 *    |     E--F
 *    |     |  |
 *    C-----D--G
 *
 * A situation with B~D, D~B, E~D, D~E would lead such an algorithm to believe
 * the vertex was watertight when it is only partially watertight.
 *
 * So, we need to detect any distinct colinear edges.
 */
const findVertexViolations = (start, ...ends) => {
  const lines = new Map();
  ends.forEach((end) => {
    // These are not actually lines, but they all start at the same position, so we can pretend.
    const ray = fromPoints(start, end);
    ensureMapElement(lines, toIdentity(ray)).push(end);
  });

  const distance = (end) => length(subtract(end, start));

  let violations = [];
  lines.forEach((ends) => {
    ends.sort((a, b) => distance(a) - distance(b));
    for (let nth = 1; nth < ends.length; nth++) {
      if (!equals(ends[nth], ends[nth - 1])) {
        violations.push(['unequal', [start, ...ends]]);
        violations.push(['unequal', [start, ...ends].reverse()]);
        break;
      }
    }
    if (ends.length % 2 !== 0) ;
  });

  // If no violations, it is Watertight.
  return violations;
};

const toIdentity$1 = JSON.stringify;

const findPolygonsViolations = (polygons) => {
  // A map from vertex value to connected edges represented as an array in
  // the form [start, ...end].
  const edges = new Map();
  const addEdge = (start, end) =>
    ensureMapElement(edges, toIdentity$1(start), () => [start]).push(end);
  const addEdges = (start, end) => {
    addEdge(start, end);
    addEdge(end, start);
  };
  polygons.forEach((polygon) => eachEdge({}, addEdges, polygon));

  // Edges are assembled, check for matches
  let violations = [];
  edges.forEach((vertex) => {
    violations = [].concat(violations, findVertexViolations(...vertex));
  });

  return violations;
};

const isWatertightPolygons = (polygons) =>
  findPolygonsViolations(polygons).length === 0;

const EPS = 1e-5;
const W = 3;

const tag = (vertex) => JSON.stringify([...vertex]);

function addSide(
  sidemap,
  vertextag2sidestart,
  vertextag2sideend,
  vertex0,
  vertex1,
  polygonindex
) {
  let starttag = tag(vertex0);
  let endtag = tag(vertex1);
  if (starttag === endtag) throw new Error('Assertion failed');
  let newsidetag = starttag + '/' + endtag;
  let reversesidetag = endtag + '/' + starttag;
  if (reversesidetag in sidemap) {
    // we have a matching reverse oriented side.
    // Instead of adding the new side, cancel out the reverse side:
    // console.log("addSide("+newsidetag+") has reverse side:");
    deleteSide(
      sidemap,
      vertextag2sidestart,
      vertextag2sideend,
      vertex1,
      vertex0,
      null
    );
    return null;
  }
  //  console.log("addSide("+newsidetag+")");
  let newsideobj = {
    vertex0: vertex0,
    vertex1: vertex1,
    polygonindex: polygonindex,
  };
  if (!(newsidetag in sidemap)) {
    sidemap[newsidetag] = [newsideobj];
  } else {
    sidemap[newsidetag].push(newsideobj);
  }
  if (starttag in vertextag2sidestart) {
    vertextag2sidestart[starttag].push(newsidetag);
  } else {
    vertextag2sidestart[starttag] = [newsidetag];
  }
  if (endtag in vertextag2sideend) {
    vertextag2sideend[endtag].push(newsidetag);
  } else {
    vertextag2sideend[endtag] = [newsidetag];
  }
  return newsidetag;
}

function deleteSide(
  sidemap,
  vertextag2sidestart,
  vertextag2sideend,
  vertex0,
  vertex1,
  polygonindex
) {
  let starttag = tag(vertex0);
  let endtag = tag(vertex1);
  let sidetag = starttag + '/' + endtag;
  // console.log("deleteSide("+sidetag+")");
  if (!(sidetag in sidemap)) throw new Error('Assertion failed');
  let idx = -1;
  let sideobjs = sidemap[sidetag];
  for (let i = 0; i < sideobjs.length; i++) {
    let sideobj = sideobjs[i];
    if (!equals(sideobj.vertex0, vertex0)) continue;
    if (!equals(sideobj.vertex1, vertex1)) continue;
    if (polygonindex !== null) {
      if (sideobj.polygonindex !== polygonindex) continue;
    }
    idx = i;
    break;
  }
  if (idx < 0) throw new Error('Assertion failed');
  sideobjs.splice(idx, 1);
  if (sideobjs.length === 0) {
    delete sidemap[sidetag];
  }
  idx = vertextag2sidestart[starttag].indexOf(sidetag);
  if (idx < 0) throw new Error('Assertion failed');
  vertextag2sidestart[starttag].splice(idx, 1);
  if (vertextag2sidestart[starttag].length === 0) {
    delete vertextag2sidestart[starttag];
  }

  idx = vertextag2sideend[endtag].indexOf(sidetag);
  if (idx < 0) throw new Error('Assertion failed');
  vertextag2sideend[endtag].splice(idx, 1);
  if (vertextag2sideend[endtag].length === 0) {
    delete vertextag2sideend[endtag];
  }
}

/*
     fixTJunctions:

     Suppose we have two polygons ACDB and EDGF:

      A-----B
      |     |
      |     E--F
      |     |  |
      C-----D--G

     Note that vertex E forms a T-junction on the side BD. In this case some STL slicers will complain
     that the solid is not watertight. This is because the watertightness check is done by checking if
     each side DE is matched by another side ED.

     This function will return a new solid with ACDB replaced by ACDEB

     Note that this can create polygons that are slightly non-convex (due to rounding errors). Therefore the result
     should not be used for further Geom3 operations!
*/
const fixTJunctions = function (polygons) {
  let sidemap = {};

  // STEP 1
  for (let polygonindex = 0; polygonindex < polygons.length; polygonindex++) {
    let polygon = polygons[polygonindex];
    let numvertices = polygon.length;
    // should be true
    if (numvertices >= 3) {
      let vertex = polygon[0];
      let vertextag = tag(vertex);
      for (let vertexindex = 0; vertexindex < numvertices; vertexindex++) {
        let nextvertexindex = vertexindex + 1;
        if (nextvertexindex === numvertices) nextvertexindex = 0;
        let nextvertex = polygon[nextvertexindex];
        let nextvertextag = tag(nextvertex);
        let sidetag = vertextag + '/' + nextvertextag;
        let reversesidetag = nextvertextag + '/' + vertextag;
        if (reversesidetag in sidemap) {
          // this side matches the same side in another polygon. Remove from sidemap:
          let ar = sidemap[reversesidetag];
          ar.splice(-1, 1);
          if (ar.length === 0) {
            delete sidemap[reversesidetag];
          }
        } else {
          let sideobj = {
            vertex0: vertex,
            vertex1: nextvertex,
            polygonindex: polygonindex,
          };
          if (!(sidetag in sidemap)) {
            sidemap[sidetag] = [sideobj];
          } else {
            sidemap[sidetag].push(sideobj);
          }
        }
        vertex = nextvertex;
        vertextag = nextvertextag;
      }
    }
  }
  // STEP 2
  // now sidemap contains 'unmatched' sides
  // i.e. side AB in one polygon does not have a matching side BA in another polygon
  let vertextag2sidestart = {};
  let vertextag2sideend = {};
  let sidestocheck = {};
  let sidemapisempty = true;
  for (let sidetag in sidemap) {
    sidemapisempty = false;
    sidestocheck[sidetag] = true;
    sidemap[sidetag].map(function (sideobj) {
      let starttag = tag(sideobj.vertex0);
      let endtag = tag(sideobj.vertex1);
      if (starttag in vertextag2sidestart) {
        vertextag2sidestart[starttag].push(sidetag);
      } else {
        vertextag2sidestart[starttag] = [sidetag];
      }
      if (endtag in vertextag2sideend) {
        vertextag2sideend[endtag].push(sidetag);
      } else {
        vertextag2sideend[endtag] = [sidetag];
      }
    });
  }

  // STEP 3 : if sidemap is not empty
  if (!sidemapisempty) {
    // make a copy of the polygons array, since we are going to modify it:
    polygons = polygons.slice(0);
    while (true) {
      let sidemapisempty = true;
      for (let sidetag in sidemap) {
        sidemapisempty = false;
        sidestocheck[sidetag] = true;
      }
      if (sidemapisempty) break;
      let donesomething = false;
      while (true) {
        let sidetagtocheck = null;
        for (let sidetag in sidestocheck) {
          sidetagtocheck = sidetag;
          break; // FIXME  : say what now ?
        }
        if (sidetagtocheck === null) break; // sidestocheck is empty, we're done!
        let donewithside = true;
        if (sidetagtocheck in sidemap) {
          let sideobjs = sidemap[sidetagtocheck];
          if (sideobjs.length === 0) throw new Error('Assertion failed');
          let sideobj = sideobjs[0];
          for (let directionindex = 0; directionindex < 2; directionindex++) {
            let startvertex =
              directionindex === 0 ? sideobj.vertex0 : sideobj.vertex1;
            let endvertex =
              directionindex === 0 ? sideobj.vertex1 : sideobj.vertex0;
            let startvertextag = tag(startvertex);
            let endvertextag = tag(endvertex);
            let matchingsides = [];
            if (directionindex === 0) {
              if (startvertextag in vertextag2sideend) {
                matchingsides = vertextag2sideend[startvertextag];
              }
            } else {
              if (startvertextag in vertextag2sidestart) {
                matchingsides = vertextag2sidestart[startvertextag];
              }
            }
            for (
              let matchingsideindex = 0;
              matchingsideindex < matchingsides.length;
              matchingsideindex++
            ) {
              let matchingsidetag = matchingsides[matchingsideindex];
              let matchingside = sidemap[matchingsidetag][0];
              let matchingsidestartvertex =
                directionindex === 0
                  ? matchingside.vertex0
                  : matchingside.vertex1;
              let matchingsideendvertex =
                directionindex === 0
                  ? matchingside.vertex1
                  : matchingside.vertex0;
              let matchingsidestartvertextag = tag(matchingsidestartvertex);
              let matchingsideendvertextag = tag(matchingsideendvertex);
              if (matchingsideendvertextag !== startvertextag) {
                throw new Error('Assertion failed');
              }
              if (matchingsidestartvertextag === endvertextag) {
                // matchingside cancels sidetagtocheck
                deleteSide(
                  sidemap,
                  vertextag2sidestart,
                  vertextag2sideend,
                  startvertex,
                  endvertex,
                  null
                );
                deleteSide(
                  sidemap,
                  vertextag2sidestart,
                  vertextag2sideend,
                  endvertex,
                  startvertex,
                  null
                );
                donewithside = false;
                directionindex = 2; // skip reverse direction check
                donesomething = true;
                break;
              } else {
                let startpos = startvertex;
                let endpos = endvertex;
                let checkpos = matchingsidestartvertex;
                // let direction = checkpos.minus(startpos)
                let direction = subtract(checkpos, startpos);
                // Now we need to check if endpos is on the line startpos-checkpos:
                // let t = endpos.minus(startpos).dot(direction) / direction.dot(direction)
                let t =
                  dot(subtract(endpos, startpos), direction) /
                  dot(direction, direction);
                if (t > 0 && t < 1) {
                  let closestpoint = add(
                    startpos,
                    multiply(direction, fromScalar(t))
                  );
                  let distancesquared = squaredDistance(closestpoint, endpos);
                  if (distancesquared < EPS * EPS) {
                    // Yes it's a t-junction! We need to split matchingside in two:
                    let polygonindex = matchingside.polygonindex;
                    let polygon = polygons[polygonindex];
                    // find the index of startvertextag in polygon:
                    let insertionvertextag = tag(matchingside.vertex1);
                    let insertionvertextagindex = -1;
                    for (let i = 0; i < polygon.length; i++) {
                      if (tag(polygon[i]) === insertionvertextag) {
                        insertionvertextagindex = i;
                        break;
                      }
                    }
                    if (insertionvertextagindex < 0) {
                      throw new Error('Assertion failed');
                    }
                    // split the side by inserting the vertex:
                    let newvertices = polygon.slice(0);
                    newvertices.splice(insertionvertextagindex, 0, endvertex);
                    let newpolygon = fromPoints$1(newvertices);

                    // calculate plane with differents point
                    if (isNaN(toPlane(newpolygon)[W])) {
                      let found = false;
                      let loop = function (callback) {
                        newpolygon.forEach(function (item) {
                          if (found) return;
                          callback(item);
                        });
                      };

                      loop(function (a) {
                        loop(function (b) {
                          loop(function (c) {
                            newpolygon.plane = fromPoints$2(a, b, c);
                            if (!isNaN(toPlane(newpolygon)[W])) {
                              found = true;
                            }
                          });
                        });
                      });
                    }
                    polygons[polygonindex] = newpolygon;
                    // remove the original sides from our maps
                    // deleteSide(sideobj.vertex0, sideobj.vertex1, null)
                    deleteSide(
                      sidemap,
                      vertextag2sidestart,
                      vertextag2sideend,
                      matchingside.vertex0,
                      matchingside.vertex1,
                      polygonindex
                    );
                    let newsidetag1 = addSide(
                      sidemap,
                      vertextag2sidestart,
                      vertextag2sideend,
                      matchingside.vertex0,
                      endvertex,
                      polygonindex
                    );
                    let newsidetag2 = addSide(
                      sidemap,
                      vertextag2sidestart,
                      vertextag2sideend,
                      endvertex,
                      matchingside.vertex1,
                      polygonindex
                    );
                    if (newsidetag1 !== null) sidestocheck[newsidetag1] = true;
                    if (newsidetag2 !== null) sidestocheck[newsidetag2] = true;
                    donewithside = false;
                    directionindex = 2; // skip reverse direction check
                    donesomething = true;
                    break;
                  } // if(distancesquared < 1e-10)
                } // if( (t > 0) && (t < 1) )
              } // if(endingstidestartvertextag === endvertextag)
            } // for matchingsideindex
          } // for directionindex
        } // if(sidetagtocheck in sidemap)
        if (donewithside) {
          delete sidestocheck[sidetagtocheck];
        }
      }
      if (!donesomething) break;
    }
  }

  return polygons;
};

const makeWatertight = (polygons) => fixTJunctions(polygons);

export { isWatertightPolygons, makeWatertight };
