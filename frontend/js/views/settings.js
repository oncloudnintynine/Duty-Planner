// Note: Settings View handles the Setup functions and calls AdvancedSettingsView from shared.js equivalent.
// Actually, AdvancedSettingsView was defined in components/shared.js. Let's keep the handlers here.

window.handleSetupDatabase = () => {
    if(confirm("WARNING: Are you sure you want to initialize the database schema? Do this only on an empty Google Sheet.")) {
        UI.dispatch('setupDatabase');
    }
};

window.handleRunMigration = () => {
    if(confirm("WARNING: This will upgrade the schema and permanently WIPE the existing schedule data. Proceed?")) {
        UI.dispatch('runMigration');
    }
};

window.handleAddSeniorityTier = () => {
    const name = document.getElementById('newSenName').value.trim();
    const order = parseInt(document.getElementById('newSenOrder').value);
    if(!name || isNaN(order)) return UI.showToast("Provide both Name and numerical Sort Order", "error");
    UI.dispatch('addSeniorityTier', { name, order });
};

window.handleUpdateSeniorityTier = (id) => {
    const name = document.getElementById(`senName_${id}`).value.trim();
    const order = parseInt(document.getElementById(`senOrder_${id}`).value);
    if(!name || isNaN(order)) return UI.showToast("Provide both Name and numerical Sort Order", "error");
    UI.dispatch('updateSeniorityTier', { id, name, order });
};

window.handleDeleteSeniorityTier = (id) => {
    if(confirm("Delete this tier? Personnel with this tier will be unassigned. Shift headcount required for this tier will be deleted permanently.")) {
        UI.dispatch('deleteSeniorityTier', { id });
    }
};