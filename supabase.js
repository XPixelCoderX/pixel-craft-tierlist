import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://iphmjgrhkrhubgqqpgac.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwaG1qZ3Joa3JodWJncXFwZ2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwOTkyOTEsImV4cCI6MjA5MTY3NTI5MX0.iQ4kpMqVEcPxZdkTYXlmP6f8r6M8GkkJtSzXB28c0oY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
