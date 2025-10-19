import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateClassPDF = async (classData) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Create chart data
    const skillCategories = getSkillCategories(classData);
    const chartData = skillCategories.map(skill => ({
      skill: skill.name,
      value: parseFloat(skill.average)
    }));

    // Helper function to add text with word wrap
    const addText = (text, x, y, maxWidth, fontSize = 12, fontStyle = 'normal') => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', fontStyle);
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return y + (lines.length * fontSize * 0.4);
    };

    // Helper function to add a new page if needed
    const checkNewPage = (requiredSpace) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    // Header
    pdf.setFillColor(59, 130, 246); // Blue background
    pdf.rect(0, 0, pageWidth, 30, 'F');
    
    pdf.setTextColor(255, 255, 255);
    yPosition = addText('LAPORAN ASSESSMENT KELAS', 20, 20, pageWidth - 40, 18, 'bold');
    
    pdf.setTextColor(0, 0, 0);
    yPosition += 10;

    // Class Information
    pdf.setFillColor(243, 244, 246); // Light gray background
    pdf.rect(20, yPosition, pageWidth - 40, 40, 'F');
    
    yPosition += 10;
    yPosition = addText(`Kelas: ${classData.classLevel} - ${classData.programKeahlian}`, 30, yPosition, pageWidth - 60, 14, 'bold');
    yPosition = addText(`Sekolah: ${classData.schoolName}`, 30, yPosition, pageWidth - 60, 12);
    yPosition = addText(`Observer: ${classData.observerName} (${classData.observerRole})`, 30, yPosition, pageWidth - 60, 12);
    yPosition = addText(`Jumlah Siswa: ${classData.studentCount}`, 30, yPosition, pageWidth - 60, 12);
    yPosition = addText(`Tanggal Dibuat: ${formatDate(classData.createdAt)}`, 30, yPosition, pageWidth - 60, 12);
    
    yPosition += 20;

    // Skill Assessment Summary
    checkNewPage(80);
    yPosition = addText('RINGKASAN ASSESSMENT KETERAMPILAN', 20, yPosition, pageWidth - 40, 16, 'bold');
    yPosition += 10;

    // Add simple chart to PDF
    addSimpleChartToPDF(pdf, chartData, 20, yPosition, pageWidth - 40, 50);
    yPosition += 60;

    // Skill details
    skillCategories.forEach((skill, index) => {
      checkNewPage(15);
      const scoreLevel = getScoreLevel(parseFloat(skill.average));
      yPosition = addText(`${skill.name}: ${skill.average} (${scoreLevel.level})`, 30, yPosition, pageWidth - 60, 12);
    });

    yPosition += 20;

    // Student Details
    checkNewPage(30);
    yPosition = addText('DETAIL ASSESSMENT SISWA', 20, yPosition, pageWidth - 40, 16, 'bold');
    yPosition += 10;

    if (classData.answers) {
      for (const [studentName, answers] of Object.entries(classData.answers)) {
        // Start new page for each student
        pdf.addPage();
        yPosition = 20;
        
        // Student header with better styling
        pdf.setFillColor(59, 130, 246); // Blue background
        pdf.rect(20, yPosition - 5, pageWidth - 40, 20, 'F');
        pdf.setTextColor(255, 255, 255); // White text
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        const studentText = `SISWA: ${studentName.toUpperCase()}`;
        const textWidth = pdf.getTextWidth(studentText);
        const centerX = (pageWidth - textWidth) / 2;
        pdf.text(studentText, centerX, yPosition + 5);
        pdf.setTextColor(0, 0, 0); // Reset to black
        
        yPosition += 20;
        
        // Student info in a nice box
        pdf.setFillColor(248, 250, 252); // Light gray background
        pdf.rect(20, yPosition - 5, pageWidth - 40, 25, 'F');
        pdf.setDrawColor(229, 231, 235); // Light border
        pdf.rect(20, yPosition - 5, pageWidth - 40, 25, 'S');
        
        // Calculate student average
        const studentScores = classData.studentScores?.[studentName] || {};
        const totalScore = Object.values(studentScores).reduce((sum, score) => sum + (typeof score === 'number' ? score : 0), 0);
        const averageStudentScore = Object.keys(studentScores).length > 0 ? (totalScore / Object.keys(studentScores).length).toFixed(2) : 0;
        const studentLevel = getScoreLevel(parseFloat(averageStudentScore));
        
        yPosition = addText(`Rata-rata Skor: ${averageStudentScore} (${studentLevel.level})`, 30, yPosition, pageWidth - 60, 12);
        yPosition = addText(`Jumlah Assessment: ${Object.keys(answers).length}`, 30, yPosition, pageWidth - 60, 12);
        
        yPosition += 20;

        // Add spider chart for student - centered and larger
        const studentSkillData = getStudentSkillData(answers);
        if (studentSkillData.length > 0) {
          const chartHeight = 160;
          const chartWidth = pageWidth - 40;
          checkNewPage(chartHeight + 40);

          // Chart title
          yPosition = addText('SPIDER CHART KETERAMPILAN', 20, yPosition, pageWidth - 40, 18, 'bold');
          yPosition += 10;
          
          // Center the chart on the page
          const chartX = 20;
          const chartY = yPosition;
          
          // Try to capture spider chart from web widget
          const chartImage = await captureSpiderChartFromWeb(studentSkillData);
          if (chartImage) {
            addSpiderChartImageToPDF(pdf, chartImage, chartX, chartY, chartWidth, chartHeight);
          } else {
            // Fallback to native drawing
            addSpiderChartToPDF(pdf, studentSkillData, chartX, chartY, chartWidth, chartHeight);
          }
          
          yPosition += chartHeight + 20;
        }
      }
    }

    // AI Suggestions (if available)
    if (classData.aiSuggestions && classData.aiSuggestions.length > 0) {
      checkNewPage(40);
      yPosition = addText('REKOMENDASI AI', 20, yPosition, pageWidth - 40, 16, 'bold');
      yPosition += 10;

      classData.aiSuggestions.forEach((suggestion, index) => {
        checkNewPage(20);
        yPosition = addText(`${index + 1}. ${suggestion}`, 30, yPosition, pageWidth - 60, 11);
        yPosition += 5;
      });
    }

    // Footer
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Halaman ${i} dari ${totalPages}`, pageWidth - 40, pageHeight - 10);
      pdf.text(`Dibuat pada: ${new Date().toLocaleDateString('id-ID')}`, 20, pageHeight - 10);
    }

    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const downloadClassPDF = async (classData) => {
  try {
    const pdf = await generateClassPDF(classData);
    const fileName = `Assessment_${classData.classLevel}_${classData.programKeahlian}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

