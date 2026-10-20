export default function StoryOpening() {
  return (
    <>
      <div className="section-divider" style={{"marginTop":"80px"}}>
        {" "}
        <div className="line"></div>
        {" "}
      </div>
      <div className="story-section" style={{"marginTop":"20px"}}>
        {" "}
        <p className="story-text">
          {"We too love the process of building a product of our own...."}
          <br />
          {"An Idea, "}
          <span className="sketch-text">
            {"A Sketch"}
          </span>
          {", A feeling that this could become something real"}
          <span className="store-badges">
            <span className="store-badge app-store-badge" title="App Store">
              <svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="app-store-icon-gradient" x1="16" y1="0" x2="16" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#16C8F5"></stop>
                    <stop offset="1" stopColor="#0865F5"></stop>
                  </linearGradient>
                </defs>
                <rect width="32" height="32" rx="7" fill="url(#app-store-icon-gradient)"></rect>
                <path d="m11 22 9.8-16M15.2 6l9.8 16M8.8 17.7h15" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </span>
            <span className="store-badge play-store-badge" title="Google Play Store">
              <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
                <defs>
                  <clipPath id="google-play-icon-shape">
                    <path d="M5 2.7 28.8 14.9c1.5.8 1.5 1.5 0 2.3L5 29.3c-1.3.7-2.3 0-2.3-1.5V4.2C2.7 2.8 3.7 2 5 2.7Z"></path>
                  </clipPath>
                </defs>
                <g clipPath="url(#google-play-icon-shape)">
                  <path d="M2.7 1.5 17 16 2.7 30.5Z" fill="#00C8FF"></path>
                  <path d="M2.7 1.5 24.5 11.8 17 16Z" fill="#00D76F"></path>
                  <path d="M2.7 30.5 24.5 20.2 17 16Z" fill="#F8334A"></path>
                  <path d="m17 16 7.5-4.2 6.8 3.3c1.4.7 1.4 2.1 0 2.8l-6.8 3.3Z" fill="#FFC629"></path>
                </g>
              </svg>
            </span>
          </span>
        </p>
        {" "}
        <p className="story-text" style={{"marginTop":"28px"}}>
          {"But then came the hard part...."}
          <span className="highlighter-green">
            {"“Finding designers.”"}
          </span>
        </p>
        {" "}
        <div style={{"marginTop":"28px"}}>
          {" "}
          <p className="story-text" style={{"marginBottom":"8px"}}>
            {"Explaining the vision again and again and again and again..."}
          </p>
          {" "}
          <p className="story-text" style={{"marginBottom":"8px"}}>
            {"One person for UI, Another for branding,"}
          </p>
          {" "}
          <p className="story-text" style={{"marginBottom":"8px"}}>
            {"Someone else for motion."}
          </p>
          {" "}
          <p className="story-text">
            {"Compromising, co-ordinating, waiting…"}
          </p>
          {" "}
        </div>
        {" "}
        <p className="story-text" style={{"marginTop":"28px"}}>
          {"Somewhere along the way, the product starts to feel less exciting, and trust us it’s not you or the designers."}
        </p>
        {" "}
      </div>
    </>
  );
}
