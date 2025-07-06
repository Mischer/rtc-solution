import express from "express";

const app = express();
app.use(express.json());

app.get("/client/state", (req, res) => {
    res.json({ message: "stub state" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`MyApp listening on port ${port}`);
});