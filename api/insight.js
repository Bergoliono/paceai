export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { perfil, treino, feedback } = req.body;

    const prompt = `Você é um treinador de endurance experiente. Perfil: ${perfil.nome}, ${perfil.idade} anos. Treino: ${treino}. Feedback: ${feedback}. Dê um insight curto (3-4 frases) sobre o treino.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: 'Erro da Anthropic', detalhe: data });
    }

    const texto = data.content[0].text;
    res.status(200).json({ insight: texto });

  } catch (error) {
    res.status(500).json({ error: 'Erro interno', detalhe: error.message, temChave: !!process.env.ANTHROPIC_API_KEY });
  }
}