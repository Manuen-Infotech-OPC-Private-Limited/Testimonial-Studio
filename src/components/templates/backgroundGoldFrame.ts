import { adjustBrightness, generateMetallicStops, sanitizeHexColor } from '../../utils/colorUtils';

/**
 * Page background, 1024 x 1536: white sheet with a thin gold frame, brown
 * swooshes (top-left corner and bottom sweep) and gold ribbons along their
 * edges. The bottom brown area has a soft red-brown radial highlight.
 *
 * Supports dynamic color customization while maintaining exact default styling.
 */

export const BACKGROUND_WIDTH = 1024;
export const BACKGROUND_HEIGHT = 1536;
export const BACKGROUND_COLOR = '#FDFDFD';

interface GradientDef {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stops: [offset: string, color: string][];
}

const GRADIENTS: GradientDef[] = [
  { id: 'goldTL', x1: 0, y1: 100, x2: 185, y2: 0, stops: [['0.000', '#DB9F2F'], ['0.050', '#DB9F2F'], ['0.150', '#E0A639'], ['0.250', '#EDBD4F'], ['0.350', '#F7CF67'], ['0.450', '#F8D270'], ['0.550', '#F2C558'], ['0.650', '#EDBA43'], ['0.750', '#EAB43C'], ['0.850', '#E1AA30'], ['0.950', '#DD9D2A'], ['1.000', '#DD9D2A']] },
  { id: 'coreTL', x1: 0, y1: 100, x2: 185, y2: 0, stops: [['0.000', '#DEA433'], ['0.050', '#DEA433'], ['0.150', '#EAB749'], ['0.250', '#F5C65E'], ['0.350', '#FCD571'], ['0.450', '#FDD878'], ['0.550', '#FBCE62'], ['0.650', '#F4C050'], ['0.750', '#F0B943'], ['0.850', '#EDAF35'], ['0.950', '#E8A937'], ['1.000', '#E8A937']] },
  { id: 'goldBot', x1: 0, y1: 1305, x2: 1024, y2: 1505, stops: [['0.000', '#CF9126'], ['0.025', '#CF9126'], ['0.075', '#D5992A'], ['0.125', '#E4AB38'], ['0.175', '#F0BB48'], ['0.225', '#FACE63'], ['0.275', '#FCDC81'], ['0.325', '#F9D06A'], ['0.375', '#F0BE52'], ['0.425', '#E4AF3F'], ['0.475', '#DBA12F'], ['0.525', '#E1A839'], ['0.575', '#EDBC4D'], ['0.625', '#F6CB63'], ['0.675', '#FADA7B'], ['0.725', '#F9CF66'], ['0.775', '#F3C24D'], ['0.825', '#E6B03E'], ['0.875', '#D9A12F'], ['0.925', '#D19728'], ['0.975', '#D29A26'], ['1.000', '#D29A26']] },
  { id: 'coreBot', x1: 0, y1: 1305, x2: 1024, y2: 1505, stops: [['0.000', '#D19328'], ['0.025', '#D19328'], ['0.075', '#DA9C2C'], ['0.125', '#E8B03D'], ['0.175', '#F4C04C'], ['0.225', '#FDD56D'], ['0.275', '#FEDF85'], ['0.325', '#FCD573'], ['0.375', '#F5C457'], ['0.425', '#E9B443'], ['0.475', '#DFA531'], ['0.525', '#E7B13E'], ['0.575', '#F2C153'], ['0.625', '#FAD068'], ['0.675', '#FDDC7D'], ['0.725', '#FCD36B'], ['0.775', '#F7C652'], ['0.825', '#EAB642'], ['0.875', '#DDA531'], ['0.925', '#D49A2A'], ['0.975', '#D49C2B'], ['1.000', '#D49C2B']] },
  { id: 'brownTL', x1: 0, y1: 0, x2: 180, y2: 0, stops: [['0.000', '#612D04'], ['0.083', '#612D04'], ['0.250', '#662F05'], ['0.417', '#6D3305'], ['0.583', '#6F3203'], ['0.750', '#6C3006'], ['1.000', '#6C3006']] },
  { id: 'brownBottom', x1: 0, y1: 0, x2: 1024, y2: 0, stops: [['0.000', '#5D2305'], ['0.000', '#5D2305'], ['0.250', '#9B3100'], ['0.500', '#762803'], ['0.750', '#722603'], ['1.000', '#4F1F02'], ['1.000', '#4F1F02']] },
];

