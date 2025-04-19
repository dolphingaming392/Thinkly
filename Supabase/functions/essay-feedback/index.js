import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { essay } = await req.json();

    // Prepare the prompt for essay analysis
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are an expert writing tutor and essay grader. Analyze the essay and provide detailed feedback in the following categories:
          1. Grammar and mechanics
          2. Coherence and organization
          3. Style and voice
          
          For each category:
          - Provide a score out of 10
          - List specific suggestions for improvement
          - Be constructive and encouraging
          
          Format your response as a JSON object with the following structure:
          {
            "grammar": {
              "score": number,
              "suggestions": string[]
            },
            "coherence": {
              "score": number,
              "suggestions": string[]
            },
            "style": {
              "score": number,
              "suggestions": string[]
            }
          }`
      },
      {
        role: 'user',
        content: essay
      }
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const feedbackText = data.choices[0]?.message?.content;
    
    // Parse the JSON response from GPT
    const feedback = JSON.parse(feedbackText);

    return new Response(
      JSON.stringify(feedback),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred while analyzing the essay. Please try again later.',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
