// server.js
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware untuk melayani file statis di folder public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const apiKey = 'YOUR_API_KEY';

// Endpoint untuk server V1 (/api/download)
app.post('/api/download_v1', async (req, res) => {
    const { url, type = 'video', quality = '720p' } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const response = await axios.get(`https://api.neoxr.eu/api/ssyt`, {
            params: { url, apikey: apiKey }
        });

        const videoData = response.data;

        if (videoData.status) {
            const additionalLinks = videoData.data.converter && videoData.data.converter.mp4 && videoData.data.converter.mp4.stream
                ? videoData.data.converter.mp4.stream.map(link => ({
                    url: link.url,
                    name: link.format.toUpperCase(),
                    quality: '720p (MOV)'
                }))
                : [];

            res.json({
                title: videoData.data.meta.title,
                duration: videoData.data.meta.duration,
                downloadLinks: [
                    ...videoData.data.url,
                    ...additionalLinks,
                    videoData.data.mp3Converter ? { url: videoData.data.mp3Converter, name: 'MP3', quality: 'Audio Only' } : null
                ].filter(Boolean),
                thumbnail: videoData.data.thumb
            });
        } else {
            res.status(500).json({ error: 'Failed to fetch video data' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint untuk server V2 (/download)
app.post('/api/download_v2', async (req, res) => {
    const { url, type, quality } = req.body;

    if (!url || !type || !quality) {
        return res.status(400).json({ error: 'Parameter tidak valid. Harap cek URL, tipe media, dan kualitas.' });
    }

    try {
        const response = await axios.get(`https://api.neoxr.eu/api/youtube`, {
            params: { url, type, quality, apikey: apiKey }
        });

        if (response.data && response.data.data && response.data.data.url) {
            res.json({
                downloadUrl: response.data.data.url,
                title: response.data.title,
                thumbnail: response.data.thumbnail,
                duration: response.data.duration,
                size: response.data.data.size,
                quality: response.data.data.quality
            });
        } else {
            res.status(500).json({ error: 'Gagal mengunduh media. Cek kembali input atau coba lagi nanti.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan saat mengakses API. Coba lagi nanti.' });
    }
});

//jika ada yang mengakses halaman / maka akan diarahkan ke /v1
app.get('/', (req, res) => {
    res.redirect('/v1');
});

// Rute untuk halaman pertama (index_v1.html)
app.get('/v1', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index_v1.html'));
});

// Rute untuk halaman kedua (index_v2.html)
app.get('/v2', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index_v2.html'));
});

// Mulai server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
