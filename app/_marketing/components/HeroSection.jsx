"use client";

import { useRef, useState } from "react";

export default function HeroSection() {
  const showcaseRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPressed, setIsPressed] = useState(false);

  function playShowreel() {
    setIsPressed(true);
    window.setTimeout(() => setIsPressed(false), 200);
  }

  async function toggleFullscreen() {
    const showcase = showcaseRef.current;
    if (!showcase) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
      return;
    }

    await showcase.requestFullscreen().catch(() => {});
  }

  return (
    <div className="hero-container">
      {" "}
      <p className="hero-tag">
        {"HELPED 20+ FOUNDERS BUILD "}
        <b>
          {"DIGITAL PRODUCTS"}
        </b>
      </p>
      {" "}
      <h1 className="hero-modern-title">
        {" The "}
        <span className="hero-logo-badge" title="8bitbrains">
          <img src="/logo1.png" alt="8bitbrains logo" />
        </span>
        {" studio "}
        <span className="muted-text">
          {"for brands"}
        </span>
        <br />
        {" "}
        <span className="muted-text">
          {"who simply"}
        </span>
        {" can't afford to"}
        <br />
        {" be average "}
      </h1>
      {" "}
      <div className="hero-buttons">
        {" "}
        <a href="mailto:nectarsof@gmail.com" className="hero-pill-btn">
          {" "}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{"flexShrink":"0"}}>
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
          </svg>
          {" "}
          <span>
            {"Start Project"}
          </span>
          {" "}
        </a>
        {" "}
        <a href="#pricing" className="hero-pill-btn">
          {" "}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{"flexShrink":"0"}}>
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          {" "}
          <span>
            {"See Pricing"}
          </span>
          {" "}
        </a>
        {" "}
      </div>
      {" "}
      {" "}
      <div className="hero-showcase-card" ref={showcaseRef}>
        {" "}
        <div className="hero-video-viewport">
          {" "}
          <img src="/grass-hill.png" alt="8bitbrains Showreel Hill" className="hero-showcase-hill" />
          {" "}
          <div className="hero-watermark-wrap">
            {" "}
            <img src="/logo1.png" alt="8 logo" className="hero-watermark-logo" />
            {" "}
            <span className="hero-watermark-text">
              {"8BITBRAINS"}
            </span>
            {" "}
          </div>
          {" "}
          <button type="button" className={`hero-play-button${isPressed ? " is-pressed" : ""}`} title="Play Showreel" aria-label="Play Showreel" onClick={playShowreel}>
            {" "}
            <svg width="22" height="24" viewBox="0 0 22 24" fill="#ffffff">
              {" "}
              <polygon points="3,1 20,12 3,23"></polygon>
              {" "}
            </svg>
            {" "}
          </button>
          {" "}
        </div>
        {" "}
        <div className="hero-controls-bar">
          {" "}
          <div className="hero-controls-left">
            {" "}
            <button type="button" className="hero-ctrl-icon-btn" title="Play/Pause">
              {" "}
              <svg width="13" height="13" viewBox="0 0 14 14" fill="#233F53">
                {" "}
                <polygon points="2,1 12,7 2,13"></polygon>
                {" "}
              </svg>
              {" "}
            </button>
            {" "}
            <button type="button" className="hero-ctrl-pill" id="heroMuteToggle" aria-pressed={!isMuted} onClick={() => setIsMuted((muted) => !muted)}>
              {" "}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#233F53" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                {" "}
                <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                {" "}
                <line x1="23" y1="9" x2="17" y2="15"></line>
                {" "}
                <line x1="17" y1="9" x2="23" y2="15"></line>
                {" "}
              </svg>
              {" "}
              <span>
                {isMuted ? "Mute" : "Sound On"}
              </span>
              {" "}
            </button>
            {" "}
          </div>
          {" "}
          <div className="hero-controls-right">
            {" "}
            <button type="button" className="hero-ctrl-pill" id="heroFullscreenToggle" onClick={toggleFullscreen}>
              {" "}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#233F53" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                {" "}
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                {" "}
              </svg>
              {" "}
              <span>
                {"Full Screen"}
              </span>
              {" "}
            </button>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </div>
  );
}
