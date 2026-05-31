function navScroll(e, id){
  e.preventDefault();
  const el = document.getElementById(id);
  if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
}

// ===== PHOTO UPLOAD =====
let frmPhotos = [];
let frmSlideIdx = 0;

function frmDragOver(e){
  e.preventDefault();
  document.getElementById('frmDropZone').style.borderColor='rgba(100,160,255,0.6)';
  document.getElementById('frmDropZone').style.background='rgba(29,111,216,0.08)';
}
function frmDragLeave(e){
  document.getElementById('frmDropZone').style.borderColor='rgba(255,255,255,0.15)';
  document.getElementById('frmDropZone').style.background='';
}
function frmDrop(e){
  e.preventDefault();
  frmDragLeave(e);
  frmHandleFiles(e.dataTransfer.files);
}
function frmHandleFiles(files){
  const arr = Array.from(files).filter(f=>f.type.startsWith('image/'));
  const remaining = 5 - frmPhotos.length;
  arr.slice(0, remaining).forEach(f=>{
    const reader = new FileReader();
    reader.onload = ev => {
      frmPhotos.push({name: f.name, url: ev.target.result});
      frmRenderPhotos();
    };
    reader.readAsDataURL(f);
  });
}
function frmRenderPhotos(){
  const slideWrap = document.getElementById('frmSlideWrap');
  const thumbStrip = document.getElementById('frmThumbStrip');
  const countEl = document.getElementById('frmPhotoCount');
  const dropZone = document.getElementById('frmDropZone');

  if(frmPhotos.length === 0){
    slideWrap.style.display = 'none';
    thumbStrip.style.display = 'none';
    countEl.style.display = 'none';
    dropZone.style.display = 'flex';
    return;
  }

  dropZone.style.display = frmPhotos.length >= 5 ? 'none' : 'flex';
  slideWrap.style.display = 'block';
  thumbStrip.style.display = 'flex';
  countEl.style.display = 'block';

  if(frmSlideIdx >= frmPhotos.length) frmSlideIdx = frmPhotos.length - 1;

  document.getElementById('frmSlideImg').style.backgroundImage = `url('${frmPhotos[frmSlideIdx].url}')`;
  document.getElementById('frmSlideCounter').textContent = `${frmSlideIdx+1} / ${frmPhotos.length}`;
  countEl.textContent = `${frmPhotos.length} foto dipilih${frmPhotos.length < 5 ? ' (maks. 5)' : ' · Maks tercapai'}`;

  thumbStrip.innerHTML = '';
  frmPhotos.forEach((p,i)=>{
    const t = document.createElement('div');
    t.style.cssText = `width:38px;height:38px;border-radius:5px;flex-shrink:0;background-image:url('${p.url}');background-size:cover;background-position:center;cursor:pointer;border:2px solid ${i===frmSlideIdx?'var(--blue)':'rgba(255,255,255,0.15)'};transition:border-color .2s`;
    t.onclick = () => { frmSlideIdx = i; frmRenderPhotos(); };
    thumbStrip.appendChild(t);
  });
}
function frmSlidePrev(){ frmSlideIdx = (frmSlideIdx - 1 + frmPhotos.length) % frmPhotos.length; frmRenderPhotos(); }
function frmSlideNext(){ frmSlideIdx = (frmSlideIdx + 1) % frmPhotos.length; frmRenderPhotos(); }
function frmRemoveCurrent(){
  frmPhotos.splice(frmSlideIdx, 1);
  if(frmSlideIdx >= frmPhotos.length) frmSlideIdx = Math.max(0, frmPhotos.length - 1);
  frmRenderPhotos();
}

// ===== KIRIM LAPORAN =====
function kirimLaporan(){
  const nama = document.getElementById('frmNama').value.trim();
  const kontak = document.getElementById('frmKontak').value.trim();
  const layanan = document.getElementById('frmLayanan').value;
  const mesin = document.getElementById('frmMesin').value.trim();
  const keluhan = document.getElementById('frmKeluhan').value.trim();
  const lokasi = document.getElementById('frmLokasi').value.trim();
  const errEl = document.getElementById('frmError');

  if(!nama || !kontak || !layanan || !mesin){
    errEl.style.display = 'block';
    errEl.textContent = 'Mohon lengkapi field wajib: Nama, No. WA/Email, Jenis Layanan, dan Mesin/Brand.';
    return;
  }
  errEl.style.display = 'none';

  const fotoInfo = frmPhotos.length > 0 ? `\n📸 *Foto:* ${frmPhotos.length} foto dilampirkan (akan dikirim terpisah)` : '';

  const msg = `*LAPORAN / INQUIRY LAYANAN*
━━━━━━━━━━━━━━━━━━━━
👤 *Nama:* ${nama}
📱 *Kontak:* ${kontak}
🔧 *Layanan:* ${layanan}
🏭 *Mesin/Brand:* ${mesin}${keluhan ? `\n📝 *Keluhan:* ${keluhan}` : ''}${lokasi ? `\n📍 *Lokasi:* ${lokasi}` : ''}${fotoInfo}
━━━━━━━━━━━━━━━━━━━━
_Dikirim via website Dynamix Vision Automation_`;

  const url = 'https://wa.me/6289855551050?text=' + encodeURIComponent(msg);
  window.open(url, '_blank');
}

