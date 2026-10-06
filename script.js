// ===== Cấu hình: sửa ở đây =====
var CONFIG = {
  weddingDate: '2026-11-16T14:30:00+07:00',
  // Dán URL Google Apps Script (Web app) để nhận RSVP vào Google Sheet. Để trống = chỉ lưu tạm trên máy khách.
  rsvpEndpoint: '',
  sampleWishes: [
    { name: 'Bạn A', message: 'Chúc hai bạn trăm năm hạnh phúc!' },
    { name: 'Bạn B', message: 'Chúc mừng ngày trọng đại của hai bạn!' }
  ]
};

// ===== Đếm ngược =====
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

// ===== Lịch tháng cưới (tuần bắt đầu từ thứ Hai) =====
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
    box.insertAdjacentHTML('beforeend', n === day ? '<div class="today">' + n + '</div>' : '<div>' + n + '</div>');
  }
})();

// ===== Lời chúc =====
var wishList = document.getElementById('wish-list');
function esc(t) {
  var p = document.createElement('p');
  p.textContent = t;
  return p.innerHTML;
}
function addWish(w, top) {
  var html = '<li><b>' + esc(w.name) + '</b>' + esc(w.message) + '</li>';
  wishList.insertAdjacentHTML(top ? 'afterbegin' : 'beforeend', html);
}
CONFIG.sampleWishes.forEach(function (w) { addWish(w, false); });

// ===== Form RSVP =====
document.getElementById('rsvp-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var form = e.target;
  var status = document.getElementById('status');
  var data = {};
  new FormData(form).forEach(function (v, k) { data[k] = v; });
  var done = function () {
    if (data.message) addWish({ name: data.name, message: data.message }, true);
    status.textContent = 'Cảm ơn bạn đã xác nhận!';
    form.reset();
  };
  if (!CONFIG.rsvpEndpoint) { done(); return; }
  status.textContent = 'Đang gửi...';
  fetch(CONFIG.rsvpEndpoint, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) })
    .then(done)
    .catch(function () { status.textContent = 'Gửi chưa được, bạn thử lại nhé.'; });
});

// ===== Quà mừng cưới =====
document.getElementById('gift-btn').addEventListener('click', function () {
  var box = document.getElementById('gift-box');
  box.hidden = !box.hidden;
});