// Helper functions
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  return new Date(timestamp).toLocaleDateString('id-ID');
};

const SKILL_ALIASES = {
  'kerja sama': 'Kerja Sama',
  'kerjasama': 'Kerja Sama',
  'kolaborasi': 'Kerja Sama',
  'tanggung jawab': 'Tanggung Jawab',
  'komitmen': 'Tanggung Jawab',
  'komunikasi': 'Komunikasi',
  'problem solving': 'Problem Solving',
  'problem-solving': 'Problem Solving',
  'pemecahan masalah': 'Problem Solving',
  'berpikir kritis': 'Problem Solving',
  'kepemimpinan': 'Kepemimpinan',
  'leadership': 'Kepemimpinan',
  'fleksibilitas': 'Fleksibilitas',
  'adaptasi': 'Fleksibilitas',
  'adaptability': 'Fleksibilitas'
};

const normalizeSkillName = (name) => {
  if (!name || typeof name !== 'string') return null;

  const cleaned = name.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  if (!cleaned) return null;

  const lower = cleaned.toLowerCase();
  if (SKILL_ALIASES[lower]) {
    return SKILL_ALIASES[lower];
  }

  if (lower.includes('problem')) {
    return 'Problem Solving';
  }
  if (lower.includes('kerja') && lower.includes('sama')) {
    return 'Kerja Sama';
  }
  if (lower.includes('tanggung')) {
    return 'Tanggung Jawab';
  }
  if (lower.includes('komunik')) {
    return 'Komunikasi';
  }
  if (lower.includes('pimpin') || lower.includes('leader')) {
    return 'Kepemimpinan';
  }
  if (lower.includes('fleks') || lower.includes('adapt')) {
    return 'Fleksibilitas';
  }

  return cleaned;
};

