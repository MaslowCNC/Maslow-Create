import { outline, toDisjointGeometry } from './jsxcad-geometry.js';

function sortKD(ids, coords, nodeSize, left, right, depth) {
    if (right - left <= nodeSize) return;

    const m = (left + right) >> 1;

    select(ids, coords, m, left, right, depth % 2);

    sortKD(ids, coords, nodeSize, left, m - 1, depth + 1);
    sortKD(ids, coords, nodeSize, m + 1, right, depth + 1);
}

function select(ids, coords, k, left, right, inc) {

    while (right > left) {
        if (right - left > 600) {
            const n = right - left + 1;
            const m = k - left + 1;
            const z = Math.log(n);
            const s = 0.5 * Math.exp(2 * z / 3);
            const sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
            const newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
            const newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
            select(ids, coords, k, newLeft, newRight, inc);
        }

        const t = coords[2 * k + inc];
        let i = left;
        let j = right;

        swapItem(ids, coords, left, k);
        if (coords[2 * right + inc] > t) swapItem(ids, coords, left, right);

        while (i < j) {
            swapItem(ids, coords, i, j);
            i++;
            j--;
            while (coords[2 * i + inc] < t) i++;
            while (coords[2 * j + inc] > t) j--;
        }

        if (coords[2 * left + inc] === t) swapItem(ids, coords, left, j);
        else {
            j++;
            swapItem(ids, coords, j, right);
        }

        if (j <= k) left = j + 1;
        if (k <= j) right = j - 1;
    }
}

function swapItem(ids, coords, i, j) {
    swap(ids, i, j);
    swap(coords, 2 * i, 2 * j);
    swap(coords, 2 * i + 1, 2 * j + 1);
}

