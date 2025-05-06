const MISTRAL_API_KEY = 'Uatj8zflKOHsjjvEuit73rZvRbHSeRDn';

export async function fetchQuestion() {
  const prompt = `Génère une question à choix multiple en français sur l'écologie, avec une bonne réponse et trois mauvaises. 
  Le format des choix multiples doit forcément commencer par une lettre. De plus je veux que tu ajoutes une simple explication claire et courte pour chaque réponses
  Formate en JSON comme ceci :
{
  "question": "",
  "options": ["", "", "", ""],
  "answer": "",
  "imagePrompt": "",
  "tip": "",
  "explanation": ""
}`;

  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MISTRAL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'mistral-tiny',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });

  const data = await res.json();
  const text = data.choices[0].message.content;
  const parsed = JSON.parse(text);

  const image = `https://source.unsplash.com/600x400/?${encodeURIComponent(parsed.imagePrompt || 'nature')}`;

  return {
    question: parsed.question,
    options: parsed.options,
    answer: parsed.answer,
    image: image,
    tip: parsed.tip || 'Protéger la planète commence par des petits gestes!',
    explanation: parsed.explanation
  };
}