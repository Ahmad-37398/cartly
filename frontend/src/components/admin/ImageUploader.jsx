// frontend/src/components/admin/ImageUploader.jsx
import { useState, useRef, useCallback } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import api from "../../api/axios";
import styles from "./ImageUploader.module.css";

// ─── helpers ────────────────────────────────────────────────────────────────

// Build an initial centered crop from the image's natural dimensions
function buildInitialCrop(imageEl, aspect) {
  const { naturalWidth: w, naturalHeight: h } = imageEl;
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 80 }, aspect, w, h),
    w, h
  );
}

// Draw the crop rectangle onto a canvas and return a Blob
function cropToBlob(imageEl, crop, mimeType = "image/jpeg") {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const scaleX = imageEl.naturalWidth  / imageEl.width;
    const scaleY = imageEl.naturalHeight / imageEl.height;
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width  = Math.floor(crop.width  * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

    const ctx = canvas.getContext("2d");
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      imageEl,
      crop.x * scaleX, crop.y * scaleY,
      crop.width * scaleX, crop.height * scaleY,
      0, 0,
      crop.width * scaleX, crop.height * scaleY,
    );
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Canvas empty")),
      mimeType,
      0.92,
    );
  });
}

// ─── preset aspect ratios ────────────────────────────────────────────────────
const ASPECTS = [
  { label: "Free",    value: undefined },
  { label: "1 : 1",  value: 1 },
  { label: "3 : 4",  value: 3 / 4 },   // portrait — fashion standard
  { label: "4 : 3",  value: 4 / 3 },
  { label: "16 : 9", value: 16 / 9 },
];

// ─── component ───────────────────────────────────────────────────────────────
export default function ImageUploader({ value, onChange }) {
  // stage: "idle" | "cropping" | "uploading" | "done"
  const [stage,      setStage]    = useState("idle");
  const [srcUrl,     setSrcUrl]   = useState(null);   // local object URL of picked file
  const [crop,       setCrop]     = useState();        // current crop rect (pixels)
  const [aspect,     setAspect]   = useState(3 / 4);  // active aspect ratio
  const [progress,   setProgress] = useState(0);
  const [error,      setError]    = useState(null);

  const imgRef  = useRef(null);   // the <img> inside ReactCrop
  const inputRef = useRef(null);

  // ── file picked ────────────────────────────────────────────────────────────
  const pickFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file"); return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("File must be under 8 MB"); return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    setSrcUrl(url);
    setCrop(undefined);   // let onImageLoad set the initial crop
    setStage("cropping");
  };

  // ── image loaded into ReactCrop ────────────────────────────────────────────
  const onImageLoad = useCallback((e) => {
    imgRef.current = e.currentTarget;
    if (aspect !== undefined) {
      setCrop(buildInitialCrop(e.currentTarget, aspect));
    }
  }, [aspect]);

  // ── aspect ratio changed ───────────────────────────────────────────────────
  const changeAspect = (newAspect) => {
    setAspect(newAspect);
    if (imgRef.current && newAspect !== undefined) {
      setCrop(buildInitialCrop(imgRef.current, newAspect));
    }
  };

  // ── upload cropped blob ────────────────────────────────────────────────────
  const uploadCrop = async () => {
    if (!crop || !imgRef.current) return;
    setError(null); setStage("uploading"); setProgress(0);

    try {
      const blob = await cropToBlob(imgRef.current, crop);
      const form = new FormData();
      form.append("image", blob, "product.jpg");

      const { data } = await api.post("/uploads/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) =>
          setProgress(Math.round((e.loaded * 100) / (e.total || 1))),
      });

      URL.revokeObjectURL(srcUrl);   // free memory
      setSrcUrl(null);
      onChange(data.data.url);        // Cloudinary URL → product form
      setStage("done");
    } catch (err) {
      setError(err.message || "Upload failed");
      setStage("cropping");          // let user retry
    }
  };

  // ── cancel / reset ────────────────────────────────────────────────────────
  const reset = () => {
    if (srcUrl) URL.revokeObjectURL(srcUrl);
    setSrcUrl(null); setCrop(undefined); setProgress(0);
    setError(null); setStage("idle"); onChange("");
  };

  // ── drag-and-drop ────────────────────────────────────────────────────────
  const onDrop = (e) => {
    e.preventDefault();
    pickFile(e.dataTransfer.files?.[0]);
  };

  // ─── render ───────────────────────────────────────────────────────────────

  // Stage: cropping — show the crop UI
  if (stage === "cropping") {
    return (
      <div className={styles.cropWrap}>
        {/* Aspect ratio selector */}
        <div className={styles.aspectRow}>
          <span className={styles.aspectLabel}>Aspect ratio</span>
          {ASPECTS.map((a) => (
            <button
              key={a.label}
              type="button"
              className={`${styles.aspectBtn} ${aspect === a.value ? styles.aspectActive : ""}`}
              onClick={() => changeAspect(a.value)}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Crop canvas */}
        <ReactCrop
          crop={crop}
          onChange={(_, pct) => setCrop(pct)}
          aspect={aspect}
          className={styles.reactCrop}
        >
          <img
            src={srcUrl}
            onLoad={onImageLoad}
            alt="Crop preview"
            className={styles.cropImg}
          />
        </ReactCrop>

        <p className={styles.cropHint}>
          Drag the handles to adjust crop. Drag inside to move the selection.
        </p>

        {error && <div className={styles.err}>{error}</div>}

        <div className={styles.cropActions}>
          <button type="button" className={styles.cancelBtn} onClick={reset}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.uploadBtn}
            onClick={uploadCrop}
            disabled={!crop}
          >
            Upload Cropped Image
          </button>
        </div>
      </div>
    );
  }

  // Stage: uploading — show progress bar
  if (stage === "uploading") {
    return (
      <div className={styles.uploadingWrap}>
        <div className={styles.uploadingLabel}>Uploading… {progress}%</div>
        <div className={styles.bar}>
          <div className={styles.fill} style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  }

  // Stage: done — show preview with change/remove buttons
  if (stage === "done" || (stage === "idle" && value)) {
    return (
      <div className={styles.doneWrap}>
        <img src={value} alt="Uploaded" className={styles.preview} />
        <div className={styles.doneActions}>
          <button type="button" className={styles.changeBtn}
            onClick={() => { onChange(""); setStage("idle"); }}>
            Change Image
          </button>
          <button type="button" className={styles.cancelBtn} onClick={reset}>
            Remove
          </button>
        </div>
      </div>
    );
  }

  // Stage: idle — drag-and-drop zone
  return (
    <div>
      <div
        className={styles.zone}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <div className={styles.placeholder}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4
                     M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <span>Drag &amp; drop an image, or click to browse</span>
          <small>PNG / JPG up to 8MB &nbsp;·&nbsp; Crop before upload</small>
        </div>
        <input
          ref={inputRef} type="file" accept="image/*" hidden
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
      </div>
      {error && <div className={styles.err}>{error}</div>}
    </div>
  );
}
