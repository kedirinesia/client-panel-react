import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Helper function to extract school info from document ID
const extractSchoolInfo = (schoolId) => {
  const parts = schoolId.split('_');
  if (parts.length >= 3) {
    const schoolName = parts.slice(0, -2).join(' ').replace(/\b\w/g, l => l.toUpperCase());
    const grade = parts[parts.length - 2];
    const program = parts[parts.length - 1].replace(/\b\w/g, l => l.toUpperCase());
    return { schoolName, grade, program };
  }
  return { schoolName: schoolId, grade: 'N/A', program: 'N/A' };
};

// Helper function to format date
const formatDate = (date) => {
  if (!date) return 'N/A';
  if (date.seconds) {
    return new Date(date.seconds * 1000).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  return new Date(date).toLocaleDateString('id-ID');
};

// Helper function to get status label
const getStatusLabel = (status) => {
  const statusMap = {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    completed: 'Completed'
  };
  return statusMap[status] || 'Unknown';
};

// Export to Excel
export const exportToExcel = (schools, filename = 'schools_data') => {
  try {
    // Prepare data for Excel
    const excelData = schools.map(school => {
      const { schoolName, grade, program } = extractSchoolInfo(school.id);
      
      return {
        'ID': school.id,
        'Nama Sekolah': schoolName,
        'Kelas': `${grade} ${program}`,
        'Status': getStatusLabel(school.status),
        'Jumlah Siswa': school.studentCount || 0,
        'Observer': school.observerName || 'N/A',
        'Peran Observer': school.observerRole || 'N/A',
        'Tanggal Dibuat': formatDate(school.createdAt),
        'Terakhir Diupdate': formatDate(school.uploadedAt),
        'Versi': school.version || 'N/A'
      };
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 30 }, // ID
      { wch: 25 }, // Nama Sekolah
      { wch: 30 }, // Program Keahlian
      { wch: 10 }, // Kelas
      { wch: 12 }, // Status
      { wch: 15 }, // Jumlah Siswa
      { wch: 20 }, // Observer
      { wch: 15 }, // Peran Observer
      { wch: 20 }, // Tanggal Dibuat
      { wch: 20 }, // Terakhir Diupdate
      { wch: 10 }  // Versi
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Schools Data');

    // Generate and download file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'Excel file downloaded successfully' };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return { success: false, error: error.message };
  }
};

// Export to PDF
export const exportToPDF = (schools, filename = 'schools_data') => {
  try {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Add title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Data Assessment Report Sekolah', pageWidth / 2, 20, { align: 'center' });

    // Add subtitle with date
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, pageWidth / 2, 30, { align: 'center' });

    // Add school information
    let yPos = 50;
    schools.forEach((school, index) => {
      const { schoolName, grade, program } = extractSchoolInfo(school.id);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Sekolah ${index + 1}: ${schoolName}`, 10, yPos);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Kelas: ${grade} ${program}`, 10, yPos + 10);
      doc.text(`Status: ${getStatusLabel(school.status)}`, 10, yPos + 20);
      doc.text(`Jumlah Siswa: ${school.studentCount || 0}`, 10, yPos + 30);
      doc.text(`Observer: ${school.observerName || 'N/A'}`, 10, yPos + 40);
      doc.text(`Tanggal Dibuat: ${formatDate(school.createdAt)}`, 10, yPos + 50);
      
      yPos += 70;
      
      // Add page break if needed
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }
    });

    // Add summary information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Ringkasan Data:', 10, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Sekolah: ${schools.length}`, 10, yPos + 10);
    doc.text(`Total Siswa: ${schools.reduce((sum, school) => sum + (school.studentCount || 0), 0)}`, 10, yPos + 20);
    
    // Status breakdown
    const statusCounts = schools.reduce((acc, school) => {
      const status = getStatusLabel(school.status);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    yPos += 40;
    doc.text('Status Breakdown:', 10, yPos);
    yPos += 10;
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      doc.text(`- ${status}: ${count} sekolah`, 15, yPos);
      yPos += 8;
    });

    // Download PDF
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);

    return { success: true, message: 'PDF file downloaded successfully' };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return { success: false, error: error.message };
  }
};

