const express = require('express');
const mongoose = require('mongoose;
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// YOUR ATLAS STRING — 100% CORRECT
const dbKey = 'mongodb+srv://esuzzanne:wqI28JiekVsXRYsE@realscape.xxhfxya.mongodb.net/realscape?retryWrites=true&w=majority';

mongoose.connect(dbKey)
  .then(() => console.log('Treasure chest connected!'))
  .catch(err => console.log('Chest error:', err));

// PLAYER SCHEMA — FIXED WITH DEFAULTS
const playerSchema = new mongoose.Schema({
  name: { type: String, default: 'Hero' },
  xp: { type: Number, default: 0 },
  questLog: [{ name: String, xp: Number, timestamp: Date }]
});
const Player = mongoose.model('Player', playerSchema);

// HOME
app.get('/', (req, res) => res.send('RealScape Brain = ALIVE!'));

// GET PLAYER (creates if not exists)
app.get('/get-player', async (req, res) => {
  try {
    let player = await Player.findOne({});
    if (!player) {
      player = new Player({});
      await player.save();
    }
    res.json({ name: player.name, xp: player.xp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE NAME
app.post('/update-name', async (req, res) => {
  try {
    const { name } = req.body;
    const player = await Player.findOneAndUpdate(
      {},
      { name },
      { new: true, upsert: true }
    );
    res.json({ success: true, name: player.name });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ADD XP — FINAL WORKING VERSION
app.get('/add-xp', async (req, res) => {
  try {
    const amount = parseInt(req.query.amount) || 50;
    const player = await Player.findOneAndUpdate(
      {},
      { $inc: { xp: amount } },
      { new: true, upsert: true }
    );
    if (!player.name) player.name = 'Hero';
    await player.save();
    res.json({ xp: player.xp, name: player.name });
  } catch (err) {
    console.error('XP error:', err);
    res.status(500).json({ error: 'XP error' });
  }
});

// LOG QUEST
app.post('/log-quest', async (req, res) => {
  try {
    const { questName, xp } = req.body;
    await Player.updateOne(
      {},
      { $push: { questLog: { name: questName, xp, timestamp: new Date() } } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// GET QUEST LOG
app.get('/get-quest-log', async (req, res) => {
  try {
    const player = await Player.findOne({});
    res.json(player?.questLog || []);
  } catch (err) {
    res.json([]);
  }
});

// FOR VERCEL SERVERLESS — THIS LINE IS REQUIRED
module.exports = app;

// OPTIONAL LOCAL PORT (harmless on Vercel)
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}`));