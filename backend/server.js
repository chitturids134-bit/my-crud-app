const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ObjectId } = require("mongodb");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

let db;
let workoutsCollection;

// MongoDB Connection
const client = new MongoClient(MONGO_URI);

async function connectDB() {
  try {
    await client.connect();
    db = client.db("gym-tracker");
    workoutsCollection = db.collection("workouts");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Root route so the backend base URL responds in a browser
app.get("/", (req, res) => {
  res.send("Gym Tracker API is running. Visit /health to verify the server.");
});

// ========== CRUD ROUTES ==========

// CREATE - Add a new workout
app.post("/workouts", async (req, res) => {
  try {
    const { exercise, weight, reps } = req.body;

    if (!exercise || !weight || !reps) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newWorkout = {
      exercise,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      date: new Date().toISOString(),
    };

    const result = await workoutsCollection.insertOne(newWorkout);
    res.status(201).json({ ...newWorkout, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: "Failed to create workout" });
  }
});

// READ - Get all workouts
app.get("/workouts", async (req, res) => {
  try {
    const workouts = await workoutsCollection
      .find({})
      .sort({ date: -1 })
      .toArray();
    res.status(200).json(workouts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch workouts" });
  }
});

// UPDATE - Edit an existing workout
app.put("/workouts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { exercise, weight, reps } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid workout ID" });
    }

    const updateData = {};
    if (exercise) updateData.exercise = exercise;
    if (weight) updateData.weight = parseFloat(weight);
    if (reps) updateData.reps = parseInt(reps);

    const result = await workoutsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" },
    );

    if (!result.value) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.status(200).json(result.value);
  } catch (error) {
    res.status(500).json({ error: "Failed to update workout" });
  }
});

// DELETE - Remove a workout
app.delete("/workouts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid workout ID" });
    }

    const result = await workoutsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.status(200).json({ message: "Workout deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete workout" });
  }
});

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);

// Graceful shutdown
process.on("SIGINT", async () => {
  await client.close();
  process.exit(0);
});