// Enhanced PDF export with comprehensive data, charts, and class summaries
export const exportComprehensivePDF = (schools, filename = 'comprehensive_assessment_report') => {
  try {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Helper function to add page break if needed
    const checkPageBreak = (requiredSpace = 20) => {
      if (yPos + requiredSpace > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
        return true;
      }
      return false;
    };

    // Helper function to draw a simple bar chart
    const drawBarChart = (data, x, y, width, height, title) => {
      if (!data || Object.keys(data).length === 0) return y + height + 10;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, x, y);
      y += 10;
      
      const maxValue = Math.max(...Object.values(data));
      const barWidth = width / Object.keys(data).length;
      const barHeight = height - 20;
      
      let barX = x;
      Object.entries(data).forEach(([label, value], index) => {
        const barHeightRatio = maxValue > 0 ? value / maxValue : 0;
        const currentBarHeight = barHeight * barHeightRatio;
        
        // Draw bar
        doc.setFillColor(100 + index * 30, 150, 200);
        doc.rect(barX, y + barHeight - currentBarHeight, barWidth - 2, currentBarHeight, 'F');
        
        // Draw label
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(label.substring(0, 8), barX, y + barHeight + 5);
        doc.text(value.toString(), barX + barWidth/2 - 5, y + barHeight - currentBarHeight - 5);
        
        barX += barWidth;
      });
      
      return y + height + 10;
    };

    // Helper function to calculate class statistics
    const calculateClassStats = (school) => {
      if (!school.studentScores) return null;
      
      const students = Object.keys(school.studentScores);
      const skills = students.length > 0 ? Object.keys(school.studentScores[students[0]]) : [];
      
      const stats = {
        totalStudents: students.length,
        skills: {},
        averageScores: {},
        skillDistribution: {}
      };
      
      skills.forEach(skill => {
        const scores = students.map(studentId => school.studentScores[studentId][skill] || 0);
        const validScores = scores.filter(score => score > 0);
        
        stats.skills[skill] = {
          average: validScores.length > 0 ? (validScores.reduce((sum, score) => sum + score, 0) / validScores.length).toFixed(2) : 0,
          max: Math.max(...validScores, 0),
          min: Math.min(...validScores, 0),
          count: validScores.length
        };
        
        // Score distribution
        const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
        validScores.forEach(score => {
          const roundedScore = Math.round(score);
          if (distribution[roundedScore] !== undefined) {
            distribution[roundedScore]++;
          }
        });
        stats.skillDistribution[skill] = distribution;
      });
      
      return stats;
    };

    // Page 1: Title and Overview
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN ASSESSMENT SOFT SKILLS', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Laporan Komprehensif Data Assessment', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(12);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;

    // Summary statistics
    const totalSchools = schools.length;
    const totalStudents = schools.reduce((sum, school) => sum + (school.studentCount || 0), 0);
    const statusBreakdown = schools.reduce((acc, school) => {
      const status = getStatusLabel(school.status);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RINGKASAN DATA', 10, yPos);
    yPos += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Sekolah: ${totalSchools}`, 10, yPos);
    doc.text(`Total Siswa: ${totalStudents}`, 10, yPos + 10);
    doc.text(`Rata-rata Siswa per Sekolah: ${(totalStudents / totalSchools).toFixed(1)}`, 10, yPos + 20);
    yPos += 35;

    // Status breakdown chart
    if (Object.keys(statusBreakdown).length > 0) {
      yPos = drawBarChart(statusBreakdown, 10, yPos, 100, 60, 'Distribusi Status Sekolah');
      yPos += 10;
    }

    // Page 2+: Detailed School Data
    schools.forEach((school, schoolIndex) => {
      checkPageBreak(100);
      
      const { schoolName, grade, program } = extractSchoolInfo(school.id);
      const classStats = calculateClassStats(school);
      
      // School header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`${schoolIndex + 1}. ${schoolName}`, 10, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Kelas: ${grade} ${program}`, 10, yPos);
      doc.text(`Status: ${getStatusLabel(school.status)}`, 10, yPos + 8);
      doc.text(`Observer: ${school.observerName || 'N/A'}`, 10, yPos + 16);
      doc.text(`Tanggal Assessment: ${formatDate(school.createdAt)}`, 10, yPos + 24);
      yPos += 35;

      if (classStats) {
        // Class statistics
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('STATISTIK KELAS', 10, yPos);
        yPos += 15;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Jumlah Siswa: ${classStats.totalStudents}`, 10, yPos);
        doc.text(`Jumlah Skill yang Dinilai: ${Object.keys(classStats.skills).length}`, 10, yPos + 10);
        yPos += 25;

        // Skills performance chart
        if (Object.keys(classStats.skills).length > 0) {
          const skillAverages = {};
          Object.entries(classStats.skills).forEach(([skill, stats]) => {
            skillAverages[skill.substring(0, 15)] = parseFloat(stats.average);
          });
          
          yPos = drawBarChart(skillAverages, 10, yPos, 120, 60, 'Rata-rata Skor per Skill');
          yPos += 10;
        }

        // Detailed student data table
        if (school.studentScores && school.answers) {
          checkPageBreak(50);
          
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('DATA SISWA DETAIL', 10, yPos);
          yPos += 15;

          const students = Object.keys(school.studentScores);
          const skills = students.length > 0 ? Object.keys(school.studentScores[students[0]]) : [];

          // Table header
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          let xPos = 10;
          doc.text('No', xPos, yPos);
          xPos += 15;
          doc.text('ID Siswa', xPos, yPos);
          xPos += 30;
          
          skills.forEach(skill => {
            doc.text(skill.substring(0, 8), xPos, yPos);
            xPos += 20;
          });
          yPos += 10;

          // Table data
          doc.setFont('helvetica', 'normal');
          students.forEach((studentId, studentIndex) => {
            if (yPos > pageHeight - 30) {
              doc.addPage();
              yPos = 20;
            }
            
            xPos = 10;
            doc.text((studentIndex + 1).toString(), xPos, yPos);
            xPos += 15;
            doc.text(studentId.substring(0, 12), xPos, yPos);
            xPos += 30;
            
            skills.forEach(skill => {
              const score = school.studentScores[studentId][skill] || 0;
              doc.text(score.toString(), xPos, yPos);
              xPos += 20;
            });
            yPos += 8;
          });
          yPos += 15;
        }

        // AI Suggestions
        if (school.aiSuggestions && school.aiSuggestions.length > 0) {
          checkPageBreak(30);
          
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('SARAN AI', 10, yPos);
          yPos += 15;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          school.aiSuggestions.forEach((suggestion, index) => {
            if (yPos > pageHeight - 20) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(`${index + 1}. ${suggestion}`, 15, yPos);
            yPos += 8;
          });
          yPos += 10;
        }
      }

      yPos += 20;
    });

    // Final page: Overall statistics and charts
    doc.addPage();
    yPos = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ANALISIS KESELURUHAN', 10, yPos);
    yPos += 20;

    // Calculate overall statistics
    const allSkills = new Set();
    const allScores = [];
    schools.forEach(school => {
      if (school.studentScores) {
        Object.values(school.studentScores).forEach(studentScores => {
          Object.entries(studentScores).forEach(([skill, score]) => {
            allSkills.add(skill);
            if (score > 0) allScores.push(score);
          });
        });
      }
    });

    if (allScores.length > 0) {
      const averageScore = (allScores.reduce((sum, score) => sum + score, 0) / allScores.length).toFixed(2);
      const maxScore = Math.max(...allScores);
      const minScore = Math.min(...allScores);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Rata-rata Skor Keseluruhan: ${averageScore}`, 10, yPos);
      doc.text(`Skor Tertinggi: ${maxScore}`, 10, yPos + 10);
      doc.text(`Skor Terendah: ${minScore}`, 10, yPos + 20);
      doc.text(`Total Penilaian: ${allScores.length}`, 10, yPos + 30);
      yPos += 50;

      // Score distribution chart
      const scoreDistribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
      allScores.forEach(score => {
        const roundedScore = Math.round(score);
        if (scoreDistribution[roundedScore] !== undefined) {
          scoreDistribution[roundedScore]++;
        }
      });

      yPos = drawBarChart(scoreDistribution, 10, yPos, 120, 60, 'Distribusi Skor Keseluruhan');
    }

    // Download PDF
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);

    return { success: true, message: 'Comprehensive PDF file downloaded successfully' };
  } catch (error) {
    console.error('Error exporting comprehensive PDF:', error);
    return { success: false, error: error.message };
  }
};

