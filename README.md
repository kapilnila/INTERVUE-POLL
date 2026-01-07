## Live Polling System

This project implements a live polling system where a teacher can ask
questions and students can answer in real time.

The backend controls poll timing and state so that refreshes or late joins
do not reset the poll. Poll data and votes are stored in MongoDB and results
are sent using Socket.io.

### Tech Stack
- React
- Node.js
- Express
- Socket.io
- MongoDB

### Key Points
- Poll start time is stored on the server
- Timer is calculated based on server time
- Votes are validated on the backend to prevent duplicates
- Poll history is loaded from the database
