import { Branch, system, Team } from "./type";

export const availableSystems: system[] = ["WMS", "CRM", "FMS","USLM"];

// Mock data for system-specific roles
export const systemRoles = {
    WMS: [
        { id: "1", name: "Admin", roleId: 1 },
        { id: "2", name: "User", roleId: 2 },
    ],
    CRM: [
        { id: "1", name: "Super Admin", roleId: 1 },
        { id: "2", name: "Admin", roleId: 2 },
        { id: "3", name: "User", roleId: 3 },
    ],
    FMS: [
        { id: "1", name: "Super Admin", roleId: 1 },
        { id: "2", name: "Admin", roleId: 1  },
        { id: "3", name: "Hiring Manager", roleId: 1  },
        { id: "4", name: "Finance", roleId: 1  },
        { id: "5", name: "User", roleId: 0  },
    ],
    TMS: [
        { id: "1", name: "Super Admin", role_type: "super_admin", roleId: 1 },
        { id: "2", name: "Admin", role_type: "admin", roleId: 2 },
        { id: "3", name: "Driver", role_type: "driver", roleId: 3 },
        { id: "4", name: "Guest", role_type: "guest", roleId: 4 },
        { id: "5", name: "User", role_type: "user", roleId: 5 },
    ],
    AMS: [
        { id: "1", name: "Admin", roleId: "Admin" },
        { id: "2", name: "Accountant", roleId: "Accountant" },
        { id: "3", name: "Manager", roleId: "Manager" },
    ],
    QCMS: [
        { id: "1", name: "Admin", roleId: "Admin" },
        { id: "2", name: "User", roleId: "User" },
        { id: "3", name: "Manager", roleId: "Manager" },
    ],
    TSMS: [
        { id: "1", name: "Admin", roleId: "Admin" },
        { id: "2", name: "User", roleId: "User" },
        { id: "3", name: "Manager", roleId: "Manager" },
    ],
    TDMS: [
        { id: "1", name: "Admin", roleId: "Admin" },
        { id: "2", name: "User", roleId: "User" },
        { id: "3", name: "Manager", roleId: "Manager" },
    ],
    HR: [
        { id: "1", name: "Admin", roleId: "Admin" },
        { id: "2", name: "User", roleId: "User" },
        { id: "3", name: "Manager", roleId: "Manager" },
    ],
     USLM: [
        { id: "1", name: "Admin", roleId:1},
        { id: "2", name: "User", roleId:2},
    ],
    CHATESS: [
        { id: "1", name: "Admin", roleId: "admin" },
        { id: "2", name: "User", roleId: "user" },
        { id: "3", name: "Viewer", roleId: "viewer" },
    ]
    
} as const;

export const accesses = [
    {value: "1", name: "Yes"},
    {value: "0", name: "No"},
]
export const teams: Team[] = [
    {teamId: 1, teamName: "Team_Dubai", shortCode: "DXB1", city: "dxb", "createdBy": 32},
    {teamId: 8, teamName: "Test", shortCode: "DXB1", city: "dxb", "createdBy": 32},
]

export const branches: Branch[] = [
    { id: "0", name: "All Branches" },
    { id: "1", name: "AMAZON - ABU DHABI" }, 
    { id: "2", name: "AMAZON - DUBAI" },
    { id: "3", name: "DANZAS" },
    { id: "4", name: "DHL ABU DHABI" },
    { id: "5", name: "DHL DUBAI" },
    { id: "6", name: "DHL SHARJAH" },
    { id: "7", name: "DSV NOKIA" },
    { id: "8", name: "FUJEIRAH AMAZON" },
    { id: "9", name: "FUJEIRAH DHL" },
    { id: "10", name: "FUJEIRAH LANDMARK" },
    { id: "11", name: "HUGO BOSS" },
    { id: "12", name: "INSTASHOP" },
    { id: "13", name: "INTERNATIONAL" },
    { id: "14", name: "LANDMARK-AI AIN" },
    { id: "15", name: "MASARATI" },
    { id: "16", name: "MUMZWORLD" },
    { id: "17", name: "NMC" },
    { id: "18", name: "NOON" },
    { id: "19", name: "NRL" },
    { id: "20", name: "PURE HEALTH COVID19" },
    { id: "21", name: "PURE HEALTH LAB" },
    { id: "22", name: "SAME DAY" },
    { id: "23", name: "SAMSUNG" },
    { id: "24", name: "SRL" },
    { id: "25", name: "TIME EXPRESS GARHOUD" },
    { id: "26", name: "UNION COOP" },
    { id: "27", name: "UTS" },
    { id: "32", name: "LANDMARK-ABUDHABI" },
    { id: "29", name: "LANDMARK-DUBAI" },
    { id: "28", name: "NATIONAL AIRPORT CAR RENT" },
    { id: "33", name: "VPS" },
    { id: "34", name: "MUBADALA" },
    { id: "35", name: "AZADEA" },
    { id: "36", name: "CARREFOUR" },
    { id: "37", name: "TIME EXPRESS - ABU DHABI" },
    { id: "38", name: "AD PORT" },
    { id: "39", name: "DXB" }
];


