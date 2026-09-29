import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, isMaskable = false) {
  // RGBA buffer
  const rowSize = width * 4;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      
      // Coordinate normalized
      const nx = x / width;
      const ny = y / height;

      // Dark slate background: #0f172a
      let r = 15;
      let g = 23;
      let b = 42;
      let a = 255;

      // Inner gradient
      const distFromCenter = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2);
      if (distFromCenter < 0.45) {
        // Gradient from rose-600 (244, 63, 94) to amber-500 (245, 158, 11)
        const blend = nx;
        r = Math.round(244 * (1 - blend) + 245 * blend);
        g = Math.round(63 * (1 - blend) + 158 * blend);
        b = Math.round(94 * (1 - blend) + 11 * blend);
      }

      // Piano keys pattern in center
      if (ny > 0.45 && ny < 0.75 && nx > 0.2 && nx < 0.8) {
        const keyIndex = Math.floor((nx - 0.2) / 0.075);
        const inKey = ((nx - 0.2) % 0.075) < 0.065;
        if (inKey) {
          // White key
          r = 255;
          g = 255;
          b = 255;
          // Black keys overlay
          if (ny < 0.62 && [1, 2, 4, 5, 6].includes(keyIndex)) {
            const isBlackKey = ((nx - 0.2) % 0.075) > 0.045 || ((nx - 0.2) % 0.075) < 0.02;
            if (isBlackKey) {
              r = 15;
              g = 23;
              b = 42;
            }
          }
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // PNG structure
  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(6, 9); // color type (6 = RGBA)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = calculateCRC(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

// CRC32 implementation
function calculateCRC(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      if ((crc ^ byte) & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
      byte = byte >>> 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, true));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180));
console.log('PWA PNG Icons generated successfully!');
