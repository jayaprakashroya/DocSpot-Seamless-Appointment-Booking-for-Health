exports.requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.type !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

exports.requireDoctor = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (!req.user.isDoctor && req.user.type !== 'doctor') return res.status(403).json({ message: 'Doctor access required' });
  next();
};

exports.requireAdminOrDoctor = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const isAdmin = req.user.type === 'admin';
  const isDoctor = req.user.isDoctor || req.user.type === 'doctor';
  if (!isAdmin && !isDoctor) return res.status(403).json({ message: 'Admin or Doctor access required' });
  next();
};
