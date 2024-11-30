# Navirin's Hand Bouquet

Aplikasi Navirin's berbasis Python Flask dengan MongoDB

## Deskripsi

Navirin's merupakan aplikasi dasar berbasis Flask yang menggambarkan promosi, interaksi, dan penjualan dari Navirin's kepada pelanggan. Aplikasi ini menyediakan beberapa fitur dasar yang dapat digunakan, seperti pemesanan buket, obrolan antar penjual dan pelanggan, histori pembayaran pelanggan, dan status pengiriman buket.

![alt text](https://img.shields.io/badge/Flask-3.0.3--api-ready-blue.svg "navirin's")
![alt text](https://img.shields.io/badge/MongoDB-6.5.0-brightgreen.svg "navirin's")
![alt text](https://img.shields.io/badge/JWT-Ready-blue.svg "navirin's")

---
## Prasyarat

- Python 3.12.x
- Pip 24.0
- MongoDB 6.5.0
- Virtualenv (opsional)

## Instalasi

Clone repositori di sistem lokal Anda:

````shell
$ git clone https://github.com/kristian49/AMD-no-yujin.git
````

Buat virtual env di dalam folder:

````shell
$ python3 -m venv nama_env
````

Instal dependensi:

````shell
$ pip install -r requirements.txt
````
Buat file .env dengan beberapa variabel ini:

````
MONGODB_URI = 'tautan_koneksi_mongodb'
DB_NAME = 'nama_database'
````

Jalankan aplikasi:

````shell
$ python3 run.py
````

Pastikan aplikasi berjalan di browser Anda dengan menavigasi ke:

````
http://127.0.0.1:5000
````

## **Struktur File**
Struktur file aplikasi ini adalah sebagai berikut:

````
├── static
    ├── css
    ├── img
    ├── js
    └── profile_pics
├── templates
    ├── chat.html
    ├── dashboard.html
    ├── home.html
    ├── login.html
    ├── profile.html
    └── register.html
└── app.py
````

- `static/css` berisi pengaturan styling css.
- `static/img` berisi gambar-gambar pendukung aplikasi.
- `static/js` berisi pengaturan client-side external javascript.
- `templates/chat.html` berisi obrolan penjual dan pelanggan.
- `templates/dashboard.html` berisi tampilan awal setelah pengguna masuk.
- `templates/home.html` berisi obrolan penjual dan pelanggan.
- `templates/login.html` berisi halaman masuk pengguna.
- `templates/profile.html` berisi halaman profil pengguna.
- `templates/register.html` berisi halaman daftar pengguna.
- `app.py` memanggil aplikasi Flask utama.