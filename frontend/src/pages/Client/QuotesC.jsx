import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Client.css";
import ClientLayout from "../../components/Client/ClientLayout";
import { ordersAPI } from "../../api/orders.api";
import { paymentsAPI } from "../../api/payments.api";

export default function Quotes() {
  const navigate = useNavigate();

  const [quotes, setQuotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null); // "accept" | "reject" | null
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  // ── Fetch orders with quote ready ─────────────────────────
  useEffect(() => {
    ordersAPI
      .getMyOrders()
      .then((res) => {
        const all = res.data || [];
        // Only show orders that have a quote
        const withQuote = all.filter((o) =>
          [
            "pending_payment",
            "final_calculation",
            "waiting_validation",
            "paid",
            "rejected",
          ].includes(o.status)
        );
        setQuotes(withQuote);
        if (withQuote.length > 0) setSelected(withQuote[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Accept / Reject ───────────────────────────────────────
  const handleAction = async () => {
    setActing(true);
    try {
      const decision = modal === "accept" ? "accept" : "reject";
      await ordersAPI.respond(selected.id, { decision, reason });

      const newStatus = modal === "accept" ? "waiting_validation" : "rejected";
      const updated = { ...selected, status: newStatus };

      setSelected(updated);
      setQuotes((prev) =>
        prev.map((q) => (q.id === selected.id ? updated : q))
      );
      setModal(null);
      setReason("");

      if (modal === "accept") navigate("/client/payment/" + selected.id);
    } catch (err) {
      console.error(err);
    } finally {
      setActing(false);
    }
  };

  // ── Download invoice ──────────────────────────────────────
  const downloadPDF = async () => {
    try {
      const res = await paymentsAPI.downloadInvoice(selected.id);
      const url = window.URL.createObjectURL(new Blob([res]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `MGTS_Devis_${selected.id}.pdf`;
      a.click();
    } catch (err) {
      console.error(err);
    }
  };

  const statusBadge = (status) => {
    const cfg = {
      pending_payment: { label: "En attente", color: "#009189", bg: "#E0F5F4" },
      final_calculation: {
        label: "En attente",
        color: "#009189",
        bg: "#E0F5F4",
      },
      waiting_validation: { label: "Accepté", color: "#007770", bg: "#D5F0EE" },
      paid: { label: "Accepté", color: "#007770", bg: "#D5F0EE" },
      rejected: { label: "Refusé", color: "#CC3A00", bg: "#FFE8DC" },
    };
    const s = cfg[status] ?? {
      label: "En attente",
      color: "#009189",
      bg: "#E0F5F4",
    };
    return (
      <span className="badge" style={{ color: s.color, background: s.bg }}>
        {s.label}
      </span>
    );
  };

  const formatAmount = (v) =>
    v ? parseFloat(v).toLocaleString("fr") + " MAD" : "—";
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const isPending = (o) =>
    ["pending_payment", "final_calculation"].includes(o?.status);
  const isAccepted = (o) => ["waiting_validation", "paid"].includes(o?.status);

  if (loading) {
    return (
      <ClientLayout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <p
            style={{
              color: "var(--text-soft)",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
            }}
          >
            Chargement...
          </p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Mes devis</h1>
            <p>{quotes.length} devis en cours de traitement.</p>
          </div>
        </div>

        {quotes.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              color: "var(--text-soft)",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>◈</div>
            <p>Aucun devis disponible pour le moment.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "300px 1fr",
              gap: 20,
            }}
          >
            {/* Quotes list */}
            <div className="card" style={{ overflow: "hidden" }}>
              {quotes.map((q) => (
                <div
                  key={q.id}
                  onClick={() => setSelected(q)}
                  style={{
                    padding: "16px 18px",
                    borderBottom: "1px solid var(--border-soft)",
                    cursor: "pointer",
                    background:
                      selected?.id === q.id
                        ? "var(--sky-light)"
                        : "transparent",
                    borderLeft:
                      selected?.id === q.id
                        ? "3px solid var(--teal)"
                        : "3px solid transparent",
                    transition: "background .15s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <span
                      className="mono"
                      style={{ fontSize: 10, color: "var(--text-soft)" }}
                    >
                      DEV-{String(q.id).padStart(6, "0")}
                    </span>
                    {statusBadge(q.status)}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-dark)",
                      marginBottom: 4,
                    }}
                  >
                    {q.productName ||
                      q.description?.slice(0, 35) ||
                      "Commande personnalisée"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-soft)" }}>
                    Reçu le {formatDate(q.createdAt)}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--teal)",
                      marginTop: 8,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {formatAmount(q.totalAmount)}
                  </div>
                </div>
              ))}
            </div>

            {/* Quote detail */}
            {selected && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                {/* Header card */}
                <div className="card card-pad">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 18,
                    }}
                  >
                    <div>
                      <div
                        className="mono"
                        style={{
                          fontSize: 11,
                          color: "var(--text-soft)",
                          marginBottom: 4,
                        }}
                      >
                        DEV-{String(selected.id).padStart(6, "0")} · CMD-
                        {String(selected.id).padStart(6, "0")}
                      </div>
                      <h2
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: "var(--text-dark)",
                        }}
                      >
                        {selected.productName ||
                          selected.description?.slice(0, 50) ||
                          "Commande personnalisée"}
                      </h2>
                    </div>
                    {statusBadge(selected.status)}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4,1fr)",
                      gap: 14,
                      padding: "16px 0",
                      borderTop: "1px solid var(--border-soft)",
                      borderBottom: "1px solid var(--border-soft)",
                    }}
                  >
                    {[
                      ["Quantité", `${selected.quantity} u`],
                      ["Incoterm", selected.incoterm || "—"],
                      [
                        "Type",
                        selected.type === "custom"
                          ? "Personnalisé"
                          : "Catalogue",
                      ],
                      ["Date", formatDate(selected.createdAt)],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div className="form-label" style={{ marginBottom: 4 }}>
                          {k}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--text-dark)",
                          }}
                        >
                          {v}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quote lines */}
                <div
                  className="card card-pad"
                  style={{
                    borderColor: isPending(selected)
                      ? "var(--teal)"
                      : "var(--border)",
                    borderWidth: isPending(selected) ? 2 : 1,
                  }}
                >
                  {isPending(selected) && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 16,
                        color: "var(--teal)",
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "var(--teal)",
                          animation: "pulse 1.5s infinite",
                        }}
                      ></span>
                      Action requise — Veuillez valider ou refuser ce devis
                    </div>
                  )}

                  <div style={{ marginBottom: 20 }}>
                    {[
                      ["Coût fournisseur", selected.productionCost],
                      ["Transport maritime", selected.transportCost],
                      ["Frais transitaire", selected.customsCost],
                      ["Commission MGTS", selected.mgtsMargin],
                    ].map(([label, value], i) => (
                      <div key={i} className="quote-line">
                        <span className="quote-line-label">{label}</span>
                        <span
                          className="quote-line-value"
                          style={{
                            color:
                              i === 3 ? "var(--text-soft)" : "var(--text-dark)",
                          }}
                        >
                          {value
                            ? `${parseFloat(value).toLocaleString("fr")} MAD`
                            : "—"}
                        </span>
                      </div>
                    ))}
                    <div
                      className="quote-line quote-total"
                      style={{ marginTop: 8, paddingTop: 14 }}
                    >
                      <span className="quote-line-label">TOTAL TTC</span>
                      <span
                        className="quote-line-value"
                        style={{ color: "var(--teal)", fontSize: 18 }}
                      >
                        {formatAmount(selected.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {isPending(selected) && (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => setModal("accept")}
                      >
                        ✓ Accepter le devis
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => setModal("reject")}
                      >
                        ✗ Refuser
                      </button>
                      <button className="btn btn-ghost" onClick={downloadPDF}>
                        ↓ Télécharger PDF
                      </button>
                    </div>
                  )}

                  {isAccepted(selected) && (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          navigate(`/client/payment/${selected.id}`)
                        }
                      >
                        ◆ Procéder au paiement
                      </button>
                      <button className="btn btn-ghost" onClick={downloadPDF}>
                        ↓ Télécharger PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {modal && (
          <div className="modal-overlay" onClick={() => setModal(null)}>
            <div
              className="card modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              {modal === "accept" ? (
                <>
                  <div
                    className="modal-icon"
                    style={{
                      background: "var(--teal-light)",
                      color: "var(--teal)",
                    }}
                  >
                    ✓
                  </div>
                  <div className="modal-title">Accepter le devis</div>
                  <div className="modal-desc">
                    En confirmant, vous acceptez le devis de{" "}
                    <strong style={{ color: "var(--teal)" }}>
                      {formatAmount(selected?.totalAmount)}
                    </strong>{" "}
                    et vous engagez à effectuer le virement dans les 48h.
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      onClick={handleAction}
                      disabled={acting}
                    >
                      {acting
                        ? "Confirmation…"
                        : "Confirmer & Procéder au paiement"}
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => setModal(null)}
                    >
                      Annuler
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="modal-icon"
                    style={{
                      background: "var(--orange-light)",
                      color: "var(--orange)",
                    }}
                  >
                    ✗
                  </div>
                  <div className="modal-title">Refuser le devis</div>
                  <div
                    className="form-group"
                    style={{ marginBottom: 20, textAlign: "left" }}
                  >
                    <label className="form-label">Motif du refus</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Expliquez la raison du refus pour que notre équipe puisse vous proposer une alternative…"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      className="btn btn-orange"
                      style={{ flex: 1 }}
                      onClick={handleAction}
                      disabled={acting}
                    >
                      {acting ? "Confirmation…" : "Confirmer le refus"}
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => setModal(null)}
                    >
                      Annuler
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
