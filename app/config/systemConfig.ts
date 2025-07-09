export const systemConfig: Record< string, { clientId: string; roleName: string } > = 
{
  CRM: { clientId: "crm-id", roleName: "crm-access" },
  WMS: { clientId: "wms-id", roleName: "wms-access" },
  TMS: { clientId: "tms-id", roleName: "tms-access" },
  FMS: { clientId: "fms-id", roleName: "fms-access" },
  AMS: { clientId: "accounting-id", roleName: "ams-access" },
  QCMS: { clientId: "quote-id", roleName: "qcms-access" },
  TDMS: { clientId: "todo-id", roleName: "tdms-access" },
  TSMS: { clientId: "timesheet-id", roleName: "tsms-access" },
  HR: { clientId: "hr_id", roleName: "hr-access" },
  CHATESS: { clientId: "chatess-id", roleName: "chatess-access" }
};
