import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { startReminderJob } from "./jobs/reminderJob.js";


const PORT = process.env.PORT;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            startReminderJob();
        });
    } catch (error) {
        console.error("Error starting server:", error.message);
    }
};

startServer();