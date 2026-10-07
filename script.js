var introOverlay = document.getElementById('intro-overlay');
var bgMusic = document.getElementById('bg-music');
var musicToggle = document.getElementById('music-toggle');
var musicIcon = musicToggle.querySelector('.music-icon');

if (localStorage.getItem('introOpened')) {
  introOverlay.classList.add('hidden');
  document.body.style.overflow = '';
} else {
  document.body.style.overflow = 'hidden';
}

introOverlay.addEventListener('click', function () {
  introOverlay.classList.add('hidden');
  document.body.style.overflow = '';
  localStorage.setItem('introOpened', 'true');
  bgMusic.play().catch(function (e) { console.log('Autoplay prevented'); });
});

musicToggle.addEventListener('click', function () {
  if (bgMusic.paused) {
    bgMusic.play();
    musicIcon.classList.remove('muted');
    musicIcon.classList.add('playing');
  } else {
    bgMusic.pause();
    musicIcon.classList.remove('playing');
    musicIcon.classList.add('muted');
  }
});

new WOW({
  animateClass: 'animate__animated',
  offset: 60,
  mobile: true,
  live: true
}).init();

const SUPABASE_URL = 'https://mygmykhrnnzkbsrslzix.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JOL5cskxiNIm3Bt7PZMzoA_TTCUGPVf';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

var CONFIG = {
  weddingDate: '2026-11-16T14:30:00+07:00'
};

var WISH_PAGE_SIZE = 5;
var allWishes = [];
var shownCount = 0;

(function () {
  var target = new Date(CONFIG.weddingDate).getTime();
  var ids = { d: 'cd-d', h: 'cd-h', m: 'cd-m', s: 'cd-s' };
  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    var diff = Math.max(0, target - Date.now());
    var s = Math.floor(diff / 1000);
    document.getElementById(ids.d).textContent = pad(Math.floor(s / 86400));
    document.getElementById(ids.h).textContent = pad(Math.floor(s % 86400 / 3600));
    document.getElementById(ids.m).textContent = pad(Math.floor(s % 3600 / 60));
    document.getElementById(ids.s).textContent = pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);
})();

(function () {
  var d = new Date(CONFIG.weddingDate);
  var y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
  var box = document.getElementById('calendar');
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(function (t) {
    box.insertAdjacentHTML('beforeend', '<div class="dow">' + t + '</div>');
  });
  var offset = (new Date(y, m, 1).getDay() + 6) % 7;
  var total = new Date(y, m + 1, 0).getDate();
  for (var i = 0; i < offset; i++) box.insertAdjacentHTML('beforeend', '<div></div>');
  for (var n = 1; n <= total; n++) {
    box.insertAdjacentHTML('beforeend', n === day
      ? '<div class="today">' + n + '</div>'
      : '<div>' + n + '</div>');
  }
})();

var wishList = document.getElementById('wish-list');
var wishFooter = document.getElementById('wish-footer');
var wishCountText = document.getElementById('wish-count-text');
var wishLoadBtn = document.getElementById('wish-load-btn');

function esc(t) {
  var p = document.createElement('p');
  p.textContent = t;
  return p.innerHTML;
}

function renderWishes() {
  wishList.innerHTML = '';
  var visible = allWishes.slice(0, shownCount);
  visible.forEach(function (w, idx) {
    var li = document.createElement('li');
    li.className = 'wish-item';
    li.style.animationDelay = (idx * 0.06) + 's';
    li.innerHTML =
      '<span class="wish-avatar">' + esc(w.name.charAt(0).toUpperCase()) + '</span>' +
      '<div class="wish-body">' +
      '<b>' + esc(w.name) + '</b>' +
      '<p>' + esc(w.message || '') + '</p>' +
      '<time>' + formatDate(w.created_at) + '</time>' +
      '</div>';
    wishList.appendChild(li);
  });

  var remaining = allWishes.length - shownCount;
  if (allWishes.length > WISH_PAGE_SIZE) {
    wishFooter.hidden = false;
    wishCountText.textContent = remaining > 0
      ? 'Đang xem ' + shownCount + ' / ' + allWishes.length + ' lời chúc'
      : 'Đã xem tất cả ' + allWishes.length + ' lời chúc ♥';
    wishLoadBtn.hidden = remaining <= 0;
  } else {
    wishFooter.hidden = true;
  }
}

function formatDate(iso) {
  if (!iso) return '';
  var d = new Date(iso);
  return d.getDate().toString().padStart(2, '0') + '/' +
    (d.getMonth() + 1).toString().padStart(2, '0') + '/' +
    d.getFullYear();
}

async function loadWishes() {
  try {
    var { data, error } = await db
      .from('wishes')
      .select('id, name, message, side, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    allWishes = data || [];
    shownCount = Math.min(WISH_PAGE_SIZE, allWishes.length);
    renderWishes();
  } catch (err) {
    console.error('Lỗi tải lời chúc:', err);
  }
}

wishLoadBtn.addEventListener('click', function () {
  shownCount = Math.min(shownCount + WISH_PAGE_SIZE, allWishes.length);
  renderWishes();
  wishList.lastElementChild && wishList.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

loadWishes();

db.channel('wishes-channel')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wishes' }, function (payload) {
    allWishes.unshift(payload.new);
    if (shownCount < allWishes.length) shownCount++;
    renderWishes();
  })
  .subscribe();

document.getElementById('rsvp-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  var form = e.target;
  var statusEl = document.getElementById('status');
  var data = {};
  new FormData(form).forEach(function (v, k) { data[k] = v; });

  statusEl.textContent = 'Đang gửi...';
  statusEl.className = 'status sending';

  try {
    var payload = {
      name: data.name,
      message: data.message || null
    };

    var { error } = await db.from('wishes').insert([payload]);
    if (error) throw error;

    statusEl.textContent = '✓ Cảm ơn bạn đã gửi lời chúc!';
    statusEl.className = 'status success';
    form.reset();

    setTimeout(loadWishes, 600);
  } catch (err) {
    console.error(err);
    statusEl.textContent = '✗ Gửi chưa được, bạn thử lại nhé.';
    statusEl.className = 'status error';
  }
});

document.getElementById('gift-btn').addEventListener('click', function () {
  var box = document.getElementById('gift-box');
  box.hidden = !box.hidden;
});

document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
  alert('Nàoooo! Không được tò mò !!!');
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'F12' || e.keyCode === 123) {
    e.preventDefault();
    alert('Nàoooo! Không được tò mò !!!');
  }
  if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
    e.preventDefault();
    alert('Nàoooo! Không được tò mò !!!');
  }
  if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
    e.preventDefault();
    alert('Nàoooo! Không được tò mò !!!');
  }
});
