const express = require('express');
const router = express.Router();
const { getCachedData } = require('../crawler');

router.get('/tving', (req, res) => {
    try {
        const { data, lastUpdated } = getCachedData();
        if (data.length) {
            res.json({ success: true, data, lastUpdated });
        } else {
            res.json({ success: false, error: '데이터가 아직 준비되지 않았습니다.' });
        }
    } catch (error) {
        console.error('API 요청 처리 오류:', error);
        res.status(500).json({ success: false, error: '서버 오류' });
    }
});

module.exports = router;