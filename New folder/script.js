// ===== NAVIGATION =====
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
  const keunggulan = document.getElementById('frmKeunggulan');

  if(frmPhotos.length === 0){
    slideWrap.style.display = 'none';
    thumbStrip.style.display = 'none';
    countEl.style.display = 'none';
    dropZone.style.display = 'flex';
    if(keunggulan) keunggulan.style.display = 'flex';
    // Reset textarea keluhan ke ukuran normal
    const keluhan = document.getElementById('frmKeluhan');
    if(keluhan) keluhan.style.minHeight = '';
    return;
  }

  // Sembunyikan "Kenapa Pilih Kami?" saat ada foto
  if(keunggulan) keunggulan.style.display = 'none';

  // Perbesar textarea Keterangan/Keluhan agar form kiri sejajar dengan kolom foto kanan
  const keluhan = document.getElementById('frmKeluhan');
  if(keluhan && frmPhotos.length === 1) {
    // Hanya set pertama kali foto masuk, agar tidak override resize manual
    keluhan.style.minHeight = '20px';
  }

  dropZone.style.display = frmPhotos.length >= 5 ? 'none' : 'flex';
  slideWrap.style.display = 'block';
  thumbStrip.style.display = 'flex';
  countEl.style.display = 'block';

  // Auto-scroll ke form (Nama Lengkap) saat foto pertama berhasil diupload
  if(frmPhotos.length === 1){
    const formSection = document.getElementById('laporan');
    if(formSection){
      setTimeout(()=>{
        formSection.scrollIntoView({behavior:'smooth', block:'start'});
      }, 150);
    }
  }

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
    {icon:'📋', tag:'Customer', title:'Buat laporan', color:'#378ADD', info:'Customer isi form inquiry & kirim foto mesin ke WhatsApp teknisi Dynamix.           '},
    {icon:'📲', tag:'Notifikasi', title:'Laporan diterima', color:'#1D9E75', info:'Tim Dynamix terima notifikasi WA instan, data sudah terformat rapi.			 '},
    {icon:'🔍', tag:'Analisa', title:'Identifikasi masalah', color:'#7F77DD', info:'Teknisi analisa laporan, foto mesin, dan identifikasi jenis kerusakan.		 '},
    {icon:'💡', tag:'Estimasi', title:'Penawaran solusi', color:'#BA7517', info:'Dynamix sampaikan estimasi biaya, waktu, dan spare part yang dibutuhkan. 		 '},
    {icon:'⚙️', tag:'Pengerjaan', title:'Eksekusi layanan', color:'#D85A30', info:'Teknisi kerjakan on-site atau di workshop — servis, retrofit, instalasi. 	 '},
    {icon:'🎯', tag:'QC', title:'Quality check', color:'#639922', info:'Uji coba mesin, kalibrasi parameter, verifikasi akurasi sebelum serah terima. 		     '},
    {icon:'📨', tag:'Selesai', title:'Feedback ke customer', color:'#378ADD', info:'Customer menerima laporan hasil pengerjaan lengkap, sertifikat garansi servis, serta training operator agar mesin dapat dioperasikan secara optimal dan mandiri.'},
  ];

  const wrap = document.getElementById('fcSteps');
  if(!wrap) return;

  // Buat semua step LANGSUNG VISIBLE (permanen, tidak bergerak)
  fcStepsData.forEach((s, i) => {
    const row = document.createElement('div');
    row.id = 'fcrow' + i;
    row.style.cssText = 'display:flex;align-items:center;gap:6px;opacity:1;transition:none';
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
      conn.id = 'fcconn' + i;
      conn.style.cssText = 'display:flex;align-items:center;gap:6px;opacity:1';
      conn.innerHTML = `<div style="width:14px;flex-shrink:0;display:flex;justify-content:center"><div style="width:1.5px;height:14px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden"><div id="fcconnfill${i}" style="width:100%;height:0%;background:#378ADD;border-radius:2px;transition:height .05s linear"></div></div></div>`;
      wrap.appendChild(conn);
    }
  });

  const HOLD=1000, FILL_MS=350, FILL_STEPS=35;

  // Reset: hanya reset warna highlight, TIDAK menyembunyikan step
  function fcReset(){
    fcStepsData.forEach((s,i)=>{
      const body=document.getElementById('fcbody'+i), icon=document.getElementById('fcicon'+i);
      const num=document.getElementById('fcnum'+i), tag=document.getElementById('fctag'+i);
      if(body){body.style.borderColor='rgba(255,255,255,0.07)';body.style.background='rgba(255,255,255,0.03)';}
      if(icon) icon.style.transform='scale(1)';
      if(num){num.style.background='transparent';num.style.borderColor='rgba(255,255,255,0.15)';num.style.color='rgba(255,255,255,0.3)';}
      if(tag) tag.style.color='rgba(255,255,255,0.3)';
      if(i<fcStepsData.length-1){
        const f=document.getElementById('fcconnfill'+i);if(f)f.style.height='0%';
      }
    });
    const p=document.getElementById('fcProgress');if(p)p.style.width='0%';
    const txt=document.getElementById('fcInfoText');if(txt)txt.textContent='Memulai alur layanan...';
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
        if(next===0){setTimeout(()=>{fcReset();setTimeout(()=>fcRun(0),400);},500);}
        else fcRun(next);
      });
    },HOLD);
  }

  setTimeout(()=>fcRun(0),800);
})();



