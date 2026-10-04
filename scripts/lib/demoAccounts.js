/** One login per role for the judge walkthrough, plus extra drivers so every trip has its own driver. */
const DEMO_ACCOUNTS = [
  { email: "dispatch@waypoint.com", role: "dispatcher", fullName: "Kasun Sandaruwan", profile: { employee_id: "DSP-001" } },
  { email: "load@waypoint.com", role: "loader", fullName: "Osal Geesara", profile: { employee_id: "LDR-001", assigned_bay: "Bay 04" } },
  { email: "driver@waypoint.com", role: "driver", fullName: "Kasun Perera", profile: { employee_id: "D-1084", phone: "+94771084084" } },
  {
    email: "store@waypoint.com",
    role: "store_manager",
    fullName: "Kavindu Perera",
    profile: { store_id: "a1111111-1111-1111-1111-111111111111" },
  },
  { email: "driver2@waypoint.com", role: "driver", fullName: "Nimal Fernando", profile: { employee_id: "D-1091", phone: "+94771091091" } },
  { email: "driver3@waypoint.com", role: "driver", fullName: "Chaminda Silva", profile: { employee_id: "D-1102", phone: "+94771102102" } },
  { email: "driver4@waypoint.com", role: "driver", fullName: "Pradeep Kumara", profile: { employee_id: "D-1117", phone: "+94771117117" } },
];

module.exports = { DEMO_ACCOUNTS };
