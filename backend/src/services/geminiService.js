import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Tailor the assistant to your domain
const FINANCIAL_CONTEXT = `You are SachivJi's AI Financial Advisor, an expert in Indian financial planning and government schemes.

Key Guidelines:
- Provide practical, actionable financial advice for Indian users
- Reference Indian government schemes, banks, and financial instruments
- Use rupees (₹) for all monetary examples
- Keep responses conversational but informative
- Include relevant government schemes when applicable
- Consider Indian tax laws and regulations
- Be culturally sensitive and use appropriate Hindi/English mix when natural

Focus Areas:
- Personal budgeting and expense management
- Savings accounts and fixed deposits
- Investment options (PPF, ELSS, mutual funds, etc.)
- Government schemes (PM Kisan, Ayushman Bharat, etc.)
- Tax planning and deductions
- Insurance (term life, health, vehicle)
- Home loans and personal loans
- Emergency fund planning
- Retirement planning (EPF, NPS)

Always prioritize user's financial safety and suggest conservative approaches for beginners.`;

// Strict brevity contract injected as systemInstruction
const SYSTEM_PROBE = `
${FINANCIAL_CONTEXT}

ROLE: Probe phase. You are gathering essential facts.

Brevity Rules:
- Keep the entire reply to 1–2 short sentences MAX (≈ 80–120 tokens).
- Ask exactly ONE focused follow-up question.
- No bullet lists, no headings, no emojis.
- If user already provided a detail, do not repeat it.
- If multiple data points are missing, ask for the single most important next one only.
`;

const SYSTEM_FINAL = `
${FINANCIAL_CONTEXT}

ROLE: Final phase. The user requested a full solution/report.

Output Rules:
- Provide a complete, well-structured answer with clear, actionable steps.
- Prioritize recommendations (what to do first, next) with reasoning.
- Use concrete numbers/examples when helpful.
- Mention relevant Indian schemes if applicable.
`;

// Simple detection when caller doesn't send a mode
const detectModeFromText = (text = '') => {
  const finalRe =
    /(generate|give|show|create|prepare|make)\s+(a|the)?\s*(report|solution|plan|summary|recommendation|analysis)\b|\b(final(ise|ize)?|full|detailed)\b/i;
  return finalRe.test(text) ? 'final' : 'probe';
};

// Config helpers
const configForMode = (mode = 'probe') =>
  mode === 'final'
    ? {
        systemInstruction: SYSTEM_FINAL,
        generationConfig: {
          // Allow long, structured outputs
          maxOutputTokens: 2048,
          temperature: 0.5,
          topP: 0.9,
        },
      }
    : {
        systemInstruction: SYSTEM_PROBE,
        generationConfig: {
          // Clamp hard to keep it tiny
          maxOutputTokens: 120,
          temperature: 0.4,
          topP: 0.9,
        },
      };

class GeminiService {
  constructor() {
    // keep a lightweight in-memory history per user+conversation
    this.conversationHistory = new Map();
    // default model (fast)
    this.modelName = 'gemini-1.5-flash';
  }

  /**
   * Send a message to Gemini
   * @param {string} userId
   * @param {string} message
   * @param {string|null} conversationId
   * @param {{mode?: 'probe'|'final'}=} opts
   */
  async sendMessage(userId, message, conversationId = null, opts = {}) {
    try {
      const mode = (opts.mode === 'final' || opts.mode === 'probe')
        ? opts.mode
        : detectModeFromText(message);

      const { systemInstruction, generationConfig } = configForMode(mode);

      // Build a per-call model so we can set a different systemInstruction per mode
      const model = genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction,
        generationConfig,
      });

      // Conversation history key
      const conversationKey = `${userId}_${conversationId || 'default'}`;
      let history = this.conversationHistory.get(conversationKey) || [];

