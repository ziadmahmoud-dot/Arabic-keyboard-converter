(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ArabicConverter = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const EN_TO_AR_MAP = {
    '`': 'ذ', '~': 'ّ', '1': '1', '!': '!', '2': '2', '@': '@', '3': '3', '#': '#',
    '4': '4', '$': '$', '5': '5', '%': '%', '6': '6', '^': '^', '7': '7', '&': '&',
    '8': '8', '*': '*', '9': '9', '(': ')', '0': '0', ')': '(', '-': '-', '_': '_',
    '=': '=', '+': '+',
    'q': 'ض', 'Q': '\u064E', 'w': 'ص', 'W': '\u064B', 'e': 'ث', 'E': '\u064F',
    'r': 'ق', 'R': '\u064C', 't': 'ف', 'T': 'لإ', 'y': 'غ', 'Y': 'إ', 'u': 'ع',
    'i': 'ه', 'o': 'خ', 'p': 'ح', 'P': '؛', '[': 'ج', ']': 'د',
    'a': 'ش', 'A': '\u0650', 's': 'س', 'S': '\u064D', 'd': 'ي', 'f': 'ب',
    'g': 'ل', 'G': 'لأ', 'h': 'ا', 'H': 'أ', 'j': 'ت', 'k': 'ن', 'K': '،',
    'l': 'م', ';': 'ك', "'": 'ط',
    'z': 'ئ', 'x': 'ء', 'X': '\u0652', 'c': 'ؤ', 'v': 'ر',
    'b': 'لا', 'B': 'لآ', 'n': 'ى', 'N': 'آ', 'm': 'ة',
    ',': 'و', '.': 'ز', '/': 'ظ', '?': '؟'
  };

  const AR_LIGATURES = [
    { pattern: /لإ/g, replacement: 'T' },
    { pattern: /لأ/g, replacement: 'G' },
    { pattern: /لآ/g, replacement: 'B' },
    { pattern: /لا/g, replacement: 'b' }
  ];

  const AR_TO_EN_MAP = {};
  for (const [enKey, arVal] of Object.entries(EN_TO_AR_MAP)) {
    if (arVal.length === 1 && !AR_TO_EN_MAP[arVal]) {
      AR_TO_EN_MAP[arVal] = enKey;
    }
  }

  function toArabic(text) {
    if (!text) return '';
    let res = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      res += EN_TO_AR_MAP[ch] !== undefined ? EN_TO_AR_MAP[ch] : ch;
    }
    return res;
  }

  function toEnglish(text) {
    if (!text) return '';
    let res = text;
    for (const item of AR_LIGATURES) {
      res = res.replace(item.pattern, item.replacement);
    }
    let mapped = '';
    for (let i = 0; i < res.length; i++) {
      const ch = res[i];
      mapped += AR_TO_EN_MAP[ch] !== undefined ? AR_TO_EN_MAP[ch] : ch;
    }
    return mapped;
  }

  function isArabic(text) {
    if (!text) return false;
    const ar = text.match(/[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/g);
    const en = text.match(/[a-zA-Z]/g);
    return (ar ? ar.length : 0) > (en ? en.length : 0);
  }

  function convertAuto(text) {
    return isArabic(text)
      ? { text: toEnglish(text), direction: 'to-english' }
      : { text: toArabic(text), direction: 'to-arabic' };
  }

  return { toArabic, toEnglish, isArabic, convertAuto };
});