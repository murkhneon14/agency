"use client";

import { useState } from "react";

export default function PortfolioForm() {
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(event){
    event.preventDefault();const formElement=event.currentTarget;const form=new FormData(formElement);setBusy(true);setMessage("");
    const payload={title:String(form.get("title")),slug:String(form.get("slug")),description:String(form.get("description")),category:String(form.get("category")),technologies:String(form.get("technologies")).split(",").map((item)=>item.trim()).filter(Boolean),demoUrl:String(form.get("demoUrl")||""),isDemo:form.get("isDemo")==="on",isPublished:form.get("isPublished")==="on",sortOrder:Number(form.get("sortOrder")||0)};
    try{const response=await fetch("/api/admin/portfolio",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const result=await response.json();if(!response.ok)throw new Error(result?.error?.message||"Unable to save entry.");setMessage("Portfolio entry saved.");formElement.reset();window.location.reload();}catch(error){setMessage(error.message||"Unable to save entry.");}finally{setBusy(false);}
  }
  return <form className="portal-panel-body portal-form" onSubmit={submit}><div className="portal-form-grid"><label>Title<input name="title" maxLength={160} required /></label><label>URL slug<input name="slug" maxLength={180} pattern="[a-z0-9]+(-[a-z0-9]+)*" required /></label><label>Category<input name="category" maxLength={80} required /></label><label>Technologies <span className="portal-field-hint">Comma separated</span><input name="technologies" placeholder="Next.js, TypeScript" /></label><label className="span-2">Description<textarea name="description" maxLength={5000} required /></label><label>Optional demo URL<input name="demoUrl" type="url" /></label><label>Sort order<input name="sortOrder" type="number" min="0" defaultValue="0" /></label></div><div className="portal-checkboxes"><label><input name="isDemo" type="checkbox" defaultChecked /> Demonstration project</label><label><input name="isPublished" type="checkbox" /> Publish publicly</label></div>{message&&<p className="form-message" role="status">{message}</p>}<button className="portal-button portal-button--primary" disabled={busy}>{busy?"Saving…":"Add portfolio entry"}</button></form>;
}