function swap(arr, i, j) {
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

function range(ids, coords, minX, minY, maxX, maxY, nodeSize) {
    const stack = [0, ids.length - 1, 0];
    const result = [];
    let x, y;

    while (stack.length) {
        const axis = stack.pop();
        const right = stack.pop();
        const left = stack.pop();

        if (right - left <= nodeSize) {
            for (let i = left; i <= right; i++) {
                x = coords[2 * i];
                y = coords[2 * i + 1];
                if (x >= minX && x <= maxX && y >= minY && y <= maxY) result.push(ids[i]);
            }
            continue;
        }

        const m = Math.floor((left + right) / 2);

        x = coords[2 * m];
        y = coords[2 * m + 1];

        if (x >= minX && x <= maxX && y >= minY && y <= maxY) result.push(ids[m]);

        const nextAxis = (axis + 1) % 2;

        if (axis === 0 ? minX <= x : minY <= y) {
            stack.push(left);
            stack.push(m - 1);
            stack.push(nextAxis);
        }
        if (axis === 0 ? maxX >= x : maxY >= y) {
            stack.push(m + 1);
            stack.push(right);
            stack.push(nextAxis);
        }
    }

    return result;
}

function within(ids, coords, qx, qy, r, nodeSize) {
    const stack = [0, ids.length - 1, 0];
    const result = [];
    const r2 = r * r;

    while (stack.length) {
        const axis = stack.pop();
        const right = stack.pop();
        const left = stack.pop();

        if (right - left <= nodeSize) {
            for (let i = left; i <= right; i++) {
                if (sqDist(coords[2 * i], coords[2 * i + 1], qx, qy) <= r2) result.push(ids[i]);
            }
            continue;
        }

        const m = Math.floor((left + right) / 2);

        const x = coords[2 * m];
        const y = coords[2 * m + 1];

        if (sqDist(x, y, qx, qy) <= r2) result.push(ids[m]);

        const nextAxis = (axis + 1) % 2;

        if (axis === 0 ? qx - r <= x : qy - r <= y) {
            stack.push(left);
            stack.push(m - 1);
            stack.push(nextAxis);
        }
        if (axis === 0 ? qx + r >= x : qy + r >= y) {
            stack.push(m + 1);
            stack.push(right);
            stack.push(nextAxis);
        }
    }

    return result;
}

function sqDist(ax, ay, bx, by) {
    const dx = ax - bx;
    const dy = ay - by;
    return dx * dx + dy * dy;
}

const defaultGetX = p => p[0];
const defaultGetY = p => p[1];

class KDBush {
    constructor(points, getX = defaultGetX, getY = defaultGetY, nodeSize = 64, ArrayType = Float64Array) {
        this.nodeSize = nodeSize;
        this.points = points;

        const IndexArrayType = points.length < 65536 ? Uint16Array : Uint32Array;

        const ids = this.ids = new IndexArrayType(points.length);
        const coords = this.coords = new ArrayType(points.length * 2);

        for (let i = 0; i < points.length; i++) {
            ids[i] = i;
            coords[2 * i] = getX(points[i]);
            coords[2 * i + 1] = getY(points[i]);
        }

        sortKD(ids, coords, nodeSize, 0, ids.length - 1, 0);
    }

    range(minX, minY, maxX, maxY) {
        return range(this.ids, this.coords, minX, minY, maxX, maxY, this.nodeSize);
    }

    within(x, y, r) {
        return within(this.ids, this.coords, x, y, r, this.nodeSize);
    }
}

const TOOL_TYPES = ['dynamicLaser', 'constantLaser', 'plotter', 'spindle'];

const X = 0;
const Y = 1;
const Z = 2;

/*

We support grbl tools at the moment, which have the following structure:

{
  jumpZ // a height that is safe for lateral rapid movement.
  cutSpeed // the spindle speed to use when cutting
  feedRate // the rate to advance the tool while cutting
  type // 'dynamicLaser', 'constantLaser', 'plotter', 'spindle'
}

*/

// FIX: This is actually GRBL.
const toGcode = async (
  geometry,
  tool,
  { definitions, doPlan = true } = {}
) => {
  if (!tool) {
    throw Error('Tool not defined: Expected { grbl: {} }');
  }
  if (!tool.grbl) {
    throw Error('Non GRBL tool not supported: Expected { grbl: {} }');
  }
  if (!TOOL_TYPES.includes(tool.grbl.type)) {
    throw Error(
      `Tool type ${
        tool.grbl.type
      } not supported: Expected { grbl: { type: [${TOOL_TYPES.join(', ')}] } }`
    );
  }
  if (!tool.grbl.feedRate) {
    throw Error(
      `Tool feedRate not defined: Expected { grbl: { feedRate: <integer> } }`
    );
  }

  // const topZ = 0;
  const codes = [];

  // CHECK: Perhaps this should be a more direct modeling of the GRBL state?
  const state = {
    // Where is the tool
    x: 0,
    y: 0,
    z: 0,
    // How 'fast' the tool is running (rpm or power).
    s: 0,
    f: 0,
  };

  const emit = (code) => codes.push(code);

  const value = (v) => {
    let s = v.toFixed(3);
    // This could be more efficient.
    while (s.includes('.') && (s.endsWith('0') || s.endsWith('.'))) {
      s = s.substring(0, s.length - 1);
    }
    return s;
  };

  const pX = (x = state.x) => {
    if (x !== state.x) {
      return ` X${value(x)}`;
    } else {
      return '';
    }
  };

  const pY = (y = state.y) => {
    if (y !== state.y) {
      return ` Y${value(y)}`;
    } else {
      return '';
    }
  };

  const pZ = (z = state.z) => {
    if (z !== state.z) {
      return ` Z${value(z)}`;
    } else {
      return '';
    }
  };

  // Rapid Linear Motion
  const cG0 = ({
    x = state.x,
    y = state.y,
    z = state.z,
    f = state.f,
    s = state.s,
  } = {}) => {
    const code = `G0${pX(x)}${pY(y)}${pZ(z)}`;
    if (code === 'G0') {
      return;
    }
    emit(code);
    state.x = x;
    state.y = y;
    state.z = z;
  };

  // Cut
  const cG1 = ({
    x = state.x,
    y = state.y,
    z = state.z,
    f = state.f,
    s = state.s,
  } = {}) => {
    const code = `G1${pX(x)}${pY(y)}${pZ(z)}`;
    if (code === 'G1') {
      return;
    }
    emit(code);
    state.x = x;
    state.y = y;
    state.z = z;
  };

  const cS = ({ s = state.s } = {}) => {
    if (s !== state.s) {
      emit(`S${value(s)}`);
      state.s = s;
    }
  };

  const cF = ({ f = state.f } = {}) => {
    if (f !== state.f) {
      emit(`F${value(f)}`);
      state.f = f;
    }
  };

  /*
  // Pause
  const cPause = () => {
    emit('M0');
  };
*/

  const cut = ({ x, y, z }) => {
    cG1({ x, y, z });
  };

  // Rapidly lift tool to a clear height and move to the x, y coordinate.
  const jump = ({ x, y }) => {
    if (x === state.x && y === state.y) {
      return;
    }
    cG0({ z: state.tool.jumpZ });
    cG0({ x, y });
  };

  const stop = () => {
    if (state.m !== 5 && state.tool.cutSpeed) {
      emit('M5');
      state.m = 5;
    }
  };

  const start = () => {
    if (state.m !== 3 && state.tool.cutSpeed) {
      emit('M3');
      state.m = 3;
    }
  };

  const park = () => {
    jump({ x: 0, y: 0 });
    stop();
  };

  const useMetric = () => emit('G21');

  useMetric();

  const computeDistance = ([x, y, z]) => {
    const dX = x - state.x;
    const dY = y - state.y;
    const cost = Math.sqrt(dX * dX + dY * dY) - z * 1000000;
    return cost;
  };

  state.tool = tool.grbl;

  cF({ f: state.tool.feedRate });
  cS({ s: state.tool.cutSpeed });
  start();

  {
    const seen = new Set();
    let pendingEdges = 0;
    const points = [];
    for (const { segments } of outline(toDisjointGeometry(geometry))) {
      for (const edge of segments) {
        // CHECK: Do outline segments have duplicates still?
        // Deduplicate edges.
        {
          const forward = JSON.stringify(edge);
          if (seen.has(forward)) {
            continue;
          } else {
            seen.add(forward);
          }
          const backward = JSON.stringify([...edge].reverse());
          if (seen.has(backward)) {
            continue;
          } else {
            seen.add(backward);
          }
        }
        points.push([edge[0], edge]);
        points.push([edge[1], edge]);
        pendingEdges += 1;
      }
    }

    const kd = new KDBush(
      points,
      (p) => p[0][0],
      (p) => p[0][1]
    );

    while (pendingEdges > 0) {
      const { x, y } = state;
      for (let range = 1; range < Infinity; range *= 2) {
        let bestStart;
        let bestEdge;
        let bestDistance = Infinity;
        for (const index of kd.within(x, y, range)) {
          const [start, edge] = points[index];
          if (edge.planned) {
            continue;
          }
          const distance = computeDistance(start);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestEdge = edge;
            bestStart = start;
          }
        }
        if (bestDistance === Infinity) {
          continue;
        }
        pendingEdges -= 1;
        bestEdge.planned = true;
        const bestEnd = bestEdge[0] === bestStart ? bestEdge[1] : bestEdge[0];
        jump({ x: bestStart[X], y: bestStart[Y] }); // jump to the start x, y
        cut({ x: bestStart[X], y: bestStart[Y], z: bestStart[Z] }); // may need to drill down to the start z
        cut({ x: bestEnd[X], y: bestEnd[Y], z: bestEnd[Z] }); // cut across
        break;
      }
    }
  }

  park();

  codes.push('');
  return new TextEncoder('utf8').encode(codes.join('\n'));
};

export { toGcode };
