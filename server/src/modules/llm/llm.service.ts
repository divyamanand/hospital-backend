import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  /**
   * Call external LLM to infer required specialties for given issues.
   * - `issues`: array of plain text issue descriptions
   * - `specialties`: array of objects { id, name } available in DB
   * Returns array of specialty names (subset of provided specialties.names)
   */
  async inferSpecialties(issues: string[], specialties: { id: string; name: string }[]): Promise<string[]> {
    if (!issues || !issues.length) return [];
    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) {
      this.logger.warn('LLM_API_KEY not set — falling back to simple heuristic');
      return this.heuristicMatch(issues, specialties);
    }

    const names = specialties.map((s) => s.name);
    const prompt = `You are a medical triage assistant. Given the following patient issues:\n\n${issues
      .map((i) => `- ${i}`)
      .join('\n')}\n\nAnd the available specialties: ${names.join(', ')}\n\nReturn a JSON array (only) of specialty names, taken from the available specialties, that are most relevant to address the issues. Order by relevance, highest first.`;

    try {
      // Use fetch (Node18+). If not available at runtime this will throw.
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.LLM_MODEL ?? 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.0,
        }),
      });
      const j = await res.json();
      const txt = j?.choices?.[0]?.message?.content || j?.choices?.[0]?.text || '';
      // Attempt to extract a JSON array from the response
      const m = txt.match(/\[([\s\S]*)\]/m);
      if (m) {
        const arrText = '[' + m[1] + ']';
        try {
          const parsed = JSON.parse(arrText);
          if (Array.isArray(parsed)) {
            // Filter to only provided specialties
            const lowerSet = new Set(names.map((n) => n.toLowerCase()));
            return parsed
              .map((p: any) => (typeof p === 'string' ? p.trim() : ''))
              .filter((s: string) => !!s && lowerSet.has(s.toLowerCase()))
              .map((s: string) => {
                // return canonical form from specialties list
                const found = specialties.find((sp) => sp.name.toLowerCase() === s.toLowerCase());
                return found ? found.name : s;
              });
          }
        } catch (e) {
          this.logger.warn('Failed to parse LLM response JSON, falling back to heuristic', e as any);
        }
      }
      // fallback heuristics
      return this.heuristicMatch(issues, specialties);
    } catch (err) {
      this.logger.warn('LLM call failed — using heuristic match', err as any);
      return this.heuristicMatch(issues, specialties);
    }
  }

  private heuristicMatch(issues: string[], specialties: { id: string; name: string }[]) {
    const out: string[] = [];
    const text = issues.join(' ').toLowerCase();
    for (const s of specialties) {
      const name = s.name.toLowerCase();
      // simple token match
      if (text.includes(name) || name.split(/\s+/).some((t) => t && text.includes(t))) {
        out.push(s.name);
      }
    }
    // if none matched, return the top 3 specialties (conservative)
    if (!out.length) return specialties.slice(0, 3).map((s) => s.name);
    return Array.from(new Set(out));
  }
}
