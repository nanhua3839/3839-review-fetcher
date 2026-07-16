/**
 * Web 云函数 - 返回 HTML 页面
 * 通过 HTTP 路由访问，直接返回完整的 HTML 内容
 */
const fs = require('fs');
const path = require('path');

exports.main = async (event) => {
  // 如果是 HTTP 触发，event 会有 headers 和 httpMethod
  // 云函数内嵌的 HTML 内容
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>3839 好游快爆评价读取工具</title>
<style>
:root {
  --primary: #4f6df5;
  --primary-dark: #3b54d4;
  --primary-light: #eef1ff;
  --bg: #f5f7fa;
  --card: #ffffff;
  --text: #1a1a2e;
  --text-secondary: #6b7280;
  --border: #e5e7eb;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --shadow: 0 2px 8px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 30px rgba(0,0,0,0.12);
  --radius: 12px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f172a;
    --card: #1e293b;
    --text: #e2e8f0;
    --text-secondary: #94a3b8;
    --border: #334155;
    --primary-light: #1e293b;
    --shadow: 0 2px 8px rgba(0,0,0,0.3);
    --shadow-lg: 0 8px 30px rgba(0,0,0,0.4);
  }
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  min-height: 100vh;
}
.container { max-width: 1100px; margin: 0 auto; padding: 20px 16px 60px; }
.header { text-align: center; padding: 40px 20px 30px; }
.header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
.header h1 span { color: var(--primary); }
.header p { color: var(--text-secondary); font-size: 15px; }
.logo-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--primary-light); color: var(--primary);
  padding: 6px 16px; border-radius: 20px; font-size: 13px;
  font-weight: 600; margin-bottom: 16px;
}
.input-card {
  background: var(--card); border-radius: var(--radius);
  box-shadow: var(--shadow); padding: 28px 24px; margin-bottom: 24px;
}
.input-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; }
.input-group { flex: 1; min-width: 240px; }
.input-group label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 6px; color: var(--text); }
.input-group input, .input-group select {
  width: 100%; padding: 12px 14px; border: 2px solid var(--border);
  border-radius: 10px; font-size: 15px; background: var(--bg); color: var(--text);
  transition: border-color 0.2s;
}
.input-group input:focus, .input-group select:focus { outline: none; border-color: var(--primary); }
.btn {
  padding: 12px 28px; border: none; border-radius: 10px; font-size: 15px;
  font-weight: 600; cursor: pointer; transition: all 0.2s;
  display: inline-flex; align-items: center; gap: 8px;
}
.btn-primary { background: var(--primary); color: #fff; }
.btn-primary:hover { background: var(--primary-dark); }
.btn-primary:disabled { background: var(--text-secondary); cursor: not-allowed; }
.btn-export { background: var(--success); color: #fff; }
.export-dropdown { position: relative; display: inline-block; }
.export-menu { display: none; position: absolute; right: 0; top: 100%; margin-top: 4px; background: var(--card); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow-lg); z-index: 100; min-width: 120px; overflow: hidden; }
.export-menu.active { display: block; }
.export-menu button { display: block; width: 100%; padding: 10px 16px; border: none; background: none; text-align: left; font-size: 14px; color: var(--text); cursor: pointer; transition: background 0.15s; }
.export-menu button:hover { background: var(--primary-light); }
.filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
.filter-tab { padding: 6px 16px; border: 2px solid var(--border); border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; background: var(--bg); color: var(--text-secondary); }
.filter-tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.filter-tab:hover:not(.active) { border-color: var(--primary); color: var(--primary); }
.type-badge.post { background: #fef3c7; color: #92400e; }
.progress-section { display: none; margin-bottom: 24px; }
.progress-section.active { display: block; }
.progress-card { background: var(--card); border-radius: var(--radius); box-shadow: var(--shadow); padding: 24px; }
.progress-bar-wrap { background: var(--border); border-radius: 20px; height: 8px; overflow: hidden; margin: 12px 0 8px; }
.progress-bar { height: 100%; background: linear-gradient(90deg, var(--primary), #7c8fff); border-radius: 20px; transition: width 0.5s ease; width: 0%; }
.progress-text { font-size: 14px; color: var(--text-secondary); display: flex; justify-content: space-between; }
.spinner { width: 18px; height: 18px; border: 2.5px solid var(--primary-light); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.stats-section { display: none; margin-bottom: 24px; }
.stats-section.active { display: block; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
.stat-card { background: var(--card); border-radius: var(--radius); box-shadow: var(--shadow); padding: 18px 20px; text-align: center; }
.stat-card .stat-value { font-size: 28px; font-weight: 700; color: var(--primary); margin-bottom: 4px; }
.stat-card .stat-label { font-size: 13px; color: var(--text-secondary); }
.table-section { display: none; }
.table-section.active { display: block; }
.table-card { background: var(--card); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
.table-header { padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--border); }
.table-header h3 { font-size: 16px; font-weight: 700; }
.table-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.search-box { padding: 8px 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 14px; background: var(--bg); color: var(--text); width: 200px; }
.search-box:focus { outline: none; border-color: var(--primary); }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
thead th { background: var(--bg); padding: 12px 16px; text-align: left; font-weight: 600; color: var(--text-secondary); font-size: 13px; white-space: nowrap; }
tbody td { padding: 12px 16px; border-bottom: 1px solid var(--border); vertical-align: top; }
tbody tr:hover { background: var(--primary-light); }
tbody tr:last-child td { border-bottom: none; }
.star-display { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; }
.star-display.s5 { background: #dcfce7; color: #15803d; }
.star-display.s4 { background: #dbeafe; color: #1d4ed8; }
.star-display.s3 { background: #fef9c3; color: #a16207; }
.star-display.s2 { background: #fee2e2; color: #b91c1c; }
.star-display.s1 { background: #fecaca; color: #991b1b; }
.star-display.s0 { background: var(--border); color: var(--text-secondary); }
.type-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; }
.type-badge.review { background: var(--primary-light); color: var(--primary); }
.type-badge.reply { background: #f3f4f6; color: var(--text-secondary); }
.content-cell { max-width: 400px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; cursor: pointer; }
.content-cell:hover { color: var(--primary); }
.link-btn { color: var(--primary); text-decoration: none; font-size: 13px; }
.link-btn:hover { text-decoration: underline; }
.modal-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; padding: 20px; }
.modal-overlay.active { display: flex; }
.modal { background: var(--card); border-radius: var(--radius); box-shadow: var(--shadow-lg); max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto; padding: 28px; }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.modal-header h3 { font-size: 18px; font-weight: 700; }
.modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-secondary); line-height: 1; padding: 0; }
.error-msg { display: none; background: #fee2e2; color: #991b1b; padding: 14px 18px; border-radius: 10px; margin-bottom: 16px; font-size: 14px; }
.error-msg.active { display: block; }
.footer { text-align: center; padding: 30px 20px; color: var(--text-secondary); font-size: 13px; }
.footer a { color: var(--primary); text-decoration: none; }
@media (max-width: 640px) {
  .header h1 { font-size: 22px; }
  .input-row { flex-direction: column; }
  .input-group { min-width: 100%; }
  .btn { width: 100%; justify-content: center; }
  .table-actions { flex-direction: column; }
  .search-box { width: 100%; }
  .modal { padding: 20px; }
}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo-badge">🎮 好游快爆评价读取工具</div>
    <h1>3839 <span>Review Fetcher</span></h1>
    <p>输入用户 UID 或主页链接，批量读取用户动态（评价/回复/帖子），支持多格式导出</p>
  </div>
  <div class="error-msg" id="errorMsg"></div>
  <div class="input-card">
    <div class="input-row">
      <div class="input-group">
        <label>用户 UID 或主页链接</label>
        <input type="text" id="uidInput" placeholder="输入 UID (如 20594033) 或粘贴主页链接" value="">
      </div>
      <div class="input-group" style="flex: 0 0 130px;">
        <label>读取数量 (1-100)</label>
        <input type="number" id="countInput" min="1" max="100" value="50" style="width: 100%;">
      </div>
      <button class="btn btn-primary" id="fetchBtn" onclick="startFetch()">
        <span id="fetchBtnText">🚀 开始读取</span>
      </button>
    </div>
  </div>
  <div class="progress-section" id="progressSection">
    <div class="progress-card">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <div class="spinner"></div>
        <span style="font-weight: 600; font-size: 15px;" id="progressTitle">正在读取评价...</span>
      </div>
      <div class="progress-bar-wrap"><div class="progress-bar" id="progressBar"></div></div>
      <div class="progress-text">
        <span id="progressDetail">准备中...</span>
        <span id="progressCount">0 / 0</span>
      </div>
    </div>
  </div>
  <div class="stats-section" id="statsSection"><div class="stats-grid" id="statsGrid"></div></div>
  <div class="table-section" id="tableSection">
    <div class="table-card">
      <div class="table-header">
        <h3>内容列表</h3>
        <div class="table-actions">
          <div class="filter-tabs">
            <span class="filter-tab active" data-filter="all" onclick="setFilter('all')">全部</span>
            <span class="filter-tab" data-filter="review" onclick="setFilter('review')">评价</span>
            <span class="filter-tab" data-filter="reply" onclick="setFilter('reply')">回复</span>
            <span class="filter-tab" data-filter="post" onclick="setFilter('post')">帖子</span>
          </div>
          <input type="text" class="search-box" id="searchBox" placeholder="搜索游戏名或内容..." oninput="filterTable()">
          <div class="export-dropdown">
            <button class="btn btn-export" onclick="toggleExportMenu()">📥 导出 ▾</button>
            <div class="export-menu" id="exportMenu">
              <button onclick="exportCSV()">CSV 格式</button>
              <button onclick="exportJSON()">JSON 格式</button>
              <button onclick="exportHTML()">HTML 格式</button>
            </div>
          </div>
        </div>
      </div>
      <div class="table-wrap"><table id="dataTable"><thead><tr>
        <th>序号</th><th>日期</th><th>评分</th><th>游戏名称</th><th>类型</th><th>内容</th><th>链接</th>
      </tr></thead><tbody id="tableBody"></tbody></table></div>
    </div>
  </div>
  <div class="footer">
    <div style="margin-bottom: 10px;">数据来源：<a href="https://www.3839.com" target="_blank">好游快爆 3839.com</a></div>
    <div style="margin-bottom: 6px; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.8;">
      <strong>免责声明</strong>：本工具仅供学习研究使用，所有数据来源于好游快爆公开信息，不存储任何用户数据。请勿用于商业用途或恶意爬取，使用本工具产生的一切后果由使用者自行承担。如有疑问请联系 <a href="mailto:1409069001@qq.com">1409069001@qq.com</a>
    </div>
  </div>
</div>
<div class="modal-overlay" id="modalOverlay" onclick="if(event.target===this)closeModal()">
  <div class="modal">
    <div class="modal-header">
      <h3 id="modalTitle"></h3>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div id="modalMeta" class="modal-meta" style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px;font-size:13px;color:var(--text-secondary);"></div>
    <div id="modalContent" style="font-size:15px;line-height:1.8;white-space:pre-wrap;word-break:break-word;"></div>
    <div id="modalLink" style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border);"></div>
  </div>
</div>
<script>
const API_URL = '/api';
let allReviews = [];
let currentFilter = 'all';
let sortCol = 'idx', sortAsc = true;

function showError(msg) {
  const el = document.getElementById('errorMsg');
  el.textContent = msg; el.classList.add('active');
}
function hideError() { document.getElementById('errorMsg').classList.remove('active'); }

function extractUid(input) {
  if (/^\\d+$/.test(input.trim())) return input.trim();
  const m = input.match(/user\\/(\\d+)/);
  if (m) return m[1];
  return input.trim();
}

async function fetchAPI(lastId, cursor, uid) {
  const body = 'ac=dynamic_home&last_id=' + lastId + '&cursor=' + cursor + '&vuid=' + uid;
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body
  });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  return resp.json();
}

function parseReview(item, idx) {
  const d = item;
  const dtype = d.dynamic_type || '';
  let gameName = '', reviewUrl = '', type = 'review', content = '', star = 0, playTime = '', date = '';

  if (dtype === 'comment_game') {
    type = 'review';
    gameName = (d.game_info && d.game_info.title) ? d.game_info.title : '';
    if (d.game_info && d.game_info.gid) {
      reviewUrl = 'https://m.3839.com/review/?pid=' + d.game_info.gid + '&fid=' + (d.fid || '') + '&cid=' + (d.id || '');
    }
    star = d.star !== undefined ? parseInt(d.star) : 0;
    playTime = d.play_time_str || d.game_time || '';
    date = d.addtime ? new Date(d.addtime * 1000).toISOString().slice(0,10) : '';
  } else if (dtype === 'topci_reply') {
    type = 'post';
    gameName = (d.topic_info && d.topic_info.title) ? d.topic_info.title : '';
    reviewUrl = d.tid ? 'https://www.3839.com/bbs/thread/' + d.tid : '';
    star = 0;
    date = d.time_str || (d.addtime ? new Date(d.addtime * 1000).toISOString().slice(0,10) : '');
  } else if (dtype === 'topci_reply_comment') {
    type = 'reply';
    gameName = (d.topic_info && d.topic_info.title) ? d.topic_info.title : '';
    reviewUrl = d.tid ? 'https://www.3839.com/bbs/thread/' + d.tid : '';
    star = 0;
    date = d.time_str || (d.addtime ? new Date(d.addtime * 1000).toISOString().slice(0,10) : '');
  } else {
    type = 'post';
    star = 0;
    date = d.time_str || (d.addtime ? new Date(d.addtime * 1000).toISOString().slice(0,10) : '');
  }

  let rawContent = d.content || d.title || '';
  content = rawContent.replace(/<br\\s*\\/?>/gi, '\\n').replace(/<[^>]+>/g, '').trim();
  return { idx, date, star, gameName, type, content, reviewUrl, playTime };
}

async function startFetch() {
  const input = document.getElementById('uidInput').value.trim();
  if (!input) { showError('请输入 UID 或主页链接'); return; }
  const uid = extractUid(input);
  let count = parseInt(document.getElementById('countInput').value);
  if (isNaN(count) || count < 1) count = 1;
  if (count > 100) count = 100;
  
  hideError();
  allReviews = [];
  document.getElementById('fetchBtn').disabled = true;
  document.getElementById('fetchBtnText').textContent = '读取中...';
  document.getElementById('progressSection').classList.add('active');
  document.getElementById('statsSection').classList.remove('active');
  document.getElementById('tableSection').classList.remove('active');
  
  let lastId = '0', cursor = 0;
  let maxBatches = 50;
  
  try {
    for (let batch = 0; batch < maxBatches && allReviews.length < count; batch++) {
      const result = await fetchAPI(lastId, cursor, uid);
      
      if (String(result.code) !== '100') {
        throw new Error(result.msg || 'API 返回错误: code=' + result.code);
      }
      
      const data = result.result && result.result.data ? result.result.data : [];
      if (data.length === 0) break;
      
      data.forEach((item) => {
        if (allReviews.length < count) {
          allReviews.push(parseReview(item, allReviews.length + 1));
        }
      });
      
      const pct = Math.min(100, Math.round((allReviews.length / count) * 100));
      document.getElementById('progressBar').style.width = pct + '%';
      document.getElementById('progressDetail').textContent = '已获取 ' + allReviews.length + ' 条内容...';
      document.getElementById('progressCount').textContent = allReviews.length + ' / ' + count;
      
      lastId = String(result.result.last_id || '-1');
      cursor = result.result.cursor || -1;
      
      if (lastId === '-1' || cursor === -1) break;
    }
    
    document.getElementById('progressBar').style.width = '100%';
    document.getElementById('progressSection').classList.remove('active');
    
    if (allReviews.length === 0) {
      showError('未获取到任何内容，请检查 UID 是否正确');
      document.getElementById('fetchBtn').disabled = false;
      document.getElementById('fetchBtnText').textContent = '🚀 开始读取';
      return;
    }
    
    showStats();
    renderTable(allReviews);
    document.getElementById('statsSection').classList.add('active');
    document.getElementById('tableSection').classList.add('active');
  } catch(e) {
    showError('读取失败: ' + e.message);
  } finally {
    document.getElementById('fetchBtn').disabled = false;
    document.getElementById('fetchBtnText').textContent = '🚀 开始读取';
  }
}

function showStats() {
  const total = allReviews.length;
  const reviews = allReviews.filter(r => r.type === 'review').length;
  const replies = allReviews.filter(r => r.type === 'reply').length;
  const posts = allReviews.filter(r => r.type === 'post').length;
  const games = new Set(allReviews.filter(r => r.type === 'review').map(r => r.gameName)).size;
  const dates = allReviews.filter(r => r.date).map(r => r.date).sort();
  const dateRange = dates.length > 0 ? dates[0] + ' ~ ' + dates[dates.length-1] : '-';
  const avgStar = reviews > 0 ? (allReviews.filter(r => r.type === 'review').reduce((s,r) => s + r.star, 0) / reviews).toFixed(1) : '-';
  
  const ratings = {};
  allReviews.forEach(r => { if (r.type === 'review') ratings[r.star] = (ratings[r.star]||0) + 1; });
  let ratingBadges = '';
  for (let s = 5; s >= 1; s--) {
    if (ratings[s]) ratingBadges += '<span class="star-display s'+s+'">'+s+'星: '+ratings[s]+'</span> ';
  }
  
  document.getElementById('statsGrid').innerHTML = 
    '<div class="stat-card"><div class="stat-value">'+total+'</div><div class="stat-label">总内容数</div></div>' +
    '<div class="stat-card"><div class="stat-value">'+reviews+'</div><div class="stat-label">游戏评价</div><div class="stat-detail">帖'+posts+' / 回复'+replies+'</div></div>' +
    '<div class="stat-card"><div class="stat-value">'+games+'</div><div class="stat-label">评价游戏数</div></div>' +
    '<div class="stat-card"><div class="stat-value">'+avgStar+'</div><div class="stat-label">平均评分</div><div class="stat-detail">'+ratingBadges+'</div></div>' +
    '<div class="stat-card"><div class="stat-value" style="font-size:16px;">'+escapeHtml(dateRange)+'</div><div class="stat-label">日期范围</div></div>';
}

function renderTable(data) {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = data.map(r => {
    const starClass = 's' + Math.max(0, Math.min(5, r.star));
    const typeClass = r.type;
    const typeLabel = r.type === 'review' ? '评价' : (r.type === 'reply' ? '回复' : '帖子');
    const contentShort = r.content.length > 80 ? r.content.substring(0, 80) + '...' : r.content;
    const safeGameName = escapeHtml(r.gameName || '-');
    const safeDate = escapeHtml(r.date);
    const safeUrl = r.reviewUrl ? escapeHtml(r.reviewUrl) : '';
    return '<tr>' +
      '<td style="text-align:center;color:var(--text-secondary);">' + r.idx + '</td>' +
      '<td style="white-space:nowrap;">' + safeDate + '</td>' +
      '<td style="white-space:nowrap;"><span class="star-display '+starClass+'">'+r.star+'星</span></td>' +
      '<td>' + safeGameName + '</td>' +
      '<td style="text-align:center;"><span class="type-badge '+typeClass+'">'+typeLabel+'</span></td>' +
      '<td class="content-cell" onclick="showDetail('+r.idx+')">' + escapeHtml(contentShort) + '</td>' +
      '<td style="text-align:center;">' + (safeUrl ? '<a class="link-btn" href="'+safeUrl+'" target="_blank" rel="noopener noreferrer">查看↗</a>' : '-') + '</td>' +
      '</tr>';
  }).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showDetail(idx) {
  const r = allReviews.find(x => x.idx === idx);
  if (!r) return;
  const typeLabel = r.type === 'review' ? '游戏评价' : (r.type === 'reply' ? '论坛回复' : '论坛帖子');
  document.getElementById('modalTitle').textContent = (r.gameName || typeLabel);
  const safeDate = escapeHtml(r.date);
  const safeStar = escapeHtml(String(r.star));
  const safeGameName = escapeHtml(r.gameName || '-');
  const safePlayTime = r.playTime ? escapeHtml(r.playTime) : '';
  const safeUrl = r.reviewUrl ? escapeHtml(r.reviewUrl) : '';
  const nameLabel = r.type === 'review' ? '🎮' : '💬';
  document.getElementById('modalMeta').innerHTML = 
    '<span>📅 ' + safeDate + '</span>' +
    (r.type === 'review' ? '<span>⭐ ' + safeStar + ' 星</span>' : '') +
    '<span>' + nameLabel + ' ' + safeGameName + '</span>' +
    (safePlayTime ? '<span>⏱ ' + safePlayTime + '</span>' : '');
  document.getElementById('modalContent').textContent = r.content || '(无内容)';
  const linkLabel = r.type === 'review' ? '查看原评价' : '查看原帖';
  document.getElementById('modalLink').innerHTML = safeUrl ? 
    '<a class="link-btn" href="'+safeUrl+'" target="_blank" rel="noopener noreferrer">'+linkLabel+' ↗</a>' : '';
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); }

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === filter);
  });
  filterTable();
}

function toggleExportMenu() {
  document.getElementById('exportMenu').classList.toggle('active');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.export-dropdown')) {
    document.getElementById('exportMenu').classList.remove('active');
  }
});