// ===== DRIVER DATA =====
const drivers=[
  {name:"Syntec",tag:"CNC CONTROLLER",sub:"Spesialis retrofit & upgrade controller CNC Syntec untuk mesin milling, turning, dan routing.",logo:"images/drivers/logo-syntec.png",img:"images/drivers/syntec.jpg",feats:["Controller 6i/10M/21MA","Parameter backup","Programming support","Retrofit service","Ready stock"]},
  {name:"SZGH",tag:"CNC CONTROLLER",sub:"Controller CNC SZGH sebagai alternatif ekonomis untuk retrofit dan upgrade sistem lama dengan fitur lengkap.",logo:"",img:"images/drivers/szgh.jpg",feats:["4-axis controller","Lathe & milling","G-code compatible","Easy parameter","Retrofit ready","Ready stock"]},
  {name:"Mitsubishi Electric",tag:"SERVO DRIVER",sub:"Servo driver & motor Mitsubishi Electric untuk presisi tinggi di aplikasi CNC dan otomasi industri.",logo:"images/drivers/logo-mitsubishi.png",img:"images/drivers/mitsubishi.jpg",feats:["MR-J4/J5 Series","Servo motor","Encoder support","Parameter setting","Repair & replace"]},
  {name:"Yaskawa",tag:"SERVO DRIVER",sub:"Servo driver & amplifier Yaskawa Sigma series untuk performa dan keandalan tinggi di lini produksi.",logo:"images/drivers/logo-yaskawa.png",img:"images/drivers/yaskawa.jpg",feats:["Sigma-7 Series","Sigma-5 Series","Servo tuning","Auto-tuning","Parameter backup"]},
  {name:"Delta Electronics",tag:"INVERTER / VFD",sub:"Inverter & VFD Delta Electronics untuk kontrol kecepatan motor AC di mesin CNC dan sistem konveyor.",logo:"images/drivers/logo-delta.png",img:"images/drivers/delta.jpg",feats:["VFD-M/E/C Series","PLC integration","Parameter setting","Repair service","Ready stock"]},
  {name:"Panasonic",tag:"SERVO DRIVER",sub:"Servo driver & motor Panasonic MINAS series dengan teknisi berpengalaman siap instalasi dan perbaikan.",logo:"images/drivers/logo-panasonic.png",img:"images/drivers/panasonic.jpg",feats:["MINAS A6 Series","MINAS A5 Series","Servo tuning","Encoder alignment","Repair & replace"]},
  {name:"Maxsine",tag:"SERVO DRIVER",sub:"Servo driver Maxsine EP series untuk aplikasi CNC dan otomasi dengan performa stabil dan harga kompetitif.",logo:"",img:"images/drivers/maxsine.jpg",feats:["EP3 Series","EP5 Series","Auto-tuning","Parameter setting","Repair & replace","Ready stock"]}
];

