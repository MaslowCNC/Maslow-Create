import { toPaths, toSolid, toSurface } from './jsxcad-geometry-graph.js';
import { toPlane } from './jsxcad-math-poly3.js';
import { toTriangles } from './jsxcad-geometry-polygons.js';
import { toDisjointGeometry } from './jsxcad-geometry-tagged.js';

const pointsToThreejsPoints = (points) => points;

const solidToThreejsSolid = (solid) => {
  const normals = [];
  const positions = [];
  for (const surface of solid) {
    for (const triangle of toTriangles({}, surface)) {
      const plane = toPlane(triangle);
      if (plane === undefined) {
        continue;
      }
      const [px, py, pz] = plane;
      for (const [x = 0, y = 0, z = 0] of triangle) {
        normals.push(px, py, pz);
        positions.push(x, y, z);
      }
    }
  }
  return { normals, positions };
};

const surfaceToThreejsSurface = (surface) => {
  const normals = [];
  const positions = [];
  for (const triangle of toTriangles({}, surface)) {
    const plane = toPlane(triangle);
    if (plane === undefined) {
      continue;
    }
    const [px, py, pz] = plane;
    for (const [x = 0, y = 0, z = 0] of triangle) {
      normals.push(px, py, pz);
      positions.push(x, y, z);
    }
  }
  return { normals, positions };
};

const toThreejsGeometry = (geometry, supertags) => {
  const tags = [...(supertags || []), ...(geometry.tags || [])];
  if (tags.includes('compose/non-positive')) {
    return;
  }
  if (geometry.isThreejsGeometry) {
    return geometry;
  }
  switch (geometry.type) {
    case 'layout':
    case 'assembly':
    case 'disjointAssembly':
    case 'layers':
      return {
        type: 'assembly',
        content: geometry.content.map((content) =>
          toThreejsGeometry(content, tags)
        ),
        tags,
        isThreejsGeometry: true,
      };
    case 'sketch':
      return {
        type: 'sketch',
        content: geometry.content.map((content) =>
          toThreejsGeometry(content, tags)
        ),
        tags,
        isThreejsGeometry: true,
      };
    case 'item':
      return {
        type: 'item',
        content: geometry.content.map((content) =>
          toThreejsGeometry(content, tags)
        ),
        tags,
        isThreejsGeometry: true,
      };
    case 'paths':
      return {
        type: 'paths',
        threejsPaths: geometry.paths,
        tags,
        isThreejsGeometry: true,
      };
    case 'plan':
      return {
        type: 'plan',
        threejsPlan: geometry.plan,
        threejsMarks: geometry.marks,
        content: geometry.content.map((content) =>
          toThreejsGeometry(content, tags)
        ),
        tags,
        isThreejsGeometry: true,
      };
    case 'points':
      return {
        type: 'points',
        threejsPoints: pointsToThreejsPoints(geometry.points),
        tags,
        isThreejsGeometry: true,
      };
    case 'solid':
      return {
        type: 'solid',
        threejsSolid: solidToThreejsSolid(geometry.solid),
        tags,
        isThreejsGeometry: true,
      };
    case 'surface':
      return {
        type: 'surface',
        threejsSurface: surfaceToThreejsSurface(geometry.surface),
        tags,
        isThreejsGeometry: true,
      };
    case 'z0Surface':
      return {
        type: 'surface',
        threejsSurface: surfaceToThreejsSurface(geometry.z0Surface),
        tags,
        isThreejsGeometry: true,
      };
    case 'graph':
      if (geometry.graph.isWireframe) {
        return {
          type: 'paths',
          threejsPaths: toPaths(geometry.graph),
          tags,
          isThreejsGeometry: true,
        };
      } else if (geometry.graph.isClosed) {
        return {
          type: 'solid',
          threejsSolid: solidToThreejsSolid(toSolid(geometry.graph)),
          tags,
          isThreejsGeometry: true,
        };
      } else {
        return {
          type: 'surface',
          threejsSurface: surfaceToThreejsSurface(
            toSurface(geometry.graph)
          ),
          tags,
          isThreejsGeometry: true,
        };
      }
    default:
      throw Error(`Unexpected geometry: ${geometry.type}`);
  }
};

const toThreejsPage = async (
  geometry,
  { view, title = 'JSxCAD Viewer' } = {}
) => {
  const disjointGeometry = toDisjointGeometry(await geometry);
  const html = `
<html>
 <head>
  <title>${title}</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
 </head>
 <body>
  <script type='module'>
    import { dataUrl } from 'https://gitcdn.link/cdn/jsxcad/JSxCAD/master/es6/jsxcad-ui-threejs.js';
    import { Shape } from 'https://gitcdn.link/cdn/jsxcad/JSxCAD/master/es6/jsxcad-api-v1-shape.js';

    const geometry = ${JSON.stringify(disjointGeometry)};

    const run = async () => {
      const { width = 1024, height = 1024, position = [0, 0, 100] } = {};
      const body = document.getElementsByTagName('body')[0];
      const url = await dataUrl(Shape.fromGeometry(geometry), {
        width,
        height,
        position,
      });
      const image = document.createElement('img');
      image.src = url;
      body.appendChild(image);
    };

    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        run();
      }
    };
  </script>
 </body>
</html>
`;
  return new TextEncoder('utf8').encode(html);
};

export { toThreejsGeometry, toThreejsPage };
