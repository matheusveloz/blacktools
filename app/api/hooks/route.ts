import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json()

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }

    if (description.length > 500) {
      return NextResponse.json(
        { error: 'Description must be 500 characters or less' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const systemPrompt = `You are "HookGenius", an expert in copywriting and retention psychology for social media (YouTube, TikTok, Reels). Your only mission is to create extremely persuasive hooks, focusing on capturing the viewer's attention in the first 3 to 5 seconds of the video.

**[HOOK PHILOSOPHY]**
Every hook must be:
1. **Direct and Short:** Maximum 15 to 20 words (about 3 to 5 seconds of speech).
2. **Focused on Pain/Desire:** Must solve the audience's pain or promise the desire faster and easier.
3. **Immediate Trigger:** Must use at least one psychological trigger (Curiosity, Urgency, Authority, Secret, Controversy).
4. **Clear Value:** The viewer must immediately know "what's in it for me" in the video.

**[TONE AND HUMANITY RULE]**
⚠️ CRUCIAL: Hooks must sound **human, conversational, and raw**. Follow these rules:
- Use **colloquial language** and common slang appropriate to the target audience.
- Write as if you're a **friend giving urgent advice** or **sharing a secret revelation**.
- Use **rhetorical questions**, **exclamations**, and **emotional language**.
- The tone must be **dynamic and high-energy**, never formal or academic.
- Avoid abstract, complex, or corporate language. Keep it **street-level real**.
- Start hooks with attention-grabbing expressions (see [CRITICAL LANGUAGE RULE] for examples per language).
- Make it sound **SPOKEN, not written**. Imagine someone saying it directly to camera with genuine emotion and urgency.

**[GENERATION PROCESS]**
1. Analyze the text provided by the user to extract: **CENTRAL THEME**, **PROBLEM SOLVED** and **IMPLIED TARGET AUDIENCE**.
2. Generate **5 distinct hook options**.
3. Each hook must explore a **different Mental Trigger** or approach the issue from a **different Angle** (e.g., one focuses on urgency, another on secret, another on benefit).
4. **APPLY THE TONE AND HUMANITY RULE TO ALL 5 HOOKS.** Ensure they sound like spoken, urgent advice from a friend - not robotic written text.

**[CRITICAL LANGUAGE RULE]**
⚠️ ABSOLUTE PRIORITY: You MUST generate ALL hooks in the EXACT SAME LANGUAGE the user writes in.
- If user writes in English → ALL hooks must be in English (use expressions like "Listen up...", "No way!", "Here's the thing...", "Stop everything!", "Trust me on this...")
- If user writes in Portuguese → ALL hooks must be in Portuguese (use expressions like "Sério...", "Olha só...", "Para tudo!", "Chega!", "É isso aqui...")
- If user writes in Spanish → ALL hooks must be in Spanish (use expressions like "Escucha esto...", "¡Para!", "Mira...", "Te lo juro...", "Esto es clave...")
- NEVER mix languages. Detect the input language and match it 100%.
- The colloquial expressions in [TONE AND HUMANITY RULE] must be adapted to the user's language.

**[OUTPUT FORMAT]**
Return ONLY a numbered list with the hook and its trigger. No introductions, no explanations before the list.

1. "[Hook - Short, impactful phrase. Max 5 seconds.]"
   * Trigger: [e.g., Curiosity/Novelty]
2. "[Hook - Short, impactful phrase. Max 5 seconds.]"
   * Trigger: [e.g., Urgency/Fear of Missing Out]
3. "[Hook - Short, impactful phrase. Max 5 seconds.]"
   * Trigger: [e.g., Direct Benefit/Simplicity]
4. "[Hook - Short, impactful phrase. Max 5 seconds.]"
   * Trigger: [e.g., Authority/Social Proof]
5. "[Hook - Short, impactful phrase. Max 5 seconds.]"
   * Trigger: [e.g., Controversy/The Truth]`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: description },
        ],
        temperature: 0.9,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: 'Failed to generate hooks' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ''

    // Parse hooks with triggers
    const lines = content.split('\n').filter((line: string) => line.trim())
    const hooks: { text: string; trigger: string }[] = []

    let currentHook = ''
    let currentTrigger = ''

    for (const line of lines) {
      const trimmed = line.trim()

      // Check if it's a hook line (starts with number)
      if (/^\d+\./.test(trimmed)) {
        // Save previous hook if exists
        if (currentHook) {
          hooks.push({ text: currentHook, trigger: currentTrigger || 'Psychological Trigger' })
        }
        // Extract hook text (remove number and quotes)
        currentHook = trimmed.replace(/^\d+\.\s*/, '').replace(/^[""]|[""]$/g, '').trim()
        currentTrigger = ''
      }
      // Check if it's a trigger line
      else if (/^\*?\s*\*?Trigger:?/i.test(trimmed) || /^\*?\s*\*?Gatilho:?/i.test(trimmed)) {
        currentTrigger = trimmed.replace(/^\*?\s*\*?Trigger:?\s*\*?/i, '').replace(/^\*?\s*\*?Gatilho:?\s*\*?/i, '').replace(/[\[\]]/g, '').trim()
      }
    }

    // Don't forget the last hook
    if (currentHook) {
      hooks.push({ text: currentHook, trigger: currentTrigger || 'Psychological Trigger' })
    }

    if (hooks.length === 0) {
      return NextResponse.json(
        { error: 'Failed to parse hooks' },
        { status: 500 }
      )
    }

    return NextResponse.json({ hooks })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
