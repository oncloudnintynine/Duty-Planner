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
// 2. CENTRAL STATE SYNC
// ==========================================
function syncData() {
  return {
    personnel: getTableData("Personnel", ["id", "name"]),
    roles: getTableData("Roles", ["id", "name", "is247", "days"]),
    shifts: getTableData("Shifts", ["id", "roleId", "name", "start", "end"]),
    tags: getTableData("Tags", ["id", "personId", "roleId"]),
    schedule: getTableData("Schedule", ["id", "yearMonth", "date", "role", "shift", "start", "end", "person"])
  };
}

function getTableData(sheetName, keys) {
  var sheet = getDbSheet().getSheetByName(sheetName);
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < keys.length; j++) {
      var val = rows[i][j];
      // Normalize dates to ISO strings for frontend
      if (val && Object.prototype.toString.call(val) === '[object Date]') {
        val = val.toISOString();
      }
      obj[keys[j]] = val;
    }
    result.push(obj);
  }
  return result;
}

function deleteRow(sheetName, id) {
  var sheet = getDbSheet().getSheetByName(sheetName);
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

// ==========================================
// 3. API ROUTER (POST ONLY FOR MUTATIONS & SYNC)
// ==========================================
function doPost(e) {
  var response = { status: "success" };

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No data payload received.");
    }
    
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    if (action === "sync") {
      // Just returns syncData at the end
    } 
    else if (action === "addPerson") {
      getDbSheet().getSheetByName("Personnel").appendRow([Utilities.getUuid(), data.personName]);
    } 
    else if (action === "importPersonnel") {
      var pSheet = getDbSheet().getSheetByName("Personnel");
      if (data.names && data.names.length > 0) {
        data.names.forEach(function(name) {
          pSheet.appendRow([Utilities.getUuid(), name]);
        });
      }
    } 
    else if (action === "deletePerson") {
      deleteRow("Personnel", data.id);
      // Cascade delete assignments
      var tSheet = getDbSheet().getSheetByName("Tags");
      var tData = tSheet.getDataRange().getValues();
      for (var i = tData.length - 1; i >= 1; i--) {
        if (tData[i][1] === data.id) tSheet.deleteRow(i + 1);
      }
    } 
    else if (action === "addRole") {
      var roleId = Utilities.getUuid();
      var daysStr = Array.isArray(data.daysOfWeek) ? data.daysOfWeek.join(",") : "";
      getDbSheet().getSheetByName("Roles").appendRow([roleId, data.roleName, data.is247, daysStr]);
      var sSheet = getDbSheet().getSheetByName("Shifts");
      if (data.shifts && data.shifts.length > 0) {
         data.shifts.forEach(function(s) {
           // Prepend tick to force string literal to prevent Sheets from mangling 24h times
           sSheet.appendRow([Utilities.getUuid(), roleId, s.name, "'" + s.start, "'" + s.end]);
         });
      }
    } 
    else if (action === "deleteRole") {
      deleteRow("Roles", data.id);
      // Cascade delete shifts and tags
      var shSheet = getDbSheet().getSheetByName("Shifts");
      var shData = shSheet.getDataRange().getValues();
      for (var j = shData.length - 1; j >= 1; j--) {
        if (shData[j][1] === data.id) shSheet.deleteRow(j + 1);
      }
      var tgSheet = getDbSheet().getSheetByName("Tags");
      var tgData = tgSheet.getDataRange().getValues();
      for (var k = tgData.length - 1; k >= 1; k--) {
        if (tgData[k][2] === data.id) tgSheet.deleteRow(k + 1);
      }
    } 
    else if (action === "tagPerson") {
      getDbSheet().getSheetByName("Tags").appendRow([Utilities.getUuid(), data.personId, data.roleId]);
    } 
    else if (action === "deleteTag") {
      deleteRow("Tags", data.id);
    } 
    else if (action === "generateSchedule") {
      generateSchedule(data.year, data.month);
    } 
    else {
      throw new Error("Unknown action: " + action);
    }
    
    // Always return full fresh DB to keep frontend in sync
    response.data = syncData();
    response.message = action !== "sync" ? "Action completed successfully." : null;

  } catch (error) {
    response = { status: "error", message: error.toString(), data: syncData() };
  }

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 4. THE SCHEDULING ENGINE (Heuristic)
// ==========================================
function generateSchedule(year, month) {
  var ss = getDbSheet();
  var scheduleSheet = ss.getSheetByName("Schedule");
  
  var targetYM = year + "-" + String(month).padStart(2, '0');
  
  // Wipe old data for this month to regenerate
  var existingData = scheduleSheet.getDataRange().getValues();
  for (var i = existingData.length - 1; i >= 1; i--) {
    if (existingData[i][1] === targetYM) {
      scheduleSheet.deleteRow(i + 1);
    }
  }

  var roles = getTableData("Roles", ["id", "name", "is247", "days"]);
  var shifts = getTableData("Shifts", ["id", "roleId", "name", "start", "end"]);
  var tags = getTableData("Tags", ["id", "personId", "roleId"]);
  var personnel = getTableData("Personnel", ["id", "name"]);

  var personMap = {};
  personnel.forEach(function(p) {
    personMap[p.id] = { name: p.name, totalMinutes: 0, shifts: [] };
  });

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
          // Clean the string just in case it contains extra formatting
          var st = String(shift.start).substring(0, 5); 
          var et = String(shift.end).substring(0, 5);
          
          var startDT = new Date(dateString + "T" + st + ":00");
          var endDT = new Date(dateString + "T" + et + ":00");
          if (endDT <= startDT) {
            endDT.setDate(endDT.getDate() + 1); // Overnight logic
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
        
        // 11 Hour Rest Enforcement Heuristic
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
      personMap[selectedId].totalMinutes += (slot.endDT.getTime() - slot.startDT.getTime()) / 60000;
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
      slot.startDT.toISOString(),
      slot.endDT.toISOString(),
      assignedPerson
    ]);
  });

  if (newRows.length > 0) {
    scheduleSheet.getRange(scheduleSheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
  }
}