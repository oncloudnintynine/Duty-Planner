const SHEET_ID = '1nIikE-sV-htx-uSgH5cGKPhWfSJJctWP5WQtcbcHi_E';

function getDbSheet() { return SpreadsheetApp.openById(SHEET_ID); }

// ==========================================
// 1. DATABASE SETUP 
// ==========================================
function setupDatabase() {
 const ss = getDbSheet();
 const setupConfig = {
   "Roles": ["RoleID", "RoleName", "Is24_7", "DaysOfWeek"],
   "Shifts": ["ShiftID", "RoleID", "ShiftName", "StartTime", "EndTime"],
   "Personnel": ["PersonID", "PersonName"],
   "Tags": ["TagID", "PersonID", "RoleID"],
   "Schedule": ["ScheduleID", "YearMonth", "Date", "RoleName", "ShiftName", "StartDateTime", "EndDateTime", "PersonName"]
 };

 // Fixed: Avoided for...of destructuring to bypass Google Apps Script upload syntax bug
 const sheetNames = Object.keys(setupConfig);
 for (let i = 0; i < sheetNames.length; i++) {
   let sheetName = sheetNames[i];
   let headers = setupConfig[sheetName];
   let sheet = ss.getSheetByName(sheetName);
   if (!sheet) { sheet = ss.insertSheet(sheetName); }
   sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
   sheet.setFrozenRows(1);
 }
}

