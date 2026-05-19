var SHEET_ID = '1nIikE-sV-htx-uSgH5cGKPhWfSJJctWP5WQtcbcHi_E';

function getDbSheet() { 
  return SpreadsheetApp.openById(SHEET_ID); 
}

// ==========================================
// 1. DATABASE SETUP 
// ==========================================
function setupDatabase() {
  var ss = getDbSheet();
  var setupConfig = {
    "Roles": ["RoleID", "RoleName", "Is24_7", "DaysOfWeek"],
    "Shifts": ["ShiftID", "RoleID", "ShiftName", "StartTime", "EndTime"],
    "Personnel": ["PersonID", "PersonName"],
    "Tags": ["TagID", "PersonID", "RoleID"],
    "Schedule": ["ScheduleID", "YearMonth", "Date", "RoleName", "ShiftName", "StartDateTime", "EndDateTime", "PersonName"]
  };

  var sheetNames = Object.keys(setupConfig);
  for (var i = 0; i < sheetNames.length; i++) {
    var sheetName = sheetNames[i];
    var headers = setupConfig[sheetName];
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) { 
      sheet = ss.insertSheet(sheetName); 
    }
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

// ==========================================
// 2. API ROUTER
// ==========================================
function doPost(e) {
  var response = { status: "success" };

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No data received.");
    }
    
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    if (action === "addPerson" || action === "updatePerson") {
      response = handlePerson(data);
    } else if (action === "deletePerson") {
      response = deleteRow("Personnel", data.id);
    } else if (action === "importPersonnel") {
      response = importPersonnel(data);
    } else if (action === "addRole" || action === "updateRole") {
      response = handleRole(data);
    } else if (action === "deleteRole") {
      response = deleteRole(data.id);
    } else if (action === "tagPerson") {
      response = tagPerson(data);
    } else if (action === "deleteTag") {
      response = deleteRow("Tags", data.id);
    } else if (action === "generateSchedule") {
      response = generateSchedule(data.year, data.month);
    } else {
      throw new Error("Unknown action.");
    }
  } catch (error) {
    response = { status: "error", message: error.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var data = {};
  
  try {
    var action = e.parameter ? e.parameter.action : null;
    if (action === "getAllData") {
      data = {
        personnel: getTableData("Personnel", ["id", "name"]),
        roles: getTableData("Roles", ["id", "name", "is247", "days"]),
        shifts: getTableData("Shifts", ["id", "roleId", "name", "start", "end"]),
        tags: getTableData("Tags", ["id", "personId", "roleId"]),
        schedule: getTableData("Schedule", ["id", "yearMonth", "date", "role", "shift", "start", "end", "person"])
      };
    }
  } catch (error) {
    data = { error: error.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 3. CRUD HELPERS
// ==========================================
function getTableData(sheetName, keys) {
  var sheet = getDbSheet().getSheetByName(sheetName);
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < keys.length; j++) {
      obj[keys[j]] = rows[i][j];
    }
    result.push(obj);
  }
  return result;
}

function deleteRow(sheetName, id) {
  var sheet = getDbSheet().getSheetByName(sheetName);
  if (!sheet) return { message: "Sheet not found." };
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { message: "Deleted successfully." };
    }
  }
  return { message: "Item not found." };
}

function handlePerson(data) {
  var sheet = getDbSheet().getSheetByName("Personnel");
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
  var sheet = getDbSheet().getSheetByName("Personnel");
  if (!data.names || data.names.length === 0) return { message: "No names provided." };
  
  data.names.forEach(function(name) {
    sheet.appendRow([Utilities.getUuid(), name]);
  });
  return { message: "Imported " + data.names.length + " personnel successfully." };
}

function handleRole(data) {
  var rSheet = getDbSheet().getSheetByName("Roles");
  var sSheet = getDbSheet().getSheetByName("Shifts");
  var roleId = data.id || Utilities.getUuid();

  if (data.action === "updateRole") {
    deleteRole(roleId); // Removes role and its old shifts
  }

  var daysStr = Array.isArray(data.daysOfWeek) ? data.daysOfWeek.join(",") : "";
  rSheet.appendRow([roleId, data.roleName, data.is247, daysStr]);
  
  data.shifts.forEach(function(s) {
    sSheet.appendRow([Utilities.getUuid(), roleId, s.name, s.start, s.end]);
  });
  return { message: "Role saved successfully." };
}

