const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// CONNECT TO ATLAS
const dbKey = 'mongodb+srv://esuzzanne:wqI28JiekVsXRYsE@realscape.xxhfxya.mongodb.net/realscape?retryWrites=true&w=majority';
mongoose.connect(dbKey)
  .then(() => console.log('Connected to Atlas!'))
  .catch(err => console.log('Atlas error:', err));

// PLAYER SCHEMA
const playerSchema = new mongoose.Schema({
  name: { type: String, default: 'Hero' },
  xp: { type: Number, default: 0 },
  questLog: [{ name: String, xp: Number, timestamp: Date }]
});
const Player = mongoose.model('Player', playerSchema);

// ROUTES
app.get('/', (req, res) => res.send('RealScape Brain = ALIVE!'));

app.get('/get-player', async (req, res) => {
  try {
    let player = await Player.findOne({});
    if (!player) player = await new Player().save();
    res.json({ name: player.name, xp: player.xp });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/update-name', async (req, res) => {
  try {
    const { name } = req.body;
    const player = await Player.findOneAndUpdate({}, { name }, { new: true, upsert: true });
    res.json({ success: true, name: player.name });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/add-xp', async (req, res) => {
  try {
    const amount = parseInt(req.query.amount) || 50;
    const player = await Player.findOneAndUpdate(
      {},
      { $inc: { xp: amount } },
      { new: true, upsert: true }
    );
    res.json({ xp: player.xp, name: player.name });
  } catch (err) {
    console.error(err);
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
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/get-quest-log', async (req, res) => {
  try {
    const player = await Player.findOne({});
    res.json(player?.questLog || []);
  } catch (err) { res.json([]); }
});

module.exports = app;   // ← THIS IS REQUIRED FOR VERCEL SERVERLESS