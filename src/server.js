const express = require('express');
const app = express();
const apiRouter = require('./routes/api');
const path = require('path');
const { monitorData } = require('./crawler');

monitorData();

app.use('/api', apiRouter);
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});