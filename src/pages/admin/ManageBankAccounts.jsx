import { useState } from "react";

const API = "http://localhost:5200/api/admin/accounts";

export default function ManageBankAccounts() {
  const [senderPassport, setSenderPassport] = useState("");
  const [recipientPassport, setRecipientPassport] = useState("");

  const [sender, setSender] = useState(null);
  const [recipient, setRecipient] = useState(null);

  // balances (we show them)
  const [senderBalances, setSenderBalances] = useState({ main: 0, savings: 0 });
  const [recipientBalances, setRecipientBalances] = useState({ main: 0, savings: 0 });

  const [senderAccType, setSenderAccType] = useState("Main"); // Main | Savings
  const [recipientAccType, setRecipientAccType] = useState("Main");

  const [amount, setAmount] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function fetchClient(passport) {
    const p = passport.trim();
    if (!p) throw new Error("Entre un Passport Number.");

    const res = await fetch(`${API}/client-by-passport/${encodeURIComponent(p)}`);
    const txt = await res.text();
    if (!res.ok) throw new Error(txt || "Client introuvable.");
    return JSON.parse(txt); // { fullName, passportId, ... }
  }

  async function fetchAccounts(passport) {
    const p = passport.trim();
    const res = await fetch(`${API}/${encodeURIComponent(p)}/list`);
    const txt = await res.text();
    if (!res.ok) throw new Error(txt || "Erreur comptes.");
    return JSON.parse(txt); // { accounts: [{ type, balance }, ...] }
  }

  function extractBalances(accounts) {
    // works with any string like "Main Balance", "MAIN", "Savings", etc.
    const mainAcc = (accounts || []).find((a) => String(a.type || "").toLowerCase().includes("main"));
    const savAcc = (accounts || []).find((a) => String(a.type || "").toLowerCase().includes("saving"));
    return {
      main: Number(mainAcc?.balance ?? 0),
      savings: Number(savAcc?.balance ?? 0),
      // Keep real types too (to send to backend)
      mainType: mainAcc?.type || "Main",
      savingsType: savAcc?.type || "Savings",
    };
  }

  async function loadSender() {
    setErr(""); setOk("");
    setSender(null);
    setSenderBalances({ main: 0, savings: 0 });

    try {
      const c = await fetchClient(senderPassport);
      const a = await fetchAccounts(c.passportId);
      const b = extractBalances(a.accounts);

      setSender(c);
      setSenderBalances({ main: b.main, savings: b.savings, mainType: b.mainType, savingsType: b.savingsType });
    } catch (e) {
      setErr(e.message);
    }
  }

  async function loadRecipient() {
    setErr(""); setOk("");
    setRecipient(null);
    setRecipientBalances({ main: 0, savings: 0 });

    try {
      const c = await fetchClient(recipientPassport);
      const a = await fetchAccounts(c.passportId);
      const b = extractBalances(a.accounts);

      setRecipient(c);
      setRecipientBalances({ main: b.main, savings: b.savings, mainType: b.mainType, savingsType: b.savingsType });
    } catch (e) {
      setErr(e.message);
    }
  }

  function getSenderAvailableBalance() {
    return senderAccType === "Main" ? Number(senderBalances.main || 0) : Number(senderBalances.savings || 0);
  }

  function getRealTypeFromUI(balances, uiType) {
    // send the REAL account type string from API
    if (uiType === "Main") return balances.mainType || "Main";
    return balances.savingsType || "Savings";
  }

  async function doTransfer() {
    setBusy(true);
    setErr("");
    setOk("");

    try {
      if (!sender || !recipient) {
        setErr("Choisis expéditeur et destinataire d’abord.");
        return;
      }

      const a = Number(amount);
      if (!a || a <= 0) {
        setErr("Montant invalide.");
        return;
      }

      // ✅ check from displayed balances
      const available = getSenderAvailableBalance();
      if (a > available) {
        setErr(`Tu n’as pas ce montant (solde insuffisant). Solde dispo: ${available}`);
        return;
      }

      const res = await fetch(`${API}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderPassport: sender.passportId,
          senderAccountType: getRealTypeFromUI(senderBalances, senderAccType),
          recipientPassport: recipient.passportId,
          recipientAccountType: getRealTypeFromUI(recipientBalances, recipientAccType),
          amount: a,
        }),
      });

      const txt = await res.text();
      if (!res.ok) throw new Error(txt || "Erreur transfert");

      const data = JSON.parse(txt);
      setOk(data.message || "Transfert effectué ✅");

      // ✅ refresh balances after transfer
      await loadSender();
      await loadRecipient();
      setAmount("");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  }

  function clearAll() {
    setSenderPassport("");
    setRecipientPassport("");
    setSender(null);
    setRecipient(null);
    setSenderBalances({ main: 0, savings: 0 });
    setRecipientBalances({ main: 0, savings: 0 });
    setSenderAccType("Main");
    setRecipientAccType("Main");
    setAmount("");
    setErr("");
    setOk("");
    setConfirmOpen(false);
  }

  return (
    <div style={{ color: "white" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontWeight: 900, fontSize: 18 }}>Manage Bank Accounts — Transfer</div>
        <button onClick={clearAll} style={btn}>Supprimer (vider)</button>
      </div>

      {err && <div style={errBox}>{err}</div>}
      {ok && <div style={okBox}>{ok}</div>}

      <div style={grid}>
        {/* SENDER */}
        <div style={card}>
          <div style={cardTitle}>Expéditeur</div>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={senderPassport}
              onChange={(e) => setSenderPassport(e.target.value)}
              placeholder="Passport Number..."
              style={input}
            />
            <button onClick={loadSender} style={btn}>Search</button>
          </div>

          {sender && (
            <div style={miniInfo}>
              <div><b>Nom:</b> {sender.fullName}</div>
              <div><b>Passport:</b> {sender.passportId}</div>

              <div style={{ marginTop: 10 }}>
                <div style={balancesLine}><b>Solde Main Balance:</b> {Number(senderBalances.main || 0)}</div>
                <div style={balancesLine}><b>Solde Savings:</b> {Number(senderBalances.savings || 0)}</div>
              </div>

              <div style={{ marginTop: 10 }}>
                <label style={label}>Compte</label>
                <select value={senderAccType} onChange={(e) => setSenderAccType(e.target.value)} style={select}>
                  <option value="Main">Main Balance</option>
                  <option value="Savings">Savings</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* RECIPIENT */}
        <div style={card}>
          <div style={cardTitle}>Destinataire</div>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={recipientPassport}
              onChange={(e) => setRecipientPassport(e.target.value)}
              placeholder="Passport Number..."
              style={input}
            />
            <button onClick={loadRecipient} style={btn}>Search</button>
          </div>

          {recipient && (
            <div style={miniInfo}>
              <div><b>Nom:</b> {recipient.fullName}</div>
              <div><b>Passport:</b> {recipient.passportId}</div>

              <div style={{ marginTop: 10 }}>
                <div style={balancesLine}><b>Solde Main Balance:</b> {Number(recipientBalances.main || 0)}</div>
                <div style={balancesLine}><b>Solde Savings:</b> {Number(recipientBalances.savings || 0)}</div>
              </div>

              <div style={{ marginTop: 10 }}>
                <label style={label}>Compte</label>
                <select value={recipientAccType} onChange={(e) => setRecipientAccType(e.target.value)} style={select}>
                  <option value="Main">Main Balance</option>
                  <option value="Savings">Savings</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AMOUNT */}
      <div style={{ ...card, marginTop: 12 }}>
        <div style={cardTitle}>Montant</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Montant..."
            style={{ ...input, width: 220 }}
            inputMode="decimal"
          />

          {sender && (
            <div style={{ opacity: 0.9, fontWeight: 800 }}>
              Solde dispo ({senderAccType}): {getSenderAvailableBalance()}
            </div>
          )}

          <button
            onClick={() => setConfirmOpen(true)}
            disabled={busy}
            style={{ ...btn, opacity: busy ? 0.6 : 1 }}
          >
            Transfert
          </button>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {confirmOpen && (
        <div style={overlay}>
          <div style={modal}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Confirmation</div>
            <div style={{ opacity: 0.9, marginBottom: 12 }}>
              Tu es sûr de faire le transfert ?
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmOpen(false)} style={btn}>Non</button>
              <button onClick={doTransfer} style={btnPrimary} disabled={busy}>Oui</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* styles */
const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
const card = { border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 12, background: "rgba(255,255,255,0.04)" };
const cardTitle = { fontWeight: 900, marginBottom: 10 };

const balancesLine = { marginTop: 4 };

const input = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  outline: "none",
  width: "100%",
};

const select = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  outline: "none",
  width: "100%",
};

const btn = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const btnPrimary = { ...btn, background: "rgba(255,255,255,0.16)" };

const miniInfo = { marginTop: 10, padding: 10, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)" };
const label = { display: "block", fontWeight: 800, opacity: 0.9, marginBottom: 6 };

const errBox = { background: "rgba(255,80,80,0.12)", border: "1px solid rgba(255,80,80,0.25)", padding: 10, borderRadius: 12, marginBottom: 10, fontWeight: 800 };
const okBox = { background: "rgba(80,255,160,0.10)", border: "1px solid rgba(80,255,160,0.25)", padding: 10, borderRadius: 12, marginBottom: 10, fontWeight: 800 };

const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 };
const modal = { width: 360, borderRadius: 16, padding: 14, background: "#0f172a", border: "1px solid rgba(255,255,255,0.12)" };
