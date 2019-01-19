const argen = (level, n, filler) => {
  if (level == 1)
    return new Array(n).fill().map(filler);

  return new Array(n).fill().map(() => argen(level - 1, n, filler));
};

const getN = n => n | 0;

const sum_around = (arr, level, point) => {
  const axis = point[0];

  if (level == 1) {
    return getN(arr[axis])
      + getN(arr[axis - 1])
      + getN(arr[axis + 1]);
  }

  const neighbor1 = arr[axis - 1] ?
    sum_around(arr[axis - 1], level - 1, point.slice(1))
    : 0;

  const neighbor2 = arr[axis + 1] ?
    sum_around(arr[axis + 1], level - 1, point.slice(1))
    : 0;

  return sum_around(arr[axis], level - 1, point.slice(1))
    + neighbor1
    + neighbor2;
};

const rule = (value, environment) => {
  if (value)
    return Number(environment == 2 || environment == 3);

  return Number(environment == 3)
};

const step = arr => {
  return arr.map((column, x) => {
    return column.map((value, y) => {
      const environment = sum_around(arr, dimension, [x, y]) - value;

      return rule(value, environment);
    });
  });
};

const zeroToOne = () => Math.round(Math.random());

const dimension = 2;
const side = 100;
const canvas_side = 500;

const world = argen(dimension, side, zeroToOne);

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('world');

  canvas.width = canvas_side;
  canvas.height = canvas_side;

  const ctx = canvas.getContext('2d');

  const worker = arr => {
    const imageData = ctx.getImageData(0, 0, canvas_side, canvas_side);
    const data = imageData.data;

    const data_side = canvas_side * 4;
    const cell_side = canvas_side / side;

    arr.forEach((column, x) => {
      const x1 = x * cell_side * 4;
      const x2 = x1 + (cell_side - 1) * 4;

      column.forEach((value, y) => {
        const y1 = y * data_side * cell_side;
        const y2 = y1 + (cell_side - 1) * data_side;

        const channel = (1 - value) * 255;

        for (let i = y1; i < y2; i += data_side)
          for (let j = x1; j < x2; j += 4) {
            const index = i + j;

            data[index] = channel;
            data[index + 1] = channel;
            data[index + 2] = channel;
            data[index + 3] = 255;
          }
      });
    });

    ctx.putImageData(imageData, 0, 0);

    const next_step = step(arr);

    setTimeout(() => worker(next_step), 500);
  };

  worker(world);
});