// Brown shapes (top-left corner and bottom sweep). Painted under the gold ribbons.
const BROWN_SHAPE =
  'M6 80.1 4.7 79 4.4 63 4.5 7 5 5.2 6 4.5 110 4.2 120 4.6 137 4.2 150 4.4 151.8 5 150 6.5 129 13.9 109 22 89 30.9 69 40.9 56 47.8 39 58 20.7 70 12 76.5ZM1008 1527.1 290 1526.7 8 1527.3 7 1527.1 5.9 1526 5.6 1521 6 1507 6.1 1339 7 1337.4 8 1337.4 13 1340 15 1339.6 17.9 1340 17.2 1342 17.9 1343 23.9 1347 35.6 1353 39 1354.2 46.6 1359 74.5 1373 107.6 1388 124.2 1395 148 1404.2 191 1419.3 243 1435.2 277 1444.3 327 1456.2 382 1467.2 445.2 1478 517 1488.2 550 1492.2 586 1496.2 651 1502.2 688 1505.1 739 1508.2 810 1511 867 1512 900 1512 946 1511 974.8 1510 978 1509.4 995.4 1509 1007.8 1508 1009 1506.2 1011.8 1505 1013.6 1503 1013 1501.4 1011 1502.5 1009 1502.5 1006 1504.4 1004 1504.3 1002 1502.8 992.5 1502 997 1501.8 998.9 1501 1015 1500.6 1015.4 1501 1015.4 1504 1016 1508 1017.1 1510 1017.1 1526 1016 1526.9Z';

// Gold ribbons.
const GOLD_SHAPE =
  'M7 299.2 4 299.5 3.5 299 3.5 4 4 3.5 319 3.5 319.5 4 319.5 6 319 6.6 185 6.6 177 7 156.4 14 135.4 22 104.3 36 81 48.1 74.1 52 51 66.8 29 82.7 8 100 7.5 101 7.3 104ZM7 79 20 69.9 42 55.6 59 45.7 72 38.9 93 28.5 113 19.8 128 13.7 149.6 6 149 5.3 148 5.1 137 4.9 121 5.3 6 5.3 5.4 6 5.3 7 5.3 78 6 79.4ZM1020 1525.5 1017 1525.4 1016.6 1525 1016.6 1510 1015 1508.6 989 1510.2 956 1511.3 913 1512.4 872 1512.5 811 1511.5 780 1510.5 717 1507.4 637 1501.5 585 1496.6 547 1492.4 483 1484.2 444 1478.4 400 1471.2 326 1456.6 299 1450.4 245 1436.4 205 1424.5 190 1419.6 147 1404.5 124 1395.5 98 1384.4 78 1375.3 55 1364.1 23 1347.3 12 1340.6 8 1338.5 7 1338.5 6.5 1340 6.4 1525 4 1525.5 3.5 1525 3.5 1524 3.5 1251 4 1250.5 7.2 1251 7 1297 7.2 1302 7.6 1303 38.3 1323 69 1341 102.7 1359 127.7 1371 164.2 1387 187 1395.8 194.3 1399 213 1405.6 222 1409.3 267 1424.3 281 1428.1 289.7 1431 304 1434.9 308 1435.6 319.2 1439 360.1 1449 426 1462.3 490 1473.1 560 1482.4 624 1489.1 668 1493 730 1497.2 819 1501 900 1501.8 958 1501.2 1012 1499.2 1015.8 1498 1016.2 1478 1016.2 1251 1017 1250.5 1020 1250.4 1020.6 1251 1020.6 1488 1020.5 1525Z';