// ==========================================
// 2. API ROUTER
// ==========================================
function doPost(e) {
 const data = JSON.parse(e.postData.contents);
 const action = data.action;
 let response = { status: "success" };

 try {
   if (action === "addPerson" || action === "updatePerson") response = handlePerson(data);
   else if (action === "deletePerson") response = deleteRow("Personnel", data.id);
   else if (action === "importPersonnel") response = importPersonnel(data);
   else if (action === "addRole" || action === "updateRole") response = handleRole(data);
   else if (action === "deleteRole") response = deleteRole(data.id);
   else if (action === "tagPerson") response = tagPerson(data);
   else if (action === "deleteTag") response = deleteRow("Tags", data.id);
   else if (action === "generateSchedule") response = generateSchedule(data.year, data.month);
 } catch (error) {
   response = { status: "error", message: error.toString() };
 }

 return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
 const action = e.parameter.action;
 let data = [];
 
 if (action === "getAllData") {
   data = {
     personnel: getTableData("Personnel", ["id", "name"]),
     roles: getTableData("Roles", ["id", "name", "is247", "days"]),
     shifts: getTableData("Shifts", ["id", "roleId", "name", "start", "end"]),
     tags: getTableData("Tags", ["id", "personId", "roleId"]),
     schedule: getTableData("Schedule", ["id", "yearMonth", "date", "role", "shift", "start", "end", "person"])
   };
 }

 return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 3. CRUD HELPERS
// ==========================================
function getTableData(sheetName, keys) {
 const sheet = getDbSheet().getSheetByName(sheetName);
 const rows = sheet.getDataRange().getValues();
 let result = [];
 for (let i = 1; i < rows.length; i++) {
   let obj = {};
   keys.forEach((key, index) => obj[key] = rows[i][index]);
   result.push(obj);
 }
 return result;
}

function deleteRow(sheetName, id) {
 const sheet = getDbSheet().getSheetByName(sheetName);
 const data = sheet.getDataRange().getValues();
 for (let i = 1; i < data.length; i++) {
   if (data[i][0] === id) {
     sheet.deleteRow(i + 1);
     return { message: "Deleted successfully." };
   }
 }
 return { message: "Item not found." };
}

function handlePerson(data) {
 const sheet = getDbSheet().getSheetByName("Personnel");
 if (data.action === "updatePerson") {
   deleteRow("Personnel", data.id); // Remove old to replace
   sheet.appendRow([data.id, data.personName]);
   return { message: "Updated successfully." };
 } else {
   sheet.appendRow([Utilities.getUuid(), data.personName]);
   return { message: "Added successfully." };
 }
}

function importPersonnel(data) {
 const sheet = getDbSheet().getSheetByName("Personnel");
 if (!data.names || data.names.length === 0) return { message: "No names provided." };
 
 data.names.forEach(name => {
   sheet.appendRow([Utilities.getUuid(), name]);
 });
 return { message: "Imported " + data.names.length + " personnel successfully." };
}

function handleRole(data) {
 const rSheet = getDbSheet().getSheetByName("Roles");
 const sSheet = getDbSheet().getSheetByName("Shifts");
 let roleId = data.id || Utilities.getUuid();

 if (data.action === "updateRole") {
   deleteRole(roleId); // Removes role and its old shifts
 }

 rSheet.appendRow([roleId, data.roleName, data.is247, data.daysOfWeek.join(",")]);
 data.shifts.forEach(s => sSheet.appendRow([Utilities.getUuid(), roleId, s.name, s.start, s.end]));
 return { message: "Role saved successfully." };
}

function deleteRole(roleId) {
 deleteRow("Roles", roleId);
 // Delete associated shifts
 const sheet = getDbSheet().getSheetByName("Shifts");
 let data = sheet.getDataRange().getValues();
 for (let i = data.length - 1; i >= 1; i--) {
   if (data[i][1] === roleId) sheet.deleteRow(i + 1);
 }
 return { message: "Role deleted." };
}

function tagPerson(data) {
 getDbSheet().getSheetByName("Tags").appendRow([Utilities.getUuid(), data.personId, data.roleId]);
 return { message: "Assigned successfully." };
}

// ==========================================
// 4. THE SCHEDULING ENGINE (Heuristic)
// ==========================================
function generateSchedule(year, month) {
 const ss = getDbSheet();
 const scheduleSheet = ss.getSheetByName("Schedule");
 
 // Clear existing schedule for this specific YearMonth
 const targetYM = `${year}-${String(month).padStart(2, '0')}`;
 let existingData = scheduleSheet.getDataRange().getValues();
 for (let i = existingData.length - 1; i >= 1; i--) {
   if (existingData[i][1] === targetYM) scheduleSheet.deleteRow(i + 1);
 }

 // Fetch Data
 const roles = getTableData("Roles", ["id", "name", "is247", "days"]);
 const shifts = getTableData("Shifts", ["id", "roleId", "name", "start", "end"]);
 const tags = getTableData("Tags", ["id", "personId", "roleId"]);
 const personnel = getTableData("Personnel", ["id", "name"]);

 // Map Personnel by ID for quick access
 const personMap = {};
 personnel.forEach(p => personMap[p.id] = { name: p.name, totalMinutes: 0, shifts: [] });

 // 1. Generate all required slots for the month
 let allSlots = [];
 const daysInMonth = new Date(year, month, 0).getDate();
 const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

 for (let d = 1; d <= daysInMonth; d++) {
   let currentDate = new Date(year, month - 1, d);
   let dayStr = dayNames[currentDate.getDay()];
   let dateString = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

   roles.forEach(role => {
     if (role.days.includes(dayStr)) {
       let roleShifts = shifts.filter(s => s.roleId === role.id);
       
       roleShifts.forEach(shift => {
         let startDT = new Date(`${dateString}T${shift.start}:00`);
         let endDT = new Date(`${dateString}T${shift.end}:00`);
         if (endDT <= startDT) endDT.setDate(endDT.getDate() + 1); // Overnight shift
         
         let possibleCandidates = tags.filter(t => t.roleId === role.id).map(t => t.personId);
         
         allSlots.push({
           dateString,
           roleName: role.name,
           shiftName: shift.name,
           startDT,
           endDT,
           possibleCandidates
         });
       });
     }
   });
 }

 // 2. Assign slots (Heuristic)
 let newRows = [];
 allSlots.forEach(slot => {
   let assignedPerson = null;
   // Sort candidates by total minutes worked to balance the load
   let candidates = slot.possibleCandidates.filter(pId => {
     let person = personMap[pId];
     // Check 11-hour rest rule
     let canWork = true;
     for (let i = 0; i < person.shifts.length; i++) {
       let s = person.shifts[i];
       let hoursBetween = Math.abs(s.startDT - slot.endDT) / 36e5;
       let hoursBetween2 = Math.abs(slot.startDT - s.endDT) / 36e5;
       if ((slot.startDT < s.endDT && slot.endDT > s.startDT) || 
           (slot.startDT >= s.endDT && hoursBetween2 < 11) ||
           (s.startDT >= slot.endDT && hoursBetween < 11)) {
         canWork = false;
         break;
       }
     }
     return canWork;
   });

   if (candidates.length > 0) {
     candidates.sort((a, b) => personMap[a].totalMinutes - personMap[b].totalMinutes);
     let selectedId = candidates[0];
     assignedPerson = personMap[selectedId].name;
     let duration = (slot.endDT - slot.startDT) / 60000;
     personMap[selectedId].totalMinutes += duration;
     personMap[selectedId].shifts.push(slot);
   } else {
     assignedPerson = "UNFILLED";
   }

   newRows.push([
     Utilities.getUuid(),
     targetYM,
     slot.dateString,
     slot.roleName,
     slot.shiftName,
     slot.startDT,
     slot.endDT,
     assignedPerson
   ]);
 });

 // Append to sheet
 if (newRows.length > 0) {
   scheduleSheet.getRange(scheduleSheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
 }

 return { message: "Schedule generated for " + targetYM };
}