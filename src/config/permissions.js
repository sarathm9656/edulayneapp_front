export const PERMISSIONS = {
  // User Management
  USER: {
    CREATE: "user:create",
    VIEW: "user:view",
    EDIT: "user:edit",
    DELETE: "user:delete",
    LIST: "user:list",
  },

  // Course Management
  COURSE: {
    CREATE: "course:create",
    VIEW: "course:view",
    EDIT: "course:edit",
    DELETE: "course:delete",
    LIST: "course:list",
  },

  // Dashboard
  DASHBOARD: {
    VIEW: "dashboard:view",
  },

  // Role Management
  ROLE: {
    CREATE: "role:create",
    VIEW: "role:view",
    EDIT: "role:edit",
    DELETE: "role:delete",
    LIST: "role:list",
  },

  // Tenant Management
  TENANT: {
    CREATE: "tenant:create",
    VIEW: "tenant:view",
    EDIT: "tenant:edit",
    DELETE: "tenant:delete",
    LIST: "tenant:list",
  },
};

// Group permissions by category for better organization in UI
export const PERMISSION_GROUPS = [
  {
    name: "User Management",
    permissions: [
      { key: PERMISSIONS.USER.CREATE, label: "Create User" },
      { key: PERMISSIONS.USER.VIEW, label: "View User" },
      { key: PERMISSIONS.USER.EDIT, label: "Edit User" },
      { key: PERMISSIONS.USER.DELETE, label: "Delete User" },
      { key: PERMISSIONS.USER.LIST, label: "List Users" },
    ],
  },
  {
    name: "Course Management",
    permissions: [
      { key: PERMISSIONS.COURSE.CREATE, label: "Create Course" },
      { key: PERMISSIONS.COURSE.VIEW, label: "View Course" },
      { key: PERMISSIONS.COURSE.EDIT, label: "Edit Course" },
      { key: PERMISSIONS.COURSE.DELETE, label: "Delete Course" },
      { key: PERMISSIONS.COURSE.LIST, label: "List Courses" },
    ],
  },
  {
    name: "Dashboard",
    permissions: [{ key: PERMISSIONS.DASHBOARD.VIEW, label: "View Dashboard" }],
  },
  {
    name: "Role Management",
    permissions: [
      { key: PERMISSIONS.ROLE.CREATE, label: "Create Role" },
      { key: PERMISSIONS.ROLE.VIEW, label: "View Role" },
      { key: PERMISSIONS.ROLE.EDIT, label: "Edit Role" },
      { key: PERMISSIONS.ROLE.DELETE, label: "Delete Role" },
      { key: PERMISSIONS.ROLE.LIST, label: "List Roles" },
    ],
  },
  {
    name: "Tenant Management",
    permissions: [
      { key: PERMISSIONS.TENANT.CREATE, label: "Create Tenant" },
      { key: PERMISSIONS.TENANT.VIEW, label: "View Tenant" },
      { key: PERMISSIONS.TENANT.EDIT, label: "Edit Tenant" },
      { key: PERMISSIONS.TENANT.DELETE, label: "Delete Tenant" },
      { key: PERMISSIONS.TENANT.LIST, label: "List Tenants" },
    ],
  },
];
