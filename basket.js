/**
 * basket.js — Record Basket for Analog Archivist prototype
 *
 * Self-contained IIFE. Load via:
 *   <script src="basket.js"></script>  (after data.js, before page script)
 *
 * Exposes two globals used by crate pages:
 *   basketToggle(album)   — add/remove album from basket
 *   basketIsBagged(id)    — returns true if album id is in basket
 */
(function () {
  'use strict';

  var BASKET_KEY = 'dig_basket';
  var MAX_BASKET = 20;
  var basket = [];

  // ── Persistence ─────────────────────────────────────────────────────────────

  function _save() {
    try { localStorage.setItem(BASKET_KEY, JSON.stringify(basket)); } catch (_) {}
  }

  function _load() {
    try {
      var raw = localStorage.getItem(BASKET_KEY);
      if (raw !== null) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          basket = parsed
            .filter(function (a) { return a && typeof a.id === 'string'; })
            .slice(0, MAX_BASKET);
        }
      }
    } catch (_) {}
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  window.basketToggle = function (album) {
    var idx = basket.findIndex(function (a) { return a.id === album.id; });
    if (idx !== -1) {
      basket.splice(idx, 1);
    } else {
      if (basket.length >= MAX_BASKET) basket.shift();
      basket.push({
        id: album.id,
        artist: album.artist,
        album: album.album,
        year: album.year || ''
      });
    }
    _save();
    _render();
  };

  window.basketIsBagged = function (id) {
    return basket.some(function (a) { return a.id === id; });
  };

  // ── Text export ──────────────────────────────────────────────────────────────

  function _toText() {
    if (!basket.length) return '';
    var header = 'Record Basket \u2014 ' + basket.length + ' album' + (basket.length === 1 ? '' : 's');
    var lines = basket.map(function (a, i) {
      var year = a.year ? ' (' + a.year + ')' : '';
      return (i + 1) + '. ' + a.artist + ' \u2014 ' + a.album + year;
    });
    return [header, ''].concat(lines).join('\n');
  }

  // ── HTML escaping ────────────────────────────────────────────────────────────

  function _esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Button sync ──────────────────────────────────────────────────────────────

  function _syncButtons() {
    document.querySelectorAll('.crate-btn').forEach(function (btn) {
      var bagged = window.basketIsBagged(btn.dataset.id);
      btn.textContent = bagged ? '\u2713 In crate' : '+ Crate';
      btn.classList.toggle('crate-btn--in', bagged);
    });
  }

  // ── Styles ───────────────────────────────────────────────────────────────────

  function _injectStyles() {
    var style = document.createElement('style');
    style.textContent = [
      '#basket-trigger{position:fixed;bottom:1.5rem;left:1.5rem;z-index:1000;',
      'background:#fcf9f8;border:1px solid #d8c3b1;',
      "font-family:'Space Grotesk',sans-serif;font-size:0.72rem;",
      'text-transform:uppercase;letter-spacing:0.12em;',
      'padding:0.5rem 0.85rem;cursor:pointer;display:none;',
      'transition:background 0.15s,border-color 0.15s,color 0.15s;}',

      '#basket-trigger:hover{background:#8c5000;color:#fff;border-color:#8c5000;}',

      '#basket-panel{position:fixed;top:0;left:0;width:320px;height:100vh;z-index:1001;',
      'background:#fcf9f8;border-right:1px solid #d8c3b1;',
      'display:flex;flex-direction:column;',
      "font-family:'Space Grotesk',sans-serif;",
      'transform:translateX(-100%);transition:transform 0.25s ease;',
      'visibility:hidden;}',

      '#basket-panel.basket-panel--open{transform:translateX(0);visibility:visible;}',

      '.basket-panel__header{display:flex;align-items:center;justify-content:space-between;',
      'padding:1.25rem 1.5rem;border-bottom:1px solid #d8c3b1;',
      'font-size:0.72rem;text-transform:uppercase;letter-spacing:0.12em;color:#534437;}',

      '#basket-close{background:none;border:none;cursor:pointer;',
      'font-size:1rem;color:#534437;padding:0;line-height:1;}',
      '#basket-close:hover{color:#1c1b1b;}',

      '#basket-panel-list{flex:1;overflow-y:auto;padding:0.5rem 0;}',

      '.basket-item{display:flex;align-items:center;justify-content:space-between;',
      'padding:0.65rem 1.5rem;border-bottom:1px solid #e8ddd5;gap:0.5rem;}',

      '.basket-item__label{font-size:0.8rem;color:#1c1b1b;flex:1;line-height:1.35;}',

      '.basket-item__remove{background:none;border:none;cursor:pointer;',
      'color:#867465;font-size:1rem;padding:0;flex-shrink:0;line-height:1;}',
      '.basket-item__remove:hover{color:#1c1b1b;}',

      '.basket-panel__empty{padding:2rem 1.5rem;font-size:0.78rem;',
      'color:#867465;text-align:center;}',

      '.basket-panel__actions{padding:1rem 1.5rem;border-top:1px solid #d8c3b1;',
      'display:flex;gap:0.5rem;}',

      '.basket-panel__actions button{flex:1;padding:0.5rem;border:1px solid #d8c3b1;',
      'background:transparent;',
      "font-family:'Space Grotesk',sans-serif;font-size:0.68rem;",
      'text-transform:uppercase;letter-spacing:0.1em;cursor:pointer;color:#534437;',
      'transition:background 0.15s,color 0.15s,border-color 0.15s;}',
      '.basket-panel__actions button:hover{background:#8c5000;color:#fff;border-color:#8c5000;}',

      '.crate-btn{display:inline-block;margin-top:0.5rem;padding:0.25rem 0.6rem;',
      'border:1px solid #d8c3b1;background:transparent;',
      "font-family:'Space Grotesk',sans-serif;font-size:0.62rem;",
      'text-transform:uppercase;letter-spacing:0.1em;cursor:pointer;color:#534437;',
      'transition:background 0.15s,color 0.15s,border-color 0.15s;}',
      '.crate-btn:hover{background:#8c5000;color:#fff;border-color:#8c5000;}',
      '.crate-btn.crate-btn--in{background:#8c5000;color:#fff;border-color:#8c5000;}',
      '.crate-btn.crate-btn--in:hover{background:#6b3d00;border-color:#6b3d00;}'
    ].join('');
    document.head.appendChild(style);
  }

  // ── Widget HTML ──────────────────────────────────────────────────────────────

  function _injectHTML() {
    var trigger = document.createElement('button');
    trigger.id = 'basket-trigger';
    trigger.setAttribute('aria-label', 'Open record basket');
    trigger.innerHTML = 'Crate (<span id="basket-count">0</span>)';
    trigger.addEventListener('click', _openPanel);
    document.body.appendChild(trigger);

    var panel = document.createElement('div');
    panel.id = 'basket-panel';
    panel.setAttribute('aria-label', 'Record basket');
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML =
      '<div class="basket-panel__header">' +
        '<span>Your Crate</span>' +
        '<button id="basket-close" aria-label="Close basket">\u2715</button>' +
      '</div>' +
      '<div id="basket-panel-list"></div>' +
      '<div class="basket-panel__actions">' +
        '<button id="basket-copy">Copy list</button>' +
        '<button id="basket-clear">Clear</button>' +
      '</div>';
    document.body.appendChild(panel);

    document.getElementById('basket-close').addEventListener('click', _closePanel);
    document.getElementById('basket-copy').addEventListener('click', _copy);
    document.getElementById('basket-clear').addEventListener('click', _clear);
  }

  function _openPanel() {
    document.getElementById('basket-panel').classList.add('basket-panel--open');
    document.getElementById('basket-panel').setAttribute('aria-hidden', 'false');
  }

  function _closePanel() {
    document.getElementById('basket-panel').classList.remove('basket-panel--open');
    document.getElementById('basket-panel').setAttribute('aria-hidden', 'true');
  }

  function _clear() {
    basket = [];
    _save();
    _render();
    _closePanel();
  }

  function _copy() {
    var text = _toText();
    if (!text) return;
    var btn = document.getElementById('basket-copy');
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(function () {
      btn.textContent = 'Copied!';
      setTimeout(function () { btn.textContent = 'Copy list'; }, 1500);
    }).catch(function () {});
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  function _render() {
    var trigger = document.getElementById('basket-trigger');
    var count   = document.getElementById('basket-count');
    var list    = document.getElementById('basket-panel-list');
    if (!trigger || !count || !list) return;

    count.textContent = basket.length;
    trigger.style.display = basket.length > 0 ? 'block' : 'none';

    if (!basket.length) {
      list.innerHTML = '<div class="basket-panel__empty">Your crate is empty.</div>';
    } else {
      list.innerHTML = basket.map(function (a) {
        var year  = a.year ? ' (' + a.year + ')' : '';
        var label = a.artist + ' \u2014 ' + a.album + year;
        return '<div class="basket-item" data-id="' + _esc(a.id) + '">' +
          '<span class="basket-item__label">' + _esc(label) + '</span>' +
          '<button class="basket-item__remove" aria-label="Remove ' + _esc(a.album) + '">\u00d7</button>' +
          '</div>';
      }).join('');

      list.querySelectorAll('.basket-item__remove').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.closest('.basket-item').dataset.id;
          basket = basket.filter(function (a) { return a.id !== id; });
          _save();
          _render();
        });
      });
    }

    _syncButtons();
  }

  // ── Boot ─────────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    _load();
    _injectStyles();
    _injectHTML();
    _render();
  });

}());
