// Supabase Edge Function "rote-flagge-muster" (Kopfkiste-Projekt rozigbnbifcbsiybarzm, EU).
// NOCH NICHT HOCHGELADEN. Hochladen (braucht SUPABASE_ACCESS_TOKEN):
//   npx supabase functions deploy rote-flagge-muster --project-ref rozigbnbifcbsiybarzm --no-verify-jwt --use-api
// Secret ANTHROPIC_API_KEY ist im Projekt schon gesetzt (Kopfkiste). Nichts wird gespeichert.
// Tageslimit: 10 Berichte pro Gerät (Tabelle rote_flagge_nutzung, Migration fehlt noch, siehe darmscore_nutzung).

const MODELL = 'claude-haiku-5-5';

const ANLEITUNG = `Du bist die ruhige Stimme der App "Rote Flagge", eines privaten Beziehungstagebuchs.
Du bekommst die Tagebucheinträge einer Person aus den letzten 4 Wochen über jemanden, den sie kennenlernt, mit dem es kompliziert ist, mit dem sie zusammen ist oder von dem sie getrennt ist.
Deine Aufgabe: Muster im VERHALTEN sichtbar machen, warm und klar, auf Deutsch, ohne Gedankenstriche.
Regeln:
- Beschreibe nur Verhalten und Abläufe ("Nach Nähe kommt oft Funkstille"). Nie die Person bewerten. Keine Diagnosen oder Etiketten (nie Narzisst, toxisch, Störung, Trauma, Gaslighting als Diagnose).
- Kein Rat zu trennen oder zu bleiben. Keine Therapie-Versprechen.
- Glaub der schreibenden Person. Ihr Gefühl ist ein Hinweis, kein Fehler.
- Wenn ein Eintrag Gewalt, Drohung, Angst um das eigene Leben oder Suizidgedanken enthält: hilfeHinweis = true.
- Zitiere in sagtTut nur sinngemäß aus den Einträgen, höchstens 12 Wörter je Feld, ohne Namen.
Antworte NUR mit JSON: {"kernsatz": string (max 20 Wörter), "muster": [{"name": string (2-4 Wörter), "anzahl": number, "satz": string (max 14 Wörter)}] (max 4), "sagtTut": [{"sagt": string, "tut": string}] (max 3), "hilfeHinweis": boolean}`;

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Nur POST', { status: 405 });
  try {
    const { eintraege } = await req.json();
    if (!Array.isArray(eintraege) || eintraege.length === 0) return Response.json({ fehler: 'keine Einträge' }, { status: 400 });
    const text = eintraege
      .slice(0, 40)
      .map((e: { tag: string; text: string; gefuehle: string[]; waerme: string | null; kategorien: string[] }) => `${e.tag} | Wärme: ${e.waerme ?? '-'} | Gefühl danach: ${(e.gefuehle ?? []).join(', ')} | ${String(e.text ?? '').slice(0, 1200)}`)
      .join('\n');
    const antwort = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODELL, max_tokens: 700, system: ANLEITUNG, messages: [{ role: 'user', content: text }] }),
    });
    if (!antwort.ok) return Response.json({ fehler: 'ki' }, { status: 502 });
    const daten = await antwort.json();
    const roh = daten.content?.[0]?.text ?? '{}';
    const json = JSON.parse(roh.slice(roh.indexOf('{'), roh.lastIndexOf('}') + 1));
    return Response.json(json);
  } catch {
    return Response.json({ fehler: 'unbekannt' }, { status: 500 });
  }
});
