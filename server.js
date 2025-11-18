// server.js  ← save exactly as "server.js" in your realscape-brain folder
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// YOUR ATLAS STRING (already correct)
const dbKey = 'mongodb+srv://esuzzanne:wqI28JiekVsXRYsE@realscape.xxhfxya.mongodb.net/realscape?retryWrites=true&w=majority';

mongoose.connect(dbKey, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Atlas connected'))
  .catch(err => console.error('Atlas error:', err));

// PLAYER SCHEMA
const playerSchema = new mongoose.Schema({
  name: { type: String, default: 'Hero' },
  xp: { type: Number, default: 0 },
  questLog: [{ name: String, xp: Number, timestamp: Date }]
});
const Player = mongoose.model('Player', playerSchema);

// ROUTES
app.get('/', (req, res) => res.send('RealScape Brain ALIVE'));

app.get('/get-player', async (req, res) => {
  try {
    let player = await Player.findOne({});
    if (!player) player = await new Player().save();
    res.json({ name: player.name, xp: player.xp });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/update-name', async (req, res) => {
  try {
    const { name } = req.body;
    const player = await Player.findOneAndUpdate({}, { name }, { new: true, upsert: true });
    res.json({ name: player.name });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/add-xp', async (req, res) => {
  try {
    const amount = parseInt(req.query.amount) || 50;
    const player = await Player.findOneAndUpdate(
      {},
      { $inc: { xp: amount } },
      { new: true, upsert: true }
    );
    res.json({ xp: player.xp, name: player.name || 'Hero' });
  } catch (e) {
    console.error(e);
    res.status(500).send('XP error');
  }
});

app.post('/log-quest', async (req, res) => {
  try {
    const { questName, xp } = req.body;
    await Player.updateOne(
      {},
      { $push: { questLog: { name: questName, xp, timestamp: new Date() } } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/get-quest-log', async (req, res) => {
  try {
    const player = await Player.findOne({});
    res.json(player?.questLog || []);
  } catch (e) { res.json([]); }
});

// THIS LINE IS REQUIRED FOR VERCEL
module.exports = app;