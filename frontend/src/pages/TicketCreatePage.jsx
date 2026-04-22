import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../auth/AuthContext";
import { apiPost } from "../lib/api";

const CATEGORIES = ["ELECTRICAL", "NETWORK", "HARDWARE", "CLEANING", "SAFETY", "OTHER"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE_MB = 2;

const emptyForm = {
  location: "",
  resourceId: "",
  category: "HARDWARE",
  priority: "MEDIUM",
  description: "",
  contactName: "",
  contactEmail: "",
  contactPhone: ""
};

function titleCase(value) {
  return String(value ?? "Not set")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error("Could not read image file."));
    };

    reader.readAsDataURL(file);
  });
}

export default function TicketCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ...emptyForm,
    contactName: user?.displayName ?? "",
    contactEmail: user?.email ?? ""
  });

  const [attachments, setAttachments] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function handleImageUpload(event) {
    const selectedFiles = Array.from(event.target.files ?? []);
    const remainingSlots = MAX_IMAGES - attachments.length;

    if (remainingSlots <= 0) {
      setErrors((current) => ({
        ...current,
        attachments: "You can upload only 3 images."
      }));
      event.target.value = "";
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);
    const nextErrors = {};

    const validFiles = filesToAdd.filter((file) => {
      if (!file.type.startsWith("image/")) {
        nextErrors.attachments = "Only image files are allowed.";
        return false;
      }

      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        nextErrors.attachments = `Each image must be ${MAX_IMAGE_SIZE_MB}MB or smaller.`;
        return false;
      }

      return true;
    });

    if (selectedFiles.length > remainingSlots) {
      nextErrors.attachments = "Only the first 3 images will be attached.";
    }

    try {
      const uploadedImages = await Promise.all(
        validFiles.map(async (file) => ({
          name: file.name,
          preview: await readFileAsDataUrl(file)
        }))
      );

      setAttachments((current) => [...current, ...uploadedImages]);
      setErrors((current) => ({
        ...current,
        attachments: nextErrors.attachments ?? ""
      }));
    } catch (uploadError) {
      setErrors((current) => ({
        ...current,
        attachments: uploadError.message
      }));
    } finally {
      event.target.value = "";
    }
  }

  function removeAttachment(indexToRemove) {
    setAttachments((current) =>
      current.filter((_, index) => index !== indexToRemove)
    );

    setErrors((current) => ({
      ...current,
      attachments: ""
    }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.location.trim()) nextErrors.location = "Location is required.";
    if (!form.resourceId.trim()) nextErrors.resourceId = "Resource or equipment is required.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    if (!form.contactName.trim()) nextErrors.contactName = "Contact name is required.";

    if (!form.contactEmail.trim()) {
      nextErrors.contactEmail = "Contact email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      nextErrors.contactEmail = "Enter a valid email address.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const contactParts = [
      form.contactName.trim(),
      form.contactEmail.trim(),
      form.contactPhone.trim()
    ]
      .filter(Boolean)
      .join(" | ");

    try {
      setSaving(true);

      const created = await apiPost(
        "/api/tickets",
        {
          resourceId: form.resourceId.trim(),
          location: form.location.trim(),
          category: form.category,
          priority: form.priority,
          description: form.description.trim(),
          preferredContact: contactParts,
          attachmentUrls: attachments.map((image) => image.preview)
        },
        user
      );

      navigate(`/tickets/${created.id}`);
    } catch (createError) {
      setMessage(createError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="ticket-module">
      <PageHeader
        eyebrow=""
        title="Create Incident Ticket"
        description="Report a facilities, hardware, safety, cleaning, electrical, or network incident."
      />

      {message && <p className="state-text state-error">{message}</p>}

      <form className="ticket-panel ticket-form ticket-form-shell" onSubmit={handleSubmit}>
        <div className="ticket-section-head">
          <div>
            <p className="ticket-overline">Incident intake</p>
            <h3>Issue Information</h3>
            <p>Use clear location, equipment, and evidence details so the team can triage quickly.</p>
          </div>

          <button
            type="button"
            className="ticket-icon-button"
            onClick={() => navigate("/tickets")}
            aria-label="Close form"
          >
            x
          </button>
        </div>

        <div className="ticket-field-grid">
          <label className="ticket-field">
            <span>Location *</span>
            <input
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              placeholder="Building A, Room 301"
            />
            {errors.location && <small>{errors.location}</small>}
          </label>

          <label className="ticket-field">
            <span>Resource or Equipment *</span>
            <input
              value={form.resourceId}
              onChange={(event) => updateField("resourceId", event.target.value)}
              placeholder="Projector, access point, lab PC"
            />
            {errors.resourceId && <small>{errors.resourceId}</small>}
          </label>

          <label className="ticket-field">
            <span>Category *</span>
            <select value={form.category} onChange={(event) => updateField("category", event.target.value)}>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {titleCase(category)}
                </option>
              ))}
            </select>
          </label>

          <label className="ticket-field">
            <span>Priority *</span>
            <select value={form.priority} onChange={(event) => updateField("priority", event.target.value)}>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {titleCase(priority)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="ticket-field">
          <span>Description *</span>
          <textarea
            rows="5"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Describe what happened, who is affected, and what has already been tried."
          />
          {errors.description && <small>{errors.description}</small>}
        </label>

        <section className="ticket-contact-card">
          <div>
            <h3>Preferred Contact Details</h3>
            <p className="state-text">These details are sent as the ticket preferred contact.</p>
          </div>

          <div className="ticket-field-grid">
            <label className="ticket-field">
              <span>Full Name *</span>
              <input
                value={form.contactName}
                onChange={(event) => updateField("contactName", event.target.value)}
                placeholder="Your full name"
              />
              {errors.contactName && <small>{errors.contactName}</small>}
            </label>

            <label className="ticket-field">
              <span>Email *</span>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(event) => updateField("contactEmail", event.target.value)}
                placeholder="your.email@example.com"
              />
              {errors.contactEmail && <small>{errors.contactEmail}</small>}
            </label>
          </div>

          <label className="ticket-field">
            <span>Phone</span>
            <input
              value={form.contactPhone}
              onChange={(event) => updateField("contactPhone", event.target.value)}
              placeholder="+94 77 123 4567"
            />
          </label>
        </section>

        <section className="ticket-upload-panel">
          <div>
            <h3>Evidence and Attachments</h3>
            <p className="state-text">
              Upload up to 3 images as evidence. You can attach photos of damaged equipment, error screens,
              unsafe areas, broken furniture, network devices, or cleaning issues.
            </p>
          </div>

          <label className="ticket-upload-box">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={attachments.length >= MAX_IMAGES}
            />
            <span>
              {attachments.length >= MAX_IMAGES
                ? "Maximum 3 images attached"
                : `Choose images (${attachments.length}/${MAX_IMAGES})`}
            </span>
          </label>

          {errors.attachments && <p className="state-text state-error">{errors.attachments}</p>}

          {attachments.length > 0 && (
            <div className="ticket-preview-grid">
              {attachments.map((image, index) => (
                <div key={`${image.name}-${index}`} className="ticket-preview-item">
                  <img src={image.preview} alt={image.name} />
                  <button
                    type="button"
                    className="ticket-remove-image"
                    onClick={() => removeAttachment(index)}
                    aria-label={`Remove ${image.name}`}
                  >
                    x
                  </button>
                  <span>{image.name}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="ticket-actions">
          <button type="button" className="ticket-secondary-button" onClick={() => navigate("/tickets")}>
            Cancel
          </button>

          <button type="submit" className="ticket-primary-button" disabled={saving}>
            {saving ? "Creating..." : "Create Ticket"}
          </button>
        </div>
      </form>
    </section>
  );
}