// Export detailed data to Excel (including student data and AI suggestions)
export const exportDetailedToExcel = (schools, filename = 'detailed_schools_data') => {
  try {
    const wb = XLSX.utils.book_new();

    // Main schools data sheet
    const mainData = schools.map(school => {
      const { schoolName, grade, program } = extractSchoolInfo(school.id);
      
      return {
        'ID': school.id,
        'Nama Sekolah': schoolName,
        'Kelas': `${grade} ${program}`,
        'Status': getStatusLabel(school.status),
        'Jumlah Siswa': school.studentCount || 0,
        'Observer': school.observerName || 'N/A',
        'Peran Observer': school.observerRole || 'N/A',
        'Tanggal Dibuat': formatDate(school.createdAt),
        'Terakhir Diupdate': formatDate(school.uploadedAt),
        'Versi': school.version || 'N/A'
      };
    });

    const mainWs = XLSX.utils.json_to_sheet(mainData);
    XLSX.utils.book_append_sheet(wb, mainWs, 'Schools Overview');

    // Student data sheet
    const studentData = [];
    schools.forEach(school => {
      const { schoolName } = extractSchoolInfo(school.id);
      
      if (school.studentScores && school.answers) {
        Object.keys(school.studentScores).forEach(studentId => {
          const scores = school.studentScores[studentId];
          const answers = school.answers[studentId];
          
          Object.keys(scores).forEach(skill => {
            studentData.push({
              'Sekolah': schoolName,
              'ID Sekolah': school.id,
              'ID Siswa': studentId,
              'Skill': skill,
              'Skor Numerik': scores[skill],
              'Jawaban Kualitatif': answers[skill] || 'N/A'
            });
          });
        });
      }
    });

    if (studentData.length > 0) {
      const studentWs = XLSX.utils.json_to_sheet(studentData);
      XLSX.utils.book_append_sheet(wb, studentWs, 'Student Data');
    }

    // AI Suggestions sheet
    const aiData = [];
    schools.forEach(school => {
      const { schoolName } = extractSchoolInfo(school.id);
      
      if (school.aiSuggestions && school.aiSuggestions.length > 0) {
        school.aiSuggestions.forEach((suggestion, index) => {
          aiData.push({
            'Sekolah': schoolName,
            'ID Sekolah': school.id,
            'No Saran': index + 1,
            'Saran AI': suggestion
          });
        });
      }
    });

    if (aiData.length > 0) {
      const aiWs = XLSX.utils.json_to_sheet(aiData);
      XLSX.utils.book_append_sheet(wb, aiWs, 'AI Suggestions');
    }

    // Generate and download file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'Detailed Excel file downloaded successfully' };
  } catch (error) {
    console.error('Error exporting detailed data to Excel:', error);
    return { success: false, error: error.message };
  }
};

