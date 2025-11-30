# Hospital Management System - Backend

## Folder Structure

```
backend/
├── config/
│   └── db.js               # MongoDB connection logic
├── src/
│   ├── config/             # Additional config (DB manager, logger)
│   │   ├── dbMaster.js
│   │   ├── logger.js
│   │   └── tenantDbManager.js
│   ├── middleware/         # Application middleware
│   │   ├── abacMiddleware.js
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── rbacMiddleware.js
│   │   ├── tenantMiddleware.js
│   │   └── validationMiddleware.js
│   ├── modules/            # Feature modules
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.service.js
│   │   ├── menu/
│   │   │   ├── menu.controller.js
│   │   │   ├── menu.routes.js
│   │   │   └── menu.service.js
│   │   ├── patients/
│   │   │   ├── patient.controller.js
│   │   │   ├── patient.model.js
│   │   │   ├── patient.routes.js
│   │   │   └── patient.service.js
│   │   ├── prescriptions/
│   │   │   ├── prescription.controller.js
│   │   │   ├── prescription.model.js
│   │   │   ├── prescription.routes.js
│   │   │   └── prescription.service.js
│   │   ├── security/
│   │   │   ├── password.controller.js
│   │   │   ├── password.model.js
│   │   │   ├── password.routes.js
│   │   │   └── password.service.js
│   │   ├── tenants/
│   │   │   ├── tenant.controller.js
│   │   │   ├── tenant.model.js
│   │   │   ├── tenant.routes.js
│   │   │   └── tenant.service.js
│   │   └── users/
│   │       ├── user.controller.js
│   │       ├── user.model.js
│   │       ├── user.routes.js
│   │       └── user.service.js
│   ├── utils/              # Utility functions
│   │   ├── emailService.js
│   │   ├── idGenerator.js
│   │   ├── pagination.js
│   │   ├── passwordPolicy.js
│   │   └── tokenUtils.js
│   └── app.js              # Express app configuration
├── .env.example            # Example environment variables file
├── package.json
└── server.js               # Server entry point
```
