import AdminLayout from "../../components/Admin/AdminLayout";
import "../../styles/Admin.css";

export default function SettingsAdmin() {
  return (
    <AdminLayout>
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Paramètres</h1>
            <p>Configurez les options du système, les préférences et les paramètres de sécurité.</p>
          </div>
        </div>

        <div className="card card-pad">
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Paramètres de la plateforme</h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nom de l'entreprise</label>
              <input className="form-input" placeholder="MGTS" defaultValue="MGTS" />
            </div>
            <div className="form-group">
              <label className="form-label">Avis de maintenance</label>
              <textarea className="form-textarea" style={{ minHeight: 80 }} defaultValue="Aucune maintenance prévue." />
            </div>
            <div className="form-group">
              <label className="form-label">Mode sombre</label>
              <select className="form-select" defaultValue="off">
                <option value="off">Désactivé</option>
                <option value="on">Activé</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Activer SMTP</label>
              <select className="form-select" defaultValue="off">
                <option value="off">Désactivé</option>
                <option value="on">Activé</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <button className="btn btn-primary">Enregistrer les paramètres</button>
            <button className="btn btn-ghost" style={{ marginLeft: 8 }}>Annuler</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
