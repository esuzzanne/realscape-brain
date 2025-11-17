const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
app.use(cors());


// CONNECT BRAIN TO CHEST
const dbKey = 'mongodb+srv://esuzzanne:wqI28JiekVsXRYsE@cluster0.xxxxx.mongodb.net/realscape?retryWrites=true&w=majority';
mongoose.connect(dbKey)
  .then(() => console.log('Treasure chest connected!'))
  .catch(err => console.log('Chest error:', err));



app.get('/get-player', async (req, res) => {
  try {
    const player = await Player.findOne({});
    if (!player) return res.json({ name: 'Hero', xp: 0 });
    res.json({ name: player.name, xp: player.xp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// PLAYER BLUEPRINT
const playerSchema = new mongoose.Schema({
  name: String,
  level: Number,
  xp: Number,
questLog: [{ name: String, xp: Number, timestamp: Date }]
});
const Player = mongoose.model('Player', playerSchema, 'players');




app.get('/', (req, res) => {
  res.send('RealScape Brain + Chest = WORKING!');
});




app.use(express.json()); // ADD IF NOT ALREADY THERE

// SAVE PLAYER NAME
app.post('/update-name', async (req, res) => {
  try {
    const { name } = req.body;
    const player = await Player.findOneAndUpdate(
      {}, // Find the only player
      { name },
      { new: true, upsert: true }
    );
    res.json({ success: true, name: player.name });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ADD QUEST TO LOG
app.post('/log-quest', async (req, res) => { ... }

// GET QUEST LOG
app.get('/get-quest-log', async (req, res) => { ... }

// ←←←← THIS MUST BE LAST ←←←←
app.listen(5000, () => {
  console.log('Brain is listening on port 5000');
});




