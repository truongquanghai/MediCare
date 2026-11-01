import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { pool } from './db.js';
import { auth, allow, signToken } from './auth.js';
dotenv.config();
const app=express();
app.use(cors({origin:process.env.CLIENT_URL||'http://localhost:5173'}));
app.use(express.json());
const asyncRoute=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const validate=(req,res,next)=>{const e=validationResult(req); if(!e.isEmpty()) return res.status(400).json({message:e.array()[0].msg}); next();};

app.get('/api/health',(req,res)=>res.json({status:'ok',name:'MediCare API'}));

app.post('/api/auth/register',
 [body('full_name').trim().notEmpty().withMessage('Vui lòng nhập họ tên.'),
  body('email').isEmail().withMessage('Email không hợp lệ.'),
  body('password').isLength({min:6}).withMessage('Mật khẩu tối thiểu 6 ký tự.')],validate,
 asyncRoute(async(req,res)=>{
  const {full_name,email,password,phone=''}=req.body;
  const [exists]=await pool.query('SELECT id FROM users WHERE email=?',[email]);
  if(exists.length) return res.status(409).json({message:'Email đã được sử dụng.'});
  const hash=await bcrypt.hash(password,10);
  const [r]=await pool.query('INSERT INTO users(full_name,email,password_hash,phone,role) VALUES(?,?,?,?,?)',[full_name,email,hash,phone,'patient']);
  const user={id:r.insertId,full_name,email,role:'patient'};
  res.status(201).json({token:signToken(user),user});
 }));
app.post('/api/auth/login',asyncRoute(async(req,res)=>{
 const {email,password}=req.body;
 if(!email||!password) return res.status(400).json({message:'Vui lòng nhập email và mật khẩu.'});
 const [rows]=await pool.query('SELECT * FROM users WHERE email=?',[email]);
 if(!rows.length || !(await bcrypt.compare(password,rows[0].password_hash))) return res.status(401).json({message:'Email hoặc mật khẩu không chính xác.'});
 const u=rows[0]; const user={id:u.id,full_name:u.full_name,email:u.email,role:u.role};
 res.json({token:signToken(user),user});
}));
app.get('/api/auth/me',auth,asyncRoute(async(req,res)=>{
 const [r]=await pool.query('SELECT id,full_name,email,phone,role FROM users WHERE id=?',[req.user.id]);
 if(!r.length) return res.status(404).json({message:'Không tìm thấy tài khoản.'}); res.json(r[0]);
}));
app.patch('/api/auth/profile',auth,asyncRoute(async(req,res)=>{
 const {full_name,phone}=req.body;
 if(!full_name?.trim())return res.status(400).json({message:'Họ tên không được để trống.'});
 await pool.query('UPDATE users SET full_name=?,phone=? WHERE id=?',[full_name.trim(),phone||'',req.user.id]);
 const [rows]=await pool.query('SELECT id,full_name,email,phone,role FROM users WHERE id=?',[req.user.id]);
 res.json(rows[0]);
}));

app.get('/api/specialties',asyncRoute(async(req,res)=>{const [r]=await pool.query('SELECT s.*,COUNT(d.id) doctor_count FROM specialties s LEFT JOIN doctors d ON d.specialty_id=s.id GROUP BY s.id ORDER BY s.name');res.json(r);}));
app.get('/api/facilities',asyncRoute(async(req,res)=>{const [r]=await pool.query('SELECT * FROM facilities ORDER BY name');res.json(r);}));
app.get('/api/doctors',asyncRoute(async(req,res)=>{
 const {q='',specialty=''}=req.query;
 let sql=`SELECT d.id,d.user_id,d.degree,d.experience,d.bio,d.fee,d.work_days,d.start_time,d.end_time,
 u.full_name,u.phone,s.id specialty_id,s.name specialty_name,f.id facility_id,f.name facility_name,f.address facility_address
 FROM doctors d JOIN users u ON d.user_id=u.id JOIN specialties s ON d.specialty_id=s.id JOIN facilities f ON d.facility_id=f.id WHERE 1=1`;
 const p=[]; if(q){sql+=' AND u.full_name LIKE ?';p.push(`%${q}%`);} if(specialty){sql+=' AND s.id=?';p.push(specialty);}
 sql+=' ORDER BY u.full_name'; const [r]=await pool.query(sql,p);res.json(r);
}));
app.get('/api/doctors/:id',asyncRoute(async(req,res)=>{
 const [r]=await pool.query(`SELECT d.*,u.full_name,u.phone,s.name specialty_name,f.name facility_name,f.address facility_address FROM doctors d JOIN users u ON d.user_id=u.id JOIN specialties s ON d.specialty_id=s.id JOIN facilities f ON d.facility_id=f.id WHERE d.id=?`,[req.params.id]);
 if(!r.length)return res.status(404).json({message:'Không tìm thấy bác sĩ.'});res.json(r[0]);
}));

