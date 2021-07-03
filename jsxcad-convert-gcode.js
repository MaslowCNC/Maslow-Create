import { outline, toDisjointGeometry, getPathEdges } from './jsxcad-geometry.js';

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

const X = 0;
const Y = 1;
const Z = 2;

// FIX: This is actually GRBL.
const toGcode = async (
  geometry,
  tool,
  { definitions, doPlan = true } = {}
) => {
  // const topZ = 0;
  const codes = [];
  const _ = undefined;

  // CHECK: Perhaps this should be a more direct modeling of the GRBL state?
  const state = {
    // Where is the tool
    position: [0, 0, 0],
    // How 'fast' the tool is running (rpm or power).
    speed: undefined,
    laserMode: false,
    jumped: false,
  };

  const emit = (code) => codes.push(code);

  // Runs each axis at maximum velocity until matches, so may make dog-legs.
  const rapid = (
    x = state.position[X],
    y = state.position[Y],
    z = state.position[Z],
    f = state.tool.feedRate
  ) => {
    if (
      x === state.position[X] &&
      y === state.position[Y] &&
      z === state.position[Z]
    ) {
      return;
    }
    emit(`G0 X${x.toFixed(3)} Y${y.toFixed(3)} Z${z.toFixed(3)}`);
    state.position = [x, y, z];
  };

  // Straight motion at set speed.
  const cut = (
    x = state.position[X],
    y = state.position[Y],
    z = state.position[Z],
    f = state.tool.feedRate,
    d = state.tool.drillRate || state.tool.feedRate,
    s = state.tool.cutSpeed
  ) => {
    if (state.jumped && state.tool.warmupDuration) {
      // CHECK: Will we need this on every jump?
      setSpeed(state.tool.warmupSpeed);
      emit(`G1 F1`);
      emit(`G4 P${state.tool.warmupDuration.toFixed(3)}`);
    }
    state.jumped = false;
    setSpeed(s);
    if (
      x === state.position[X] &&
      y === state.position[Y] &&
      z === state.position[Z]
    ) {
      return;
    }
    if (z !== state.position[Z]) {
      // Use drillRate instead of feedRate.
      f = d;
    }
    emit(
      `G1 X${x.toFixed(3)} Y${y.toFixed(3)} Z${z.toFixed(3)} F${f.toFixed(3)}`
    );
    state.position = [x, y, z];
  };

  const setSpeed = (value) => {
    if (state.speed !== value) {
      if (Math.sign(state.speed || 0) !== Math.sign(value)) {
        if (value === 0) {
          emit('M5');
        } else if (value < 0) {
          // Reverse
          emit('M4');
        } else {
          // Forward
          emit('M3');
        }
      }
      emit(`S${Math.abs(value).toFixed(3)}`);
      state.speed = value;
    }
  };

  const toolChange = (tool) => {
    if (state.tool && state.tool.type !== tool.type) {
      throw Error(
        `Unsupported tool type change: ${state.tool.type} to ${tool.type}`
      );
    }
    if (state.tool && state.tool.diameter !== tool.diameter) {
      throw Error(
        `Unsupported tool diameter change: ${state.tool.diameter} to ${tool.diameter}`
      );
    }
    // Accept tool change.
    state.tool = tool;
    switch (state.tool.type) {
      case 'dynamicLaser':
      case 'constantLaser':
      case 'plotter':
      case 'spindle':
        break;
      default:
        throw Error(`Unknown tool: ${state.tool.type}`);
    }
  };

  const stop = () => {
    emit('M5');
  };

  /*
  const pause = () => {
    emit('M0');
  };

  const dwell = (seconds) => {
    emit(`G4 P${seconds * 1000}`);
  };
  */

  const jump = (x, y) => {
    if (x === state.position[X] && y === state.position[Y]) {
      // Already there.
      return;
    }

    const speed = state.tool.jumpSpeed || 0;
    const jumpRate = state.tool.jumpRate || state.tool.feedRate;
    if (speed !== 0) {
      // For some tools (some lasers) it is better to keep the beam on (at reduced power)
      // while jumping.
      setSpeed(speed);
      cut(_, _, state.tool.jumpZ, jumpRate, speed); // up
      cut(x, y, _, jumpRate, speed); // across
      // cut(_, _, topZ, jumpRate, speed); // down
    } else {
      rapid(_, _, state.tool.jumpZ); // up
      rapid(x, y, _); // across
      // rapid(_, _, topZ); // down
      state.jumped = true;
    }
  };

  const park = () => {
    jump(0, 0);
    stop();
  };

  const useMetric = () => emit('G21');

  useMetric();

  const computeDistance = ([x, y, z]) => {
    const dX = x - state.position[X];
    const dY = y - state.position[Y];
    const cost = Math.sqrt(dX * dX + dY * dY) - z * 1000000;
    return cost;
  };

  toolChange(tool.grbl);

  {
    const seen = new Set();
    let pendingEdges = 0;
    const points = [];
    for (const { paths } of outline(toDisjointGeometry(geometry))) {
      for (const path of paths) {
        for (const edge of getPathEdges(path)) {
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
    }

    const kd = new KDBush(
      points,
      (p) => p[0][0],
      (p) => p[0][1]
    );

    while (pendingEdges > 0) {
      const [x, y] = state.position;
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
        jump(...bestStart); // jump to the start x, y
        cut(...bestStart); // may need to drill down to the start z
        cut(...bestEnd); // cut across
        break;
      }
    }
  }

  /*
  // FIX: Should handle points as well as paths.
  for (const { paths } of outline(toDisjointGeometry(geometry))) {
    toolChange(tool.grbl);
    if (doPlan) {
      const todo = new Set();
      for (const path of paths) {
        for (let [start, end] of getEdges(path)) {
          todo.add([start, end]);
        }
      }
      while (todo.size > 0) {
        // Find the cheapest segment to cut.
        const costs = [...todo].map(computeCost).sort();
        const [, start, end, entry] = costs[0];
        todo.delete(entry);
        jump(...start); // jump to the start x, y
        cut(...start); // may need to drill down to the start z
        cut(...end); // cut across
      }
    } else {
      for (const [start, end] of paths) {
        jump(...start); // jump to the start x, y
        cut(...start); // may need to drill down to the start z
        cut(...end); // cut across
      }
    }
  }
*/

  park();

  codes.push('');
  return new TextEncoder('utf8').encode(codes.join('\n'));
};

export { toGcode };
