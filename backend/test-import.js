/**
 * Validation Script for the Express Backend
 * Tests the /api/import-batch endpoint with messy mock leads.
 * Run this script while the Express server is running on localhost:5000.
 */
const runTest = async () => {
  const url = 'http://localhost:5000/api/import-batch';

  const mockHeaders = [
    "Date Created",
    "Client Name",
    "Primary Email",
    "Contact Phone",
    "Firm",
    "City Name",
    "Remarks",
    "Origin"
  ];

  const mockBatch = [
    {
      "Date Created": "2026/05/13",
      "Client Name": "John Doe",
      "Primary Email": "john.doe@example.com; secondary@test.com",
      "Contact Phone": "+91 9876543210; +91 1111122222",
      "Firm": "GrowEasy",
      "City Name": "Mumbai",
      "Remarks": "Interested. Call tomorrow for demo.",
      "Origin": "leads_on_demand"
    },
    {
      "Date Created": "2026-05-13 14:25:30",
      "Client Name": "Sarah Johnson",
      "Primary Email": "sarah.johnson@example.com",
      "Contact Phone": "+91-9876543211",
      "Firm": "Tech Solutions",
      "City Name": "Bangalore",
      "Remarks": "Person was busy, will try again next week",
      "Origin": "meridian_tower"
    },
    {
      "Date Created": "2026/05/14",
      "Client Name": "Invalid Lead Row",
      "Primary Email": "",
      "Contact Phone": "",
      "Firm": "Unknown",
      "City Name": "Delhi",
      "Remarks": "Should be skipped because both email and phone are empty.",
      "Origin": "eden_park"
    },
    {
      "Date Created": "2026/05/15",
      "Client Name": "Priya Singh",
      "Primary Email": "priya.singh@example.com",
      "Contact Phone": "+91 9876543213",
      "Firm": "Enterprise Corp",
      "City Name": "Pune",
      "Remarks": "Deal closed, onboarding in progress",
      "Origin": "sarjapur_plots"
    }
  ];

  console.log("Sending mock batch of 4 records to backend...");
  console.log("-----------------------------------------");

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        batch: mockBatch,
        headers: mockHeaders
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server returned error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Success! Server Response received.");
    console.log("=========================================");
    console.log("NORMALIZED RECORDS:");
    console.log(JSON.stringify(result.records, null, 2));
    console.log("\nSKIPPED RECORDS:");
    console.log(JSON.stringify(result.skipped, null, 2));
    console.log("=========================================");
    
    // Check results
    if (result.records && result.records.length > 0) {
      console.log(`✅ Normalized ${result.records.length} records successfully.`);
    } else {
      console.log("❌ No records normalized.");
    }

    if (result.skipped && result.skipped.length > 0) {
      console.log(`✅ Skipped ${result.skipped.length} invalid records.`);
    } else {
      console.log("❌ No records skipped.");
    }
  } catch (error) {
    console.error("Test failed with error:", error.message);
    console.log("Ensure the backend server is running: node backend/server.js");
  }
};

runTest();
