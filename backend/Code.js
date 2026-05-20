var SHEET_ID = '1nIikE-sV-htx-uSgH5cGKPhWfSJJctWP5WQtcbcHi_E';

function getDbSheet() { 
return SpreadsheetApp.openById(SHEET_ID); 
}

// ==========================================
// 1. DATABASE SETUP & MIGRATION
// ==========================================
var setupConfig = {
"Seniorities": ["SeniorityID", "LevelName", "SortOrder"],
"Roles": ["RoleID", "RoleName", "Is24_7", "DaysOfWeek", "RoleType", "ConcurrentRoles"],
"Shifts": ["ShiftID", "RoleID", "ShiftName", "StartTime", "EndTime", "SeniorityReqs"],
"Personnel": ["PersonID", "PersonName", "SeniorityID"],
"Tags": ["TagID", "PersonID", "RoleID"],
"Schedule": ["ScheduleID", "YearMonth", "Date", "RoleName", "ShiftName", "SeniorityReqName", "StartDateTime", "EndDateTime", "PersonName", "PersonID"]
};

function setupDatabase() {
var ss = getDbSheet();
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

// Inject default seniorities if empty
var senSheet = ss.getSheetByName("Seniorities");
if (senSheet && senSheet.getLastRow() === 1) {
  senSheet.appendRow([Utilities.getUuid(), "Junior", 3]);
  senSheet.appendRow([Utilities.getUuid(), "Mid", 2]);
  senSheet.appendRow([Utilities.getUuid(), "Senior", 1]);
}
}

// RUN THIS FUNCTION ONCE TO UPGRADE EXISTING DATA TO V3 (Dynamic Seniorities)
function runMigration() {
var ss = getDbSheet();

// 1. Ensure Seniorities Sheet exists
var senSheet = ss.getSheetByName("Seniorities");
if (!senSheet) { senSheet = ss.insertSheet("Seniorities"); }
senSheet.clear();
senSheet.getRange(1, 1, 1, setupConfig["Seniorities"].length).setValues([setupConfig["Seniorities"]]).setFontWeight("bold");

var idJun = Utilities.getUuid();
var idMid = Utilities.getUuid();
var idSen = Utilities.getUuid();

senSheet.appendRow([idSen, "Senior", 1]);
senSheet.appendRow([idMid, "Mid", 2]);
senSheet.appendRow([idJun, "Junior", 3]);

var mapNameId = { "Senior": idSen, "Mid": idMid, "Junior": idJun };

// 2. Upgrade Personnel to use IDs instead of strings
var pSheet = ss.getSheetByName("Personnel");
if (pSheet) {
   pSheet.getRange(1, 1, 1, setupConfig["Personnel"].length).setValues([setupConfig["Personnel"]]).setFontWeight("bold");
   var pData = pSheet.getDataRange().getValues();
   for (var i = 1; i < pData.length; i++) {
     var oldSen = pData[i][2];
     if (mapNameId[oldSen]) {
         pSheet.getRange(i + 1, 3).setValue(mapNameId[oldSen]);
     } else {
         pSheet.getRange(i + 1, 3).setValue(idJun); // Fallback to Junior
     }
   }
}

// 3. Upgrade Roles
var rSheet = ss.getSheetByName("Roles");
if (rSheet) {
   rSheet.getRange(1, 1, 1, setupConfig["Roles"].length).setValues([setupConfig["Roles"]]).setFontWeight("bold");
}

// 4. Upgrade Shifts to use Seniority IDs in JSON Reqs
var sSheet = ss.getSheetByName("Shifts");
if (sSheet) {
   sSheet.getRange(1, 1, 1, setupConfig["Shifts"].length).setValues([setupConfig["Shifts"]]).setFontWeight("bold");
   var sData = sSheet.getDataRange().getValues();
   for (var k = 1; k < sData.length; k++) {
     var reqsStr = sData[k][5];
     var reqs = {};
     try { reqs = JSON.parse(reqsStr || "{}"); } catch(e){}
     
     var newReqs = {};
     if(reqs["Senior"] !== undefined) newReqs[idSen] = reqs["Senior"];
     if(reqs["Mid"] !== undefined) newReqs[idMid] = reqs["Mid"];
     if(reqs["Junior"] !== undefined) newReqs[idJun] = reqs["Junior"];
     
     sSheet.getRange(k + 1, 6).setValue(JSON.stringify(newReqs));
   }
}

// 5. Upgrade Tags
var tSheet = ss.getSheetByName("Tags");
if (tSheet) {
   tSheet.getRange(1, 1, 1, setupConfig["Tags"].length).setValues([setupConfig["Tags"]]).setFontWeight("bold");
}

// 6. Clear and Upgrade Schedule Schema
var schSheet = ss.getSheetByName("Schedule");
if (schSheet) {
   schSheet.clear();
   schSheet.getRange(1, 1, 1, setupConfig["Schedule"].length).setValues([setupConfig["Schedule"]]).setFontWeight("bold");
   schSheet.setFrozenRows(1);
}
}

