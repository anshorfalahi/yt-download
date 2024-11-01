// script gabungan untuk versi 1 dan versi 2

// Kode dari script_v1.js
document.getElementById('downloadForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = document.getElementById('urlInput').value;
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');

    // Tampilkan loading dan sembunyikan hasil sebelumnya
    loadingDiv.style.display = 'block';
    resultDiv.style.display = 'none';
    resultDiv.innerHTML = '';

    try {
        // Kirim permintaan POST dengan URL sebagai body JSON
        const response = await fetch('/api/download_v1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url }) // mengirim URL dalam body sebagai JSON
        });
        const data = await response.json();

        // Sembunyikan loading setelah data diterima
        loadingDiv.style.display = 'none';

        if (data.error) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `<p style="color: red;">${data.error}</p>`;
            return;
        }

        const { title, duration, thumbnail, downloadLinks } = data;

        // Tampilkan hasil dan semua link download
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <img src="${thumbnail}" alt="${title}">
            <h3>${title}</h3>
            <p>Durasi: ${duration}</p>
            <div>
                <h4>Link Download:</h4>
            </div>
        `;

        // Tampilkan semua link download termasuk MOV dan MP3
        downloadLinks.forEach(link => {
            resultDiv.innerHTML += `
                <a href="${link.url}" target="_blank" class="download-link">
                    ${link.name} (${link.quality})
                </a><br>
            `;
        });

    } catch (error) {
        // Sembunyikan loading dan tampilkan pesan error
        loadingDiv.style.display = 'none';
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<p style="color: red;">Terjadi kesalahan: ${error.message}</p>`;
    }
});

// Kode dari script_v2.js
let selectedType = '';

function showQualityOptions(type) {
    selectedType = type;
    const url = document.getElementById('url')?.value;
    if (!url) {
        alert("Masukkan URL YouTube terlebih dahulu.");
        return;
    }

    const qualitySelect = document.getElementById('quality');
    qualitySelect.innerHTML = ''; // Hapus opsi lama

    const qualities = type === 'audio' 
        ? ['64kbps', '128kbps', '160kbps', '192kbps', '256kbps', '320kbps']
        : ['144p', '240p', '360p', '480p', '720p', '1080p'];

    qualities.forEach((quality) => {
        const option = document.createElement('option');
        option.value = quality;
        option.textContent = quality;
        qualitySelect.appendChild(option);
    });

    document.getElementById('quality-container').style.display = 'block';
}

async function download() {
    const url = document.getElementById('url')?.value;
    const quality = document.getElementById('quality')?.value;
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');

    loading.style.display = 'block';
    result.innerHTML = '';

    try {
        const response = await fetch('api/download_v2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, type: selectedType, quality })
        });
        const data = await response.json();

        loading.style.display = 'none';

        if (data.downloadUrl) {
            result.innerHTML = `
                <div class="media-info">
                    <img src="${data.thumbnail}" alt="${data.title}" class="thumbnail"/>
                    <h3>${data.title}</h3>
                    <p>Durasi: ${data.duration}</p>
                    <p>Ukuran: ${data.size}</p>
                    <a href="${data.downloadUrl}" class="download-link" target="_blank">
                        Klik di sini untuk mendownload
                    </a>
                </div>
            `;
        } else {
            result.innerHTML = `<p>Error: ${data.error || 'Gagal mengunduh media. Cek kembali input atau coba lagi nanti.'}</p>`;
        }
    } catch (error) {
        loading.style.display = 'none';
        result.innerHTML = `<p>Error: Tidak dapat mengunduh. Periksa URL dan coba lagi nanti.</p>`;
    }
}
