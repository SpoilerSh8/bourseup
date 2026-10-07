import { jsPDF } from "jspdf";
import { parseLetter } from "./markdownLite";

const MARGIN = 20;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 7;

function sizeFor(type) {
  if (type === "h1") return 16;
  if (type === "h2") return 13;
  if (type === "h3") return 11.5;
  return 11;
}

function wrapRuns(doc, runs, fontSize, forceBold) {
  const words = [];
  runs.forEach((run) => {
    run.text.split(/(\s+)/).forEach((token) => {
      if (token.trim() === "") return;
      words.push({ text: token, bold: run.bold || forceBold });
    });
  });

  const lines = [];
  let current = [];
  let width = 0;

  words.forEach((word) => {
    doc.setFont("helvetica", word.bold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    const w = doc.getTextWidth(word.text + " ");
    if (width + w > MAX_WIDTH && current.length > 0) {
      lines.push(current);
      current = [];
      width = 0;
    }
    current.push(word);
    width += w;
  });
  if (current.length) lines.push(current);
  return lines;
}

export function downloadLetterPdf(rawText, filename = "lettre.pdf", header = null) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  if (header?.name || header?.email) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    if (header.name) {
      doc.text(header.name, PAGE_WIDTH - MARGIN, y, { align: "right" });
      y += 5;
    }
    if (header.email) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text(header.email, PAGE_WIDTH - MARGIN, y, { align: "right" });
      y += 5;
    }
    y += 6;
  }

  const blocks = parseLetter(rawText);

  blocks.forEach((block) => {
    const fontSize = sizeFor(block.type);
    const isHeading = block.type.startsWith("h");
    const lines = wrapRuns(doc, block.runs, fontSize, isHeading);

    lines.forEach((line) => {
      if (y > PAGE_HEIGHT - MARGIN) {
        doc.addPage();
        y = MARGIN;
      }
      let x = MARGIN;
      line.forEach((word) => {
        doc.setFont("helvetica", word.bold ? "bold" : "normal");
        doc.setFontSize(fontSize);
        doc.text(word.text, x, y);
        x += doc.getTextWidth(word.text + " ");
      });
      y += LINE_HEIGHT * (fontSize / 11);
    });
    y += isHeading ? 3 : 5;
  });

  doc.save(filename);
}
