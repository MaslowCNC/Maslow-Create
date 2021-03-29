import { identityMatrix, fromXRotation, fromYRotation, fromZRotation, fromTranslation, fromScaling } from './jsxcad-math-mat4.js';
import { cacheTransform, cache, cacheRewriteTags, cacheSection } from './jsxcad-cache.js';
import { transform as transform$3, canonicalize as canonicalize$4, eachPoint as eachPoint$2, flip as flip$1 } from './jsxcad-geometry-paths.js';
import { canonicalize as canonicalize$2 } from './jsxcad-math-plane.js';
import { transform as transform$2, canonicalize as canonicalize$1, eachPoint as eachPoint$3, flip as flip$2, measureBoundingBox as measureBoundingBox$2, union as union$1 } from './jsxcad-geometry-points.js';
import { transform as transform$4, canonicalize as canonicalize$3, measureBoundingBox as measureBoundingBox$1 } from './jsxcad-geometry-polygons.js';
import { realizeGraph, transform as transform$1, fill as fill$1, fromPaths, difference as difference$1, eachPoint as eachPoint$1, fromEmpty, extrude as extrude$1, extrudeToPlane as extrudeToPlane$1, toPaths, intersection as intersection$1, inset as inset$1, measureBoundingBox as measureBoundingBox$3, offset as offset$1, projectToPlane as projectToPlane$1, sections, smooth as smooth$1, toTriangles, test as test$1, toPolygonsWithHoles as toPolygonsWithHoles$1, union as union$2 } from './jsxcad-geometry-graph.js';
import { composeTransforms } from './jsxcad-algorithm-cgal.js';
import { min, max } from './jsxcad-math-vec3.js';
import { read as read$1, write as write$1 } from './jsxcad-sys.js';

const taggedTransform = (options = {}, matrix, untransformed) => {
  return {
    type: 'transform',
    matrix,
    content: [untransformed],
    tags: untransformed.tags,
  };
};

const transformImpl = (matrix, untransformed) =>
  taggedTransform({}, matrix, untransformed);

const transform = cacheTransform(transformImpl);

const isNotVoid = ({ tags }) => {
  return tags === undefined || tags.includes('compose/non-positive') === false;
};

