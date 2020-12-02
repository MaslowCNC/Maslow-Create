import { identityMatrix, multiply, fromXRotation, fromYRotation, fromZRotation, fromTranslation, fromScaling } from './jsxcad-math-mat4.js';
import { cacheTransform, cache, cacheRewriteTags, cacheSection } from './jsxcad-cache.js';
import { reconcile as reconcile$1, makeWatertight as makeWatertight$1, isWatertight as isWatertight$1, findOpenEdges as findOpenEdges$1, transform as transform$3, canonicalize as canonicalize$1, eachPoint as eachPoint$3, flip as flip$1, fromSurface as fromSurface$2, measureBoundingBox as measureBoundingBox$3 } from './jsxcad-geometry-solid.js';
import { close, createOpenPath } from './jsxcad-geometry-path.js';
import { createNormalize3 } from './jsxcad-algorithm-quantize.js';
import { transform as transform$5, canonicalize as canonicalize$5, eachPoint as eachPoint$4, close as close$1, flip as flip$3, union as union$2 } from './jsxcad-geometry-paths.js';
import { canonicalize as canonicalize$4, toPolygon } from './jsxcad-math-plane.js';
import { transform as transform$4, canonicalize as canonicalize$3, eachPoint as eachPoint$5, flip as flip$4, measureBoundingBox as measureBoundingBox$1, union as union$1 } from './jsxcad-geometry-points.js';
import { transform as transform$1, canonicalize as canonicalize$2, eachPoint as eachPoint$2, flip as flip$2, makeWatertight as makeWatertight$2, measureArea as measureArea$1, measureBoundingBox as measureBoundingBox$2, toPlane } from './jsxcad-geometry-surface.js';
import { transform as transform$2, toSurface, fromSurface, toSolid, fromSolid, difference as difference$1, eachPoint as eachPoint$1, fill as fill$1, fromPaths, extrude as extrude$1, extrudeToPlane as extrudeToPlane$1, intersection as intersection$2, toPaths, inset as inset$1, measureBoundingBox as measureBoundingBox$4, outline as outline$1, realizeGraph, section as section$1, smooth as smooth$1, union as union$4 } from './jsxcad-geometry-graph.js';
import { transform as transform$6 } from './jsxcad-geometry-plan.js';
import { fromSolid as fromSolid$1, unifyBspTrees, fromSurface as fromSurface$1, removeExteriorPaths, intersectSurface, intersection as intersection$1, union as union$3 } from './jsxcad-geometry-bsp.js';
import { min, max } from './jsxcad-math-vec3.js';
import { outlineSolid, outlineSurface } from './jsxcad-geometry-halfedge.js';
import { read as read$1, write as write$1 } from './jsxcad-sys.js';

const transformImpl = (matrix, untransformed) => {
  if (untransformed.length) throw Error('die');
  if (matrix.some((value) => typeof value !== 'number' || isNaN(value))) {
    throw Error('die');
  }
  return {
    type: 'transform',
    matrix,
    content: [untransformed],
    tags: untransformed.tags,
  };
};

const transform = cacheTransform(transformImpl);

const update = (geometry, updates, changes) => {
  if (updates === undefined) {
    return geometry;
  }
  if (geometry === updates) {
    return geometry;
  }
  const updated = {};
  for (const key of Object.keys(geometry)) {
    if (typeof key !== 'symbol') {
      updated[key] = geometry[key];
    }
  }
  let changed = false;
  for (const key of Object.keys(updates)) {
    if (updates[key] !== updated[key]) {
      updated[key] = updates[key];
      changed = true;
    }
  }
  if (changes !== undefined) {
    for (const key of Object.keys(changes)) {
      if (changes[key] !== updated[key]) {
        updated[key] = changes[key];
        changed = true;
      }
    }
  }
  if (changed) {
    return updated;
  } else {
    return geometry;
  }
};

