
export class GeminiService {
  private static API_KEY_STORAGE_KEY = 'gemini_api_key';

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    console.log('Gemini API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing Gemini API key');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Test"
                }
              ]
            }
          ]
        }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error testing Gemini API key:', error);
      return false;
    }
  }

  static async askQuestion(question: string): Promise<{ success: boolean; error?: string; data?: string }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    try {
      console.log('Making request to Gemini API');
      
      const systemPrompt = `You are an expert cryptocurrency and blockchain knowledge assistant. You have deep expertise in:
- Cryptocurrency fundamentals (Bitcoin, Ethereum, altcoins)
- Blockchain technology and consensus mechanisms
- DeFi (Decentralized Finance) protocols and strategies
- NFTs and digital assets
- Trading strategies and market analysis
- Regulatory aspects of cryptocurrency
- Smart contracts and dApps
- Staking, yield farming, and liquidity mining
- Layer 2 solutions and scaling
- Cross-chain protocols and bridges

Always provide accurate, up-to-date information. If you're unsure about recent developments, acknowledge this. Focus on educational content and avoid giving financial advice. Keep responses informative but concise.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nUser question: ${question}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        return { 
          success: false, 
          error: errorData.error?.message || `API request failed with status ${response.status}` 
        };
      }

      const data = await response.json();
      console.log('Gemini API response successful');

      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
      
      return { 
        success: true,
        data: answer 
      };
    } catch (error) {
      console.error('Error during Gemini API call:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Gemini API' 
      };
    }
  }
}
