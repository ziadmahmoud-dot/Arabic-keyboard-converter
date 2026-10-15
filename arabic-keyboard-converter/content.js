(function () {
  "use strict";

  // Embedded English-to-Arabic Keyboard Map (100% self-contained)
  var AR_MAP = {
    "`": "ذ", "~": "ّ", "1": "1", "!": "!", "2": "2", "@": "@", "3": "3", "#": "#",
    "4": "4", "$": "$", "5": "5", "%": "%", "6": "6", "^": "^", "7": "7", "&": "&",
    "8": "8", "*": "*", "9": "9", "(": ")", "0": "0", ")": "(", "-": "-", "_": "_",
    "=": "=", "+": "+",
    "q": "ض", "Q": "\u064E", "w": "ص", "W": "\u064B", "e": "ث", "E": "\u064F",
    "r": "ق", "R": "\u064C", "t": "ف", "T": "لإ", "y": "غ", "Y": "إ", "u": "ع",
    "i": "ه", "o": "خ", "p": "ح", "P": "؛", "[": "ج", "]": "د",
    "a": "ش", "A": "\u0650", "s": "س", "S": "\u064D", "d": "ي", "f": "ب",
    "g": "ل", "G": "لأ", "h": "ا", "H": "أ", "j": "ت", "k": "ن", "K": "،",
    "l": "م", ";": "ك", "'": "ط",
    "z": "ئ", "x": "ء", "X": "\u0652", "c": "ؤ", "v": "ر",
    "b": "لا", "B": "لآ", "n": "ى", "N": "آ", "m": "ة",
    ",": "و", ".": "ز", "/": "ظ", "?": "؟"
  };

  function toArabic(text) {
    if (!text) return "";
    var res = "";
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      res += AR_MAP[ch] !== undefined ? AR_MAP[ch] : ch;
    }
    return res;
  }

  // Floating notification on the screen
  function showToast(text, isError) {
    var t = document.getElementById("akc-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "akc-toast";
      t.style.position = "fixed";
      t.style.bottom = "24px";
      t.style.right = "24px";
      t.style.zIndex = "2147483647";
      t.style.padding = "10px 18px";
      t.style.borderRadius = "8px";
      t.style.fontSize = "14px";
      t.style.fontWeight = "bold";
      t.style.boxShadow = "0 4px 15px rgba(0,0,0,0.5)";
      t.style.direction = "rtl";
      t.style.fontFamily = "sans-serif";
      t.style.transition = "opacity 0.25s";
      document.body.appendChild(t);
    }
    t.style.background = isError ? "#7f1d1d" : "#064e3b";
    t.style.color = isError ? "#fca5a5" : "#6ee7b7";
    t.style.border = isError ? "1px solid #ef4444" : "1px solid #10b981";
    t.textContent = isError ? text : ("تم التحويل: " + text);
    t.style.opacity = "1";
    setTimeout(function () { t.style.opacity = "0"; }, 2500);
  }

  // Penetrates Shadow DOM (required for Google AI Studio & YouTube)
  function getDeepActiveElement() {
    var el = document.activeElement;
    while (el && el.shadowRoot && el.shadowRoot.activeElement) {
      el = el.shadowRoot.activeElement;
    }
    return el;
  }

  // Updates inputs in modern frameworks (React, Angular, AI Studio)
  function setElementValue(el, newValue) {
    el.focus();
    el.select();

    // Try standard execCommand first
    var ok = document.execCommand("insertText", false, newValue);
    if (!ok || el.value !== newValue) {
      // Prototype setter for Angular / React / AI Studio
      var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      var descriptor = Object.getOwnPropertyDescriptor(proto, "value");
      if (descriptor && descriptor.set) {
        descriptor.set.call(el, newValue);
      } else {
        el.value = newValue;
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function convertActiveElement() {
    var el = getDeepActiveElement();

    // 1. Textarea or Input (inside or outside Shadow DOM)
    if (el && (el.tagName === "TEXTAREA" || el.tagName === "INPUT")) {
      var val = el.value || "";
      if (!val) {
        showToast("اكتب شيئاً أولاً في الصندوق", true);
        return;
      }

      var start = el.selectionStart;
      var end = el.selectionEnd;
      var hasSel = (start !== end);
      var target = hasSel ? val.substring(start, end) : val;

      var converted = toArabic(target);
      if (hasSel) {
        setElementValue(el, val.substring(0, start) + converted + val.substring(end));
      } else {
        setElementValue(el, converted);
      }

      el.setAttribute("dir", "rtl");
      showToast(converted, false);
      return;
    }

    // 2. Rich Text / Contenteditable (Gmail, WhatsApp, AI Studio editors)
    if (el && (el.isContentEditable || el.getAttribute("contenteditable") === "true")) {
      var sel = window.getSelection();
      var text = sel ? sel.toString() : "";

      if (!text) {
        text = el.innerText || el.textContent || "";
        var r = document.createRange();
        r.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(r);
      }

      if (!text) {
        showToast("اكتب شيئاً أولاً", true);
        return;
      }

      var convertedRich = toArabic(text);
      var okRich = document.execCommand("insertText", false, convertedRich);
      if (!okRich) {
        var range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(convertedRich));
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }

      el.setAttribute("dir", "rtl");
      showToast(convertedRich, false);
      return;
    }

    // 3. Highlighted text anywhere on webpage
    var selText = window.getSelection() ? window.getSelection().toString() : "";
    if (selText) {
      var convertedSel = toArabic(selText);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(convertedSel);
      }
      showToast(convertedSel + " (تم النسخ)", false);
      return;
    }

    showToast("انقر داخل صندوق الكتابة أولاً", true);
  }

  // Keyboard shortcut listener:
  // Supports Alt+A, Alt+Q, and Ctrl+Shift+A
  window.addEventListener("keydown", function (e) {
    var isAltA = e.altKey && !e.ctrlKey && !e.metaKey && (e.code === "KeyA" || e.key === "a" || e.key === "A" || e.key === "ش" || e.key === "å");
    var isAltQ = e.altKey && !e.ctrlKey && !e.metaKey && (e.code === "KeyQ" || e.key === "q" || e.key === "Q" || e.key === "ض");
    var isCtrlShiftA = e.ctrlKey && e.shiftKey && (e.code === "KeyA" || e.key === "a" || e.key === "A");

    if (isAltA || isAltQ || isCtrlShiftA) {
      e.preventDefault();
      e.stopPropagation();
      convertActiveElement();
    }
  }, true);

  // Background context-menu message
  chrome.runtime.onMessage.addListener(function (msg) {
    if (msg.action === "convert-to-arabic") {
      convertActiveElement();
    }
  });
})();