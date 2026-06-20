export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { perfil, treino, feedback } = req.body;

  const prompt = `Você é um treinador de endurance experiente (ciclismo, corrida, triathlon, trail, natação, MTB).

Perfil do atleta:
- Nome: ${perfil.nome}
- Idade: ${perfil.idade}
- FC repouso: ${perfil.fcrep} bpm
- FC máxima: ${perfil.fcmax} bpm
- Esporte: ${perfil.esporte}
- Nível: ${perfil.nivel}
- Objetivo: ${perfil.objetivo}

Treino de hoje: ${treino}
Feedback do atleta: ${feedback}

Dê um insight curto (3-4 frases), direto, motivador e tecnicamente preciso sobre como foi esse treino e o que o atleta deve fazer a seguir. Use linguagem de treinador real, mencione zonas de FC quando relevante.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const texto = data.content[0].text;

    res.status(200).json({ insight: texto });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar insight' });
  }
}