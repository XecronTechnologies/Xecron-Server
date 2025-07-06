const express = require("express");
const app = express();
app.use(express.json());

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const addClient = async (req, res) => {
  let clientLimit = null;
  // Xecron Limit Check
  try {
    const { data, error } = await supabase
      .from("xecron_clients_limitations")
      .select("rec_lmt")
      .eq("cl", req.body.client_limit.cl);

    clientLimit = data[0].rec_lmt;
  } catch (err) {
    console.warn("Unexpected error while fetching limit:", err.message);
  }

  try {
    const inputClient = req.body.client_limit.cl;
    let status = false
      const { count: clientCount, error: countError } = await supabase
      .from(inputClient)
      .select("*", { count: "exact", head: true });
      if(!clientCount) return res.json({error:"No client Name"})

    if (countError) throw countError;
      if (clientCount >= clientLimit) {
        return res.status(400).json({
          error: `Client limit reached (${clientCount}/${clientLimit})`,
          limit: clientLimit,
          current: clientCount,
        });
      }
    

    const { error: insertError } = await supabase
      .from(`${req.body.client_limit.cl}`)
      .insert([req.body.client_body]);
    if (insertError) throw insertError;
    res.json({
      success: true,
      message: "Client added successfully",
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
};

app.post("/add-client", addClient);

app.get("/get-cld", async (req, res) => {
  const { data, error } = await supabase.from("customers").select("*");

  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.delete("/del-cld", async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing id parameter" });

  const { data, error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.post("/update", async (req, res) => {
  const { tbname, id, ...updateFields } = req.body;
  const response = await supabase
    .from(tbname)
    .update(updateFields)
    .eq("id", id);
  res.json(response);
});

//Api url redirect to Xecron Domain
app.get("/", (req, res) => {
  res.redirect("https://www.xecrontechnologies.in");
});
//Render ALive Response
app.get("/api", (req, res) => {
  res.send("Xecron on Live");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server is running");
});