const isVoid = (geometry) => !isNotVoid(geometry);

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
        (changes, newState = state) =>
          update(
            geometry,
            {
              content: validateContent(
                geometry,
                geometry.content?.map?.((entry) => walk(entry, newState))
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

const taggedGraph = ({ tags }, graph) => {
  if (graph.length > 0) {
    throw Error('Graph should not be an array');
  }
  return {
    type: 'graph',
    tags,
    graph,
  };
};

const realize = (geometry) => {
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph':
        return taggedGraph({ tags }, realizeGraph(geometry.graph));
      case 'displayGeometry':
      case 'triangles':
      case 'points':
      case 'paths':
        // No lazy representation to realize.
        return geometry;
      case 'plan': {
        const realizer = realize[geometry.plan.realize];
        if (realizer === undefined) {
          throw Error(`Do not know how to realize plan: ${geometry.plan}`);
        }
        return realizer(geometry.plan);
      }
      case 'assembly':
      case 'item':
      case 'disjointAssembly':
      case 'layers':
      case 'layout':
      case 'sketch':
      case 'transform':
        return descend();
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(geometry, op);
};

const transformedGeometry = Symbol('transformedGeometry');

const toTransformedGeometry = (geometry) => {
  if (geometry[transformedGeometry] === undefined) {
    const op = (geometry, descend, walk, matrix) => {
      switch (geometry.type) {
        case 'transform':
          // Preserve any tags applied to the untransformed geometry.
          // FIX: Ensure tags are merged between transformed and untransformed upon resolution.
          return walk(
            geometry.content[0],
            composeTransforms(matrix, geometry.matrix)
          );
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
        case 'plan': {
          const composedMatrix = composeTransforms(
            matrix,
            geometry.plan.matrix || identityMatrix
          );
          const planUpdate = descend(
            {
              tags: geometry.tags,
              type: geometry.type,
              plan: {
                ...geometry.plan,
                matrix: composedMatrix,
              },
            },
            composedMatrix
          );
          return planUpdate;
        }
        case 'triangles':
          return descend({
            triangles: transform$4(matrix, geometry.triangles),
          });
        case 'paths':
          return descend({ paths: transform$3(matrix, geometry.paths) });
        case 'points':
          return descend({ points: transform$2(matrix, geometry.points) });
        case 'graph':
          return descend({ graph: transform$1(matrix, geometry.graph) });
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
        return descend({ points: canonicalize$1(geometry.points) });
      case 'paths':
        return descend({ paths: canonicalize$4(geometry.paths) });
      case 'triangles':
        return descend({ triangles: canonicalize$3(geometry.triangles) });
      case 'plan':
        return descend({
          marks: canonicalize$1(geometry.marks),
          planes: geometry.planes.map(canonicalize$2),
        });
      case 'graph': {
        const realizedGeometry = realize(geometry);
        return descend({
          graph: {
            ...realizedGeometry.graph,
            points: canonicalize$1(realizedGeometry.graph.points),
          },
        });
      }
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

const getFaceablePaths = (geometry) => {
  const pathsets = [];
  eachItem(geometry, (item) => {
    if (item.type !== 'paths') {
      return;
    }
    if (item.tags && item.tags.includes('paths/Wire')) {
      return;
    }
    pathsets.push(item);
  });
  return pathsets;
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

const registry = new Map();

const reify = (geometry) => {
  if (geometry.type === 'plan' && geometry.content.length > 0) {
    return geometry;
  }
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'graph':
      case 'triangles':
      case 'points':
      case 'paths':
        // No plan to realize.
        return geometry;
      case 'plan': {
        if (geometry.content.length === 0) {
          // This plan is not reified, generate content.
          const reifier = registry.get(geometry.plan.type);
          if (reifier === undefined) {
            throw Error(
              `Do not know how to reify plan: ${JSON.stringify(geometry.plan)}`
            );
          }
          return descend({ content: [reifier(geometry)] });
        }
        return geometry;
      }
      case 'displayGeometry':
        // CHECK: Should this taint the results if there is a plan?
        return geometry;
      case 'assembly':
      case 'item':
      case 'disjointAssembly':
      case 'layers':
      case 'layout':
      case 'sketch':
      case 'transform':
        return descend();
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(geometry, op);
};

// We expect the type to be uniquely qualified.
const registerReifier = (type, reifier) => registry.set(type, reifier);

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
      throw Error(
        `DisjointAssembly contains transform: ${JSON.stringify(geometry)}`
      );
    }
    return descend();
  });
  return disjointAssembly;
};

const taggedDisplayGeometry = ({ tags }, ...content) => {
  if (content.some((value) => value === undefined)) {
    throw Error(`Undefined DisplayGeometry content`);
  }
  if (content.length !== 1) {
    throw Error(`DisplayGeometry expects a single content geometry`);
  }
  return { type: 'displayGeometry', tags, content };
};

const linkDisjointAssembly = Symbol('linkDisjointAssembly');

const hasVoidGeometry = (geometry) => {
  if (isVoid(geometry)) {
    return true;
  }
  if (geometry.content) {
    for (const content of geometry.content) {
      if (hasVoidGeometry(content)) {
        return true;
      }
    }
  }
};

const DISJUNCTION_TOTAL = 'complete';
const DISJUNCTION_VISIBLE = 'visible';

const toDisjointGeometry = (geometry, mode = DISJUNCTION_TOTAL) => {
  const op = (geometry, descend, walk, state) => {
    if (geometry[linkDisjointAssembly]) {
      return geometry[linkDisjointAssembly];
    } else if (geometry.type === 'disjointAssembly') {
      // Everything below this point is disjoint.
      return geometry;
    } else if (geometry.type === 'displayGeometry') {
      // We pretend that everything below this point is disjoint.
      return geometry;
    } else if (geometry.type === 'plan') {
      return walk(reify(geometry).content[0], op);
    } else if (geometry.type === 'transform') {
      return walk(toTransformedGeometry(geometry), op);
    } else if (geometry.type === 'assembly') {
      if (mode === DISJUNCTION_VISIBLE && !hasVoidGeometry(geometry)) {
        console.log(`QQ/Visible Disjunction Skipped`);
        // This leads to some potential invariant violations.
        // With toVisiblyDisjoint geometry we may get assembly within
        // disjointAssembly.
        // This is acceptable for displayGeometry, but otherwise problematic.
        // For this reason we wrap the output as DisplayGeometry.
        return taggedDisplayGeometry(
          {},
          toTransformedGeometry(reify(geometry))
        );
      }
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

const toVisiblyDisjointGeometry = (geometry) =>
  toDisjointGeometry(geometry, DISJUNCTION_VISIBLE);

const differenceImpl = (geometry, ...geometries) => {
  geometries = geometries.map(toDisjointGeometry);
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph': {
        let differenced = geometry.graph;
        for (const geometry of geometries) {
          for (const { graph } of getGraphs(geometry)) {
            differenced = difference$1(differenced, graph);
          }
          for (const { paths } of getFaceablePaths(geometry)) {
            differenced = difference$1(
              differenced,
              fill$1(
                fromPaths(paths.map((path) => ({ points: path })))
              )
            );
          }
        }
        return taggedGraph({ tags }, differenced);
      }
      case 'paths':
        // This will have problems with open paths, but we want to phase this out anyhow.
        return difference(
          taggedGraph(
            { tags },
            fill$1(
              fromPaths(geometry.paths.map((path) => ({ points: path })))
            )
          ),
          ...geometries
        );
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

  return rewrite(toDisjointGeometry(geometry), op);
};

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
        return eachPoint$3(emit, geometry.points);
      case 'paths':
        return eachPoint$2(emit, geometry.paths);
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

const empty = ({ tags }) => taggedGraph({ tags }, fromEmpty());

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
  if (content.length === 1) {
    return content[0];
  }
  // FIX: Deprecate layers.
  return { type: 'layers', tags, content };
};

// DEPRECATED
const toKeptGeometry = (geometry) => toDisjointGeometry(geometry);

const fill = (geometry, includeFaces = true, includeHoles = true) => {
  const keptGeometry = toKeptGeometry(geometry);
  const fills = [];
  for (const { tags, graph } of getNonVoidGraphs(keptGeometry)) {
    if (tags && tags.includes('path/Wire')) {
      continue;
    }
    if (graph.isOutline) {
      fills.push(taggedGraph({ tags }, fill$1(graph)));
    }
  }
  for (const { tags, paths } of getNonVoidPaths(keptGeometry)) {
    if (tags && tags.includes('path/Wire')) {
      continue;
    }
    fills.push(
      taggedGraph(
        { tags },
        fill$1(
          fromPaths(paths.map((path) => ({ points: path })))
        )
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
      case 'triangles':
      case 'points':
        // Not implemented yet.
        return geometry;
      case 'paths':
        return extrude(fill(geometry), height, depth);
      case 'plan':
        return extrude(reify(geometry).content[0], height, depth);
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

  // CHECK: Why does this need transformed geometry?
  return rewrite(toTransformedGeometry(geometry), op);
};

const extrudeToPlane = (geometry, highPlane, lowPlane, direction) => {
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph': {
        return taggedGraph(
          { tags },
          extrudeToPlane$1(geometry.graph, highPlane, lowPlane, direction)
        );
      }
      case 'triangles':
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
        return { ...geometry, points: flip$2(geometry.points) };
      case 'paths':
        return { ...geometry, paths: flip$1(geometry.paths) };
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

const getNonVoidFaceablePaths = (geometry) => {
  const pathsets = [];
  eachNonVoidItem(geometry, (item) => {
    if (item.type !== 'paths') {
      return;
    }
    if (item.tags && item.tags.includes('paths/Wire')) {
      return;
    }
    pathsets.push(item);
  });
  return pathsets;
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

const intersectionImpl = (geometry, ...geometries) => {
  geometries = geometries.map(toDisjointGeometry);
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph': {
        let input = geometry.graph;
        const intersections = [];
        for (const geometry of geometries) {
          for (const { graph } of getNonVoidGraphs(geometry)) {
            intersections.push(
              taggedGraph({ tags }, intersection$1(input, graph))
            );
          }
          for (const { paths } of getNonVoidFaceablePaths(geometry)) {
            intersections.push(
              taggedGraph(
                { tags },
                intersection$1(input, fromPaths(paths))
              )
            );
          }
        }
        return taggedGroup({ tags }, ...intersections);
      }
      case 'paths': {
        if (tags && tags.includes('paths/Wire')) {
          return geometry;
        }
        return taggedPaths(
          { tags },
          toPaths(
            intersection(
              taggedGraph({ tags }, fromPaths(geometry.paths)),
              ...geometries
            ).graph
          )
        );
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

  return rewrite(toDisjointGeometry(geometry), op);
};

const intersection = cache(intersectionImpl);

const inset = (geometry, initial = 1, step, limit) => {
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph':
        return taggedGroup(
          { tags },
          ...inset$1(geometry.graph, initial, step, limit).map((graph) =>
            taggedGraph({}, graph)
          )
        );
      case 'triangles':
      case 'points':
        // Not implemented yet.
        return geometry;
      case 'paths':
        return inset(
          fromPaths(geometry.paths.map((path) => ({ points: path }))),
          initial,
          step,
          limit
        );
      case 'plan':
        return inset(reify(geometry).content[0], initial, step, limit);
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
      case 'plan':
      case 'assembly':
      case 'layers':
      case 'disjointAssembly':
      case 'item':
      case 'sketch':
      case 'displayGeometry':
        return descend();
      case 'graph':
        return update(measureBoundingBox$3(geometry.graph));
      case 'layout':
        return update(geometry.marks);
      case 'points':
        return update(measureBoundingBox$2(geometry.points));
      case 'paths':
        return update(measureBoundingBoxGeneric(geometry));
      case 'triangles':
        return update(measureBoundingBox$1(geometry.triangles));
      default:
        throw Error(`Unknown geometry: ${geometry.type}`);
    }
  };

  visit(toKeptGeometry(reify(geometry)), op);

  return [minPoint, maxPoint];
};

const offset = (geometry, initial = 1, step, limit) => {
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph':
        return taggedGroup(
          { tags },
          ...offset$1(geometry.graph, initial, step, limit).map((graph) =>
            taggedGraph({}, graph)
          )
        );
      case 'triangles':
      case 'points':
        // Not implemented yet.
        return geometry;
      case 'paths':
        return offset(
          fromPaths(geometry.paths.map((path) => ({ points: path }))),
          initial,
          step,
          limit
        );
      case 'plan':
        return offset(reify(geometry).content[0], initial, step, limit);
      case 'assembly':
      case 'item':
      case 'disjointAssembly':
      case 'layers': {
        return descend();
      }
      case 'sketch': {
        // Sketches aren't real for offset.
        return geometry;
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(toTransformedGeometry(geometry), op);
};

// FIX: The semantics here are a bit off.
// Let's consider the case of Assembly(Square(10), Square(10).outline()).outline().
// This will drop the Square(10).outline() as it will not be outline-able.
// Currently we need this so that things like withOutline() will work properly,
// but ideally outline would be idempotent and rewrite shapes as their outlines,
// unless already outlined, and handle the withOutline case within this.
const outlineImpl = (geometry, includeFaces = true, includeHoles = true) => {
  const disjointGeometry = toDisjointGeometry(geometry);
  const outlines = [];
  for (const { tags = [], graph } of getNonVoidGraphs(disjointGeometry)) {
    outlines.push(
      taggedPaths({ tags: [...tags, 'path/Wire'] }, toPaths(graph))
    );
  }
  // Turn paths into wires.
  for (const { tags = [], paths } of getNonVoidPaths(disjointGeometry)) {
    outlines.push(taggedPaths({ tags: [...tags, 'path/Wire'] }, paths));
  }
  return outlines;
};

const outline = cache(outlineImpl);

const projectToPlane = (geometry, plane, direction) => {
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph': {
        return taggedGraph(
          { tags },
          projectToPlane$1(geometry.graph, plane, direction)
        );
      }
      case 'triangles':
      case 'points':
        // Not implemented yet.
        return geometry;
      case 'paths':
        return projectToPlane(
          taggedGraph({ tags }, fromPaths(geometry.paths)),
          plane,
          direction
        );
      case 'plan':
      case 'assembly':
      case 'item':
      case 'disjointAssembly':
      case 'layers': {
        return descend();
      }
      case 'sketch': {
        // Sketches aren't real for projectToPlane.
        return geometry;
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  return rewrite(toTransformedGeometry(geometry), op);
};

const read = async (path) => read$1(path);

const sectionImpl = (geometry, planes) => {
  const transformedGeometry = toTransformedGeometry(reify(geometry));
  const sections$1 = [];
  for (const { tags, graph } of getNonVoidGraphs(transformedGeometry)) {
    for (const section of sections(graph, planes)) {
      sections$1.push(taggedGraph({ tags }, section));
    }
  }
  return taggedGroup({}, ...sections$1);
};

const section = cacheSection(sectionImpl);

const smooth = (geometry, options) => {
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph': {
        return taggedGraph({ tags }, smooth$1(geometry.graph, options));
      }
      case 'triangles':
      case 'paths':
      case 'points':
        // Not implemented yet.
        return geometry;
      case 'plan':
        return smooth(reify(geometry).content[0], options);
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

const taggedTriangles = ({ tags }, triangles) => {
  return { type: 'triangles', tags, triangles };
};

const soup = (geometry, { doOutline = true } = {}) => {
  const outline$1 = doOutline ? outline : () => [];
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph': {
        const { graph } = geometry;
        if (graph.isWireframe) {
          return taggedPaths({ tags }, toPaths(graph));
        } else if (graph.isClosed) {
          return taggedGroup(
            {},
            taggedTriangles({ tags }, toTriangles(graph)),
            ...outline$1(geometry)
          );
        } else if (graph.isEmpty) {
          return taggedGroup({});
        } else {
          // FIX: Simplify this arrangement.
          return taggedGroup(
            {},
            taggedTriangles({ tags }, toTriangles(graph)),
            ...outline$1(geometry)
          );
        }
      }
      // Unreachable.
      case 'triangles':
      case 'points':
      case 'paths':
        // Already soupy enough.
        return geometry;
      case 'displayGeometry':
        // soup can handle displayGeometry.
        return descend();
      case 'layout':
      case 'plan':
      case 'assembly':
      case 'item':
      case 'disjointAssembly':
      case 'sketch':
      case 'layers': {
        return descend();
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

const taggedPlan = ({ tags }, plan) => ({
  type: 'plan',
  tags,
  plan,
  content: [],
});

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

const test = (geometry) => {
  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'graph':
        return test$1(geometry.graph);
      case 'solid':
      case 'z0Surface':
      case 'surface':
      case 'points':
      case 'paths':
        return;
      case 'plan':
        return test(reify(geometry).content[0]);
      case 'transform':
      case 'layout':
      case 'assembly':
      case 'item':
      case 'disjointAssembly':
      case 'layers':
      case 'sketch':
        return descend();
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  visit(geometry, op);
  return geometry;
};

const toDisplayGeometry = (geometry, options) =>
  soup(toVisiblyDisjointGeometry(geometry), options);

// The resolution is 1 / multiplier.
const multiplier = 1e5;

const X = 0;
const Y = 1;
const Z = 2;

// FIX: Use createNormalize3
const createPointNormalizer = () => {
  const map = new Map();
  const normalize = (coordinate) => {
    // Apply a spatial quantization to the 3 dimensional coordinate.
    const nx = Math.floor(coordinate[X] * multiplier - 0.5);
    const ny = Math.floor(coordinate[Y] * multiplier - 0.5);
    const nz = Math.floor(coordinate[Z] * multiplier - 0.5);
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

const toPolygonsWithHoles = (geometry) => {
  const polygonsWithHoles = [];

  const op = (geometry, descend) => {
    switch (geometry.type) {
      case 'graph': {
        polygonsWithHoles.push({
          tags: geometry.tags,
          polygonsWithHoles: toPolygonsWithHoles$1(geometry.graph),
        });
        break;
      }
      // FIX: Support 'triangles'?
      case 'points':
      case 'paths':
        break;
      case 'layout':
      case 'plan':
      case 'assembly':
      case 'item':
      case 'disjointAssembly':
      case 'sketch':
      case 'layers': {
        return descend();
      }
      default:
        throw Error(`Unexpected geometry: ${JSON.stringify(geometry)}`);
    }
  };

  visit(toTransformedGeometry(geometry), op);

  return polygonsWithHoles;
};

// Union is a little more complex, since it can violate disjointAssembly invariants.
const unionImpl = (geometry, ...geometries) => {
  geometries = geometries.map(toDisjointGeometry);
  const op = (geometry, descend) => {
    const { tags } = geometry;
    switch (geometry.type) {
      case 'graph': {
        let unified = geometry.graph;
        for (const geometry of geometries) {
          for (const { graph } of getNonVoidGraphs(geometry)) {
            unified = union$2(unified, graph);
          }
          for (const { paths } of getNonVoidFaceablePaths(geometry)) {
            unified = union$2(unified, fromPaths(paths));
          }
        }
        return taggedGraph({ tags }, unified);
      }
      case 'paths': {
        if (tags && tags.includes('path/Wire')) {
          return geometry;
        }
        return taggedPaths(
          { tags },
          toPaths(
            union(
              taggedGraph({ tags }, fromPaths(geometry.paths)),
              ...geometries
            ).graph
          )
        );
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

  return rewrite(toDisjointGeometry(geometry), op);
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

export { allTags, assemble, canonicalize, difference, drop, eachItem, eachPoint, empty, extrude, extrudeToPlane, fill, flip, fresh, fromSurfaceToPaths, getAnyNonVoidSurfaces, getAnySurfaces, getFaceablePaths, getGraphs, getItems, getLayers, getLayouts, getLeafs, getNonVoidFaceablePaths, getNonVoidGraphs, getNonVoidItems, getNonVoidPaths, getNonVoidPlans, getNonVoidPoints, getPaths, getPeg, getPlans, getPoints, getTags, hash, inset, intersection, isNotVoid, isVoid, keep, measureBoundingBox, offset, outline, projectToPlane, read, realize, registerReifier, reify, rewrite, rewriteTags, rotateX, rotateY, rotateZ, scale, section, smooth, soup, taggedAssembly, taggedDisjointAssembly, taggedDisplayGeometry, taggedGraph, taggedGroup, taggedItem, taggedLayers, taggedLayout, taggedPaths, taggedPlan, taggedPoints, taggedSketch, taggedTransform, taggedTriangles, test, toDisjointGeometry, toDisplayGeometry, toKeptGeometry, toPoints, toPolygonsWithHoles, toTransformedGeometry, toVisiblyDisjointGeometry, transform, translate, union, update, visit, write };
