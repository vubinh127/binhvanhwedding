var photoViewer = document.getElementById('photo-viewer');
var photoViewerImage = document.getElementById('photo-viewer-image');
var photoViewerCounter = photoViewer.querySelector('.photo-viewer-counter');
var photoList = [];
var photoIndex = 0;

function unlockPageScroll() {
  var scrollTop = -parseInt(document.body.style.getPropertyValue('--photo-viewer-scroll-top'), 10) || 0;
  document.body.classList.remove('photo-viewer-open');
  document.body.style.removeProperty('--photo-viewer-scroll-top');
  window.requestAnimationFrame(function () {
    window.scrollTo(0, scrollTop);
  });
}

function getVisiblePhotos() {
  return Array.prototype.filter.call(document.querySelectorAll('.grid .photo img'), function (img) {
    return img.offsetParent !== null;
  });
}

function preloadPhoto(index) {
  var img = photoList[(index + photoList.length) % photoList.length];
  if (img) new Image().src = img.currentSrc || img.src;
}

function showPhoto(index) {
  photoIndex = (index + photoList.length) % photoList.length;
  var image = photoList[photoIndex];
  photoViewerImage.src = image.currentSrc || image.src;
  photoViewerImage.alt = image.alt;
  photoViewerCounter.textContent = (photoIndex + 1) + ' / ' + photoList.length;
  preloadPhoto(photoIndex + 1);
  preloadPhoto(photoIndex - 1);
}

document.querySelector('.grid').addEventListener('click', function (event) {
  var image = event.target.closest('img');
  if (!image) return;

  photoList = getVisiblePhotos();
  showPhoto(Math.max(photoList.indexOf(image), 0));
  document.body.style.setProperty('--photo-viewer-scroll-top', '-' + window.scrollY + 'px');
  document.body.classList.add('photo-viewer-open');
  photoViewer.showModal();
});

photoViewer.addEventListener('close', unlockPageScroll);

photoViewer.querySelector('.photo-viewer-close').addEventListener('click', function () {
  photoViewer.close();
});

photoViewer.querySelector('.photo-viewer-prev').addEventListener('click', function () {
  showPhoto(photoIndex - 1);
});

photoViewer.querySelector('.photo-viewer-next').addEventListener('click', function () {
  showPhoto(photoIndex + 1);
});

photoViewer.addEventListener('click', function (event) {
  if (event.target === photoViewer) photoViewer.close();
});

document.addEventListener('keydown', function (event) {
  if (!photoViewer.open) return;
  if (event.key === 'Escape') photoViewer.close();
  else if (event.key === 'ArrowLeft') showPhoto(photoIndex - 1);
  else if (event.key === 'ArrowRight') showPhoto(photoIndex + 1);
});

// Swipe left/right on touch screens
var touchStartX = 0;
var touchStartY = 0;

photoViewer.addEventListener('touchstart', function (event) {
  if (event.touches.length !== 1) return;
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}, { passive: true });

photoViewer.addEventListener('touchend', function (event) {
  if (!event.changedTouches.length || event.touches.length) return;
  var dx = event.changedTouches[0].clientX - touchStartX;
  var dy = event.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
  showPhoto(photoIndex + (dx < 0 ? 1 : -1));
}, { passive: true });