// Brighter center highlight of the gold ribbons.
const GOLD_CORE_SHAPE =
  'M8 96 7 96.5 6.6 95 6.6 84 7 82.6 19 74.9 21 73 28 68.6 30 66.6 34 64.5 41 59.6 58 49.3 67 44.8 71 42 89 32.9 91 32.4 109 23.6 121 19.2 126 16.4 150 8.2 152 5.6 185 4.8 318.1 5 176 5.3 173.2 7 167 8.1 153 12.8 150 14.4 145 15.8 139 18.6 137 19 127 23.6 123 24.8 98 36.6 88 41.6 86 43.2 77 47.4 75 49 69 51.9 56 60.7 52 62.6 47 66.5 39 71.5 36 74.4 28 79.3 25 82 23 83.1 19 87 13 91.1ZM6 298.2 5 298.2 4.8 297 5 104.7 6 104.7 6.2 110ZM5 1298.3 4.8 1252 6 1251.8 6.2 1293 6 1294.7 5.1 1296ZM1019 1492.4 1018 1492.4 1017.8 1487 1018 1251.8 1019 1251.8 1019.2 1253ZM929 1510.3 841 1510.5 838 1509.5 828 1509.8 825 1509.5 800 1509.5 797 1508.5 773 1508.5 770 1507.5 750 1507.5 747 1506.5 732 1506.5 729 1505.5 715 1505.5 712 1504.5 700 1504.5 697 1503.5 686 1503.5 683 1502.5 671 1502.5 668 1501.5 659 1501.5 656 1500.5 647 1500.5 644 1499.5 636 1499.5 633 1498.5 625 1498.5 622 1497.5 614 1497.5 611 1496.5 604 1496.5 601 1495.5 593 1495.5 590 1494.5 583 1494.3 581 1493.5 574 1493.5 571 1492.5 565 1492.5 562 1491.5 556 1491.5 553 1490.5 547 1490.5 544 1489.5 538 1489.5 535 1488.5 530 1488.5 527 1487.5 522 1487.5 519 1486.5 514 1486.5 511 1485.5 506 1485.3 504 1484.5 500 1484.5 497 1483.5 492 1483.3 490 1482.5 485 1482.4 482 1481.5 478 1481.4 475 1480.5 471 1480.3 469 1479.5 465 1479.3 462 1478.4 458 1478.3 455 1477.2 451 1477.2 448 1476.2 444 1476.2 441 1475.2 438 1475.2 435 1474.2 432 1474.2 429 1473.1 426 1473 423 1472.1 420 1472 418 1471.3 414 1471 411 1470.1 408 1470 405 1469.1 402 1469 394 1467.1 391 1467 389 1466.2 381 1465 379 1464.2 376 1463.9 373.2 1463 370 1462.9 368 1462.2 365 1461.9 359 1460.2 351 1458.8 349 1458 346 1457.8 339 1455.8 326 1453.6 316 1450.7 313 1450.5 293 1445.5 291 1444.6 288 1444.4 283 1442.6 277 1441.4 275 1440.4 257 1436.1 242 1431.2 236 1430 225 1425.9 216 1423.7 199 1417.8 197 1417.6 185 1413.4 179 1410.8 159 1404.2 148 1399.5 143 1398 130 1392.4 125 1390.8 120 1388.3 104 1381.6 86 1372.9 82 1371.4 61.7 1361 56 1358.6 53.9 1357 44 1352 41 1349.9 37 1348.3 35 1346.8 24 1341.3 19 1337.6 9.8 1333 9.2 1332 9.2 1318 7.3 1309 7.6 1308 8 1307.9 9.7 1309 15 1314.7 19.4 1318 42 1332.2 54 1338.5 59 1342 64 1344.4 66.3 1346 88 1357.1 90.9 1359 96 1361.1 98.9 1363 107 1366.8 109 1367.4 113 1369.8 128 1376.2 139 1381.6 141 1382 160 1390.3 165 1391.8 180 1398.2 185 1399.6 190 1402 200 1405.4 203.3 1407 217 1411.3 221 1413.1 235 1417.4 244 1420.8 250 1422.7 252 1422.9 272 1429.6 278 1430.6 289 1434.4 295 1435.5 300 1437.3 304 1438.3 307 1438.5 315 1441.3 325 1443.4 339 1447.2 346 1448.2 356 1451 363 1452.1 366 1453 368 1453.1 370.8 1454 373 1454.1 378 1455.8 382 1456 388 1457.8 392 1458 398 1459.7 402 1460 404 1460.7 412 1462 415 1462.9 417 1463 420 1463.9 422 1464 425 1464.9 427 1465 430 1465.9 433 1465.8 441 1467.8 445 1467.8 453 1469.8 456 1469.7 459 1470.6 463 1470.9 465 1471.6 469 1471.6 477 1473.5 481 1473.6 484 1474.5 488 1474.7 490 1475.5 495 1475.5 498 1476.5 502 1476.7 504 1477.5 509 1477.5 512 1478.5 517 1478.7 519 1479.5 524 1479.5 527 1480.5 531 1480.5 534 1481.5 539 1481.7 541 1482.5 546 1482.5 549 1483.5 555 1483.5 558 1484.5 564 1484.7 566 1485.5 573 1485.5 576 1486.5 582 1486.7 584 1487.5 591 1487.5 594 1488.5 601 1488.5 604 1489.5 612 1489.5 615 1490.5 622 1490.7 624 1491.5 633 1491.5 636 1492.5 643 1492.5 646 1493.5 656 1493.5 659 1494.5 666 1494.7 668 1495.5 679 1495.5 682 1496.5 692 1496.5 695 1497.5 709 1497.5 712 1498.5 724 1498.5 727 1499.5 746 1499.5 749 1500.5 764 1500.5 767 1501.5 791 1501.5 794 1502.5 816 1502.5 820 1503.5 829 1503.2 833 1503.5 936 1503.5 942 1503.1 960 1503.4 963 1502.5 989 1502.1 992 1501.2 1013 1501.1 1016 1499.9 1018 1497.8 1018.8 1499 1018.8 1508 1018 1509.2 1016 1507.1 1011 1506.9 1007 1507.9 992 1507.9 989 1508.8 967 1508.6 964 1509.5 942 1509.9 932 1509.5ZM1019 1524.2 1017.8 1524 1017.8 1522 1018 1515 1019 1514.6Z';