function openDriverModal(i){
  const d=drivers[i];
  document.getElementById('dmodalImg').src=d.img;
  document.getElementById('dmodalTag').innerHTML=`<i class="ti ti-cpu" style="font-size:9px"></i> ${d.tag}`;
  document.getElementById('dmodalTitle').textContent=d.name;
  document.getElementById('dmodalSub').textContent=d.sub;
  document.getElementById('dmodalFeats').innerHTML=d.feats.map(f=>`<span class="dmodal-feat"><i class="ti ti-check" style="font-size:9px;margin-right:4px;color:var(--blue)"></i>${f}</span>`).join('');
  document.getElementById('dmodalBackdrop').classList.add('open');
}
function closeDModal(e){if(e.target===document.getElementById('dmodalBackdrop'))closeDModalNow()}
function closeDModalNow(){document.getElementById('dmodalBackdrop').classList.remove('open')}


const services=[
  {icon:"ti-refresh",title:"Retrofit CNC",short:"Upgrade ke Syntec terbaru",tag:"LAYANAN UNGGULAN",primary:true,img:"images/services/retrofit.jpg",desc:"Kami mengganti seluruh sistem elektrik, motor servo, dan controller mesin CNC lama Anda menggunakan brand Syntec terbaru. Hasilnya: akurasi tinggi, antarmuka modern, dan umur mesin yang jauh lebih panjang — dengan biaya jauh lebih hemat dibanding beli mesin baru.",feats:["Controller Syntec baru","Servo motor baru","Sistem elektrik diperbaharui","Kalibrasi & uji coba","Garansi pengerjaan","Training operator"]},
  {icon:"ti-building-factory-2",title:"Trading Mesin CNC",short:"Jual beli CNC baru & bekas",tag:"JUAL BELI",img:"images/services/trading.jpg",desc:"Kami menyediakan mesin CNC baru maupun bekas berkualitas dengan berbagai jenis: milling, turning, router, plasma cutting, dan lainnya. Semua unit telah melalui inspeksi teknis dan dilengkapi garansi.",feats:["CNC Milling","CNC Turning","CNC Router","Plasma Cutting","Unit baru & bekas","Inspeksi teknis"]},
  {icon:"ti-tool",title:"Perbaikan & Servis",short:"On-site & workshop",tag:"PERBAIKAN",img:"images/services/servis.jpg",desc:"Tim teknisi berpengalaman kami siap menangani kerusakan mesin CNC Anda, baik di lokasi pabrik (on-site) maupun di workshop kami. Kami menggunakan suku cadang original dan compatible berkualitas tinggi.",feats:["On-site service","Workshop repair","Spare part original","Diagnosa akurat","Respon cepat","Garansi servis"]},
  {icon:"ti-zoom-scan",title:"Troubleshooting",short:"Diagnosa cepat & tepat",tag:"TROUBLESHOOTING",img:"images/services/troubleshoot.jpg",desc:"Mesin error, alarm, atau tidak bergerak normal? Kami melakukan diagnosa mendalam pada sistem CNC, servo, PLC, dan komponen elektrik untuk menemukan akar masalah dan memberikan solusi yang tepat dan efisien.",feats:["Analisa error code","Diagnosa servo","Cek sistem PLC","Diagnosa elektrik","Laporan teknis","Solusi permanen"]},
  {icon:"ti-package",title:"Jual Sparepart",short:"Original & compatible",tag:"SPAREPART",img:"images/services/sparepart.jpg",desc:"Kami menyediakan sparepart CNC, servo driver, inverter, HMI, dan komponen otomasi industri dari brand Syntec, Mitsubishi, Yaskawa, Delta, dan Panasonic. Tersedia original maupun compatible berkualitas tinggi.",feats:["Syntec parts","Mitsubishi parts","Yaskawa parts","Delta parts","Panasonic parts","Ready stock"]},
  {icon:"ti-settings-2",title:"SPM",short:"Special Purpose Machine",tag:"SPECIAL PURPOSE MACHINE",img:"images/services/spm.jpg",desc:"Kami merancang dan membangun Special Purpose Machine (SPM) sesuai kebutuhan spesifik proses produksi Anda. Dari konsep, desain, fabrikasi, hingga instalasi dan commissioning dikerjakan oleh tim engineer berpengalaman.",feats:["Desain custom","Fabrikasi lokal","Sistem otomasi","Integrasi PLC","Commissioning","After-sales support"]},
  {icon:"ti-cpu",title:"HMI · Servo · Inverter",short:"Instalasi, setting & repair",tag:"OTOMASI",img:"images/services/hmi.jpg",desc:"Kami menangani instalasi, konfigurasi, pemrograman, dan perbaikan HMI, servo motor, servo driver, dan inverter dari berbagai brand industri. Didukung teknisi bersertifikat dengan pengalaman di berbagai sektor manufaktur.",feats:["HMI programming","Servo tuning","Inverter setting","Parameter backup","Repair & replace","Multi-brand"]},
  {icon:"ti-school",title:"Training CNC",short:"Pelatihan operator & teknisi",tag:"PELATIHAN",img:"images/services/training.jpg",desc:"Program training CNC komprehensif untuk operator dan teknisi, mencakup dasar-dasar CNC, pemrograman G-code, pengoperasian controller Syntec, troubleshooting, dan perawatan mesin. Tersedia in-house maupun on-site di pabrik Anda.",feats:["Dasar-dasar CNC","Pemrograman G-code","Operasi Syntec","Troubleshooting","Perawatan mesin","Sertifikat training"]},
  {icon:"ti-eye",title:"Vision Detector",short:"Sistem penglihatan mesin & inspeksi otomatis",tag:"MACHINE VISION",img:"images/services/vision.jpg",desc:"Solusi machine vision untuk inspeksi produk otomatis, deteksi cacat, barcode & QR reading, pengukuran dimensi, dan quality control berbasis kamera industri. Integrasi dengan sistem PLC dan conveyor produksi Anda.",feats:["Inspeksi otomatis","Deteksi cacat produk","Barcode & QR reading","Pengukuran dimensi","Integrasi PLC/conveyor","Kamera industri"]}
];

