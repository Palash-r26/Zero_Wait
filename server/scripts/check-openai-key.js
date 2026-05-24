/**
 * Validates OPENAI_API_KEY for Voice Agent (Realtime client_secrets).
 * Usage (from server/): node scripts/check-openai-key.js
 * Requires OPENAI_API_KEY in .env — never commit real keys.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const key = process.env.OPENAI_API_KEY;

function mask(k) {
  if (!k || k.length < 12) return '(missing or too short)';
  return `${k.slice(0, 7)}…${k.slice(-4)}`;
}

async function main() {
  console.log('\nOpenAI Realtime key check\n');

  if (!key || key === 'your_openai_api_key_here') {
    console.log('❌ OPENAI_API_KEY is not set in server/.env');
    console.log('   Voice Agent will not work until you add a project API key.\n');
    process.exit(1);
  }

  console.log(`   Key prefix: ${key.slice(0, 12)}… (${mask(key)})`);

  if (key.startsWith('sk-admin-')) {
    console.log('\n⚠️  This looks like an ADMIN API key (sk-admin-…).');
    console.log('   Admin keys manage org/projects — they do NOT work for Realtime/voice.');
    console.log('   Create a project key at https://platform.openai.com/api-keys');
    console.log('   (starts with sk-proj-…) and set that as OPENAI_API_KEY.\n');
  } else if (!key.startsWith('sk-proj-') && !key.startsWith('sk-')) {
    console.log('\n⚠️  Unusual key format — expected sk-proj-… or sk-…\n');
  }

  console.log('   Testing POST /v1/realtime/client_secrets …\n');

  try {
    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: 'gpt-4o-realtime-preview-2024-12-17',
          instructions: 'Test session for Zero-Wait kiosk.',
        },
      }),
    });

    const body = await response.text();
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      parsed = { raw: body.slice(0, 200) };
    }

    if (response.ok) {
      const secret = parsed?.client_secret?.value || parsed?.value;
      console.log('✅ Realtime API accepted this key.');
      console.log(`   Ephemeral token received: ${secret ? `${String(secret).slice(0, 8)}…` : 'yes'}\n`);
      process.exit(0);
    }

    console.log(`❌ OpenAI returned HTTP ${response.status}`);
    if (parsed?.error?.message) console.log(`   ${parsed.error.message}`);
    else if (parsed?.error) console.log(`   ${JSON.stringify(parsed.error)}`);
    else console.log(`   ${body.slice(0, 300)}`);

    if (response.status === 401) {
      console.log('\n   → Key invalid, revoked, or wrong type (use sk-proj- project key).');
    }
    if (response.status === 403) {
      console.log('\n   → Key valid but Realtime may not be enabled for your org/billing.');
    }
    console.log('');
    process.exit(1);
  } catch (err) {
    console.log('❌ Network error:', err.message, '\n');
    process.exit(1);
  }
}

main();
