const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const { createClient } = require('redis');
const {
  MONGO_IP,
  MONGO_PASSWORD,
  MONGO_PORT,
  MONGO_USER,
  REDIS_URL,
  REDIS_PORT,
  SESSION_SECRET,
} = require('./config/config');
const postRouter = require('./routes/postRoutes');
const userRouter = require('./routes/userRoutes');
const protect = require('./middleware/authMiddleware');

const app = express();

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
  mongoose
    .connect(mongoURL)
    .then(() => console.log('successfully connected to DB'))
    .catch((e) => {
      console.log({ MONGO_USER, MONGO_PASSWORD });
      console.log(mongoURL);
      console.log(e);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

let RedisStore = require('connect-redis')(session);
let redisClient = createClient({
  legacyMode: true,
  socket: {
    port: REDIS_PORT,
    host: REDIS_URL,
  },
});
redisClient.connect().catch(console.error);

app.enable('trust proxy');
app.use(cors({}));
app.use(express.json());
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 30000,
    },
  })
);

app.get('/api/v1', (req, res) => {
  res.send(
    '<h2>THIS IS A GREAT VIDEO EXPLAINING DOCKER, HOPE EVERYONE COULD STUDY THIS!!!</h2>'
  );
  console.log('ecstaticcccccccc');
});
app.use('/api/v1/posts', protect, postRouter);
app.use('/api/v1/users', userRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`));
