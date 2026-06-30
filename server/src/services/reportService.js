const PDFDocument = require("pdfkit");

function writeList(doc, title, items) {
  doc.moveDown(0.7).fontSize(13).fillColor("#0f172a").text(title);
  doc.fontSize(10).fillColor("#334155");

  if (!items || items.length === 0) {
    doc.text("No data available.");
    return;
  }

  items.forEach((item) => {
    doc.text(`- ${item}`);
  });
}

function streamInterviewReport(res, interview, user) {
  const doc = new PDFDocument({ margin: 48 });
  const fileName = `interview-report-${interview._id}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  doc.pipe(res);
  doc.fontSize(22).fillColor("#111827").text("InterviewFlow AI Report");
  doc.moveDown(0.5).fontSize(11).fillColor("#475569");
  doc.text(`Candidate: ${user.name}`);
  doc.text(`Email: ${user.email}`);
  doc.text(`Difficulty: ${interview.difficulty}`);
  doc.text(`Company: ${interview.company || "General"}`);
  doc.text(`Score: ${interview.feedback && interview.feedback.score ? interview.feedback.score : 0}/100`);

  writeList(doc, "Strengths", interview.feedback && interview.feedback.strengths);
  writeList(doc, "Weaknesses", interview.feedback && interview.feedback.weaknesses);
  writeList(doc, "Improvement Suggestions", interview.feedback && interview.feedback.suggestions);

  doc.moveDown(1).fontSize(13).fillColor("#0f172a").text("Question Review");
  doc.fontSize(10).fillColor("#334155");
  interview.questions.forEach((question, index) => {
    doc.moveDown(0.5).font("Helvetica-Bold").text(`${index + 1}. ${question.question}`);
    doc.font("Helvetica").text(`Type: ${question.type} | Skill: ${question.skill || "General"}`);
    if (question.expectedAnswer) {
      doc.text(`Expected: ${question.expectedAnswer}`);
    }
  });

  doc.end();
}

module.exports = {
  streamInterviewReport
};
