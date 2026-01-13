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
        JSON.stringify({ error: 'Rasm ma\'lumoti talab qilinadi' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enhanced prompt for better dimension detection
    const prompt = `Siz mebel ishlab chiqarish uchun o'lchamlarni aniqlaydigan AI assistantsiz.

Ushbu rasmni tahlil qiling va quyidagi vazifalarni bajaring:

1. RASM MAZMUNI:
   - Rasmda nima ko'rsatilgan? (mebel detali, chizma, qog'oz, boshqa)
   - Agar chizma yoki yozuvlar bo'lsa, ularni o'qing

2. O'LCHAMLARNI ANIQLASH:
   - Rasmda ko'rsatilgan o'lchamlarni toping (mm, sm yoki boshqa birlikda)
   - Agar chizmada raqamlar yozilgan bo'lsa, ularni o'qing
   - Agar A4 qog'oz yoki boshqa ma'lumot ob'ekt bo'lsa, uni hisobga oling (A4 = 210mm x 297mm)
   - Kenglik (width) va balandlik (height) ni aniqlang

3. NATIJA:
   Faqat JSON formatida javob bering:
   {
     "width_mm": raqam (millimetrda),
     "height_mm": raqam (millimetrda),
     "confidence": raqam (0 dan 1 gacha, masalan 0.9),
     "has_reference": true yoki false,
     "detected_text": "rasmda ko'rilgan matn yoki raqamlar",
     "notes": "qo'shimcha izohlar"
   }

MUHIM: Agar o'lchamlarni aniqlay olmasangiz, width_mm va height_mm ni 0 qilib, confidence ni 0 qiling.

Endi rasmni tahlil qiling:`;

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
                  text: prompt,
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
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API xatosi: ${geminiResponse.statusText}`);
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

    console.log('Gemini full response:', fullText);

    // Try to extract JSON from response (handle markdown code blocks)
    let jsonMatch = fullText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (!jsonMatch) {
      jsonMatch = fullText.match(/\{[\s\S]*?"width_mm"[\s\S]*?\}/);
    }
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const dimensions = JSON.parse(jsonStr);
      
      // Ensure all required fields exist
      const result = {
        width_mm: dimensions.width_mm || 0,
        height_mm: dimensions.height_mm || 0,
        confidence: dimensions.confidence || 0,
        has_reference: dimensions.has_reference || false,
        detected_text: dimensions.detected_text || '',
        notes: dimensions.notes || '',
      };
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no JSON found, return error with full text for debugging
    return new Response(
      JSON.stringify({ 
        width_mm: 0, 
        height_mm: 0, 
        confidence: 0, 
        has_reference: false,
        detected_text: '',
        notes: 'Rasmdan o\'lchamlarni aniqlab bo\'lmadi',
        debug_response: fullText.substring(0, 500),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('dimension-detection xatosi:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        width_mm: 0,
        height_mm: 0,
        confidence: 0,
        has_reference: false,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
