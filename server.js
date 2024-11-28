import app from './app.js';
const { NODE_ENV } = process.env;
import colors from 'colors';

// Test
app.get('/', (req, res) => {
  res.send(`GolfPro -> Server Running Successfully on "${NODE_ENV}"!`);
});

if (NODE_ENV === 'production') {
  app.listen(5000, () => {
    console.log(`SERVER RUNNING ON :-> "${NODE_ENV}"!`.cyan.underline);
    console.log(`SERVER LISTENING ON PORT :-> ${5000}!`.cyan.underline);
  });
} else {
  app.listen(5050, () => {
    console.log(`SERVER RUNNING ON :-> "${NODE_ENV}"!`.blue.underline);
    console.log(`SERVER LISTENING ON PORT :-> ${5050}!`.blue.underline);
  });
}
