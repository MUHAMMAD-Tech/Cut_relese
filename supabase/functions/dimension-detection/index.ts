const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Gemini API for dimension detection
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
                  text: 'Analyze this image of a rectangular furniture detail. Detect the edges and corners. If there is a reference object (like A4 paper which is 210mm x 297mm), calculate the real dimensions of the furniture detail in millimeters. Return ONLY a JSON object with this exact format: {"width_mm": number, "height_mm": number, "confidence": number (0-1), "has_reference": boolean}. If you cannot detect dimensions accurately, set confidence to 0.',
                },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64,
                  },
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

    // Extract JSON from response
    const jsonMatch = fullText.match(/\{[^}]*"width_mm"[^}]*\}/);
    if (jsonMatch) {
      const dimensions = JSON.parse(jsonMatch[0]);
      return new Response(
        JSON.stringify(dimensions),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        width_mm: 0, 
        height_mm: 0, 
        confidence: 0, 
        has_reference: false,
        error: 'Could not detect dimensions from image'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in dimension-detection:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