const getSkillCategories = (classData) => {
  const categories = {
    'Kerja Sama': [],
    'Tanggung Jawab': [],
    'Komunikasi': [],
    'Problem Solving': [],
    'Kepemimpinan': [],
    'Fleksibilitas': []
  };

  if (classData.studentScores) {
    Object.values(classData.studentScores).forEach(student => {
      Object.entries(student).forEach(([key, score]) => {
        const rawCategory = key.split('|')[1]?.split('(')[1]?.replace(')', '') || key.split('|')[1] || '';
        const normalized = normalizeSkillName(rawCategory);
        if (normalized && categories[normalized]) {
          categories[normalized].push(score);
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

const getScoreLevel = (score) => {
  if (score >= 4) return { level: 'Sangat Baik', color: 'text-green-600 bg-green-100' };
  if (score >= 3) return { level: 'Baik', color: 'text-blue-600 bg-blue-100' };
  if (score >= 2) return { level: 'Cukup', color: 'text-yellow-600 bg-yellow-100' };
  return { level: 'Kurang', color: 'text-red-600 bg-red-100' };
};

// Function to get student skill data for spider chart
const SCORE_LABEL_MAP = {
  'sangat baik': 4,
  'baik': 3,
  'cukup': 2,
  'kurang': 1
};

const normalizeAnswerToScore = (answer) => {
  if (answer === null || answer === undefined) return null;

  if (typeof answer === 'number') {
    return Number.isNaN(answer) ? null : answer;
  }

  if (typeof answer === 'string') {
    const trimmed = answer.trim();
    if (!trimmed) return null;

    const mapped = SCORE_LABEL_MAP[trimmed.toLowerCase()];
    if (mapped !== undefined) {
      return mapped;
    }

    const numberMatch = trimmed.match(/(-?\d+(?:\.\d+)?)/);
    if (numberMatch) {
      const parsed = parseFloat(numberMatch[1]);
      return Number.isNaN(parsed) ? null : parsed;
    }

    return null;
  }

  if (typeof answer === 'object') {
    const numericKeys = ['score', 'value', 'rating'];
    for (const key of numericKeys) {
      if (typeof answer[key] === 'number' && !Number.isNaN(answer[key])) {
        return answer[key];
      }
    }

    const labelKeys = ['scoreLabel', 'label', 'text'];
    for (const key of labelKeys) {
      if (typeof answer[key] === 'string') {
        const mapped = normalizeAnswerToScore(answer[key]);
        if (mapped !== null) {
          return mapped;
        }
      }
    }
  }

  return null;
};

const getStudentSkillData = (answers) => {
  const skillCategories = {};
  
  Object.entries(answers).forEach(([question, answer]) => {
    // Extract skill category from question format: "Question text | Skill (Category)"
    const parts = question.split('|');
    if (parts.length >= 2) {
      const skillPart = parts[1].trim();
      
      let category = '';
      const categoryMatch = skillPart.match(/\(([^)]+)\)/);
      if (categoryMatch) {
        category = categoryMatch[1];
      } else {
        category = skillPart;
      }

      const normalizedCategory = normalizeSkillName(category);
      if (!normalizedCategory) {
        return;
      }
      
      if (!skillCategories[normalizedCategory]) {
        skillCategories[normalizedCategory] = [];
      }
      
      const numericAnswer = normalizeAnswerToScore(answer);
      if (numericAnswer !== null) {
        skillCategories[normalizedCategory].push(numericAnswer);
      }
    }
  });

  // Calculate averages and ensure we have meaningful data
  const result = Object.entries(skillCategories).map(([name, values]) => {
    const validValues = values.filter(v => typeof v === 'number' && !Number.isNaN(v));
    const average = validValues.length > 0 ? 
      (validValues.reduce((sum, val) => sum + val, 0) / validValues.length) : 0;
    
    return {
      skill: name,
      value: average
    };
  });

  const requiredSkills = [
    'Kerja Sama', 'Tanggung Jawab', 'Komunikasi', 
    'Problem Solving', 'Kepemimpinan', 'Fleksibilitas'
  ];
  
  const finalResult = requiredSkills.map(skill => {
    const existing = result.find(r => r.skill === skill);
    const value = existing ? existing.value : 0;
    const clampedValue = Math.max(0, Math.min(4, value));
    return { skill, value: clampedValue };
  });

  const hasData = finalResult.some(item => item.value > 0);
  return hasData ? finalResult : [];
};

// Function to add simple chart to PDF
const addSimpleChartToPDF = (pdf, chartData, x, y, width, height) => {
  try {
    // Chart dimensions
    const chartWidth = width - 40; // Leave margin
    const chartHeight = height - 30; // Leave space for labels
    const barWidth = chartWidth / chartData.length * 0.8; // 80% of available space
    const maxValue = 4; // Maximum value for scaling
    const startX = x + 20;
    const startY = y + 20;
    const chartBottom = startY + chartHeight;

    // Draw chart background
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(startX, startY, chartWidth, chartHeight);

    // Draw Y-axis grid lines
    for (let i = 0; i <= 4; i++) {
      const gridY = startY + (chartHeight / 4) * i;
      pdf.setDrawColor(220, 220, 220);
      pdf.line(startX, gridY, startX + chartWidth, gridY);
      
      // Y-axis labels
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(i.toString(), startX - 5, gridY + 2);
    }

    // Draw bars
    chartData.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight;
      const barX = startX + (chartWidth / chartData.length) * index + (chartWidth / chartData.length - barWidth) / 2;
      const barY = chartBottom - barHeight;

      // Draw bar
      pdf.setFillColor(59, 130, 246); // Blue color
      pdf.rect(barX, barY, barWidth, barHeight, 'F');

      // Draw bar border
      pdf.setDrawColor(37, 99, 235); // Darker blue
      pdf.setLineWidth(0.5);
      pdf.rect(barX, barY, barWidth, barHeight);

      // Add value label on top of bar
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      const labelX = barX + barWidth / 2;
      const labelY = barY - 2;
      pdf.text(item.value.toFixed(1), labelX, labelY, { align: 'center' });
    });

    // Draw X-axis labels
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    chartData.forEach((item, index) => {
      const labelX = startX + (chartWidth / chartData.length) * index + (chartWidth / chartData.length) / 2;
      const labelY = chartBottom + 8;
      
      // Rotate text for better fit
      const skillName = item.skill.length > 8 ? item.skill.substring(0, 8) + '...' : item.skill;
      pdf.text(skillName, labelX, labelY, { align: 'center' });
    });

    // Chart title
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Rata-rata Skor Kelas', startX + chartWidth / 2, y + 10, { align: 'center' });

  } catch (error) {
    console.error('Error adding simple chart to PDF:', error);
    // Fallback: add text instead of chart
    pdf.setFontSize(12);
    pdf.text('Chart tidak dapat ditampilkan', x, y + 20);
  }
};

// Function to add spider chart to PDF
const addSpiderChartToPDF = (pdf, chartData, x, y, width, height) => {
  try {
    if (!chartData || chartData.length === 0) return;

    // Chart dimensions - make it bigger and more visible
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2 - 5; // Minimal margin for maximum chart size
    const maxValue = 4;
    const numSkills = chartData.length;
    const angleStep = (2 * Math.PI) / numSkills;

    // Draw background circle with thicker border
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(1);
    pdf.circle(centerX, centerY, radius);
    
    // Add a light blue background to make the chart more visible
    pdf.setFillColor(240, 248, 255); // Very light blue
    pdf.circle(centerX, centerY, radius, 'F');

    // Draw concentric hexagons (grid) with better visibility
    for (let i = 1; i <= 4; i++) {
      const gridRadius = (radius / 4) * i;
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      
      // Draw hexagon instead of circle
      const hexPoints = [];
      for (let j = 0; j < 6; j++) {
        const angle = (j * Math.PI) / 3 - Math.PI / 2;
        const x = centerX + gridRadius * Math.cos(angle);
        const y = centerY + gridRadius * Math.sin(angle);
        hexPoints.push({ x, y });
      }
      
      // Draw hexagon
      let hexPath = `M ${hexPoints[0].x} ${hexPoints[0].y}`;
      for (let k = 1; k < hexPoints.length; k++) {
        hexPath += ` L ${hexPoints[k].x} ${hexPoints[k].y}`;
      }
      hexPath += ' Z';
      pdf.path(hexPath, 'S');
      
      // Add scale labels
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      const scaleValue = i.toString();
      pdf.text(scaleValue, centerX + gridRadius + 3, centerY - 2);
    }

    // Draw axes with better visibility
    for (let i = 0; i < numSkills; i++) {
      const angle = i * angleStep - Math.PI / 2; // Start from top
      const endX = centerX + radius * Math.cos(angle);
      const endY = centerY + radius * Math.sin(angle);
      
      pdf.setDrawColor(180, 180, 180);
      pdf.setLineWidth(0.5);
      pdf.line(centerX, centerY, endX, endY);
    }

    // Calculate data points
    const points = [];
    for (let i = 0; i < numSkills; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const value = parseFloat(chartData[i].value) || 0;
      const pointRadius = (value / maxValue) * radius;
      
      const pointX = centerX + pointRadius * Math.cos(angle);
      const pointY = centerY + pointRadius * Math.sin(angle);
      
      points.push({ x: pointX, y: pointY });
    }

    // Draw polygon (spider web) with better styling
    if (points.length > 2) {
      // Fill polygon with light blue color like the reference
      pdf.setFillColor(173, 216, 230); // Light blue
      pdf.setDrawColor(70, 130, 180); // Steel blue border
      pdf.setLineWidth(1.5);
      
      // Create polygon path
      let path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x} ${points[i].y}`;
      }
      path += ' Z';
      
      // Draw filled polygon first
      pdf.path(path, 'F');
      
      // Then draw border
      pdf.setDrawColor(70, 130, 180);
      pdf.setLineWidth(1.5);
      pdf.path(path, 'S');
    }

    // Draw data points with better visibility
    points.forEach((point, index) => {
      // Draw data points with dark blue color like the reference
      pdf.setFillColor(25, 25, 112); // Dark blue
      pdf.circle(point.x, point.y, 3, 'F');
      
      // Add white border to points
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.circle(point.x, point.y, 3);
      
      // Add value labels with better positioning
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      const value = parseFloat(chartData[index].value) || 0;
      const angle = index * angleStep - Math.PI / 2;
      const labelRadius = radius + 12;
      const labelX = centerX + labelRadius * Math.cos(angle);
      const labelY = centerY + labelRadius * Math.sin(angle);
      
      pdf.text(value.toFixed(1), labelX, labelY, { align: 'center' });
    });

    // Draw skill labels with better positioning
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    for (let i = 0; i < numSkills; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const labelRadius = radius + 20;
      const labelX = centerX + labelRadius * Math.cos(angle);
      const labelY = centerY + labelRadius * Math.sin(angle);
      
      const skillName = chartData[i].skill.length > 12 ? 
        chartData[i].skill.substring(0, 12) + '...' : 
        chartData[i].skill;
      
      pdf.text(skillName, labelX, labelY, { align: 'center' });
    }

    // Add center title with better styling
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Spider Chart', centerX, centerY - 8, { align: 'center' });

  } catch (error) {
    console.error('Error adding spider chart to PDF:', error);
    // Fallback: add text instead of chart
    pdf.setFontSize(12);
    pdf.text('Spider chart tidak dapat ditampilkan', x, y + 20);
  }
};

// Function to capture spider chart from web widget
const captureSpiderChartFromWeb = async (chartData) => {
  try {
    // Create a temporary container for the spider chart
    const chartContainer = document.createElement('div');
    chartContainer.style.position = 'absolute';
    chartContainer.style.left = '-9999px';
    chartContainer.style.top = '-9999px';
    chartContainer.style.width = '640px';
    chartContainer.style.height = '640px';
    chartContainer.style.backgroundColor = 'white';
    chartContainer.style.padding = '0';
    chartContainer.style.border = 'none';
    chartContainer.style.borderRadius = '0';
    chartContainer.style.display = 'flex';
    chartContainer.style.alignItems = 'center';
    chartContainer.style.justifyContent = 'center';
    
    document.body.appendChild(chartContainer);

    // Import React and create spider chart component
    const React = await import('react');
    const ReactDOM = await import('react-dom/client');
    const SpiderChart = await import('../components/Charts/SpiderChart');
    
    // Create spider chart element
    const chartElement = React.createElement(SpiderChart.default, {
      data: chartData.reduce((acc, item) => {
        acc[item.skill] = parseFloat(item.value);
        return acc;
      }, {}),
      maxValue: 4,
      height: 600
    });

    // Render the chart
    const root = ReactDOM.createRoot(chartContainer);
    await new Promise((resolve) => {
      root.render(chartElement);
      setTimeout(resolve, 2000); // Wait for chart to render
    });

    // Capture the chart as image
    const canvas = await html2canvas(chartContainer, {
      backgroundColor: 'white',
      scale: 2,
      useCORS: true,
      width: 640,
      height: 640
    });

    const imageData = canvas.toDataURL('image/png');

    // Clean up
    root.unmount();
    document.body.removeChild(chartContainer);

    return imageData;
  } catch (error) {
    console.error('Error capturing spider chart from web:', error);
    return null;
  }
};

// Function to add spider chart image to PDF
const addSpiderChartImageToPDF = (pdf, imageData, x, y, width, height) => {
  try {
    if (!imageData) return;
    
    // Calculate image dimensions to fit the available space
    const size = Math.min(width, height);
    const offsetX = x + (width - size) / 2;
    const offsetY = y + (height - size) / 2;
    
    // Add image to PDF centered within the allocated box
    pdf.addImage(imageData, 'PNG', offsetX, offsetY, size, size);
  } catch (error) {
    console.error('Error adding spider chart image to PDF:', error);
    // Fallback: add text
    pdf.setFontSize(12);
    pdf.text('Spider chart image tidak dapat ditampilkan', x, y + 20);
  }
};
