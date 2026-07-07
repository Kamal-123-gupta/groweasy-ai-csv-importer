const { Groq } = require('groq-sdk');
const { z } = require('zod');

// Ensure GROQ_API_KEY is defined
if (!process.env.GROQ_API_KEY) {
  console.warn("WARNING: GROQ_API_KEY environment variable is not defined.");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

// Zod validation schema for LLM outputs
const LeadRecordSchema = z.object({
  created_at: z.string().default(""),
  name: z.string().default(""),
  email: z.string().default(""),
  country_code: z.string().default(""),
  mobile_without_country_code: z.string().default(""),
  company: z.string().default(""),
  city: z.string().default(""),
  state: z.string().default(""),
  country: z.string().default(""),
  lead_owner: z.string().default(""),
  crm_status: z.enum(["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE", ""]).catch(""),
  crm_note: z.string().default(""),
  data_source: z.enum(["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots", ""]).catch(""),
  possession_time: z.string().default(""),
  description: z.string().default("")
});

const LLMResponseSchema = z.object({
  records: z.array(LeadRecordSchema).default([]),
  skipped: z.array(z.object({
    reason: z.string().default("Missing required fields"),
    original_record: z.record(z.any()).default({})
  })).default([])
});

// Helper for LLM Batch processing with Exponential Backoff retry
async function processBatchWithGroq(batch, headers, attempt = 1) {
  const maxAttempts = 3;
  const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
  
  try {
    const prompt = `You are an expert CRM Data Extraction Engine. Your job is to convert arbitrary lead records into the GrowEasy CRM format.
Analyze the input records semantically.

OUTPUT SCHEMA:
Return ONLY a valid JSON object matching this schema. No explanation, no markdown:
{
  "records": [
    {
      "created_at": "string (ISO format YYYY-MM-DDTHH:mm:ssZ or empty string)",
      "name": "string (Lead full name or empty)",
      "email": "string (First/primary email or empty)",
      "country_code": "string (e.g. +91, empty if not found)",
      "mobile_without_country_code": "string (First mobile number with no spaces, dashes, brackets, country code removed)",
      "company": "string (Company name or empty)",
      "city": "string (City or empty)",
      "state": "string (State or empty)",
      "country": "string (Country or empty)",
      "lead_owner": "string (Lead owner or empty)",
      "crm_status": "GOOD_LEAD_FOLLOW_UP | DID_NOT_CONNECT | BAD_LEAD | SALE_DONE | empty string",
      "crm_note": "string (Additional notes, including extra emails, extra phones, and any unmapped fields)",
      "data_source": "leads_on_demand | meridian_tower | eden_park | varah_swamy | sarjapur_plots | empty string",
      "possession_time": "string (Property possession time or empty)",
      "description": "string (Additional description or empty)"
    }
  ],
  "skipped": [
    {
      "reason": "string (Reason for skipping)",
      "original_record": { ... } // exact copy of input row object
    }
  ]
}

RULES:
1. FIELD MAPPING:
   - name: Infer from client, full name, name, contact name, owner, etc.
   - email: First email. If multiple, append remaining to crm_note.
   - mobile_without_country_code & country_code: Parse phone number. Extract country code (e.g. +91, +1). Remove dashes, spaces, brackets. If multiple, use first; others go to crm_note.
   - crm_status: Allowed: GOOD_LEAD_FOLLOW_UP (Interested, demo requested, call tomorrow), DID_NOT_CONNECT (Busy, switched off, didn't answer), BAD_LEAD (Not interested, wrong number, duplicate, spam), SALE_DONE (Purchased, paid, closed). If none match, leave empty.
   - data_source: Allowed: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots. Infer only if highly confident, otherwise empty string.
   - created_at: Convert to ISO format (e.g. 2026-05-13T14:20:48Z). Must be parseable by JavaScript's 'new Date(created_at)'.
   - crm_note: Store comments, remarks, extra emails, extra phones, and any other unmapped columns.
2. SKIP RULE: Skip record if BOTH email AND mobile number are missing. Add to 'skipped' array with reason.
3. CONFIDENCE: Only populate fields when confidence >80%, otherwise leave blank. Never hallucinate.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: prompt },
        {
          role: "user",
          content: JSON.stringify({
            detected_headers: headers,
            records_to_process: batch
          })
        }
      ],
      temperature: 0.1
    });

    const content = response.choices[0].message.content.trim();
    const parsed = JSON.parse(content);
    
    // Validate output with Zod
    const validated = LLMResponseSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.error(`Attempt ${attempt} failed. Error:`, error.message);
    if (attempt < maxAttempts) {
      console.log(`Retrying batch in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return processBatchWithGroq(batch, headers, attempt + 1);
    }
    throw error;
  }
}

module.exports = {
  processBatchWithGroq
};
