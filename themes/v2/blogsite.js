/* 블로거 3개(머니노트·헬스노트·지원금 길잡이)를 '홈페이지처럼' 보이게 하는 공용 스크립트.
   theme 에서 window.HK_SITE = 'money'|'health'|'gov' 를 먼저 지정한다. 홈은 피드(JSON)로 직접 그리고, 글 페이지는 CSS 로만 다듬는다. */
(function () {
  var S = window.HK_SITE;
  if (!S) return;
  var C = {
    money: {
      name: '머니노트', mark: '₩', tag: '돈 되는 정보를 숫자로 쉽게',
      nav: [['대출', '대출'], ['보험', '보험'], ['연금', '연금'], ['세금', '세금'], ['카드', '카드']],
      ph: '궁금한 돈 이야기를 검색해 보세요'
    },
    health: {
      name: '헬스노트', mark: '✚', tag: '몸에 대한 정확한 정보',
      nav: [['건강검진', '건강검진'], ['수술·비용', '수술 비용'], ['실손보험', '실손보험'], ['예방접종', '예방접종'], ['영양·생활', '영양']],
      ph: '증상·검진·비용을 검색해 보세요'
    },
    gov: {
      name: '지원금 길잡이', mark: '⚑', tag: '내가 받을 수 있는 지원금 찾기',
      nav: [['청년', '청년'], ['출산·육아', '출산'], ['노후·연금', '연금'], ['소상공인', '소상공인'], ['주거', '주거'], ['세금환급', '환급']],
      ph: '지원금 이름이나 대상을 검색해 보세요 (예: 근로장려금)'
    },
    garden: {
      name: '지니정원', mark: '✿', tag: '여행·맛집·건강·생활, 오늘 궁금한 것들',
      cats: [['여행·나들이', '#38bdf8', '🧳'], ['맛집·요리', '#fb923c', '🍽️'], ['건강·뷰티', '#4ade80', '🌿'], ['트렌드·IT', '#a78bfa', '⚡'], ['생활·정보', '#f472b6', '🏡']],
      ph: '오늘 궁금한 걸 검색해 보세요'
    }
  }[S];
  if (!C) return;
  if (C.cats) C.nav = C.cats.map(function (c) { return [c[0], c[0], '/search/label/' + encodeURIComponent(c[0])]; });

  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function q(v) { return '/search?q=' + encodeURIComponent(v); }
  function isHome() { return /^\/(index\.html)?$/.test(location.pathname); }

  function header() {
    var nav = C.nav.map(function (n) { return '<a href="' + (n[2] || q(n[1])) + '">' + esc(n[0]) + '</a>'; }).join('');
    var h = el('header', 'hk-hd',
      (S === 'gov' ? '<div class="hk-util"><div class="hk-in">민간에서 운영하는 지원금 안내 사이트입니다. 정부 공식 사이트가 아니며, 신청은 반드시 공식 기관에서 확인하세요.</div></div>' : '') +
      '<div class="hk-bar"><div class="hk-in"><a class="hk-logo" href="/"><i>' + esc(C.mark) + '</i><b>' + esc(C.name) + '</b></a>' +
      '<nav class="hk-nav">' + nav + '</nav>' +
      '<form class="hk-sf" action="/search" method="get"><input name="q" placeholder="검색" aria-label="검색"><button aria-label="검색">🔍</button></form></div></div>');
    return h;
  }

  function card(p, big) {
    var th = p.img ? ' style="background-image:url(\'' + p.img.replace(/'/g, '%27') + '\')"' : '';
    var lab = C.cats ? (p.cat ? '<em class="hk-cat" style="--cc:' + catColor(p.cat) + '">' + esc(p.cat) + '</em>' : '') : p.labels.slice(0, 2).map(function (l) { return '<em>' + esc(l) + '</em>'; }).join('');
    return '<a class="hk-card' + (big ? ' hk-big' : '') + '" href="' + p.u + '"><span class="hk-th"' + th + '></span><span class="hk-bd">' +
      '<span class="hk-lab">' + lab + '</span><strong>' + esc(p.t) + '</strong><span class="hk-ex">' + esc(p.txt) + '</span><time>' + p.d + '</time></span></a>';
  }
  function catColor(n) { var r = '#94a3b8'; (C.cats || []).forEach(function (c) { if (c[0] === n) r = c[1]; }); return r; }
  function row(p, i) {
    return '<a class="hk-row" href="' + p.u + '"><b>' + (i + 1) + '</b><span>' + esc(p.t) + '</span><time>' + p.d + '</time></a>';
  }

  function tiles(list) {
    return list.map(function (t) { return '<a class="hk-tile" href="' + q(t[2]) + '"><i>' + t[0] + '</i><strong>' + esc(t[1]) + '</strong><span>' + esc(t[3]) + '</span></a>'; }).join('');
  }

  var HOME = {
    money: function (P) {
      var top = P.slice(0, 5), rest = P.slice(1);
      return '<section class="hk-hero"><div class="hk-in hk-hero-in"><div class="hk-hero-tx">' +
        '<span class="hk-pill">2026 최신 기준으로 정리했어요</span>' +
        '<h1>복잡한 돈 문제,<br><em>숫자</em>로 쉽게 풀어드려요</h1>' +
        '<p>대출·보험·연금·세금까지, 꼭 필요한 기준과 계산 방법만 모았습니다.</p>' +
        '<form class="hk-big-sf" action="/search"><input name="q" placeholder="' + esc(C.ph) + '"><button>검색</button></form></div>' +
        '<div class="hk-hero-tiles">' + tiles([
          ['🏦', '대출', '대출', '금리·한도·상환'], ['🛡️', '보험', '보험', '해지·환급·비교'],
          ['📈', '연금', '연금', '수령·세금'], ['🧾', '세금', '세금', '환급·절세']]) + '</div></div></section>' +
        '<section class="hk-sec"><div class="hk-in"><h2>지금 많이 읽는 글</h2><div class="hk-rank">' +
        (P.length ? card(P[0], true) : '') + '<div class="hk-rows">' + top.map(row).join('') + '</div></div></div></section>' +
        '<section class="hk-sec hk-alt"><div class="hk-in"><h2>새로 올라온 글</h2><div class="hk-grid">' + rest.map(function (p) { return card(p); }).join('') + '</div></div></section>';
    },
    health: function (P) {
      var f = P[0];
      var th = f && f.img ? ' style="background-image:url(\'' + f.img.replace(/'/g, '%27') + '\')"' : '';
      return '<section class="hk-hero"><div class="hk-in hk-hero-in"><div class="hk-hero-tx">' +
        '<span class="hk-kick">HEALTH NOTE</span>' +
        '<h1>몸에 대한 정확한 정보,<br>차분하게 읽어보세요</h1>' +
        '<p>건강검진 시기와 비용, 수술·보험 청구까지 공식 기관 자료를 바탕으로 쉽게 풀어 씁니다.</p>' +
        '<div class="hk-cta"><a class="hk-btn" href="#hk-list">최신 글 보기</a><a class="hk-btn hk-ghost" href="' + q('건강검진') + '">건강검진 가이드</a></div></div>' +
        (f ? '<a class="hk-arch" href="' + f.u + '"' + th + '><span>이번 주 추천</span><strong>' + esc(f.t) + '</strong></a>' : '') + '</div></section>' +
        '<section class="hk-trust"><div class="hk-in"><div><i>📋</i><b>공식 자료 기반</b><span>보건복지부·건강보험공단 등 공개 자료를 확인해 씁니다</span></div>' +
        '<div><i>🗓️</i><b>기준일 표시</b><span>제도가 바뀌면 글을 고치고 작성 기준일을 남깁니다</span></div>' +
        '<div><i>🩺</i><b>진료를 대신하지 않아요</b><span>증상이 있다면 의료진과 먼저 상담하세요</span></div></div></section>' +
        '<section class="hk-sec" id="hk-list"><div class="hk-in"><h2>이달의 읽을거리</h2><div class="hk-mag">' + P.slice(0, 2).map(function (p) { return card(p, true); }).join('') + '</div>' +
        (P.length > 2 ? '<h2 class="hk-h2b">더 읽어보기</h2><div class="hk-grid">' + P.slice(2).map(function (p) { return card(p); }).join('') + '</div>' : '') + '</div></section>';
    },
    gov: function (P) {
      var pop = ['근로장려금', '출산지원금', '개인회생', '명의도용', '청년지원'].map(function (k) { return '<a href="' + q(k) + '">' + k + '</a>'; }).join('');
      return '<section class="hk-hero"><div class="hk-in hk-hero-in"><h1>어떤 지원금을 찾으세요?</h1>' +
        '<p>대상·조건·신청 방법을 한눈에 정리해 드립니다.</p>' +
        '<form class="hk-big-sf" action="/search"><input name="q" placeholder="' + esc(C.ph) + '"><button>검색</button></form>' +
        '<div class="hk-hot"><span>인기 검색어</span>' + pop + '</div></div></section>' +
        '<section class="hk-sec"><div class="hk-in"><h2>대상별 바로가기</h2><div class="hk-tiles">' + tiles([
          ['👶', '출산·육아', '출산', '지원금·급여'], ['🧑‍🎓', '청년', '청년', '수당·대출'], ['🏠', '주거', '주거', '월세·전세'],
          ['🧓', '노후·연금', '연금', '기초연금'], ['🏪', '소상공인', '소상공인', '정책자금'], ['💰', '세금환급', '환급', '장려금·환급']]) + '</div></div></section>' +
        '<section class="hk-sec"><div class="hk-in hk-two"><div class="hk-board"><h2>최신 안내</h2><div class="hk-tbl"><div class="hk-th2"><b>번호</b><span>제목</span><time>등록일</time></div>' +
        P.slice(0, 12).map(function (p, i) { return '<a class="hk-row" href="' + p.u + '"><b>' + (P.length - i) + '</b><span>' + esc(p.t) + '</span><time>' + p.d + '</time></a>'; }).join('') +
        '</div></div><aside class="hk-side"><h2>추천 안내</h2>' + P.slice(0, 2).map(function (p) { return card(p); }).join('') +
        '<div class="hk-note"><strong>확인해 주세요</strong><p>금액과 조건은 해마다 바뀝니다. 신청 전 복지로·정부24 등 공식 사이트에서 최신 내용을 확인하세요.</p></div></aside></div></section>';
    },
    garden: function (P) {
      var f = P[0], side = P.slice(1, 3), small = P.slice(3, 7);
      var chips = C.cats.map(function (c) { return '<a class="hk-chip" style="--cc:' + c[1] + '" href="/search/label/' + encodeURIComponent(c[0]) + '"><i>' + c[2] + '</i>' + esc(c[0]) + '</a>'; }).join('');
      var secs = C.cats.map(function (c) {
        var L = P.filter(function (p) { return p.cat === c[0]; }).slice(0, 4);
        if (!L.length) return '';
        return '<section class="hk-sec hk-catsec" style="--cc:' + c[1] + '"><div class="hk-in"><div class="hk-sechd"><h2><i>' + c[2] + '</i>' + esc(c[0]) + '</h2><a href="/search/label/' + encodeURIComponent(c[0]) + '">더 보기 →</a></div><div class="hk-grid">' +
          L.map(function (p) { return card(p); }).join('') + '</div></div></section>';
      }).join('');
      return '<section class="hk-hero"><div class="hk-in hk-hero-in"><div class="hk-hero-tx"><span class="hk-tag">JINEE GARDEN</span>' +
        '<h1>오늘 뭐 볼까?<br><em>궁금한 건 여기서</em></h1><p>여행 코스, 맛집과 레시피, 건강 상식, 생활 꿀팁까지 — 바로 써먹는 정보만 골라 담았어요.</p>' +
        '<form class="hk-big-sf" action="/search"><input name="q" placeholder="' + esc(C.ph) + '"><button>검색</button></form><div class="hk-chips">' + chips + '</div></div>' +
        (f ? '<a class="hk-pick" href="' + f.u + '"><span class="hk-pick-th"' + (f.img ? ' style="background-image:url(\'' + f.img.replace(/'/g, '%27') + '\')"' : '') + '></span><span class="hk-pick-bd"><em>오늘의 픽</em><strong>' + esc(f.t) + '</strong></span></a>' : '') + '</div></section>' +
        '<section class="hk-sec"><div class="hk-in"><div class="hk-sechd"><h2>방금 올라온 글</h2></div><div class="hk-bento">' +
        P.slice(0, 7).map(function (p, i) { return card(p, i === 0).replace('class="hk-card', 'class="hk-card hk-b' + i); }).join('') + '</div></div></section>' + secs;
    }
  };

  function footer() {
    var f = el('footer', 'hk-ft', '<div class="hk-in"><div class="hk-ft-l"><b>' + esc(C.name) + '</b><span>' + esc(C.tag) + '</span></div><div class="hk-ft-r" id="hk-pages"></div>' +
      '<p>본 사이트의 정보는 일반적인 참고용이며 전문적 조언이 아닙니다. 정확한 내용은 관련 기관에서 확인하세요.</p><small>© ' + new Date().getFullYear() + ' ' + esc(C.name) + '</small></div>');
    fetch('/feeds/pages/default?alt=json').then(function (r) { return r.json(); }).then(function (j) {
      var box = f.querySelector('#hk-pages'), es = (j.feed && j.feed.entry) || [];
      box.innerHTML = es.map(function (e) {
        var l = e.link.filter(function (x) { return x.rel === 'alternate'; })[0];
        return l ? '<a href="' + l.href + '">' + esc(e.title.$t) + '</a>' : '';
      }).join('');
    }).catch(function () {});
    return f;
  }

  function parse(j) {
    return ((j.feed && j.feed.entry) || []).map(function (e) {
      var c = e.content ? e.content.$t : '';
      var m = c.match(/<img[^>]+src=["']([^"']+)/);
      var txt = c.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/[←-⯿️\u{1F000}-\u{1FAFF}]/gu, '').replace(/\s+/g, ' ').trim();
      var l = e.link.filter(function (x) { return x.rel === 'alternate'; })[0];
      return { t: e.title.$t, u: l ? l.href : '#', d: e.published.$t.slice(0, 10).replace(/-/g, '.'), img: m ? m[1] : '', txt: txt.slice(0, 96) + (txt.length > 96 ? '…' : ''),
        labels: (e.category || []).map(function (x) { return x.term; }) };
    }).map(function (p) {
      if (C.cats) C.cats.forEach(function (c) { if (!p.cat && p.labels.indexOf(c[0]) >= 0) p.cat = c[0]; });
      return p;
    });
  }

  function listPath() {
    var m = location.pathname.match(/^\/search\/label\/(.+)$/);
    if (m) return { feed: '/feeds/posts/default/-/' + m[1] + '?alt=json&max-results=100', title: decodeURIComponent(m[1]), kind: '카테고리' };
    if (/^\/search\/?$/.test(location.pathname)) {
      var qq = (location.search.match(/[?&]q=([^&]*)/) || [])[1];
      if (qq) return { feed: '/feeds/posts/default?alt=json&max-results=100&q=' + qq, title: decodeURIComponent(qq.replace(/\+/g, ' ')), kind: '검색 결과' };
    }
    return null;
  }

  function start() {
    var b = document.body;
    b.classList.add('hk', 'hk-' + S);
    b.insertBefore(header(), b.firstChild);
    var hdr = b.firstChild;
    if (isHome()) {
      b.classList.add('hk-is-home');
      fetch('/feeds/posts/default?alt=json&max-results=60').then(function (r) { return r.json(); }).then(function (j) {
        var wrap = el('div', 'hk-home', HOME[S](parse(j)));
        hdr.parentNode.insertBefore(wrap, hdr.nextSibling);
        b.classList.add('hk-ready');
      }).catch(function () {});
    }
    var lp = listPath();
    if (lp) {
      b.classList.add('hk-is-list');
      fetch(lp.feed).then(function (r) { return r.json(); }).then(function (j) {
        var P = parse(j);
        var wrap = el('div', 'hk-home hk-list', '<section class="hk-sec"><div class="hk-in"><div class="hk-sechd"><h2>' + esc(lp.kind) + ' · ' + esc(lp.title) + '</h2><span>' + P.length + '개의 글</span></div>' +
          (P.length ? '<div class="hk-grid">' + P.map(function (p) { return card(p); }).join('') + '</div>' : '<p class="hk-empty">조건에 맞는 글이 없어요. 다른 키워드로 검색해 보세요.</p>') + '</div></section>');
        hdr.parentNode.insertBefore(wrap, hdr.nextSibling);
        b.classList.add('hk-ready');
      }).catch(function () {});
    }
    if (S === 'gov' && !isHome() && !lp) {
      var t = document.querySelector('.post-title, .entry-title');
      if (t) { var bc = el('div', 'hk-bc', '<div class="hk-in"><a href="/">홈</a><span>›</span><a href="/">안내</a><span>›</span><em>상세</em></div>'); hdr.appendChild(bc); }
    }
    b.appendChild(footer());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