// ===== FLOWCHART ALUR LAYANAN =====
(function(){
  const fcStepsData = [
    {icon:'📋', tag:'Customer', title:'Buat laporan', color:'#378ADD', info:'Customer isi form inquiry & kirim foto mesin ke WhatsApp teknisi Dynamix.'},
    {icon:'📲', tag:'Notifikasi', title:'Laporan diterima', color:'#1D9E75', info:'Tim Dynamix terima notifikasi WA instan, data sudah terformat rapi.'},
    {icon:'🔍', tag:'Analisa', title:'Identifikasi masalah', color:'#7F77DD', info:'Teknisi analisa laporan, foto mesin, dan identifikasi jenis kerusakan.'},
    {icon:'💡', tag:'Estimasi', title:'Penawaran solusi', color:'#BA7517', info:'Dynamix sampaikan estimasi biaya, waktu, dan spare part yang dibutuhkan.'},
    {icon:'⚙️', tag:'Pengerjaan', title:'Eksekusi layanan', color:'#D85A30', info:'Teknisi kerjakan on-site atau di workshop — servis, retrofit, instalasi.'},
    {icon:'🎯', tag:'QC', title:'Quality check', color:'#639922', info:'Uji coba mesin, kalibrasi parameter, verifikasi akurasi sebelum serah terima.'},
    {icon:'📨', tag:'Selesai', title:'Feedback ke customer', color:'#378ADD', info:'Customer terima laporan hasil, garansi servis & training operator.'},
  ];

  const wrap = document.getElementById('fcSteps');
  if(!wrap) return;

  fcStepsData.forEach((s, i) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:6px';
    row.innerHTML = `
      <div id="fcnum${i}" style="width:14px;height:14px;border-radius:50%;border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:7px;color:rgba(255,255,255,0.3);flex-shrink:0;transition:background .3s,border-color .3s,color .3s">${i+1}</div>
      <div id="fcicon${i}" style="font-size:13px;flex-shrink:0;transition:transform .3s">${s.icon}</div>
      <div id="fcbody${i}" style="flex:1;padding:4px 7px;border-radius:6px;border:0.5px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);transition:all .3s">
        <div id="fctag${i}" style="font-size:7px;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);transition:color .3s">${s.tag}</div>
        <div style="font-size:9px;font-weight:600;color:rgba(255,255,255,0.7)">${s.title}</div>
      </div>`;
    wrap.appendChild(row);

    if(i < fcStepsData.length - 1) {
      const conn = document.createElement('div');
      conn.style.cssText = 'display:flex;align-items:center;gap:6px';
      conn.innerHTML = `<div style="width:14px;flex-shrink:0;display:flex;justify-content:center"><div style="width:1.5px;height:14px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden"><div id="fcconnfill${i}" style="width:100%;height:0%;background:#378ADD;border-radius:2px;transition:height .05s linear"></div></div></div>`;
      wrap.appendChild(conn);
    }
  });

  const HOLD=1000, FILL_MS=350, FILL_STEPS=35;

  function fcReset(){
    fcStepsData.forEach((s,i)=>{
      const body=document.getElementById('fcbody'+i), icon=document.getElementById('fcicon'+i);
      const num=document.getElementById('fcnum'+i), tag=document.getElementById('fctag'+i);
      if(body){body.style.borderColor='rgba(255,255,255,0.07)';body.style.background='rgba(255,255,255,0.03)';}
      if(icon) icon.style.transform='scale(1)';
      if(num){num.style.background='transparent';num.style.borderColor='rgba(255,255,255,0.15)';num.style.color='rgba(255,255,255,0.3)';}
      if(tag) tag.style.color='rgba(255,255,255,0.3)';
      if(i<fcStepsData.length-1){const f=document.getElementById('fcconnfill'+i);if(f)f.style.height='0%';}
    });
    const p=document.getElementById('fcProgress');if(p)p.style.width='0%';
  }

  function fcActivate(idx){
    const s=fcStepsData[idx];
    const body=document.getElementById('fcbody'+idx), icon=document.getElementById('fcicon'+idx);
    const num=document.getElementById('fcnum'+idx), tag=document.getElementById('fctag'+idx);
    if(body){body.style.borderColor=s.color+'77';body.style.background=s.color+'18';}
    if(icon) icon.style.transform='scale(1.2)';
    if(num){num.style.background=s.color+'33';num.style.borderColor=s.color+'88';num.style.color=s.color;}
    if(tag) tag.style.color=s.color;
    const txt=document.getElementById('fcInfoText');if(txt)txt.textContent=s.info;
    const prog=document.getElementById('fcProgress');if(prog)prog.style.width=((idx+1)/fcStepsData.length*100)+'%';
  }

  function fcDeactivate(idx){
    const s=fcStepsData[idx];
    const body=document.getElementById('fcbody'+idx), icon=document.getElementById('fcicon'+idx);
    if(body){body.style.borderColor=s.color+'33';body.style.background=s.color+'0a';}
    if(icon) icon.style.transform='scale(1)';
  }

  function fcFillConn(idx,cb){
    if(idx>=fcStepsData.length-1){cb();return;}
    const fill=document.getElementById('fcconnfill'+idx);
    let p=0;const step=100/FILL_STEPS;
    const iv=setInterval(()=>{p+=step;if(fill)fill.style.height=Math.min(p,100)+'%';if(p>=100){clearInterval(iv);cb();}},FILL_MS/FILL_STEPS);
  }

  function fcRun(idx){
    fcActivate(idx);
    setTimeout(()=>{
      fcFillConn(idx,()=>{
        fcDeactivate(idx);
        const next=(idx+1)%fcStepsData.length;
        if(next===0){setTimeout(()=>{fcReset();setTimeout(()=>fcRun(0),300);},500);}
        else fcRun(next);
      });
    },HOLD);
  }

  setTimeout(()=>fcRun(0),800);
})();