// Export to Excel with specific format for assessment report
export const exportAssessmentReportExcel = (school, filename = 'assessment_report') => {
  try {
    const wb = XLSX.utils.book_new();
    
    // Extract school info
    const { schoolName, grade, program } = extractSchoolInfo(school.id);
    
    // Prepare header data
    const headerData = [
      ['DATA ASSESSMENT SOFT SKILLS'],
      [''],
      [''],
      [`Tanggal: ${formatDate(school.createdAt)}`],
      [`Sekolah: ${schoolName}`],
      [`Kelas: ${grade}`],
      [`Program Keahlian: ${school.programKeahlian}`],
      [`Observer: ${school.observerName || 'N/A'}`],
      [''],
      [''],
      ['Alur Pembelajaran', 'Butir Observasi']
    ];
    
    // Add student columns
    if (school.studentScores && school.answers) {
      const students = Object.keys(school.studentScores);
      students.forEach(studentId => {
        headerData[10].push(studentId); // Add student ID to header row
      });
    }
    
    // Prepare assessment data
    const assessmentData = [];
    
    if (school.studentScores && school.answers) {
      const students = Object.keys(school.studentScores);
      const firstStudent = students[0];
      
      if (firstStudent && school.studentScores[firstStudent]) {
        // Get all skills from first student
        const skills = Object.keys(school.studentScores[firstStudent]);
        
        skills.forEach(skill => {
          const row = [];
          
          // Extract learning phase from skill name
          let learningPhase = '';
          if (skill.includes('Persiapan')) {
            learningPhase = 'Persiapan';
          } else if (skill.includes('Pelaksanaan')) {
            learningPhase = 'Pelaksanaan';
          } else if (skill.includes('Refleksi')) {
            learningPhase = 'Refleksi & Tindak Lanjut';
          }
          
          row.push(learningPhase);
          row.push(skill);
          
          // Add answers for each student
          students.forEach(studentId => {
            const answer = school.answers[studentId] ? school.answers[studentId][skill] : 'N/A';
            row.push(answer || 'N/A');
          });
          
          assessmentData.push(row);
        });
      }
    }
    
    // Combine header and data
    const allData = [...headerData, ...assessmentData];
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(allData);
    
    // Set column widths
    const colWidths = [
      { wch: 20 }, // Alur Pembelajaran
      { wch: 60 }, // Butir Observasi
    ];
    
    // Add width for student columns
    if (school.studentScores && school.answers) {
      const students = Object.keys(school.studentScores);
      students.forEach(() => {
        colWidths.push({ wch: 15 }); // Student columns
      });
    }
    
    ws['!cols'] = colWidths;
    
    // Style the header
    const headerRange = XLSX.utils.decode_range(ws['!ref']);
    
    // Style title row (row 1) - Make it bigger and bolder
    if (ws['A1']) {
      ws['A1'].s = {
        font: { bold: true, size: 20 },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }
    
    // Style information rows (rows 4-8) - Make them bold
    for (let row = 3; row <= 7; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { bold: true, size: 12 }
        };
      }
    }
    
    // Style header row (row 11) - Table headers
    const headerRow = 11;
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRow - 1, c: col });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { bold: true, size: 14 },
          fill: { fgColor: { rgb: "2196F3" } }, // Blue background
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'medium', color: { rgb: "000000" } },
            bottom: { style: 'medium', color: { rgb: "000000" } },
            left: { style: 'thin', color: { rgb: "000000" } },
            right: { style: 'thin', color: { rgb: "000000" } }
          }
        };
      }
    }
    
    // Style data rows with borders
    const dataStartRow = 12; // Data starts from row 12
    for (let row = dataStartRow; row <= headerRange.e.r; row++) {
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (ws[cellAddress]) {
          ws[cellAddress].s = {
            border: {
              top: { style: 'thin', color: { rgb: "CCCCCC" } },
              bottom: { style: 'thin', color: { rgb: "CCCCCC" } },
              left: { style: 'thin', color: { rgb: "CCCCCC" } },
              right: { style: 'thin', color: { rgb: "CCCCCC" } }
            },
            alignment: { vertical: 'center' }
          };
        }
      }
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Assessment Report');
    
    // Generate and download file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'Assessment report Excel file downloaded successfully' };
  } catch (error) {
    console.error('Error exporting assessment report to Excel:', error);
    return { success: false, error: error.message };
  }
};