// Radial highlight on the bottom brown area (elliptical, [offset, opacity]).
const HIGHLIGHT = {
  cx: 306.6,
  cy: 1506.7,
  rx: 250.7,
  ry: 428.6,
  color: '#95391C',
  stops: [['0.0000', '1.000'], ['0.0833', '0.678'], ['0.1667', '0.201'], ['0.2500', '0.146'], ['0.3333', '0.036'], ['0.4667', '0.036'], ['1.0000', '0.000']] as [string, string][],
};

// Gold frame: [x, y, width, height, color].
const FRAME: [number, number, number, number, string][] = [
  [0, 0, 1024, 6.75, '#DF9C2C'],
  [0, 1527, 1024, 9, '#E3A429'],
  [0, 0, 6.75, 1536, '#E09C23'],
  [1017.4, 0, 6.6, 1536, '#E4A027'],
];

// Faint cream line just inside the frame (left, top and right).
const CREAM: [number, number, number, number, string][] = [
  [6.75, 6.5, 1.25, 1520.5, '#FFF6C8'],
  [8, 6.5, 1, 1520.6, '#FFFCE9'],
  [6.75, 6.75, 1010.5, 1.25, '#FFFCE7'],
  [6.75, 8, 1010.5, 1, '#FFFAF7'],
  [1016, 6.5, 1.4, 1520.5, '#FFFDE0'],
  [1015, 6.5, 1, 1520.6, '#FFFCF1'],
];

// Each clip zone paints only its own part of the artwork.
const ZONES: Record<string, string> = {
  TL: '<rect x="0" y="0" width="320" height="200"/>',
  Bot: '<rect x="0" y="1250" width="1024" height="286"/>',
};

const gradientMarkup = (g: GradientDef): string =>
  `<linearGradient id="${g.id}" gradientUnits="userSpaceOnUse" x1="${g.x1}" y1="${g.y1}" x2="${g.x2}" y2="${g.y2}">` +
  g.stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('') +
  `</linearGradient>`;

const clipMarkup = (): string =>
  Object.entries(ZONES)
    .map(([k, shape]) => `<clipPath id="clip${k}">${shape}</clipPath>`)
    .join('');

