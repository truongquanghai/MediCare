import jwt from 'jsonwebtoken';
export function signToken(user) {
  return jwt.sign({ id:user.id, role:user.role, name:user.full_name }, process.env.JWT_SECRET, { expiresIn:'12h' });
}
export function auth(req,res,next) {
  const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  if(!token) return res.status(401).json({message:'Vui lòng đăng nhập.'});
  try { req.user=jwt.verify(token,process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({message:'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'}); }
}
export const allow = (...roles) => (req,res,next) => {
  if(!req.user || !roles.includes(req.user.role)) return res.status(403).json({message:'Bạn không có quyền thực hiện chức năng này.'});
  next();
};
