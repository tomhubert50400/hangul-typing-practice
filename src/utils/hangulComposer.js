import Hangul from "hangul-js";

// Standard Korean Dubeolsik (두벌식) keyboard layout
// This is the official Korean keyboard layout used by Branah and others
// Maps physical key positions to Hangul jamos (normal/shift)
const hangulLayout = {
  // First row (numbers) - no shift variants
  1: "",
  2: "",
  3: "",
  4: "",
  5: "",
  6: "",
  7: "",
  8: "",
  9: "",
  0: "",
  "-": "",
  "=": "",

  // Second row (QWERTY: qwertyuiop[]) - with shift variants
  q: { normal: "ㅂ", shift: "ㅃ" },
  w: { normal: "ㅈ", shift: "ㅉ" },
  e: { normal: "ㄷ", shift: "ㄸ" },
  r: { normal: "ㄱ", shift: "ㄲ" },
  t: { normal: "ㅅ", shift: "ㅆ" },
  y: "ㅛ", // no shift variant
  u: "ㅕ", // no shift variant
  i: "ㅑ", // no shift variant
  o: { normal: "ㅐ", shift: "ㅒ" },
  p: { normal: "ㅔ", shift: "ㅖ" },
  "[": "",
  "]": "",
  "\\": "",

  // Third row (QWERTY: asdfghjkl;') - no shift variants
  a: "ㅁ",
  s: "ㄴ",
  d: "ㅇ",
  f: "ㄹ",
  g: "ㅎ",
  h: "ㅗ",
  j: "ㅓ",
  k: "ㅏ",
  l: "ㅣ",
  ";": "",
  "'": "",

  // Fourth row (QWERTY: zxcvbnm,./) - no shift variants
  z: "ㅋ",
  x: "ㅌ",
  c: "ㅊ",
  v: "ㅍ",
  b: "ㅠ",
  n: "ㅜ",
  m: "ㅡ",
  ",": "",
  ".": "",
  "/": "",

  // Space
  " ": " ",
};

// Latin key labels for QWERTY layout
const qwertyLabels = {
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  0: "0",
  "-": "-",
  "=": "=",
  q: "q",
  w: "w",
  e: "e",
  r: "r",
  t: "t",
  y: "y",
  u: "u",
  i: "i",
  o: "o",
  p: "p",
  "[": "[",
  "]": "]",
  "\\": "\\",
  a: "a",
  s: "s",
  d: "d",
  f: "f",
  g: "g",
  h: "h",
  j: "j",
  k: "k",
  l: "l",
  ";": ";",
  "'": "'",
  z: "z",
  x: "x",
  c: "c",
  v: "v",
  b: "b",
  n: "n",
  m: "m",
  ",": ",",
  ".": ".",
  "/": "/",
  " ": " ",
};

// Latin key labels for AZERTY layout
const azertyLabels = {
  1: { normal: "&", shift: "1" },
  2: { normal: "é", shift: "2" },
  3: { normal: '"', shift: "3" },
  4: { normal: "'", shift: "4" },
  5: { normal: "(", shift: "5" },
  6: { normal: "-", shift: "6" },
  7: { normal: "è", shift: "7" },
  8: { normal: "_", shift: "8" },
  9: { normal: "ç", shift: "9" },
  0: { normal: "à", shift: "0" },
  "-": { normal: ")", shift: ")" },
  "=": { normal: "=", shift: "=" },
  q: "a",
  w: "z",
  e: "e",
  r: "r",
  t: "t",
  y: "y",
  u: "u",
  i: "i",
  o: "o",
  p: "p",
  "[": "^",
  "]": "$",
  "\\": "*",
  a: "q",
  s: "s",
  d: "d",
  f: "f",
  g: "g",
  h: "h",
  j: "j",
  k: "k",
  l: "l",
  ";": "m",
  "'": "ù",
  z: "w",
  x: "x",
  c: "c",
  v: "v",
  b: "b",
  n: "n",
  m: ",",
  ",": ";",
  ".": ":",
  "/": "²",
  " ": " ",
};

// Physical key positions for QWERTY layout (reference layout)
const qwertyLayout = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
  [" "],
];

// Physical key positions for AZERTY layout
const azertyLayout = [
  ["&", "é", '"', "'", "(", "-", "è", "_", "ç", "à", ")", "="],
  ["a", "z", "e", "r", "t", "y", "u", "i", "o", "p", "^", "$", "*"],
  ["q", "s", "d", "f", "g", "h", "j", "k", "l", "m", "ù"],
  ["w", "x", "c", "v", "b", "n", ",", ";", ":", "²"],
  [" "],
];

// Get the physical key position from layout
const getPhysicalKey = (layout, latinChar) => {
  for (let rowIndex = 0; rowIndex < layout.length; rowIndex++) {
    const row = layout[rowIndex];
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      if (row[colIndex] === latinChar) {
        return { row: rowIndex, col: colIndex };
      }
    }
  }
  return null;
};

// Get the Latin character for a physical key position
const getLatinChar = (layout, row, col) => {
  if (layout[row] && layout[row][col]) {
    return layout[row][col];
  }
  return null;
};

// Get the Hangul character for a physical key position
// This uses the QWERTY layout as reference for physical positions
const getHangulChar = (row, col, shift = false) => {
  const layout = qwertyLayout; // Use QWERTY layout as reference for physical positions
  const latinChar = getLatinChar(layout, row, col);
  if (!latinChar) return null;

  const hangulChar = hangulLayout[latinChar];
  if (typeof hangulChar === "string") {
    return hangulChar;
  } else if (typeof hangulChar === "object") {
    return shift ? hangulChar.shift : hangulChar.normal;
  }
  return null;
};

// Get both normal and shift Hangul characters for display
const getHangulChars = (row, col) => {
  const layout = qwertyLayout;
  const latinChar = getLatinChar(layout, row, col);
  if (!latinChar) return null;

  const hangulChar = hangulLayout[latinChar];
  if (typeof hangulChar === "string") {
    return { normal: hangulChar, shift: null };
  } else if (typeof hangulChar === "object") {
    return { normal: hangulChar.normal, shift: hangulChar.shift };
  }
  return null;
};

// Convert Latin input to Hangul jamo
const latinToJamo = (latinChar, layout, shift = false) => {
  const lowerChar = latinChar.toLowerCase();

  // Find the physical position of this Latin character in the layout
  const layoutArray = layout === "QWERTY" ? qwertyLayout : azertyLayout;
  const physicalKey = getPhysicalKey(layoutArray, lowerChar);

  if (physicalKey) {
    return getHangulChar(physicalKey.row, physicalKey.col, shift);
  }

  return null;
};

// Compose jamos into Hangul syllables
const composeHangul = (jamos) => {
  if (!jamos || jamos.length === 0) return "";

  // Use hangul-js to compose the jamos
  return Hangul.assemble(jamos);
};

// Get keyboard layout for display
const getKeyboardLayout = (layout) => {
  return layout === "QWERTY" ? qwertyLayout : azertyLayout;
};

// Get Latin labels for display
const getLatinLabels = (layout) => {
  return layout === "QWERTY" ? qwertyLabels : azertyLabels;
};

export {
  hangulLayout,
  qwertyLabels,
  azertyLabels,
  qwertyLayout,
  azertyLayout,
  latinToJamo,
  composeHangul,
  getKeyboardLayout,
  getLatinLabels,
  getPhysicalKey,
  getHangulChar,
  getHangulChars,
};
