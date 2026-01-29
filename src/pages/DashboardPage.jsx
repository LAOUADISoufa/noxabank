import "../styles/dashboard.css";

export default function DashboardPage() {
  const fullName = localStorage.getItem("fullName") || "Client";

  return (
    <div className="db">
      {/* ✅ THIS wrapper makes it centered + dynamic width */}
      <div className="db-main-wrapper">
        {/* SIDEBAR */}
        <aside className="sb">
          <div className="sb-brand">
            <div className="sb-title">NOXABANK</div>
            <div className="sb-sub">{fullName}</div>
          </div>

          <nav className="sb-nav">
            <div className="sb-item active">Dashboard</div>
            <div className="sb-item">Balance Overview</div>
            <div className="sb-item">Deposit</div>
            <div className="sb-item">Withdraw</div>
            <div className="sb-item">Transfer</div>
            <div className="sb-item">Transaction History</div>
            <div className="sb-item">Credit Card Management</div>
            <div className="sb-item">Cheque Deposit</div>
          </nav>

          <div className="sb-bottom">
            <button
              className="sb-logout"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("fullName");
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="db-main">
          {/* TOPBAR */}
          <header className="tb">
            <div className="tb-left">
              <h2>Dashboard</h2>
            </div>

            <div className="tb-search">
              <input placeholder="Search here..." />
              <span className="tb-search-icon">🔍</span>
            </div>

            <div className="tb-right">
              <div className="tb-user">
                <div className="tb-avatar" />
                <div className="tb-usertext">
                  <div className="tb-name">{fullName}</div>
                  <div className="tb-role">Client</div>
                </div>
              </div>
            </div>
          </header>

          {/* CARDS */}
          <section className="db-cards">
            <div className="card">
              <p className="card-title">Credit Balance</p>
              <h3>$824,571.93</h3>
              <span>{fullName}</span>
            </div>

            <div className="card">
              <p className="card-title">Main Balance</p>
              <h3>$98,452.44</h3>
              <span>{fullName}</span>
            </div>

            <div className="card">
              <p className="card-title">Savings</p>
              <h3>$10,000.45</h3>
              <span>{fullName}</span>
            </div>
          </section>

          {/* TABLE */}
          <section className="db-table">
            <h3>Transaction History</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Recipient</th>
                  <th>Amount</th>
                  <th>Type</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>#12345</td>
                  <td>2026-01-20</td>
                  <td>Marcus</td>
                  <td>$128.89</td>
                  <td>Income</td>
                </tr>

                <tr>
                  <td>#12346</td>
                  <td>2026-01-21</td>
                  <td>Jordyn</td>
                  <td>$128.89</td>
                  <td>Outcome</td>
                </tr>
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
}