const rects = (list: [number, number, number, number, string][]): string =>
  list
    .map(([x, y, w, h, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`)
    .join('');

/** Returns the complete background as an SVG string. */
export function getBackgroundSvg(options?: {
  primaryColor?: string;
  goldColor?: string;
  accentColor?: string;
}): string {
  const isDefaultGold = !options?.goldColor || options.goldColor.toLowerCase() === '#cca242';
  const isDefaultAccent =
    (!options?.accentColor || options.accentColor.toLowerCase() === '#7a2e1d') &&
    (!options?.primaryColor || options.primaryColor.toLowerCase() === '#122c60');

  let activeGradients = GRADIENTS;
  let highlightColor = HIGHLIGHT.color;
  let frameRects = FRAME;

  if (!isDefaultGold || !isDefaultAccent) {
    const goldColor = sanitizeHexColor(options?.goldColor, '#cca242');
    const accentColor = sanitizeHexColor(options?.accentColor || options?.primaryColor, '#7a2e1d');

    highlightColor = adjustBrightness(accentColor, 0.25);
    frameRects = [
      [0, 0, 1024, 6.75, goldColor],
      [0, 1527, 1024, 9, adjustBrightness(goldColor, 0.05)],
      [0, 0, 6.75, 1536, adjustBrightness(goldColor, -0.05)],
      [1017.4, 0, 6.6, 1536, goldColor],
    ];

    const metallicStops = generateMetallicStops(goldColor).map(
      (s) => [s.offset.replace('%', ''), s.color] as [string, string]
    );

    activeGradients = GRADIENTS.map((g) => {
      if (g.id.startsWith('gold') || g.id.startsWith('core')) {
        return {
          ...g,
          stops: metallicStops.map(([off, col]) => [
            (Number(off) / 100).toFixed(3),
            g.id.startsWith('core') ? adjustBrightness(col, 0.08) : col,
          ] as [string, string]),
        };
      }
      if (g.id === 'brownTL' || g.id === 'brownBottom') {
        return {
          ...g,
          stops: [
            ['0.000', adjustBrightness(accentColor, -0.4)],
            ['0.250', adjustBrightness(accentColor, -0.15)],
            ['0.500', accentColor],
            ['0.750', adjustBrightness(accentColor, -0.2)],
            ['1.000', adjustBrightness(accentColor, -0.45)],
          ],
        };
      }
      return g;
    });
  }

  const radial =
    `<radialGradient id="highlight" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="3" ` +
    `gradientTransform="translate(${HIGHLIGHT.cx} ${HIGHLIGHT.cy}) scale(${HIGHLIGHT.rx} ${HIGHLIGHT.ry})">` +
    HIGHLIGHT.stops
      .map(([o, a]) => `<stop offset="${o}" stop-color="${highlightColor}" stop-opacity="${a}"/>`)
      .join('') +
    `</radialGradient>`;

  const defs =
    activeGradients.map(gradientMarkup).join('') +
    radial +
    clipMarkup() +
    `<filter id="soft" x="-2%" y="-2%" width="104%" height="104%"><feGaussianBlur stdDeviation="0.6"/></filter>`;

  const paint = (d: string, fill: string, clip: string): string =>
    `<path d="${d}" fill="url(#${fill})" clip-path="url(#clip${clip})" fill-rule="evenodd"/>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${BACKGROUND_WIDTH}" height="${BACKGROUND_HEIGHT}" viewBox="0 0 ${BACKGROUND_WIDTH} ${BACKGROUND_HEIGHT}" preserveAspectRatio="xMidYMid slice">` +
    `<defs>${defs}</defs>` +
    `<rect width="${BACKGROUND_WIDTH}" height="${BACKGROUND_HEIGHT}" fill="${BACKGROUND_COLOR}"/>` +
    rects(CREAM) +
    paint(BROWN_SHAPE, 'brownTL', 'TL') +
    paint(BROWN_SHAPE, 'brownBottom', 'Bot') +
    paint(BROWN_SHAPE, 'highlight', 'Bot') +
    paint(GOLD_SHAPE, 'goldTL', 'TL') +
    paint(GOLD_SHAPE, 'goldBot', 'Bot') +
    `<g filter="url(#soft)">` +
    paint(GOLD_CORE_SHAPE, 'coreTL', 'TL') +
    paint(GOLD_CORE_SHAPE, 'coreBot', 'Bot') +
    `</g>` +
    rects(frameRects) +
    `</svg>`
  );
}

export default getBackgroundSvg;
