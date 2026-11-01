import React,{createContext,useContext,useEffect,useState} from 'react';
import{createRoot}from'react-dom/client';
import{BrowserRouter,Routes,Route,Link,useNavigate,useParams,useLocation}from'react-router-dom';
import{HeartPulse,Search,CalendarDays,User,LogIn,LogOut,Menu,Stethoscope,Building2,Clock,CheckCircle,ShieldCheck,Users,ClipboardList,LayoutDashboard,Activity,Phone,MapPin,ArrowRight,Filter,Plus,Trash2,Edit,X,Moon,Sun}from'lucide-react';
import api from'./api';
import'./style.css';
const Auth=createContext(null);const useAuth=()=>useContext(Auth);
const money=n=>new Intl.NumberFormat('vi-VN').format(Number(n||0))+' đ';
const dateFmt=s=>s?new Date(s+'T00:00:00').toLocaleDateString('vi-VN'):'';
function Provider({children}){const[user,setUser]=useState(()=>JSON.parse(localStorage.getItem('medicare_user')||'null'));const login=data=>{localStorage.setItem('medicare_token',data.token);localStorage.setItem('medicare_user',JSON.stringify(data.user));setUser(data.user)};const logout=()=>{localStorage.removeItem('medicare_token');localStorage.removeItem('medicare_user');setUser(null)};return <Auth.Provider value={{user,login,logout}}>{children}</Auth.Provider>}
function App(){const{user}=useAuth();return <><Header/><Routes><Route path="/" element={<Home/>}/><Route path="/bac-si" element={<Doctors/>}/><Route path="/bac-si/:id" element={<DoctorDetail/>}/><Route path="/dat-lich/:id" element={<Booking/>}/><Route path="/dang-nhap" element={<Login/>}/><Route path="/dang-ky" element={<Register/>}/><Route path="/tai-khoan" element={<Patient/>}/><Route path="/bac-si-dashboard" element={<DoctorBoard/>}/><Route path="/quan-tri" element={<Admin/>}/><Route path="*" element={<Home/>}/></Routes><Footer/></>}
function Header(){const{user,logout}=useAuth();const[open,setOpen]=useState(false);const[darkMode,setDarkMode]=useState(()=>localStorage.getItem('medicare_theme')==='dark');const nav=useNavigate();useEffect(()=>{document.documentElement.setAttribute('data-theme',darkMode?'dark':'light');localStorage.setItem('medicare_theme',darkMode?'dark':'light')},[darkMode]);const dash=user?.role==='admin'?'/quan-tri':user?.role==='doctor'?'/bac-si-dashboard':'/tai-khoan';return <header className="header"><div className="nav wrap"><Link to="/" className="brand"><span className="brand-icon"><HeartPulse/></span><span>Medi<span>Care</span><small>CHĂM SÓC SỨC KHỎE</small></span></Link><button className="mobile-menu" onClick={()=>setOpen(!open)}><Menu/></button><nav className={open?'show':''}><Link to="/">Trang chủ</Link><Link to="/bac-si">Bác sĩ</Link><a href="/#chuyen-khoa">Chuyên khoa</a><a href="/#co-so">Cơ sở y tế</a></nav><div className="nav-actions"><button className="theme-toggle" type="button" onClick={()=>setDarkMode(prev=>!prev)} title={darkMode?'Chuyển sang chế độ sáng':'Chuyển sang chế độ tối'} aria-label="Chuyển chế độ sáng tối">{darkMode?<Sun size={18}/>:<Moon size={18}/>}</button>{user?<><button className="user-chip" onClick={()=>nav(dash)}><User size={17}/>{user.full_name.split(' ').slice(-2).join(' ')}</button><button className="btn btn-light btn-sm" onClick={logout}><LogOut size={16}/> Thoát</button></>:<><Link className="login-link" to="/dang-nhap">Đăng nhập</Link><Link className="btn btn-primary btn-sm" to="/dang-ky">Đăng ký</Link></>}</div></div></header>}
function Footer(){return <footer><div className="wrap footer-grid"><div><Link to="/" className="brand footer-brand"><span className="brand-icon"><HeartPulse/></span><span>Medi<span>Care</span></span></Link><p>Đồng hành cùng bạn trên hành trình chăm sóc sức khỏe. Đặt lịch khám nhanh chóng, tiện lợi và an tâm.</p></div><div><b>Liên kết</b><Link to="/bac-si">Tìm bác sĩ</Link><a href="/#chuyen-khoa">Chuyên khoa</a><Link to="/tai-khoan">Lịch khám của tôi</Link></div><div><b>Liên hệ</b><p><Phone size={15}/> 1900 1234</p><p><MapPin size={15}/> 12 Trần Hưng Đạo, Hà Nội</p><p>support@medicare.vn</p></div></div><div className="copyright">© 2026 MediCare. Nền tảng đặt lịch khám trực tuyến.</div></footer>}
function Home(){const[docs,setDocs]=useState([]),[specs,setSpecs]=useState([]),[fac,setFac]=useState([]),[q,setQ]=useState('');useEffect(()=>{api.get('/doctors').then(r=>setDocs(r.data)).catch(()=>{});api.get('/specialties').then(r=>setSpecs(r.data)).catch(()=>{});api.get('/facilities').then(r=>setFac(r.data)).catch(()=>{});},[]);return <><section className="hero"><div className="wrap hero-inner"><div className="hero-copy"><span className="eyebrow"><span className="dot"/> CHĂM SÓC SỨC KHỎE CHỦ ĐỘNG</span><h1>Chăm sóc sức khỏe<br/>bắt đầu từ <em>hôm nay</em></h1><p>Kết nối với đội ngũ bác sĩ chuyên môn và đặt lịch khám dễ dàng chỉ trong vài bước.</p><div className="hero-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&location.assign('/bac-si?q='+encodeURIComponent(q))} placeholder="Tìm bác sĩ, chuyên khoa..."/><button onClick={()=>location.assign('/bac-si?q='+encodeURIComponent(q))}>Tìm kiếm</button></div><div className="hero-trust"><span><CheckCircle/> Bác sĩ uy tín</span><span><CheckCircle/> Đặt lịch nhanh</span><span><CheckCircle/> Thông tin minh bạch</span></div></div><div className="hero-art"><div className="hero-circle"><div className="doctor-illustration"><Stethoscope size={88}/><span>+</span></div></div><div className="float-card float-one"><span className="float-icon"><CalendarDays/></span><div><b>Đặt lịch dễ dàng</b><small>Chủ động thời gian</small></div></div><div className="float-card float-two"><span className="avatar-stack">✓</span><div><b>Chăm sóc tận tâm</b><small>Đồng hành cùng bạn</small></div></div></div></div></section><section className="stats-strip"><div className="wrap stats-row"><div><b>Đặt lịch</b><span>mọi lúc, mọi nơi</span></div><div><b>Đội ngũ bác sĩ</b><span>chuyên môn cao</span></div><div><b>Thông tin rõ ràng</b><span>minh bạch chi phí</span></div></div></section><section className="section wrap" id="chuyen-khoa"><SectionHead tag="DỊCH VỤ Y TẾ" title="Chuyên khoa nổi bật" desc="Lựa chọn chuyên khoa phù hợp với nhu cầu chăm sóc sức khỏe của bạn."/><div className="specialty-grid">{(specs.length?specs:demoSpecs).map((s,i)=><Link to={'/bac-si?specialty='+s.id} className="specialty-card" key={s.id||i}><span className="spec-icon">{['♡','✚','✦','◉','⌁'][i%5]}</span><b>{s.name}</b><small>{s.doctor_count??'Đội ngũ'} bác sĩ</small><ArrowRight size={17}/></Link>)}</div></section><section className="section section-soft"><div className="wrap"><SectionHead tag="ĐỘI NGŨ CHUYÊN MÔN" title="Bác sĩ được quan tâm" desc="Tham khảo thông tin và lựa chọn bác sĩ phù hợp với bạn."/><div className="doctor-grid">{docs.slice(0,3).map(d=><DoctorCard d={d} key={d.id}/>)}</div><div className="center"><Link className="btn btn-outline" to="/bac-si">Xem tất cả bác sĩ <ArrowRight size={16}/></Link></div></div></section><section className="section wrap" id="co-so"><SectionHead tag="MẠNG LƯỚI Y TẾ" title="Cơ sở y tế" desc="Lựa chọn địa điểm khám thuận tiện cho bạn."/><div className="facility-grid">{fac.map(f=><div className="facility-card" key={f.id}><div className="facility-icon"><Building2/></div><div><b>{f.name}</b><p><MapPin size={14}/>{f.address}</p><small><Phone size={13}/> {f.phone}</small></div></div>)}</div></section><section className="section process"><div className="wrap"><SectionHead tag="ĐƠN GIẢN & TIỆN LỢI" title="Đặt lịch khám trong 3 bước" desc="Quy trình rõ ràng giúp bạn tiết kiệm thời gian."/><div className="steps"><div><span>01</span><Search/><b>Tìm bác sĩ</b><p>Chọn chuyên khoa và bác sĩ phù hợp.</p></div><div><span>02</span><CalendarDays/><b>Chọn lịch khám</b><p>Chọn ngày, giờ và nhập lý do khám.</p></div><div><span>03</span><CheckCircle/><b>Xác nhận</b><p>Hoàn tất đặt lịch và theo dõi trạng thái.</p></div></div></div></section></>}
const demoSpecs=[{name:'Tim mạch',id:1},{name:'Nhi khoa',id:2},{name:'Da liễu',id:3},{name:'Tai Mũi Họng',id:4}];
function SpecialtyDropdown({ specs, value, onChange }) {
  const [open, setOpen] = useState(false);

  const selected = specs.find(
    (s) => String(s.id) === String(value)
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.specialty-dropdown')) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const options = [
    { id: '', name: 'Tất cả chuyên khoa' },
    ...specs
  ];

  return (
    <div className={`specialty-dropdown ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="specialty-dropdown-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span>{selected?.name || 'Tất cả chuyên khoa'}</span>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="dropdown-arrow"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="specialty-dropdown-menu">
          {options.map((option) => {
            const active = String(option.id) === String(value);

            return (
              <button
                type="button"
                key={option.id || 'all'}
                className={`specialty-option ${active ? 'active' : ''}`}
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
              >
                <span>{option.name}</span>
                {active && <span className="option-check">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
function SectionHead({tag,title,desc}){return <div className="section-head"><span>{tag}</span><h2>{title}</h2><p>{desc}</p></div>}
function DoctorCard({d}){return <article className="doctor-card"><div className="doctor-photo"><div className="doctor-avatar"><User size={48}/></div><span className="verified"><ShieldCheck size={14}/> Đã xác thực</span></div><div className="doctor-info"><span className="tag">{d.specialty_name}</span><h3>{d.degree} {d.full_name}</h3><p>{d.experience} kinh nghiệm</p><div className="card-meta"><span><Building2/>{d.facility_name}</span><b>{money(d.fee)}</b></div><div className="card-actions"><Link className="btn btn-outline btn-sm" to={'/bac-si/'+d.id}>Chi tiết</Link><Link className="btn btn-primary btn-sm" to={'/dat-lich/'+d.id}>Đặt lịch</Link></div></div></article>}
function Doctors() {
  const [docs, setDocs] = useState([]);
  const [specs, setSpecs] = useState([]);

  const [q, setQ] = useState(
    new URLSearchParams(location.search).get('q') || ''
  );

  const [spec, setSpec] = useState(
    new URLSearchParams(location.search).get('specialty') || ''
  );

  const load = () => {
    api.get('/doctors', {
      params: { q, specialty: spec }
    })
      .then((r) => setDocs(r.data))
      .catch(() => {});
  };

  useEffect(() => {
    api.get('/specialties')
      .then((r) => setSpecs(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [q, spec]);

  return (
    <main className="page wrap">
      <div className="page-title">
        <span className="eyebrow">ĐỘI NGŨ CHUYÊN MÔN</span>
        <h1>Tìm kiếm bác sĩ</h1>
        <p>
          Chọn bác sĩ phù hợp và đặt lịch khám trực tuyến.
        </p>
      </div>

      <div className="filter-bar">
        <div className="search-field">
          <Search />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nhập tên bác sĩ..."
          />
        </div>

        <div className="select-field">
          <Filter />
          <SpecialtyDropdown
            specs={specs}
            value={spec}
            onChange={setSpec}
          />
        </div>
      </div>

      <div className="result-line">
        Tìm thấy <b>{docs.length}</b> bác sĩ
      </div>

      <div className="doctor-grid">
        {docs.map((d) => (
          <DoctorCard d={d} key={d.id} />
        ))}
      </div>

      {!docs.length && (
        <Empty text="Không tìm thấy bác sĩ phù hợp." />
      )}
    </main>
  );
}
function DoctorDetail(){const{id}=useParams();const[d,setD]=useState(null);useEffect(()=>{api.get('/doctors/'+id).then(r=>setD(r.data)).catch(()=>{});},[id]);if(!d)return <main className="page wrap"><Empty text="Đang tải thông tin bác sĩ hoặc không tìm thấy dữ liệu."/></main>;return <main className="page wrap"><div className="detail-card"><div className="detail-avatar"><User size={76}/></div><div className="detail-main"><span className="tag">{d.specialty_name}</span><h1>{d.degree} {d.full_name}</h1><p>{d.experience} kinh nghiệm</p><p>{d.bio}</p><div className="detail-meta"><span><Building2/> {d.facility_name}</span><span><MapPin/> {d.facility_address}</span><span><Clock/> {d.start_time?.slice(0,5)} – {d.end_time?.slice(0,5)} | {d.work_days}</span></div><div className="detail-bottom"><b>Phí khám: {money(d.fee)}</b><Link to={'/dat-lich/'+d.id} className="btn btn-primary">Đặt lịch khám <ArrowRight size={17}/></Link></div></div></div></main>}
function Login(){const{login}=useAuth();const nav=useNavigate();const[email,setEmail]=useState('patient@medicare.vn'),[password,setPassword]=useState('123456'),[err,setErr]=useState('');const submit=async e=>{e.preventDefault();try{const r=await api.post('/auth/login',{email,password});login(r.data);nav(r.data.user.role==='admin'?'/quan-tri':r.data.user.role==='doctor'?'/bac-si-dashboard':'/tai-khoan');}catch(e){setErr(e.response?.data?.message||'Không thể đăng nhập.');}};return <AuthLayout title="Chào mừng bạn trở lại" sub="Đăng nhập để tiếp tục sử dụng MediCare"><form onSubmit={submit} className="form"><Field label="Email" value={email} set={setEmail} type="email"/><Field label="Mật khẩu" value={password} set={setPassword} type="password"/>{err&&<Alert>{err}</Alert>}<button className="btn btn-primary btn-block">Đăng nhập</button><p className="form-foot">Chưa có tài khoản? <Link to="/dang-ky">Đăng ký ngay</Link></p><div className="demo-hint">Demo: admin@medicare.vn · doctor@medicare.vn · patient@medicare.vn<br/>Mật khẩu: 123456</div></form></AuthLayout>}
function Register(){const{login}=useAuth();const nav=useNavigate();const[form,setForm]=useState({full_name:'',email:'',phone:'',password:''}),[err,setErr]=useState('');const set=(k,v)=>setForm(p=>({...p,[k]:v}));const submit=async e=>{e.preventDefault();try{const r=await api.post('/auth/register',form);login(r.data);nav('/tai-khoan')}catch(e){setErr(e.response?.data?.message||'Đăng ký thất bại.')}};return <AuthLayout title="Tạo tài khoản MediCare" sub="Đăng ký để đặt lịch khám nhanh chóng"><form className="form" onSubmit={submit}><Field label="Họ và tên" value={form.full_name} set={v=>set('full_name',v)}/><Field label="Email" value={form.email} set={v=>set('email',v)} type="email"/><Field label="Số điện thoại" value={form.phone} set={v=>set('phone',v)}/><Field label="Mật khẩu (ít nhất 6 ký tự)" value={form.password} set={v=>set('password',v)} type="password"/>{err&&<Alert>{err}</Alert>}<button className="btn btn-primary btn-block">Đăng ký</button><p className="form-foot">Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link></p></form></AuthLayout>}
function AuthLayout({title,sub,children}){return <main className="auth-page"><div className="auth-card"><div className="auth-mark"><HeartPulse/></div><h2>{title}</h2><p>{sub}</p>{children}</div></main>}
function Field({label,value,set,type='text',placeholder=''}){return <label className="field"><span>{label}</span><input type={type} value={value} onChange={e=>set(e.target.value)} placeholder={placeholder} required/></label>}
function Booking(){const{id}=useParams();const{user}=useAuth();const nav=useNavigate();const[d,setD]=useState(null),[date,setDate]=useState(''),[time,setTime]=useState('09:00'),[reason,setReason]=useState(''),[method,setMethod]=useState('Thanh toán mô phỏng'),[err,setErr]=useState(''),[done,setDone]=useState(false);useEffect(()=>{api.get('/doctors/'+id).then(r=>setD(r.data)).catch(()=>{});},[id]);if(!user)return <AuthLayout title="Đăng nhập để đặt lịch" sub="Bạn cần đăng nhập bằng tài khoản bệnh nhân."><Link className="btn btn-primary btn-block" to="/dang-nhap">Đăng nhập</Link></AuthLayout>;if(user.role!=='patient')return <main className="page wrap"><Alert>Chỉ bệnh nhân mới có thể đặt lịch khám.</Alert></main>;const submit=async e=>{e.preventDefault();setErr('');try{await api.post('/appointments',{doctor_id:id,appointment_date:date,start_time:time,reason,payment_method:method});setDone(true)}catch(e){setErr(e.response?.data?.message||'Đặt lịch thất bại.')}};if(done)return <main className="page wrap"><div className="success-card"><CheckCircle size={56}/><h1>Đặt lịch thành công!</h1><p>Lịch khám của bạn đã được ghi nhận. Vui lòng theo dõi trạng thái xác nhận trong tài khoản.</p><button className="btn btn-primary" onClick={()=>nav('/tai-khoan')}>Xem lịch khám</button></div></main>;return <main className="page wrap"><div className="page-title"><span className="eyebrow">ĐẶT LỊCH TRỰC TUYẾN</span><h1>Thông tin lịch khám</h1><p>Điền thông tin để hoàn tất yêu cầu đặt lịch.</p></div><div className="booking-layout"><form className="panel form" onSubmit={submit}><h3>Thông tin khám bệnh</h3><div className="field"><span>Bác sĩ</span><div className="readonly">{d?`${d.degree} ${d.full_name} – ${d.specialty_name}`:'Đang tải...'}</div></div><Field label="Ngày khám" value={date} set={setDate} type="date"/><label className="field"><span>Khung giờ</span><select value={time} onChange={e=>setTime(e.target.value)}>{['08:00','08:30','09:00','09:30','10:00','10:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00'].map(t=><option key={t}>{t}</option>)}</select></label><label className="field"><span>Lý do khám</span><textarea rows="4" value={reason} onChange={e=>setReason(e.target.value)} required placeholder="Mô tả triệu chứng hoặc nhu cầu khám..."/></label><label className="field"><span>Phương thức thanh toán</span><select value={method} onChange={e=>setMethod(e.target.value)}><option>Thanh toán mô phỏng</option><option>Thanh toán tại cơ sở</option></select></label>{err&&<Alert>{err}</Alert>}<button className="btn btn-primary btn-block">Xác nhận đặt lịch</button></form><aside className="panel booking-summary"><h3>Thông tin chi phí</h3><div className="summary-doctor"><div className="mini-avatar"><User/></div><div><b>{d?.full_name||'Bác sĩ'}</b><small>{d?.specialty_name}</small></div></div><div className="summary-line"><span>Phí khám</span><b>{money(d?.fee)}</b></div><div className="summary-line"><span>Thanh toán</span><b>Mô phỏng</b></div><div className="summary-total"><span>Tổng cộng</span><b>{money(d?.fee)}</b></div><small className="muted">Đây là chức năng thanh toán mô phỏng, không phát sinh giao dịch thật.</small></aside></div></main>}
function Patient(){const{user}=useAuth();const[rows,setRows]=useState([]),[err,setErr]=useState(''),[profile,setProfile]=useState({full_name:user?.full_name||'',phone:user?.phone||''}),[editing,setEditing]=useState(false);const load=()=>api.get('/appointments').then(r=>setRows(r.data)).catch(e=>setErr(e.response?.data?.message||'Không tải được dữ liệu.'));useEffect(()=>{load()},[]);if(!user)return <NeedLogin/>;if(user.role!=='patient')return <main className="page wrap"><Alert>Khu vực này dành cho bệnh nhân.</Alert></main>;const cancel=async id=>{if(confirm('Bạn chắc chắn muốn hủy lịch khám này?')){try{await api.patch('/appointments/'+id+'/status',{status:'Đã hủy'});load()}catch(e){setErr(e.response?.data?.message)}}};return <main className="page wrap"><div className="page-title"><span className="eyebrow">TÀI KHOẢN CỦA TÔI</span><h1>Xin chào, {user.full_name}</h1><p>Quản lý lịch khám và theo dõi lịch sử khám bệnh.</p></div><div className="profile-strip"><div className="profile-icon"><User/></div><div><b>{user.full_name}</b><p>{user.email}</p></div><span className="tag">Bệnh nhân</span><button className="btn btn-outline btn-sm" onClick={()=>setEditing(!editing)}>Cập nhật thông tin</button></div>{editing&&<form className="panel form profile-edit" onSubmit={async e=>{e.preventDefault();try{const r=await api.patch('/auth/profile',profile);localStorage.setItem('medicare_user',JSON.stringify(r.data));location.reload()}catch(e){setErr(e.response?.data?.message||'Không thể cập nhật')}}}><Field label="Họ và tên" value={profile.full_name} set={v=>setProfile(p=>({...p,full_name:v}))}/><Field label="Số điện thoại" value={profile.phone} set={v=>setProfile(p=>({...p,phone:v}))}/><button className="btn btn-primary btn-sm">Lưu thông tin</button></form>}<h2 className="subheading">Lịch khám của tôi</h2>{err&&<Alert>{err}</Alert>}<AppointmentTable rows={rows} role="patient" action={(id)=><button type="button" className="btn btn-sm btn-outline" onClick={()=>cancel(id)}>Hủy lịch</button>}/></main>}
function NeedLogin(){return <main className="page wrap"><div className="empty"><User/><h3>Bạn chưa đăng nhập</h3><Link className="btn btn-primary" to="/dang-nhap">Đăng nhập</Link></div></main>}
function AppointmentTable({ rows, role, action }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Mã</th>
            <th>{role === 'doctor' ? 'Bệnh nhân' : 'Bác sĩ'}</th>
            <th>Ngày khám</th>
            <th>Giờ</th>
            <th>Lý do</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id}>
              <td>#{a.id}</td>
              <td>
                {role === 'doctor' ? a.patient_name : a.doctor_name}
                <small className="table-sub">
                  {role === 'doctor' ? a.patient_phone : a.specialty_name}
                </small>
              </td>
              <td>{dateFmt(a.appointment_date)}</td>
              <td>{a.start_time?.slice(0, 5)}</td>
              <td className="reason-cell">{a.reason}</td>
              <td><Status value={a.status} /></td>
              <td>
                {action &&
                ((role === 'patient' &&
                  ['Chờ xác nhận', 'Đã xác nhận'].includes(a.status)) ||
                  role === 'doctor') ? (
                  <div className="table-actions">{action(a.id, a)}</div>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <Empty text="Chưa có lịch khám nào." />}
    </div>
  );
}
function Status({value}){const cls=value==='Đã hoàn thành'?'green':value==='Đã hủy'||value==='Bị từ chối'?'red':value==='Đã xác nhận'?'blue':'yellow';return <span className={'status '+cls}>{value}</span>}
function DoctorBoard(){const{user}=useAuth();const[rows,setRows]=useState([]),[err,setErr]=useState('');const load=()=>api.get('/appointments').then(r=>setRows(r.data)).catch(e=>setErr(e.response?.data?.message||'Lỗi tải lịch'));useEffect(()=>{load()},[]);if(!user)return <NeedLogin/>;if(user.role!=='doctor')return <main className="page wrap"><Alert>Khu vực dành cho bác sĩ.</Alert></main>;const update=async(id,status)=>{try{await api.patch('/appointments/'+id+'/status',{status});load()}catch(e){setErr(e.response?.data?.message)}};const pending=rows.filter(a=>a.status==='Chờ xác nhận').length;return <Dashboard title="Bảng điều khiển bác sĩ" user={user}><div className="metric-grid"><Metric icon={<CalendarDays/>} label="Tổng lịch khám" value={rows.length}/><Metric icon={<Clock/>} label="Chờ xác nhận" value={pending}/><Metric icon={<CheckCircle/>} label="Đã hoàn thành" value={rows.filter(a=>a.status==='Đã hoàn thành').length}/></div><div className="panel"><div className="panel-heading"><h3>Lịch khám được phân công</h3><span className="tag">Hôm nay & sắp tới</span></div>{err&&<Alert>{err}</Alert>}<AppointmentTable rows={rows} role="doctor" action={(id,a)=><>{a.status==='Chờ xác nhận'&&<><button className="icon-btn success" title="Xác nhận" onClick={()=>update(id,'Đã xác nhận')}><CheckCircle size={16}/></button><button className="icon-btn danger" title="Từ chối" onClick={()=>update(id,'Bị từ chối')}><X size={16}/></button></>}{a.status==='Đã xác nhận'&&<button className="btn btn-sm btn-primary" onClick={()=>update(id,'Đã hoàn thành')}>Hoàn thành</button>}</>}/></div></Dashboard>}
function Dashboard({title,user,children}){return <main className="dashboard wrap"><aside className="dash-side"><div className="dash-user"><div className="profile-icon"><User/></div><b>{user.full_name}</b><small>{user.role==='admin'?'Quản trị viên':'Bác sĩ'}</small></div><Link to={user.role==='admin'?'/quan-tri':'/bac-si-dashboard'}><LayoutDashboard/> Tổng quan</Link><Link to="/"><ArrowRight/> Về trang chủ</Link></aside><section className="dash-content"><div className="dash-title"><div><span className="eyebrow">MEDICARE WORKSPACE</span><h1>{title}</h1></div></div>{children}</section></main>}
function Metric({icon,label,value}){return <div className="metric"><span>{icon}</span><div><small>{label}</small><b>{value}</b></div></div>}
function Admin(){const{user}=useAuth();const[stats,setStats]=useState(null),[tab,setTab]=useState('users'),[rows,setRows]=useState([]),[err,setErr]=useState(''),[show,setShow]=useState(false),[edit,setEdit]=useState(null);const loadStats=()=>api.get('/admin/stats').then(r=>setStats(r.data)).catch(e=>setErr(e.response?.data?.message||'Lỗi tải thống kê'));const load=()=>api.get('/admin/'+tab).then(r=>setRows(r.data)).catch(e=>setErr(e.response?.data?.message||'Lỗi tải dữ liệu'));useEffect(()=>{loadStats()},[]);useEffect(()=>{load()},[tab]);if(!user)return <NeedLogin/>;if(user.role!=='admin')return <main className="page wrap"><Alert>Bạn không có quyền truy cập trang quản trị.</Alert></main>;const tabs=[['users','Người dùng'],['doctors','Bác sĩ'],['specialties','Chuyên khoa'],['facilities','Cơ sở y tế'],['appointments','Lịch khám']];const del=async id=>{if(confirm('Xóa bản ghi này?')){try{await api.delete(`/admin/${tab}/${id}`);load()}catch(e){setErr(e.response?.data?.message)}}};const save=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target).entries());try{if(edit)await api.put(`/admin/${tab}/${edit.id}`,data);else await api.post(`/admin/${tab}`,data);setShow(false);setEdit(null);load();loadStats()}catch(e){setErr(e.response?.data?.message||'Không thể lưu dữ liệu.')}};const fields={users:['full_name','email','phone','role'],doctors:['user_id','specialty_id','facility_id','degree','experience','bio','fee','work_days','start_time','end_time'],specialties:['name','description'],facilities:['name','address','phone'],appointments:[]};const labels={full_name:'Họ tên',email:'Email',phone:'Điện thoại',role:'Vai trò',name:'Tên',description:'Mô tả',address:'Địa chỉ',user_id:'ID tài khoản',specialty_id:'ID chuyên khoa',facility_id:'ID cơ sở',degree:'Trình độ',experience:'Kinh nghiệm',bio:'Giới thiệu',fee:'Phí khám',work_days:'Ngày làm việc (T2,T3...)',start_time:'Giờ bắt đầu',end_time:'Giờ kết thúc'};return <Dashboard title="Quản trị hệ thống" user={user}><div className="metric-grid"><Metric icon={<Users/>} label="Bệnh nhân" value={stats?.patients??'—'}/><Metric icon={<Stethoscope/>} label="Bác sĩ" value={stats?.doctors??'—'}/><Metric icon={<ClipboardList/>} label="Lịch khám" value={stats?.appointments??'—'}/><Metric icon={<Activity/>} label="Doanh thu" value={money(stats?.revenue)}/></div><div className="panel admin-panel"><div className="tabs">{tabs.map(t=><button className={tab===t[0]?'active':''} onClick={()=>{setTab(t[0]);setErr('')}} key={t[0]}>{t[1]}</button>)}</div><div className="panel-heading"><h3>Quản lý {tabs.find(t=>t[0]===tab)?.[1].toLowerCase()}</h3>{tab!=='appointments'&&<button className="btn btn-primary btn-sm" onClick={()=>{setEdit(null);setShow(true)}}><Plus size={16}/> Thêm mới</button>}</div>{err&&<Alert>{err}</Alert>}<div className="table-wrap"><table><thead><tr>{(tab==='users'?['ID','Họ tên','Email','Điện thoại','Vai trò']:tab==='doctors'?['ID','Tài khoản','Chuyên khoa','Cơ sở','Phí khám']:tab==='specialties'?['ID','Tên','Mô tả']:tab==='facilities'?['ID','Tên','Địa chỉ','Điện thoại']:['ID','Bệnh nhân','Bác sĩ','Ngày khám','Trạng thái']).map(x=><th key={x}>{x}</th>)}<th>Thao tác</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}>{tab==='users'?<><td>{r.id}</td><td>{r.full_name}</td><td>{r.email}</td><td>{r.phone}</td><td>{r.role}</td></>:tab==='doctors'?<><td>{r.id}</td><td>{r.user_id}</td><td>{r.specialty_id}</td><td>{r.facility_id}</td><td>{money(r.fee)}</td></>:tab==='specialties'?<><td>{r.id}</td><td>{r.name}</td><td>{r.description}</td></>:tab==='facilities'?<><td>{r.id}</td><td>{r.name}</td><td>{r.address}</td><td>{r.phone}</td></>:<><td>{r.id}</td><td>{r.patient_id}</td><td>{r.doctor_id}</td><td>{dateFmt(r.appointment_date)}</td><td><Status value={r.status}/></td></>}<td><div className="table-actions">{tab!=='appointments'&&<><button className="icon-btn" onClick={()=>{setEdit(r);setShow(true)}}><Edit size={15}/></button><button className="icon-btn danger" onClick={()=>del(r.id)}><Trash2 size={15}/></button></>}</div></td></tr>)}</tbody></table>{!rows.length&&<Empty text="Chưa có dữ liệu."/>}</div></div>{show&&<div className="modal-backdrop"><form className="modal form" onSubmit={save}><div className="panel-heading"><h3>{edit?'Cập nhật':'Thêm'} dữ liệu</h3><button type="button" className="icon-btn" onClick={()=>setShow(false)}><X/></button></div>{fields[tab].map(k=><label className="field" key={'f'+k}><span>{labels[k]||k}</span><input name={k} defaultValue={edit?.[k]??''} required={!['phone','description','bio','experience'].includes(k)}/></label>)}<button className="btn btn-primary btn-block">Lưu thay đổi</button></form></div>}</Dashboard>}
function Empty({text}){return <div className="empty"><ClipboardList/><p>{text}</p></div>}
function Alert({children}){return <div className="alert">{children}</div>}
createRoot(document.getElementById('root')).render(<BrowserRouter><Provider><App/></Provider></BrowserRouter>);
