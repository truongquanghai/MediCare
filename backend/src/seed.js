import dotenv from 'dotenv';import bcrypt from 'bcryptjs';import {pool} from './db.js';dotenv.config();
const run=async()=>{
 const c=await pool.getConnection();
 try{
 await c.beginTransaction();
 await c.query('SET FOREIGN_KEY_CHECKS=0');
 for(const t of ['appointments','doctors','specialties','facilities','users'])await c.query(`TRUNCATE TABLE ${t}`);
 await c.query('SET FOREIGN_KEY_CHECKS=1');
 const hash=await bcrypt.hash('123456',10);
 const users=[
 ['Quản trị viên MediCare','admin@medicare.vn','admin'],
 ['BS. Nguyễn Minh Anh','doctor@medicare.vn','doctor'],
 ['Trần Thị Lan','patient@medicare.vn','patient'],
 ['BS. Trần Quốc Bảo','bao@medicare.vn','doctor'],
 ['Lê Văn Nam','nam@medicare.vn','patient']
 ];
 const ids=[];
 for(const [name,email,role] of users){const [r]=await c.query('INSERT INTO users(full_name,email,password_hash,phone,role) VALUES(?,?,?,?,?)',[name,email,hash,'0901234567',role]);ids.push(r.insertId);}
 const [f1]=await c.query('INSERT INTO facilities(name,address,phone) VALUES(?,?,?)',['Bệnh viện MediCare Hà Nội','12 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội','024 3999 8888']);
 const [f2]=await c.query('INSERT INTO facilities(name,address,phone) VALUES(?,?,?)',['Phòng khám MediCare Cầu Giấy','25 Xuân Thủy, Cầu Giấy, Hà Nội','024 3888 7777']);
 const specs=['Tim mạch','Nhi khoa','Da liễu','Tai Mũi Họng','Cơ xương khớp'];
 const sids=[];for(const n of specs){const [r]=await c.query('INSERT INTO specialties(name,description) VALUES(?,?)',[n,`Khám và tư vấn chuyên sâu ${n.toLowerCase()}.`]);sids.push(r.insertId);}
 const [d1]=await c.query(`INSERT INTO doctors(user_id,specialty_id,facility_id,degree,experience,bio,fee,work_days,start_time,end_time) VALUES(?,?,?,?,?,?,?,?,?,?)`,[ids[1],sids[0],f1.insertId,'Thạc sĩ, Bác sĩ','12 năm','Chuyên khám và điều trị các bệnh lý tim mạch, tư vấn chăm sóc sức khỏe chủ động.',300000,'T2,T3,T4,T5,T6','08:00','17:00']);
 const [d2]=await c.query(`INSERT INTO doctors(user_id,specialty_id,facility_id,degree,experience,bio,fee,work_days,start_time,end_time) VALUES(?,?,?,?,?,?,?,?,?,?)`,[ids[3],sids[1],f2.insertId,'Bác sĩ chuyên khoa I','9 năm','Tận tâm trong khám và điều trị các bệnh thường gặp ở trẻ em.',250000,'T2,T3,T4,T5,T6,T7','08:00','16:30']);
 const future=new Date(Date.now()+3*86400000);const date=future.toISOString().slice(0,10);
 await c.query(`INSERT INTO appointments(patient_id,doctor_id,appointment_date,start_time,reason,fee,payment_method,payment_status,status) VALUES(?,?,?,?,?,?,?,'Đã thanh toán','Chờ xác nhận')`,[ids[2],d1.insertId,date,'09:00','Khám sức khỏe định kỳ',300000,'Thanh toán mô phỏng']);
 await c.commit();console.log('Seed thành công. Tài khoản demo dùng mật khẩu 123456.');
 }catch(e){await c.rollback();throw e;}finally{c.release();await pool.end();}
};run().catch(e=>{console.error(e);process.exit(1);});