app.get('/api/appointments',auth,asyncRoute(async(req,res)=>{
 let sql=`SELECT a.*,p.full_name patient_name,p.phone patient_phone,du.full_name doctor_name,s.name specialty_name,f.name facility_name
 FROM appointments a JOIN users p ON p.id=a.patient_id JOIN doctors d ON d.id=a.doctor_id JOIN users du ON du.id=d.user_id JOIN specialties s ON s.id=d.specialty_id JOIN facilities f ON f.id=d.facility_id`;
 const args=[];
 if(req.user.role==='patient'){sql+=' WHERE a.patient_id=?';args.push(req.user.id);}
 else if(req.user.role==='doctor'){sql+=' WHERE d.user_id=?';args.push(req.user.id);}
 sql+=' ORDER BY a.appointment_date DESC,a.start_time DESC';
 const [r]=await pool.query(sql,args);res.json(r);
}));
app.post('/api/appointments',auth,allow('patient'),asyncRoute(async(req,res)=>{
 const {doctor_id,appointment_date,start_time,reason,payment_method='Thanh toán tại cơ sở'}=req.body;
 if(!doctor_id||!appointment_date||!start_time||!reason?.trim())return res.status(400).json({message:'Vui lòng nhập đầy đủ thông tin đặt khám.'});
 const [ds]=await pool.query('SELECT * FROM doctors WHERE id=?',[doctor_id]);
 if(!ds.length)return res.status(404).json({message:'Bác sĩ không tồn tại.'});
 const d=ds[0];
 const day=new Date(`${appointment_date}T00:00:00`).getDay();
 const dayNames=['CN','T2','T3','T4','T5','T6','T7'];
 if(!String(d.work_days).split(',').includes(dayNames[day]))return res.status(400).json({message:'Bác sĩ không làm việc vào ngày đã chọn.'});
 if(start_time<d.start_time || start_time>=d.end_time)return res.status(400).json({message:'Khung giờ nằm ngoài giờ làm việc của bác sĩ.'});
 const [same]=await pool.query("SELECT id FROM appointments WHERE doctor_id=? AND appointment_date=? AND start_time=? AND status NOT IN ('Đã hủy','Bị từ chối')",[doctor_id,appointment_date,start_time]);
 if(same.length)return res.status(409).json({message:'Khung giờ này đã có người đặt. Vui lòng chọn giờ khác.'});
 const [r]=await pool.query(`INSERT INTO appointments(patient_id,doctor_id,appointment_date,start_time,reason,fee,payment_method,payment_status,status)
 VALUES(?,?,?,?,?,?,?,'Đã thanh toán','Chờ xác nhận')`,[req.user.id,doctor_id,appointment_date,start_time,reason,d.fee,payment_method]);
 res.status(201).json({id:r.insertId,message:'Đặt lịch thành công. Vui lòng chờ bác sĩ xác nhận.'});
}));
app.patch('/api/appointments/:id/status',auth,asyncRoute(async(req,res)=>{
 const {status}=req.body; const allowed=['Đã xác nhận','Đã hoàn thành','Đã hủy','Bị từ chối'];
 if(!allowed.includes(status))return res.status(400).json({message:'Trạng thái không hợp lệ.'});
 const [r]=await pool.query('SELECT a.*,d.user_id doctor_user_id FROM appointments a JOIN doctors d ON d.id=a.doctor_id WHERE a.id=?',[req.params.id]);
 if(!r.length)return res.status(404).json({message:'Không tìm thấy lịch khám.'});
 const a=r[0];
 if(req.user.role==='patient' && (a.patient_id!==req.user.id || status!=='Đã hủy'))return res.status(403).json({message:'Không có quyền cập nhật lịch này.'});
 if(req.user.role==='doctor' && a.doctor_user_id!==req.user.id)return res.status(403).json({message:'Lịch khám không thuộc bác sĩ này.'});
 if(req.user.role==='doctor' && !['Đã xác nhận','Bị từ chối','Đã hoàn thành'].includes(status))return res.status(400).json({message:'Thao tác không hợp lệ.'});
 await pool.query('UPDATE appointments SET status=? WHERE id=?',[status,req.params.id]);res.json({message:'Cập nhật trạng thái thành công.'});
}));

