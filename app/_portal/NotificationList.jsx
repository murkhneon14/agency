"use client";

import { useState } from "react";

export default function NotificationList({ items }) {
  const [notifications, setNotifications] = useState(items);
  const [message, setMessage] = useState("");
  async function markRead(id) {
    const response = await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    if (!response.ok) { setMessage("Unable to update notification."); return; }
    const result = await response.json();
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, read_at: result.notification.read_at } : item));
  }
  return <section className="portal-panel"><div className="portal-panel-heading"><h2>Latest activity</h2><span>{notifications.filter((item) => !item.read_at).length} unread</span></div>{message&&<p className="portal-inline-error">{message}</p>}{notifications.length?<div className="portal-panel-body portal-milestones">{notifications.map((item)=><article className="portal-milestone" key={item.id}><div><strong>{item.title} {!item.read_at&&<span className="portal-notification-dot" aria-label="Unread" />}</strong><small>{item.body}</small><small>{new Intl.DateTimeFormat("en-IN",{dateStyle:"medium",timeStyle:"short"}).format(new Date(item.created_at))}</small>{item.href&&<a href={item.href}>Open</a>}</div>{!item.read_at&&<button className="portal-button portal-button--secondary" onClick={()=>markRead(item.id)}>Mark read</button>}</article>)}</div>:<div className="portal-empty"><strong>You’re all caught up</strong>New project activity and payment updates will appear here.</div>}</section>;
}
