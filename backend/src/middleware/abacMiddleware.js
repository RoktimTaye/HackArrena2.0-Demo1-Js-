// backend/src/middleware/abacMiddleware.js

/**
 * Attach ABAC context for department-based access.
 *
 * If user has role DOCTOR and a department,
 * we store that department in req.abac.departmentScope.
 */
const applyDoctorDepartmentScope = (req, res, next) => {
  const user = req.user;
  req.abac = req.abac || {};

  if (!user || !Array.isArray(user.roles)) {
    return next();
  }

  if (user.roles.includes('DOCTOR') && user.department) {
    req.abac.departmentScope = user.department;
  }

  next();
};

module.exports = {
  applyDoctorDepartmentScope,
};