// Admin management: compact CRUD for core tables.
const tables={users:{fields:['full_name','email','phone','role'],roles:['admin','doctor','patient']},specialties:{fields:['name','description']},facilities:{fields:['name','address','phone']},doctors:{fields:['user_id','specialty_id','facility_id','degree','experience','bio','fee','work_days','start_time','end_time']}};
app.get('/api/admin/stats',auth,allow('admin'),asyncRoute(async(req,res)=>{
 const [[p]]=await pool.query("SELECT COUNT(*) total FROM users WHERE role='patient'");
 const [[d]]=await pool.query("SELECT COUNT(*) total FROM doctors");
 const [[a]]=await pool.query("SELECT COUNT(*) total FROM appointments");
 const [[rev]]=await pool.query("SELECT COALESCE(SUM(fee),0) total FROM appointments WHERE status IN ('Đã xác nhận','Đã hoàn thành')");
 const [monthly]=await pool.query("SELECT DATE_FORMAT(appointment_date,'%m/%Y') AS label, COUNT(*) AS total FROM appointments GROUP BY YEAR(appointment_date), MONTH(appointment_date), DATE_FORMAT(appointment_date,'%m/%Y') ORDER BY YEAR(appointment_date), MONTH(appointment_date) LIMIT 6");
 res.json({patients:p.total,doctors:d.total,appointments:a.total,revenue:Number(rev.total),monthly});
}));
// Lấy danh sách lịch khám cho trang quản trị
app.get('/api/admin/appointments', auth, allow('admin'), asyncRoute(async (req, res) => {
    const [rows] = await pool.query(`
        SELECT
            a.id,
            a.patient_id,
            a.doctor_id,
            a.appointment_date,
            a.start_time,
            a.reason,
            a.fee,
            a.status,
            p.full_name AS patient_name,
            duser.full_name AS doctor_name
        FROM appointments a
        JOIN users p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users duser ON d.user_id = duser.id
        ORDER BY a.appointment_date DESC, a.start_time DESC
    `);

    res.json(rows);
}));
app.get('/api/admin/:table',auth,allow('admin'),asyncRoute(async(req,res)=>{
 const t=tables[req.params.table];if(!t)return res.status(404).json({message:'Bảng không hợp lệ.'});
 const [r]=await pool.query(`SELECT * FROM \`${req.params.table}\` ORDER BY id DESC`);res.json(r);
}));
app.post('/api/admin/:table',auth,allow('admin'),asyncRoute(async(req,res)=>{
 const t=tables[req.params.table];if(!t)return res.status(404).json({message:'Bảng không hợp lệ.'});
 const keys=t.fields.filter(k=>req.body[k]!==undefined);if(!keys.length)return res.status(400).json({message:'Thiếu dữ liệu.'});
 const vals=keys.map(k=>req.body[k]);
 if(req.params.table==='users'){keys.push('password_hash');vals.push(await bcrypt.hash('123456',10));}
 const [r]=await pool.query(`INSERT INTO \`${req.params.table}\` (${keys.map(k=>`\`${k}\``).join(',')}) VALUES (${keys.map(()=>'?').join(',')})`,vals);res.status(201).json({id:r.insertId,message:req.params.table==='users'?'Thêm tài khoản thành công. Mật khẩu mặc định: 123456':'Thêm dữ liệu thành công.'});
}));
app.put('/api/admin/:table/:id',auth,allow('admin'),asyncRoute(async(req,res)=>{
 const t=tables[req.params.table];if(!t)return res.status(404).json({message:'Bảng không hợp lệ.'});
 const keys=t.fields.filter(k=>req.body[k]!==undefined);if(!keys.length)return res.status(400).json({message:'Thiếu dữ liệu.'});
 await pool.query(`UPDATE \`${req.params.table}\` SET ${keys.map(k=>`\`${k}\`=?`).join(',')} WHERE id=?`,[...keys.map(k=>req.body[k]),req.params.id]);res.json({message:'Cập nhật thành công.'});
}));
app.delete('/api/admin/:table/:id',auth,allow('admin'),asyncRoute(async(req,res)=>{
 if(!tables[req.params.table])return res.status(404).json({message:'Bảng không hợp lệ.'});
 try{await pool.query(`DELETE FROM \`${req.params.table}\` WHERE id=?`,[req.params.id]);res.json({message:'Xóa dữ liệu thành công.'});}
 catch(e){res.status(409).json({message:'Không thể xóa dữ liệu đang được sử dụng.'});}
}));
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({message:'Lỗi máy chủ. Vui lòng thử lại.'});});
const port=process.env.PORT||4000;
app.listen(port,()=>console.log(`MediCare API running at http://localhost:${port}`));
