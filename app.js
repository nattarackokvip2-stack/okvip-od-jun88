let myRole = ""; 
  let currentUsername = ""; 
  let allUsersData = []; 
  let allPortalsData = []; 
  let allBackendsData = []; 
  let allManualsData = []; 
  let allAnnouncements = []; 
  let currentDeptFilter = 'ALL'; 
  let currentSearchTerm = ''; 
  let currentPage = 1; 
  const itemsPerPage = 10;
  
  let currentManualFilter = 'ALL'; 
  let currentlyViewingManualId = null; 
  let currentlyViewingSteps = []; 
  let manualSearchTerm = '';
  
  let isDraggingStamp = false; 
  let unsavedChanges = {}; 
  let scheduleSearchTerm = ''; 
  let currentScheduleFilter = 'ALL';
  
  let sysSettings = { websites: [], dutyTypes: [], statMetrics: [], userSites: {} };
  let dailyDutiesData = {}; 
  let dailyStatsData = {}; 
  let dailyScheduleData = {}; 
  let dailyMealData = {}; 
  
  let currentJobTab = 'duty'; 
  let currentJobFilter = 'ALL'; 
  let jobSearchTerm = ''; 
  let isShowingHiddenUsers = false;
  
  let mealSearchTerm = ''; 
  let allPenalties = []; 
  let tempSetupNick = "";

  // ==========================================
  // 🚀 1. ตั้งค่า Supabase
  // ==========================================
  const supabaseUrl = 'https://codroyfpjhybvmispvzg.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvZHJveWZwamh5YnZtaXNwdnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNjQ2NzIsImV4cCI6MjA5MDY0MDY3Mn0.jakTDxsIOCbdsbjXMBdO6cGKvgvj6IoWk_foXELRA84';
  const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

  const stampConfig = {
    'X':  { bg: 'rgba(255, 51, 102, 0.2)', text: '#ff3366', label: 'X (หยุด)', limit: 4 },
    'XX': { bg: 'rgba(255, 204, 0, 0.2)', text: '#ffcc00', label: 'XX (หยุดพิเศษ)', limit: 2 },
    'TX': { bg: 'rgba(0, 85, 255, 0.3)', text: '#4da6ff', label: 'TX (สลับหยุด)', limit: 4 }, 
    'PN': { bg: 'rgba(139, 69, 19, 0.2)', text: '#d2691e', label: 'PN (พักร้อน)', limit: 15 }, 
    'KP': { bg: 'rgba(255, 153, 51, 0.2)', text: '#ff9933', label: 'KP (ขาดงาน)', limit: 99 }, 
    'L':  { bg: 'rgba(255, 204, 0, 0.8)', text: '#ff0000', label: 'L (สาย)', limit: 99 }, 
    'X4': { bg: 'rgba(204, 102, 255, 0.2)', text: '#cc66ff', label: 'X4 (ปจด.)', limit: 1 }, 
    'D':  { bg: 'rgba(0, 255, 102, 0.2)', text: '#00ff66', label: 'D (ดึก)', limit: 99 }, 
    'N':  { bg: 'rgba(0, 240, 255, 0.2)', text: '#00f0ff', label: 'N (เช้า)', limit: 99 }, 
    'M':  { bg: 'rgba(255, 253, 208, 0.2)', text: '#ffffe0', label: 'M (อื่นๆ)', limit: 99 }, 
    '':   { bg: 'transparent', text: '#aaaaaa', label: 'ลบ (ยางลบ)', limit: 99 }
  };
  
  const offDutyStamps = ['X', 'XX', 'TX', 'PN', 'KP'];

  const mealTimeBlocks = [
      { name: "OD ปอยเปต / ODOL (รอบ 1) [02:00-04:00]", start: "02:00", end: "04:00", type: "OD_POIPET" },
      { name: "OD ปอยเปต / ODOL (รอบ 2) [07:00-10:00]", start: "07:00", end: "10:00", type: "OD_POIPET" },
      { name: "OD ปอยเปต / ODOL (รอบ 3) [12:00-14:00]", start: "12:00", end: "14:00", type: "OD_POIPET" },
      { name: "OD ปอยเปต / ODOL (รอบ 4) [16:30-18:30]", start: "16:30", end: "18:30", type: "OD_POIPET" },
      { name: "OD ปอยเปต / ODOL (รอบ 5) [21:00-23:00]", start: "21:00", end: "23:00", type: "OD_POIPET" },
      { name: "OD ลาว (รอบ 1) [04:00-07:00]", start: "04:00", end: "07:00", type: "OD_LAOS" },
      { name: "OD ลาว (รอบ 2) [10:00-13:00]", start: "10:00", end: "13:00", type: "OD_LAOS" },
      { name: "OD ลาว (รอบ 3) [16:00-18:00]", start: "16:00", end: "18:00", type: "OD_LAOS" },
      { name: "OD ลาว (รอบ 4) [22:00-00:00]", start: "22:00", end: "24:00", type: "OD_LAOS" }
  ];

  function generateTimeSlots(start, end) {
      let slots = [];
      let [sH, sM] = start.split(':').map(Number);
      let [eH, eM] = end.split(':').map(Number);
      let currentMins = sH * 60 + sM;
      let endMins = eH * 60 + eM;
      if (endMins <= currentMins) endMins += 24 * 60; 
      while (currentMins < endMins) {
          let nextMins = currentMins + 30;
          let cStr = `${String(Math.floor(currentMins / 60) % 24).padStart(2, '0')}:${String(currentMins % 60).padStart(2, '0')}`;
          let nStr = `${String(Math.floor(nextMins / 60) % 24).padStart(2, '0')}:${String(nextMins % 60).padStart(2, '0')}`;
          if(nStr === "00:00" && currentMins >= 23 * 60) nStr = "24:00";
          slots.push(`${cStr}-${nStr}`);
          currentMins = nextMins;
      }
      return slots;
  }

  function compressImage(file, callback) {
      Swal.fire({ title: 'กำลังประมวลผลรูปภาพ...', allowOutsideClick: false, didOpen: () => { Swal.showLoading() } });
      const reader = new FileReader(); reader.readAsDataURL(file);
      reader.onload = event => {
          const img = new Image(); img.src = event.target.result;
          img.onload = () => {
              const canvas = document.createElement('canvas'); const MAX_WIDTH = 1920; 
              let width = img.width; let height = img.height;
              if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
              canvas.width = width; canvas.height = height; 
              const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.9); 
              Swal.close(); callback(compressedBase64);
          };
      };
  }

  function setupPasteArea(areaId, fileId, processCallback) {
      const area = document.getElementById(areaId); const fileInput = document.getElementById(fileId);
      if(area && fileInput) {
          area.addEventListener('click', () => fileInput.click());
          fileInput.addEventListener('change', function(e) { if(e.target.files && e.target.files[0]) compressImage(e.target.files[0], processCallback); });
          area.addEventListener('paste', function(e) {
              e.preventDefault(); const items = (e.clipboardData || e.originalEvent.clipboardData).items; let imageFound = false;
              for (let i = 0; i < items.length; i++) { 
                  if (items[i].kind === 'file' && items[i].type.includes('image/')) { compressImage(items[i].getAsFile(), processCallback); imageFound = true; break; } 
              }
              if (!imageFound) Swal.fire({ toast: true, position: 'top-end', title: 'ไม่พบรูปภาพ!', icon: 'error', showConfirmButton: false, timer: 3000, background: '#111', color: '#fff' });
          });
      }
  }

  window.onload = function() {
    setupPasteArea('stepPasteArea', 'stepMediaFile', processStepImage);
    setupPasteArea('portalPasteArea', 'portalMediaFile', processPortalImage);
    setupPasteArea('backendPasteArea', 'backendMediaFile', processBackendImage);
    
    const now = new Date();
    const todayStr = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0') + "-" + String(now.getDate()).padStart(2, '0');
    const thisMonthStr = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0'); 
    
    document.getElementById('monthPicker').value = thisMonthStr;
    if(document.getElementById('penaltyMonthFilter')) document.getElementById('penaltyMonthFilter').value = thisMonthStr; 

    if(document.getElementById('jobDatePicker')) document.getElementById('jobDatePicker').value = todayStr;
    if(document.getElementById('mealDatePicker')) document.getElementById('mealDatePicker').value = todayStr; 
    
    renderStampPalette();
    const sUser = localStorage.getItem('okvip_user'); const sRole = localStorage.getItem('okvip_role'); const sNick = localStorage.getItem('okvip_nick'); const sTime = localStorage.getItem('okvip_time');
    
    if(sUser && sRole && sTime) {
      const diffHours = (now.getTime() - parseInt(sTime)) / (1000 * 60 * 60); 
      if (diffHours >= 12) { handleLogout(); return; }
      document.getElementById('loginPage').style.display = 'none'; document.getElementById('mainDashboard').style.display = 'block';
      document.getElementById('userTable').innerHTML = `<tr><td colspan="8" class="text-center text-muted py-5">⏳ กำลังโหลด...</td></tr>`;
      verifyUserStatus(sUser, sNick, sRole, false); 
    }
  }

  // ==========================================
  // 🚀 2. ระบบ Core Data Loader
  // ==========================================
  async function refreshData(btn, isLoginEvent = false) {
      if(btn) { btn.disabled = true; btn.innerHTML = '⏳...'; }
      try {
          await Promise.all([
              loadSupabaseUsers(),
              loadSupabaseSettings(),
              loadSupabaseWebsites(),
              loadSupabasePenalties(),
              loadSupabaseManuals(),
              loadSupabaseAnnouncements(),
              loadSupabaseLeaves() 
          ]);
          await loadScheduleTable();
          await loadDailyJobData();
          await loadDailyMealData(); 

          if(btn) { btn.disabled = false; btn.innerText = '🔄 รีเฟรช'; }
          if(isLoginEvent) showLoginAnnouncement();
          else if(btn) Swal.fire({toast: true, position: 'top-end', title: '🚀 โหลดข้อมูลสำเร็จ', icon: 'success', showConfirmButton: false, timer: 1500, background: '#111', color: '#fff'});

      } catch (err) {
          console.error(err); Swal.fire('Error', 'โหลดข้อมูลล้มเหลว', 'error');
          if(btn) { btn.disabled = false; btn.innerText = '🔄 รีเฟรช'; }
      }
  }

  async function loadSupabaseSettings() {
      const { data: jsData } = await supabaseClient.from('job_settings').select('*').limit(1);
      if (jsData && jsData.length > 0) {
          sysSettings.websites = jsData[0].websites ? JSON.parse(jsData[0].websites) : [];
          sysSettings.dutyTypes = jsData[0].dutyTypes ? JSON.parse(jsData[0].dutyTypes) : [];
      }
      const { data: usData } = await supabaseClient.from('user_sites').select('*');
      sysSettings.userSites = {};
      if (usData) usData.forEach(r => sysSettings.userSites[r.nickname] = r.capableSites ? JSON.parse(r.capableSites) : []);
  }

  async function loadSupabaseUsers() {
      const { data, error } = await supabaseClient.from('users').select('*').order('id', { ascending: true });
      if (error) throw error;
      allUsersData = data.map(item => [ item.id, item.nickname, item.workGroup, item.department, item.username, item.password, item.role, item.status || 'Active', item.telegram || '', item.shiftSet || '' ]);
      loadUsers(); updatePenaltySelect();
  }

  async function loadSupabaseManuals() {
      const { data } = await supabaseClient.from('manuals').select('*').order('id', { ascending: true });
      allManualsData = (data || []).map(r => [r.id, r.department, r.category, r.title, r.stepsData || "[]"]);
      renderManualGrid();
  }

  // ==========================================
  // 📢 2.5 ระบบประกาศข่าวสาร 
  // ==========================================
  async function loadSupabaseAnnouncements() {
      const { data } = await supabaseClient.from('announcements').select('*').order('id', { ascending: false });
      allAnnouncements = data || []; renderAnnouncementsTable();
  }
  function renderAnnouncementsTable() {
      const tb = document.getElementById('announceTableBody'); tb.innerHTML = '';
      if(allAnnouncements.length === 0) { tb.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">ยังไม่มีประกาศ</td></tr>`; return; }
      allAnnouncements.forEach(a => {
          let statusBadge = (a.is_active === 'true' || a.is_active === true) ? `<span class="badge bg-success border border-success px-3 py-2">✅ กำลังโชว์</span>` : `<span class="badge bg-secondary border border-secondary px-3 py-2">ปิด</span>`;
          let contentPreview = a.content.substring(0, 50) + (a.content.length > 50 ? '...' : '');
          let dateStr = new Date(a.created_at).toLocaleDateString('th-TH');
          let tools = (myRole !== 'Member') ? `<button class="btn btn-sm btn-outline-info me-1" onclick="editAnnouncement('${a.id}')">✏️</button><button class="btn btn-sm btn-outline-danger" onclick="deleteAnnouncement('${a.id}')">✖</button>` : '-';
          tb.innerHTML += `<tr><td>${statusBadge}</td><td class="fw-bold text-warning">${a.title}</td><td class="small text-muted">${contentPreview}</td><td class="text-muted small">${dateStr}</td><td class="text-center">${tools}</td></tr>`;
      });
  }
  function showLoginAnnouncement() {
      const activeAnn = allAnnouncements.find(a => a.is_active === true || a.is_active === 'true' || a.is_active === 't');
      if(activeAnn) { Swal.fire({ title: '📢 ประกาศจากระบบ', html: `<h5 class="text-warning mt-2 mb-3 fw-bold">${activeAnn.title}</h5><div class="text-start" style="white-space: pre-wrap; color: #ddd; font-size: 0.95rem; background: #111; padding: 15px; border-radius: 10px; border: 1px solid #333;">${activeAnn.content}</div>`, icon: 'info', background: '#151518', color: '#fff', confirmButtonText: 'รับทราบ (เข้าสู่ระบบ)', confirmButtonColor: '#ff9900', allowOutsideClick: false }); }
  }
  function openAnnounceModal() { document.getElementById('announceForm').reset(); document.getElementById('editAnnounceId').value = ''; document.getElementById('announceModalTitle').innerText = '📢 สร้างประกาศใหม่'; bootstrap.Modal.getOrCreateInstance(document.getElementById('announceModal')).show(); }
  function editAnnouncement(id) {
      const ann = allAnnouncements.find(a => a.id.toString() === id.toString()); if(!ann) return;
      document.getElementById('editAnnounceId').value = ann.id; document.getElementById('annTitle').value = ann.title; document.getElementById('annContent').value = ann.content; document.getElementById('annActive').checked = (ann.is_active === true || ann.is_active === 'true');
      document.getElementById('announceModalTitle').innerText = '✏️ แก้ไขประกาศ'; bootstrap.Modal.getOrCreateInstance(document.getElementById('announceModal')).show(); 
  }
  async function handleAnnounceSubmit(e) {
      e.preventDefault(); const id = document.getElementById('editAnnounceId').value; const title = document.getElementById('annTitle').value; const content = document.getElementById('annContent').value; const isActive = document.getElementById('annActive').checked;
      const btn = document.querySelector('#announceForm button[type="submit"]'); btn.disabled = true; btn.innerText = '⏳ กำลังบันทึก...';
      try {
          if (isActive) await supabaseClient.from('announcements').update({ is_active: 'false' }).neq('id', '0');
          if (id) await supabaseClient.from('announcements').update({ title, content, is_active: isActive.toString() }).eq('id', id);
          else await supabaseClient.from('announcements').insert([{ title, content, is_active: isActive.toString() }]);
          bootstrap.Modal.getOrCreateInstance(document.getElementById('announceModal')).hide(); await loadSupabaseAnnouncements(); Swal.fire({toast:true, position:'top-end', title:'บันทึกประกาศสำเร็จ', icon:'success', timer:1500, showConfirmButton:false, background:'#111', color:'#fff'});
      } catch (err) { Swal.fire('Error', err.message, 'error'); } finally { btn.disabled = false; btn.innerText = '💾 บันทึกประกาศ'; }
  }
  async function deleteAnnouncement(id) { Swal.fire({title:'ลบประกาศนี้?', icon:'warning', showCancelButton:true, confirmButtonColor:'#ff3366', background:'#111', color:'#fff'}).then(async r => { if(r.isConfirmed) { Swal.fire({title:'กำลังลบ...', didOpen:()=>Swal.showLoading()}); await supabaseClient.from('announcements').delete().eq('id', id); await loadSupabaseAnnouncements(); Swal.fire({toast:true, position:'top-end', title:'ลบสำเร็จ', icon:'success', timer:1500, showConfirmButton:false, background:'#111', color:'#fff'}); } }); }

  // ==========================================
  // 🚀 3. ระบบ Login & พนักงาน
  // ==========================================
  async function handleLogin() {
      const u = document.getElementById('user').value; const p = document.getElementById('pass').value; const btn = document.getElementById('loginBtn');
      if(!u || !p) { Swal.fire({title:'เตือน', text:'กรอกข้อมูลให้ครบ', icon:'warning', background:'#111', color:'#fff'}); return; }
      btn.disabled = true; btn.innerText = 'Checking...';
      try {
          const { data, error } = await supabaseClient.from('users').select('*').eq('username', u).eq('password', p).single();
          if (error || !data) { Swal.fire({title:'Error', text:'ยูสเซอร์หรือรหัสผ่านไม่ถูกต้อง', icon:'error', background:'#111', color:'#fff'}); btn.disabled = false; btn.innerText = 'เข้าสู่ระบบ'; return; }
          if (data.status === 'Blocked') { Swal.fire({title:'Error', text:'บัญชีนี้ถูกระงับการใช้งาน', icon:'error', background:'#111', color:'#fff'}); btn.disabled = false; btn.innerText = 'เข้าสู่ระบบ'; return; }
          
          localStorage.setItem('okvip_user', u); localStorage.setItem('okvip_role', data.role); localStorage.setItem('okvip_nick', data.nickname); localStorage.setItem('okvip_time', new Date().getTime().toString());
          currentUsername = u; document.getElementById('loginPage').style.display = 'none'; document.getElementById('mainDashboard').style.display = 'block';
          verifyUserStatus(u, data.nickname, data.role, true); 
      } catch (err) { Swal.fire({title:'Error', text:'เกิดข้อผิดพลาดในการล็อคอิน', icon:'error', background:'#111', color:'#fff'}); btn.disabled = false; btn.innerText = 'เข้าสู่ระบบ'; }
  }

  function handleLogout() { localStorage.clear(); document.getElementById('mainDashboard').style.display = 'none'; document.getElementById('loginPage').style.display = 'flex'; document.getElementById('user').value = ''; document.getElementById('pass').value = ''; const loginBtn = document.getElementById('loginBtn'); if(loginBtn) { loginBtn.disabled = false; loginBtn.innerText = 'เข้าสู่ระบบ'; } }
  
  function verifyUserStatus(user, nick, role, isLoginEvent = false) {
    myRole = role; currentUsername = user; document.getElementById('userDisplay').innerText = nick; document.getElementById('roleLabel').innerText = role; document.getElementById('roleLabel').className = `role-${role}`;
    document.getElementById('stampToolbox').style.setProperty('display', 'flex', 'important');
    if(myRole !== 'Member') { 
        document.getElementById('btnClearSchedule').style.display = 'inline-block'; 
        document.getElementById('btnAssignShift').style.display = 'inline-block'; 
        document.getElementById('addBtn').style.display = 'block'; 
        document.getElementById('addPenaltyBtn').style.display = (myRole === 'SuperAdmin') ? 'block' : 'none';
        document.getElementById('addManualBtn').style.display = 'block'; 
        document.getElementById('btnJobSettings').style.display = 'block'; 
        document.getElementById('addAnnounceBtn').style.display = 'block'; 
        const isFrontend = document.getElementById('tabFrontEnd').classList.contains('active'); 
        document.getElementById('addPortalBtn').style.display = isFrontend ? 'block' : 'none'; 
        document.getElementById('addBackendBtn').style.display = isFrontend ? 'none' : 'block'; 
        document.getElementById('thAnnounceManage').style.display = 'table-cell';
        document.getElementById('mealActionBtns').style.display = 'flex';
    } else { 
        document.getElementById('btnClearSchedule').style.display = 'none'; 
        document.getElementById('btnAssignShift').style.display = 'none'; 
        document.getElementById('addAnnounceBtn').style.display = 'none'; 
        document.getElementById('thAnnounceManage').style.display = 'none';
        document.getElementById('mealActionBtns').style.display = 'none';
    }
    renderStampPalette(); switchMainTab('hubSection'); refreshData(document.getElementById('refreshBtn'), isLoginEvent);
  }

  function switchMainTab(sectionId) { 
      try {
          if (unsavedChanges && Object.keys(unsavedChanges).length > 0 && sectionId !== 'holidaySection' && sectionId !== 'hubSection') { 
              Swal.fire({title:'ลืมบันทึกตาราง!', text:"กรุณากดปุ่มบันทึกข้อมูลตารางก่อนเปลี่ยนหน้าครับ", icon:'warning', background:'#111', color:'#fff'}); 
              return; 
          } 
          document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active')); 
          const target = document.getElementById(sectionId);
          if (target) target.classList.add('active'); 
          const nav = document.getElementById('topNavBar');
          if (nav) nav.style.display = (sectionId === 'hubSection') ? 'none' : 'flex'; 
      } catch(e) { console.error(e); }
  }
  function goToHub() { switchMainTab('hubSection'); }

  function getRoleWeight(roleStr) { if (!roleStr) return 3; const r = roleStr.toString().trim(); if (r === 'SuperAdmin') return 1; if (r === 'Admin') return 2; return 3; }
  function filterStaffDept(dept, btn) { currentDeptFilter = dept; currentPage = 1; document.querySelectorAll('#staffSection .dept-badge').forEach(b => { b.classList.remove('active'); b.style.borderColor = "#444"; b.style.boxShadow = "none"; b.style.color = "#ccc"; }); btn.classList.add('active'); btn.style.borderColor = "#fff"; btn.style.boxShadow = "0 0 10px rgba(255,255,255,0.5)"; btn.style.color = "#fff"; loadUsers(); }
  function handleSearch(term) { currentSearchTerm = term.toLowerCase().trim(); currentPage = 1; loadUsers(); }
  function changePage(page) { currentPage = page; loadUsers(); }

  function loadUsers() {
    const tbody = document.getElementById('userTable'); const paginationArea = document.getElementById('paginationArea'); tbody.innerHTML = ''; paginationArea.innerHTML = '';
    let filteredData = allUsersData.filter(row => {
        if (!row || !row[1]) return false; 
        const dept = row[3] ? row[3].toString() : ''; const nick = row[1] ? row[1].toString().toLowerCase() : ''; const user = row[4] ? row[4].toString().toLowerCase() : '';
        if(currentDeptFilter !== 'ALL' && dept !== currentDeptFilter && !dept.startsWith(currentDeptFilter.split(' ')[0])) return false;
        if(currentSearchTerm && !nick.includes(currentSearchTerm) && !user.includes(currentSearchTerm)) return false;
        return true;
    });
    if (filteredData.length === 0) { tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">ไม่พบรายชื่อที่ค้นหา</td></tr>`; return; }
    filteredData.sort((a, b) => getRoleWeight(a[6]) - getRoleWeight(b[6]));
    const totalPages = Math.ceil(filteredData.length / itemsPerPage); if (currentPage > totalPages) currentPage = totalPages;
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    paginatedData.forEach(row => {
      const origIdx = allUsersData.findIndex(r => r[0] === row[0] && r[1] === row[1]); const sClass = row[7] === 'Active' ? 'status-active' : 'status-blocked'; const tgData = row[8] ? row[8] : ''; const tgDisp = tgData ? `<span class="text-info fw-bold">${tgData}</span>` : `<span class="text-muted small">ยังไม่ระบุ</span>`; const setBadge = row[9] ? `<span class="badge border border-info text-info">${row[9]}</span>` : '-';
      let toolsTd = ''; 
      if (row[4] === currentUsername) { toolsTd = `<td><div class="d-flex gap-1 justify-content-center align-items-center"><span class="badge bg-dark text-secondary border border-secondary px-3 py-2">บัญชีของฉัน</span><button class="tool-btn telegram" onclick="changeTelegram(${origIdx}, '${tgData}', '${row[1]}')">💬</button><button class="tool-btn edit" onclick="openEditUserModal(${origIdx})">📝</button></div></td>`; } 
      else if (myRole === 'SuperAdmin' || myRole === 'Admin') {
          if (getRoleWeight(myRole) < getRoleWeight(row[6])) toolsTd = `<td><div class="d-flex gap-1 justify-content-center align-items-center"><button class="tool-btn edit" onclick="openEditUserModal(${origIdx})">📝</button><button class="tool-btn settings" onclick="changeStatus(${origIdx},'${row[7]}')">⚙️</button><button class="tool-btn delete" onclick="confirmDeleteUser(${origIdx}, '${row[1]}')">🗑️</button></div></td>`;
          else toolsTd = `<td><div class="d-flex gap-1 justify-content-center align-items-center"><span class="badge bg-dark text-danger border border-danger opacity-75 px-3 py-2">🔒 ไม่มีสิทธิ์</span></div></td>`;
      } else { toolsTd = `<td></td>`; }
      tbody.innerHTML += `<tr><td class="fw-bold">${row[1]}</td><td>${setBadge}</td><td>${row[3]}</td><td>${row[4]}</td><td class="role-${row[6]}">${row[6]}</td><td><span class="${sClass}">${row[7]}</span></td><td>${tgDisp}</td>${toolsTd}</tr>`;
    });
    if (totalPages > 1) { let pageHtml = `<button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>&laquo; ก่อนหน้า</button>`; for (let i = 1; i <= totalPages; i++) pageHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`; pageHtml += `<button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>ถัดไป &raquo;</button>`; paginationArea.innerHTML = pageHtml; }
  }

  function changeTelegram(idx, currentTelegram, name) { Swal.fire({ title: `อัปเดตช่องทางติดต่อ`, html: `<div class="small text-muted mb-3 text-start">ตั้งค่า Telegram ให้กับ: <b class="text-white">${name}</b></div>`, input: 'text', inputPlaceholder: '@username', inputValue: currentTelegram, showCancelButton: true, confirmButtonText: 'บันทึก', confirmButtonColor: '#0088cc', background: '#111', color: '#fff', inputValidator: (value) => { if (!value) return 'กรุณาระบุ Telegram!'; } }).then(async (result) => { if (result.isConfirmed) { let tg = result.value.trim(); if (!tg.startsWith('@')) tg = '@' + tg; const userId = allUsersData[idx][0]; await supabaseClient.from('users').update({ telegram: tg }).eq('id', userId); Swal.fire({toast:true, position:'top-end', title:'อัปเดตสำเร็จ!', icon:'success', background:'#111', color:'#fff', timer:1500, showConfirmButton:false}); refreshData(document.getElementById('refreshBtn')); } }); }
  function changeStatus(idx, current) { const optionsHtml = `<div class="text-start mb-2" style="font-size:0.9rem; color:#aaa;">เลือกสถานะใหม่:</div><select id="swal-status-select" class="swal2-select mx-0"><option value="Active" ${current === 'Active' ? 'selected' : ''}>🟢 Active</option><option value="Blocked" ${current === 'Blocked' ? 'selected' : ''}>🔴 Blocked</option></select>`; Swal.fire({ html: optionsHtml, showCancelButton: true, confirmButtonText: 'บันทึก', background:'#111', color:'#fff', preConfirm: () => { return document.getElementById('swal-status-select').value; } }).then(async r => { if(r.isConfirmed) { const userId = allUsersData[idx][0]; await supabaseClient.from('users').update({ status: r.value }).eq('id', userId); refreshData(document.getElementById('refreshBtn')); } }); }
  function confirmDeleteUser(idx, name) { Swal.fire({ title: `ลบ "${name}" ?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff3366', background: '#111', color: '#fff' }).then(async (r) => { if (r.isConfirmed) { Swal.fire({title:'กำลังลบ...', didOpen:()=>Swal.showLoading()}); const userId = allUsersData[idx][0]; await supabaseClient.from('users').delete().eq('id', userId); refreshData(document.getElementById('refreshBtn')); Swal.fire({toast:true, position:'top-end', title:'ลบสำเร็จ!', icon:'success', background:'#111', color:'#fff', timer:1500, showConfirmButton:false}); } }); }

  // 🌟 จำกัดสิทธิ์การสร้างและแก้ไข SuperAdmin 🌟
  function updateRoleDropdown(currentRoleValue = '') {
      const roleSelect = document.getElementById('uRole');
      roleSelect.innerHTML = '';
      roleSelect.innerHTML += '<option value="Member">Member</option>';
      roleSelect.innerHTML += '<option value="Admin">Admin</option>';
      
      if (myRole === 'SuperAdmin') {
          roleSelect.innerHTML += '<option value="SuperAdmin">SuperAdmin</option>';
      }
      
      if (currentRoleValue) {
          if(roleSelect.querySelector(`option[value="${currentRoleValue}"]`)) {
              roleSelect.value = currentRoleValue;
          } else {
              roleSelect.value = 'Admin';
          }
      } else {
          roleSelect.value = 'Member'; 
      }
  }

  function openRegModal() { 
      document.getElementById('adminRegForm').reset(); 
      document.getElementById('editUserIdx').value = ''; 
      document.getElementById('regModalTitle').innerText = '➕ เพิ่มรายชื่อสมาชิก'; 
      document.getElementById('uPass').required = true; 
      document.getElementById('otherWork').style.display = 'none'; 
      document.getElementById('uSet').value = ""; 
      updateRoleDropdown(''); 
      bootstrap.Modal.getOrCreateInstance(document.getElementById('regModal')).show(); 
  }

  function openEditUserModal(idx) { 
      const user = allUsersData[idx]; 
      document.getElementById('adminRegForm').reset(); 
      document.getElementById('editUserIdx').value = idx; 
      document.getElementById('regModalTitle').innerText = '📝 แก้ไขข้อมูลสมาชิก'; 
      document.getElementById('nick').value = user[1]; 
      const workSel = document.getElementById('work'); const otherW = document.getElementById('otherWork'); 
      if (Array.from(workSel.options).some(opt => opt.value === user[2])) { workSel.value = user[2]; otherW.style.display = 'none'; } 
      else { workSel.value = 'OTHER'; otherW.value = user[2]; otherW.style.display = 'block'; } 
      const deptSel = document.getElementById('dept'); let deptFound = false; const safeDept = user[3] ? user[3].toString() : ''; 
      Array.from(deptSel.options).forEach(opt => { if (opt.value.includes(safeDept) || safeDept.includes(opt.value)) { deptSel.value = opt.value; deptFound = true; } }); 
      if (!deptFound) deptSel.value = "อื่นๆ (OTHER)"; 
      document.getElementById('uName').value = user[4]; 
      document.getElementById('uPass').value = ''; document.getElementById('uPass').required = false; 
      
      updateRoleDropdown(user[6]); 
      
      document.getElementById('uSet').value = user[9] || ""; 
      bootstrap.Modal.getOrCreateInstance(document.getElementById('regModal')).show(); 
  }

  async function handleRegSubmit(e) {
      e.preventDefault(); const btn = document.getElementById('btnSubmitReg'); btn.innerText = '⏳ กำลังบันทึก...'; const idx = document.getElementById('editUserIdx').value;
      const payload = { nickname: document.getElementById('nick').value, workGroup: document.getElementById('work').value === 'OTHER' ? document.getElementById('otherWork').value : document.getElementById('work').value, department: document.getElementById('dept').value, username: document.getElementById('uName').value, role: document.getElementById('uRole').value, shiftSet: document.getElementById('uSet').value };
      const passVal = document.getElementById('uPass').value; if(passVal) payload.password = passVal;
      try {
          if (idx !== "") { const userId = allUsersData[idx][0]; const { data: dupCheck } = await supabaseClient.from('users').select('id').eq('username', payload.username).neq('id', userId); if (dupCheck && dupCheck.length > 0) { Swal.fire('Error', 'ยูสเซอร์เนมนี้มีคนใช้แล้ว', 'error'); btn.innerText = 'บันทึกข้อมูล'; return; } await supabaseClient.from('users').update(payload).eq('id', userId); } 
          else { if(!payload.password) { Swal.fire('Error', 'กรุณาตั้งรหัสผ่าน', 'error'); btn.innerText = 'บันทึกข้อมูล'; return; } payload.status = 'Active'; const { data: dupCheck } = await supabaseClient.from('users').select('id, nickname, username').or(`nickname.eq.${payload.nickname},username.eq.${payload.username}`); if (dupCheck && dupCheck.length > 0) { Swal.fire('Error', 'ชื่อเล่น หรือ ยูสเซอร์เนม นี้มีในระบบแล้ว', 'error'); btn.innerText = 'บันทึกข้อมูล'; return; } await supabaseClient.from('users').insert([payload]); }
          bootstrap.Modal.getOrCreateInstance(document.getElementById('regModal')).hide(); btn.innerText = 'บันทึกข้อมูล'; refreshData(document.getElementById('refreshBtn')); Swal.fire({toast:true, position:'top-end', title:'บันทึกพนักงานสำเร็จ!', icon:'success', background:'#111', color:'#fff', timer:1500, showConfirmButton:false});
      } catch (err) { Swal.fire('Error', err.message, 'error'); btn.innerText = 'บันทึกข้อมูล'; }
  }

  // ==========================================
  // 🚀 4. ระบบตารางลงโทษพนักงาน (Penalties)
  // ==========================================
  async function loadSupabasePenalties() {
      const { data } = await supabaseClient.from('penalties').select('*').order('id', { ascending: false });
      allPenalties = (data || []).map(item => [ item.id, item.date || item.created_at, item.nickname, item.department, item.reason, item.penaltyType, item.damageAmt || 0, item.finePct || "-", item.deductAmt || 0, item.monthYear || "", item.status || "บันทึกแล้ว" ]);
      loadPenaltiesTable();
  }
  function updatePenaltySelect() { 
      const deptFilter = document.getElementById('penDeptFilter') ? document.getElementById('penDeptFilter').value : 'ALL';
      const searchTerm = document.getElementById('penNickSearch') ? document.getElementById('penNickSearch').value.toLowerCase().trim() : '';
      let html = '<option value="">-- เลือกพนักงาน --</option>'; 
      
      allUsersData.forEach(u => { 
          if(u[7] === 'Active') { 
              const nick = u[1] || ''; 
              const dept = u[3] || ''; 
              const val = `${nick}|${dept}`; 
              const txt = `${nick} (${dept})`; 

              let deptMatch = false;
              if (deptFilter === 'ALL') deptMatch = true;
              else if (deptFilter === 'OD' && dept.includes('OD') && !dept.includes('ODOL')) deptMatch = true;
              else if (deptFilter === 'ODOL' && dept.includes('ODOL')) deptMatch = true;
              else if (deptFilter === 'OTHER' && !dept.includes('ODOL') && !dept.includes('OD')) deptMatch = true;

              let searchMatch = true;
              if (searchTerm !== '') searchMatch = nick.toLowerCase().includes(searchTerm);

              if (deptMatch && searchMatch) html += `<option value="${val}">${txt}</option>`;
          } 
      }); 
      document.getElementById('penNick').innerHTML = html; 
  }
  function openPenaltyModal() { 
      document.getElementById('penaltyForm').reset(); 
      if(document.getElementById('penDeptFilter')) document.getElementById('penDeptFilter').value = 'ALL';
      if(document.getElementById('penNickSearch')) document.getElementById('penNickSearch').value = '';
      
      updatePenaltySelect(); 
      
      const now = new Date(); 
      document.getElementById('penMonth').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; 
      togglePenaltyFields(); 
      bootstrap.Modal.getOrCreateInstance(document.getElementById('penaltyModal')).show(); 
  }
  function togglePenaltyFields() { const type = document.getElementById('penType').value; const extra = document.getElementById('penaltyExtraFields'); if (type === '3. ใบปรับตามข้อและเกิดความเสียหาย') { extra.style.display = 'block'; checkPenaltyLimits(); } else { extra.style.display = 'none'; } }
  function checkPenaltyLimits() {
      const type = document.getElementById('penType').value; if (type !== '3. ใบปรับตามข้อและเกิดความเสียหาย') return; const monthYear = document.getElementById('penMonth').value; const nickVal = document.getElementById('penNick').value; if (!monthYear || !nickVal) return; const nick = nickVal.split('|')[0];
      let count20 = 0; allPenalties.forEach(p => { if (p[2] === nick && p[9] === monthYear && p[7] === "20" && p[5] === '3. ใบปรับตามข้อและเกิดความเสียหาย') count20++; });
      const pctSelect = document.getElementById('penPercent'); const alertMsg = document.getElementById('penAlertMsg');
      if (count20 >= 3) { alertMsg.innerHTML = `⚠️ เดือนนี้คุณ ${nick} โดนหัก 20% ครบ 3 ครั้งแล้ว! ระบบบังคับหัก 100%`; pctSelect.value = "100"; pctSelect.options[0].disabled = true; } else { alertMsg.innerHTML = `ℹ️ เดือนนี้คุณ ${nick} โดนหัก 20% ไปแล้ว ${count20} / 3 ครั้ง`; pctSelect.options[0].disabled = false; pctSelect.value = "20"; }
      calculateDeduction();
  }
  function calculateDeduction() { const amt = parseFloat(document.getElementById('penDamageAmt').value) || 0; const pct = parseFloat(document.getElementById('penPercent').value) || 0; document.getElementById('penDeductAmt').value = (amt * (pct / 100)).toFixed(2); }
  
  async function handlePenaltySubmit(e) {
    e.preventDefault(); const val = document.getElementById('penNick').value.split('|'); if (!val[0]) { Swal.fire({toast:true, position:'top', title:'เลือกพนักงานก่อน!', icon:'warning', showConfirmButton:false, timer:2000, background:'#111', color:'#fff'}); return; }
    const pType = document.getElementById('penType').value; let dAmt = 0, fPct = "-", dDeduct = 0;
    if (pType === '3. ใบปรับตามข้อและเกิดความเสียหาย') { dAmt = document.getElementById('penDamageAmt').value; fPct = document.getElementById('penPercent').value; dDeduct = document.getElementById('penDeductAmt').value; if(!dAmt || dAmt <= 0) { Swal.fire({toast:true, position:'top', title:'ระบุยอดความเสียหายด้วยครับ', icon:'warning', showConfirmButton:false, timer:2000, background:'#111', color:'#fff'}); return; } }
    const payload = { nickname: val[0], department: val[1], date: new Date().toISOString(), monthYear: document.getElementById('penMonth').value, reason: document.getElementById('penReason').value, penaltyType: pType, damageAmt: dAmt.toString(), finePct: fPct.toString(), deductAmt: dDeduct.toString(), status: "บันทึกแล้ว" };
    const btn = document.querySelector('#penaltyForm button[type="submit"]'); btn.disabled = true; btn.innerText = '⏳ กำลังบันทึก...';
    try { await supabaseClient.from('penalties').insert([payload]); bootstrap.Modal.getOrCreateInstance(document.getElementById('penaltyModal')).hide(); await loadSupabasePenalties(); Swal.fire({toast:true, position:'top-end', title:'บันทึกความผิดแล้ว', icon:'success', timer:1500, showConfirmButton:false, background:'#111', color:'#fff'}); } catch (err) { Swal.fire('Error', err.message, 'error'); } finally { btn.disabled = false; btn.innerText = 'บันทึกข้อมูลการลงโทษ'; }
  }

  async function deleteSupabasePenalty(id) { Swal.fire({title:'ลบประวัติลงโทษ?', icon:'warning', showCancelButton:true, confirmButtonColor:'#ff3366', background:'#111', color:'#fff'}).then(async r => { if(r.isConfirmed) { Swal.fire({title:'กำลังลบ...', didOpen:()=>Swal.showLoading()}); await supabaseClient.from('penalties').delete().eq('id', id); await loadSupabasePenalties(); Swal.fire({toast:true, position:'top-end', title:'ลบสำเร็จ!', icon:'success', background:'#111', color:'#fff', timer:1500, showConfirmButton:false}); } }); }
  function loadPenaltiesTable() {
    const tb = document.getElementById('penaltyTableBody'); tb.innerHTML = ''; 
    const filterMonthElement = document.getElementById('penaltyMonthFilter');
    const filterMonth = filterMonthElement ? filterMonthElement.value : '';
    
    const searchElement = document.getElementById('penaltySearchInput');
    const searchTerm = searchElement ? searchElement.value.toLowerCase().trim() : '';
    const myNick = localStorage.getItem('okvip_nick') || ''; 

    if(allPenalties.length === 0) { 
        tb.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">ไม่มีประวัติการลงโทษ</td></tr>`; 
        return; 
    }

    let hasData = false;
    allPenalties.forEach(p => { 
        const nickName = p[2] || '';
        
        const matchMonth = (!filterMonth || p[9] === filterMonth);
        const matchSearch = (!searchTerm || nickName.toLowerCase().includes(searchTerm));

        if (matchMonth && matchSearch) {
            hasData = true;
            let btn = (myRole === 'SuperAdmin') ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteSupabasePenalty('${p[0]}')">ลบ</button>` : '-'; 
            let deductStr = p[5] === '3. ใบปรับตามข้อและเกิดความเสียหาย' ? `<span class="text-danger fw-bold">${p[8]} ฿</span> <br><small class="text-muted">(${p[7]}% จาก ${p[6]}฿)</small>` : '-'; 
            
            let displayNick = nickName;
            if (nickName === myNick) {
                displayNick = `<span style="color: var(--neon-red); text-shadow: 0 0 10px rgba(255,51,102,0.8); font-weight: bold; border: 1px solid var(--neon-red); padding: 4px 10px; border-radius: 6px;">${nickName} (ฉัน)</span>`;
            }

            tb.innerHTML += `<tr><td><span class="text-info">${p[9]}</span><br><small class="text-muted">${new Date(p[1]).toLocaleDateString('th-TH')}</small></td><td class="fw-bold">${displayNick}</td><td>${p[3]}</td><td>${p[4]}</td><td class="text-warning">${p[5]}</td><td>${deductStr}</td><td><span class="badge bg-warning text-dark border">${p[10] || 'บันทึกแล้ว'}</span></td><td class="text-center">${btn}</td></tr>`; 
        }
    });

    if (!hasData) tb.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">ไม่มีข้อมูลที่ค้นหา</td></tr>`;
  }

// ==========================================
  // 🚀 5. ระบบตารางวันหยุดพนักงาน (Schedules)
  // ==========================================
  function renderStampPalette() { let html = ''; for (const [code, style] of Object.entries(stampConfig)) { let isDisabled = ""; let opacityStyle = ""; if (myRole === 'Member' && code !== 'X' && code !== '') { isDisabled = "disabled"; opacityStyle = "opacity: 0.5; cursor: not-allowed;"; } html += `<button class="stamp-btn" style="color:${style.text}; border-color:${style.text}; ${opacityStyle}" onclick="selectStamp('${code}', this)" ${isDisabled}>${style.label}</button>`; } document.getElementById('stampPalette').innerHTML = html; }
  function selectStamp(code, btn) { if (myRole === 'Member' && code !== 'X' && code !== '') { Swal.fire({toast:true, position:'top', title:'ไม่มีสิทธิ์ใช้งาน', text:'คุณใช้งานได้เฉพาะ (X) และ (ยางลบ) เท่านั้น', icon:'error', timer:2000, showConfirmButton:false, background:'#111', color:'#fff'}); return; } currentStamp = code; document.querySelectorAll('.stamp-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); if(code === 'TX') Swal.fire({toast:true, position:'top-end', title:'โหมดสลับวันหยุด (TX)', text:'ระบบจะบันทึก TX ในช่องที่กดเท่านั้น', icon:'info', timer:4000, showConfirmButton:false, background:'#111', color:'#fff'}); }
  function filterScheduleDept(dept, btn) { if(Object.keys(unsavedChanges).length > 0){ Swal.fire({title:'มีการเปลี่ยนแปลงยังไม่ได้บันทึก!', text:'กรุณากดบันทึกตารางก่อนเปลี่ยนกลุ่ม', icon:'warning', background:'#111', color:'#fff'}); return; } currentScheduleFilter = dept; document.querySelectorAll('#holidaySection .dept-badge').forEach(b => { b.classList.remove('active'); b.style.borderColor = "#444"; b.style.color = "#ccc"; b.style.boxShadow = "none"; }); btn.classList.add('active'); btn.style.borderColor = "#fff"; btn.style.color = "#fff"; btn.style.boxShadow = "0 0 10px rgba(255,255,255,0.3)"; loadScheduleTable(); }
  function handleScheduleSearch(term) { scheduleSearchTerm = term.toLowerCase().trim(); loadScheduleTable(); }
  function changeMonth(offset) {
      if(Object.keys(unsavedChanges).length > 0){ 
          Swal.fire({title:'ยังไม่ได้บันทึก!', text:'กรุณาบันทึกตารางปัจจุบันก่อนเปลี่ยนเดือน', icon:'warning', background:'#111', color:'#fff'}); 
          return; 
      }
      const p = document.getElementById('monthPicker');
      if(!p.value) return;
      let [y, m] = p.value.split('-').map(Number);
      m += offset;
      if (m > 12) { m = 1; y++; } 
      else if (m < 1) { m = 12; y--; }
      p.value = `${y}-${String(m).padStart(2, '0')}`;
      loadScheduleTable();
      checkLeaveAlerts(); 
  }
  document.addEventListener('mouseup', function() { isDraggingStamp = false; })
  
  async function confirmClearSchedule() {
    const ym = document.getElementById('monthPicker').value;
    Swal.fire({ title: `ไม่บันทึก ${ym}?`, text: "ข้อมูลของเดือนนี้จะถูกลบทั้งหมด!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff3366', confirmButtonText: 'ล้างทั้งหมด', background: '#111', color: '#fff' }).then(async r => {
      if(r.isConfirmed) {
        Swal.fire({title:'กำลังล้าง...', didOpen:()=>Swal.showLoading()});
        await supabaseClient.from('schedules').delete().eq('yearMonth', ym);
        unsavedChanges = {}; document.getElementById('btnSaveSchedule').style.display = 'none';
        await loadScheduleTable(); Swal.fire({toast:true, position:'top-end', title:'ล้างข้อมูลเรียบร้อย', icon:'success', timer:1500, showConfirmButton:false, background:'#111', color:'#fff'});
      }
    });
  }

  async function loadScheduleTable() {
    unsavedChanges = {}; document.getElementById('btnSaveSchedule').style.display = 'none'; 
    const ym = document.getElementById('monthPicker').value; 
    if(!ym || allUsersData.length === 0) { document.getElementById('scheduleLoading').style.display = 'none'; return; } 
    
    document.getElementById('scheduleTable').style.display = 'none'; document.getElementById('scheduleLoading').style.display = 'block'; document.getElementById('scheduleLoading').innerText = 'กำลังโหลดข้อมูลตาราง...';

    const { data: schData } = await supabaseClient.from('schedules').select('*').eq('yearMonth', ym);
    const dataMap = {}; if (schData) { schData.forEach(r => dataMap[r.nickname] = r.daysData ? JSON.parse(r.daysData) : {}); }

    const [year, month] = ym.split('-'); const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date(); const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;
    const isCurMonth = (ym === currentMonthStr); const curD = today.getDate();
    const selectedDate = new Date(parseInt(year), parseInt(month) - 1, 1); const currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const isNextMonthOrFuture = (selectedDate > currentDate);

    document.getElementById('scheduleLoading').style.display = 'none'; document.getElementById('scheduleTable').style.display = 'table';
    let th = '<tr><th class="name-col">ชื่อพนักงาน</th><th class="dept-col">แผนก</th>'; for(let d=1; d<=daysInMonth; d++) { let c = (isCurMonth && d === curD) ? 'today-header date-col' : 'date-col'; th += `<th class="${c}">${d}</th>`; } th += '</tr>'; document.getElementById('schThead').innerHTML = th;
    
    let tb = ''; let hasData = false;
    allUsersData.forEach(u => {
        if(!u || u[7] !== 'Active') return; const nick = u[1] ? u[1].toString() : ''; const dept = u[3] ? u[3].toString() : 'ไม่ระบุ';
        if (currentScheduleFilter !== 'ALL') { const filterBase = currentScheduleFilter.split(' ')[0]; const deptBase = dept.split(' ')[0]; if (dept !== currentScheduleFilter && filterBase !== deptBase) return; }
        if (scheduleSearchTerm && !nick.toLowerCase().includes(scheduleSearchTerm.toLowerCase())) return;
        hasData = true;

        const isMyRow = (nick === localStorage.getItem('okvip_nick')); const canEdit = (myRole !== 'Member') || (isMyRow && isNextMonthOrFuture);
        const nameClass = isMyRow ? 'name-col highlight-me' : 'name-col'; const rowBg = isMyRow ? 'background-color: rgba(0, 255, 102, 0.05);' : '';
        tb += `<tr data-nick="${nick}" data-dept="${dept}" style="${rowBg}"><td class="${nameClass}">${nick}</td><td class="dept-col text-muted small">${dept.split(' ')[0]}</td>`;
        
        const userDays = dataMap[nick] || {};
        for(let d=1; d<=daysInMonth; d++) {
            const val = userDays[d] || ''; const style = stampConfig[val] || { bg:'transparent', text:'#eee' }; 
            const mouse = canEdit ? `onmousedown="startStampDrag(this,'${nick}','${dept}',${d})" onmouseenter="enterStampDrag(event, this,'${nick}','${dept}',${d})"` : ''; 
            const c = (isCurMonth && d === curD) ? 'today-column' : ''; const curClass = canEdit ? 'admin-mode cell-day' : 'cell-day'; 
            tb += `<td class="${curClass} ${c}" data-day="${d}" data-original="${val}" style="background-color:${style.bg}; color:${style.text};" ${mouse}>${val}</td>`;
        } 
        tb += '</tr>';
    }); 
    if (!hasData) tb = `<tr><td colspan="${daysInMonth + 2}" class="text-center py-5 text-muted">ไม่พบข้อมูลพนักงานในกลุ่มนี้</td></tr>`;
    document.getElementById('schTbody').innerHTML = tb;
  }

  function startStampDrag(cell, nick, dept, day) { if(currentStamp===null){ Swal.fire({toast:true, position:'top', title:'เลือกตรายางก่อนครับ', icon:'info', background:'#111', color:'#fff', timer:1500, showConfirmButton:false}); return;} isDraggingStamp = true; applyStamp(cell, nick, dept, day); }
  function enterStampDrag(e, cell, nick, dept, day) { 
    if(isDraggingStamp && currentStamp !== null && e.buttons === 1) {
        applyStamp(cell, nick, dept, day); 
    } else {
        isDraggingStamp = false;
    }
  }
  function applyStamp(cell, nick, dept, day) {
    if(currentStamp===null || cell.innerText===currentStamp) return; const conf = stampConfig[currentStamp];
    if(myRole === 'Member' && currentStamp === 'X') { let count = 0; cell.parentElement.querySelectorAll('.cell-day').forEach(c => { if(c.innerText === 'X') count++; }); if(count >= conf.limit) { isDraggingStamp = false; Swal.fire({toast:true, position:'top', title:'โควต้าเต็ม!', text:`ใช้ X ได้ไม่เกิน ${conf.limit} ครั้งต่อเดือน`, icon:'warning', background:'#111', color:'#fff', timer:2000, showConfirmButton:false}); return; } }
    cell.innerText = currentStamp; cell.style.backgroundColor = conf.bg; cell.style.color = conf.text; 
    if (cell.getAttribute('data-original') !== currentStamp) cell.classList.add('unsaved-mark'); else cell.classList.remove('unsaved-mark');
    if(!unsavedChanges[nick]) unsavedChanges[nick] = {}; unsavedChanges[nick][day] = currentStamp; unsavedChanges[nick]['dept'] = dept; 
    document.getElementById('btnSaveSchedule').style.display = 'flex';
  }

  async function saveAllScheduleChanges() {
    if (Object.keys(unsavedChanges).length === 0) return; const btn = document.getElementById('btnSaveSchedule'); btn.disabled = true; btn.innerText = '⏳ กำลังบันทึก...';
    const ym = document.getElementById('monthPicker').value;

    const { data: existingSchedules } = await supabaseClient.from('schedules').select('*').eq('yearMonth', ym);
    const existingMap = {}; if (existingSchedules) { existingSchedules.forEach(r => existingMap[r.nickname] = { id: r.id, days: r.daysData ? JSON.parse(r.daysData) : {} }); }

    for (const nick in unsavedChanges) {
        const changes = unsavedChanges[nick]; const dept = changes['dept'] || ''; delete changes['dept'];
        let currentDays = {}; let rowId = null;
        if (existingMap[nick]) { currentDays = existingMap[nick].days; rowId = existingMap[nick].id; }
        for (const d in changes) { if (changes[d] === '') delete currentDays[d]; else currentDays[d] = changes[d]; }
        if (rowId) { await supabaseClient.from('schedules').update({ daysData: JSON.stringify(currentDays) }).eq('id', rowId); } 
        else { await supabaseClient.from('schedules').insert([{ nickname: nick, department: dept, yearMonth: ym, daysData: JSON.stringify(currentDays) }]); }
    }
    btn.disabled = false; btn.innerText = '💾 บันทึกข้อมูลตาราง'; btn.style.display = 'none'; unsavedChanges = {}; 
    document.querySelectorAll('.unsaved-mark').forEach(c=>{c.setAttribute('data-original', c.innerText); c.classList.remove('unsaved-mark');}); 
    Swal.fire({toast:true, position:'top-end', title:'บันทึกตารางเรียบร้อย!', icon:'success', background:'#111', color:'#fff', timer:2000, showConfirmButton:false});
  }

  function openShiftModal() { bootstrap.Modal.getOrCreateInstance(document.getElementById('shiftModal')).show(); }
  function applyShiftToSet(e) {
    e.preventDefault(); const targetSet = document.getElementById('shiftSetSelect').value; const targetStamp = document.getElementById('shiftStampSelect').value; let appliedCount = 0;
    document.querySelectorAll('#schTbody tr').forEach(tr => {
      const nick = tr.getAttribute('data-nick'); const user = allUsersData.find(u => u[1] === nick);
      if(user && user[9] === targetSet) { 
        tr.querySelectorAll('.cell-day').forEach(cell => {
          const currentVal = cell.innerText.trim();
          if(currentVal === '' || currentVal === 'N' || currentVal === 'D' || currentVal === 'M') {
            const day = cell.getAttribute('data-day'); const conf = stampConfig[targetStamp];
            cell.innerText = targetStamp; cell.style.backgroundColor = conf.bg; cell.style.color = conf.text; cell.classList.add('unsaved-mark');
            if(!unsavedChanges[nick]) unsavedChanges[nick] = {}; unsavedChanges[nick][day] = targetStamp; unsavedChanges[nick]['dept'] = tr.getAttribute('data-dept'); appliedCount++;
          }
        });
      }
    });
    bootstrap.Modal.getOrCreateInstance(document.getElementById('shiftModal')).hide();
    if(appliedCount > 0) { document.getElementById('btnSaveSchedule').style.display = 'flex'; Swal.fire({toast:true, position:'top', title:`ลงกะสำเร็จ!`, text:'กรุณากดบันทึกข้อมูลตาราง', icon:'success', timer:2500, showConfirmButton:false, background:'#111', color:'#fff'}); } 
    else { Swal.fire({toast:true, position:'top', title:'ไม่มีการเปลี่ยนแปลง', icon:'info', timer:2000, showConfirmButton:false, background:'#111', color:'#fff'}); }
  }

  // ==========================================
  // 🚀 6. หน้าที่ & สถิติ (Jobs & Stats)
  // ==========================================
  function toggleJobTab(tabName) { currentJobTab = tabName; document.getElementById('btnTabDuty').classList.toggle('active', tabName==='duty'); document.getElementById('btnTabDuty').classList.toggle('btn-outline-warning', tabName!=='duty'); document.getElementById('btnTabDuty').classList.toggle('btn-warning', tabName==='duty'); document.getElementById('btnTabStat').classList.toggle('active', tabName==='stat'); document.getElementById('btnTabStat').classList.toggle('btn-outline-info', tabName!=='stat'); document.getElementById('btnTabStat').classList.toggle('btn-info', tabName==='stat'); document.getElementById('dutyTableArea').style.display = tabName==='duty'?'block':'none'; document.getElementById('statTableArea').style.display = tabName==='stat'?'block':'none'; document.getElementById('dutyActionBtns').style.display = tabName==='duty'?'flex':'none'; document.getElementById('statActionBtns').style.display = tabName==='stat'?'block':'none'; renderJobTables(); }
  function filterJobDept(dept, btn) { currentJobFilter = dept; document.querySelectorAll('#jobSection .dept-badge').forEach(b => {b.classList.remove('active'); b.style.borderColor="#444"; b.style.color="#ccc";}); btn.classList.add('active'); btn.style.borderColor="#fff"; btn.style.color="#fff"; renderJobTables(); }
  function handleJobSearch(term) { jobSearchTerm = term.toLowerCase().trim(); renderJobTables(); }
  function toggleShowHidden(checkbox) { isShowingHiddenUsers = checkbox.checked; renderJobTables(); }
  function renderJobTables() { if(currentJobTab === 'duty') buildDutyTable(); else buildStatTable(); }
  
  async function loadDailyJobData() { 
      const dateStr = document.getElementById('jobDatePicker').value; if(!dateStr) return; 
      const { data: dData } = await supabaseClient.from('daily_duties').select('*').eq('dateStr', dateStr);
      dailyDutiesData = {}; if(dData) dData.forEach(r => dailyDutiesData[r.nickname] = { site: r.assignedSite, duty: r.assignedDuty });
      const { data: sData } = await supabaseClient.from('daily_stats').select('*').eq('dateStr', dateStr);
      dailyStatsData = {}; if(sData) sData.forEach(r => dailyStatsData[r.nickname] = r.statsData ? JSON.parse(r.statsData) : {});
      const [y, m, d] = dateStr.split('-'); const ym = `${y}-${m}`;
      const { data: schData } = await supabaseClient.from('schedules').select('*').eq('yearMonth', ym);
      dailyScheduleData = {}; if (schData) { schData.forEach(r => { const days = r.daysData ? JSON.parse(r.daysData) : {}; dailyScheduleData[r.nickname] = days[parseInt(d)] || ''; }); }
      renderJobTables(); 
  }

  function buildDutyTable() {
    const tbody = document.getElementById('dutyTableBody'); tbody.innerHTML = '';
    let filteredUsers = allUsersData.filter(u => { 
        if(!u || u[7]!=='Active') return false; const nick = u[1] ? u[1].toString().toLowerCase() : ''; const dept = u[3] ? u[3].toString() : '';
        if(currentJobFilter !== 'ALL' && !dept.startsWith(currentJobFilter.split(' ')[0])) return false;
        if(jobSearchTerm && !nick.includes(jobSearchTerm)) return false;
        const capable = sysSettings.userSites[u[1]] || []; if(capable.includes('EXCLUDE_DUTY') && !isShowingHiddenUsers) return false; return true; 
    });
    if(filteredUsers.length===0){tbody.innerHTML=`<tr><td colspan="6" class="text-center py-4">ไม่พบข้อมูล</td></tr>`; return;}
    
    filteredUsers.forEach(u => {
      const nick = u[1]; const dept = u[3] ? u[3].toString() : ''; const capable = sysSettings.userSites[nick] || []; const actualSites = capable.filter(s => s !== 'EXCLUDE_DUTY'); const sitesBadge = actualSites.length > 0 ? actualSites.map(s => `<span class="badge bg-secondary me-1 border">${s}</span>`).join('') : '<span class="text-danger small">ไม่ได้ตั้งค่า</span>';
      const curData = dailyDutiesData[nick] || {site:'', duty:''}; const curStamp = dailyScheduleData[nick] || ''; let dutyOptions = `<option value="">- เลือก -</option>`; sysSettings.dutyTypes.forEach(d => { dutyOptions += `<option value="${d}" ${curData.duty===d?'selected':''}>${d}</option>`; });
      const adminBtn = myRole!=='Member' ? `<button class="btn btn-sm btn-outline-info" onclick="openUserSiteModal('${nick}')">⚙️</button>` : '-';
      if (capable.includes('EXCLUDE_DUTY')) { tbody.innerHTML += `<tr data-nick="${nick}" data-dept="${dept}" data-leave="true" data-excluded="true" style="opacity: 0.4;"><td class="fw-bold text-white"><del>${nick}</del></td><td class="text-muted small">${dept.split(' ')[0]}</td><td colspan="3" class="text-center text-danger small">🚫 ถูกซ่อนจากตาราง</td><td class="text-center">${adminBtn}</td></tr>`; return; }
      if (offDutyStamps.includes(curStamp) || curStamp === '') { const sConf = stampConfig[curStamp] || stampConfig['']; tbody.innerHTML += `<tr data-nick="${nick}" data-dept="${dept}" data-leave="true" data-excluded="false"><td class="fw-bold text-white">${nick}</td><td class="text-muted small">${dept.split(' ')[0]}</td><td>${sitesBadge}</td><td colspan="2" class="text-center bg-dark" style="opacity:0.8"><span class="badge px-3 py-2" style="background-color:${sConf.bg}; color:${sConf.text}; border: 1px solid ${sConf.text};">🛏️ ${sConf.label}</span></td><td class="text-center">${adminBtn}</td></tr>`; } 
      else { let stampHtml = ''; if(curStamp && stampConfig[curStamp]){ const c=stampConfig[curStamp]; stampHtml=`<span class="badge ms-2" style="background-color:${c.bg}; color:${c.text}; border: 1px solid ${c.text}; font-size:0.7rem;">${c.label}</span>`; } tbody.innerHTML += `<tr data-nick="${nick}" data-dept="${dept}" data-leave="false" data-excluded="false"><td class="fw-bold text-white">${nick} ${stampHtml}</td><td class="text-muted small">${dept.split(' ')[0]}</td><td>${sitesBadge}</td><td><input type="text" class="form-control form-control-sm bg-dark text-info sel-site" value="${curData.site}"></td><td><select class="form-select form-select-sm bg-dark text-white sel-duty">${dutyOptions}</select></td><td class="text-center">${adminBtn}</td></tr>`; }
    });
  }
  
  function randomizeDuties() {
      Swal.fire({title:'กำลังสุ่ม...', timer:800, didOpen:()=>Swal.showLoading()});
      
      document.querySelectorAll('#dutyTableBody tr').forEach(r => {
          if(r.getAttribute('data-leave')==='true' || r.getAttribute('data-excluded')==='true') return;
          
          const nick = r.getAttribute('data-nick');
          const sites = (sysSettings.userSites[nick]||[]).filter(s=>s!=='EXCLUDE_DUTY');
          
          if(sites.length > 0) {
              let s = sites.sort(()=>0.5-Math.random()).slice(0, 2);
              const inSite = r.querySelector('.sel-site');
              if(inSite) {
                  inSite.value = s.join(', ');
              }
              
              const inDuty = r.querySelector('.sel-duty');
              if(inDuty && sysSettings.dutyTypes.length > 0) {
                  inDuty.value = sysSettings.dutyTypes[Math.floor(Math.random() * sysSettings.dutyTypes.length)];
              }
          }
      });
      
      setTimeout(() => {
          renderMealTable(); 
          Swal.fire({toast:true, position:'top-end', title:'สุ่มเสร็จแล้ว อย่าลืมกดบันทึกนะครับ', icon:'success', timer:2000, showConfirmButton:false, background:'#111', color:'#fff'});
      }, 800);
  }
  
  async function saveDutyTable() { 
      const dateStr = document.getElementById('jobDatePicker').value; const payload = []; 
      document.querySelectorAll('#dutyTableBody tr').forEach(r => { 
          if(r.getAttribute('data-leave')==='true' || r.getAttribute('data-excluded')==='true') return; 
          const n=r.getAttribute('data-nick'); const d=r.getAttribute('data-dept'); const s=r.querySelector('.sel-site')?.value||''; const dt=r.querySelector('.sel-duty')?.value||''; 
          if(s||dt) payload.push({ dateStr: dateStr, nickname: n, department: d, assignedSite: s, assignedDuty: dt }); 
      }); 
      const btn = document.querySelector('#dutyActionBtns .btn-neon-green'); btn.innerText = '⏳...'; btn.disabled=true; 
      await supabaseClient.from('daily_duties').delete().eq('dateStr', dateStr);
      if (payload.length > 0) await supabaseClient.from('daily_duties').insert(payload);
      btn.innerText = '💾 บันทึกหน้าที่'; btn.disabled=false; 
      await loadDailyJobData(); Swal.fire({toast:true, position:'top-end', title:'บันทึกหน้าที่สำเร็จ', icon:'success', timer:1500, showConfirmButton:false, background:'#111', color:'#fff'}); 
  }
  
  function buildStatTable() {
    const thead = document.getElementById('statTableHeader'); const tbody = document.getElementById('statTableBody'); let thHtml = `<th class="col-sticky-name">ชื่อพนักงาน</th><th class="col-sticky-dept">แผนก</th>`; sysSettings.websites.forEach(s => thHtml += `<th class="stat-input-cell text-center text-muted">${s}</th>`); thHtml += `<th style="width:120px; color: var(--neon-yellow);" class="text-center">จำนวนรายการถอนจริง</th>`; thead.innerHTML = thHtml; tbody.innerHTML = '';
    let filteredUsers = allUsersData.filter(u => { if(u[7]!=='Active') return false; const nick = u[1]?u[1].toString().toLowerCase():''; const dept = u[3]?u[3].toString():''; if(currentJobFilter!=='ALL' && !dept.startsWith(currentJobFilter.split(' ')[0])) return false; if(jobSearchTerm && !nick.includes(jobSearchTerm)) return false; const capable = sysSettings.userSites[u[1]] || []; if(capable.includes('EXCLUDE_DUTY') && !isShowingHiddenUsers) return false; return true; });
    filteredUsers.forEach(u => {
      const nick = u[1]; const dept = u[3]?u[3].toString():''; const curStats = dailyStatsData[nick] || {}; const curStamp = dailyScheduleData[nick] || ''; const capable = sysSettings.userSites[nick] || []; 
      if (capable.includes('EXCLUDE_DUTY')) { let tdHtml = `<tr data-nick="${nick}" data-dept="${dept}" data-excluded="true" style="opacity: 0.4;"><td class="col-sticky-name fw-bold text-white"><del>${nick}</del></td><td class="col-sticky-dept text-muted small">${dept.split(' ')[0]}</td>`; sysSettings.websites.forEach(s => tdHtml += `<td><input type="text" class="form-control form-control-sm bg-dark text-center" disabled value="ซ่อน"></td>`); tbody.innerHTML += tdHtml + `<td><input type="text" class="form-control form-control-sm bg-dark text-center" disabled value="-"></td></tr>`; return; }
      let stampHtml = ''; if(curStamp && stampConfig[curStamp]){ const c=stampConfig[curStamp]; stampHtml=`<div class="mt-1"><span class="badge" style="background-color:${c.bg}; color:${c.text}; border: 1px solid ${c.text}; font-size:0.7rem;">${c.label}</span></div>`; }
      let tdHtml = `<tr data-nick="${nick}" data-dept="${dept}" data-excluded="false"><td class="col-sticky-name fw-bold text-white">${nick} ${stampHtml}</td><td class="col-sticky-dept text-muted small">${dept.split(' ')[0]}</td>`; sysSettings.websites.forEach(s => { const val = curStats[s]||''; tdHtml += `<td><input type="number" class="form-control form-control-sm bg-dark text-white stat-input text-center" data-site="${s}" value="${val}" oninput="calcRowTotal(this)"></td>`; }); const total = curStats['Total']||0; tdHtml += `<td><input type="number" class="form-control form-control-sm bg-black text-warning row-total text-center fw-bold" value="${total}" readonly></td></tr>`; tbody.innerHTML += tdHtml;
    });
  }
  function calcRowTotal(input) { let total = 0; input.closest('tr').querySelectorAll('.stat-input').forEach(i => total += Number(i.value)||0); input.closest('tr').querySelector('.row-total').value = total; }
  
  async function saveStatTable() { 
      const dateStr = document.getElementById('jobDatePicker').value; const payload = []; 
      document.querySelectorAll('#statTableBody tr').forEach(r => { 
          if(r.getAttribute('data-excluded')==='true') return; 
          const n=r.getAttribute('data-nick'); const d=r.getAttribute('data-dept'); let data={}; 
          r.querySelectorAll('.stat-input').forEach(i => data[i.getAttribute('data-site')] = i.value); 
          data['Total'] = r.querySelector('.row-total').value; 
          payload.push({ dateStr: dateStr, nickname: n, department: d, statsData: JSON.stringify(data) }); 
      }); 
      const btn = document.querySelector('#statActionBtns .btn-neon-yellow'); btn.innerText = '⏳...'; btn.disabled=true; 
      await supabaseClient.from('daily_stats').delete().eq('dateStr', dateStr);
      if(payload.length > 0) await supabaseClient.from('daily_stats').insert(payload);
      btn.innerText = '💾 บันทึกสถิติทั้งหมด'; btn.disabled=false; 
      await loadDailyJobData(); Swal.fire({toast:true, position:'top-end', title:'บันทึกสถิติสำเร็จ', icon:'success', timer:1500, showConfirmButton:false, background:'#111', color:'#fff'}); 
  }
  
  function openUserSiteModal(nick) { tempSetupNick = nick; document.getElementById('siteNickName').innerText = nick; const capable = sysSettings.userSites[nick] || []; document.getElementById('chkExcludeDuty').checked = capable.includes('EXCLUDE_DUTY'); let html = ''; sysSettings.websites.forEach(s => { const checked = capable.includes(s) ? 'checked' : ''; html += `<div class="form-check form-check-inline bg-dark border border-secondary px-3 py-2" style="border-radius:10px;"><input class="form-check-input capable-chk" type="checkbox" id="chk_${s}" value="${s}" ${checked}><label class="form-check-label text-white ms-2" for="chk_${s}">${s}</label></div>`; }); if(sysSettings.websites.length===0) html='<span class="text-danger">ยังไม่ได้ตั้งเว็บ</span>'; document.getElementById('userSiteCheckboxes').innerHTML = html; bootstrap.Modal.getOrCreateInstance(document.getElementById('userSiteModal')).show(); }
  
  function selectAllUserSites() {
      const checkboxes = document.querySelectorAll('.capable-chk');
      let allChecked = true;
      checkboxes.forEach(chk => { if(!chk.checked) allChecked = false; });
      checkboxes.forEach(chk => chk.checked = !allChecked);
  }

  async function saveUserCapableSitesBtn() { 
      let sel = []; document.querySelectorAll('.capable-chk:checked').forEach(el => sel.push(el.value)); 
      if(document.getElementById('chkExcludeDuty').checked) sel.push('EXCLUDE_DUTY'); 
      const { data: existing } = await supabaseClient.from('user_sites').select('id').eq('nickname', tempSetupNick);
      if (existing && existing.length > 0) { await supabaseClient.from('user_sites').update({ capableSites: JSON.stringify(sel) }).eq('id', existing[0].id); } 
      else { await supabaseClient.from('user_sites').insert([{ nickname: tempSetupNick, capableSites: JSON.stringify(sel) }]); }
      sysSettings.userSites[tempSetupNick] = sel; renderJobTables(); 
      bootstrap.Modal.getOrCreateInstance(document.getElementById('userSiteModal')).hide(); Swal.fire({toast:true, position:'top', title:'ตั้งค่าเรียบร้อย', icon:'success', timer:1500, showConfirmButton:false, background:'#111', color:'#fff'}); 
  }
  
  function openJobSettingsModal() { document.getElementById('setWebsites').value = sysSettings.websites.join('\n'); document.getElementById('setDuties').value = sysSettings.dutyTypes.join('\n'); bootstrap.Modal.getOrCreateInstance(document.getElementById('jobSettingsModal')).show(); }
  
  async function saveAdminJobSettings() { 
      const w = document.getElementById('setWebsites').value.split('\n').map(s=>s.trim()).filter(s=>s); 
      const d = document.getElementById('setDuties').value.split('\n').map(s=>s.trim()).filter(s=>s); 
      const payload = { websites: JSON.stringify(w), dutyTypes: JSON.stringify(d) };
      const { data: jsData } = await supabaseClient.from('job_settings').select('id').limit(1);
      if (jsData && jsData.length > 0) { await supabaseClient.from('job_settings').update(payload).eq('id', jsData[0].id); }
      else { await supabaseClient.from('job_settings').insert([payload]); }
      bootstrap.Modal.getOrCreateInstance(document.getElementById('jobSettingsModal')).hide(); refreshData(document.getElementById('refreshBtn')); 
  }

  // ==========================================
  // 🍽️ 6.5 ระบบตารางทานข้าว (Meal Schedule) กำหนดรอบเองได้
  // ==========================================
  function syncMealDate() {
      document.getElementById('jobDatePicker').value = document.getElementById('mealDatePicker').value;
      loadDailyJobData().then(() => loadDailyMealData());
  }

  function handleMealSearch(term) { mealSearchTerm = term.toLowerCase().trim(); renderMealTable(); }

  async function loadDailyMealData() {
      const dateStr = document.getElementById('mealDatePicker').value; if(!dateStr) return;
      const { data } = await supabaseClient.from('meal_schedules').select('*').eq('dateStr', dateStr).limit(1);
      dailyMealData = {};
      if (data && data.length > 0) { dailyMealData = data[0].mealData ? JSON.parse(data[0].mealData) : {}; }
      renderMealTable();
  }

  function renderMealTable() {
      const tbody = document.getElementById('mealTableBody'); tbody.innerHTML = '';
      
      const searchT = document.getElementById('searchMeal') ? document.getElementById('searchMeal').value.toLowerCase().trim() : '';
      const shiftF = document.getElementById('filterMealShift') ? document.getElementById('filterMealShift').value : 'ALL';
      const deptF = document.getElementById('filterMealDept') ? document.getElementById('filterMealDept').value : 'ALL';

      let workingUsers = [];
      
      allUsersData.forEach(u => {
          if(!u || u[7] !== 'Active') return;
          const nick = u[1]; const dept = u[3] ? u[3].toString() : '';
          const stamp = dailyScheduleData[nick] || '';
          const isOff = offDutyStamps.includes(stamp) || stamp === '';
          const isExcluded = (sysSettings.userSites[nick] || []).includes('EXCLUDE_DUTY');
          
          if (!isOff && !isExcluded) {
              const site = (dailyDutiesData[nick] && dailyDutiesData[nick].site) ? dailyDutiesData[nick].site : 'ยังไม่ระบุเว็บ';
              
              let shiftType = 'OTHER';
              if (stamp === 'N' || stamp.includes('เช้า')) shiftType = 'N';
              else if (stamp === 'D' || stamp.includes('ดึก')) shiftType = 'D';

              let matchSearch = !searchT || nick.toLowerCase().includes(searchT);
              let matchShift = shiftF === 'ALL' || shiftType === shiftF;
              let matchDept = deptF === 'ALL' || dept.includes(deptF);

              if (matchSearch && matchShift && matchDept) {
                  workingUsers.push({ nick, dept, site, stamp, shiftType });
              }
          }
      });

      if(workingUsers.length === 0) {
          tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted">ไม่พบพนักงานตามเงื่อนไขที่เลือก (หรือยังไม่ลงหน้าที่)</td></tr>`;
          return;
      }

      let mealSelectOptionsHTML = `<option value="">-- เลือกเวลา --</option>`;
      mealTimeBlocks.forEach(block => {
          mealSelectOptionsHTML += `<optgroup label="${block.name}">`;
          let slots = generateTimeSlots(block.start, block.end);
          slots.forEach(slot => { mealSelectOptionsHTML += `<option value="${slot}" data-type="${block.type}">${slot}</option>`; });
          mealSelectOptionsHTML += `</optgroup>`;
      });

      workingUsers.forEach(u => {
          let stampBadge = `<span class="badge bg-dark border">${u.stamp}</span>`;
          if(u.stamp === 'N') stampBadge = `<span class="badge" style="background: rgba(0, 240, 255, 0.2); color: #00f0ff; border: 1px solid #00f0ff;">${u.stamp} (เช้า)</span>`;
          if(u.stamp === 'D') stampBadge = `<span class="badge" style="background: rgba(0, 255, 102, 0.2); color: #00ff66; border: 1px solid #00ff66;">${u.stamp} (ดึก)</span>`;

          const curMeal = dailyMealData[u.nick] || {};
          const m1 = curMeal.slot1 || '';
          const m2 = curMeal.slot2 || '';

          let select1 = mealSelectOptionsHTML.replace(`value="${m1}"`, `value="${m1}" selected`);
          let select2 = mealSelectOptionsHTML.replace(`value="${m2}"`, `value="${m2}" selected`);

          tbody.innerHTML += `
              <tr data-nick="${u.nick}">
                  <td class="fw-bold text-white">${u.nick}</td>
                  <td class="text-muted small">${u.dept.split(' ')[0]}</td>
                  <td>${stampBadge}</td>
                  <td class="text-info site-cell">${u.site}</td>
                  <td style="width: 320px;">
                      <div class="d-flex gap-2">
                          <select class="form-select form-select-sm bg-dark text-white sel-meal-1" onchange="checkMealOverlap()">${select1}</select>
                          <select class="form-select form-select-sm bg-dark text-white sel-meal-2" onchange="checkMealOverlap()">${select2}</select>
                      </div>
                  </td>
              </tr>
          `;
      });
      setTimeout(checkMealOverlap, 500);
  }

  function checkMealOverlap() {
      let siteTimes = {};
      document.querySelectorAll('#mealTableBody tr').forEach(tr => {
          let site = tr.querySelector('.site-cell').innerText;
          let sel1 = tr.querySelector('.sel-meal-1');
          let sel2 = tr.querySelector('.sel-meal-2');
          let time1 = sel1.value;
          let time2 = sel2.value;
          
          sel1.style.border = "1px solid #444"; sel1.style.color = "white";
          sel2.style.border = "1px solid #444"; sel2.style.color = "white";

          if(site !== 'ยังไม่ระบุเว็บ') {
              if(!siteTimes[site]) siteTimes[site] = [];
              if(time1) siteTimes[site].push({sel: sel1, time: time1});
              if(time2) siteTimes[site].push({sel: sel2, time: time2});
          }
      });

      for(let site in siteTimes) {
          let timesCount = {};
          siteTimes[site].forEach(item => { timesCount[item.time] = (timesCount[item.time] || 0) + 1; });
          siteTimes[site].forEach(item => {
              if(timesCount[item.time] > 1) { 
                  item.sel.style.border = "1px solid #ff3366"; item.sel.style.color = "#ff3366";
              }
          });
      }
  }

  async function saveMealData() {
      const dateStr = document.getElementById('mealDatePicker').value;
      let hasOverlap = false;

      document.querySelectorAll('#mealTableBody tr').forEach(tr => {
          const nick = tr.getAttribute('data-nick'); if(!nick) return;
          const sel1 = tr.querySelector('.sel-meal-1');
          const sel2 = tr.querySelector('.sel-meal-2');
          
          if(sel1.style.borderColor === "rgb(255, 51, 102)" || sel2.style.borderColor === "rgb(255, 51, 102)") hasOverlap = true;
          
          dailyMealData[nick] = { slot1: sel1.value, slot2: sel2.value };
      });

      if (hasOverlap) {
          Swal.fire({title:'ระวัง!', text:'มีพนักงานที่ดูแลเว็บเดียวกันทานข้าวพร้อมกัน (กรอบสีแดง) ยืนยันที่จะบันทึกหรือไม่?', icon:'warning', showCancelButton:true, confirmButtonColor:'#ffcc00', background:'#111', color:'#fff'}).then(r => { if(r.isConfirmed) executeSaveMeal(dateStr, dailyMealData); });
      } else { executeSaveMeal(dateStr, dailyMealData); }
  }

  async function executeSaveMeal(dateStr, payloadData) {
      const btn = document.querySelector('#mealActionBtns button:nth-child(1)'); 
      btn.innerText = '⏳...'; btn.disabled = true;
      try {
          const { data: existing } = await supabaseClient.from('meal_schedules').select('id').eq('dateStr', dateStr).limit(1);
          if(existing && existing.length > 0) await supabaseClient.from('meal_schedules').update({ mealData: JSON.stringify(payloadData) }).eq('id', existing[0].id);
          else await supabaseClient.from('meal_schedules').insert([{ dateStr: dateStr, mealData: JSON.stringify(payloadData) }]);
          
          await loadDailyMealData(); 
          Swal.fire({toast:true, position:'top-end', title:'บันทึกตารางทานข้าวสำเร็จ', icon:'success', timer:1500, showConfirmButton:false, background:'#111', color:'#fff'});
      } catch (err) { Swal.fire('Error', 'ไม่สามารถบันทึกตารางทานข้าวได้', 'error'); } finally { btn.innerText = '💾 บันทึกตารางทานข้าว'; btn.disabled = false; }
  }

  // ==========================================
  // 🚀 7. คู่มือการทำงาน (Manuals)
  // ==========================================
  function handleManualSearch(term) { manualSearchTerm = term.toLowerCase().trim(); renderManualGrid(); }
  function processStepImage(b64) { document.getElementById('stepImagePreview').src = b64; document.getElementById('stepImagePreview').style.display = 'block'; document.getElementById('stepMediaBase64').value = b64; document.getElementById('stepPasteText').style.display = 'none'; document.getElementById('btnStepClearImage').style.display = 'block'; }
  function clearStepImage() { document.getElementById('stepImagePreview').src = ''; document.getElementById('stepImagePreview').style.display = 'none'; document.getElementById('stepMediaBase64').value = ''; document.getElementById('stepPasteText').style.display = 'block'; document.getElementById('btnStepClearImage').style.display = 'none'; document.getElementById('stepMediaFile').value = ''; }
  function openLightbox(src) { document.getElementById('lightboxImg').src = src; document.getElementById('imageLightbox').classList.add('active'); }
  function closeLightbox() { document.getElementById('imageLightbox').classList.remove('active'); setTimeout(() => { document.getElementById('lightboxImg').src = ''; }, 300); }
  function resetManualForm() { document.getElementById('addManualForm').reset(); document.getElementById('manualModalTitle').innerText = '📝 สร้างหมวดหมู่คู่มือใหม่'; }
  
  async function handleManualSubmit(e) { 
      e.preventDefault(); const payload = { department: document.getElementById('manDept').value, category: document.getElementById('manCat').value, title: document.getElementById('manTitle').value, stepsData: "[]" }; 
      await supabaseClient.from('manuals').insert([payload]);
      bootstrap.Modal.getOrCreateInstance(document.getElementById('manualModal')).hide(); refreshData(document.getElementById('refreshBtn')); Swal.fire({toast:true, position:'top-end', title:'สร้างสำเร็จ', icon:'success', timer:1500, showConfirmButton:false, background:'#111', color:'#fff'}); 
  }
  
  function filterManualView(dept, btn) { currentManualFilter = dept; document.querySelectorAll('#manualSection .dept-badge').forEach(b => {b.classList.remove('active'); b.style.borderColor="#444"; b.style.color="#ccc";}); btn.classList.add('active'); btn.style.borderColor="#fff"; btn.style.color="#fff"; renderManualGrid(); }
  function renderManualGrid() {
    const area = document.getElementById('manualGridArea'); area.innerHTML = ''; let hasContent = false;
    allManualsData.forEach(r => {
      const [mId, mDept, mCat, mTitle] = r; const safeDept = mDept ? mDept.toString() : '';
      if(currentManualFilter!=='ALL' && safeDept!==currentManualFilter && safeDept!=='ทั่วไป (ALL)') return;
      if(manualSearchTerm && (!mTitle.toLowerCase().includes(manualSearchTerm) && !mCat.toLowerCase().includes(manualSearchTerm))) return;
      hasContent = true;
      const admin = myRole!=='Member' ? `<div class="card-actions"><button class="btn-action delete" onclick="event.stopPropagation(); confirmDeleteManual('${mId}')">✖ ลบ</button></div>` : '';
      let icon = "📁"; if(safeDept.includes("ODOL")) icon = "🌐"; else if(safeDept.includes("OD")) icon = "🔎";
      area.innerHTML += `<div class="manual-card" onclick="openViewManual('${mId}')">${admin}<div class="d-flex align-items-start"><span class="icon">${icon}</span><div><h5 class="title">${mTitle}</h5><div class="small text-muted mt-1">[${safeDept}] ${mCat}</div></div></div><div class="read-more">คลิกเพื่อเข้าดู &rarr;</div></div>`;
    });
    if(!hasContent) area.innerHTML = `<div class="text-center py-5 w-100 text-muted">ไม่พบข้อมูล</div>`;
  }
  
  function openViewManual(id) { const manual = allManualsData.find(r => r[0].toString()===id.toString()); if(!manual) return; currentlyViewingManualId = id; document.getElementById('viewManTitle').innerText = manual[3]; document.getElementById('viewManDept').innerText = "📌 " + manual[1]; document.getElementById('viewManCat').innerText = "🏷️ " + manual[2]; try { currentlyViewingSteps = JSON.parse(manual[4]); if (!Array.isArray(currentlyViewingSteps)) currentlyViewingSteps = []; } catch(e) { currentlyViewingSteps = []; } renderSteps(); document.getElementById('btnAddStep').style.display = myRole!=='Member' ? 'block' : 'none'; bootstrap.Modal.getOrCreateInstance(document.getElementById('viewManualModal')).show(); }
  function renderSteps() { const area = document.getElementById('viewManStepsArea'); area.innerHTML = ''; if(currentlyViewingSteps.length===0){ area.innerHTML=`<div class="text-center text-muted py-5">ยังไม่มีขั้นตอน</div>`; return; } currentlyViewingSteps.forEach((s, i) => { const imgHtml = s.img ? `<div class="mt-3 text-center"><img src="${s.img}" class="manual-step-img" onclick="openLightbox('${s.img}')"></div>` : ''; const admin = myRole!=='Member' ? `<div class="step-tools"><button class="btn btn-sm btn-outline-info" onclick="editStep(${i})">✏️ แก้ไข</button><button class="btn btn-sm btn-outline-danger" onclick="deleteStep(${i})">✖ ลบ</button></div>` : ''; area.innerHTML += `<div class="manual-step-card">${admin}<div class="manual-step-number">ขั้นตอนที่ ${i+1}</div><div class="manual-step-text">${s.text}</div>${imgHtml}</div>`; }); }
  function openNewManualModal() { resetManualForm(); bootstrap.Modal.getOrCreateInstance(document.getElementById('manualModal')).show(); }
  function openStepModal() { document.getElementById('addStepForm').reset(); document.getElementById('editStepIndex').value = ''; document.getElementById('stepModalTitle').innerText = '➕ เพิ่มขั้นตอน'; clearStepImage(); bootstrap.Modal.getOrCreateInstance(document.getElementById('stepModal')).show(); }
  function editStep(idx) { const step = currentlyViewingSteps[idx]; document.getElementById('addStepForm').reset(); document.getElementById('editStepIndex').value = idx; document.getElementById('stepModalTitle').innerText = '✏️ แก้ไขขั้นตอนที่ ' + (idx + 1); document.getElementById('stepContent').value = step.text; if (step.img) processStepImage(step.img); else clearStepImage(); bootstrap.Modal.getOrCreateInstance(document.getElementById('stepModal')).show(); }
  
  async function handleStepSubmit(e) { 
      e.preventDefault(); const newText = document.getElementById('stepContent').value; const newImg = document.getElementById('stepMediaBase64').value; const idx = document.getElementById('editStepIndex').value; 
      const btn = document.querySelector('#stepModal button[type="submit"]'); btn.disabled = true; btn.innerText = '⏳ กำลังบันทึก...';
      try {
          let uploadedImg = newImg;
          if (newImg && newImg.startsWith('data:image')) { Swal.fire({title:'กำลังอัปโหลดรูป...', didOpen:()=>Swal.showLoading()}); uploadedImg = await uploadToSupabase(newImg, 'manual'); }
          if(idx !== "") currentlyViewingSteps[idx] = { text: newText, img: uploadedImg }; else currentlyViewingSteps.push({ text: newText, img: uploadedImg }); 
          const { error } = await supabaseClient.from('manuals').update({ stepsData: JSON.stringify(currentlyViewingSteps) }).eq('id', currentlyViewingManualId); if(error) throw error;
          bootstrap.Modal.getOrCreateInstance(document.getElementById('stepModal')).hide(); renderSteps(); refreshData(document.getElementById('refreshBtn')); Swal.fire({toast:true, position:'top-end', title:'บันทึกสำเร็จ', icon:'success', timer:1500, showConfirmButton:false, background:'#111', color:'#fff'});
      } catch(err) { Swal.fire('Error', err.message, 'error'); } finally { btn.disabled = false; btn.innerText = '💾 บันทึกขั้นตอน'; }
  }
  
  function deleteStep(idx) { Swal.fire({title:'ลบขั้นตอนนี้?', icon:'warning', showCancelButton:true, confirmButtonColor:'#ff3366', background:'#111', color:'#fff'}).then(async r => { if(r.isConfirmed) { currentlyViewingSteps.splice(idx, 1); await supabaseClient.from('manuals').update({ stepsData: JSON.stringify(currentlyViewingSteps) }).eq('id', currentlyViewingManualId); renderSteps(); refreshData(document.getElementById('refreshBtn')); } }); }
  function confirmDeleteManual(id) { Swal.fire({title:'ลบหมวดหมู่นี้?', icon:'warning', showCancelButton:true, confirmButtonColor:'#ff3366', background:'#111', color:'#fff'}).then(async r => { if(r.isConfirmed) { await supabaseClient.from('manuals').delete().eq('id', id); refreshData(document.getElementById('refreshBtn')); } }); }

  // ==========================================
  // 🚀 8. จัดการเว็บไซต์ (Portals/Backends)
  // ==========================================
  async function loadSupabaseWebsites() {
     try {
         const { data: pData } = await supabaseClient.from('portals').select('*').order('id', { ascending: false });
         allPortalsData = (pData || []).map(r => [r.id, r.title, r.linkUrl, r.imageUrl]); renderPortalGrid();
         const { data: bData } = await supabaseClient.from('backends').select('*').order('id', { ascending: false });
         allBackendsData = (bData || []).map(r => [r.id, r.title, r.linkUrl, r.imageUrl]); renderBackendGrid();
     } catch (err) { console.error('Supabase error:', err); }
  }

  async function uploadToSupabase(base64Data, prefix) {
    if (!base64Data.startsWith('data:image')) return base64Data; 
    const res = await fetch(base64Data); const blob = await res.blob(); const fileName = prefix + '_' + new Date().getTime() + '.jpg'; 
    const { error } = await supabaseClient.storage.from('images').upload(fileName, blob, { upsert: true }); if (error) throw error;
    const { data: urlData } = supabaseClient.storage.from('images').getPublicUrl(fileName); return urlData.publicUrl;
  }

  function switchWebZone(zone, btn) { document.getElementById('tabFrontEnd').classList.remove('active'); document.getElementById('tabBackEnd').classList.remove('active'); btn.classList.add('active'); btn.style.borderColor="#fff"; btn.style.color="#fff"; if(zone==='frontend'){document.getElementById('tabBackEnd').style.borderColor="#444"; document.getElementById('tabBackEnd').style.color="#ccc";} else {document.getElementById('tabFrontEnd').style.borderColor="#444"; document.getElementById('tabFrontEnd').style.color="#ccc";} document.getElementById('portalGridArea').style.display = zone==='frontend'?'grid':'none'; document.getElementById('backendGridArea').style.display = zone==='backend'?'grid':'none'; document.getElementById('addPortalBtn').style.display = zone==='frontend'?'block':'none'; document.getElementById('addBackendBtn').style.display = zone==='backend'?'block':'none'; }
  function processPortalImage(b64) { document.getElementById('portalImagePreview').src = b64; document.getElementById('portalImagePreview').style.display = 'block'; document.getElementById('portalMediaBase64').value = b64; document.getElementById('portalPasteText').style.display = 'none'; document.getElementById('btnPortalClearImage').style.display = 'block'; }
  function clearPortalImage() { document.getElementById('portalImagePreview').src = ''; document.getElementById('portalImagePreview').style.display = 'none'; document.getElementById('portalMediaBase64').value = ''; document.getElementById('portalPasteText').style.display = 'block'; document.getElementById('btnPortalClearImage').style.display = 'none'; document.getElementById('portalMediaFile').value = ''; }
  function processBackendImage(b64) { document.getElementById('backendImagePreview').src = b64; document.getElementById('backendImagePreview').style.display = 'block'; document.getElementById('backendMediaBase64').value = b64; document.getElementById('backendPasteText').style.display = 'none'; document.getElementById('btnBackendClearImage').style.display = 'block'; }
  function clearBackendImage() { document.getElementById('backendImagePreview').src = ''; document.getElementById('backendImagePreview').style.display = 'none'; document.getElementById('backendMediaBase64').value = ''; document.getElementById('backendPasteText').style.display = 'block'; document.getElementById('btnBackendClearImage').style.display = 'none'; document.getElementById('backendMediaFile').value = ''; }
  function openPortalModal() { document.getElementById('addPortalForm').reset(); document.getElementById('editPortalId').value = ''; clearPortalImage(); document.getElementById('portalModalTitle').innerText='🌐 เพิ่มเว็บไซต์หน้าบ้าน'; bootstrap.Modal.getOrCreateInstance(document.getElementById('portalModal')).show(); }
  function openBackendModal() { document.getElementById('addBackendForm').reset(); document.getElementById('editBackendId').value = ''; clearBackendImage(); document.getElementById('backendModalTitle').innerText='⚙️ เพิ่มเว็บไซต์หลังบ้าน'; bootstrap.Modal.getOrCreateInstance(document.getElementById('backendModal')).show(); }

  async function handlePortalSubmit(e) { 
    e.preventDefault(); const btn = document.getElementById('btnSavePortal'); btn.disabled = true; btn.innerText = '⏳ อัปโหลดรูป...';
    try {
        const title = document.getElementById('portalTitle').value; const linkUrl = document.getElementById('portalLink').value; let imageUrl = document.getElementById('portalMediaBase64').value; const id = document.getElementById('editPortalId').value; 
        if(!imageUrl){ Swal.fire({toast:true, position:'top', title:'ใส่รูปด้วยครับ', icon:'warning', background:'#111', color:'#fff', timer:2000, showConfirmButton:false}); btn.disabled=false; btn.innerText='💾 บันทึกและเผยแพร่'; return; } 
        imageUrl = await uploadToSupabase(imageUrl, 'portal');
        if(id) await supabaseClient.from('portals').update({ title, linkUrl, imageUrl }).eq('id', id); else await supabaseClient.from('portals').insert([{ title, linkUrl, imageUrl }]);
        bootstrap.Modal.getOrCreateInstance(document.getElementById('portalModal')).hide(); Swal.fire({toast:true, position:'top-end', title:'บันทึกสำเร็จ!', icon:'success', timer:1500, showConfirmButton:false, background:'#111', color:'#fff'}); await loadSupabaseWebsites();
    } catch (err) { Swal.fire('Error', err.message, 'error'); } finally { btn.disabled = false; btn.innerText = '💾 บันทึกและเผยแพร่'; }
  }

  async function handleBackendSubmit(e) { 
    e.preventDefault(); const btn = document.getElementById('btnSaveBackend'); btn.disabled = true; btn.innerText = '⏳ อัปโหลดรูป...';
    try {
        const title = document.getElementById('backendTitle').value; const linkUrl = document.getElementById('backendLink').value; let imageUrl = document.getElementById('backendMediaBase64').value; const id = document.getElementById('editBackendId').value; 
        if(!imageUrl){ Swal.fire({toast:true, position:'top', title:'ใส่รูปด้วยครับ', icon:'warning', background:'#111', color:'#fff', timer:2000, showConfirmButton:false}); btn.disabled=false; btn.innerText='💾 บันทึกและเผยแพร่'; return; } 
        imageUrl = await uploadToSupabase(imageUrl, 'backend');
        if(id) await supabaseClient.from('backends').update({ title, linkUrl, imageUrl }).eq('id', id); else await supabaseClient.from('backends').insert([{ title, linkUrl, imageUrl }]);
        bootstrap.Modal.getOrCreateInstance(document.getElementById('backendModal')).hide(); Swal.fire({toast:true, position:'top-end', title:'บันทึกสำเร็จ!', icon:'success', timer:1500, showConfirmButton:false, background:'#111', color:'#fff'}); await loadSupabaseWebsites();
    } catch (err) { Swal.fire('Error', err.message, 'error'); } finally { btn.disabled = false; btn.innerText = '💾 บันทึกและเผยแพร่'; }
  }

  function renderPortalGrid() { const area = document.getElementById('portalGridArea'); area.innerHTML = ''; if(allPortalsData.length===0){area.innerHTML=`<div class="text-center py-5 w-100 text-muted">ไม่มีเว็บ</div>`; return;} allPortalsData.forEach(r => { const [pId, pTitle, pLink, pImg] = r; const admin = myRole!=='Member' ? `<div class="card-actions"><button class="btn-action edit" onclick="event.preventDefault(); openEditPortal('${pId}')">✏️</button><button class="btn-action delete" onclick="event.preventDefault(); confirmDeletePortal('${pId}')">✖</button></div>` : ''; area.innerHTML += `<a href="${pLink}" target="_blank" class="portal-card">${admin}<div class="portal-img-container"><img src="${pImg}" class="portal-img"></div><div class="portal-info"><div class="portal-title">${pTitle}</div><div class="portal-link-text">เข้าสู่เว็บไซต์ ↗</div></div></a>`; }); }
  function renderBackendGrid() { const area = document.getElementById('backendGridArea'); area.innerHTML = ''; if(allBackendsData.length===0){area.innerHTML=`<div class="text-center py-5 w-100 text-muted">ไม่มีเว็บ</div>`; return;} allBackendsData.forEach(r => { const [pId, pTitle, pLink, pImg] = r; const admin = myRole!=='Member' ? `<div class="card-actions"><button class="btn-action edit" onclick="event.preventDefault(); openEditBackend('${pId}')">✏️</button><button class="btn-action delete" onclick="event.preventDefault(); confirmDeleteBackend('${pId}')">✖</button></div>` : ''; area.innerHTML += `<a href="${pLink}" target="_blank" class="portal-card backend-mode">${admin}<div class="portal-img-container"><img src="${pImg}" class="portal-img"></div><div class="portal-info"><div class="portal-title">${pTitle}</div><div class="portal-link-text">เข้าระบบ ↗</div></div></a>`; }); }
  
  function openEditPortal(id) { const p = allPortalsData.find(r=>r[0].toString()===id.toString()); if(!p) return; document.getElementById('editPortalId').value = id; document.getElementById('portalTitle').value = p[1]; document.getElementById('portalLink').value = p[2]; if(p[3]) processPortalImage(p[3]); else clearPortalImage(); document.getElementById('portalModalTitle').innerText='✏️ แก้ไขเว็บหน้าบ้าน'; bootstrap.Modal.getOrCreateInstance(document.getElementById('portalModal')).show(); }
  function openEditBackend(id) { const p = allBackendsData.find(r=>r[0].toString()===id.toString()); if(!p) return; document.getElementById('editBackendId').value = id; document.getElementById('backendTitle').value = p[1]; document.getElementById('backendLink').value = p[2]; if(p[3]) processBackendImage(p[3]); else clearBackendImage(); document.getElementById('backendModalTitle').innerText='✏️ แก้ไขเว็บหลังบ้าน'; bootstrap.Modal.getOrCreateInstance(document.getElementById('backendModal')).show(); }
  
  async function confirmDeletePortal(id) { Swal.fire({title:'ลบเว็บไซต์?', icon:'warning', showCancelButton:true, confirmButtonColor:'#ff3366', background:'#111', color:'#fff'}).then(async r => { if(r.isConfirmed) { Swal.fire({title:'กำลังลบ...', didOpen:()=>Swal.showLoading()}); await supabaseClient.from('portals').delete().eq('id', id); await loadSupabaseWebsites(); Swal.fire({toast:true, position:'top-end', title:'ลบสำเร็จ', icon:'success', timer:1500, showConfirmButton:false, background:'#111', color:'#fff'}); } }); }
  async function confirmDeleteBackend(id) { Swal.fire({title:'ลบเว็บไซต์?', icon:'warning', showCancelButton:true, confirmButtonColor:'#ff3366', background:'#111', color:'#fff'}).then(async r => { if(r.isConfirmed) { Swal.fire({title:'กำลังลบ...', didOpen:()=>Swal.showLoading()}); await supabaseClient.from('backends').delete().eq('id', id); await loadSupabaseWebsites(); Swal.fire({toast:true, position:'top-end', title:'ลบสำเร็จ', icon:'success', timer:1500, showConfirmButton:false, background:'#111', color:'#fff'}); } }); }

  // ==========================================
  // 🚀 9. ระบบแจ้งลากิจ / ลาป่วย (Leave Requests)
  // ==========================================
  let allLeavesData = [];
  let currentLeavePage = 1;
  const leavesPerPage = 10;

  async function loadSupabaseLeaves() {
      try {
          const { data } = await supabaseClient.from('leave_requests').select('*').order('created_at', { ascending: false });
          allLeavesData = data || [];
          checkLeaveAlerts(); 
      } catch (err) { console.error('Error loading leaves:', err); }
  }

  function checkLeaveAlerts() {
      const btnLeave = document.getElementById('btnLeaveSystem');
      if (!btnLeave) return;

      const currentMonth = document.getElementById('monthPicker') ? document.getElementById('monthPicker').value : '';
      let hasPendingInCurrentMonth = false;

      if (myRole === 'SuperAdmin') {
          hasPendingInCurrentMonth = allLeavesData.some(L => {
              const reqMonth = L.leave_date.substring(0, 7); 
              return L.status === 'Pending' && (!currentMonth || reqMonth === currentMonth);
          });
      }

      if (hasPendingInCurrentMonth) {
          btnLeave.classList.add('btn-alert-blink');
          btnLeave.innerText = '🚨 มีคำขอลาใหม่!';
      } else {
          btnLeave.classList.remove('btn-alert-blink');
          btnLeave.innerText = '📩 ระบบแจ้งลา';
      }
  }

  function openLeaveHistoryModal() {
      const currentMonth = document.getElementById('monthPicker') ? document.getElementById('monthPicker').value : '';
      if(document.getElementById('leaveMonthFilter')) document.getElementById('leaveMonthFilter').value = currentMonth;
      
      loadLeavesPage(1); 
      bootstrap.Modal.getOrCreateInstance(document.getElementById('leaveHistoryModal')).show();
  }

  function openSubmitLeaveModal() {
      document.getElementById('leaveForm').reset();
      const now = new Date();
      document.getElementById('leaveDateInput').value = now.toISOString().split('T')[0];
      bootstrap.Modal.getOrCreateInstance(document.getElementById('submitLeaveModal')).show();
  }

  async function handleLeaveSubmit(e) {
      e.preventDefault();
      const btn = document.querySelector('#leaveForm button[type="submit"]');
      btn.disabled = true; btn.innerText = '⏳ กำลังส่งคำขอ...';
      
      const myNick = localStorage.getItem('okvip_nick');
      const me = allUsersData.find(u => u[1] === myNick);
      const myDept = me ? me[3] : 'ไม่ระบุ';
      
      const payload = {
          nickname: myNick,
          department: myDept,
          leave_date: document.getElementById('leaveDateInput').value,
          leave_type: document.getElementById('leaveTypeInput').value,
          reason: document.getElementById('leaveReasonInput').value,
          status: 'Pending'
      };
      
      try {
          await supabaseClient.from('leave_requests').insert([payload]);
          bootstrap.Modal.getOrCreateInstance(document.getElementById('submitLeaveModal')).hide();
          await loadSupabaseLeaves();
          loadLeavesPage(currentLeavePage); 
          Swal.fire({toast:true, position:'top-end', title:'ส่งคำขอลาสำเร็จ!', icon:'success', timer:2000, showConfirmButton:false, background:'#111', color:'#fff'});
      } catch(err) {
          Swal.fire('Error', err.message, 'error');
      } finally {
          btn.disabled = false; btn.innerText = 'ส่งคำขอลา';
      }
  }

  function loadLeavesPage(page) {
      currentLeavePage = page;
      const tb = document.getElementById('leaveTableBody');
      const pagArea = document.getElementById('leavePaginationArea');
      tb.innerHTML = ''; pagArea.innerHTML = '';
      
      const filterMonth = document.getElementById('leaveMonthFilter').value;
      const myNick = localStorage.getItem('okvip_nick');

      let filteredData = allLeavesData.filter(L => {
          const reqMonth = L.leave_date ? L.leave_date.substring(0, 7) : '';
          return !filterMonth || reqMonth === filterMonth;
      });

      if(filteredData.length === 0) {
          tb.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted">ไม่มีข้อมูลการแจ้งลาในเดือนที่เลือก</td></tr>`;
          return;
      }

      const totalPages = Math.ceil(filteredData.length / leavesPerPage);
      if (currentLeavePage > totalPages) currentLeavePage = totalPages;
      const startIndex = (currentLeavePage - 1) * leavesPerPage;
      const paginatedData = filteredData.slice(startIndex, startIndex + leavesPerPage);

      paginatedData.forEach(L => {
          let statusBadge = '';
          if(L.status === 'Pending') statusBadge = `<span class="badge bg-warning text-dark border">⏳ รออนุมัติ</span>`;
          else if(L.status === 'Approved') statusBadge = `<span class="badge bg-success border">✅ อนุมัติแล้ว</span>`;
          else if(L.status === 'Rejected') statusBadge = `<span class="badge bg-danger border">❌ ปฏิเสธ</span>`;
          
          let actionBtns = '-';
          if(myRole === 'SuperAdmin' && L.status === 'Pending') {
              actionBtns = `
                  <button class="btn btn-sm btn-outline-success me-1" onclick="updateLeaveStatus('${L.id}', 'Approved')">✔️</button>
                  <button class="btn btn-sm btn-outline-danger" onclick="updateLeaveStatus('${L.id}', 'Rejected')">❌</button>
              `;
          } 
          else if ((myRole === 'SuperAdmin' || myNick === L.nickname) && L.status === 'Pending') {
             actionBtns = `<button class="btn btn-sm btn-outline-secondary" onclick="deleteLeave('${L.id}')">ยกเลิกคำขอ</button>`;
          }
          else if (myRole === 'SuperAdmin') {
             actionBtns = `<button class="btn btn-sm btn-outline-secondary" onclick="deleteLeave('${L.id}')">ลบประวัติ</button>`;
          }
          
          let displayNick = L.nickname;
          if (L.nickname === myNick) displayNick = `<span class="text-warning">${L.nickname} (คุณ)</span>`;

          tb.innerHTML += `
              <tr>
                  <td>${new Date(L.leave_date).toLocaleDateString('th-TH')}</td>
                  <td class="fw-bold text-white">${displayNick} <br><small class="text-muted">${L.department.split(' ')[0]}</small></td>
                  <td class="text-info">${L.leave_type}</td>
                  <td class="small text-muted" style="max-width: 200px; white-space: normal;">${L.reason}</td>
                  <td>${statusBadge}</td>
                  <td class="text-center">${actionBtns}</td>
              </tr>
          `;
      });

      if (totalPages > 1) { 
          let pageHtml = `<button class="page-btn" onclick="loadLeavesPage(${currentLeavePage - 1})" ${currentLeavePage === 1 ? 'disabled' : ''}>&laquo; ก่อนหน้า</button>`; 
          for (let i = 1; i <= totalPages; i++) {
              pageHtml += `<button class="page-btn ${i === currentLeavePage ? 'active' : ''}" onclick="loadLeavesPage(${i})">${i}</button>`; 
          }
          pageHtml += `<button class="page-btn" onclick="loadLeavesPage(${currentLeavePage + 1})" ${currentLeavePage === totalPages ? 'disabled' : ''}>ถัดไป &raquo;</button>`; 
          pagArea.innerHTML = pageHtml; 
      }
  }

  function updateLeaveStatus(id, newStatus) {
      Swal.fire({
          title: newStatus === 'Approved' ? 'ยืนยันการ "อนุมัติ" ?' : 'ยืนยันการ "ปฏิเสธ" ?',
          icon: 'question', showCancelButton: true, 
          confirmButtonColor: newStatus === 'Approved' ? '#00ff66' : '#ff3366',
          confirmButtonText: 'ยืนยัน',
          background:'#111', color:'#fff'
      }).then(async r => {
          if(r.isConfirmed) {
              Swal.fire({title:'กำลังบันทึก...', didOpen:()=>Swal.showLoading()});
              await supabaseClient.from('leave_requests').update({status: newStatus}).eq('id', id);
              await loadSupabaseLeaves();
              loadLeavesPage(currentLeavePage); 
              Swal.fire({toast:true, position:'top-end', title:'อัปเดตสถานะสำเร็จ', icon:'success', timer:1500, showConfirmButton:false, background:'#111', color:'#fff'});
          }
      });
  }

  function deleteLeave(id) {
       Swal.fire({title: 'ยกเลิกคำขอนี้?', text: 'ข้อมูลจะถูกลบออกจากระบบ', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff3366', background:'#111', color:'#fff'}).then(async r => {
          if(r.isConfirmed) {
              Swal.fire({title:'กำลังยกเลิก...', didOpen:()=>Swal.showLoading()});
              await supabaseClient.from('leave_requests').delete().eq('id', id);
              await loadSupabaseLeaves();
              loadLeavesPage(1); 
              Swal.fire({toast:true, position:'top-end', title:'ยกเลิกคำขอสำเร็จ', icon:'success', timer:1500, showConfirmButton:false, background:'#111', color:'#fff'});
          }
       });
  }
