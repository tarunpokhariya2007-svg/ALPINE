import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import {
  Upload,
  FileText,
  Download,
  Trash2,
} from "lucide-react";

interface Doc {
  id?: number;
  name: string;
  size: string;
  date: string;
  type: string;
  url?: string;
}

export default function Documents() {
  const location = useLocation();
  const isAdvocate = location.pathname.startsWith("/advocate");

  const [docs, setDocs] = useState<Doc[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);

  // ==========================================
  // LOAD SAVED DOCUMENTS FROM DATABASE
  // ==========================================
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No login token found");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "https://legal-ai-z7vb.onrender.com/api/documents",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        console.log("SAVED DOCUMENTS:", result);

        if (!response.ok || !result.success) {
          console.error(
            "Failed to load documents:",
            result.message
          );
          setLoading(false);
          return;
        }

        const loadedDocs: Doc[] = result.documents.map(
          (doc: any) => ({
            id: doc.id,

            name:
              doc.file_name ||
              doc.original_name ||
              "Unnamed file",

            size: doc.file_size
              ? formatFileSize(doc.file_size)
              : "Saved",

            date: doc.uploaded_at
              ? new Date(
                  doc.uploaded_at
                ).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "",

            type:
              doc.file_type ||
              doc.mimetype ||
              "Uploaded",

            url: doc.file_path || doc.file_url,
          })
        );

        setDocs(loadedDocs);
      } catch (err) {
        console.error(
          "LOAD DOCUMENTS ERROR:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  // ==========================================
  // FILE SIZE FORMATTER
  // ==========================================
  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 KB";

    const kb = bytes / 1024;

    if (kb > 1024) {
      return `${(kb / 1024).toFixed(1)} MB`;
    }

    return `${kb.toFixed(0)} KB`;
  };

  // ==========================================
  // UPLOAD FILE
  // ==========================================
  const handleUpload = async (
    files: FileList | null
  ) => {
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    // 100 MB frontend check
    const maxSize = 100 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("File is too large. Maximum size is 100 MB.");
      return;
    }

    const formData = new FormData();

    formData.append("document", file);

    try {
      setUploading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login again.");
        return;
      }

      console.log("Uploading:", file.name);
      console.log("Type:", file.type);
      console.log("Size:", file.size);

      const response = await fetch(
        "https://legal-ai-z7vb.onrender.com/api/upload",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      const result = await response.json();

      console.log("UPLOAD RESULT:", result);

      if (!response.ok || !result.success) {
        alert(
          result.message ||
            "File upload failed"
        );

        return;
      }

      // ======================================
      // ADD UPLOADED FILE TO SCREEN
      // ======================================

      const uploadedFile: Doc = {
        id: result.file?.id,

        name:
          result.file?.originalName ||
          file.name,

        size:
          result.file?.size
            ? formatFileSize(result.file.size)
            : formatFileSize(file.size),

        date: new Date().toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        ),

        type:
          result.file?.mimetype ||
          file.type ||
          "Uploaded",

        url:
          result.file?.url ||
          undefined,
      };

      setDocs((prev) => [
        uploadedFile,
        ...prev,
      ]);

      setToast(
        `${file.name} uploaded successfully`
      );

      setTimeout(() => {
        setToast(null);
      }, 2500);
    } catch (err) {
      console.error(
        "UPLOAD ERROR:",
        err
      );

      alert("Server upload failed");
    } finally {
      setUploading(false);
    }
  };

 // ==========================================
