interface CardData {
  headline: string;
  subheadline?: string;
  body?: string;
  tag: string;
  layout?: string;
  highlightWord?: string;
  listItems?: { label: string; detail: string }[];
  beforeItems?: string[];
  afterItems?: string[];
}

interface ImageSize {
  width: number;
  height: number;
}

interface GradientMood {
  name: string;
  colorTop: string;
  colorBottom: string;
}

export function PhotoCard({
  data,
  size,
  photoSrc,
  mood,
  accent,
  footerLabel,
}: {
  data: CardData;
  size: ImageSize;
  photoSrc: string;
  mood: GradientMood;
  accent: string;
  footerLabel: string;
}) {
  const isSquare = size.height === size.width;
  const isPortrait = size.height > size.width;
  const pad = isSquare ? 64 : isPortrait ? 56 : 48;
  const headlineSize = isSquare ? 58 : isPortrait ? 54 : 44;
  const subSize = isSquare ? 21 : isPortrait ? 19 : 17;
  const bodySize = isSquare ? 18 : 16;

  const hasListItems = data.layout === "numbered-list" && data.listItems && data.listItems.length > 0;
  const hasStatGrid = data.layout === "stat-grid" && data.listItems && data.listItems.length > 0;
  const hasSplit = data.layout === "split" && data.beforeItems && data.afterItems;

  const fallbackBg = mood.colorBottom.replace(/[\d.]+\)$/, "1)");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: size.width,
        height: size.height,
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter",
        // satori throws on `background: undefined`, so omit the key when a photo is set
        ...(photoSrc ? {} : { background: fallbackBg }),
      }}
    >
      {photoSrc ? (
        <img
          src={photoSrc}
          width={size.width}
          height={size.height}
          style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        />
      ) : null}

      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          width: size.width,
          height: size.height,
          background: `linear-gradient(180deg, ${mood.colorTop} 0%, ${mood.colorTop} 20%, ${mood.colorBottom} 65%, ${mood.colorBottom} 100%)`,
        }}
      />

      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${accent}cc, ${accent}66)`,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: pad,
          paddingTop: pad + 4,
          position: "relative",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", width: 32, height: 3, background: accent, borderRadius: 2 }} />
          <div
            style={{
              display: "flex",
              fontSize: 12,
              fontWeight: 600,
              color: accent,
              letterSpacing: 3.5,
              fontFamily: "Inter",
              padding: "5px 14px",
              background: `${accent}1a`,
              borderRadius: 6,
              border: `1px solid ${accent}33`,
            }}
          >
            {data.tag}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: headlineSize,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.12,
              fontFamily: "Poppins",
              letterSpacing: -1,
            }}
          >
            {data.highlightWord
              ? renderHighlightedText(data.headline, data.highlightWord, accent)
              : data.headline}
          </div>

          {data.subheadline ? (
            <div
              style={{
                display: "flex",
                fontSize: subSize,
                color: "rgba(255,255,255,0.75)",
                marginTop: 16,
                lineHeight: 1.5,
                maxWidth: "90%",
                fontFamily: "Inter",
                fontWeight: 400,
              }}
            >
              {data.subheadline}
            </div>
          ) : null}

          {data.body && !data.layout ? (
            <div
              style={{
                display: "flex",
                fontSize: bodySize,
                color: "rgba(255,255,255,0.7)",
                marginTop: 18,
                lineHeight: 1.6,
                maxWidth: "88%",
                fontFamily: "Inter",
                fontWeight: 400,
              }}
            >
              {data.body}
            </div>
          ) : null}

          {hasStatGrid ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 28, width: "100%" }}>
              {data.listItems!.slice(0, 4).map((item, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", width: "47%", padding: "20px 18px", background: "rgba(255,255,255,0.08)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)" }}>
                  <div style={{ display: "flex", fontSize: 38, fontWeight: 700, color: accent, fontFamily: "Poppins", lineHeight: 1, letterSpacing: -1 }}>{item.label}</div>
                  {item.detail ? <div style={{ display: "flex", fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 8, lineHeight: 1.4, fontFamily: "Inter" }}>{item.detail}</div> : null}
                </div>
              ))}
            </div>
          ) : null}

          {hasListItems ? (
            <div style={{ display: "flex", flexDirection: "column", marginTop: 24, gap: 8, width: "100%" }}>
              {data.listItems!.slice(0, isSquare ? 5 : 3).map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 16px", background: "rgba(255,255,255,0.06)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 10, background: accent, fontSize: 15, fontWeight: 700, color: "#000000", fontFamily: "Poppins", flexShrink: 0 }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ display: "flex", fontSize: isSquare ? 19 : 16, fontWeight: 700, color: "#ffffff", fontFamily: "Poppins", lineHeight: 1.2 }}>{item.label}</div>
                    {item.detail ? <div style={{ display: "flex", fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 4, lineHeight: 1.3, fontFamily: "Inter" }}>{item.detail}</div> : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {hasSplit ? (
            <div style={{ display: "flex", gap: 16, marginTop: 24, width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", width: "48%", padding: "18px 16px", background: "rgba(239, 68, 68, 0.1)", borderRadius: 12, border: "1px solid rgba(239,68,68,0.2)" }}>
                <div style={{ display: "flex", fontSize: 11, fontWeight: 700, color: "#ef4444", letterSpacing: 3, marginBottom: 14, fontFamily: "Inter" }}>BEFORE</div>
                {data.beforeItems!.map((item, i) => (
                  <div key={i} style={{ display: "flex", fontSize: 14, color: "rgba(255,255,255,0.65)", marginBottom: 8, lineHeight: 1.4, gap: 8, fontFamily: "Inter" }}>
                    <div style={{ display: "flex", color: "#ef4444", flexShrink: 0 }}>x</div>
                    <div style={{ display: "flex" }}>{item}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", width: "48%", padding: "18px 16px", background: "rgba(34, 197, 94, 0.1)", borderRadius: 12, border: "1px solid rgba(34,197,94,0.2)" }}>
                <div style={{ display: "flex", fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: 3, marginBottom: 14, fontFamily: "Inter" }}>AFTER</div>
                {data.afterItems!.map((item, i) => (
                  <div key={i} style={{ display: "flex", fontSize: 14, color: "rgba(255,255,255,0.65)", marginBottom: 8, lineHeight: 1.4, gap: 8, fontFamily: "Inter" }}>
                    <div style={{ display: "flex", color: "#22c55e", flexShrink: 0 }}>+</div>
                    <div style={{ display: "flex" }}>{item}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {data.body && data.layout && (isSquare || isPortrait) ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 20, padding: "18px 22px", background: "rgba(255,255,255,0.05)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", width: 4, minHeight: 36, background: accent, borderRadius: 3, flexShrink: 0 }} />
              <div style={{ display: "flex", fontSize: 15, color: "rgba(255,255,255,0.7)", fontWeight: 500, lineHeight: 1.5, fontFamily: "Inter" }}>{data.body}</div>
            </div>
          ) : null}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 500, fontFamily: "Inter", letterSpacing: 0.5 }}>{footerLabel}</div>
            <div style={{ display: "flex", width: 8, height: 8, borderRadius: 9999, background: accent, opacity: 0.5 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function renderHighlightedText(text: string, highlightWord: string, accent: string): JSX.Element[] {
  const idx = text.toLowerCase().indexOf(highlightWord.toLowerCase());
  if (idx === -1) return [<>{text}</>];

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + highlightWord.length);
  const after = text.slice(idx + highlightWord.length);

  const elements: JSX.Element[] = [];
  if (before) elements.push(<div style={{ display: "flex" }}>{before}</div>);
  elements.push(
    <div style={{ display: "flex", color: accent, marginLeft: before ? 12 : 0, marginRight: after ? 12 : 0 }}>{match}</div>,
  );
  if (after) elements.push(<div style={{ display: "flex" }}>{after}</div>);
  return elements;
}
