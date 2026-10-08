import { useState } from "react";
import EmbeddedLinkModal from "./EmbeddedLinkModal";

export default function ExternalLink({ href, children, className }) {
  const [open, setOpen] = useState(false);
  if (!href) return null;

  return (
    <>
      <a href={href} className={className} onClick={(e) => { e.preventDefault(); setOpen(true); }}>
        {children}
      </a>
      {open && <EmbeddedLinkModal url={href} onClose={() => setOpen(false)} />}
    </>
  );
}
