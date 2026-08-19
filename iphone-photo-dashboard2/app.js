const NTFY_TOPIC = "iphone-photo-dashboard-unity4ever";
let map = null, marker = null;

document.addEventListener('DOMContentLoaded', () => {
  loadLatestData();
  document.getElementById('btnRefresh').addEventListener('click', loadLatestData);

  document.getElementById('btnDevice').addEventListener('click', () => {
    window.location.href = 'shortcuts://run-shortcut?name=PhotoDashboard';
  });

  document.getElementById('btnPC').addEventListener('click', async () => {
    const note = document.getElementById('triggerNote');
    note.classList.remove('hidden');

    try {
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: 'POST',
        body: '📱 PC vraagt om een foto! Tik om uit te voeren.',
        headers: {
          'Title': 'Foto Aanvraag',
          'Click': 'shortcuts://run-shortcut?name=PhotoDashboard'
        }
      });
    } catch (e) { console.error(e); }

    setTimeout(() => note.classList.add('hidden'), 8000);
  });

  setInterval(loadLatestData, 8000);
});

async function loadLatestData() {
  try {
    const res = await fetch(`./data/metadata.json?t=${Date.now()}`);
    const data = await res.json();

    const photoView = document.getElementById('photoView');
    const placeholder = document.getElementById('placeholder');
    const badge = document.getElementById('statusBadge');

    badge.textContent = '● Live (GitHub)';
    badge.style.color = '#4ade80';

    if (data.hasImage) {
      photoView.src = `./data/latest.jpg?t=${Date.now()}`;
      photoView.classList.remove('hidden');
      placeholder.classList.add('hidden');

      document.getElementById('metaTime').textContent = data.timestamp ? new Date(data.timestamp).toLocaleString('nl-NL') : '-';
      document.getElementById('metaBattery').textContent = data.battery || '-';
      document.getElementById('metaDevice').textContent = data.device || '-';
      document.getElementById('metaLocation').textContent = data.location_name || '-';

      if (data.latitude && data.longitude) {
        showMap(parseFloat(data.latitude), parseFloat(data.longitude));
      }
    }
  } catch (err) {
    console.error('Fout bij laden:', err);
  }
}

function showMap(lat, lng) {
  const mapEl = document.getElementById('map');
  mapEl.classList.remove('hidden');

  if (!map) {
    map = L.map('map').setView([lat, lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
    marker = L.marker([lat, lng]).addTo(map);
  } else {
    map.setView([lat, lng], 14);
    marker.setLatLng([lat, lng]);
  }
}