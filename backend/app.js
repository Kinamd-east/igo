const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session');
const MongoStore = require('connect-mongo');
const authRoutes = require('./routes/authRoutes')
const cors = require('cors')


const app = express()
app.use(cors({
    origin: 'http://localhost:5173', // frontend origin
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'fundz_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: false, // only true in production with HTTPS
  }
}));

app.use('/auth', authRoutes)


app.listen(5000, () => {
    console.log('LISTENING ON PORT 5000')
})