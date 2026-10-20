export default function AboutSection() {
  return (
    <>
      <div className="section-divider">
        {" "}
        <div className="line" style={{"flex":"0 0 20px"}}></div>
        {" "}
        <span className="label">
          {"About 8bitbrains"}
        </span>
        {" "}
        <div className="line"></div>
        {" "}
      </div>
      <div className="story-section" style={{"marginTop":"20px"}} id="services">
        {" "}
        <p className="about-tag">
          {"About 8bitbrains"}
        </p>
        {" "}
        <p className="story-text">
          {"There's a reason our logo is a 🧠 Brain. They are known for one thing:"}
        </p>
        {" "}
        <div className="versatility-badge">
          {"Versatility"}
        </div>
        {" "}
        <p className="story-text" style={{"marginTop":"24px"}}>
          {"That's how we approach design. We don't force one \"8bitbrains style\" onto everything..."}
          <br />
          {"Different products. Different audiences. Different energy. "}
        </p>
        {" "}
        <p className="story-text">
          {"We design and develop apps, websites, and digital products that feel native to "}
          <em>
            {"your"}
          </em>
          {" brand — not ours."}
        </p>
        {" "}
      </div>
      <div className="story-section" style={{"marginTop":"40px"}}>
        {" "}
        <p className="story-text">
          {"Okay, so you probably seen enough by now."}
        </p>
        {" "}
        <p className="story-text" style={{"marginBottom":"8px","fontWeight":"600"}}>
          {"The work makes sense."}
        </p>
        {" "}
        <p className="story-text" style={{"marginBottom":"8px","fontWeight":"600"}}>
          {"The approach feels familiar."}
        </p>
        {" "}
        <p className="story-text" style={{"marginBottom":"24px","fontWeight":"600"}}>
          {"And the process doesn't feel heavy. "}
        </p>
        {" "}
        <p className="story-text">
          {"The next step doesn't need convincing, it just needs a "}
          <span className="highlight">
            {"decision"}
          </span>
        </p>
        {" "}
      </div>
    </>
  );
}
