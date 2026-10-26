// Decode a PNG screenshot (8-bit RGB/RGBA, non-interlaced) and report region
// colour statistics. Used to verify that the WebGL hero actually renders a lit
// specimen rather than an empty transparent canvas.
import fs from 'node:fs';
import zlib from 'node:zlib';

const file = process.argv[2];
const buf = fs.readFileSync(file);

if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');

let pos = 8;
let width = 0;
let height = 0;
let bitDepth = 0;
let colorType = 0;
const idat = [];

while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString('ascii', pos + 4, pos + 8);
  const data = buf.subarray(pos + 8, pos + 8 + len);

  if (type === 'IHDR') {
    width = data.readUInt32BE(0);
    height = data.readUInt32BE(4);
    bitDepth = data[8];
    colorType = data[9];
    if (data[12] !== 0) throw new Error('interlaced PNG unsupported');
  } else if (type === 'IDAT') {
    idat.push(data);
  } else if (type === 'IEND') {
    break;
  }
  pos += 12 + len;
}

if (bitDepth !== 8) throw new Error(`unsupported bit depth ${bitDepth}`);

const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
if (!channels) throw new Error(`unsupported colour type ${colorType}`);

const raw = zlib.inflateSync(Buffer.concat(idat));
const stride = width * channels;
const out = Buffer.alloc(height * stride);

const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

let rp = 0;
for (let y = 0; y < height; y += 1) {
  const filter = raw[rp];
  rp += 1;
  const rowStart = y * stride;
  const prevStart = (y - 1) * stride;

  for (let x = 0; x < stride; x += 1) {
    const cur = raw[rp + x];
    const a = x >= channels ? out[rowStart + x - channels] : 0;
    const b = y > 0 ? out[prevStart + x] : 0;
    const c = x >= channels && y > 0 ? out[prevStart + x - channels] : 0;

    let value;
    switch (filter) {
      case 0:
        value = cur;
        break;
      case 1:
        value = (cur + a) & 0xff;
        break;
      case 2:
        value = (cur + b) & 0xff;
        break;
      case 3:
        value = (cur + ((a + b) >> 1)) & 0xff;
        break;
      case 4:
        value = (cur + paeth(a, b, c)) & 0xff;
        break;
      default:
        throw new Error(`unknown filter ${filter}`);
    }
    out[rowStart + x] = value;
  }
  rp += stride;
}

// Sample a region and report luminance distribution + distinct hue families.
const [rx, ry, rw, rh] = process.argv.slice(3).map(Number);
const x0 = Math.max(0, rx ?? 0);
const y0 = Math.max(0, ry ?? 0);
const x1 = Math.min(width, x0 + (rw ?? width));
const y1 = Math.min(height, y0 + (rh ?? height));

let n = 0;
let sum = 0;
let min = 255;
let max = 0;
const buckets = new Array(8).fill(0);
const hues = { neutral: 0, warm: 0, cool: 0 };

for (let y = y0; y < y1; y += 1) {
  for (let x = x0; x < x1; x += 1) {
    const i = y * stride + x * channels;
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    n += 1;
    sum += lum;
    if (lum < min) min = lum;
    if (lum > max) max = lum;
    buckets[Math.min(7, Math.floor(lum / 32))] += 1;

    const mx = Math.max(r, g, b);
    const mn = Math.min(r, g, b);
    if (mx - mn < 12) hues.neutral += 1;
    else if (r >= b) hues.warm += 1;
    else hues.cool += 1;
  }
}

const pct = (v) => `${((v / n) * 100).toFixed(1)}%`;

console.log(
  JSON.stringify(
    {
      size: [width, height],
      region: [x0, y0, x1 - x0, y1 - y0],
      pixels: n,
      meanLuminance: +(sum / n).toFixed(1),
      minLum: +min.toFixed(1),
      maxLum: +max.toFixed(1),
      histogram: buckets.map(pct),
      tones: { neutral: pct(hues.neutral), warm: pct(hues.warm), cool: pct(hues.cool) },
    },
    null,
    2
  )
);
