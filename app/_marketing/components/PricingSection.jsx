"use client";

import { useState } from "react";

const serviceDetails = {
  landing: {
    heading: "LANDING PAGE",
    duration: "⏱ 5-7 Days",
    preview: "LANDING PAGE DESIGN",
    price: 5149,
  },
  branding: {
    heading: "BRANDING",
    duration: "⏱ 10-15 Days",
    preview: "FULL BRANDING BY 8BITBRAINS",
    price: 9999,
  },
  mobile: {
    heading: "MOBILE APP (iOS & ANDROID)",
    duration: "⏱ 30-45 Days",
    preview: "FULL APP (APP STORE + PLAY STORE)",
    price: 150000,
  },
};

const landingFeatures = [
  "Custom Wireframe & High-Converting Layout",
  "Desktop, Tablet & Mobile Responsive",
  "Full Figma System & Assets",
  "No Limit to revisions",
  "Delivered within 5-7 days",
];

const brandingFeatures = [
  "Logo, typography, colors",
  "Brand assets & iconography",
  "Social Media Templates",
  "Brand guidelines & vector source",
  "5 full brand explorations",
  "Ready-to-use brand kit",
];

const mobileFeatures = [
  "End-to-End App Developed from Scratch",
  "Published on both iOS App Store & Android Play Store",
  "Complete UI/UX Design System in Figma",
  "Backend APIs, Database & User Authentication",
  "Push Notifications, Analytics & Payment Gateway",
  "Store Review Submission & Approval Guarantee",
  "100% Full Source Code Ownership",
];

