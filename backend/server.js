import { app } from "./app.js";
import { connectDB } from './config/db.js';

const port = process.env.PORT || 5000;

app.listen(port, () => {
    connectDB();
    console.log(`Server is running on: http://localhost:${port}`);
});