function filterTable() {
  const q = document.getElementById('searchBox').value.toLowerCase();
  let filtered = allReviews;
  if (currentFilter !== 'all') {
    filtered = filtered.filter(r => r.type === currentFilter);
  }
  if (q) {
    filtered = filtered.filter(r => 
      r.gameName.toLowerCase().includes(q) || r.content.toLowerCase().includes(q)
    );
  }
  renderTable(filtered);
}

function getFilteredData() {
  let filtered = allReviews;
  if (currentFilter !== 'all') {
    filtered = filtered.filter(r => r.type === currentFilter);
  }
  return filtered;
}

function exportCSV() {
  document.getElementById('exportMenu').classList.remove('active');
  const data = getFilteredData();
  const headers = ['序号','日期','评分','游戏名称','类型','游戏时长','内容','链接'];
  const rows = data.map(r => [
    r.idx, r.date, r.star + '星', r.gameName, 
    r.type === 'review' ? '评价' : (r.type === 'reply' ? '回复' : '帖子'),
    r.playTime, r.content, r.reviewUrl
  ]);
  let csv = '\\uFEFF' + headers.join(',') + '\\n';
  rows.forEach(row => {
    csv += row.map(cell => {
      const s = String(cell || '');
      return s.includes(',') || s.includes('"') || s.includes('\\n') ? '"' + s.replace(/"/g, '""') + '"' : s;
    }).join(',') + '\\n';
  });
  downloadBlob(csv, '3839_data_' + Date.now() + '.csv', 'text/csv;charset=utf-8');
}

function exportJSON() {
  document.getElementById('exportMenu').classList.remove('active');
  const data = getFilteredData().map(r => ({
    序号: r.idx, 日期: r.date, 评分: r.star, 游戏名称: r.gameName,
    类型: r.type === 'review' ? '评价' : (r.type === 'reply' ? '回复' : '帖子'),
    游戏时长: r.playTime, 内容: r.content, 链接: r.reviewUrl
  }));
  downloadBlob(JSON.stringify(data, null, 2), '3839_data_' + Date.now() + '.json', 'application/json');
}

function exportHTML() {
  document.getElementById('exportMenu').classList.remove('active');
  const data = getFilteredData();
  let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>3839 数据导出</title>';
  html += '<style>body{font-family:sans-serif;margin:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f7fa}tr:nth-child(even){background:#f9f9f9}</style>';
  html += '</head><body><h2>3839 好游快爆数据导出</h2><p>共 ' + data.length + ' 条记录</p>';
  html += '<table><thead><tr><th>序号</th><th>日期</th><th>评分</th><th>名称</th><th>类型</th><th>内容</th><th>链接</th></tr></thead><tbody>';
  data.forEach(r => {
    html += '<tr><td>' + r.idx + '</td><td>' + escapeHtml(r.date) + '</td><td>' + r.star + '星</td>';
    html += '<td>' + escapeHtml(r.gameName || '-') + '</td>';
    html += '<td>' + (r.type === 'review' ? '评价' : (r.type === 'reply' ? '回复' : '帖子')) + '</td>';
    html += '<td>' + escapeHtml(r.content) + '</td>';
    html += '<td>' + (r.reviewUrl ? '<a href="' + escapeHtml(r.reviewUrl) + '" target="_blank">查看</a>' : '-') + '</td></tr>';
  });
  html += '</tbody></table></body></html>';
  downloadBlob(html, '3839_data_' + Date.now() + '.html', 'text/html;charset=utf-8');
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

document.getElementById('uidInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') startFetch();
});
</script>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    },
    body: html
  };
};
