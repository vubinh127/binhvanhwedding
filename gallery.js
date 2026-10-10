var photoViewer = document.getElementById('photo-viewer');
var photoViewerImage = document.getElementById('photo-viewer-image');

function unlockPageScroll() {
  var scrollTop = -parseInt(document.body.style.getPropertyValue('--photo-viewer-scroll-top'), 10) || 0;
  document.body.classList.remove('photo-viewer-open');
  document.body.style.removeProperty('--photo-viewer-scroll-top');
  window.requestAnimationFrame(function () {
    window.scrollTo(0, scrollTop);
  });
}

document.querySelector('.grid').addEventListener('click', function (event) {
  var image = event.target.closest('img');
  if (!image) return;

  photoViewerImage.src = image.currentSrc || image.src;
  photoViewerImage.alt = image.alt;
  document.body.style.setProperty('--photo-viewer-scroll-top', '-' + window.scrollY + 'px');
  document.body.classList.add('photo-viewer-open');
  photoViewer.showModal();
});

photoViewer.addEventListener('close', unlockPageScroll);

photoViewer.querySelector('.photo-viewer-close').addEventListener('click', function () {
  photoViewer.close();
});

photoViewer.addEventListener('click', function (event) {
  if (event.target === photoViewer) photoViewer.close();
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && photoViewer.open) photoViewer.close();
});
