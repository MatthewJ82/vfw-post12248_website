/* VFW Post 12248 – shared site script */
(function () {
  // Mobile menu
  var btn = document.querySelector('.menu-btn');
  var nav = document.querySelector('nav.main');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Mark current page in the nav
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.main a').forEach(function (a) {
    if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
  });

  // Contact form: send in the background, then show our own thank-you page
  var form = document.getElementById('contact-form');
  if (form && window.fetch && window.FormData) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var status = document.getElementById('form-status');
      var btn = form.querySelector('button[type=submit]');
      if (btn) btn.disabled = true;
      if (status) status.textContent = 'Sending…';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (r) {
          if (r.ok) { location.href = 'thanks.html'; return; }
          return r.json().then(function (d) { throw new Error((d.errors || []).map(function (e) { return e.message; }).join(', ') || 'Send failed'); });
        })
        .catch(function (err) {
          if (btn) btn.disabled = false;
          if (status) status.textContent = 'Sorry, the message could not be sent (' + err.message + '). Please email or call the Post.';
        });
    });
  }

  // Footer year
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var longMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function parseDate(s) { // "YYYY-MM-DD" -> local Date at midnight
    var p = s.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // News: list (data-news="N") or single story (news.html?story=id)
  var newsTargets = document.querySelectorAll('[data-news]');
  var storyTarget = document.querySelector('[data-story]');
  if (newsTargets.length || storyTarget) {
    fetch('news.json', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var items = (data.news || []).slice().sort(function (a, b) { return parseDate(b.date) - parseDate(a.date); });
        var storyId = new URLSearchParams(location.search).get('story');

        if (storyTarget && storyId) {
          var n = items.filter(function (x) { return x.id === storyId; })[0];
          if (!n) { storyTarget.innerHTML = '<p class="no-events">That story could not be found.</p><p><a href="news.html">All news &rarr;</a></p>'; return; }
          var d = parseDate(n.date);
          document.title = n.title + ' – VFW Post 12248';
          var t = document.querySelector('.page-title h1'); if (t) t.textContent = n.title;
          var sub = document.querySelector('.page-title p'); if (sub) sub.textContent = longMonths[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
          storyTarget.innerHTML =
            (n.image ? '<figure class="figure" style="margin:0 0 24px"><img src="' + esc(n.image) + '" alt="" loading="lazy"></figure>' : '') +
            '<div class="story">' + (n.full || '<p>' + esc(n.summary || '') + '</p>') + '</div>' +
            '<p style="margin-top:28px"><a class="btn blue" href="news.html">&larr; All news</a></p>';
          newsTargets.forEach(function (x) { x.parentNode.removeChild(x); });
          return;
        }

        newsTargets.forEach(function (t) {
          var limit = parseInt(t.getAttribute('data-news'), 10) || 0;
          var list = limit ? items.slice(0, limit) : items;
          if (!list.length) { t.innerHTML = '<p class="no-events">No news posted yet.</p>'; return; }
          t.innerHTML = list.map(function (n) {
            var d = parseDate(n.date);
            var href = n.link ? n.link : 'news.html?story=' + encodeURIComponent(n.id || '');
            return '<article class="news-item">' +
              '<div class="news-date">' + longMonths[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + '</div>' +
              '<h3><a href="' + esc(href) + '">' + esc(n.title) + '</a></h3>' +
              (n.summary ? '<p>' + esc(n.summary) + '</p>' : '') +
              '<p><a href="' + esc(href) + '">Read more &rarr;</a></p>' +
              '</article>';
          }).join('');
        });
      })
      .catch(function () {
        newsTargets.forEach(function (t) { t.innerHTML = '<p class="no-events">News could not be loaded.</p>'; });
        if (storyTarget) storyTarget.innerHTML = '<p class="no-events">News could not be loaded.</p>';
      });
  }

  // Events: load events.json into any element with data-events
  var targets = document.querySelectorAll('[data-events]');
  if (!targets.length) return;

  function render(list, target) {
    var limit = parseInt(target.getAttribute('data-events'), 10) || 0;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var upcoming = list
      .filter(function (e) { return e.date && parseDate(e.endDate || e.date) >= today; })
      .sort(function (a, b) { return parseDate(a.date) - parseDate(b.date); });
    if (limit) upcoming = upcoming.slice(0, limit);

    if (!upcoming.length) {
      target.innerHTML = '<p class="no-events">No upcoming events posted yet. Check back soon, or call the Post.</p>';
      return;
    }
    target.innerHTML = upcoming.map(function (e) {
      var d = parseDate(e.date);
      var end = e.endDate ? parseDate(e.endDate) : null;
      var dayLabel = String(d.getDate());
      var monthLabel = months[d.getMonth()];
      if (end && end > d) {
        dayLabel = end.getMonth() === d.getMonth() ? d.getDate() + '\u2013' + end.getDate() : d.getDate() + '\u2013' + months[end.getMonth()] + ' ' + end.getDate();
      }
      var meta = [];
      if (e.time) meta.push(e.time);
      if (e.location) meta.push(e.location);
      return '<article class="event">' +
        '<div class="date' + (end && end > d ? ' multi' : '') + '"><span class="m">' + monthLabel + '</span><span class="d">' + dayLabel + '</span></div>' +
        '<div><h3>' + esc(e.title) + '</h3>' +
        (meta.length ? '<div class="meta">' + esc(meta.join(' · ')) + '</div>' : '') +
        (e.description ? '<p>' + esc(e.description) + '</p>' : '') +
        '</div></article>';
    }).join('');
  }

  fetch('events.json', { cache: 'no-store' })
    .then(function (r) { return r.json(); })
    .then(function (data) { targets.forEach(function (t) { render(data.events || [], t); }); })
    .catch(function () {
      targets.forEach(function (t) {
        t.innerHTML = '<p class="no-events">Events could not be loaded. Please call the Post for the latest schedule.</p>';
      });
    });
})();
