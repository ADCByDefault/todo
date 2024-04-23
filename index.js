import express from "express";
import mongoose from "mongoose";
// Routes
import indexRouter from "./routes/indexRouter.js";
import authRouter from "./routes/authRouter.js";

// Constants
const PORT = 3000;
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(logRequest);
// View Engine
app.set("view engine", "ejs");
// Routes
app.use(indexRouter);
app.use("/auth", authRouter);
// 404
app.use((req, res, next) => {
    res.status(404);
    if (req.accepts("html")) {
        res.type("html");
        res.render("home", { context: {} });
        next();
        return;
    }
    res.type("json");
    res.json({ error: "Not found" });
    next();
});

// Mongoose connection
try {
    await mongoose.connect("mongodb://localhost:27017/todo");
} catch (error) {
    exit("Could not connect to MongoDB, closing App...\n" + error);
}
// server start
const server = app.listen(PORT, () => {
    console.log("Server listening on port: ", server.address().port);
});
// Server events
server.addListener("close", () => {
    exit("Server closed, closing also the App...");
});
server.addListener("error", (error) => {
    console.error("Error ", error);
});
// Exit function
function exit(error, code) {
    console.error(error);
    code = code ? code : 0;
    try {
        mongoose.disconnect();
    } catch (error) {}
    try {
        server.close();
    } catch (error) {}
    process.exit(code);
}
function logRequest(req, res, next) {
    console.log(`${req.method} ${req.url} from ${req.ip}`);
    next();
}
