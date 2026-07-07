const crypto = require('crypto');
const Papa = require('papaparse');
const { readLeads, writeLeads } = require('../config/db');
const { processBatchWithGroq } = require('../services/groqService');

// 1. Ingest/upload raw CSV
async function uploadCSV(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const csvContent = req.file.buffer.toString('utf8');
    const parseResult = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false
    });

    if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
      return res.status(400).json({ error: "Failed to parse CSV file.", details: parseResult.errors });
    }

    res.json({
      headers: parseResult.meta.fields,
      rows: parseResult.data
    });
  } catch (error) {
    console.error("CSV Upload failed:", error);
    res.status(500).json({ error: "Internal Server Error during upload." });
  }
}

// 2. Process incremental batch
async function importBatch(req, res) {
  try {
    const { batch, headers } = req.body;
    if (!batch || !Array.isArray(batch)) {
      return res.status(400).json({ error: "Batch must be an array of records." });
    }
    if (!headers || !Array.isArray(headers)) {
      return res.status(400).json({ error: "Headers list is required." });
    }

    if (batch.length === 0) {
      return res.json({ records: [], skipped: [] });
    }

    const result = await processBatchWithGroq(batch, headers);
    
    // Assign unique IDs
    const recordsWithId = (result.records || []).map(rec => ({
      id: crypto.randomUUID(),
      ...rec
    }));

    if (recordsWithId.length > 0) {
      const existingLeads = readLeads();
      existingLeads.push(...recordsWithId);
      writeLeads(existingLeads);
    }

    res.json({
      records: recordsWithId,
      skipped: result.skipped || []
    });
  } catch (error) {
    console.error("Batch import failed:", error);
    res.status(500).json({ error: error.message || "Failed to process batch." });
  }
}

// 3. Process complete import loop
async function importAll(req, res) {
  try {
    const { rows, headers, batchSize = 30 } = req.body;
    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ error: "Rows must be an array of records." });
    }
    if (!headers || !Array.isArray(headers)) {
      return res.status(400).json({ error: "Headers list is required." });
    }

    const allRecords = [];
    const allSkipped = [];

    // Process batches sequentially to prevent rate limiting
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(rows.length / batchSize)}...`);
      try {
        const batchResult = await processBatchWithGroq(batch, headers);
        allRecords.push(...(batchResult.records || []));
        allSkipped.push(...(batchResult.skipped || []));
      } catch (batchError) {
        console.error(`Batch starting at index ${i} failed after retries:`, batchError);
        batch.forEach(row => {
          allSkipped.push({
            reason: `Batch extraction failed: ${batchError.message}`,
            original_record: row
          });
        });
      }
    }

    const recordsWithId = allRecords.map(rec => ({
      id: crypto.randomUUID(),
      ...rec
    }));

    if (recordsWithId.length > 0) {
      const existingLeads = readLeads();
      existingLeads.push(...recordsWithId);
      writeLeads(existingLeads);
    }

    res.json({
      records: recordsWithId,
      skipped: allSkipped
    });
  } catch (error) {
    console.error("Full CSV import failed:", error);
    res.status(500).json({ error: error.message || "Failed to import CSV records." });
  }
}

// 4. Retrieve stored leads
function getLeads(req, res) {
  try {
    const leads = readLeads();
    res.json(leads);
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    res.status(500).json({ error: "Failed to fetch leads from database." });
  }
}

// 5. Update existing lead
function updateLead(req, res) {
  try {
    const { id } = req.params;
    const updatedLeadData = req.body;
    
    let leads = readLeads();
    const index = leads.findIndex(lead => lead.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: "Lead not found." });
    }
    
    leads[index] = {
      ...leads[index],
      ...updatedLeadData,
      id: id
    };
    
    writeLeads(leads);
    res.json(leads[index]);
  } catch (error) {
    console.error("Failed to update lead:", error);
    res.status(500).json({ error: "Failed to update lead." });
  }
}

// 6. Delete lead
function deleteLead(req, res) {
  try {
    const { id } = req.params;
    
    let leads = readLeads();
    const filteredLeads = leads.filter(lead => lead.id !== id);
    
    if (leads.length === filteredLeads.length) {
      return res.status(404).json({ error: "Lead not found." });
    }
    
    writeLeads(filteredLeads);
    res.json({ success: true, message: "Lead deleted successfully." });
  } catch (error) {
    console.error("Failed to delete lead:", error);
    res.status(500).json({ error: "Failed to delete lead." });
  }
}

module.exports = {
  uploadCSV,
  importBatch,
  importAll,
  getLeads,
  updateLead,
  deleteLead
};