function deleteRole(roleId) {
  deleteRow("Roles", roleId);
  // Delete associated shifts
  var sheet = getDbSheet().getSheetByName("Shifts");
  if (!sheet) return { message: "Shifts sheet missing." };
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === roleId) {
      sheet.deleteRow(i + 1);
    }
  }
  return { message: "Role deleted." };
}

function tagPerson(data) {
  var sheet = getDbSheet().getSheetByName("Tags");
  sheet.appendRow([Utilities.getUuid(), data.personId, data.roleId]);
  return { message: "Assigned successfully." };
}

// ==========================================
// 4. THE SCHEDULING ENGINE (Heuristic)
// ==========================================
function generateSchedule(year, month) {
  var ss = getDbSheet();
  var scheduleSheet = ss.getSheetByName("Schedule");
  
  // Clear existing schedule for this specific YearMonth
  var targetYM = year + "-" + String(month).padStart(2, '0');
  var existingData = scheduleSheet.getDataRange().getValues();
  for (var i = existingData.length - 1; i >= 1; i--) {
    if (existingData[i][1] === targetYM) {
      scheduleSheet.deleteRow(i + 1);
    }
  }

  // Fetch Data
  var roles = getTableData("Roles", ["id", "name", "is247", "days"]);
  var shifts = getTableData("Shifts", ["id", "roleId", "name", "start", "end"]);
  var tags = getTableData("Tags", ["id", "personId", "roleId"]);
  var personnel = getTableData("Personnel", ["id", "name"]);

  // Map Personnel by ID for quick access
  var personMap = {};
  personnel.forEach(function(p) {
    personMap[p.id] = { name: p.name, totalMinutes: 0, shifts: [] };
  });

  // 1. Generate all required slots for the month
  var allSlots = [];
  var daysInMonth = new Date(year, month, 0).getDate();
  var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (var d = 1; d <= daysInMonth; d++) {
    var currentDate = new Date(year, month - 1, d);
    var dayStr = dayNames[currentDate.getDay()];
    var dateString = year + "-" + String(month).padStart(2,'0') + "-" + String(d).padStart(2,'0');

    roles.forEach(function(role) {
      if (role.days.indexOf(dayStr) !== -1) {
        var roleShifts = shifts.filter(function(s) { return s.roleId === role.id; });
        
        roleShifts.forEach(function(shift) {
          var startDT = new Date(dateString + "T" + shift.start + ":00");
          var endDT = new Date(dateString + "T" + shift.end + ":00");
          if (endDT <= startDT) {
            endDT.setDate(endDT.getDate() + 1); // Overnight shift
          }
          
          var possibleCandidates = tags.filter(function(t) { return t.roleId === role.id; })
                                       .map(function(t) { return t.personId; });
          
          allSlots.push({
            dateString: dateString,
            roleName: role.name,
            shiftName: shift.name,
            startDT: startDT,
            endDT: endDT,
            possibleCandidates: possibleCandidates
          });
        });
      }
    });
  }

  // 2. Assign slots (Heuristic)
  var newRows = [];
  allSlots.forEach(function(slot) {
    var assignedPerson = null;
    
    var candidates = slot.possibleCandidates.filter(function(pId) {
      var person = personMap[pId];
      if (!person) return false;
      
      var canWork = true;
      for (var j = 0; j < person.shifts.length; j++) {
        var s = person.shifts[j];
        var hoursBetween = Math.abs(s.startDT.getTime() - slot.endDT.getTime()) / 3600000;
        var hoursBetween2 = Math.abs(slot.startDT.getTime() - s.endDT.getTime()) / 3600000;
        
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
      candidates.sort(function(a, b) { return personMap[a].totalMinutes - personMap[b].totalMinutes; });
      var selectedId = candidates[0];
      assignedPerson = personMap[selectedId].name;
      var duration = (slot.endDT.getTime() - slot.startDT.getTime()) / 60000;
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