export default function SolutionSection() {
  return (
    <>
      <div className="section-divider">
        {" "}
        <div className="line" style={{"flex":"0 0 20px"}}></div>
        {" "}
        <span className="label">
          {"What's the Solution?"}
        </span>
        {" "}
        <div className="line"></div>
        {" "}
      </div>
      <div className="story-section" style={{"marginTop":"20px","maxWidth":"820px"}}>
        {" "}
        <div className="built-headline">
          {" "}
          <span>
            {"That’s why we built"}
          </span>
          {" "}
          <span className="logo-badge">
            {" "}
            <img src="/logo1.png" alt="8bitbrains" />
            {" "}
            <span style={{"fontWeight":"700","color":"#304F67"}}>
              {"8BITBRAINS"}
            </span>
            {" "}
          </span>
          {" "}
        </div>
        {" "}
        {" "}
        <div className="polaroids-collage">
          {" "}
          {" "}
          <div className="polaroid-card" style={{"transform":"rotate(-2.5deg)"}}>
            {" "}
            <div className="pin pin-red" style={{"position":"absolute","top":"-10px","right":"14px","zIndex":"10","filter":"drop-shadow(0 4px 6px rgba(0,0,0,0.3))"}}>
              {" "}
              <svg width="24" height="32" viewBox="0 0 26 34" fill="none">
                {" "}
                <circle cx="13" cy="13" r="10" fill="#E62E2E"></circle>
                {" "}
                <circle cx="10" cy="10" r="3.5" fill="#FF8585" opacity="0.8"></circle>
                {" "}
                <path d="M9 20L13 32L17 20H9Z" fill="#C41C1C"></path>
                {" "}
              </svg>
              {" "}
            </div>
            {" "}
            <div className="masking-tape" style={{"position":"absolute","bottom":"-8px","left":"-14px","width":"64px","height":"22px","background":"rgba(235, 222, 168, 0.78)","transform":"rotate(-22deg)","zIndex":"10","boxShadow":"0 1px 3px rgba(0,0,0,0.12)","clipPath":"polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)"}}></div>
            {" "}
            <div className="polaroid-img-wrap" style={{"height":"230px"}}>
              {" "}
              <img src="/frame-fresh.jpg" alt="Feels fresh" />
              {" "}
            </div>
            {" "}
            <div className="polaroid-caption">
              {"Feels fresh....."}
            </div>
            {" "}
          </div>
          {" "}
          {" "}
          <div className="polaroid-card" style={{"transform":"rotate(1.2deg)"}}>
            {" "}
            <div className="paperclip" style={{"position":"absolute","top":"-12px","left":"14px","zIndex":"10","filter":"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}}>
              {" "}
              <svg width="20" height="34" viewBox="0 0 22 38" fill="none">
                {" "}
                <path d="M6 10V28C6 31.3 8.7 34 12 34C15.3 34 18 31.3 18 28V6C18 3.8 16.2 2 14 2C11.8 2 10 3.8 10 6V26C10 27.1 10.9 28 12 28C13.1 28 14 27.1 14 26V10" stroke="#BDC5D0" strokeWidth="2.5" strokeLinecap="round"></path>
                {" "}
              </svg>
              {" "}
            </div>
            {" "}
            <div className="polaroid-img-wrap" style={{"height":"180px","background":"#C5F77A","display":"flex","alignItems":"center","justifyContent":"center"}}>
              {" "}
              <img src="/anp.png" alt="Icon/Facee" style={{"width":"130px","height":"130px","objectFit":"contain","imageRendering":"pixelated","borderRadius":"12px"}} />
              {" "}
            </div>
            {" "}
            <div className="polaroid-caption">
              {"Icon/Facee"}
            </div>
            {" "}
          </div>
          {" "}
          {" "}
          <div className="polaroid-card" style={{"transform":"rotate(2deg)"}}>
            {" "}
            <div className="pin pin-green" style={{"position":"absolute","top":"-10px","left":"50%","transform":"translateX(-50%)","zIndex":"10","filter":"drop-shadow(0 4px 6px rgba(0,0,0,0.3))"}}>
              {" "}
              <svg width="24" height="32" viewBox="0 0 26 34" fill="none">
                {" "}
                <circle cx="13" cy="13" r="10" fill="#48B81B"></circle>
                {" "}
                <circle cx="10" cy="10" r="3.5" fill="#9BF57D" opacity="0.8"></circle>
                {" "}
                <path d="M9 20L13 32L17 20H9Z" fill="#328A10"></path>
                {" "}
              </svg>
              {" "}
            </div>
            {" "}
            <div className="polaroid-img-wrap" style={{"height":"180px","background":"linear-gradient(145deg, #7BBFFF 0%, #B4F56E 100%)","display":"flex","flexDirection":"column","justifyContent":"center","alignItems":"center","padding":"14px","position":"relative"}}>
              {" "}
              <div style={{"fontFamily":"'Inter',sans-serif","fontWeight":"800","fontSize":"18px","lineHeight":"1.15","color":"#224059","textTransform":"uppercase","textAlign":"center","letterSpacing":"-0.03em"}}>
                {" DESIGNS"}
                <br />
                {"THAT"}
                <br />
                <span style={{"color":"#1b5e20"}}>
                  {"MAKE SENSE"}
                </span>
                {" "}
              </div>
              {" "}
              <div style={{"position":"absolute","bottom":"8px","right":"8px","width":"22px","height":"22px","background":"#224059","borderRadius":"3px","opacity":"0.85","display":"flex","alignItems":"center","justifyContent":"center"}}>
                {" "}
                <svg width="16" height="16" viewBox="0 0 14 14" fill="#fff">
                  <rect x="1" y="1" width="4" height="4"></rect>
                  <rect x="9" y="1" width="4" height="4"></rect>
                  <rect x="1" y="9" width="4" height="4"></rect>
                  <rect x="7" y="7" width="2" height="2"></rect>
                  <rect x="9" y="9" width="4" height="4"></rect>
                </svg>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
            <div className="polaroid-caption">
              {"Our Motto"}
            </div>
            {" "}
          </div>
          {" "}
          {" "}
          <div className="polaroid-card" style={{"transform":"rotate(1deg)"}}>
            {" "}
            <div className="polaroid-img-wrap" style={{"height":"130px","background":"linear-gradient(135deg, #4DE3BE 0%, #76E05B 100%)","display":"flex","alignItems":"center","justifyContent":"space-around","padding":"12px","position":"relative"}}>
              {" "}
              <div style={{"width":"36px","height":"36px","borderRadius":"50%","background":"rgba(255,255,255,0.85)","backdropFilter":"blur(4px)","display":"flex","alignItems":"center","justifyContent":"center","boxShadow":"0 2px 6px rgba(0,0,0,0.12)"}}>
                {" "}
                <span style={{"fontSize":"18px"}}>
                  {"🧠"}
                </span>
                {" "}
              </div>
              {" "}
              <div style={{"width":"36px","height":"36px","borderRadius":"50%","background":"rgba(255,255,255,0.85)","backdropFilter":"blur(4px)","display":"flex","alignItems":"center","justifyContent":"center","boxShadow":"0 2px 6px rgba(0,0,0,0.12)"}}>
                {" "}
                <span style={{"fontSize":"18px"}}>
                  {"✨"}
                </span>
                {" "}
              </div>
              {" "}
              <div style={{"width":"36px","height":"36px","borderRadius":"50%","background":"rgba(255,255,255,0.85)","backdropFilter":"blur(4px)","display":"flex","alignItems":"center","justifyContent":"center","boxShadow":"0 2px 6px rgba(0,0,0,0.12)"}}>
                {" "}
                <span style={{"fontSize":"18px"}}>
                  {"📱"}
                </span>
                {" "}
              </div>
              {" "}
            </div>
            {" "}
            <div className="polaroid-caption">
              {"Brand Feel"}
            </div>
            {" "}
          </div>
          {" "}
          {" "}
          <div className="polaroid-card" style={{"transform":"rotate(-1.5deg)"}}>
            {" "}
            <div className="binder-clip" style={{"position":"absolute","top":"-10px","left":"16px","zIndex":"10","filter":"drop-shadow(0 2px 5px rgba(0,0,0,0.3))"}}>
              {" "}
              <svg width="26" height="22" viewBox="0 0 28 24" fill="none">
                {" "}
                <rect x="4" y="8" width="20" height="14" rx="2" fill="#2E3440"></rect>
                {" "}
                <path d="M8 8V4C8 2.9 8.9 2 10 2H18C19.1 2 20 2.9 20 4V8" stroke="#8892B0" strokeWidth="2" fill="none"></path>
                {" "}
              </svg>
              {" "}
            </div>
            {" "}
            <div className="polaroid-img-wrap" style={{"height":"180px"}}>
              {" "}
              <img src="/frame-billboard.jpg" alt="Posters" />
              {" "}
            </div>
            {" "}
            <div className="polaroid-caption">
              {"Posters"}
            </div>
            {" "}
          </div>
          {" "}
          {" "}
          <div className="polaroid-card" style={{"transform":"rotate(2.8deg)"}}>
            {" "}
            <div className="paperclip" style={{"position":"absolute","top":"-12px","right":"14px","zIndex":"10","filter":"drop-shadow(0 2px 4px rgba(0,0,0,0.25))"}}>
              {" "}
              <svg width="20" height="34" viewBox="0 0 22 38" fill="none">
                {" "}
                <path d="M6 10V28C6 31.3 8.7 34 12 34C15.3 34 18 31.3 18 28V6C18 3.8 16.2 2 14 2C11.8 2 10 3.8 10 6V26C10 27.1 10.9 28 12 28C13.1 28 14 27.1 14 26V10" stroke="#BDC5D0" strokeWidth="2.5" strokeLinecap="round"></path>
                {" "}
              </svg>
              {" "}
            </div>
            {" "}
            <div className="polaroid-img-wrap" style={{"height":"230px"}}>
              {" "}
              <img src="/frame-number8.jpg" alt="Just a number :)" />
              {" "}
            </div>
            {" "}
            <div className="polaroid-caption">
              {"Just a number :)"}
            </div>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
        {" "}
        <div style={{"marginTop":"40px"}}>
          {" "}
          <p className="agency-muted-line">
            {"Not as another agency."}
          </p>
          {" "}
          <p className="agency-muted-line">
            {"Not as a marketplace of freelancers..."}
          </p>
          {" "}
          <p className="story-text" style={{"marginTop":"24px"}}>
            {"But as one team that sees the "}
            <span className="highlighter-green">
              {"whole picture:"}
            </span>
          </p>
          {" "}
        </div>
        {" "}
      </div>
    </>
  );
}
