const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  family: 4,
});

const sendVerificationEmail = async (email, fullName, token) => {
  const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "MGTS - Vérification de votre email",
    html: `
      <h2>Bonjour ${fullName},</h2>
      <p>Merci de vous être inscrit sur <strong>MGTS</strong>.</p>
      <p>Cliquez sur le lien ci-dessous pour vérifier votre email :</p>
      <a href="${link}" style="background:#009189;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
        Vérifier mon email
      </a>
      <p>Ce lien expire dans <strong>24 heures</strong>.</p>
    `,
  });
};

const sendPasswordResetEmail = async (email, fullName, token) => {
  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "MGTS - Réinitialisation du mot de passe",
    html: `
      <h2>Bonjour ${fullName},</h2>
      <p>Vous avez demandé une réinitialisation de mot de passe.</p>
      <a href="${link}" style="background:#009189;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
        Réinitialiser mon mot de passe
      </a>
      <p>Ce lien expire dans <strong>1 heure</strong>.</p>
      <p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>
    `,
  });
};

const sendOrderStatusEmail = async (email, fullName, orderId, status) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: `MGTS - Mise à jour commande #${orderId}`,
    html: `
      <h2>Bonjour ${fullName},</h2>
      <p>Votre commande <strong>#${orderId}</strong> a été mise à jour.</p>
      <p>Nouveau statut : <strong>${status}</strong></p>
      <a href="${process.env.CLIENT_URL}/orders/${orderId}" 
         style="background:#009189;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
        Voir ma commande
      </a>
    `,
  });
};

const sendCredentialsEmail = async (email, fullName, password) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "MGTS - Vos identifiants de connexion",
    html: `
        <h2>Bonjour ${fullName},</h2>
        <p>Votre compte <strong>MGTS</strong> a été créé par l'administrateur.</p>
        <p>Voici vos identifiants :</p>
        <ul>
          <li><strong>Email :</strong> ${email}</li>
          <li><strong>Mot de passe :</strong> ${password}</li>
        </ul>
        <p>Connectez-vous ici :</p>
        <a href="${process.env.CLIENT_URL}/login"
           style="background:#009189;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
          Se connecter
        </a>
        <p style="color:red;">Pensez à changer votre mot de passe après la première connexion.</p>
      `,
  });
};

// N'oublie pas d'ajouter dans module.exports :
module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderStatusEmail,
  sendCredentialsEmail,
};
