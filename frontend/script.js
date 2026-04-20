// Update this to your Render backend URL when deployed
const BACKEND_URL = "http://localhost:3000";

let allWorkouts = [];
let editingId = null;

// DOM Elements
const form = document.getElementById("workoutForm");
const workoutsList = document.getElementById("workoutsList");
const errorMessage = document.getElementById("errorMessage");
const spinner = document.getElementById("loadingSpinner");
const submitBtn = document.getElementById("submitBtn");

// Load workouts on page load
document.addEventListener("DOMContentLoaded", () => {
  loadWorkouts();
});

// Form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const exercise = document.getElementById("exercise").value.trim();
  const weight = document.getElementById("weight").value;
  const reps = document.getElementById("reps").value;

  if (!exercise || !weight || !reps) {
    showError("Please fill in all fields");
    return;
  }

  if (editingId) {
    await updateWorkout(editingId, exercise, weight, reps);
  } else {
    await createWorkout(exercise, weight, reps);
  }
});

// CREATE - Add a new workout
async function createWorkout(exercise, weight, reps) {
  try {
    showSpinner(true);
    showError("");

    const response = await fetch(`${BACKEND_URL}/workouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercise, weight, reps }),
    });

    if (!response.ok) throw new Error("Failed to create workout");

    const newWorkout = await response.json();
    allWorkouts.unshift(newWorkout);

    form.reset();
    renderWorkouts();
  } catch (error) {
    showError("Could not save workout. Is the backend running?");
    console.error(error);
  } finally {
    showSpinner(false);
  }
}

// READ - Load all workouts
async function loadWorkouts() {
  try {
    showSpinner(true);
    const response = await fetch(`${BACKEND_URL}/workouts`);

    if (!response.ok) throw new Error("Failed to load workouts");

    allWorkouts = await response.json();
    renderWorkouts();
  } catch (error) {
    workoutsList.innerHTML =
      '<p class="empty-message">⚠️ Could not connect to backend. Make sure it\'s running on ' +
      BACKEND_URL +
      "</p>";
    console.error(error);
  } finally {
    showSpinner(false);
  }
}

// UPDATE - Edit a workout
async function updateWorkout(id, exercise, weight, reps) {
  try {
    showSpinner(true);
    showError("");

    const response = await fetch(`${BACKEND_URL}/workouts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercise, weight, reps }),
    });

    if (!response.ok) throw new Error("Failed to update workout");

    await loadWorkouts();
    form.reset();
    editingId = null;
    submitBtn.textContent = "Log Workout";
  } catch (error) {
    showError("Could not update workout");
    console.error(error);
  } finally {
    showSpinner(false);
  }
}

// DELETE - Remove a workout
async function deleteWorkout(id) {
  if (!confirm("Are you sure you want to delete this workout?")) return;

  try {
    showSpinner(true);
    const response = await fetch(`${BACKEND_URL}/workouts/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete workout");

    allWorkouts = allWorkouts.filter((w) => w._id !== id);
    renderWorkouts();
  } catch (error) {
    showError("Could not delete workout");
    console.error(error);
  } finally {
    showSpinner(false);
  }
}

// Edit workout (populate form with existing data)
async function editWorkout(id) {
  const workout = allWorkouts.find((w) => w._id === id);
  if (!workout) return;

  document.getElementById("exercise").value = workout.exercise;
  document.getElementById("weight").value = workout.weight;
  document.getElementById("reps").value = workout.reps;

  editingId = id;
  submitBtn.textContent = "Update Workout";
  document.getElementById("exercise").focus();
  window.scrollTo(0, 0);
}

// Render workouts to DOM
function renderWorkouts() {
  if (allWorkouts.length === 0) {
    workoutsList.innerHTML =
      '<p class="empty-message">No workouts logged yet. Start by logging your first set!</p>';
    return;
  }

  workoutsList.innerHTML = allWorkouts
    .map(
      (workout) => `
    <div class="workout-card">
      <div class="workout-info">
        <div class="workout-exercise">${escapeHtml(workout.exercise)}</div>
        <div class="workout-details">${workout.weight} kg × ${workout.reps} reps</div>
        <div class="workout-date">${new Date(workout.date).toLocaleString()}</div>
      </div>
      <div class="workout-actions">
        <button class="btn-edit" onclick="editWorkout('${workout._id}')">Edit</button>
        <button class="btn-delete" onclick="deleteWorkout('${workout._id}')">Delete</button>
      </div>
    </div>
  `,
    )
    .join("");
}

// Helper functions
function showSpinner(show) {
  spinner.classList.toggle("hidden", !show);
  submitBtn.disabled = show;
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.classList.toggle("show", !!msg);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
