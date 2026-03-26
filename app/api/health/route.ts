// Diagnostic file to help debug deployment
// Delete this file before final deployment

console.log('[v0-diagnostic] Environment Variables Check:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');

export const config = {
  runtime: 'nodejs',
}

export default function handler(req: any, res: any) {
  return res.status(200).json({
    status: 'ok',
    env: {
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  });
}
