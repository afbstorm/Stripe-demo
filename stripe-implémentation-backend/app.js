require("dotenv").config();
const cors = require('cors');
const stripe = require('stripe')(process.env.SK_DEV_STRIPE);
const express = require('express');

const app = express();
app.use(cors({
    origin: 'http://localhost:4200'
}));
const port = 3000;

// Middleware pour parser le body en JSON
app.use(express.json());

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});


// --- Stripe processing ---

app.post('/api/payment', async (req, res) => {
    try {
        const { amount, currency, stripeToken } = req.body;

        const charge = await stripe.charges.create({
            amount: amount,    // ATTENTION montant en centimes !! ⚠️
            currency: currency,
            source: stripeToken,
            description: "Paiement de test"
        });

        res.status(200).json({ success: true, charge });
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});
