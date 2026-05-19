var SHEET_ID = '1nIikE-sV-htx-uSgH5cGKPhWfSJJctWP5WQtcbcHi_E';

function getDbSheet() { 
  return SpreadsheetApp.openById(SHEET_ID); 
}

// ==========================================
// 1. DATABASE SETUP & MIGRATION
// ==========================================
var setupConfig = {
  "Roles": ["RoleID", "RoleName", "Is24_7", "DaysOfWeek", "RoleType", "ConcurrentRoles"],
  "Shifts": ["ShiftID", "RoleID", "ShiftName", "StartTime", "EndTime", "SeniorityReqs"],
  "Personnel": ["PersonID", "PersonName", "Seniority"],
  "Tags": ["TagID", "PersonID", "RoleID"],
  "Schedule": ["ScheduleID", "YearMonth", "Date", "RoleName", "ShiftName", "SeniorityReq", "StartDateTime", "EndDateTime", "PersonName", "PersonID"]
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
}

// RUN THIS FUNCTION ONCE TO UPGRADE EXISTING DATA
function runMigration() {
  var ss = getDbSheet();
  
  // 1. Upgrade Personnel
  var pSheet = ss.getSheetByName("Personnel");
  if (pSheet) {
     pSheet.getRange(1, 1, 1, setupConfig["Personnel"].length).setValues([setupConfig["Personnel"]]).setFontWeight("bold");
     var pData = pSheet.getDataRange().getValues();
     for (var i = 1; i < pData.length; i++) {
       if (!pData[i][2]) pSheet.getRange(i + 1, 3).setValue("Junior");
     }
  }

  // 2. Upgrade Roles
  var rSheet = ss.getSheetByName("Roles");
  if (rSheet) {
     rSheet.getRange(1, 1, 1, setupConfig["Roles"].length).setValues([setupConfig["Roles"]]).setFontWeight("bold");
     var rData = rSheet.getDataRange().getValues();
     for (var j = 1; j < rData.length; j++) {
       if (!rData[j][4]) rSheet.getRange(j + 1, 5).setValue("On-Site");
       if (!rData[j][5]) rSheet.getRange(j + 1, 6).setValue("[]");
     }
  }

  // 3. Upgrade Shifts
  var sSheet = ss.getSheetByName("Shifts");
  if (sSheet) {
     sSheet.getRange(1, 1, 1, setupConfig["Shifts"].length).setValues([setupConfig["Shifts"]]).setFontWeight("bold");
     var sData = sSheet.getDataRange().getValues();
     for (var k = 1; k < sData.length; k++) {
       if (!sData[k][5]) sSheet.getRange(k + 1, 6).setValue(JSON.stringify({Senior:0, Mid:0, Junior:1}));
     }
  }
  
  // 4. Upgrade Tags
  var tSheet = ss.getSheetByName("Tags");
  if (tSheet) {
     tSheet.getRange(1, 1, 1, setupConfig["Tags"].length).setValues([setupConfig["Tags"]]).setFontWeight("bold");
  }

  // 5. Clear and Upgrade Schedule (Column formats shifted entirely, needs wipe)
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
    personnel: getTableData("Personnel", ["id", "name", "seniority"]),
    roles: getTableData("Roles", ["id", "name", "is247", "days", "type", "concurrentRoles"]),
    shifts: getTableData("Shifts", ["id", "roleId", "name", "start", "end", "reqs"]),
    tags: getTableData("Tags", ["id", "personId", "roleId"]),
    schedule: getTableData("Schedule", ["id", "yearMonth", "date", "role", "shift", "seniorityReq", "start", "end", "personName", "personId"])
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
    else if (action === "addPerson") {
      getDbSheet().getSheetByName("Personnel").appendRow([Utilities.getUuid(), data.personName, data.seniority || 'Junior']);
    } 
    else if (action === "updatePerson") {
      updateRow("Personnel", data.id, [data.id, data.personName, data.seniority]);
    }
    else if (action === "importPersonnel") {
      var pSheet = getDbSheet().getSheetByName("Personnel");
      if (data.names && data.names.length > 0) {
        data.names.forEach(function(name) {
          pSheet.appendRow([Utilities.getUuid(), name, 'Junior']);
        });
      }
    } 
    else if (action === "deletePerson") {
      deleteRow("Personnel", data.id);
      var tSheet = getDbSheet().getSheetByName("Tags");
      var tData = tSheet.getDataRange().getValues();
      for (var i = tData.length - 1; i >= 1; i--) {
        if (tData[i][1] === data.id) tSheet.deleteRow(i + 1);
      }
    } 
    else if (action === "addRole") {
      var roleId = Utilities.getUuid();
      var daysStr = Array.isArray(data.daysOfWeek) ? data.daysOfWeek.join(",") : "";
      var concurrentStr = Array.isArray(data.concurrentRoles) ? JSON.stringify(data.concurrentRoles) : "[]";
      
      getDbSheet().getSheetByName("Roles").appendRow([
        roleId, data.roleName, data.is247, daysStr, data.roleType, concurrentStr
      ]);
      
      var sSheet = getDbSheet().getSheetByName("Shifts");
      if (data.shifts && data.shifts.length > 0) {
         data.shifts.forEach(function(s) {
           sSheet.appendRow([Utilities.getUuid(), roleId, s.name, "'" + s.start, "'" + s.end, JSON.stringify(s.reqs)]);
         });
      }
    } 
    else if (action === "deleteRole") {
      deleteRow("Roles", data.id);
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
  var roles = getTableData("Roles", ["id", "name", "is247", "days", "type", "concurrentRoles"]);
  var shifts = getTableData("Shifts", ["id", "roleId", "name", "start", "end", "reqs"]);
  var tags = getTableData("Tags", ["id", "personId", "roleId"]);
  var personnel = getTableData("Personnel", ["id", "name", "seniority"]);

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
      seniority: p.seniority || 'Junior', 
      totalDutyMinutes: 0, 
      blocks: [], 
      weeklyHours: {} 
    };

    // Pre-populate standard office hours (Mon-Fri 0800-1730)
    for (var d = 1; d <= daysInMonth; d++) {
      var cDate = new Date(year, month - 1, d);
      var dayOfWeek = cDate.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Mon-Fri
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

  // Explode shifts into individual slots based on Seniority Reqs
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
          var st = String(shift.start).substring(0, 5); 
          var et = String(shift.end).substring(0, 5);
          var startDT = new Date(dateString + "T" + st + ":00");
          var endDT = new Date(dateString + "T" + et + ":00");
          if (endDT <= startDT) endDT.setDate(endDT.getDate() + 1);
          
          var reqs = {};
          try { reqs = JSON.parse(shift.reqs || "{}"); } catch(e){}

          // Generate a slot for each required headcount per seniority level
          ['Senior', 'Mid', 'Junior'].forEach(function(lvl) {
             var count = parseInt(reqs[lvl]) || 0;
             for (var c = 0; c < count; c++) {
                allSlots.push({
                  dateString: dateString,
                  roleId: role.id,
                  roleName: role.name,
                  shiftName: shift.name,
                  startDT: startDT,
                  endDT: endDT,
                  reqSeniority: lvl,
                  durationH: (endDT.getTime() - startDT.getTime()) / 3600000
                });
             }
          });
        });
      }
    });
  }

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
      if (person.seniority !== slot.reqSeniority) return; // Must match exact seniority required

      var canWork = true;
      var blocksToWaive = []; // Office blocks that must be cancelled to enforce rest
      var overlapConcurrencyOK = true;

      for (var j = 0; j < person.blocks.length; j++) {
        var b = person.blocks[j];
        if (!b.active) continue;

        var isOverlap = (slot.startDT < b.endDT && slot.endDT > b.startDT);
        var hoursBetweenEndStart = Math.abs(b.startDT.getTime() - slot.endDT.getTime()) / 3600000;
        var hoursBetweenStartEnd = Math.abs(slot.startDT.getTime() - b.endDT.getTime()) / 3600000;
        var violatesRest = false;

        if (isOverlap) {
            violatesRest = true;
        } else if (slot.startDT >= b.endDT && hoursBetweenStartEnd < 11) {
            violatesRest = true;
        } else if (b.startDT >= slot.endDT && hoursBetweenEndStart < 11) {
            violatesRest = true;
        }

        if (violatesRest) {
           if (b.type === 'office') {
               // We can waive this office block (grant Off-In-Lieu) to make the shift possible
               blocksToWaive.push(b);
           } else if (b.type === 'shift') {
               // If overlapping another shift, check if concurrency is allowed
               if (isOverlap) {
                   var existingRoleData = roleMap[b.roleId];
                   var aAllowsB = (rData.concurrentRoles.indexOf(b.roleId) !== -1);
                   var bAllowsA = (existingRoleData.concurrentRoles.indexOf(slot.roleId) !== -1);
                   if (aAllowsB || bAllowsA) {
                       // Concurrent allowed. No violation.
                       violatesRest = false; 
                   }
               }
               
               if (violatesRest) {
                   canWork = false;
                   break; // Cannot waive another duty shift
               }
           }
        }
      }

      if (canWork) {
         // Check if this puts them over 44 hours for the week
         var wk = getWeekKey(slot.startDT);
         var currentWkHrs = person.weeklyHours[wk] || 0;
         
         // Calculate net hours if we waive office blocks
         var waivedHours = 0;
         blocksToWaive.forEach(function(wb) { waivedHours += wb.durationH; });
         
         // Standby roles only count as 50% towards working hour limit strictly for logic capacity
         var shiftCost = rData.type === 'Standby' ? (slot.durationH * 0.5) : slot.durationH;
         
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
      // Sort by least total duty minutes to ensure fairness
      validCandidates.sort(function(a, b) { 
          return personMap[a.id].totalDutyMinutes - personMap[b.id].totalDutyMinutes; 
      });
      
      var selected = validCandidates[0];
      var pData = personMap[selected.id];

      // Apply waives
      selected.waiveBlocks.forEach(function(wb) {
         wb.active = false;
         pData.weeklyHours[selected.wk] -= wb.durationH;
      });

      // Apply new shift
      pData.weeklyHours[selected.wk] = (pData.weeklyHours[selected.wk] || 0) + selected.shiftCost;
      pData.totalDutyMinutes += (slot.durationH * 60);
      pData.blocks.push({
          type: 'shift',
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
      slot.reqSeniority,
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