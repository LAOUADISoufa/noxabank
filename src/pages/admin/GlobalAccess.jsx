import React, { useMemo, useState } from "react";

const API_BASE =
  import.meta?.env?.VITE_API_BASE?.replace(/\/$/, "") || "http://localhost:5200/api";

export default function GlobalAccess() {
  const [passport, setPassport] = useState("");
  const [client, setClient] = useState(null);
  const [msg, setMsg] = useState("");

  const [depositType, setDepositType] = useState("cash"); // cash | cheque
  const [accountType, setAccountType] = useState("main"); // main | savings | credit
  const [amount, setAmount] = useState("");

  // cheque fields
  const [provider, setProvider] = useState("");
  const [depositDate, setDepositDate] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [chequeImage, setChequeImage] = useState(null);

  const isCheque = depositType === "cheque";

  const canSubmit = useMemo(() => {
    if (!client) return false;
    const a = Number(amount);
    if (!a || a <= 0) return false;

    if (!isCheque) return true;

    if (!provider.trim()) return false;
    if (!depositDate) return false;
    if (!chequeDate) return false;
    if (!chequeImage) return false;

    // cheque max 30 jours
    const cd = new Date(chequeDate);
    const dd = new Date(depositDate);
    if (isNaN(cd.getTime()) || isNaN(dd.getTime())) return false;

    const diffDays = Math.floor((dd - cd) / (1000 * 60 * 60 * 24));
    if (diffDays > 30) return false;
    if (diffDays < 0) return false;

    return true;
  }, [client, amount, isCheque, provider, depositDate, chequeDate, chequeImage]);

  // ✅ bon endpoint (comme ManageBankAccounts)
  const searchClient = async () => {
    setMsg("");
    setClient(null);

    const p = passport.trim();
    if (!p) {
      setMsg("Entre un Passport Number.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/admin/accounts/client-by-passport/${encodeURIComponent(p)}`
      );

      if (!res.ok) {
        setMsg("Client introuvable.");
        return;
      }

      const data = await res.json();
      // attendu: { id, fullName, email, phoneNumber, passportId, birthDate, isActive }
      setClient(data);
      setMsg(`Client trouvé : ${data.fullName} (${data.passportId})`);
    } catch (e) {
      setMsg("Erreur réseau (API).");
    }
  };

  const clearAll = () => {
    setPassport("");
    setClient(null);
    setMsg("");

    setDepositType("cash");
    setAccountType("main");
    setAmount("");

    setProvider("");
    setDepositDate("");
    setChequeDate("");
    setChequeImage(null);
  };

  const doDeposit = async () => {
    setMsg("");

    if (!client) return setMsg("Cherche le client d'abord.");
    if (!canSubmit) return setMsg("Formulaire incomplet.");

    const ok = window.confirm("Confirmer le dépôt ?");
    if (!ok) return;

    try {
      const fd = new FormData();
      fd.append("PassportNumber", client.passportId);
      fd.append("DepositType", depositType); // cash | cheque
      fd.append("AccountType", accountType); // main | savings | credit
      fd.append("Amount", String(Number(amount)));

      if (isCheque) {
        fd.append("Provider", provider);
        fd.append("DepositDate", depositDate);
        fd.append("ChequeDate", chequeDate);
        fd.append("ChequeImage", chequeImage);
      }

      const res = await fetch(`${API_BASE}/admin/global-access/deposit`, {
        method: "POST",
        body: fd,
      });

      // ✅ FIX IMPORTANT: backend renvoie du JSON, pas du texte
      let data = null;
      try {
        data = await res.json();
      } catch {
        // fallback si jamais l'API renvoie du texte
        const t = await res.text();
        if (!res.ok) {
          setMsg(t || "Erreur dépôt.");
          return;
        }
        setMsg(t || "Dépôt OK.");
        return;
      }

      if (!res.ok) {
        setMsg(data?.message || "Erreur dépôt.");
        return;
      }

      // ✅ Message propre + soldes
      const b = data?.balances || {};
      const main = b?.mainBalance ?? "0.00";
      const savings = b?.savingsBalance ?? "0.00";
      const credit = b?.creditBalance ?? "0.00";

      setMsg(
        `✔ ${data.message} — ${data.fullName} (${data.passportNumber}) | Main: $${main} | Savings: $${savings} | Credit: $${credit}`
      );

      // Optionnel: si tu veux forcer l'affichage du client info (active/inactive)
      // (si tu veux le garder pareil, tu peux enlever cette ligne)
      setClient((prev) =>
        prev
          ? {
              ...prev,
              fullName: data.fullName || prev.fullName,
              passportId: data.passportNumber || prev.passportId,
            }
          : prev
      );
    } catch (e) {
      setMsg("Erreur réseau (API).");
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h3 style={styles.title}>Global Access — Deposit</h3>

        {msg && <div style={styles.msg}>{msg}</div>}

        {/* Search */}
        <div style={styles.row}>
          <input
            style={styles.input}
            placeholder="Passport Number..."
            value={passport}
            onChange={(e) => setPassport(e.target.value)}
          />
          <button style={styles.btn} onClick={searchClient}>
            Search
          </button>
        </div>

        {/* Client Info */}
        {client && (
          <div style={styles.clientBox}>
            <div>
              <b>Nom :</b> {client.fullName}
            </div>
            <div>
              <b>Passport :</b> {client.passportId}
            </div>
            <div style={{ opacity: 0.9, marginTop: 6 }}>
              <b>Status :</b> {client.isActive ? "Active" : "Inactive"}
            </div>
          </div>
        )}

        {/* Deposit Type + Account */}
        <div style={styles.row2}>
          <div style={{ flex: 1 }}>
            <div style={styles.label}>Type dépôt</div>
            <select
              style={styles.select}
              value={depositType}
              onChange={(e) => setDepositType(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="cheque">Chèque</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <div style={styles.label}>Compte</div>
            <select
              style={styles.select}
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
            >
              <option value="main">Main Balance</option>
              <option value="savings">Savings</option>
              <option value="credit">Credit Balance</option>
            </select>
          </div>
        </div>

        {/* Amount */}
        <div style={{ marginTop: 10 }}>
          <div style={styles.label}>Montant</div>
          <input
            style={styles.input}
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
          />
        </div>

        {/* Cheque fields */}
        {isCheque && (
          <div style={{ marginTop: 12 }}>
            <div style={styles.row2}>
              <div style={{ flex: 1 }}>
                <div style={styles.label}>Fournisseur</div>
                <input
                  style={styles.input}
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="ex: Bell / Intelcom ..."
                />
              </div>

              <div style={{ flex: 1 }}>
                <div style={styles.label}>Date dépôt</div>
                <input
                  style={styles.input}
                  type="date"
                  value={depositDate}
                  onChange={(e) => setDepositDate(e.target.value)}
                />
              </div>
            </div>

            <div style={styles.row2}>
              <div style={{ flex: 1 }}>
                <div style={styles.label}>Date chèque</div>
                <input
                  style={styles.input}
                  type="date"
                  value={chequeDate}
                  onChange={(e) => setChequeDate(e.target.value)}
                />
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
                  (Chèque ≤ 30 jours)
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={styles.label}>Photo du chèque</div>
                <input
                  style={styles.input}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setChequeImage(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button
            style={{ ...styles.btn, opacity: canSubmit ? 1 : 0.5 }}
            onClick={doDeposit}
            disabled={!canSubmit}
          >
            Valider
          </button>
          <button style={styles.btn2} onClick={clearAll}>
            Vider
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { padding: 8 },
  card: {
    borderRadius: 18,
    padding: 16,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    maxWidth: 980,
  },
  title: { margin: 0, fontWeight: 900, fontSize: 20 },
  msg: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
    whiteSpace: "pre-wrap",
  },
  row: { display: "flex", gap: 10, marginTop: 12, alignItems: "center" },
  row2: { display: "flex", gap: 10, marginTop: 10, alignItems: "center", flexWrap: "wrap" },
  label: { fontSize: 12, opacity: 0.85, marginBottom: 6 },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    outline: "none",
    boxSizing: "border-box",
  },
  btn: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.12)",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btn2: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  clientBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
};
