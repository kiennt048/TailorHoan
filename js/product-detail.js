/**
 * Đồng Phục Y Tế Quỳnh Châu — product-detail.js
 * Interactive image gallery with multi-angle switching and smooth transitions.
 */
(function () {
  'use strict';

  function initGallery() {
    var thumbs = document.querySelectorAll('.gallery-thumb');
    var mainImg = document.getElementById('mainImage');
    var mainWebp = document.getElementById('mainSourceWebp');
    if (!thumbs.length || !mainImg) return;

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        thumbs.forEach(function (t) { t.classList.remove('active'); });
        thumb.classList.add('active');

        var jpg = thumb.getAttribute('data-full-jpg');
        var webp = thumb.getAttribute('data-full-webp');
        if (jpg) {
          mainImg.style.opacity = '0.35';
          setTimeout(function () {
            mainImg.src = jpg;
            if (mainWebp && webp) mainWebp.srcset = webp;
            mainImg.style.opacity = '1';
          }, 140);
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
  } else {
    initGallery();
  }
})();
