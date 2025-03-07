import { app } from "./app.js";
import { connectDB } from './config/db.js';

const port = process.env.PORT || 5001;

app.listen(port, () => {
    connectDB();
    console.log(`Server is running on: http://localhost:${port}`);
});