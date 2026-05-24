import React, { useState } from "react";

const VIDEO_API_URL =
  "https://edu-backend-1-fh7o.onrender.com/generate";

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateVideo = async () => {
    if (!prompt.trim()) {
      setError("Please enter a topic or lesson prompt.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setVideoUrl(null);

      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 300000);

      const response = await fetch(VIDEO_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        let backendError = "Video generation failed.";

        try {
          const data = await response.json();

          backendError =
            data.details ||
            data.error ||
            backendError;

        } catch (e) {
          backendError = "Backend returned an error.";
        }

        throw new Error(backendError);
      }

      const blob = await response.blob();

      if (!blob || blob.size === 0) {
        throw new Error("Empty video response received.");
      }

      const url = URL.createObjectURL(blob);

      setVideoUrl(url);

    } catch (err) {
      console.error("Video generation error:", err);

      const errorObj = err as Error;

      if (errorObj.name === "AbortError") {
        setError(
          "Request timed out. Video generation took too long."
        );

      } else if (
        errorObj.message &&
        errorObj.message.includes("Failed to fetch")
      ) {
        setError("Cannot connect to deployed backend.");

      } else {
        setError(
          errorObj.message || "Unexpected error occurred."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="video-generator-page">
      <div className="video-generator-card">

        <div className="video-header">
          <span className="video-icon">🎬</span>

          <div>
            <h1>AI Video Generator</h1>

            <p>
              Turn any lesson topic into a short learning video.
            </p>
          </div>
        </div>

        <textarea
          className="video-prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: Explain photosynthesis in a simple animated video"
          rows={5}
        />

        {error && (
          <p className="video-error">
            {error}
          </p>
        )}

        <button
          className="video-generate-btn"
          onClick={generateVideo}
          disabled={loading}
        >
          {loading
            ? "Generating your video..."
            : "Generate Video"}
        </button>

        {loading && (
          <div className="video-loading-box">
            <div className="video-loader"></div>

            <p>
              EduMind is creating your learning video.
              This may take a little time.
            </p>
          </div>
        )}

        {videoUrl && (
          <div className="video-result-box">
            <h2>Your Generated Video</h2>

            <video
              className="generated-video"
              controls
              src={videoUrl}
            />

            <a
              className="video-download-btn"
              href={videoUrl}
              download="edumind-generated-video.mp4"
            >
              Download Video
            </a>
          </div>
        )}

      </div>
    </div>
  );
}