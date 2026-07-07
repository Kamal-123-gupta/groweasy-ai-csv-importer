const fs = require('fs');
const path = require('path');

// Target leads.json in the backend/data directory
const LEADS_FILE_PATH = path.join(__dirname, '..', 'data', 'leads.json');

// Initialize database file and folders if they don't exist
function initDatabase() {
  const dir = path.dirname(LEADS_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LEADS_FILE_PATH)) {
    fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify([], null, 2), 'utf8');
  }
}

initDatabase();

// Read leads array from database
function readLeads() {
  try {
    const data = fs.readFileSync(LEADS_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read leads database:", error);
    return [];
  }
}

// Write leads array back to database
function writeLeads(leads) {
  try {
    fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(leads, null, 2), 'utf8');
  } catch (error) {
    console.error("Failed to write leads database:", error);
  }
}

module.exports = {
  readLeads,
  writeLeads
};
