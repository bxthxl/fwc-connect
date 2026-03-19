import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { InviteEmail } from '../_shared/email-templates/invite.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SITE_NAME = "choir-circle"
const SENDER_DOMAIN = "notify.fwcconnect.com"
const FROM_DOMAIN = "notify.fwcconnect.com"
const ROOT_DOMAIN = "fwcconnect.com"

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify caller
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user: caller }, error: userError } = await supabase.auth.getUser()
    if (userError || !caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const callerAuthId = caller.id

    // Get caller's profile name
    const { data: callerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('auth_user_id', callerAuthId)
      .maybeSingle()

    if (profileError || !callerProfile) {
      return new Response(JSON.stringify({ error: 'Could not find your profile' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { email } = await req.json()
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Use admin client to generate invite link
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const origin = req.headers.get('origin') || `https://${ROOT_DOMAIN}`

    // Generate the invite link
    // Try invite first; if user already exists, fall back to magic link
    let linkData, linkError
    ;({ data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'invite',
      email,
      options: { redirectTo: `${origin}/auth` },
    }))

    if (linkError?.message?.includes('already been registered')) {
      ;({ data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo: `${origin}/auth` },
      }))
    }

    if (linkError) {
      return new Response(JSON.stringify({ error: linkError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const confirmationUrl = linkData.properties?.action_link || ''

    // Render invite email with inviter's name
    const html = await renderAsync(
      React.createElement(InviteEmail, {
        siteName: SITE_NAME,
        siteUrl: `https://${ROOT_DOMAIN}`,
        confirmationUrl,
        inviterName: callerProfile.full_name,
      })
    )
    const text = await renderAsync(
      React.createElement(InviteEmail, {
        siteName: SITE_NAME,
        siteUrl: `https://${ROOT_DOMAIN}`,
        confirmationUrl,
        inviterName: callerProfile.full_name,
      }),
      { plainText: true }
    )

    // Enqueue the email
    const messageId = crypto.randomUUID()

    await adminClient.from('email_send_log').insert({
      message_id: messageId,
      template_name: 'invite',
      recipient_email: email,
      status: 'pending',
      metadata: { inviter_name: callerProfile.full_name },
    })

    const { error: enqueueError } = await adminClient.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        run_id: crypto.randomUUID(),
        message_id: messageId,
        to: email,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject: `${callerProfile.full_name} has invited you to join FWC Worship Team`,
        html,
        text,
        purpose: 'transactional',
        label: 'invite',
        queued_at: new Date().toISOString(),
      },
    })

    if (enqueueError) {
      console.error('Failed to enqueue invite email', enqueueError)
      return new Response(JSON.stringify({ error: 'Failed to send invite email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Invite error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})