function CheckList({ items }) {
  return (
    <ul className="kree-checklist">
      {items.map((item) => (
        <li className="kree-check-item" key={item}>
          <span className="kree-check-icon">✓</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ProjectIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M22 2L11 13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function ProjectActions({ subject }) {
  return (
    <div className="kree-btn-group">
      <a href={`mailto:nectarsof@gmail.com?subject=${encodeURIComponent(subject)}`} className="kree-btn-start">
        <ProjectIcon />
        Start Project
      </a>
      <a href={`mailto:nectarsof@gmail.com?subject=${encodeURIComponent(subject.replace("Start Project", "Project Inquiry"))}`} className="kree-btn-message">
        <MessageIcon />
        Send a Message
      </a>
    </div>
  );
}

function LandingOptions({ development, setDevelopment, extraPages, setExtraPages }) {
  return (
    <>
      <div className="kree-card-header">
        <h3 className="kree-card-title">LANDING PAGE</h3>
        <span className="kree-badge-pill">⏱ 5-7 Days</span>
      </div>
      <div className={`kree-addon-box ${development ? "highlighted" : ""}`}>
        <div className="kree-addon-row-top">
          <div className="kree-addon-label-group">
            <span>Add Development</span>
            <div className="kree-tech-badges">
              <span className="kree-tech-badge tech-next" title="Next.js">N</span>
              <span className="kree-tech-badge tech-webflow" title="Webflow">W</span>
              <span className="kree-tech-badge tech-framer" title="Framer">F</span>
            </div>
          </div>
          <label className="kree-toggle-switch">
            <input type="checkbox" checked={development} onChange={(event) => setDevelopment(event.target.checked)} aria-label="Add development" />
            <span className="kree-toggle-slider" />
          </label>
        </div>
        <div className="kree-addon-price-sub">+₹1,200 (Clean Code & Deployment)</div>
      </div>
      <div className="kree-feature-row">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="kree-feature-title">Extra Pages</span>
          <div className="kree-stepper-pill blue-stepper">
            <button type="button" className="kree-stepper-btn" aria-label="Decrease extra pages" onClick={() => setExtraPages((count) => Math.max(0, count - 1))}>−</button>
            <span className="kree-stepper-val">{extraPages}</span>
            <button type="button" className="kree-stepper-btn" aria-label="Increase extra pages" onClick={() => setExtraPages((count) => Math.min(20, count + 1))}>+</button>
          </div>
        </div>
        <span className="kree-feature-rate">+₹300/PAGE</span>
      </div>
      <CheckList items={landingFeatures} />
    </>
  );
}

function ServiceDetails({ service, development, setDevelopment, extraPages, setExtraPages }) {
  if (service === "landing") {
    return <LandingOptions development={development} setDevelopment={setDevelopment} extraPages={extraPages} setExtraPages={setExtraPages} />;
  }

  if (service === "branding") {
    return (
      <>
        <div className="kree-card-header">
          <h3 className="kree-card-title">BRANDING</h3>
          <span className="kree-badge-pill">⏱ 10-15 Days</span>
        </div>
        <CheckList items={brandingFeatures} />
      </>
    );
  }

  return (
    <>
      <div className="kree-card-header">
        <h3 className="kree-card-title">MOBILE APP (iOS & ANDROID)</h3>
        <span className="kree-badge-pill">⏱ 30-45 Days</span>
      </div>
      <div className="kree-appstore-banner">
        <span>📱</span>
        <span>Developed from scratch & published on <b>Apple App Store</b> and <b>Google Play Store</b></span>
      </div>
      <CheckList items={mobileFeatures} />
    </>
  );
}

function ServicePreview({ label, price }) {
  return (
    <div className="kree-gradient-card blue-card">
      <svg className="kree-card-watermark" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="45" stroke="#ffffff" strokeWidth="5" opacity="0.35" />
        <path d="M30 50h40M50 30v40" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.35" />
        <circle cx="50" cy="50" r="16" fill="#ffffff" opacity="0.2" />
        <path d="M36 40c0-6 6-10 14-10s14 4 14 10-6 8-14 14v4" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.25" />
      </svg>
      <div className="kree-watermark-logo">8BITBRAINS</div>
      <div className="kree-card-details">
        <span className="kree-card-service-label">{label}</span>
        <div className="kree-card-price-row">
          <div className="kree-card-price-value">₹{price.toLocaleString("en-IN")}</div>
        </div>
      </div>
    </div>
  );
}

function RetainerCard({ activeTasks, setActiveTasks }) {
  const monthlyPrice = activeTasks === 1 ? 9999 : 9999 + (activeTasks - 1) * 7500;
  const retainerFeatures = [
    "Desktop, Tablet, Mobile Responsive",
    "Figma File",
    "No Limit to revisions",
    "Updates every 48 hours",
    "Includes all the services",
  ];
  const serviceTags = ["Landing Page", "Logo", "Mobile Apps", "Web Apps", "Product Design", "Social Media Graphics", "UI/UX Systems"];

  return (
    <div className="kree-pricing-card">
      <div className="kree-card-left">
        <h3 className="kree-card-title" style={{ marginBottom: 16 }}>8BITBRAINS RETAINER</h3>
        <div className="kree-stepper-row">
          <span className="kree-check-icon">✓</span>
          <div className="kree-stepper-pill">
            <button type="button" className="kree-stepper-btn" aria-label="Decrease active tasks" onClick={() => setActiveTasks((count) => Math.max(1, count - 1))}>−</button>
            <span className="kree-stepper-val">{activeTasks}</span>
            <button type="button" className="kree-stepper-btn" aria-label="Increase active tasks" onClick={() => setActiveTasks((count) => Math.min(3, count + 1))}>+</button>
          </div>
          <span className="kree-stepper-text">Active Task{activeTasks > 1 ? "s" : ""}</span>
        </div>
        <CheckList items={retainerFeatures} />
        <div className="kree-tags-grid">
          {serviceTags.map((tag) => <span className="kree-tag-item" key={tag}>{tag}</span>)}
        </div>
      </div>
      <div className="kree-card-right">
        <div className="kree-gradient-card green-card">
          <svg className="kree-card-watermark" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="45" stroke="#1F4500" strokeWidth="5" opacity="0.22" />
            <path d="M30 50h40M50 30v40" stroke="#1F4500" strokeWidth="5" strokeLinecap="round" opacity="0.22" />
            <circle cx="50" cy="50" r="16" fill="#1F4500" opacity="0.12" />
          </svg>
          <div className="kree-watermark-logo">8BITBRAINS</div>
          <div className="kree-card-details">
            <span className="kree-card-service-label">8BITBRAINS RETAINER SERVICE</span>
            <div className="kree-card-price-row">
              <div className="kree-card-price-value">₹{monthlyPrice.toLocaleString("en-IN")}/mo</div>
            </div>
          </div>
        </div>
        <ProjectActions subject="Retainer Plan - 8bitbrains" />
      </div>
    </div>
  );
}

export default function PricingSection() {
  const [currentService, setCurrentService] = useState("landing");
  const [development, setDevelopment] = useState(false);
  const [extraPages, setExtraPages] = useState(0);
  const [activeTasks, setActiveTasks] = useState(1);

  const service = serviceDetails[currentService];
  const price = service.price + (currentService === "landing" ? (development ? 1200 : 0) + extraPages * 300 : 0);

  return (
    <>
      <div className="section-divider" id="pricing">
        <div className="line" style={{ flex: "0 0 20px" }} />
        <span className="label">Pricing</span>
        <div className="line" />
      </div>
      <div className="story-section" style={{ marginTop: 20, maxWidth: 900 }}>
        <p className="story-text">You can choose between <strong>One-time plan</strong>, or a <strong>Retainer plan</strong> (fixed monthly price), whatever works best for you.</p>
        <div className="pricing-outer-frame">
          <div className="pricing-tabs-wrapper" role="tablist" aria-label="Service pricing">
            {[["landing", "Landing Page"], ["branding", "Branding"], ["mobile", "Mobile Apps (iOS + Android)"]].map(([key, label]) => (
              <button key={key} type="button" className={`kree-tab-btn ${currentService === key ? "active" : ""}`} aria-pressed={currentService === key} onClick={() => setCurrentService(key)}>{label}</button>
            ))}
          </div>
          <div className="kree-pricing-card">
            <div className="kree-card-left">
              <ServiceDetails service={currentService} development={development} setDevelopment={setDevelopment} extraPages={extraPages} setExtraPages={setExtraPages} />
            </div>
            <div className="kree-card-right">
              <ServicePreview label={service.preview} price={price} />
              <ProjectActions subject="Start Project - 8bitbrains" />
            </div>
          </div>
          <hr className="kree-divider-sep" />
          <RetainerCard activeTasks={activeTasks} setActiveTasks={setActiveTasks} />
        </div>
      </div>
    </>
  );
}
