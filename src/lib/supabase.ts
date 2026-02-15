import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xkmrlcrhzcugzkubbxha.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrbXJsY3JoemN1Z3prdWJieGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTIxNDksImV4cCI6MjA4NTk2ODE0OX0.GwWITMjzdrd6WYYoPps7ohyXjeVUdmN8dxxyXusXq7g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
