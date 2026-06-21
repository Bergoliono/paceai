export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { perfil } = req.body;

    const prompt = `Você é um treinador profissional de endurance (ciclismo, corrida, triathlon, trail, natação, MTB) com 20 anos de experiência.

Gere uma planilha de treino semanal para este atleta:

- Nome: ${perfil.nome}
- Idade: ${perfil.idade}
- FC repouso: ${perfil.fcrep} bpm
- FC máxima: ${perfil.fcmax} bpm
- Zona 1: ${perfil.zona1}
- Zona 2: ${perfil.zona2}
- Zona 3: ${perfil.zona3}
- Zona 4: ${perfil.zona4}
- Zona 5: ${perfil.zona5}
- Esporte: ${perfil.esporte}
- Nível: ${perfil.nivel}
- Objetivo: ${perfil.objetivo}
- Dias de treino por semana: ${perfil.dias}
- Tempo disponível por sessão: ${perfil.tempo}
- Lesões ou limitações: ${perfil.lesao || 'nenhuma'}
- História do atleta: ${perfil.historia || 'não informado'}

Responda APENAS com um JSON válido, sem nenhum texto antes ou depois, no formato exato abaixo. Gere ${perfil.dias} dias de treino e o restante até completar 7 dias como descanso. Cada treino deve ter fases reais (aquecimento, bloco principal, volta à calma) com zona de FC e duração específicas, baseadas nos dados acima.

{
  "semana": [
    {
      "dia": "Segunda",
      "tipo": "Fundo Aeróbico",
      "tag": "Z2",
      "descricao": "Base aeróbica longa",
      "descanso": false,
      "fases": [
        {"nome": "Aquecimento", "zona": "Zona 1", "bpm": "115-130 bpm", "duracao": "10 min"},
        {"nome": "Bloco principal", "zona": "Zona 2", "bpm": "131-145 bpm", "duracao": "40 min"},
        {"nome": "Volta à calma", "zona": "Zona 1", "bpm": "abaixo de 130 bpm", "duracao": "10 min"}
      ]
    }
  ]
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: 'Erro da Anthropic', detalhe: data });
    }

    let texto = data.content[0].text;
    texto = texto.replace(/```json|```/g, '').trim();
    const planilha = JSON.parse(texto);

    res.status(200).json(planilha);

  } catch (error) {
    res.status(500).json({ error: 'Erro interno', detalhe: error.message });
  }
}