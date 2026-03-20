const app  = require('./app');
const pool = require('./config/db');

pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ DB Error:', err.message);
  });

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});