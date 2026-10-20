"use client";

import { useState } from "react";

export default function FileUploadForm({ projectId, staff = false }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    setBusy(true);
    setMessage("");

    try {
      const file = formData.get("file");
      if (!file || !(file instanceof File) || file.size === 0) {
        throw new Error("Please select a file to upload.");
      }

      // 1. Request upload authentication and parameters from backend
      const startResponse = await fetch(`/api/projects/${projectId}/files/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          category: formData.get("category") || undefined,
        }),
      });

      const start = await startResponse.json();
      if (!startResponse.ok) {
        throw new Error(start?.error?.message || "Unable to prepare file upload.");
      }

      // 2. Direct upload to ImageKit
      const ikFormData = new FormData();
      ikFormData.append("file", file);
      ikFormData.append("fileName", start.fileName || file.name);
      ikFormData.append("publicKey", start.publicKey);
      ikFormData.append("signature", start.auth.signature);
      ikFormData.append("expire", String(start.auth.expire));
      ikFormData.append("token", start.auth.token);
      ikFormData.append("folder", start.folder);
      ikFormData.append("useUniqueFileName", "true");
      ikFormData.append("isPrivateFile", "true");

      const ikResponse = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: ikFormData,
      });

      const ikData = await ikResponse.json();
      if (!ikResponse.ok) {
        throw new Error(ikData.message || "Failed to upload file to ImageKit.");
      }

      // 3. Confirm registration in the database
      const confirmResponse = await fetch(`/api/projects/${projectId}/files/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: start.path,
          actualPath: ikData.filePath || start.path,
          fileId: ikData.fileId,
        }),
      });

      const result = await confirmResponse.json();
      if (!confirmResponse.ok) {
        throw new Error(result?.error?.message || "Unable to confirm file upload.");
      }

      setMessage("File uploaded successfully.");
      formElement.reset();
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to upload file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="portal-file-upload" onSubmit={submit}>
      <label>
        Upload {staff ? "a deliverable" : "a project reference"}
        <input
          name="file"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.zip,.docx,.xlsx"
          required
        />
      </label>
      {staff && (
        <label>
          File category
          <select name="category">
            <option value="deliverable">Client deliverable</option>
            <option value="other">Internal file</option>
            <option value="brief">Project brief</option>
          </select>
        </label>
      )}
      <button className="portal-button portal-button--secondary" disabled={busy}>
        {busy ? "Uploading…" : "Upload file"}
      </button>
      {message && <small role="status">{message}</small>}
    </form>
  );
}
