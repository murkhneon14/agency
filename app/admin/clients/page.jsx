import { redirect } from "next/navigation";
import { requireRole } from "../../../lib/auth/guards.js";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const context = await requireRole(["ADMIN"]);
  if (context.error) redirect(context.status === 401 ? "/login" : "/auth/redirect");

  const { data: clients, error } = await context.db
    .from("profiles")
    .select("id,full_name,email,company,phone,created_at,role")
    .eq("role", "CLIENT")
    .order("created_at", { ascending: false });

  const clientIds = (clients || []).map((client) => client.id);
  const [projectsResult, requestsResult] = clientIds.length
    ? await Promise.all([
        context.db.from("projects").select("client_id").in("client_id", clientIds),
        context.db.from("project_requests").select("client_id").in("client_id", clientIds),
      ])
    : [{ data: [] }, { data: [] }];

  const projectCounts = countBy(projectsResult.data || []);
  const requestCounts = countBy(requestsResult.data || []);

  return (
    <>
      <div className="portal-page-heading">
        <div>
          <h1>Clients</h1>
          <p>Client accounts and their active work history.</p>
        </div>
      </div>
      {error && <p className="portal-inline-error">Unable to load client profiles.</p>}
      <section className="portal-panel">
        <div className="portal-panel-heading">
          <h2>Client accounts</h2>
          <span>{clients?.length || 0} total</span>
        </div>
        {clients?.length ? (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Company</th>
                  <th>Projects</th>
                  <th>Requests</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      {client.full_name || "Client"}
                      <div className="portal-row-detail">{client.email || "Email unavailable"}</div>
                    </td>
                    <td>{client.company || "—"}</td>
                    <td>{projectCounts.get(client.id) || 0}</td>
                    <td>{requestCounts.get(client.id) || 0}</td>
                    <td>{date(client.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="portal-empty">No client profiles have been created.</div>
        )}
      </section>
    </>
  );
}

function countBy(rows) {
  return rows.reduce((map, row) => map.set(row.client_id, (map.get(row.client_id) || 0) + 1), new Map());
}

function date(value) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}
