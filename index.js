const app = require('express')();
const Note = require('./models/Note');
const cors = require('cors');

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config()
const User = require('./models/User');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
mongoose
  .connect(process.env.MONGO_URL, {
    usenewurlparser: true,
    useunifiedtopology: true,
  })
  .then(() => {
    console.log("Successfully connected to mongoDB ");
  })
  .catch((error) => {
    console.log(`can not connect to database, ${error}`);
  });

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
   
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist, please register.' });
    }
  
    res.status(200).send('logged in successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.post(
  '/register',
  async (req, res) => {
    
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }
      user = new User({
        email,
        password,
      });
     
      await user.save();
      res.send('User registered');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);


// Import the Note model


// Create a new note
app.post('/note', async (req, res) => {
  try {
    const { title, description } = req.body;

    // Create a new Note object
    const note = new Note({
      title,
      description,
    });

    // Save the note to the database
    await note.save();

    // Return the created note
    res.status(201).json(note);
  } catch (err) {
    // Handle errors
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


app.get("/notes", async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search notes
app.get('/notes/search', async (req, res) => {
  try {
    const query = req.query.q; // get search query from request query parameter
    const filteredNotes = await Note.find({ $text: { $search: query } }); // search notes by text index
    res.json(filteredNotes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.put('/notes/:id', async (req, res) => {
  try {
    const { title, description } = req.body;

    // Find the note by ID and update its data
    const note = await Note.findByIdAndUpdate(req.params.id, {
      title,
      description,
    });

    // Return the updated note
    res.json(note);
  } catch (err) {
    // Handle errors
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



  // Delete note by ID
  app.delete('/notes/:id', async (req, res) => {
    try {
      const id = req.params.id; // get note ID from request parameter
      const deletedNote = await Note.findByIdAndDelete(id); // delete note by ID
      if (!deletedNote) {
        return res.status(404).json({ message: 'Note not found' });
      }
      res.json(deletedNote);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// Delete all notes
app.delete('/notes', async (req, res) => {
  try {
    await Note.deleteMany({});
    res.status(200).json({ message: 'All notes deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



app.listen(5000,()=>{
        console.log("started the server")
    })



