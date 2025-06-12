import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: "service_account",
      project_id: "rbx-sm-db",
      private_key_id: "6856c7f91cbe611f49c611de5a2c166193c25d78",
      private_key: `-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDbr1oXZJisCMhk\naHn68zIz4G2ti4sbakgctC6kLk1BjzsDYZHEUdU+C2ALGGlDJqrtjGWEN00IPnmx\nIcKcfeBgZOT2uUDFGhgVxgXdctc0YI+ArURkEkMWCO8gnR5c8ZKycjM6zckBjcD7\nlqvyxguK+uQu4yo01tLrtjEJ41zfgHLFvHsnkpqXTvbsvsBjMWOTwpxm2Hes0zCK\nXbMmPtfoZWpXJAq96eENW9sVL5YiMpI1w4H/oYEcCldV0K6L4DaKuiBkmZF6qOFZ\n4Z+UUHearxu4YSO8s9qOA5nL7SW9rhg85FddyY+YXBGEUxGYL2BR5mIwBJOAEZ90\nzgsZ+jfNAgMBAAECggEAAJrkiCD2TK7/gktJXrgRwNPS6YHzYaFyzmVupXQdMVuI\nIZPAt4Y0LKYSXyVzkMRH/zx+QRV36FhntGWv6AduuUU93jIXbBOM0m6HsJry3cmQ\nS53ujMoCFkrzAad9IGtn6Ibo/jX34kG2MNsy4QnLmVfkjf6BLMEUtqJ7UxglttXd\n7KHiFIDYGmof8S1Aum8WBL8mOK/FDIXnJcnmozoWjxzOjH4qpOoCJielce6YC1xS\nCUPfu8bmzoqj3ScywhYDj2TfAYQbcXpzf4pTFJEsoeYqnkcG/8zdiENAVx1ZI840\nS4z0hLicqH9Z1WsV07vHe7cv/LHzZcG19fUJfbg6/wKBgQDuy2y1WO30ahnLaYvm\nrkJ+JPo5rdqXl8ql5vFpc/YTmIVKiI7bCzwfsN3PgRzVJy24CaBuJGTCNEtBINyj\n+3HNE8ktka6M6pZhFjauRocQ7fPf/AY/zxZIJURagt0WMSUyfoGZv2ZVpKKersFd\nJziFiQVfeM3oYo/AERtV0+xa8wKBgQDrg3LtriFOldZZLdNARHFyFHvX9rMU2j4x\nuVZot6MholN8R4pa11Zw/y0PuOSxcaMjF7MJAVbdep0unGZWv47TQdpl3WUMPfYr\nLe+O4w3nomEl1PftZDvyq7aXaLTuAFiIfBSjIWTQ2A4TbXC8f7SY14dfEhJe8WMS\nNZthOxpSPwKBgC0kLX+2uPz8VbX7VOQdyxoXmWnv8KO5oShtmPNrZXhc2820NPU5\nkXsYL0Y7zRyKVH027KoFnTqNMjC0qqEhNmkjNWO0539iFV1zGpElagEMSo7sEK5d\nUoP+74YAuRSp47NA8PUElq7X+ZnvxUP71xZ/SZG7v4kPoMcZNMar0kF7AoGAQBd+\nsFYB9GvscEp7QfMeWGhgp44YgCVAZbHFZSwMdfvB8oFZko0llgyri6rKecuuFL+/\nVkUKCa3zlpqzcwogaTdzouMUO7elBW0z01PRFednvq7tZaowckLupte03Uw0y7fQ\nufA9imQxuHHBC1tJn4qP6Xx2iWXxiyQRi+1UpWsCgYB1CjvEcMj4I9I8TBX/44ew\nnyIuhrqTIhTShMFtAv5d7bQJxkwTc8qKUXSdaRNYRvsLWW0A21CddzMEjEbZx5+6\nMj3eYy8VeI5eQepFIywHF+vQagN1YzA4QtuCojV9uYvIv/4MM3vQwdp9zYLj1rOk\niQuVZdz2ziRazeDjhkxovg==\n-----END PRIVATE KEY-----\n`,
      client_email: "firebase-adminsdk-fbsvc@rbx-sm-db.iam.gserviceaccount.com",
      client_id: "116389458781494290188"
    }),
    databaseURL: "https://rbx-sm-db.firebaseio.com"
  });
}

export default admin;