      // Compose contents array (preferred format for Gemini)
      // Keep only the last 3 exchanges (~6 messages) for context
      const clipped = history.slice(-6).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.message }],
      }));

      const contents = [
        ...clipped,
        { role: 'user', parts: [{ text: message }] },
      ];

      // Generate response
      const result = await model.generateContent({ contents });
      const response = result.response.text();

      // Update conversation history (cap ~10 items)
      history.push(
        { role: 'user', message: message },
        { role: 'assistant', message: response }
      );
      if (history.length > 10) history = history.slice(-10);
      this.conversationHistory.set(conversationKey, history);

      return {
        success: true,
        response,
        conversationId: conversationId || 'default',
        mode,
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        success: false,
        response: this.getFallbackResponse(message),
        error: 'AI service temporarily unavailable',
      };
    }
  }

  /**
   * Build legacy text prompt (kept for reference; not used with contents array).
   * If you prefer text prompts, you can still call:
   *   model.generateContent({ contents: [{role:'user', parts:[{text: prompt}]}] })
   */
  buildPrompt(currentMessage, history) {
    let prompt = FINANCIAL_CONTEXT + '\n\n';

    if (history.length > 0) {
      prompt += 'Previous conversation:\n';
      history.slice(-6).forEach((msg) => {
        prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.message}\n`;
      });
      prompt += '\n';
    }

    prompt += `Current user message: ${currentMessage}\n\n`;
    prompt += "Please provide a helpful, accurate response as SachivJi's Financial Advisor:";
    return prompt;
  }

  /**
   * Shortcuts generator – forces tiny outputs and JSON only
   */
  async generateShortcuts(userId, conversationId = null, currentContext = '', _opts = {}) {
    try {
      const model = genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction:
          'Return only a valid JSON array (no preface, no prose). Each item must be 2–5 words, concise, button-ready.',
        generationConfig: {
          maxOutputTokens: 80, // small on purpose
          temperature: 0.7,
        },
      });

      const shortcutPrompt = `
Context:
${currentContext || '(none)'}

Task:
Generate 4–6 relevant, actionable quick suggestions for an Indian personal finance chat.
Keep each suggestion 2–5 words, concise, and specific.
Return JSON array ONLY, e.g. ["Mutual funds guide","PPF vs ELSS"].
`;

      const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: shortcutPrompt }] }] });
      const text = result.response.text().trim();

      // Parse JSON safely
      try {
        const parsed = JSON.parse(text);
        const arr = Array.isArray(parsed) ? parsed : [];
        const cleaned = arr
          .map((s) => String(s).trim())
          .filter(Boolean)
          .slice(0, 6);
        return { success: true, shortcuts: cleaned };
      } catch {
        // Fallback shortcuts if JSON parsing fails
        return { success: true, shortcuts: this.getFallbackShortcuts(currentContext) };
      }
    } catch (error) {
      console.error('Shortcut generation error:', error);
      return { success: false, shortcuts: this.getFallbackShortcuts(currentContext) };
    }
  }

  getFallbackResponse(message) {
    const fallbacks = [
      "I'm here to help with your financial questions! Due to technical issues, I might not have the most up-to-date information right now, but I can still provide general guidance.",
      "Let me help you with that financial question. While I'm experiencing some connectivity issues, I can share some general advice on Indian financial planning.",
      "I'm your financial advisor and I want to help! Though I'm having some technical difficulties, I can still discuss budgeting, savings, and investment basics with you."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  getFallbackShortcuts(context = '') {
    const defaultShortcuts = [
      "Monthly budgeting tips",
      "Best savings options",
      "Investment for beginners",
      "Tax-saving schemes",
      "Emergency fund planning",
      "Home loan guidance"
    ];

    if (context.toLowerCase().includes('invest')) {
      return ["Mutual funds guide", "PPF vs ELSS", "SIP planning", "Risk assessment"];
    }
    if (context.toLowerCase().includes('loan')) {
      return ["Home loan EMI", "Personal loan options", "Loan eligibility", "Interest rates"];
    }
    if (context.toLowerCase().includes('tax')) {
      return ["Section 80C options", "Tax planning tips", "ELSS funds", "HRA benefits"];
    }

    return defaultShortcuts;
  }

  clearConversation(userId, conversationId = null) {
    const conversationKey = `${userId}_${conversationId || 'default'}`;
    this.conversationHistory.delete(conversationKey);
  }

  getConversationHistory(userId, conversationId = null) {
    const conversationKey = `${userId}_${conversationId || 'default'}`;
    return this.conversationHistory.get(conversationKey) || [];
  }
}

export default new GeminiService();
