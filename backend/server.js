import express from 'express';
import { initiatePayment } from './api/payment.js';
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Mount payment routes
app.post('/api/payment', (req, res) => {
  const amount = req.body.amount;
  const user = req.body.user;
  initiatePayment(amount, user);
})

app.post("api/")



app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