// ==========================================
// 2. CENTRAL STATE SYNC
// ==========================================
function syncData() {
return {
  seniorities: getTableData("Seniorities", ["id", "name", "order"]),
  personnel: getTableData("Personnel", ["id", "name", "seniority"]),
  roles: getTableData("Roles", ["id", "name", "is247", "days", "type", "concurrentRoles"]),
  shifts: getTableData("Shifts", ["id", "roleId", "name", "start", "end", "reqs"]),
  tags: getTableData("Tags", ["id", "personId", "roleId"]),
  schedule: getTableData("Schedule", ["id", "yearMonth", "date", "role", "shift", "seniorityReqName", "start", "end", "personName", "personId"])
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

function updateRow(sheetName, id, newDataArray) {
var sheet = getDbSheet().getSheetByName(sheetName);
if (!sheet) return;
var data = sheet.getDataRange().getValues();
for (var i = 1; i < data.length; i++) {
  if (data[i][0] === id) {
    sheet.getRange(i + 1, 1, 1, newDataArray.length).setValues([newDataArray]);
    return;
  }
}
}

// ==========================================
// 3. API ROUTER 
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
    // Return sync at end
  } 
  else if (action === "setupDatabase") {
    setupDatabase();
  }
  else if (action === "runMigration") {
    runMigration();
  }
  else if (action === "addSeniorityTier") {
    getDbSheet().getSheetByName("Seniorities").appendRow([Utilities.getUuid(), data.name, data.order]);
  }
  else if (action === "updateSeniorityTier") {
    updateRow("Seniorities", data.id, [data.id, data.name, data.order]);
  }
  else if (action === "deleteSeniorityTier") {
    deleteRow("Seniorities", data.id);
    
    // Cleanup Personnel
    var pSheet = getDbSheet().getSheetByName("Personnel");
    var pData = pSheet.getDataRange().getValues();
    for (var i = pData.length - 1; i >= 1; i--) {
      if (pData[i][2] === data.id) pSheet.getRange(i + 1, 3).setValue("");
    }

    // Cleanup Shifts
    var sSheet = getDbSheet().getSheetByName("Shifts");
    var sData = sSheet.getDataRange().getValues();
    for (var j = sData.length - 1; j >= 1; j--) {
      var reqs = {};
      try { reqs = JSON.parse(sData[j][5] || "{}"); } catch(ex){}
      var changed = false;
      if (reqs[data.id] !== undefined) {
        delete reqs[data.id];
        changed = true;
      }
      if (reqs["reserve_" + data.id] !== undefined) {
        delete reqs["reserve_" + data.id];
        changed = true;
      }
      if(changed) {
          sSheet.getRange(j + 1, 6).setValue(JSON.stringify(reqs));
      }
    }
  }
  else if (action === "addPerson") {
    getDbSheet().getSheetByName("Personnel").appendRow([Utilities.getUuid(), data.personName, data.seniority]);
  } 
  else if (action === "updatePerson") {
    updateRow("Personnel", data.id, [data.id, data.personName, data.seniority]);
  }
  else if (action === "importPersonnel") {
    var pSheet2 = getDbSheet().getSheetByName("Personnel");
    if (data.names && data.names.length > 0) {
      data.names.forEach(function(name) {
        pSheet2.appendRow([Utilities.getUuid(), name, data.defaultSeniority]);
      });
    }
  } 
  else if (action === "deletePerson") {
    deleteRow("Personnel", data.id);
    var tSheet = getDbSheet().getSheetByName("Tags");
    var tData = tSheet.getDataRange().getValues();
    for (var k = tData.length - 1; k >= 1; k--) {
      if (tData[k][1] === data.id) tSheet.deleteRow(k + 1);
    }
  } 
  else if (action === "addRole") {
    var roleId = Utilities.getUuid();
    var daysStr = Array.isArray(data.daysOfWeek) ? data.daysOfWeek.join(",") : "";
    var concurrentStr = Array.isArray(data.concurrentRoles) ? JSON.stringify(data.concurrentRoles) : "[]";
    
    getDbSheet().getSheetByName("Roles").appendRow([
      roleId, data.roleName, data.is247, daysStr, data.roleType, concurrentStr
    ]);
    
    var sSheet2 = getDbSheet().getSheetByName("Shifts");
    if (data.shifts && data.shifts.length > 0) {
       data.shifts.forEach(function(s) {
         sSheet2.appendRow([Utilities.getUuid(), roleId, s.name, "'" + s.start, "'" + s.end, JSON.stringify(s.reqs)]);
       });
    }
  } 
  else if (action === "updateRole") {
    var daysStrU = Array.isArray(data.daysOfWeek) ? data.daysOfWeek.join(",") : "";
    var concurrentStrU = Array.isArray(data.concurrentRoles) ? JSON.stringify(data.concurrentRoles) : "[]";
    
    updateRow("Roles", data.id, [
      data.id, data.roleName, data.is247, daysStrU, data.roleType, concurrentStrU
    ]);
    
    var shSheet = getDbSheet().getSheetByName("Shifts");
    var shData = shSheet.getDataRange().getValues();
    for (var m = shData.length - 1; m >= 1; m--) {
      if (shData[m][1] === data.id) shSheet.deleteRow(m + 1);
    }
    
    if (data.shifts && data.shifts.length > 0) {
       data.shifts.forEach(function(s) {
         shSheet.appendRow([Utilities.getUuid(), data.id, s.name, "'" + s.start, "'" + s.end, JSON.stringify(s.reqs)]);
       });
    }
  }
  else if (action === "deleteRole") {
    deleteRow("Roles", data.id);
    var shSheetDel = getDbSheet().getSheetByName("Shifts");
    var shDataDel = shSheetDel.getDataRange().getValues();
    for (var m2 = shDataDel.length - 1; m2 >= 1; m2--) {
      if (shDataDel[m2][1] === data.id) shSheetDel.deleteRow(m2 + 1);
    }
    var tgSheet = getDbSheet().getSheetByName("Tags");
    var tgData2 = tgSheet.getDataRange().getValues();
    for (var n = tgData2.length - 1; n >= 1; n--) {
      if (tgData2[n][2] === data.id) tgSheet.deleteRow(n + 1);
    }
  } 
  else if (action === "tagPerson") {
    var tagsSheet = getDbSheet().getSheetByName("Tags");
    var existingTags = tagsSheet.getDataRange().getValues();
    var exists = false;
    for (var x = 1; x < existingTags.length; x++) {
        if (existingTags[x][1] === data.personId && existingTags[x][2] === data.roleId) exists = true;
    }
    if (!exists) {
        tagsSheet.appendRow([Utilities.getUuid(), data.personId, data.roleId]);
    }
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
  
  response.data = syncData();
  response.message = action !== "sync" ? "Action completed successfully." : null;

} catch (error) {
  response = { status: "error", message: error.toString(), data: syncData() };
}

return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 4. THE SCHEDULING ENGINE (Heuristic & Constraints)
// ==========================================
function getWeekKey(dateObj) {
var d = new Date(dateObj.getTime());
var day = d.getDay() || 7; 
d.setDate(d.getDate() + 4 - day);
var year = d.getFullYear();
var firstDay = new Date(year, 0, 1);
var week = Math.ceil((((d - firstDay) / 86400000) + 1) / 7);
return year + "-W" + week;
}

function generateSchedule(year, month) {
var ss = getDbSheet();
var scheduleSheet = ss.getSheetByName("Schedule");
var targetYM = year + "-" + String(month).padStart(2, '0');

// Wipe old data for this month
var existingData = scheduleSheet.getDataRange().getValues();
for (var i = existingData.length - 1; i >= 1; i--) {
  if (existingData[i][1] === targetYM) {
    scheduleSheet.deleteRow(i + 1);
  }
}

// Load Data
var seniorities = getTableData("Seniorities", ["id", "name", "order"]);
var roles = getTableData("Roles", ["id", "name", "is247", "days", "type", "concurrentRoles"]);
var shifts = getTableData("Shifts", ["id", "roleId", "name", "start", "end", "reqs"]);
var tags = getTableData("Tags", ["id", "personId", "roleId"]);
var personnel = getTableData("Personnel", ["id", "name", "seniority"]);

// Map Seniority Names
var senMap = {};
seniorities.forEach(function(s) { senMap[s.id] = s.name; });

// Role Map for quick access
var roleMap = {};
roles.forEach(function(r) {
  var cRoles = [];
  try { cRoles = JSON.parse(r.concurrentRoles || "[]"); } catch(e) {}
  roleMap[r.id] = { type: r.type, concurrentRoles: cRoles };
});

// Person Map & Pre-fill Normal Office Hours
var personMap = {};
var daysInMonth = new Date(year, month, 0).getDate();

personnel.forEach(function(p) {
  personMap[p.id] = { 
    name: p.name, 
    seniorityId: p.seniority, 
    totalDutyMinutes: 0, 
    blocks: [], 
    weeklyHours: {} 
  };

  // Pre-populate standard office hours (Mon-Fri 0800-1730)
  for (var d = 1; d <= daysInMonth; d++) {
    var cDate = new Date(year, month - 1, d);
    var dayOfWeek = cDate.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { 
      var sdt = new Date(year, month - 1, d, 8, 0, 0);
      var edt = new Date(year, month - 1, d, 17, 30, 0);
      var wk = getWeekKey(sdt);
      personMap[p.id].blocks.push({
        type: 'office',
        startDT: sdt,
        endDT: edt,
        durationH: 9.5, // 9.5 elapsed hours
        active: true,
        dateStr: year + "-" + String(month).padStart(2,'0') + "-" + String(d).padStart(2,'0')
      });
      personMap[p.id].weeklyHours[wk] = (personMap[p.id].weeklyHours[wk] || 0) + 9.5;
    }
  }
});

// Explode shifts into individual slots based on Dynamic Seniority Reqs
var allSlots = [];
var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

for (var d = 1; d <= daysInMonth; d++) {
  var currentDate = new Date(year, month - 1, d);
  var dayStr = dayNames[currentDate.getDay()];
  var dateString = year + "-" + String(month).padStart(2,'0') + "-" + String(d).padStart(2,'0');

  roles.forEach(function(role) {
    if (role.days.indexOf(dayStr) !== -1 || role.is247 === true || role.is247 === "TRUE") {
      var roleShifts = shifts.filter(function(s) { return s.roleId === role.id; });
      
      roleShifts.forEach(function(shift) {
        var st = String(shift.start || "00:00").substring(0, 5); 
        var et = String(shift.end || "00:00").substring(0, 5);
        var startDT = new Date(dateString + "T" + st + ":00");
        var endDT = new Date(dateString + "T" + et + ":00");
        
        // Fix for strict 24 hour shift starting at 00:00 and ending at 00:00
        if (endDT <= startDT) {
            endDT.setDate(endDT.getDate() + 1);
        }
        
        var reqs = {};
        try { reqs = JSON.parse(shift.reqs || "{}"); } catch(e){}

        var durationH = (endDT.getTime() - startDT.getTime()) / 3600000;

        // Generate a slot for each required headcount per dynamic seniority ID
        seniorities.forEach(function(senObj) {
           // 1. Active Headcount Requirements
           var count = parseInt(reqs[senObj.id]) || 0;
           for (var c = 0; c < count; c++) {
              allSlots.push({
                dateString: dateString,
                roleId: role.id,
                roleName: role.name,
                shiftName: shift.name,
                startDT: startDT,
                endDT: endDT,
                reqSeniorityId: senObj.id,
                reqSeniorityName: senObj.name,
                durationH: durationH,
                isReserve: false
              });
           }
           
           // 2. Reserve Headcount Requirements
           var reserveCount = parseInt(reqs["reserve_" + senObj.id]) || 0;
           for (var rc = 0; rc < reserveCount; rc++) {
               allSlots.push({
                dateString: dateString,
                roleId: role.id,
                roleName: role.name,
                shiftName: shift.name + " (Reserve)",
                startDT: startDT,
                endDT: endDT,
                reqSeniorityId: senObj.id,
                reqSeniorityName: senObj.name,
                durationH: durationH,
                isReserve: true
              });
           }
        });
      });
    }
  });
}

// Sort all slots:
// 1. We must process ALL Active Shifts first (isReserve == false) so they take priority 
//    for availability and dictate structural constraints like 11-hour rest correctly.
//    Reserves are sorted to the bottom.
// 2. Secondary sort by Date/Time
allSlots.sort(function(a, b) {
    if (a.isReserve !== b.isReserve) {
        return a.isReserve ? 1 : -1;
    }
    return a.startDT.getTime() - b.startDT.getTime();
});

// Assign Slots Heuristically
var newRows = [];

allSlots.forEach(function(slot) {
  var possibleCandidates = tags.filter(function(t) { return t.roleId === slot.roleId; })
                               .map(function(t) { return t.personId; });

  var validCandidates = [];
  var rData = roleMap[slot.roleId];

  possibleCandidates.forEach(function(pId) {
    var person = personMap[pId];
    if (!person) return;
    if (person.seniorityId !== slot.reqSeniorityId) return; // Exact match required based on DB ID

    var canWork = true;
    var blocksToWaive = []; 
    
    for (var j = 0; j < person.blocks.length; j++) {
      var b = person.blocks[j];
      if (!b.active) continue;

      var isOverlap = (slot.startDT < b.endDT && slot.endDT > b.startDT);
      var hoursBetweenEndStart = Math.abs(b.startDT.getTime() - slot.endDT.getTime()) / 3600000;
      var hoursBetweenStartEnd = Math.abs(slot.startDT.getTime() - b.endDT.getTime()) / 3600000;
      var violatesRest = false;

      if (slot.isReserve) {
          // ==============================
          // RESERVE SLOT CONSTRAINTS
          // ==============================
          // 1. Ignore Rest Rule completely
          // 2. If it overlaps with an existing shift or another reserve duty, enforce concurrency.
          // 3. Overlaps with Office Duty DO NOT cause any violations.
          if (b.type === 'shift' || b.type === 'reserve') {
              if (isOverlap) {
                  var existingRoleData = roleMap[b.roleId];
                  var aAllowsB = (rData.concurrentRoles.indexOf(b.roleId) !== -1);
                  var bAllowsA = (existingRoleData.concurrentRoles.indexOf(slot.roleId) !== -1);
                  if (!aAllowsB && !bAllowsA) {
                      violatesRest = true; 
                  }
              }
          }
      } else {
          // ==============================
          // ACTIVE SHIFT CONSTRAINTS
          // ==============================
          // 1. Direct overlap always flags rest violation.
          // 2. Less than 11 hours apart flags rest violation.
          if (isOverlap) {
              violatesRest = true;
          } else if (slot.startDT >= b.endDT && hoursBetweenStartEnd < 11) {
              violatesRest = true;
          } else if (b.startDT >= slot.endDT && hoursBetweenEndStart < 11) {
              violatesRest = true;
          }

          if (violatesRest) {
             if (b.type === 'office') {
                 blocksToWaive.push(b); // Waive office day (OIL)
             } else if (b.type === 'shift' || b.type === 'reserve') {
                 // Concurrency checks for overlapping shifts
                 if (isOverlap) {
                     var existingRoleData2 = roleMap[b.roleId];
                     var aAllowsB2 = (rData.concurrentRoles.indexOf(b.roleId) !== -1);
                     var bAllowsA2 = (existingRoleData2.concurrentRoles.indexOf(slot.roleId) !== -1);
                     if (aAllowsB2 || bAllowsA2) {
                         violatesRest = false; 
                     }
                 }
                 if (violatesRest) {
                     canWork = false;
                     break; 
                 }
             }
          }
      }

      if (slot.isReserve && violatesRest) {
          canWork = false;
          break;
      }
    }

    if (canWork) {
       var wk = getWeekKey(slot.startDT);
       var currentWkHrs = person.weeklyHours[wk] || 0;
       
       var waivedHours = 0;
       blocksToWaive.forEach(function(wb) { waivedHours += wb.durationH; });
       
       // Standby roles or Reserve duties carry a scheduling cost of 0 towards the 44-hour statutory cap limit
       // since working hours are generated dynamically through random activations.
       var shiftCost = (rData.type === 'Standby' || slot.isReserve) ? 0 : slot.durationH;
       
       if ((currentWkHrs - waivedHours + shiftCost) <= 44) {
           validCandidates.push({
               id: pId,
               waiveBlocks: blocksToWaive,
               shiftCost: shiftCost,
               wk: wk
           });
       }
    }
  });

  var assignedPersonName = "UNFILLED";
  var assignedPersonId = "";

  if (validCandidates.length > 0) {
    validCandidates.sort(function(a, b) { 
        return personMap[a.id].totalDutyMinutes - personMap[b.id].totalDutyMinutes; 
    });
    
    var selected = validCandidates[0];
    var pData = personMap[selected.id];

    // Only active shifts waive blocks. Reserves do not trigger this.
    selected.waiveBlocks.forEach(function(wb) {
       wb.active = false;
       pData.weeklyHours[selected.wk] -= wb.durationH;
    });

    pData.weeklyHours[selected.wk] = (pData.weeklyHours[selected.wk] || 0) + selected.shiftCost;
    
    // Reserve time isn't penalized into totalDutyMinutes until activated, 
    // but to distribute reserve duties evenly, we give a marginal sort weight bump.
    pData.totalDutyMinutes += (slot.isReserve ? 1 : (slot.durationH * 60));
    
    pData.blocks.push({
        type: slot.isReserve ? 'reserve' : 'shift',
        roleId: slot.roleId,
        startDT: slot.startDT,
        endDT: slot.endDT,
        durationH: slot.durationH,
        active: true
    });

    assignedPersonName = pData.name;
    assignedPersonId = selected.id;
  }

  newRows.push([
    Utilities.getUuid(),
    targetYM,
    slot.dateString,
    slot.roleName,
    slot.shiftName,
    slot.reqSeniorityName,
    slot.startDT.toISOString(),
    slot.endDT.toISOString(),
    assignedPersonName,
    assignedPersonId
  ]);
});

if (newRows.length > 0) {
  scheduleSheet.getRange(scheduleSheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
}
}