const GEMINI_API_KEY = 'AIzaSyCH66wal927bMKuOIFvZirUwumd4ih2nt8';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const generateStudentRecommendations = async (studentName, skillAverages, answers) => {
  try {
    // Create detailed prompt for AI
    const prompt = createStudentRecommendationPrompt(studentName, skillAverages, answers);
    
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'x-goog-api-key': GEMINI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from AI API');
    }
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    throw error;
  }
};

const createStudentRecommendationPrompt = (studentName, skillAverages, answers) => {
  const skillDetails = Object.entries(skillAverages)
    .map(([skill, average]) => {
      let level = '';
      if (average >= 4) level = 'Sangat Baik';
      else if (average >= 3) level = 'Baik';
      else if (average >= 2) level = 'Cukup';
      else level = 'Kurang';
      
      return `${skill}: ${average.toFixed(2)} (${level})`;
    })
    .join('\n');

  const weakSkills = Object.entries(skillAverages)
    .filter(([_, average]) => average < 3)
    .map(([skill, average]) => skill);

  const strongSkills = Object.entries(skillAverages)
    .filter(([_, average]) => average >= 3)
    .map(([skill, average]) => skill);

  return `
Sebagai konselor pendidikan yang berpengalaman, berikan rekomendasi yang komprehensif untuk siswa bernama ${studentName}.

**PROFIL KEMAMPUAN SISWA:**
${skillDetails}

**ANALISIS:**
- Kekuatan: ${strongSkills.length > 0 ? strongSkills.join(', ') : 'Belum teridentifikasi'}
- Area yang perlu ditingkatkan: ${weakSkills.length > 0 ? weakSkills.join(', ') : 'Semua area sudah baik'}

**TUGAS ANDA:**
Buat rekomendasi yang praktis dan dapat diimplementasikan untuk membantu ${studentName} berkembang. Format jawaban dalam bahasa Indonesia dengan struktur berikut:

1. **RINGKASAN KEMAMPUAN** (2-3 kalimat)
2. **REKOMENDASI UTAMA** (3-4 poin spesifik)
3. **STRATEGI PENGEMBANGAN** (untuk area yang lemah)
4. **PELUANG PENGEMBANGAN** (untuk area yang kuat)
5. **AKSI KONKRET** (yang bisa dilakukan guru/orang tua)

Gunakan bahasa yang positif, konstruktif, dan mudah dipahami. Fokus pada solusi praktis yang bisa diimplementasikan dalam pembelajaran sehari-hari.
`;
};
