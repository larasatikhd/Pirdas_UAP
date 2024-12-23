const mqttClient = mqtt.connect('wss://634c73f2b94f4b5882d44ee12b4720ed.s1.eu.hivemq.cloud:8884/mqtt', {
    username: 'LarasatiKhadijah',
    password: 'Larasati12',
  });
  
  let temperature = 0;
  let humidity = 0;
  let ldrValue = 0;
  
  mqttClient.on('connect', () => {
    console.log('Connected to MQTT Broker');
    mqttClient.subscribe('esp32/temperature');
    mqttClient.subscribe('esp32/humidity');
    mqttClient.subscribe('esp32/ldr/value');
  });
  
  mqttClient.on('message', (topic, message) => {
    const msg = message.toString();
    const currentTime = new Date().toLocaleTimeString(); // Mendapatkan waktu saat ini
  
    if (topic === 'esp32/temperature') {
      temperature = parseFloat(msg);
      document.getElementById('temperature').querySelector('p').textContent = `${temperature} °C`;
      updateTempHumidityChart(currentTime); // Menambahkan waktu ke chart
    }
  
    if (topic === 'esp32/humidity') {
      humidity = parseFloat(msg);
      document.getElementById('humidity').querySelector('p').textContent = `${humidity} %`;
      updateTempHumidityChart(currentTime); // Menambahkan waktu ke chart
    }
  
    if (topic === 'esp32/ldr/value') {
      ldrValue = parseInt(msg, 10);
      document.getElementById('ldr').querySelector('p').textContent = `${ldrValue}`;
      updateLdrChart(currentTime); // Menambahkan waktu ke chart
    }
  });
  
  // Temperature and Humidity Chart
  const tempHumidityChart = new Chart(document.getElementById('tempHumidityChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: ['0'], // Inisial label kosong
      datasets: [
        {
          label: 'Temperature (°C)',
          data: [temperature],
          borderColor: 'rgba(255, 99, 132, 1)',
          fill: false,
          tension: 0.4, // Untuk membuat garis lebih halus (gelombang)
        },
        {
          label: 'Humidity (%)',
          data: [humidity],
          borderColor: 'rgba(54, 162, 235, 1)',
          fill: false,
          tension: 0.4, // Untuk membuat garis lebih halus (gelombang)
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
        },
      },
      animations: {
        tension: {
          duration: 1000, // Durasi transisi garis
          easing: 'easeInOutQuad', // Easing untuk transisi halus
        },
      },
    }
  });
  
  // LDR Chart
  const ldrChart = new Chart(document.getElementById('ldrChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: ['0'], // Inisial label kosong
      datasets: [
        {
          label: 'LDR Value',
          data: [ldrValue],
          borderColor: 'rgba(75, 192, 192, 1)',
          fill: false,
          tension: 0.4, // Untuk membuat garis lebih halus (gelombang)
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 4095,
        },
      },
      animations: {
        tension: {
          duration: 1000, // Durasi transisi garis
          easing: 'easeInOutQuad', // Easing untuk transisi halus
        },
      },
    }
  });

  const sendLedControl = (state) => {
    mqttClient.publish('esp32/led/control', state.toString()); // Kirim "1" atau "0"
    console.log(`Sent LED Control: ${state}`);
    
  };
  document.getElementById('btnOn').addEventListener('click', () => sendLedControl(1));
  document.getElementById('btnOff').addEventListener('click', () => sendLedControl(0));
  
  // Fungsi untuk memperbarui chart suhu dan kelembaban
  function updateTempHumidityChart(currentTime) {
    tempHumidityChart.data.labels.push(currentTime); // Menambahkan waktu ke sumbu X
    if (tempHumidityChart.data.labels.length > 20) {
      tempHumidityChart.data.labels.shift(); // Menghapus label pertama untuk memanage panjang label
      tempHumidityChart.data.datasets[0].data.shift(); // Menghapus data pertama untuk grafik
      tempHumidityChart.data.datasets[1].data.shift(); // Menghapus data pertama untuk grafik
    }
    tempHumidityChart.data.datasets[0].data.push(temperature);
    tempHumidityChart.data.datasets[1].data.push(humidity);
    tempHumidityChart.update();
  }
  
  // Fungsi untuk memperbarui chart LDR
  function updateLdrChart(currentTime) {
    ldrChart.data.labels.push(currentTime); // Menambahkan waktu ke sumbu X
    if (ldrChart.data.labels.length > 20) {
      ldrChart.data.labels.shift(); // Menghapus label pertama untuk memanage panjang label
      ldrChart.data.datasets[0].data.shift(); // Menghapus data pertama untuk grafik
    }
    ldrChart.data.datasets[0].data.push(ldrValue);
    ldrChart.update();
  }
  
  // Dark/Light mode toggle
  const themeSwitch = document.getElementById('themeSwitch');
  themeSwitch.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', themeSwitch.checked);
    if (themeSwitch.checked) {
        themeLabel.textContent = 'Dark Mode'; // Jika switch aktif
    } else {
        themeLabel.textContent = 'Light Mode'; // Jika switch tidak aktif
    }
  });