// Build service cards — 9 cards (3x3 grid) with hover image preview
const grid=document.getElementById('svcGrid');
const frameEl=document.getElementById('svcPhotoFrame');
const frameBg=document.getElementById('framePreviewBg');
const frameTitle=document.getElementById('framePreviewTitle');
const frameSub=document.getElementById('framePreviewSub');

services.forEach((s,i)=>{
  const c=document.createElement('div');
  c.className='svc-card'+(s.primary?' primary':'');
  c.innerHTML=`
    <div class="svc-icon-wrap"><i class="ti ${s.icon}"></i></div>
    <div class="svc-card-title">${s.title}</div>
    <div class="svc-card-desc">${s.short}</div>
    <div class="svc-card-hint"><i class="ti ti-zoom-in" style="font-size:9px"></i> Lihat detail</div>`;
  c.onclick=()=>openModal(i);
  c.addEventListener('mouseenter',()=>{
    frameBg.style.backgroundImage=`url('${s.img}')`;
    frameTitle.textContent=s.title;
    frameSub.textContent=s.short;
    frameEl.classList.add('has-preview');
  });
  c.addEventListener('mouseleave',()=>{
    frameEl.classList.remove('has-preview');
    setTimeout(()=>{if(!frameEl.classList.contains('has-preview'))frameBg.style.backgroundImage="url('images/services/retrofit.jpg')";},450);
  });
  grid.appendChild(c);
});

// ===== SLIDESHOW =====
const TOTAL=9;
const INTERVAL=5000;
let cur=0, progressTimer, startTime, running=true;

// Build dots
const dotsEl=document.getElementById('vsDots');
for(let i=0;i<TOTAL;i++){
  const d=document.createElement('div');
  d.className='vd'+(i===0?' active':'');
  d.onclick=(()=>{const n=i;return()=>goSlide(n,true)})();
  dotsEl.appendChild(d);
}

function goSlide(n,manual=false){
  document.getElementById('vs-'+cur).classList.remove('active');
  dotsEl.children[cur].classList.remove('active');
  cur=(n+TOTAL)%TOTAL;
  document.getElementById('vs-'+cur).classList.add('active');
  dotsEl.children[cur].classList.add('active');
  document.getElementById('vsCount').textContent=String(cur+1).padStart(2,'0')+' / '+String(TOTAL).padStart(2,'0');
  resetProgress();
}

function vsNext(){goSlide(cur+1,true)}
function vsPrev(){goSlide(cur-1,true)}

// Smooth progress bar
let pct=0;
function resetProgress(){
  pct=0;
  document.getElementById('vsProgress').style.width='0%';
  clearInterval(progressTimer);
  startTime=Date.now();
  progressTimer=setInterval(()=>{
    pct=Math.min(100,(Date.now()-startTime)/INTERVAL*100);
    document.getElementById('vsProgress').style.width=pct+'%';
    if(pct>=100){clearInterval(progressTimer);goSlide(cur+1);}
  },50);
}
resetProgress();