// DELETE DOCUMENT
// ==========================================
const remove = async (id?: number, name?: string) => {
  if (!id) {
    alert("Document ID not found");
    return;
  }

  const confirmed = window.confirm(
    `Delete "${name || "this document"}"?`
  );

  if (!confirmed) {
    return;
  }

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login again.");
      return;
    }

    console.log("Deleting document ID:", id);

    const response = await fetch(
      `https://legal-ai-z7vb.onrender.com/api/documents/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    console.log("DELETE RESULT:", result);

    if (!response.ok || !result.success) {
      alert(
        result.message || "Failed to delete document"
      );
      return;
    }

    // Remove from screen ONLY after
    // successful database deletion
    setDocs((prev) =>
      prev.filter((doc) => doc.id !== id)
    );

    setToast(
      `${name || "Document"} deleted successfully`
    );

    setTimeout(() => {
      setToast(null);
    }, 2500);

  } catch (err) {
    console.error("DELETE ERROR:", err);
    alert("Server delete failed");
  }
};
const renameDocument = async (
  id?: number,
  currentName?: string
) => {
  if (!id) {
    alert("Document ID not found");
    return;
  }

  const newName = window.prompt(
    "Enter new document name:",
    currentName || ""
  );

  if (newName === null) {
    return;
  }

  const trimmedName = newName.trim();

  if (!trimmedName) {
    alert("Document name cannot be empty");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `https://legal-ai-z7vb.onrender.com/api/documents/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: trimmedName,
        }),
      }
    );

    const result = await response.json();

    console.log("RENAME RESULT:", result);

    if (!response.ok || !result.success) {
      alert(
        result.message ||
          "Failed to rename document"
      );
      return;
    }

    setDocs((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              name: trimmedName,
            }
          : doc
      )
    );

    setToast(
      `${trimmedName} renamed successfully`
    );

    setTimeout(() => {
      setToast(null);
    }, 2500);

  } catch (err) {
    console.error(
      "RENAME ERROR:",
      err
    );

    alert("Server rename failed");
  }
};

  // ==========================================
  // DOWNLOAD FILE
  // ==========================================
  const downloadFile = (doc: Doc) => {
    if (!doc.url) {
      alert("Download URL is not available.");
      return;
    }

    const url = doc.url.startsWith("http")
      ? doc.url
      : `https://legal-ai-z7vb.onrender.com${doc.url}`;

    window.open(url, "_blank");
  };

  return (
    <div
      style={{
        width: "100%",
      }}
    >
      {/* ======================================
          HEADER
      ====================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.4rem",
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Documents
          </h1>

          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.9rem",
              marginTop: 2,
            }}
          >
            {isAdvocate
              ? "Client documents & case files"
              : "FIRs, contracts, receipts, and AI reports"}
          </p>
        </div>

        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.mp3,.wav,.webm,.m4a,.mp4,.mov"
            style={{
              display: "none",
            }}
            onChange={(e) => {
              handleUpload(e.target.files);

              e.target.value = "";
            }}
          />

          <button
            onClick={() =>
              fileRef.current?.click()
            }
            disabled={uploading}
            className="btn-primary"
            style={{
              padding: "9px 16px",
              borderRadius: 9,
              fontSize: "0.85rem",
              fontWeight: 600,
              border: "none",
              cursor: uploading
                ? "not-allowed"
                : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: uploading ? 0.7 : 1,
            }}
          >
            <Upload size={15} />

            {uploading
              ? "Uploading..."
              : "Upload Document"}
          </button>
        </div>
      </div>

      {/* ======================================
          SUCCESS TOAST
      ====================================== */}

      {toast && (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: 8,
            background:
              "var(--emerald-subtle)",
            border:
              "1px solid var(--emerald-light)",
            color: "var(--emerald)",
            fontSize: "0.82rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <FileText size={14} />
          {toast}
        </div>
      )}

      {/* ======================================
          DRAG & DROP
      ====================================== */}

      <div
        onDragOver={(e) =>
          e.preventDefault()
        }
        onDrop={(e) => {
          e.preventDefault();

          handleUpload(
            e.dataTransfer.files
          );
        }}
        className="card"
        style={{
          padding: 28,
          marginBottom: 20,
          textAlign: "center",
          border:
            "2px dashed var(--border)",
          cursor: uploading
            ? "not-allowed"
            : "pointer",
          opacity: uploading ? 0.7 : 1,
        }}
        onClick={() =>
          !uploading &&
          fileRef.current?.click()
        }
      >
        <Upload
          size={26}
          style={{
            color: "var(--text-subtle)",
            marginBottom: 8,
          }}
        />

        <div
          style={{
            fontWeight: 600,
            color: "var(--text)",
            fontSize: "0.9rem",
          }}
        >
          Drag & drop a file, or click
          to browse
        </div>

        <div
          style={{
            color: "var(--text-muted)",
            fontSize: "0.78rem",
            marginTop: 3,
          }}
        >
          PDF, PNG, JPG, MP3, WAV, M4A,
          MP4, MOV, WEBM up to 100MB
        </div>
      </div>

      {/* ======================================
          DOCUMENT LIST
      ====================================== */}

      <div
        className="card"
        style={{
          padding: 8,
        }}
      >
        {loading ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "0.85rem",
            }}
          >
            Loading documents...
          </div>
        ) : docs.length === 0 ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "0.85rem",
            }}
          >
            No documents yet.
            <br />
            Upload your first document above.
          </div>
        ) : (
          docs.map((d, i) => (
            <div
              key={
                d.id ??
                `${d.name}-${i}`
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding:
                  "12px 14px",
                borderBottom:
                  i < docs.length - 1
                    ? "1px solid var(--border)"
                    : "none",
              }}
            >
              {/* FILE ICON */}

              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  flexShrink: 0,
                  background:
                    "var(--blue-subtle)",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                <FileText
                  size={16}
                  style={{
                    color:
                      "var(--blue)",
                  }}
                />
              </div>

              {/* FILE INFO */}

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontWeight: 500,
                    color: "var(--text)",
                    fontSize:
                      "0.85rem",
                    overflow:
                      "hidden",
                    textOverflow:
                      "ellipsis",
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  {d.name}
                </div>

                <div
                  style={{
                    fontSize:
                      "0.7rem",
                    color:
                      "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  {d.size} ·{" "}
                  {d.date}
                </div>
              </div>

              {/* TYPE */}

              <span
                className="badge"
                style={{
                  background:
                    "var(--blue-subtle)",
                  color:
                    "var(--blue)",
                  maxWidth: 130,
                  overflow:
                    "hidden",
                  textOverflow:
                    "ellipsis",
                  whiteSpace:
                    "nowrap",
                }}
              >
                {getFileTypeLabel(
                  d.type
                )}
              </span>

              {/* DOWNLOAD */}

              <button
                title="Download"
                onClick={() =>
                  downloadFile(d)
                }
                style={{
                  padding: 7,
                  borderRadius: 6,
                  border:
                    "1px solid var(--border)",
                  background:
                    "var(--bg-card)",
                  color:
                    "var(--text-muted)",
                  cursor:
                    "pointer",
                  display:
                    "flex",
                }}
              >
                <Download
                  size={13}
                />
              </button>
              {/* RENAME */}

<button
  title="Rename"
  onClick={() =>
    renameDocument(d.id, d.name)
  }
  style={{
    padding: 7,
    borderRadius: 6,
    border: "1px solid var(--border)",
    background: "var(--bg-card)",
    color: "var(--text-muted)",
    cursor: "pointer",
    display: "flex",
    flexShrink: 0,
  }}
>
  Rename
</button>

              {/* REMOVE */}

              <button
                title="Remove"
                onClick={() =>
                  remove(
                    d.id,
                    d.name
                  )
                }
                style={{
                  padding: 7,
                  borderRadius: 6,
                  border:
                    "1px solid var(--border)",
                  background:
                    "var(--bg-card)",
                  color:
                    "#EF4444",
                  cursor:
                    "pointer",
                  display:
                    "flex",
                }}
              >
                <Trash2
                  size={13}
                />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==========================================
// FILE TYPE LABEL
// ==========================================

function getFileTypeLabel(
  type: string
) {
  if (!type) {
    return "Uploaded";
  }

  if (
    type.includes("pdf")
  ) {
    return "PDF";
  }

  if (
    type.includes("png") ||
    type.includes("jpeg") ||
    type.includes("jpg")
  ) {
    return "Image";
  }

  if (
    type.includes("mpeg") ||
    type.includes("mp3") ||
    type.includes("wav") ||
    type.includes("m4a") ||
    type.includes("webm")
  ) {
    return "Audio";
  }

  if (
    type.includes("mp4") ||
    type.includes("quicktime")
  ) {
    return "Video";
  }

  return "Uploaded";
}