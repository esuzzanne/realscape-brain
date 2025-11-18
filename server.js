const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json()); // Body parsing — must be early!

// CONNECT BRAIN TO CHEST
const dbKey = 'mongodb+srv://esuzzanne:wqI28JiekVsXRYsE@realscape.xxhfxya.mongodb.net/realscape?retryWrites=true&w=majority';

mongoose.connect(dbKey)
  .then(() => console.log('Treasure chest connected!'))
  .catch(err => console.log('Chest error:', err));


// PLAYER BLUEPRINT
const playerSchema = new mongoose.Schema({
  name: String,
  level: Number,
  xp: Number,
  questLog: [{ name: String, xp: Number, timestamp: Date }]
});
const Player = mongoose.model('Player', playerSchema, 'players'); // Outside schema!

app.get('/', (req, res) => {
  res.send('RealScape Brain + Chest = WORKING!');
});

app.get('/get-player', async (req, res) => {
  try {
    const player = await Player.findOne({});
    if (!player) return res.json({ name: 'Hero', xp: 0 });
    res.json({ name: player.name, xp: player.xp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SAVE PLAYER NAME
app.post('/update-name', async (req, res) => {
  try {
    const { name } = req.body;
    const player = await Player.findOneAndUpdate(
      {}, // Find any player
      { name },
      { new: true, upsert: true }
    );
    res.json({ success: true, name: player.name });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// FINAL WORKING /add-xp ROUTE — COPY-PASTE THIS
app.get('/add-xp', async (req, res) => {
  try {
    const amount = parseInt(req.query.amount) || 50;
    const player = await Player.findOneAndUpdate(
      {},
      { $inc: { xp: amount } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    if (!player.name) {
      player.name = 'Hero';
      await player.save();
    }
    res.json({ xp: player.xp, name: player.name });
  } catch (err) {
    console.error('add-xp error:', err);
    res.status(500).send('XP error');
  }
});


// QUEST #2: DRINK WATER
app.get('/drink-water', async (req, res) => {
  try {
    const player = await Player.findOne({});
    if (!player) return res.send('Player not found!');
    player.xp += 20;
    await player.save();
    res.send(`💧 ${player.name} drank water! +20 XP → Total: ${player.xp} XP`);
  } catch (err) {
    res.send('Quest error: ' + err);
  }
});

// ADD QUEST TO LOG
app.post('/log-quest', async (req, res) => {
  try {
    const { questName, xp } = req.body;
    const player = await Player.findOne({});
    if (!player) return res.json({ success: false });
    if (!player.questLog) player.questLog = [];
    player.questLog.push({
      name: questName,
      xp: xp,
      timestamp: new Date()
    });
    await player.save();
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

// ←←← THIS MUST BE LAST ←←←
app.listen(5000, () => {
  console.log('Brain is listening on port 5000');
});