// ===== MODAL =====
function openModal(i){
  const s=services[i];
  document.getElementById('modalImg').innerHTML=`<img src="${s.img}" alt="${s.title}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0"/>`;
  document.getElementById('modalTag').innerHTML=`<i class="ti ${s.icon}" style="font-size:10px"></i> ${s.tag}`;
  document.getElementById('modalTitle').textContent=s.title;
  document.getElementById('modalDesc').textContent=s.desc;
  document.getElementById('modalFeats').innerHTML=s.feats.map(f=>`<span class="modal-feat"><i class="ti ti-check" style="font-size:10px;margin-right:4px;color:var(--blue)"></i>${f}</span>`).join('');
  document.getElementById('modalBackdrop').classList.add('open');
}
function closeModal(e){if(e.target===document.getElementById('modalBackdrop'))closeModalNow()}
function closeModalNow(){document.getElementById('modalBackdrop').classList.remove('open')}

// ===== CONTACT PHOTO SLIDESHOW =====
(function(){
  const labels=['Upgrade Sumbu Ke-4 CNC','Pengecekan Akurasi','Perbaikan Kontrol','Retrofit Kontrol','Retrofit Mesin','Kalibrasi Mesin','Wiring Mesin Custom','Rewiring Retrofit','Retrofit 6TA-E','Setting Zero','Penggantian Driver Delta ASD B3','Penggantian LCD Syntec','Penggantian Inverter Delta C2000'];
  const frame=document.getElementById('crSlideFrame');
  if(!frame)return;
  const imgs=frame.querySelectorAll('.cr-slide-img');
  const dotsEl=document.getElementById('crSlideDots');
  const labelEl=document.getElementById('crSlideLabel');
  let ci=0;
  // set all to opacity 0 except first
  imgs.forEach((img,i)=>{img.style.opacity=i===0?'1':'0';});
  imgs.forEach((_,i)=>{
    const d=document.createElement('div');
    d.style.cssText='width:'+(i===0?'20px':'14px')+';height:2px;border-radius:2px;background:'+(i===0?'var(--blue)':'rgba(255,255,255,0.25)')+';cursor:pointer;transition:background .3s,width .3s';
    d.onclick=(()=>{const n=i;return()=>crGo(n)})();
    dotsEl.appendChild(d);
  });
  function crGo(n){
    imgs[ci].style.opacity='0';
    dotsEl.children[ci].style.background='rgba(255,255,255,0.25)';
    dotsEl.children[ci].style.width='14px';
    ci=(n+imgs.length)%imgs.length;
    imgs[ci].style.opacity='1';
    dotsEl.children[ci].style.background='var(--blue)';
    dotsEl.children[ci].style.width='20px';
    if(labelEl)labelEl.textContent=labels[ci]||'';
  }
  setInterval(()=>crGo(ci+1),3200);
})();

// ===== COUNTING ANIMATION (ulang setiap kali terlihat) =====
(function(){
  let animFrames=[];

  function countUp(el, target, suffix, duration){
    let startTime=null;
    el.textContent='0'+suffix;
    function frame(ts){
      if(!startTime) startTime=ts;
      let progress=(ts-startTime)/duration;
      let val=Math.min(Math.round(progress*target),target);
      el.textContent=val+suffix;
      if(val<target) animFrames.push(requestAnimationFrame(frame));
    }
    animFrames.push(requestAnimationFrame(frame));
  }

  function stopAll(){
    animFrames.forEach(id=>cancelAnimationFrame(id));
    animFrames=[];
  }

  function startCounting(){
    stopAll();
    countUp(document.getElementById('statProyek'),500,'+',1800);
    countUp(document.getElementById('statTahun'),10,'+',1200);
    countUp(document.getElementById('statBrand'),7,'',900);
  }

  const statsBox=document.getElementById('statsBox');
  if(!statsBox) return;

  const obs=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        startCounting();
      } else {
        stopAll();
        document.getElementById('statProyek').textContent='0+';
        document.getElementById('statTahun').textContent='0+';
        document.getElementById('statBrand').textContent='0';
      }
    });
  },{threshold:0.4});
  obs.observe(statsBox);
})();