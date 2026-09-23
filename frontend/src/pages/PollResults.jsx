import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function PollResults() {
  const { id } = useParams();

  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/polls/${id}/results`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not fetch results.");
        return;
      }

      setPoll(data.poll);
      setResults(data.results || []);
      setTotalVotes(data.totalVotes || 0);
      setError("");
    } catch (error) {
      setError("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();

    const interval = setInterval(() => {
      fetchResults();
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          maxWidth: "750px",
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
            Loading results...
          </h2>

          <p
            style={{
              marginBottom: 0,
              color: "#64748b",
            }}
          >
            Please wait while we calculate the latest results.
          </p>
        </div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div
        style={{
          maxWidth: "750px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            padding: "14px",
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

  return (
    <div
      style={{
        maxWidth: "750px",
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
          Poll Results
        </h1>

        <p
          style={{
            margin: 0,
            color: "#64748b",
          }}
        >
          See how people voted on this poll.
        </p>
      </div>

      {/* Results Card */}
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "28px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
        }}
      >
        {/* Poll Label */}
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
          📊 RESULTS
        </span>

        {/* Question */}
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: "#172554",
            fontSize: "24px",
            lineHeight: "1.4",
          }}
        >
          {poll?.question}
        </h2>

        {/* Total Votes */}
        <div
          style={{
            padding: "16px",
            marginBottom: "25px",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#172554",
            }}
          >
            {totalVotes}
          </div>

          <div
            style={{
              marginTop: "3px",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            {totalVotes === 1 ? "Total Vote" : "Total Votes"}
          </div>
        </div>

        {/* Results */}
        <div>
          {results.map((result, index) => {
            const percentage =
              totalVotes > 0
                ? Math.round(
                    (result.votes / totalVotes) * 100
                  )
                : 0;

            return (
              <div
                key={index}
                style={{
                  marginBottom: "22px",
                }}
              >
                {/* Option Name + Percentage */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      color: "#334155",
                      fontWeight: "600",
                      wordBreak: "break-word",
                    }}
                  >
                    {result.option}
                  </span>

                  <span
                    style={{
                      color: "#172554",
                      fontWeight: "700",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {percentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div
                  style={{
                    width: "100%",
                    height: "13px",
                    backgroundColor: "#e2e8f0",
                    borderRadius: "20px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: "100%",
                      backgroundColor: "#38bdf8",
                      borderRadius: "20px",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>

                {/* Vote Count */}
                <div
                  style={{
                    marginTop: "5px",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  {result.votes}{" "}
                  {result.votes === 1 ? "vote" : "votes"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Status */}
        <div
          style={{
            marginTop: "25px",
            padding: "11px 14px",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
            fontSize: "14px",
            color: "#15803d",
            textAlign: "center",
            fontWeight: "600",
          }}
        >
          ● Live results — updates automatically every 5 seconds
        </div>

        {/* Error During Refresh */}
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

        {/* Navigation Buttons */}
        <div
          style={{
            marginTop: "25px",
            paddingTop: "20px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <Link
            to={`/poll/${id}`}
            style={{
              flex: "1",
              minWidth: "140px",
              padding: "10px 14px",
              border: "1px solid #38bdf8",
              borderRadius: "8px",
              textDecoration: "none",
              color: "#172554",
              backgroundColor: "#eff6ff",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            ← Back to Poll
          </Link>

          <Link
            to="/dashboard"
            style={{
              flex: "1",
              minWidth: "140px",
              padding: "10px 14px",
              backgroundColor: "#172554",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            🏠 Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PollResults;  