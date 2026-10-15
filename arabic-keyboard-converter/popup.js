document.addEventListener('DOMContentLoaded', () => {
  const src = document.getElementById('src');
  const out = document.getElementById('out');
  const copyBtn = document.getElementById('copy');

  src.addEventListener('input', () => {
    if (window.ArabicConverter) {
      out.value = window.ArabicConverter.toArabic(src.value);
    }
  });

  copyBtn.addEventListener('click', () => {
    if (out.value) {
      navigator.clipboard.writeText(out.value).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy Arabic Text';
        }, 1200);
      });
    }
  });
});