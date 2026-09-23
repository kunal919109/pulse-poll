import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav
      style={{
        backgroundColor: "#172554",
        padding: "14px 28px",
        boxShadow: "0 3px 12px rgba(0, 0, 0, 0.15)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* Logo */}
        <Link
          to={token ? "/dashboard" : "/login"}
          style={{
            textDecoration: "none",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: "9px",
          }}
        >
          <span
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              backgroundColor: "#38bdf8",
              color: "#172554",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: "bold",
              boxShadow: "0 0 12px rgba(56, 189, 248, 0.5)",
            }}
          >
            ◉
          </span>

          <span
            style={{
              fontSize: "25px",
              fontWeight: "700",
              letterSpacing: "0.3px",
            }}
          >
            Pulse<span style={{ color: "#38bdf8" }}>Poll</span>
          </span>
        </Link>

        {/* Navigation */}
        {token && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {/* User */}
            {user && (
              <span
                style={{
                  color: "#dbeafe",
                  fontSize: "14px",
                  marginRight: "8px",
                  whiteSpace: "nowrap",
                }}
              >
                👤 Hello, {user.name}
              </span>
            )}

            {/* Dashboard */}
            <Link
              to="/dashboard"
              style={{
                color: "white",
                textDecoration: "none",
                padding: "9px 14px",
                borderRadius: "7px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              🏠 Dashboard
            </Link>

            {/* Create Poll */}
            <Link
              to="/create-poll"
              style={{
                color: "#172554",
                backgroundColor: "#38bdf8",
                textDecoration: "none",
                padding: "10px 16px",
                borderRadius: "7px",
                fontSize: "14px",
                fontWeight: "700",
                boxShadow: "0 3px 8px rgba(56, 189, 248, 0.25)",
              }}
            >
              ＋ Create Poll
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                padding: "9px 15px",
                backgroundColor: "transparent",
                color: "#fecaca",
                border: "1px solid #f87171",
                borderRadius: "7px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ⇥ Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;  

