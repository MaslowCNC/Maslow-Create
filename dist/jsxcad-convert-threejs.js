import { ColladaLoader, SVGLoader, Group, MeshBasicMaterial, Color, DoubleSide, ShapeGeometry, Mesh } from './jsxcad-algorithm-threejs.js';
import { taggedGroup, fromPolygons, toConcreteGeometry } from './jsxcad-geometry.js';
import { toTagFromRgb } from './jsxcad-algorithm-color.js';

const fromColladaToThreejs = async (input) => {
  const text = new TextDecoder('utf8').decode(input);
  const loader = new ColladaLoader();
  const { scene } = loader.parse(text);
  return scene;
};

const fromSvgToThreejs = async (input) => {
  const text = new TextDecoder('utf8').decode(input);
  const loader = new SVGLoader();
  const data = loader.parse(text);
  const paths = data.paths;

  const group = new Group();

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];

    const fillColor = path.userData.style.fill;
    if (fillColor !== undefined && fillColor !== 'none') {
      const material = new MeshBasicMaterial({
        color: new Color().setStyle(fillColor).convertSRGBToLinear(),
        opacity: path.userData.style.fillOpacity,
        transparent: true,
        side: DoubleSide,
        depthWrite: false,
      });

      const shapes = SVGLoader.createShapes(path);

      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];

        const geometry = new ShapeGeometry(shape);
        const mesh = new Mesh(geometry, material);

        group.add(mesh);
      }
    }

    const strokeColor = path.userData.style.stroke;

    if (strokeColor !== undefined && strokeColor !== 'none') {
      const material = new MeshBasicMaterial({
        color: new Color().setStyle(strokeColor).convertSRGBToLinear(),
        opacity: path.userData.style.strokeOpacity,
        transparent: true,
        side: DoubleSide,
        depthWrite: false,
      });

      for (let j = 0, jl = path.subPaths.length; j < jl; j++) {
        const subPath = path.subPaths[j];

        const geometry = SVGLoader.pointsToStroke(
          subPath.getPoints(),
          path.userData.style
        );

        if (geometry) {
          const mesh = new Mesh(geometry, material);

          group.add(mesh);
        }
      }
    }
  }

  return group;
};

const fromThreejsToGeometry = async (threejs) => {
  if (threejs instanceof Group) {
    const children = [];
    for (const child of threejs.children) {
      const childGeometry = await fromThreejsToGeometry(child);
      if (childGeometry) {
        children.push(childGeometry);
      }
    }
    return taggedGroup({}, ...children);
  } else if (threejs instanceof Mesh) {
    const { geometry, material } = threejs;
    const color = material.color;
    const tags = [toTagFromRgb(color.r, color.g, color.b)];
    const triangles = [];
    if (geometry.index) {
      const p = geometry.attributes.position.array;
      const x = geometry.index.array;
      const pt = (i) => {
        const v = x[i] * 3;
        return [p[v], p[v + 1], p[v + 2]];
      };
      for (let i = 0; i < x.length; i += 3) {
        const points = [pt(i), pt(i + 1), pt(i + 2)];
        triangles.push({ points });
      }
    } else {
      const p = geometry.attributes.position.array;
      for (let i = 0; i < p.length; i += 9) {
        const points = [
          [p[i + 0], p[i + 1], p[i + 2]],
          [p[i + 3], p[i + 4], p[i + 5]],
          [p[i + 6], p[i + 7], p[i + 8]],
        ];
        triangles.push({ points });
      }
    }
    return fromPolygons(triangles, { tags });
  }
};

const toThreejsGeometry = (geometry, supertags) => {
  return geometry;
};

const toThreejsPage = async (
  geometry,
  { view, title = 'JSxCAD Viewer' } = {}
) => {
  const disjointGeometry = toConcreteGeometry(await geometry);
  const html = `
<html>
 <head>
  <title>${title}</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
 </head>
 <body>
  <script type='module'>
    import { dataUrl } from 'https://gitcdn.xyz/cdn/jsxcad/JSxCAD/master/es6/jsxcad-ui-threejs.js';
    import { Shape } from 'https://gitcdn.xyz/cdn/jsxcad/JSxCAD/master/es6/jsxcad-api-v1-shape.js';

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

export { fromColladaToThreejs, fromSvgToThreejs, fromThreejsToGeometry, toThreejsGeometry, toThreejsPage };
