"use client"

import { useState } from "react"

const ACCENT     = "#8b5cf6"
const ACCENT_RGB = "139,92,246"

export default function ProfileImage() {
  const [hovered,  setHovered]  = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <div style={{ position: "relative" }}>

      {/* Ambient radial glow behind the card */}
      <div style={{
        position:      "absolute",
        inset:         "-16px",
        borderRadius:  "36px",
        background:    `radial-gradient(ellipse at center, rgba(${ACCENT_RGB},${hovered ? 0.16 : 0.08}) 0%, transparent 70%)`,
        transition:    "all 0.5s ease",
        pointerEvents: "none",
      }} />

      {/* Image frame */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position:     "relative",
          width:        "100%",
          borderRadius: "18px",
          overflow:     "hidden",
          border:       `1px solid rgba(${ACCENT_RGB},${hovered ? 0.38 : 0.18})`,
          boxShadow:    hovered
            ? `0 24px 64px rgba(0,0,0,0.55), 0 0 48px rgba(${ACCENT_RGB},0.22)`
            : `0 16px 48px rgba(0,0,0,0.45), 0 0 20px rgba(${ACCENT_RGB},0.10)`,
          transform:    hovered ? "translateY(-5px) scale(1.025)" : "translateY(0) scale(1)",
          transition:   "all 0.4s cubic-bezier(0.16,1,0.3,1)",
          cursor:       "default",
        }}
      >
        {/* 4:5 portrait aspect ratio container */}
        <div style={{ paddingBottom: "125%", position: "relative" }}>

          {!imgError ? (
            <img
              src="/profile.jpg"
              alt="Frank Yu"
              loading="lazy"
              onError={() => setImgError(true)}
              style={{
                position:     "absolute",
                inset:        0,
                width:        "100%",
                height:       "100%",
                objectFit:    "cover",
                objectPosition: "center top",
              }}
            />
          ) : (
            /* Fallback placeholder when image is missing */
            <div style={{
              position:       "absolute",
              inset:          0,
              background:     `linear-gradient(145deg, rgba(${ACCENT_RGB},0.12) 0%, rgba(8,6,20,0.96) 100%)`,
              display:        "flex",
              flexDirection:  "column",
              alignItems:     "center",
              justifyContent: "center",
              gap:            "10px",
            }}>
              <div style={{
                width:          "56px",
                height:         "56px",
                borderRadius:   "50%",
                background:     `rgba(${ACCENT_RGB},0.12)`,
                border:         `1px solid rgba(${ACCENT_RGB},0.28)`,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
              }}>
                <span style={{ fontSize: "18px", fontFamily: "monospace", color: `rgba(${ACCENT_RGB},0.55)`, letterSpacing: "0.05em" }}>FY</span>
              </div>
              <p style={{ margin: 0, fontSize: "8.5px", fontFamily: "monospace", color: "rgba(255,255,255,0.18)", letterSpacing: "0.12em", textAlign: "center", padding: "0 12px" }}>
                ADD /public/profile.jpg
              </p>
            </div>
          )}

          {/* Bottom fade — blends image into card background */}
          <div style={{
            position:      "absolute",
            bottom:        0, left: 0, right: 0,
            height:        "38%",
            background:    "linear-gradient(to top, rgba(8,6,20,0.88) 0%, transparent 100%)",
            pointerEvents: "none",
          }} />

          {/* Hover sheen overlay */}
          <div style={{
            position:      "absolute",
            inset:         0,
            background:    `linear-gradient(135deg, rgba(${ACCENT_RGB},0.06) 0%, transparent 55%)`,
            opacity:        hovered ? 1 : 0,
            transition:    "opacity 0.4s ease",
            pointerEvents: "none",
          }} />
        </div>

        {/* Caption — bottom of image */}
        <div style={{ position: "absolute", bottom: "12px", left: "14px", right: "14px" }}>
          <p style={{
            margin:        0,
            fontSize:      "9px",
            fontFamily:    "monospace",
            color:         "rgba(255,255,255,0.32)",
            letterSpacing: "0.07em",
          }}>
            Calgary, AB · UBC CS
          </p>
        </div>
      </div>

    </div>
  )
}
