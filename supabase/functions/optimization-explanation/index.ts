const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      materialName, 
      sheetsRequired, 
      wastePercentage, 
      detailsCount,
      totalDetailsCount 
    } = await req.json();

    // Call Gemini API for Uzbek explanation
    const geminiResponse = await fetch(
      'https://api-integrations.appmedo.com/app-8wsw55vit5oh/api-pLVzJnE6NKDL/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Generate a clear, professional explanation in Uzbek language for furniture workshop operators. Use simple, workshop-friendly language. 

Material: ${materialName}
Sheets required: ${sheetsRequired}
Waste percentage: ${wastePercentage}%
Number of different details: ${detailsCount}
Total details count: ${totalDetailsCount}

Explain:
1. Which material sheet was selected and why
2. How many sheets are needed
3. The waste percentage
4. Brief optimization summary

Keep it concise (2-3 sentences). Use professional but simple Uzbek language suitable for workshop environment.`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.statusText}`);
    }

    const reader = geminiResponse.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                fullText += data.candidates[0].content.parts[0].text;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ explanation: fullText.trim() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in optimization-explanation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
