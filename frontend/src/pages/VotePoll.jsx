import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function VotePoll() {
  const { id } = useParams();

  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [hasVoted, setHasVoted] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  const fetchPoll = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/polls/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not fetch poll.");
        return;
      }

      setPoll(data.poll);
    } catch (error) {
      setError("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoll();
  }, [id]);

  const handleVote = async () => {
    setMessage("");
    setError("");

    if (!selectedOption) {
      setError("Please select an option.");
      return;
    }

    setVoting(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/polls/${id}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            option: selectedOption,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not submit your vote.");
        return;
      }

      setMessage("Your vote has been submitted successfully!");
      setHasVoted(true);
    } catch (error) {
      setError("Could not connect to the backend.");
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          padding: "50px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            padding: "25px",
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#172554",
            }}
          >
            Loading poll...
          </h2>

          <p
            style={{
              color: "#64748b",
              marginBottom: 0,
            }}
          >
            Please wait while we load the poll.
          </p>
        </div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            padding: "15px",
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

        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
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

  const isExpired =
    poll?.expiresAt &&
    new Date(poll.expiresAt) < new Date();

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "35px 20px",
      }}
    >
      {/* Page Header */}
      <div
        style={{
          marginBottom: "25px",
        }}
      >
        <h1
          style={{
            marginBottom: "8px",
            color: "#172554",
            fontSize: "32px",
          }}
        >
          Cast Your Vote
        </h1>

        <p
          style={{
            margin: 0,
            color: "#64748b",
          }}
        >
          Choose one option and submit your response.
        </p>
      </div>

      {/* Poll Card */}
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "28px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
        }}
      >
        {/* Question */}
        <div
          style={{
            marginBottom: "25px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              marginBottom: "10px",
              padding: "5px 10px",
              backgroundColor: "#eff6ff",
              color: "#0369a1",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "700",
            }}
          >
            🗳 POLL
          </span>

          <h2
            style={{
              margin: 0,
              color: "#172554",
              fontSize: "24px",
              lineHeight: "1.4",
            }}
          >
            {poll.question}
          </h2>
        </div>

        {/* Expiry Information */}
        {poll.expiresAt ? (
          <div
            style={{
              marginBottom: "22px",
              padding: "10px 12px",
              backgroundColor: isExpired
                ? "#fff1f2"
                : "#f0fdf4",
              color: isExpired
                ? "#dc2626"
                : "#15803d",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            {isExpired
              ? "⏰ This poll has expired."
              : `⏳ Voting closes on ${new Date(
                  poll.expiresAt
                ).toLocaleString()}`}
          </div>
        ) : (
          <div
            style={{
              marginBottom: "22px",
              padding: "10px 12px",
              backgroundColor: "#f0fdf4",
              color: "#15803d",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            ✓ This poll has no expiry.
          </div>
        )}

        {/* Options */}
        <div>
          <h3
            style={{
              color: "#172554",
              marginBottom: "14px",
            }}
          >
            Select an option
          </h3>

          {poll.options.map((option, index) => (
            <label
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 16px",
                marginBottom: "10px",
                border:
                  selectedOption === option
                    ? "2px solid #38bdf8"
                    : "1px solid #cbd5e1",
                borderRadius: "9px",
                backgroundColor:
                  selectedOption === option
                    ? "#f0f9ff"
                    : "#ffffff",
                cursor:
                  isExpired || hasVoted
                    ? "default"
                    : "pointer",
                transition: "0.2s ease",
              }}
            >
              <input
                type="radio"
                name="poll-option"
                value={option}
                checked={selectedOption === option}
                onChange={(e) =>
                  setSelectedOption(e.target.value)
                }
                disabled={isExpired || hasVoted}
                style={{
                  width: "18px",
                  height: "18px",
                  accentColor: "#0284c7",
                }}
              />

              <span
                style={{
                  color: "#334155",
                  fontSize: "15px",
                  fontWeight:
                    selectedOption === option
                      ? "700"
                      : "500",
                }}
              >
                {option}
              </span>
            </label>
          ))}
        </div>

        {/* Expired State */}
        {isExpired ? (
          <div
            style={{
              marginTop: "20px",
              padding: "13px",
              backgroundColor: "#fff1f2",
              color: "#dc2626",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            ⏰ This poll has expired. Voting is closed.
          </div>
        ) : (
          <>
            {/* Vote Button */}
            <button
              onClick={handleVote}
              disabled={voting || hasVoted}
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "13px",
                backgroundColor: hasVoted
                  ? "#94a3b8"
                  : "#38bdf8",
                color: hasVoted
                  ? "white"
                  : "#172554",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "700",
                cursor:
                  voting || hasVoted
                    ? "not-allowed"
                    : "pointer",
                boxShadow: hasVoted
                  ? "none"
                  : "0 3px 8px rgba(56, 189, 248, 0.25)",
              }}
            >
              {voting
                ? "Submitting Vote..."
                : hasVoted
                ? "✓ Vote Submitted"
                : "Submit Vote"}
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
          </>
        )}

        {/* Results Link */}
        <div
          style={{
            marginTop: "22px",
            paddingTop: "20px",
            borderTop: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <Link
            to={`/poll/${id}/results`}
            style={{
              color: "#0284c7",
              textDecoration: "none",
              fontWeight: "700",
            }}
          >
            📊 View Live Results
          </Link>
        </div>
      </div>

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

export default VotePoll;  