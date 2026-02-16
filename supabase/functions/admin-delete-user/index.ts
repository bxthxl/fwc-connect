import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    // Use getUser() for reliable auth validation
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const callerAuthUid = user.id;
    const { data: isAdmin } = await supabase.rpc('is_admin', { auth_uid: callerAuthUid });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers: corsHeaders });
    }

    const { auth_user_id } = await req.json();
    if (!auth_user_id) {
      return new Response(JSON.stringify({ error: 'auth_user_id is required' }), { status: 400, headers: corsHeaders });
    }

    if (auth_user_id === callerAuthUid) {
      return new Response(JSON.stringify({ error: 'Cannot delete your own account' }), { status: 400, headers: corsHeaders });
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Look up the profile id from auth_user_id
    const { data: profile, error: profileLookupError } = await adminClient
      .from('profiles')
      .select('id')
      .eq('auth_user_id', auth_user_id)
      .maybeSingle();

    if (profileLookupError) {
      console.error('Profile lookup error:', profileLookupError);
      return new Response(JSON.stringify({ error: 'Failed to look up profile' }), { status: 500, headers: corsHeaders });
    }

    if (profile) {
      const profileId = profile.id;

      // Delete all related records before deleting the profile
      const relatedDeletes = [
        adminClient.from('notifications').delete().eq('user_id', profileId),
        adminClient.from('member_church_roles').delete().eq('profile_id', profileId),
        adminClient.from('user_roles').delete().eq('user_id', profileId),
        adminClient.from('attendance').delete().eq('user_id', profileId),
        adminClient.from('event_bgvs').delete().eq('member_id', profileId),
        adminClient.from('discussion_replies').delete().eq('created_by', profileId),
      ];

      const results = await Promise.all(relatedDeletes);
      for (const r of results) {
        if (r.error) console.error('Related record deletion error:', r.error);
      }

      // Delete discussion topics (after replies are gone)
      const { error: topicsError } = await adminClient
        .from('discussion_topics')
        .delete()
        .eq('created_by', profileId);
      if (topicsError) console.error('Discussion topics deletion error:', topicsError);

      // Delete the profile
      const { error: profileError } = await adminClient
        .from('profiles')
        .delete()
        .eq('id', profileId);
      if (profileError) {
        console.error('Profile deletion error:', profileError);
        return new Response(JSON.stringify({ error: 'Failed to delete profile: ' + profileError.message }), { status: 500, headers: corsHeaders });
      }
    }

    // Delete the auth user
    const { error: authError } = await adminClient.auth.admin.deleteUser(auth_user_id);
    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), { status: 400, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
