import Sidebar from "../components/Sidebar.jsx";
import "../../portal.css";

export default function PortalAuthLayout({ children }) {
  return (
    <div className="projects-page portal-app portal-site-frame">
      <Sidebar activeSection="playground" />
      <main className="projects-content portal-auth-content">
        <div className="portal-auth">{children}</div>
      </main>
    </div>
  );
}
