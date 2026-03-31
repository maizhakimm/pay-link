import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ciaztzqoaxutoftqwiud.supabase.co'
const supabaseAnonKey = 'sb_publishable_mcsLahm_WOTQRU7PU1aWMQ_INqaQZGC'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
