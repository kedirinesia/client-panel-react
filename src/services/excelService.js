import * as XLSX from 'xlsx';

export const downloadClassExcel = async (classData) => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // 1. Create Assessment Data Sheet (Main Sheet)
    const assessmentData = [
      ['DATA ASSESSMENT SOFT SKILLS'],
      [''],
      ['Tanggal', formatDate(classData.assessmentDate)],
      ['Sekolah', classData.schoolName || 'N/A'],
      ['Kelas', classData.classLevel || 'N/A'],
      ['Program Keahlian', classData.programKeahlian || 'N/A'],
      ['Observer', classData.observerName || 'N/A'],
      [''],
      ['Alur Pembelajaran', 'Butir Observasi', ...Object.keys(classData.answers || {})]
    ];

    // Get all unique questions from all students
    const allQuestions = new Set();
    if (classData.answers) {
      Object.values(classData.answers).forEach(answers => {
        Object.keys(answers).forEach(question => {
          allQuestions.add(question);
        });
      });
    }

    // Convert Set to Array and sort
    const sortedQuestions = Array.from(allQuestions).sort();

    // Add each question as a row
    sortedQuestions.forEach(question => {
      const parts = question.split('|');
      const learningFlow = parts[0] || 'Unknown';
      const observationItem = parts[1] || question;
      
      const row = [learningFlow, observationItem];
      
      // Add answers for each student
      Object.keys(classData.answers || {}).forEach(studentName => {
        const answer = classData.answers[studentName][question] || '';
        row.push(answer);
      });
      
      assessmentData.push(row);
    });

    const assessmentSheet = XLSX.utils.aoa_to_sheet(assessmentData);
    
    // Set column widths
    const colWidths = [
      { wch: 20 }, // Alur Pembelajaran
      { wch: 80 }, // Butir Observasi
      ...Object.keys(classData.answers || {}).map(() => ({ wch: 15 })) // Student columns
    ];
    assessmentSheet['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(workbook, assessmentSheet, 'Data Assessment');

    // 2. Create Summary Sheet
    const summaryData = [
      ['RINGKASAN ASSESSMENT'],
      [''],
      ['Informasi Kelas'],
      ['Nama Kelas', classData.classLevel || 'N/A'],
      ['Sekolah', classData.schoolName || 'N/A'],
      ['Program Keahlian', classData.programKeahlian || 'N/A'],
      ['Observer', classData.observerName || 'N/A'],
      ['Tanggal Assessment', formatDate(classData.assessmentDate)],
      ['Jumlah Siswa', Object.keys(classData.answers || {}).length],
      ['Jumlah Pertanyaan', sortedQuestions.length],
      [''],
      ['RINGKASAN SKILL'],
      ['Skill', 'Rata-rata', 'Level', 'Jumlah Assessment']
    ];

    // Add skill summary
    const skillCategories = getSkillCategories(classData);
    skillCategories.forEach(skill => {
      const level = getScoreLevel(parseFloat(skill.average));
      summaryData.push([skill.name, skill.average, level.level, skill.count]);
    });

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');

    // 3. Create Student Summary Sheet
    const studentSummaryData = [
      ['RINGKASAN SISWA'],
      [''],
      ['Nama Siswa', 'Rata-rata Skor', 'Level', 'Jumlah Assessment']
    ];

    if (classData.answers) {
      Object.entries(classData.answers).forEach(([studentName, answers]) => {
        // Calculate average from answers directly
        const allScores = [];
        Object.values(answers).forEach(answer => {
          const numericScore = convertTextToNumeric(answer);
          if (numericScore > 0) {
            allScores.push(numericScore);
          }
        });
        
        const averageStudentScore = allScores.length > 0 ? 
          (allScores.reduce((sum, score) => sum + score, 0) / allScores.length).toFixed(2) : 0;
        const studentLevel = getScoreLevel(parseFloat(averageStudentScore));

        studentSummaryData.push([
          studentName,
          averageStudentScore,
          studentLevel.level,
          Object.keys(answers).length
        ]);
      });
    }

    const studentSummarySheet = XLSX.utils.aoa_to_sheet(studentSummaryData);
    XLSX.utils.book_append_sheet(workbook, studentSummarySheet, 'Ringkasan Siswa');

    // Generate filename
    const className = classData.classLevel || 'Kelas';
    const schoolName = classData.schoolName || 'Sekolah';
    const date = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
    const filename = `Data_Assessment_${className}_${schoolName}_${date}.xlsx`;

    // Write and download the file
    XLSX.writeFile(workbook, filename);

    console.log('Excel file downloaded successfully:', filename);
  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw error;
  }
};

// Helper function to convert text answers to numeric values
const convertTextToNumeric = (answer) => {
  if (typeof answer === 'number') {
    return answer;
  }
  
  if (typeof answer === 'string') {
    const lowerAnswer = answer.toLowerCase().trim();
    
    // Map text answers to numeric values
    switch (lowerAnswer) {
      case 'sangat baik':
        return 4;
      case 'baik':
        return 3;
      case 'cukup':
        return 2;
      case 'kurang':
        return 1;
      default:
        // Try to parse as number
        const parsed = parseFloat(answer);
        if (!isNaN(parsed)) {
          return parsed;
        }
        // Try to extract number from string
        const numberMatch = answer.match(/(\d+(?:\.\d+)?)/);
        if (numberMatch) {
          return parseFloat(numberMatch[1]);
        }
        return 0;
    }
  }
  
  return 0;
};

// Helper function to get skill categories (same as in pdfService.js)
const getSkillCategories = (classData) => {
  const categories = {};
  
  if (classData.answers) {
    Object.values(classData.answers).forEach(answers => {
      Object.entries(answers).forEach(([question, answer]) => {
        const parts = question.split('|');
        if (parts.length >= 2) {
          const skillPart = parts[1].trim();
          let category = 'Other';
          
          const categoryMatch = skillPart.match(/\(([^)]+)\)/);
          if (categoryMatch) {
            category = categoryMatch[1];
          } else {
            category = skillPart;
          }
          
          if (!categories[category]) {
            categories[category] = [];
          }
          
          const numericAnswer = convertTextToNumeric(answer);
          
          if (numericAnswer > 0) {
            categories[category].push(numericAnswer);
          }
        }
      });
    });
  }
  
  return Object.entries(categories).map(([name, scores]) => ({
    name,
    average: scores.length > 0 ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2) : 0,
    count: scores.length
  }));
};

// Helper function to format date
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  }
  return new Date(timestamp).toLocaleDateString('id-ID');
};

// Helper function to get score level (same as in pdfService.js)
const getScoreLevel = (score) => {
  if (score >= 4) return { level: 'Sangat Baik', color: 'text-green-600 bg-green-100' };
  if (score >= 3) return { level: 'Baik', color: 'text-blue-600 bg-blue-100' };
  if (score >= 2) return { level: 'Cukup', color: 'text-yellow-600 bg-yellow-100' };
  return { level: 'Kurang', color: 'text-red-600 bg-red-100' };
};
