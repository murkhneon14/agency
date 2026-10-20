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
              <svg viewBox="0 0 32 30" width="32" height="30" fill="none">
                <rect width="32" height="30" rx="7" fill="#1D9BF0"></rect>
                <path d="M14.5 9.5l1.3-2.3c.3-.5 1-.7 1.5-.4.5.3.7 1 .4 1.5l-1.3 2.3m-1.9 1.1L10 19.3c-.3.5-.1 1.2.4 1.5.5.3 1.2.1 1.5-.4l4.2-7.5m-1.2 5.9h7.3c.6 0 1.1.5 1.1 1.1s-.5 1.1-1.1 1.1H11c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1h3.8" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
              </svg>
            </span>
            <span className="store-badge play-store-badge" title="Google Play Store">
              <svg viewBox="0 0 28 28" width="26" height="26">
                <path d="M6 5.2a1.3 1.3 0 00-.3 1v15.6c0 .4.1.8.3 1l9.1-9-9.1-8.6z" fill="#00C3FF"></path>
                <path d="M19.3 18.4l-4.2-4.6-9.1 8.6c.4.4 1 .5 1.6.2l11.7-6.2z" fill="#FF334B"></path>
                <path d="M15.1 13.8l4.2-4.6-11.7-6.2c-.6-.3-1.2-.2-1.6.2l9.1 10.6z" fill="#00E676"></path>
                <path d="M22.5 13.3l-3.2-1.7-4.2 4.2 4.2 4.2 3.2-1.7c1-.5 1-1.4 0-1.9z" fill="#FFD400"></path>
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
