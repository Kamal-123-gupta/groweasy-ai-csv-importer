export const exportToCSV = (dataToExport) => {
  if (!dataToExport || dataToExport.length === 0) return;
  
  const headers = [
    "created_at", "name", "email", "country_code", "mobile_without_country_code",
    "company", "city", "state", "country", "lead_owner", "crm_status", "crm_note",
    "data_source", "possession_time", "description"
  ];
  
  const csvRows = [];
  csvRows.push(headers.join(","));
  
  for (const row of dataToExport) {
    const values = headers.map(header => {
      const val = row[header] === undefined || row[header] === null ? "" : String(row[header]);
      const escaped = val.replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }
  
  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `groweasy_cleaned_leads_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
