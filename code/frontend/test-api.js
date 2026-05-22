import axios from 'axios';

const testLiveConnection = async () => {
  console.log("=== DÉBUT DU TEST LIVE D'INTÉGRATION API ===");
  const email = 'admin@travaux.ma';
  const password = 'password';
  const baseURL = 'http://127.0.0.1:8000/api';

  try {
    console.log(`1. Tentative de connexion avec ${email}...`);
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email,
      password
    });

    const { token, user } = loginResponse.data;
    console.log("✅ Authentification réussie !");
    console.log(`   - Utilisateur : ${user.name} (${user.role.name})`);

    console.log("\n2. Tentative de récupération des statistiques du Dashboard Directeur...");
    const dashboardResponse = await axios.get(`${baseURL}/dashboard/director`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("✅ Données récupérées avec succès ! structure complète du body :");
    console.log(JSON.stringify(dashboardResponse.data, null, 2));
    
  } catch (error) {
    console.error("❌ ERREUR LORS DU TEST LIVE :", error.response?.data || error.message);
  }
};

testLiveConnection();
