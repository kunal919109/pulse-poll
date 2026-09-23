import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }  
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      setMessage("Registration successful!");

      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setError("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 66px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        backgroundColor: "#f8fafc",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              width: "58px",
              height: "58px",
              margin: "0 auto 14px",
              borderRadius: "50%",
              backgroundColor: "#38bdf8",
              color: "#172554",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(56, 189, 248, 0.3)",
            }}
          >
            ◉
          </div>

          <h1
            style={{
              margin: "0 0 8px",
              color: "#172554",
              fontSize: "30px",
            }}
          >
            Create Your Account
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            Join PulsePoll and start creating polls.
          </p>
        </div>

        {/* Register Card */}
        <div
          style={{
            padding: "28px",
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            boxShadow: "0 5px 18px rgba(0, 0, 0, 0.06)",
          }}
        >
          <form onSubmit={handleRegister}>
            {/* Name */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#172554",
                }}
              >
                <strong>Name</strong>
              </label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "15px",
                  outline: "none",
                }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#172554",
                }}
              >
                <strong>Email</strong>
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "15px",
                  outline: "none",
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "22px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#172554",
                }}
              >
                <strong>Password</strong>
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "15px",
                  outline: "none",
                }}
              />

              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Password must contain at least 6 characters.
              </p>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                backgroundColor: "#38bdf8",
                color: "#172554",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow:
                  "0 3px 8px rgba(56, 189, 248, 0.25)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

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

          {/* Login Link */}
          <p
            style={{
              textAlign: "center",
              marginTop: "22px",
              marginBottom: 0,
              color: "#64748b",
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#0284c7",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;  