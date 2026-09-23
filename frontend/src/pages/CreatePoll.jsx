import { useState } from "react";
import { Link } from "react-router-dom";

function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expiresAt, setExpiresAt] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index) => {
    if (options.length <= 2) {
      return;
    }

    const newOptions = options.filter(
      (_, optionIndex) => optionIndex !== index
    );

    setOptions(newOptions);
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const cleanedOptions = options.map((option) =>
      option.trim()
    );

    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    if (cleanedOptions.length < 2) {
      setError("A poll needs at least 2 options.");
      return;
    }

    if (cleanedOptions.length > 6) {
      setError("A poll can have at most 6 options.");
      return;
    }

    if (cleanedOptions.some((option) => option === "")) {
      setError("Please fill all options.");
      return;
    }

    const lowercaseOptions = cleanedOptions.map((option) =>
      option.toLowerCase()
    );

    const uniqueOptions = new Set(lowercaseOptions);

    if (uniqueOptions.size !== cleanedOptions.length) {
      setError("Options must be different.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const requestBody = {
        question: question.trim(),
        options: cleanedOptions,
      };

      if (expiresAt) {
        requestBody.expiresAt = new Date(
          expiresAt
        ).toISOString();
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/polls`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not create poll.");
        return;
      }

      setMessage("Poll created successfully!");

      setQuestion("");
      setOptions(["", ""]);
      setExpiresAt("");
    } catch (error) {
      setError("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "750px",
        margin: "0 auto",
        padding: "35px 20px",
      }}
    >
      {/* Page Header */}
      <div style={{ marginBottom: "25px" }}>
        <h1
          style={{
            marginBottom: "8px",
            color: "#172554",
            fontSize: "32px",
          }}
        >
          Create a New Poll
        </h1>

        <p
          style={{
            color: "#64748b",
            marginTop: 0,
            marginBottom: 0,
            fontSize: "16px",
          }}
        >
          Ask a question and let people share their opinion.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleCreatePoll}
        style={{
          padding: "28px",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          backgroundColor: "white",
          color: "#222",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
        }}
      >
        {/* Question */}
        <div>
          <label
            style={{
              display: "block",
              color: "#172554",
              marginBottom: "8px",
            }}
          >
            <strong>Question</strong>
          </label>

          <input
            type="text"
            placeholder="e.g. Which feature should we build next?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            maxLength={300}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              outline: "none",
              fontSize: "15px",
            }}
          />

          {/* Question Counter */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "6px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              Maximum 300 characters
            </span>

            <span
              style={{
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              {question.length} / 300
            </span>
          </div>
        </div>

        <div
          style={{
            height: "1px",
            backgroundColor: "#e2e8f0",
            margin: "25px 0",
          }}
        />

        {/* Poll Options */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
              gap: "10px",
            }}
          >
            <h3
              style={{
                margin: 0,
                color: "#172554",
              }}
            >
              Poll Options
            </h3>

            <span
              style={{
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              {options.length} / 6 options
            </span>
          </div>

          {options.map((option, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "14px",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) =>
                    updateOption(index, e.target.value)
                  }
                  maxLength={100}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "15px",
                  }}
                />

                {/* Option Counter */}
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    margin: "4px 0 0",
                  }}
                >
                  {option.length} / 100
                </p>
              </div>

              {/* Remove Option */}
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #fca5a5",
                    backgroundColor: "#fff1f2",
                    color: "#dc2626",
                    borderRadius: "7px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Option */}
        {options.length < 6 && (
          <button
            type="button"
            onClick={addOption}
            style={{
              marginTop: "3px",
              padding: "9px 14px",
              backgroundColor: "#eff6ff",
              color: "#172554",
              border: "1px solid #38bdf8",
              borderRadius: "7px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            ＋ Add Option
          </button>
        )}

        <div
          style={{
            height: "1px",
            backgroundColor: "#e2e8f0",
            margin: "25px 0",
          }}
        />

        {/* Expiry */}
        <div>
          <label
            style={{
              display: "block",
              color: "#172554",
              marginBottom: "7px",
            }}
          >
            <strong>Expiry Date & Time</strong>
          </label>

          <p
            style={{
              fontSize: "14px",
              color: "#64748b",
              marginTop: 0,
              marginBottom: "10px",
            }}
          >
            Optional. Leave empty if the poll should not expire.
          </p>

          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            style={{
              padding: "11px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Create Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "28px",
            padding: "13px 18px",
            backgroundColor: "#38bdf8",
            color: "#172554",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "700",
            fontSize: "15px",
            boxShadow: "0 3px 8px rgba(56, 189, 248, 0.25)",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Creating Poll..." : "Create Poll"}
        </button>

        {/* Success Message */}
        {message && (
          <div
            style={{
              marginTop: "15px",
              padding: "12px",
              backgroundColor: "#ecfdf5",
              color: "#15803d",
              border: "1px solid #bbf7d0",
              borderRadius: "8px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            ✓ {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            style={{
              marginTop: "15px",
              padding: "12px",
              backgroundColor: "#fff1f2",
              color: "#dc2626",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            ⚠ {error}
          </div>
        )}
      </form>

      {/* Back to Dashboard */}
      <div
        style={{
          marginTop: "20px",
        }}
      >
        <Link
          to="/dashboard"
          style={{
            color: "#172554",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default CreatePoll;  