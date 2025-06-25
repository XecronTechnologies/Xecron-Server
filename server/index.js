require("dotenv").config(); // Load environment variables from .env
const express = require("express");
const { db } = require("./firebase-config");

const app = express();

// ✅ Middleware to parse JSON
app.use(express.json());

// ✅ Import routes
const authRoutes = require("./routes/authRoutes");

// ✅ Redirect root to main site
app.get("/", (req, res) => {
  res.redirect("https://www.xecrontechnologies.in");
});

// ✅ Health check route
app.get("/api", (req, res) => {
  res.send("Xecron on Live");
});

// ✅ Auth Routes
app.use("/api/auth", authRoutes);

// ❌ Commented out DB route for now
// 🔄 Uncomment and customize as needed
/*
app.get("/api/data", async (req, res) => {
  try {
    const snapshot = await db.collection("items").get();
    const items = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        name: data.name,
        age: data.age,
      });
    });

    res.json(items);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Error fetching data", error: error.message });
  }
});
*/

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
