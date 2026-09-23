import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPolls = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await fetch(
       `${import.meta.env.VITE_API_URL}/api/polls` ,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not fetch polls");
        return;
      }

      setPolls(data.polls || []);
    } catch (error) {
      setError("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "50px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "25px 35px",
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#172554",
            }}
          >
            Loading polls...
          </h2>

          <p
            style={{
              marginBottom: 0,
              color: "#64748b",
            }}
          >
            Please wait while we fetch the latest polls.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "35px 20px",
      }}
    >
      {/* Dashboard Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              marginBottom: "8px",
              color: "#172554",
              fontSize: "32px",
            }}
          >
            Welcome to PulsePoll
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "16px",
            }}
          >
            Browse polls, share your opinion, and see what others think.
          </p>
        </div>

        {/* Create Poll Button */}
        <Link
          to="/create-poll"
          style={{
            padding: "11px 18px",
            textDecoration: "none",
            backgroundColor: "#38bdf8",
            color: "#172554",
            borderRadius: "8px",
            display: "inline-block",
            fontWeight: "700",
            boxShadow: "0 3px 8px rgba(56, 189, 248, 0.25)",
          }}
        >
          ＋ Create Poll
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px",
            backgroundColor: "#ffe5e5",
            color: "#dc2626",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* No Polls */}
      {!error && polls.length === 0 && (
        <div
          style={{
            padding: "35px",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            textAlign: "center",
            backgroundColor: "white",
            boxShadow: "0 3px 12px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              marginBottom: "10px",
            }}
          >
            📊
          </div>

          <h2
            style={{
              color: "#172554",
              marginBottom: "8px",
            }}
          >
            No polls available
          </h2>

          <p
            style={{
              color: "#64748b",
              marginBottom: "20px",
            }}
          >
            Create the first poll and start collecting votes.
          </p>

          <Link
            to="/create-poll"
            style={{
              display: "inline-block",
              padding: "10px 16px",
              backgroundColor: "#38bdf8",
              color: "#172554",
              borderRadius: "7px",
              textDecoration: "none",
              fontWeight: "700",
            }}
          >
            ＋ Create a Poll
          </Link>
        </div>
      )}

      {/* Poll Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "22px",
        }}
      >
        {polls.map((poll) => (
          <div
            key={poll.id}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "22px",
              backgroundColor: "white",
              color: "#222",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.06)",
            }}
          >
            {/* Poll Question */}
            <h2
              style={{
                marginTop: 0,
                marginBottom: "15px",
                color: "#172554",
                fontSize: "21px",
                lineHeight: "1.4",
              }}
            >
              {poll.question}
            </h2>

            {/* Options */}
            <p
              style={{
                color: "#475569",
                marginBottom: "8px",
              }}
            >
              <strong>Options:</strong>
            </p>

            <ul
              style={{
                color: "#334155",
                paddingLeft: "22px",
              }}
            >
              {poll.options.map((option, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: "5px",
                  }}
                >
                  {option}
                </li>
              ))}
            </ul>

            {/* Created Date */}
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginTop: "18px",
              }}
            >
              Created:{" "}
              {new Date(poll.createdAt).toLocaleString()}
            </p>

            {/* Expiry */}
            {poll.expiresAt ? (
              <p
                style={{
                  fontSize: "14px",
                  color:
                    new Date(poll.expiresAt) < new Date()
                      ? "#dc2626"
                      : "#16a34a",
                  fontWeight: "bold",
                }}
              >
                {new Date(poll.expiresAt) < new Date()
                  ? "⏰ Expired"
                  : `⏳ Expires: ${new Date(
                      poll.expiresAt
                    ).toLocaleString()}`}
              </p>
            ) : (
              <p
                style={{
                  fontSize: "14px",
                  color: "#16a34a",
                  fontWeight: "bold",
                }}
              >
                ✓ No expiry
              </p>
            )}

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "18px",
              }}
            >
              <Link
                to={`/poll/${poll.id}`}
                style={{
                  padding: "9px 15px",
                  borderRadius: "7px",
                  textDecoration: "none",
                  backgroundColor: "#172554",
                  color: "white",
                  fontWeight: "600",
                }}
              >
                🗳 Vote
              </Link>

              <Link
                to={`/poll/${poll.id}/results`}
                style={{
                  padding: "9px 15px",
                  borderRadius: "7px",
                  textDecoration: "none",
                  backgroundColor: "#eff6ff",
                  border: "1px solid #38bdf8",
                  color: "#172554",
                  fontWeight: "600",
                }}
              >
                📊 Results
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard; 