const validateContent = (geometry, content) => {
  if (content && content.some((value) => !value)) {
    for (const v of content) {
      console.log(`QQ/content: ${v}`);
    }
    throw Error(
      `Invalid content: ${JSON.stringify(geometry, (k, v) =>
        !v ? `<# ${v} #>` : v
      )} ${JSON.stringify(content, (k, v) => (!v ? `<# ${v} #>` : v))}`
    );
  }
  return content;
};

const rewrite = (geometry, op, state) => {
  const walk = (geometry, state) => {
    if (geometry.content) {
      return op(
        geometry,
        (changes, state) =>
          update(
            geometry,
            {
              content: validateContent(
                geometry,
                geometry.content?.map?.((entry) => walk(entry, state))
              ),
            },
            changes
          ),
        walk,
        state
      );
    } else {
      return op(geometry, (changes) => update(geometry, changes), walk, state);
    }
  };
  return walk(geometry, state);
};

const visit = (geometry, op, state) => {
  const walk = (geometry, state) => {
    if (geometry.content) {
      if (geometry.content.some((x) => x === undefined)) {
        throw Error(`Bad geometry: ${JSON.stringify(geometry)}`);
      }
      return op(geometry, (_) => geometry.content?.forEach(walk), state);
    } else {
      return op(geometry, (_) => undefined, state);
    }
  };
  return walk(geometry, state);
};

const reconcile = (geometry, normalize = createNormalize3()) =>
  rewrite(geometry, (geometry, descend) => {
    if (geometry.type === 'solid') {
      return {
        type: 'solid',
        solid: reconcile$1(geometry.solid, normalize),
        tags: geometry.tags,
      };
    } else {
      return descend();
    }
  });

const makeWatertight = (
  geometry,
  normalize = createNormalize3(),
  onFixed
) =>
  rewrite(geometry, (geometry, descend) => {
    if (geometry.type === 'solid') {
      return {
        type: 'solid',
        solid: makeWatertight$1(geometry.solid, normalize, onFixed),
        tags: geometry.tags,
      };
    } else {
      return descend();
    }
  });

const isWatertight = (geometry) => {
  let watertight = true;
  visit(geometry, (geometry, descend) => {
    if (geometry.type === 'solid' && !isWatertight$1(geometry.solid)) {
      watertight = false;
    }
    return descend();
  });
  return watertight;
};

const findOpenEdges = (geometry) => {
  const openEdges = [];
  visit(geometry, (geometry, descend) => {
    if (geometry.type === 'solid') {
      openEdges.push(...findOpenEdges$1(geometry.solid).map(close));
    }
    return descend();
  });
  return { type: 'paths', paths: openEdges };
};

const isNotVoid = ({ tags }) => {
  return tags === undefined || tags.includes('compose/non-positive') === false;
};

const isVoid = (geometry) => !isNotVoid(geometry);

const allTags = (geometry) => {
  const collectedTags = new Set();
  const op = ({ tags }, descend) => {
    if (tags !== undefined) {
      for (const tag of tags) {
        collectedTags.add(tag);
      }
    }
    descend();
  };
  visit(geometry, op);
  return collectedTags;
};

const taggedAssembly = ({ tags }, ...content) => {
  if (content.some((value) => !value)) {
    throw Error(`Undefined Assembly content`);
  }
  if (content.some((value) => value.length)) {
    throw Error(`Assembly content is an array`);
  }
  if (content.some((value) => value.geometry)) {
    throw Error(`Likely Shape instance in Assembly content`);
  }
  if (tags !== undefined && tags.length === undefined) {
    throw Error(`Bad tags`);
  }
  if (typeof tags === 'function') {
    throw Error(`Tags is a function`);
  }
  return { type: 'assembly', tags, content };
};

const assembleImpl = (...taggedGeometries) =>
  taggedAssembly({}, ...taggedGeometries);

const assemble = cache(assembleImpl);

const taggedSurface = ({ tags }, surface) => {
  return { type: 'surface', tags, surface };
};

const transformedGeometry = Symbol('transformedGeometry');

const toTransformedGeometry = (geometry) => {
  if (geometry[transformedGeometry] === undefined) {
    const op = (geometry, descend, walk, matrix) => {
      switch (geometry.type) {
        case 'transform':
          // Preserve any tags applied to the untransformed geometry.
          // FIX: Ensure tags are merged between transformed and untransformed upon resolution.
          return walk(geometry.content[0], multiply(matrix, geometry.matrix));
        case 'assembly':
        case 'layout':
        case 'layers':
        case 'item':
        case 'sketch':
          return descend(undefined, matrix);
        case 'disjointAssembly':
          if (matrix === identityMatrix) {
            // A disjointAssembly does not contain any untransformed geometry.
            // There is no transform, so we can stop here.
            return geometry;
          } else {
            return descend(undefined, matrix);
          }
        case 'plan':
          return transform$6(matrix, geometry.plan);
        case 'paths':
          return descend({ paths: transform$5(matrix, geometry.paths) });
        case 'points':
          return descend({ points: transform$4(matrix, geometry.points) });
        case 'solid':
          return descend({ solid: transform$3(matrix, geometry.solid) });
        case 'graph':
          return descend({ graph: transform$2(matrix, geometry.graph) });
        case 'surface':
        case 'z0Surface': {
          const surface = geometry.z0Surface || geometry.surface;
          if (surface.length === 0) {
            // Empty geometries don't need transforming, but we'll return a
            // fresh one to avoid any caching.
            return taggedSurface({}, []);
          }
          return taggedSurface(
            { tags: geometry.tags },
            transform$1(matrix, surface)
          );
        }
        default:
          throw Error(
            `Unexpected geometry ${geometry.type} see ${JSON.stringify(
              geometry
            )}`
          );
      }
    };
    geometry[transformedGeometry] = rewrite(geometry, op, identityMatrix);
  }
  return geometry[transformedGeometry];
};

const canonicalize = (geometry) => {
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'points':
        return descend({ points: canonicalize$3(geometry.points) });
      case 'paths':
        return descend({ paths: canonicalize$5(geometry.paths) });
      case 'plan':
        return descend({
          marks: canonicalize$3(geometry.marks),
          planes: geometry.planes.map(canonicalize$4),
        });
      case 'graph':
        return descend({
          graph: {
            ...geometry.graph,
            points: canonicalize$3(geometry.graph.points),
          },
        });
      case 'surface':
        return descend({ surface: canonicalize$2(geometry.surface) });
      case 'z0Surface':
        return descend({ z0Surface: canonicalize$2(geometry.z0Surface) });
      case 'solid':
        return descend({ solid: canonicalize$1(geometry.solid) });
      case 'item':
      case 'assembly':
      case 'disjointAssembly':
      case 'layers':
      case 'layout':
      case 'sketch':
        return descend();
      default:
        throw Error(`Unexpected geometry type ${geometry.type}`);
    }
  };
  return rewrite(toTransformedGeometry(geometry), op);
};

const eachItem = (geometry, op) => {
  const walk = (geometry, descend) => {
    switch (geometry.type) {
      case 'sketch': {
        // Sketches aren't real.
        return;
      }
      default: {
        op(geometry);
        return descend();
      }
    }
  };
  visit(geometry, walk);
};

const getGraphs = (geometry) => {
  const graphs = [];
  eachItem(geometry, (item) => {
    if (item.type === 'graph') {
      graphs.push(item);
    }
  });
  return graphs;
};

const getSolids = (geometry) => {
  const solids = [];
  eachItem(geometry, (item) => {
    if (item.type === 'solid') {
      solids.push(item);
    }
  });
  return solids;
};

const getSurfaces = (geometry) => {
  const surfaces = [];
  eachItem(geometry, (item) => {
    if (item.type === 'surface') {
      surfaces.push(item);
    }
  });
  return surfaces;
};

const taggedGraph = ({ tags }, graph) => ({
  type: 'graph',
  tags,
  graph,
});

const taggedSolid = ({ tags }, solid) => {
  return { type: 'solid', tags, solid };
};

const differenceImpl = (geometry, ...geometries) => {
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph': {
        let differenced = geometry.graph;
        for (const geometry of geometries) {
          for (const { graph } of getGraphs(geometry)) {
            differenced = difference$1(differenced, graph);
          }
          for (const { solid } of getSolids(geometry)) {
            differenced = difference$1(differenced, fromSolid(solid));
          }
          for (const { surface } of getSurfaces(geometry)) {
            differenced = difference$1(
              differenced,
              fromSurface(surface)
            );
          }
        }
        return taggedGraph({ tags }, differenced);
      }
      case 'solid':
        return taggedSolid(
          { tags },
          toSolid(
            difference(
              taggedGraph({ tags }, fromSolid(geometry.solid)),
              ...geometries
            ).graph
          )
        );
      case 'surface':
        return taggedSurface(
          { tags },
          toSurface(
            difference(
              taggedGraph({ tags }, fromSurface(geometry.surface)),
              ...geometries
            ).graph
          )
        );
      case 'paths':
      case 'points': {
        // Not implemented yet.
        return geometry;
      }
      case 'layout':
      case 'plan':
      case 'assembly':
      case 'item':
      case 'disjointAssembly':
      case 'layers': {
        return descend();
      }
      case 'sketch': {
        // Sketches aren't real for intersection.
        return geometry;
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(geometry, op);
};

/*
const differenceImpl = (geometry, ...geometries) => {
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'solid': {
        const todo = [];
        for (const geometry of geometries) {
          for (const { solid } of getSolids(geometry)) {
            todo.push(solid);
          }
        }
        return taggedSolid({ tags }, solidDifference(geometry.solid, ...todo));
      }
      case 'surface': {
        // FIX: Solids should cut surfaces
        const todo = [];
        for (const geometry of geometries) {
          for (const { surface } of getSurfaces(geometry)) {
            todo.push(surface);
          }
          for (const { z0Surface } of getZ0Surfaces(geometry)) {
            todo.push(z0Surface);
          }
        }
        return taggedSurface(
          { tags },
          surfaceDifference(geometry.surface, ...todo)
        );
      }
      case 'z0Surface': {
        // FIX: Solids should cut surfaces
        const todoSurfaces = [];
        const todoZ0Surfaces = [];
        for (const geometry of geometries) {
          for (const { surface } of getSurfaces(geometry)) {
            todoSurfaces.push(surface);
          }
          for (const { z0Surface } of getZ0Surfaces(geometry)) {
            todoZ0Surfaces.push(z0Surface);
          }
        }
        if (todoSurfaces.length > 0) {
          return taggedSurface(
            { tags },
            surfaceDifference(
              geometry.z0Surface,
              ...todoSurfaces,
              ...todoZ0Surfaces
            )
          );
        } else {
          return taggedZ0Surface(
            { tags },
            z0SurfaceDifference(geometry.z0Surface, ...todoZ0Surfaces)
          );
        }
      }
      case 'paths': {
        const todo = [];
        for (const geometry of geometries) {
          for (const { paths } of getPaths(geometry)) {
            todo.push(paths);
          }
        }
        return taggedPaths({ tags }, pathsDifference(geometry.paths, ...todo));
      }
      case 'assembly':
      case 'disjointAssembly':
      case 'layers':
      case 'plan':
      case 'item':
      case 'layout':
      case 'points': {
        return descend();
      }
      case 'sketch': {
        // Sketches aren't real for difference.
        return geometry;
      }
      default: {
        throw Error(`Unknown geometry type ${JSON.stringify(geometry)}`);
      }
    }
  };

  return rewrite(geometry, op);
};
*/

const difference = cache(differenceImpl);

const hasMatchingTag = (set, tags, whenSetUndefined = false) => {
  if (set === undefined) {
    return whenSetUndefined;
  } else if (tags !== undefined && tags.some((tag) => set.includes(tag))) {
    return true;
  } else {
    return false;
  }
};

const buildCondition = (conditionTags, conditionSpec) => {
  switch (conditionSpec) {
    case 'has':
      return (geometryTags) => hasMatchingTag(geometryTags, conditionTags);
    case 'has not':
      return (geometryTags) => !hasMatchingTag(geometryTags, conditionTags);
    default:
      return undefined;
  }
};

const rewriteTagsImpl = (
  add,
  remove,
  geometry,
  conditionTags,
  conditionSpec
) => {
  const condition = buildCondition(conditionTags, conditionSpec);
  const composeTags = (geometryTags) => {
    if (condition === undefined || condition(geometryTags)) {
      if (geometryTags === undefined) {
        return add.filter((tag) => !remove.includes(tag));
      } else {
        return [...add, ...geometryTags].filter((tag) => !remove.includes(tag));
      }
    } else {
      return geometryTags;
    }
  };
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'assembly':
      case 'disjointAssembly':
      case 'layers':
        return descend();
      default:
        const composedTags = composeTags(geometry.tags);
        if (composedTags === undefined) {
          const copy = { ...geometry };
          delete copy.tags;
          return copy;
        }
        if (composedTags === geometry.tags) {
          return geometry;
        } else {
          return descend({ tags: composedTags });
        }
    }
  };
  return rewrite(geometry, op);
};

const rewriteTags = cacheRewriteTags(rewriteTagsImpl);

// Dropped elements displace as usual, but are not included in positive output.

const drop = (tags, geometry) =>
  rewriteTags(['compose/non-positive'], [], geometry, tags, 'has');

const eachPoint = (emit, geometry) => {
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'assembly':
      case 'disjointAssembly':
      case 'layers':
      case 'item':
      case 'layout':
        return descend();
      case 'points':
        return eachPoint$5(emit, geometry.points);
      case 'paths':
        return eachPoint$4(emit, geometry.paths);
      case 'solid':
        return eachPoint$3(emit, geometry.solid);
      case 'surface':
        return eachPoint$2(emit, geometry.surface);
      case 'z0Surface':
        return eachPoint$2(emit, geometry.z0Surface);
      case 'graph':
        return eachPoint$1(geometry.graph, emit);
      default:
        throw Error(
          `Unexpected geometry ${geometry.type} ${JSON.stringify(geometry)}`
        );
    }
  };
  visit(geometry, op);
};

const eachNonVoidItem = (geometry, op) => {
  const walk = (geometry, descend) => {
    // FIX: Sketches aren't real either -- but this is a bit unclear.
    if (geometry.type !== 'sketch' && isNotVoid(geometry)) {
      op(geometry);
      descend();
    }
  };
  visit(geometry, walk);
};

const getNonVoidGraphs = (geometry) => {
  const graphs = [];
  eachNonVoidItem(geometry, (item) => {
    if (item.type === 'graph') {
      graphs.push(item);
    }
  });
  return graphs;
};

const getNonVoidPaths = (geometry) => {
  const pathsets = [];
  eachNonVoidItem(geometry, (item) => {
    if (item.type === 'paths') {
      pathsets.push(item);
    }
  });
  return pathsets;
};

const taggedGroup = ({ tags }, ...content) => {
  if (content.some((value) => !value)) {
    throw Error(`Undefined Group content`);
  }
  if (content.some((value) => value.length)) {
    throw Error(`Group content is an array`);
  }
  // FIX: Deprecate layers.
  return { type: 'layers', tags, content };
};

const taggedDisjointAssembly = ({ tags }, ...content) => {
  if (content.some((value) => !value)) {
    throw Error(`Undefined DisjointAssembly content`);
  }
  if (content.some((value) => value.length)) {
    throw Error(`DisjointAssembly content is an array`);
  }
  if (content.some((value) => value.geometry)) {
    throw Error(`Likely Shape instance in DisjointAssembly content`);
  }
  if (tags !== undefined && tags.length === undefined) {
    throw Error(`Bad tags`);
  }
  if (typeof tags === 'function') {
    throw Error(`Tags is a function`);
  }
  const disjointAssembly = { type: 'disjointAssembly', tags, content };
  visit(disjointAssembly, (geometry, descend) => {
    if (geometry.type === 'transform') {
      throw Error('DisjointAssembly contains transform.');
    }
    return descend();
  });
  return disjointAssembly;
};

const linkDisjointAssembly = Symbol('linkDisjointAssembly');

const toDisjointGeometry = (geometry) => {
  const op = (geometry, descend, walk) => {
    if (geometry[linkDisjointAssembly]) {
      return geometry[linkDisjointAssembly];
    } else if (geometry.type === 'disjointAssembly') {
      // Everything below this point is disjoint.
      return geometry;
    } else if (geometry.type === 'transform') {
      return walk(toTransformedGeometry(geometry), op);
    } else if (geometry.type === 'assembly') {
      const assembly = geometry.content.map((entry) => rewrite(entry, op));
      const disjointAssembly = [];
      for (let i = assembly.length - 1; i >= 0; i--) {
        disjointAssembly.unshift(difference(assembly[i], ...disjointAssembly));
      }
      const disjointed = taggedDisjointAssembly({}, ...disjointAssembly);
      geometry[linkDisjointAssembly] = disjointed;
      return disjointed;
    } else {
      return descend();
    }
  };
  // FIX: Interleave toTransformedGeometry into this rewrite.
  if (geometry.type === 'disjointAssembly') {
    return geometry;
  } else {
    const disjointed = rewrite(geometry, op);
    if (disjointed.type === 'disjointAssembly') {
      geometry[linkDisjointAssembly] = disjointed;
      return disjointed;
    } else {
      const wrapper = taggedDisjointAssembly({}, disjointed);
      geometry[linkDisjointAssembly] = wrapper;
      return wrapper;
    }
  }
};

// DEPRECATED
const toKeptGeometry = (geometry) => toDisjointGeometry(geometry);

const fill = (geometry, includeFaces = true, includeHoles = true) => {
  const keptGeometry = toKeptGeometry(geometry);
  const fills = [];
  for (const { tags, graph } of getNonVoidGraphs(keptGeometry)) {
    if (graph.isOutline) {
      fills.push(taggedGraph({ tags }, fill$1(graph)));
    }
  }
  for (const { tags, paths } of getNonVoidPaths(keptGeometry)) {
    fills.push(
      taggedGraph(
        { tags },
        fill$1(fromPaths(close$1(paths)))
      )
    );
  }
  return taggedGroup({}, ...fills);
};

const extrude = (geometry, height, depth) => {
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph': {
        return taggedGraph(
          { tags },
          extrude$1(geometry.graph, height, depth)
        );
      }
      case 'solid':
      case 'z0Surface':
      case 'surface':
      case 'points':
        // Not implemented yet.
        return geometry;
      case 'paths':
        return extrude(fill(geometry), height, depth);
      case 'plan':
      case 'assembly':
      case 'item':
      case 'disjointAssembly':
      case 'layers': {
        return descend();
      }
      case 'sketch': {
        // Sketches aren't real for extrude.
        return geometry;
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(toTransformedGeometry(geometry), op);
};

const extrudeToPlane = (geometry, highPlane, lowPlane) => {
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph': {
        return taggedGraph(
          { tags },
          extrudeToPlane$1(geometry.graph, highPlane, lowPlane)
        );
      }
      case 'solid':
      case 'z0Surface':
      case 'surface':
      case 'paths':
      case 'points':
        // Not implemented yet.
        return geometry;
      case 'plan':
      case 'assembly':
      case 'item':
      case 'disjointAssembly':
      case 'layers': {
        return descend();
      }
      case 'sketch': {
        // Sketches aren't real for extrudeToPlane.
        return geometry;
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(toTransformedGeometry(geometry), op);
};

const flip = (geometry) => {
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'points':
        return { ...geometry, points: flip$4(geometry.points) };
      case 'paths':
        return { ...geometry, paths: flip$3(geometry.paths) };
      case 'surface':
        return { ...geometry, surface: flip$2(geometry.surface) };
      case 'z0Surface':
        return { ...geometry, surface: flip$2(geometry.z0Surface) };
      case 'solid':
        return { ...geometry, solid: flip$1(geometry.solid) };
      case 'assembly':
      case 'disjointAssembly':
      case 'layers':
      case 'layout':
      case 'plan':
      case 'item':
        return descend();
      default:
        throw Error(`die: ${JSON.stringify(geometry)}`);
    }
  };
  return rewrite(geometry, op);
};

// Remove any symbols (which refer to cached values).
const fresh = (geometry) => {
  const fresh = {};
  for (const key of Object.keys(geometry)) {
    if (typeof key !== 'symbol') {
      fresh[key] = geometry[key];
    }
  }
  return fresh;
};

const fromSurfaceToPathsImpl = (surface) => {
  return { type: 'paths', paths: surface };
};

const fromSurfaceToPaths = cache(fromSurfaceToPathsImpl);

const getAnyNonVoidSurfaces = (geometry) => {
  const surfaces = [];
  eachNonVoidItem(geometry, (item) => {
    switch (item.type) {
      case 'surface':
      case 'z0Surface':
        surfaces.push(item);
    }
  });
  return surfaces;
};

const getAnySurfaces = (geometry) => {
  const surfaces = [];
  eachItem(geometry, (item) => {
    switch (item.type) {
      case 'surface':
      case 'z0Surface':
        surfaces.push(item);
    }
  });
  return surfaces;
};

const getItems = (geometry) => {
  const items = [];
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'item':
        return items.push(geometry);
      case 'sketch':
        // We don't look inside sketches.
        return;
      default:
        return descend();
    }
  };
  visit(geometry, op);
  return items;
};

// This gets each layer independently.

const getLayers = (geometry) => {
  const layers = [];
  const op = (geometry, descend, walk) => {
    switch (geometry.type) {
      case 'layers':
        geometry.content.forEach((layer) => layers.unshift(walk(layer)));
        return taggedDisjointAssembly({});
      default:
        return descend();
    }
  };
  rewrite(geometry, op);
  return layers;
};

const getLayouts = (geometry) => {
  const layouts = [];
  eachItem(geometry, (item) => {
    if (item.type === 'layout') {
      layouts.push(item);
    }
  });
  return layouts;
};

// Retrieve leaf geometry.

const getLeafs = (geometry) => {
  const leafs = [];
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'assembly':
      case 'disjointAssembly':
      case 'layers':
      case 'layout':
        return descend();
      default:
        return leafs.push(geometry);
    }
  };
  visit(geometry, op);
  return leafs;
};

const getNonVoidItems = (geometry) => {
  const items = [];
  const op = (geometry, descend) => {
    if (geometry.type === 'item' && isNotVoid(geometry)) {
      items.push(geometry);
    } else {
      descend();
    }
  };
  visit(geometry, op);
  return items;
};

const getNonVoidPlans = (geometry) => {
  const plans = [];
  eachNonVoidItem(geometry, (item) => {
    if (item.type === 'plan') {
      plans.push(item);
    }
  });
  return plans;
};

const getNonVoidPoints = (geometry) => {
  const pointsets = [];
  eachNonVoidItem(geometry, (item) => {
    if (item.type === 'points') {
      pointsets.push(item);
    }
  });
  return pointsets;
};

const getNonVoidSolids = (geometry) => {
  const solids = [];
  eachNonVoidItem(geometry, (item) => {
    if (item.type === 'solid') {
      solids.push(item);
    }
  });
  return solids;
};

const getNonVoidSurfaces = (geometry) => {
  const surfaces = [];
  eachNonVoidItem(geometry, (item) => {
    if (item.type === 'surface') {
      surfaces.push(item);
    }
  });
  return surfaces;
};

const getNonVoidZ0Surfaces = (geometry) => {
  const z0Surfaces = [];
  eachNonVoidItem(geometry, (item) => {
    if (item.type === 'z0Surface') {
      z0Surfaces.push(item);
    }
  });
  return z0Surfaces;
};

const getPaths = (geometry) => {
  const pathsets = [];
  eachItem(geometry, (item) => {
    if (item.type === 'paths') {
      pathsets.push(item);
    }
  });
  return pathsets;
};

/**
 * Returns the first orientation peg found, or defaults to Z0.
 */

const getPeg = (geometry) => {
  let peg;
  eachItem(geometry, (item) => {
    if (item.type === 'points' && item.tags && item.tags.includes('peg')) {
      if (peg === undefined) {
        peg = item.points[0];
      }
    }
  });
  const [
    originX = 0,
    originY = 0,
    originZ = 0,
    forwardX = originX,
    forwardY = originY + 1,
    forwardZ = originZ,
    rightX = originX + 1,
    rightY = originY,
    rightZ = originZ,
  ] = peg || [];
  return [
    originX,
    originY,
    originZ,
    forwardX,
    forwardY,
    forwardZ,
    rightX,
    rightY,
    rightZ,
  ];
};

const getPlans = (geometry) => {
  const plans = [];
  eachItem(geometry, (item) => {
    if (item.type === 'plan') {
      plans.push(item);
    }
  });
  return plans;
};

const getPoints = (geometry) => {
  const pointsets = [];
  eachItem(geometry, (item) => {
    if (item.type === 'points') {
      pointsets.push(item);
    }
  });
  return pointsets;
};

const getTags = (geometry) => {
  if (geometry.tags === undefined) {
    return [];
  } else {
    return geometry.tags;
  }
};

const getZ0Surfaces = (geometry) => {
  const z0Surfaces = [];
  eachItem(geometry, (item) => {
    if (item.type === 'z0Surface') {
      z0Surfaces.push(item);
    }
  });
  return z0Surfaces;
};

// This alphabet uses `A-Za-z0-9_-` symbols. The genetic algorithm helped
// optimize the gzip compression for this alphabet.
let urlAlphabet =
  'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW';

let nanoid = (size = 21) => {
  let id = '';
  // A compact alternative for `for (var i = 0; i < step; i++)`.
  let i = size;
  while (i--) {
    // `| 0` is more compact and faster than `Math.floor()`.
    id += urlAlphabet[(Math.random() * 64) | 0];
  }
  return id
};

const hash = (geometry) => {
  if (geometry.hash === undefined) {
    geometry.hash = nanoid();
  }
  return geometry.hash;
};

const taggedPaths = ({ tags }, paths) => {
  return { type: 'paths', tags, paths };
};

const toBspTree = (geometry, normalize) => {
  // Start with an empty tree.
  let bspTree = fromSolid$1([], normalize);
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'solid': {
        bspTree = unifyBspTrees(
          bspTree,
          fromSolid$1(geometry.solid, normalize)
        );
        return descend();
      }
      // FIX: We want some distinction between volumes for membership and volumes for composition.
      case 'surface':
      case 'z0Surface': {
        bspTree = unifyBspTrees(
          bspTree,
          fromSurface$1(geometry.surface || geometry.z0Surface, normalize)
        );
        return descend();
      }
      case 'paths':
      case 'points':
      case 'plan':
      case 'assembly':
      case 'item':
      case 'disjointAssembly':
      case 'layers':
      case 'sketch': {
        return descend();
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  visit(geometry, op);

  return bspTree;
};

const intersectionImpl = (geometry, ...geometries) => {
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph': {
        let intersected = geometry.graph;
        for (const geometry of geometries) {
          for (const { graph } of getNonVoidGraphs(geometry)) {
            intersected = intersection$2(intersected, graph);
          }
          for (const { solid } of getNonVoidSolids(geometry)) {
            intersected = intersection$2(
              intersected,
              fromSolid(solid)
            );
          }
        }
        return taggedGraph({ tags }, intersected);
      }
      case 'solid': {
        const normalize = createNormalize3();
        const otherGeometry = geometries[0];
        const solids = [
          ...getNonVoidSolids(otherGeometry).map(({ solid }) => solid),
          ...getAnyNonVoidSurfaces(
            otherGeometry
          ).map(({ surface, z0Surface }) =>
            fromSurface$2(surface || z0Surface, normalize)
          ),
        ];
        const intersections = solids
          .map((solid) => intersection$1(geometry.solid, solid))
          .filter((solid) => solid.length > 0)
          .map((solid) => taggedSolid({ tags }, solid));
        if (intersections.length === 1) {
          return intersections[0];
        } else if (geometries.length === 1) {
          return taggedGroup({}, ...intersections);
        } else {
          return intersection(
            taggedGroup({}, ...intersections),
            ...geometries.slice(1)
          );
        }
      }
      case 'z0Surface':
      case 'surface': {
        const normalize = createNormalize3();
        const thisSurface = geometry.surface || geometry.z0Surface;
        const otherGeometry = geometries[0];
        const solids = [
          ...getNonVoidSolids(otherGeometry).map(({ solid }) => solid),
          ...getAnyNonVoidSurfaces(
            otherGeometry
          ).map(({ surface, z0Surface }) =>
            fromSurface$2(surface || z0Surface, normalize)
          ),
        ];
        const intersections = solids
          .map((solid) => {
            const intersectedSurface = [];
            intersectSurface(
              fromSolid$1(solid, normalize),
              thisSurface,
              normalize,
              (surface) => intersectedSurface.push(...surface)
            );
            return intersectedSurface;
          })
          .filter((surface) => surface.length > 0)
          .map((surface) =>
            taggedSurface({ tags }, makeWatertight$2(surface))
          );
        if (intersections.length === 1) {
          return intersections[0];
        } else if (geometries.length === 1) {
          return taggedGroup({}, ...intersections);
        } else {
          return intersection(
            taggedGroup({}, ...intersections),
            ...geometries.slice(1)
          );
        }
      }
      case 'paths': {
        const normalize = createNormalize3();
        let thisPaths = geometry.paths;
        for (const geometry of geometries) {
          const bsp = toBspTree(geometry, normalize);
          const clippedPaths = [];
          removeExteriorPaths(bsp, thisPaths, normalize, (paths) =>
            clippedPaths.push(...paths)
          );
          thisPaths = clippedPaths;
        }
        return taggedPaths({ tags }, thisPaths);
      }
      case 'points': {
        // Not implemented yet.
        return geometry;
      }
      case 'layout':
      case 'plan':
      case 'assembly':
      case 'item':
      case 'disjointAssembly':
      case 'layers': {
        return descend();
      }
      case 'sketch': {
        // Sketches aren't real for intersection.
        return geometry;
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(geometry, op);
};

const intersection = cache(intersectionImpl);

const inset = (geometry, initial = 1, step, limit) => {
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph':
        return taggedPaths(
          { tags },
          toPaths(inset$1(geometry.graph, initial, step, limit))
        );
      case 'solid':
      case 'z0Surface':
      case 'surface':
      case 'points':
        // Not implemented yet.
        return geometry;
      case 'paths':
        return taggedPaths(
          { tags },
          toPaths(
            inset$1(fromPaths(geometry.paths), initial, step, limit)
          )
        );
      case 'plan':
      case 'assembly':
      case 'item':
      case 'disjointAssembly':
      case 'layers': {
        return descend();
      }
      case 'sketch': {
        // Sketches aren't real for inset.
        return geometry;
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(toTransformedGeometry(geometry), op);
};

const keep = (tags, geometry) =>
  rewriteTags(['compose/non-positive'], [], geometry, tags, 'has not');

const measureArea = (rawGeometry) => {
  const geometry = toKeptGeometry(rawGeometry);
  let area = 0;
  const op = (geometry, descend) => {
    if (isVoid(geometry)) {
      return;
    }
    switch (geometry.type) {
      case 'surface':
        area += measureArea$1(geometry.surface);
        break;
      case 'z0Surface':
        area += measureArea$1(geometry.z0Surface);
        break;
      case 'solid':
        for (const surface of geometry.solid) {
          area += measureArea$1(surface);
        }
        break;
    }
    descend();
  };
  visit(geometry, op);
  return area;
};

const measureBoundingBoxGeneric = (geometry) => {
  let minPoint = [Infinity, Infinity, Infinity];
  let maxPoint = [-Infinity, -Infinity, -Infinity];
  eachPoint((point) => {
    minPoint = min(minPoint, point);
    maxPoint = max(maxPoint, point);
  }, geometry);
  return [minPoint, maxPoint];
};

const measureBoundingBox = (geometry) => {
  let minPoint = [Infinity, Infinity, Infinity];
  let maxPoint = [-Infinity, -Infinity, -Infinity];

  const update = ([itemMinPoint, itemMaxPoint]) => {
    minPoint = min(minPoint, itemMinPoint);
    maxPoint = max(maxPoint, itemMaxPoint);
  };

  const op = (geometry, descend) => {
    if (isVoid(geometry)) {
      return;
    }
    switch (geometry.type) {
      case 'assembly':
      case 'layers':
      case 'disjointAssembly':
      case 'item':
      case 'plan':
      case 'sketch':
        return descend();
      case 'graph':
        return update(measureBoundingBox$4(geometry.graph));
      case 'layout':
        return update(geometry.marks);
      case 'solid':
        return update(measureBoundingBox$3(geometry.solid));
      case 'surface':
        return update(measureBoundingBox$2(geometry.surface));
      case 'points':
        return update(measureBoundingBox$1(geometry.points));
      case 'paths':
        return update(measureBoundingBoxGeneric(geometry));
      default:
        throw Error(`Unknown geometry: ${geometry.type}`);
    }
  };

  visit(toKeptGeometry(geometry), op);

  return [minPoint, maxPoint];
};

const X = 0;
const Y = 1;
const Z = 2;

const measureHeights = (geometry, resolution = 1) => {
  const normalize = createNormalize3();
  const [min, max] = measureBoundingBox(geometry);
  const bspTree = toBspTree(geometry, normalize);
  const paths = [];
  const minX = Math.floor(min[X]);
  const maxX = Math.ceil(max[X]);
  const minY = Math.floor(min[Y]);
  const maxY = Math.ceil(max[Y]);
  for (let x = minX; x <= maxX; x += resolution) {
    for (let y = minY; y <= maxY; y += resolution) {
      paths.push(
        createOpenPath(normalize([x, y, min[Z]]), normalize([x, y, max[Z]]))
      );
    }
  }
  const clippedPaths = [];
  removeExteriorPaths(bspTree, paths, normalize, (paths) =>
    clippedPaths.push(...paths)
  );
  const heights = new Map();
  const op = (point) => {
    const key = `${point[X]}/${point[Y]}`;
    if (!heights.has(key) || heights.get(key)[Z] < point[Z]) {
      heights.set(key, point);
    }
  };
  eachPoint$4(op, clippedPaths);
  return [...heights.values()];
};

// FIX: The semantics here are a bit off.
// Let's consider the case of Assembly(Square(10), Square(10).outline()).outline().
// This will drop the Square(10).outline() as it will not be outline-able.
// Currently we need this so that things like withOutline() will work properly,
// but ideally outline would be idempotent and rewrite shapes as their outlines,
// unless already outlined, and handle the withOutline case within this.
const outlineImpl = (geometry, includeFaces = true, includeHoles = true) => {
  const normalize = createNormalize3();

  const keptGeometry = toKeptGeometry(geometry);
  const outlines = [];
  for (const { tags, solid } of getNonVoidSolids(keptGeometry)) {
    outlines.push(taggedPaths({ tags }, outlineSolid(solid, normalize)));
  }
  for (const { tags, graph } of getNonVoidGraphs(keptGeometry)) {
    outlines.push(taggedPaths({ tags }, toPaths(outline$1(graph))));
  }
  // This is a bit tricky -- let's consider an assembly that produces an effective surface.
  // For now, let's consolidate, and see what goes terribly wrong.
  for (const { tags, surface } of getNonVoidSurfaces(keptGeometry)) {
    outlines.push(
      taggedPaths(
        { tags },
        outlineSurface(surface, normalize, includeFaces, includeHoles)
      )
    );
  }
  return outlines;
};

const outline = cache(outlineImpl);

const read = async (path) => read$1(path);

const realize = (geometry, height, depth) => {
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph':
        return taggedGraph({ tags }, realizeGraph(geometry.graph));
      case 'solid':
      case 'z0Surface':
      case 'surface':
      case 'points':
      case 'paths':
        // No lazy representation to realize.
        return geometry;
      case 'plan':
      case 'assembly':
      case 'item':
      case 'disjointAssembly':
      case 'layers':
      case 'layout':
      case 'sketch':
        return descend();
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(geometry, op);
};

const sectionImpl = (geometry, planes) => {
  const transformedGeometry = toTransformedGeometry(geometry);
  const sections = [];
  for (const { tags, graph } of getNonVoidGraphs(transformedGeometry)) {
    for (const paths of section$1(graph, planes)) {
      sections.push(taggedPaths({ tags }, paths));
    }
  }
  return taggedGroup({}, ...sections);
};

const section = cacheSection(sectionImpl);

const smooth = (geometry) => {
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph': {
        return taggedGraph({ tags }, smooth$1(geometry.graph));
      }
      case 'solid':
      case 'z0Surface':
      case 'surface':
      case 'paths':
      case 'points':
        // Not implemented yet.
        return geometry;
      case 'plan':
      case 'assembly':
      case 'item':
      case 'disjointAssembly':
      case 'layers': {
        return descend();
      }
      case 'sketch': {
        // Sketches aren't real for smooth.
        return geometry;
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(toTransformedGeometry(geometry), op);
};

const soup = (geometry) => {
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph': {
        const { graph } = geometry;
        if (graph.isWireframe) {
          return taggedPaths({ tags }, toPaths(graph));
        } else if (graph.isClosed) {
          return taggedSolid({ tags }, toSolid(graph));
        } else {
          return taggedSurface({ tags }, toSurface(graph));
        }
      }
      case 'solid':
      case 'z0Surface':
      case 'surface':
      case 'points':
      case 'paths':
        // Already soupy enough.
        return geometry;
      case 'layout':
      case 'plan':
      case 'assembly':
      case 'item':
      case 'disjointAssembly':
      case 'layers': {
        return descend();
      }
      case 'sketch': {
        // Sketches aren't real for extrude.
        return geometry;
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(toTransformedGeometry(geometry), op);
};

const taggedItem = ({ tags }, ...content) => {
  if (tags !== undefined && tags.length === undefined) {
    throw Error(`Bad tags: ${tags}`);
  }
  if (content.some((value) => value === undefined)) {
    throw Error(`Undefined Item content`);
  }
  if (content.length !== 1) {
    throw Error(`Item expects a single content geometry`);
  }
  return { type: 'item', tags, content };
};

const taggedLayers = ({ tags }, ...content) => {
  if (content.some((value) => !value)) {
    throw Error(`Undefined Layers content`);
  }
  if (content.some((value) => value.length)) {
    throw Error(`Layers content is an array`);
  }
  return { type: 'layers', tags, content };
};

const taggedLayout = (
  { tags, size, margin, title, marks = [] },
  ...content
) => {
  if (content.some((value) => value === undefined)) {
    throw Error(`Undefined Layout content`);
  }
  if (content.some((value) => value.length)) {
    throw Error(`Layout content is an array`);
  }
  if (content.some((value) => value.geometry)) {
    throw Error(`Likely Shape in Layout`);
  }
  return {
    type: 'layout',
    layout: { size, margin, title },
    marks,
    tags,
    content,
  };
};

const taggedPoints = ({ tags }, points) => {
  return { type: 'points', tags, points };
};

const taggedSketch = ({ tags }, ...content) => {
  if (content.some((value) => value === undefined)) {
    throw Error(`Undefined Sketch content`);
  }
  if (content.length !== 1) {
    throw Error(`Sketch expects a single content geometry`);
  }
  return { type: 'sketch', tags, content };
};

const taggedZ0Surface = ({ tags }, z0Surface) => {
  return { type: 'z0Surface', tags, z0Surface };
};

// The resolution is 1 / multiplier.
const multiplier = 1e5;

const X$1 = 0;
const Y$1 = 1;
const Z$1 = 2;

// FIX: Use createNormalize3
const createPointNormalizer = () => {
  const map = new Map();
  const normalize = (coordinate) => {
    // Apply a spatial quantization to the 3 dimensional coordinate.
    const nx = Math.floor(coordinate[X$1] * multiplier - 0.5);
    const ny = Math.floor(coordinate[Y$1] * multiplier - 0.5);
    const nz = Math.floor(coordinate[Z$1] * multiplier - 0.5);
    // Look for an existing inhabitant.
    const value = map.get(`${nx}/${ny}/${nz}`);
    if (value !== undefined) {
      return value;
    }
    // One of the ~0 or ~1 values will match the rounded values above.
    // The other will match the adjacent cell.
    const nx0 = nx;
    const ny0 = ny;
    const nz0 = nz;
    const nx1 = nx0 + 1;
    const ny1 = ny0 + 1;
    const nz1 = nz0 + 1;
    // Populate the space of the quantized coordinate and its adjacencies.
    // const normalized = [nx1 / multiplier, ny1 / multiplier, nz1 / multiplier];
    const normalized = coordinate;
    map.set(`${nx0}/${ny0}/${nz0}`, normalized);
    map.set(`${nx0}/${ny0}/${nz1}`, normalized);
    map.set(`${nx0}/${ny1}/${nz0}`, normalized);
    map.set(`${nx0}/${ny1}/${nz1}`, normalized);
    map.set(`${nx1}/${ny0}/${nz0}`, normalized);
    map.set(`${nx1}/${ny0}/${nz1}`, normalized);
    map.set(`${nx1}/${ny1}/${nz0}`, normalized);
    map.set(`${nx1}/${ny1}/${nz1}`, normalized);
    // This is now the normalized coordinate for this region.
    return normalized;
  };
  return normalize;
};

const toPoints = (geometry) => {
  const normalize = createPointNormalizer();
  const points = new Set();
  eachPoint((point) => points.add(normalize(point)), geometry);
  return { type: 'points', points: [...points] };
};

// Union is a little more complex, since it can violate disjointAssembly invariants.
const unionImpl = (geometry, ...geometries) => {
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph': {
        let unified = geometry.graph;
        for (const geometry of geometries) {
          for (const { graph } of getNonVoidGraphs(geometry)) {
            unified = union$4(unified, graph);
          }
          for (const { solid } of getNonVoidSolids(geometry)) {
            unified = union$4(unified, fromSolid(solid));
          }
        }
        return taggedGraph({ tags }, unified);
      }
      case 'solid': {
        const solids = [];
        for (const geometry of geometries) {
          for (const { solid } of getNonVoidSolids(geometry)) {
            solids.push(solid);
          }
        }
        // No meaningful way to unify with a surface.
        return taggedSolid({ tags }, union$3(geometry.solid, ...solids));
      }
      case 'surface': {
        const normalize = createNormalize3();
        const thisSurface = geometry.surface;
        let planarPolygon = toPolygon(toPlane(thisSurface));
        const solids = [];
        for (const input of [geometry, ...geometries]) {
          for (const { solid } of getNonVoidSolids(input)) {
            solids.push(solid);
          }
          for (const { surface } of getNonVoidSurfaces(input)) {
            solids.push(fromSurface$2(surface, normalize));
          }
        }
        const unionedSolid = union$3(...solids);
        const clippedPolygons = [];
        intersectSurface(
          fromSolid$1(unionedSolid, normalize),
          [planarPolygon],
          normalize,
          (polygons) => clippedPolygons.push(...polygons)
        );
        return taggedSurface(
          { tags },
          makeWatertight$2(clippedPolygons, normalize)
        );
      }
      case 'paths': {
        const { paths, tags } = geometry;
        const pathsets = [paths];
        for (const input of geometries) {
          for (const { paths } of getNonVoidPaths(input)) {
            pathsets.push(paths);
          }
        }
        return taggedPaths({ tags }, union$2(paths, ...pathsets));
      }
      case 'points': {
        const { points, tags } = geometry;
        const pointsets = [];
        for (const { points } of getNonVoidPoints(geometry)) {
          pointsets.push(points);
        }
        return taggedPoints({ tags }, union$1(points, ...pointsets));
      }
      case 'layout':
      case 'plan':
      case 'assembly':
      case 'item':
      case 'disjointAssembly':
      case 'layers': {
        return descend();
      }
      case 'sketch': {
        // Sketches aren't real for union.
        return geometry;
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(geometry, op);
};

const union = cache(unionImpl);

const write = async (geometry, path) => {
  const disjointGeometry = toDisjointGeometry(geometry);
  // Ensure that the geometry carries a hash before saving.
  hash(disjointGeometry);
  const realizedGeometry = realize(disjointGeometry);
  await write$1(path, realizedGeometry);
  return realizedGeometry;
};

const rotateX = (angle, geometry) =>
  transform(fromXRotation((angle * Math.PI) / 180), geometry);
const rotateY = (angle, geometry) =>
  transform(fromYRotation((angle * Math.PI) / 180), geometry);
const rotateZ = (angle, geometry) =>
  transform(fromZRotation((angle * Math.PI) / 180), geometry);
const translate = (vector, geometry) =>
  transform(fromTranslation(vector), geometry);
const scale = (vector, geometry) =>
  transform(fromScaling(vector), geometry);

export { allTags, assemble, canonicalize, difference, drop, eachItem, eachPoint, extrude, extrudeToPlane, fill, findOpenEdges, flip, fresh, fromSurfaceToPaths, getAnyNonVoidSurfaces, getAnySurfaces, getGraphs, getItems, getLayers, getLayouts, getLeafs, getNonVoidGraphs, getNonVoidItems, getNonVoidPaths, getNonVoidPlans, getNonVoidPoints, getNonVoidSolids, getNonVoidSurfaces, getNonVoidZ0Surfaces, getPaths, getPeg, getPlans, getPoints, getSolids, getSurfaces, getTags, getZ0Surfaces, hash, inset, intersection, isNotVoid, isVoid, isWatertight, keep, makeWatertight, measureArea, measureBoundingBox, measureHeights, outline, read, realize, reconcile, rewrite, rewriteTags, rotateX, rotateY, rotateZ, scale, section, smooth, soup, taggedAssembly, taggedDisjointAssembly, taggedGraph, taggedGroup, taggedItem, taggedLayers, taggedLayout, taggedPaths, taggedPoints, taggedSketch, taggedSolid, taggedSurface, taggedZ0Surface, toDisjointGeometry, toKeptGeometry, toPoints, toTransformedGeometry, transform, translate, union, update, visit, write };
