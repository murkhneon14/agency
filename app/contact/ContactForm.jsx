"use client";

import { useState } from "react";

export default function ContactForm(){
  const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
  async function submit(event){event.preventDefault();const formElement=event.currentTarget;const form=new FormData(formElement);setBusy(true);setMessage("");
    try{const response=await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:form.get("name"),email:form.get("email"),subject:form.get("subject"),message:form.get("message"),website:form.get("website")})});const result=await response.json();if(!response.ok)throw new Error(result?.error?.message||"Unable to send your message.");setMessage("Thanks. Your message has been received.");formElement.reset();}
    catch(error){setMessage(error.message||"Unable to send your message.");}finally{setBusy(false);}
  }
  return <form className="portal-panel portal-form public-contact-form" onSubmit={submit}><div className="portal-panel-body"><div className="portal-form-grid"><label>Name<input name="name" maxLength={120} required /></label><label>Email<input name="email" type="email" maxLength={254} required /></label><label className="span-2">Subject<input name="subject" maxLength={180} required /></label><label className="span-2">Message<textarea name="message" maxLength={5000} required /></label><label className="trap-field" aria-hidden="true">Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>{message&&<p className="form-message" role="status">{message}</p>}<button className="portal-button portal-button--primary" disabled={busy}>{busy?"Sending…":"Send message"}</button></div></form>;
}
