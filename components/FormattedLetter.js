import { parseLetter } from "../lib/markdownLite";

function renderRuns(runs) {
  return runs.map((r, i) => (r.bold ? <strong key={i}>{r.text}</strong> : <span key={i}>{r.text}</span>));
}

export default function FormattedLetter({ text }) {
  const blocks = parseLetter(text);
  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === "h1") return <h1 key={i}>{renderRuns(b.runs)}</h1>;
        if (b.type === "h2") return <h2 key={i}>{renderRuns(b.runs)}</h2>;
        if (b.type === "h3") return <h3 key={i}>{renderRuns(b.runs)}</h3>;
        return <p key={i}>{renderRuns(b.runs)}</p>;
      })}
    </>
  );
}
