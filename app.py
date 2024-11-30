from flask import Flask, render_template, jsonify, request, redirect, url_for
from pymongo import MongoClient
import jwt
import datetime
import hashlib
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
from functools import wraps
from bson import ObjectId
import os
import pytz
from os.path import join, dirname
from dotenv import load_dotenv

app = Flask(__name__)

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

MONGODB_URI = os.environ.get('MONGODB_URI')
DB_NAME =  os.environ.get('DB_NAME')
SECRET_KEY = os.environ.get('SECRET_KEY')
TOKEN_KEY =  os.environ.get('TOKEN_KEY')

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]

app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['UPLOAD_FOLDER'] = './static/profile_pics'

# fungsi untuk admin dan superadmin
def admin_required(f):
    @wraps(f)
    def admin_function(*args, **kwargs):
        token_receive = request.cookies.get(TOKEN_KEY)
        if token_receive is not None:
            try:
                payload = jwt.decode(token_receive, SECRET_KEY, algorithms = ['HS256'])
                if payload['role'] != 'member':
                    return f(*args, **kwargs)
                else:
                    return redirect(url_for('home', msg = 'Hanya admin yang dapat mengakses halaman ini'))
            except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
                return redirect(url_for('login', msg ='Token Anda tidak valid atau telah kedaluwarsa'))
        else: 
            return redirect(url_for('login', msg = 'Silakan masuk untuk melihat halaman ini'))
    return admin_function

### home.html atau dashboard.html ###
# menampilkan halaman depan (sebelum pengguna login) atau halaman dashboard (sesudah pengguna login)
@app.route('/')
def home():
    token_receive = request.cookies.get(TOKEN_KEY)
    try:
        title = 'Seimbang.or'
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({'useremail': payload.get('id')})
        useremail = user_info['useremail']

        # menghitung total pemesanan dan total layanan hanya jika statusnya 'diterima'
        payments = list(db.transactions.find({'useremail': useremail, 'status': 'selesai'}))
        total_pemesanan = sum(payment['total_price'] for payment in payments)
        total_layanan = sum(payment['quantity'] for payment in payments)
        total_pemesanan_rupiah = format_rupiah(total_pemesanan)

        users = list(db.users.find({}))

        return render_template('user/dashboard.html', title = title, user_info = user_info, total_layanan = total_layanan, total_pemesanan_rupiah = total_pemesanan_rupiah, users = users)
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        title = 'Beranda'
        services = list(db.services.find())
        faqs = list(db.faqs.find())

        return render_template('user/home.html', title = title, services = services, faqs = faqs)

# untuk menampilkan format rupiah
def format_rupiah(value):
    return f'Rp {value:,.0f}'.replace(',', '.')
    
# menyimpan pesan pada hubungi kami
@app.route('/hubungi-kami', methods = ['POST'])
def contact_us():
    name_receive = request.form['name_give']
    email_receive = request.form['email_give']
    subject_receive = request.form['subject_give']
    message_receive = request.form['message_give']
    
    timezone = pytz.timezone('Asia/Jakarta')
    current_datetime = datetime.now(timezone)
    sent_date = current_datetime.strftime('%d/%m/%y - %H:%M')
    timestamp = current_datetime.timestamp()
    doc = {
        'name': name_receive,
        'email': email_receive,
        'subject': subject_receive,
        'message': message_receive,
        'sent_date' : sent_date,
        'timestamp': timestamp,
    }
    db.contact_us.insert_one(doc)
    return jsonify({'result': 'success'})

### register.html ###
# menampilkan halaman daftar
@app.route('/daftar')
def register():
    title = 'Daftar'
    return render_template('user/auth/register.html', title = title)

# mengecek nama akun dan email yang sudah terdaftar sebelumnya
@app.route('/cek-nama-akun-dan-email', methods=['POST'])
def check_email_and_account_name():
    account_name_receive = request.form['account_name_give']
    useremail_receive = request.form['useremail_give']
    exists_account_name = bool(db.users.find_one({'account_name': account_name_receive}))
    exists_useremail = bool(db.users.find_one({'useremail': useremail_receive}))
    return jsonify({'result': 'success', 'exists_account_name': exists_account_name, 'exists_useremail': exists_useremail})

# menyimpan pendaftaran akun
@app.route('/mendaftarkan-akun', methods = ['POST'])
def api_register():
    first_name_receive = request.form['first_name_give']
    last_name_receive = request.form['last_name_give']
    account_name_receive = request.form['account_name_give']
    useremail_receive = request.form['useremail_give']
    password_receive = request.form['password_give']
    password_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    doc = {
        'first_name': first_name_receive,
        'last_name': last_name_receive,
        'account_name': account_name_receive,
        'useremail': useremail_receive,
        'password': password_hash,
        'role': 'member',
        'profile_name': ' '.join([first_name_receive, last_name_receive]),
        'profile_pic': '',
        'profile_pic_real': 'profile_pics/profile_placeholder.png'
    }
    db.users.insert_one(doc)
    return jsonify({'result': 'success'})

### login.html ###
# menampilkan halaman masuk
@app.route('/masuk')
def login():
    title = 'Masuk'
    token_receive = request.cookies.get(TOKEN_KEY)
    try:
        if token_receive:
            payload = jwt.decode(token_receive, SECRET_KEY, algorithms = ['HS256'])
            user_info = db.users.find_one({'useremail': payload['id']})
            if user_info:
                return redirect(url_for('home'))
        
        return render_template('user/auth/login.html', title = title)
    
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return render_template('user/auth/login.html', title = title)

# menerima masuknya pengguna
@app.route('/memasukkan-akun', methods = ['POST'])
def api_login():
    useremail_receive = request.form['useremail_give']
    password_receive = request.form['password_give']
    pw_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    result = db.users.find_one({'useremail': useremail_receive, 'password': pw_hash})
    if result:
        payload = {
            'id': useremail_receive,
            'exp': datetime.utcnow() + timedelta(seconds = 60 * 60 * 24),
            'role': result['role']
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm = 'HS256')
        return jsonify({'result': 'success', 'token': token})
    else:
        return jsonify({'result': 'fail'})

### profile.html ###
# menampilkan halaman profil
@app.route('/profil')
def profile():
    token_receive = request.cookies.get(TOKEN_KEY)
    try:
        title = 'Profil'
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms = ['HS256'])
        user_info = db.users.find_one({'useremail': payload['id']})
        return render_template('user/profile.html', title = title, user_info = user_info)
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for('home'))

# perbarui profil
@app.route('/perbarui-profil', methods = ['POST'])
def update_profile():
    token_receive = request.cookies.get(TOKEN_KEY)
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms = ['HS256'])
        useremail = payload['id']

        first_name_receive = request.form['first_name_give']
        last_name_receive = request.form['last_name_give']
        phone_receive = request.form['phone_give']
        bio_receive = request.form['bio_give']

        new_doc = {
            'first_name': first_name_receive,
            'last_name': last_name_receive,
            'profile_name': ' '.join([first_name_receive, last_name_receive]),
            'phone': phone_receive,
            'bio': bio_receive
        }
        
        if 'profile_picture_give' in request.files:
            file = request.files['profile_picture_give']
            filename = secure_filename(file.filename)
            extension = filename.split('.')[-1]
            file_path = f'profile_pics/{useremail}.{extension}'
            file.save('./static/' + file_path)
            new_doc['profile_pic'] = filename
            new_doc['profile_pic_real'] = file_path

        db.users.update_one({'useremail': payload['id']}, {'$set': new_doc})
        return jsonify({'result': 'success'})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for('home'))

### service.html ###
# menampilkan halaman layanan
@app.route('/layanan')
def service():
    token_receive = request.cookies.get(TOKEN_KEY)
    try:
        title = 'Layanan'
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms = ['HS256'])
        user_info = db.users.find_one({'useremail': payload['id']})
        services = list(db.services.find())
        return render_template('user/service.html', title = title, user_info = user_info, services = services)
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for('home'))

### payment.html ###
# menampilkan halaman pembayaran
@app.route('/pembayaran', methods = ['GET', 'POST'])
def pay():
    token_receive = request.cookies.get(TOKEN_KEY)
    try:
        title = 'Pemesanan Layanan'
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms = ['HS256'])
        user_info = db.users.find_one({'useremail': payload['id']})
        if request.method == 'GET':
            quantity = request.args.get('quantity', default = 1, type = int)
            service_id = request.args.get('service_id')
            service = db.services.find_one({'_id': ObjectId(service_id)})
            price = int(service['price'])
            return render_template('user/payment.html', title = title, user_info = user_info, quantity = quantity, service_id = service_id, service = service, price = price)
        elif request.method == 'POST':
            today = datetime.now()
            mytime = today.strftime('%Y-%m-%d-%H-%M-%S')
            useremail = db.users.find_one({'useremail': payload['id']})['useremail']
            quantity = int(request.form['quantity'])
            service_id = request.form['service_id']
            date = request.form['date']
            time = request.form['time']
            note_of_buyer = request.form['note_of_buyer']
            name_of_buyer = request.form['name_of_buyer']
            phone_of_buyer = request.form['phone_of_buyer']
            service = db.services.find_one({'_id': ObjectId(service_id)})
            service_image = service['image']
            name_of_the_service = service['name']
            price_per_service = int(service['price'])
            total_price = quantity * price_per_service
            file = request.files['proof_of_payment']
            filename = secure_filename(file.filename)
            extension = filename.split('.')[-1]
            file_path = f'admin/img/proof_of_payment/{name_of_buyer}-{name_of_the_service}-{mytime}.{extension}'
            file.save('./static/' + file_path)
            order_date = today.strftime('%Y-%m-%d')
            order_time = today.strftime('%H:%M')
            current_date = datetime.now().isoformat()
            doc = {
                'useremail': useremail,
                'service_id': service_id,
                'quantity': quantity,
                'date': date,
                'time': time,
                'note_of_buyer': note_of_buyer,
                'name_of_buyer': name_of_buyer,
                'phone_of_buyer': phone_of_buyer,
                'service_image': service_image,
                'name_of_the_service': name_of_the_service,
                'total_price': total_price,
                'proof_of_payment': file_path,
                'order_date': order_date,
                'order_time': order_time,
                'date': current_date,
                'status': 'pending'
            }
            db.transactions.insert_one(doc)
            return jsonify({'result': 'success'})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for('login'))

### order_history.html ###
# menampilkan riwayat pemesanan
@app.route('/riwayat-pemesanan')
def order_history():
    token_receive = request.cookies.get(TOKEN_KEY)
    try:
        title = 'Riwayat Pemesanan'
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms = ['HS256'])
        user_info = db.users.find_one({'useremail': payload['id']})
        transactions = list(db.transactions.find({'useremail': user_info['useremail']}).sort('date', -1)) 
        total_transactions = len(transactions) + 1
        for transaction in transactions:
            original_date = datetime.fromisoformat(transaction['date']).date()
            transaction['date'] = original_date.strftime('%d/%m/%Y')
            
            # menemukan layanan berdasarkan ID
            service = db.services.find_one({'_id': ObjectId(transaction['service_id'])})
            if service:
                transaction['name_of_the_service'] = service.get('name', 'Unknown Service')
            else:
                transaction['name_of_the_service'] = 'Service Not Found'

            # memeriksa apakah ada testimonial untuk transaksi ini
            testimonial = db.testimonials.find_one({'transaction_id': str(transaction['_id'])})
            transaction['service_review'] = testimonial['review'] if testimonial else None

        return render_template('user/order_history.html', title = title, user_info = user_info, transactions = transactions, total_transactions = total_transactions)
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for('login'))

# kirim testimoni
@app.route('/kirim-testimoni', methods = ['POST'])
def send_testimonials():
    token_receive = request.cookies.get(TOKEN_KEY)
    try:
        jwt.decode(token_receive, SECRET_KEY, algorithms = ['HS256'])
        id = request.form['id']
        service_review = request.form['service_review']
        transaction =  db.transactions.find_one({'_id': ObjectId(id)})
        service = db.services.find_one({'_id': ObjectId(transaction['service_id'])})['name']
        current_date = datetime.now().isoformat()
        doc = {
            'transaction_id': str(transaction['_id']),
            'useremail': transaction['useremail'],
            'order_date': transaction['order_date'],
            'time': transaction['time'],
            'name_of_buyer': transaction['name_of_buyer'],
            'phone_of_buyer': transaction['phone_of_buyer'],
            'purchased_service': service,
            'review': service_review,
            'date': current_date
        }
        db.testimonials.insert_one(doc)
        db.transactions.update_one({'_id': ObjectId(id)}, {'$set': {'status': 'selesai'}})
        return jsonify({'result': 'success'})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for('login'))

# Admin
### register-admin.html ###
# menampilkan halaman daftar admin
@app.route('/daftar/admin')
def register_admin():
    title = 'Daftar'
    return render_template('admin/auth/register-admin.html', title = title)

# mengecek nama akun dan email admin yang sudah terdaftar sebelumnya
@app.route('/cek-nama-akun-dan-email-admin', methods=['POST'])
def check_email_and_account_name_admin():
    account_name_receive = request.form['account_name_give']
    useremail_receive = request.form['useremail_give']
    exists_account_name = bool(db.users.find_one({'account_name': account_name_receive}))
    exists_useremail = bool(db.users.find_one({'useremail': useremail_receive}))
    return jsonify({'result': 'success', 'exists_account_name': exists_account_name, 'exists_useremail': exists_useremail})

# menyimpan pendaftaran akun admin
@app.route('/mendaftarkan-akun-admin', methods = ['POST'])
def api_register_admin():
    first_name_receive = request.form['first_name_give']
    last_name_receive = request.form['last_name_give']
    account_name_receive = request.form['account_name_give']
    useremail_receive = request.form['useremail_give']
    password_receive = request.form['password_give']
    password_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    doc = {
        'first_name': first_name_receive,
        'last_name': last_name_receive,
        'account_name': account_name_receive,
        'useremail': useremail_receive,
        'password': password_hash,
        'role': 'admin',
        'profile_name': ' '.join([first_name_receive, last_name_receive]),
        'profile_pic': '',
        'profile_pic_real': 'profile_pics/profile_placeholder.png'
    }
    db.users.insert_one(doc)
    return jsonify({'result': 'success'})

### login-admin.html ###
# menampilkan halaman masuk admin
@app.route('/masuk/admin')
def loginAdmin():
    token_receive = request.cookies.get(TOKEN_KEY)
    try:
        title = 'Masuk'
        if token_receive:
            payload = jwt.decode(token_receive, SECRET_KEY, algorithms = ['HS256'])
            user_info = db.users.find_one({'useremail': payload['id']})
            if user_info:
                return redirect(url_for('home'))
        
        return render_template('admin/auth/login-admin.html', title = title)
    
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        title = 'Masuk'
        return render_template('admin/auth/login-admin.html', title = title)

# menerima masuknya admin
@app.route('/memasukkan-akun-admin', methods = ['POST'])
def api_login_admin():
    useremail_receive = request.form['useremail_give']
    password_receive = request.form['password_give']
    pw_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    result = db.users.find_one({'useremail': useremail_receive, 'password': pw_hash})
    if result:
        payload = {
            'id': useremail_receive,
            'exp': datetime.utcnow() + timedelta(seconds = 60 * 60 * 24),
            'role': result['role']
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm = 'HS256')
        return jsonify({'result': 'success', 'token': token})
    else:
        return jsonify({'result': 'fail'})

### admin/dashboard.html ###
# menampilkan halaman admin untuk beranda
@app.route('/admin-beranda')
@admin_required
def admin_home():
    title = 'Admin'
    token_receive = request.cookies.get(TOKEN_KEY)
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({'email': payload.get('id')})

        users_count = db.users.count_documents({})
        services_count = db.services.count_documents({})
        transactions_count = db.transactions.count_documents({})
        testimonials_count = db.testimonials.count_documents({})
        pipeline = [
            {
                '$match': {
                    'status': 'selesai'
                }
            },
            {
                '$group': {
                    '_id': None,
                    'total_price': {'$sum': '$total_price'}
                }
            }
        ]
        result = db.transactions.aggregate(pipeline)
        income = 0
        for doc in result:
            income = doc['total_price']
            break
        income_rupiah = format_rupiah(income)
        faqs_count = db.faqs.count_documents({})
        contact_count = db.contact_us.count_documents({})
        users = list(db.users.find({}))
        return render_template('admin/dashboard.html', title = title, user_info = user_info, users = users, users_count = users_count, services_count = services_count, transactions_count = transactions_count, testimonials_count = testimonials_count, income_rupiah = income_rupiah, faqs_count = faqs_count, contact_count = contact_count)
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for('home'))

### admin.user.html ###
# menampilkan halaman admin untuk pengguna
@app.route('/admin-pengguna')
@admin_required
def admin_user():
    title = 'Data Pengguna'
    token_receive = request.cookies.get(TOKEN_KEY)
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({'email': payload.get('id')})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for('home'))
    users = list(db.users.find({}))
    return render_template('admin/user.html', title = title, user_info = user_info, users = users)

### admin.admin.html ###
# menampilkan halaman admin untuk admin
@app.route('/admin-admin')
@admin_required
def admin_admin():
    title = 'Data Admin'
    token_receive = request.cookies.get(TOKEN_KEY)
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({'email': payload.get('id')})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for('home'))
    users = list(db.users.find({}))
    return render_template('admin/admin.html', title = title, user_info = user_info, users = users)

### admin.superadmin.html ###
# menampilkan halaman admin untuk superadmin
@app.route('/admin-superadmin')
@admin_required
def admin_superadmin():
    title = 'Data Super Admin'
    token_receive = request.cookies.get(TOKEN_KEY)
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({'email': payload.get('id')})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for('home'))
    users = list(db.users.find({}))
    return render_template('admin/superadmin.html', title = title, user_info = user_info, users = users)
    
### admin/service.html ###
# menampilkan halaman admin untuk layanan
@app.route('/admin-layanan')
@admin_required
def admin_service():
    title = 'Data Layanan'
    services = db.services.find()
    return render_template('admin/service.html', title = title, services = services)

# tambah layanan
@app.route('/tambah-layanan', methods = ['POST'])
@admin_required
def add_service():
    today = datetime.now()
    mytime = today.strftime('%Y-%m-%d-%H-%M-%S')
    name = request.form['name']
    file = request.files['image']
    filename = secure_filename(file.filename)
    extension = filename.split('.')[-1]
    file_path = f'admin/img/service/{name}-{mytime}.{extension}'
    file.save('./static/' + file_path)
    category = request.form['category']
    price = int(request.form['price'])
    stock = int(request.form['stock'])
    description = request.form['description']

    current_date = datetime.now().isoformat()
    doc = {
        'name': name,
        'image': file_path,
        'category': category,
        'price': price,
        'stock': stock,
        'description': description,
        'date': current_date
    }
    db.services.insert_one(doc)
    return redirect(url_for('admin_service'))

# edit layanan
@app.route('/edit-layanan', methods=['POST'])
@admin_required
def edit_service():
    id = request.form['id']

    today = datetime.now()
    mytime = today.strftime('%Y-%m-%d_%H-%M-%S')

    name = request.form['name']
    category = request.form['category']
    price = int(request.form['price'])
    stock = int(request.form['stock'])
    description = request.form['description']

    current_date = datetime.now().isoformat()
    new_doc = {
        'name': name,
        'category': category,
        'price': price,
        'stock': stock,
        'description': description,
        'date': current_date
    }
    
    if 'image' in request.files and request.files['image'].filename != '':
        service = db.services.find_one({'_id': ObjectId(id)})
        old_photo = service.get('image', '')

        # Menghapus gambar lama
        if old_photo:
            old_file_path = os.path.abspath('./static/' + old_photo)
            if os.path.exists(old_file_path):
                os.remove(old_file_path)

        file = request.files['image']
        filename = secure_filename(file.filename)
        extension = filename.split('.')[-1]
        file_path = f'admin/img/service/{name}-{mytime}.{extension}'
        file.save('./static/' + file_path)
        new_doc['image'] = file_path
    else:
        pass

    db.services.update_one({'_id': ObjectId(id)}, {'$set': new_doc})
    return redirect(url_for('admin_service'))

# hapus layanan
@app.route('/hapus-layanan', methods=['POST'])
@admin_required
def delete_service():
    id = request.form['id']
    service = db.services.find_one({'_id': ObjectId(id)})

    if service:
        # mengambil nama file foto dari field 'image'
        photo = service.get('image', '')
        
        if photo:
            # menyusun path file foto
            file_path = os.path.abspath('./static/' + photo)
            
            # mengecek jika file ada
            if os.path.exists(file_path):
                try:
                    # menghapus file foto
                    os.remove(file_path)
                    print(f"File {file_path} berhasil dihapus.")
                except Exception as e:
                    print(f"Terjadi kesalahan saat menghapus file: {e}")
            else:
                print(f"File {file_path} tidak ditemukan.")
        
        # menghapus data layanan dari database
        db.services.delete_one({'_id': ObjectId(id)})
    
    else:
        print(f"Layanan dengan ID {id} tidak ditemukan.")
    
    # redirect ke halaman admin layanan
    return redirect(url_for('admin_service'))

### admin/transaction.html ###
# menampilkan halaman admin untuk transaksi
@app.route('/admin-transaksi')
@admin_required
def admin_transaction():
    title = 'Data Transaksi'
    transactions = list(db.transactions.find())
    
    for transaction in transactions:
        # menemukan layanan tersebut, dan tangani kasus jika layanan tersebut tidak ditemukan
        service = db.services.find_one({'_id': ObjectId(transaction['service_id'])})
        
        # jika layanan tersebut ada, dapatkan namanya, jika tidak, tetapkan nilai default
        if service:
            transaction['name'] = service.get('name', 'Unknown Service')  # default ke 'Unknown Service' jika nama tidak ada
        else:
            transaction['name'] = 'Service Not Found'  # menangani dokumen layanan yang hilang
            
    return render_template('admin/transaction.html', title = title, transactions = transactions)

    
# terima pemesanan
@app.route('/terima-pemesanan', methods=['POST'])
@admin_required
def receive_orders():
    id = request.form['id']
    note = request.form['note']
    transaction =  db.transactions.find_one({'_id': ObjectId(id)})
    quantity = transaction['quantity']

    db.transactions.update_one({'_id': ObjectId(id)}, {'$set': {'status': 'diterima', 'note': note}})
    db.services.update_one({'_id': ObjectId(transaction['service_id'])}, {'$inc': {'stock': -quantity}})

    return redirect(url_for('admin_transaction'))

# tolak pemesanan
@app.route('/tolak-pemesanan', methods=['POST'])
@admin_required
def reject_order():
    id = request.form['id']
    note = request.form['note']
    db.transactions.update_one({'_id': ObjectId(id)}, {'$set': {'status': 'ditolak', 'note': note}})
    return redirect(url_for('admin_transaction'))

# kirim pemesanan
@app.route('/kirim-pemesanan', methods=['POST'])
@admin_required
def send_order():
    id = request.form['id']
    note = request.form['note']
    db.transactions.update_one({'_id': ObjectId(id)}, {'$set': {'status': 'dikirim', 'note': note}})
    return redirect(url_for('admin_transaction'))

### admin/testimonial.html ###
# menampilkan halaman admin untuk testimoni
@app.route('/admin-testimoni')
@admin_required
def admin_testimonials():
    title = 'Data Testimoni'
    testimonials = db.testimonials.find()
    return render_template('admin/testimonial.html', title = title, testimonials = testimonials)

### admin/faq.html ###
# menampilkan halaman admin untuk pertanyaan dan jawaban
@app.route('/admin-pertanyaan-dan-jawaban')
@admin_required
def admin_faq():
    title = 'Data FAQ'
    faqs = db.faqs.find()
    return render_template('admin/faq.html', title = title, faqs = faqs)

# tambah pertanyaan dan jawaban
@app.route('/tambah-pertanyaan-dan-jawaban', methods = ['POST'])
@admin_required
def add_faq():
    question = request.form['question']
    answer = request.form['answer']
    current_date = datetime.now().isoformat()
    doc = {
        'question': question,
        'answer': answer,
        'date': current_date
    }
    db.faqs.insert_one(doc)
    return redirect(url_for('admin_faq'))

# edit pertanyaan dan jawaban
@app.route('/edit-pertanyaan-dan-jawaban', methods = ['POST'])
@admin_required
def edit_faq():
    id = request.form['id']
    question = request.form['question']
    answer = request.form['answer']
    new_doc = {
        'question': question,
        'answer': answer
    }
    db.faqs.update_one({'_id': ObjectId(id)}, {'$set': new_doc})
    return redirect(url_for('admin_faq'))

# hapus pertanyaan dan jawaban
@app.route('/hapus-pertanyaan-dan-jawaban', methods = ['POST'])
@admin_required
def delete_faq():
    id = request.form['id']
    db.faqs.delete_one({'_id': ObjectId(id)})
    return redirect(url_for('admin_faq'))

### admin/contact_us.html ###
# menampilkan halaman admin untuk hubungi kami
@app.route('/admin-hubungi-kami')
@admin_required
def admin_contact_us():
    title = 'Data Hubungi Kami'
    contacts = db.contact_us.find()
    return render_template('admin/contact_us.html', title = title, contacts = contacts)

# menghapus hubungi kami
@app.route('/hapus-hubungi-kami', methods = ['POST'])
@admin_required
def delete_contact_us():
    id = request.form['id']
    db.contact_us.delete_one({'_id': ObjectId(id)})
    return redirect(url_for('admin_contact_us'))

# SuperAdmin
### register-superadmin.html ###
# menampilkan halaman daftar superadmin
@app.route('/daftar/superadmin')
def register_superadmin():
    title = 'Daftar'
    return render_template('admin/auth/register-superadmin.html', title = title)

# mengecek nama akun dan email superadmin yang sudah terdaftar sebelumnya
@app.route('/cek-nama-akun-dan-email-superadmin', methods=['POST'])
def check_email_and_account_name_superadmin():
    account_name_receive = request.form['account_name_give']
    useremail_receive = request.form['useremail_give']
    exists_account_name = bool(db.users.find_one({'account_name': account_name_receive}))
    exists_useremail = bool(db.users.find_one({'useremail': useremail_receive}))
    return jsonify({'result': 'success', 'exists_account_name': exists_account_name, 'exists_useremail': exists_useremail})

# menyimpan pendaftaran akun superadmin
@app.route('/mendaftarkan-akun-superadmin', methods = ['POST'])
def api_register_superadmin():
    first_name_receive = request.form['first_name_give']
    last_name_receive = request.form['last_name_give']
    account_name_receive = request.form['account_name_give']
    useremail_receive = request.form['useremail_give']
    password_receive = request.form['password_give']
    password_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    doc = {
        'first_name': first_name_receive,
        'last_name': last_name_receive,
        'account_name': account_name_receive,
        'useremail': useremail_receive,
        'password': password_hash,
        'role': 'superadmin',
        'profile_name': ' '.join([first_name_receive, last_name_receive]),
        'profile_pic': '',
        'profile_pic_real': 'profile_pics/profile_placeholder.png'
    }
    db.users.insert_one(doc)
    return jsonify({'result': 'success'})

### login-superadmin.html ###
# menampilkan halaman masuk superadmin
@app.route('/masuk/superadmin')
def loginSuperAdmin():
    token_receive = request.cookies.get(TOKEN_KEY)
    try:
        title = 'Masuk'
        if token_receive:
            payload = jwt.decode(token_receive, SECRET_KEY, algorithms = ['HS256'])
            user_info = db.users.find_one({'useremail': payload['id']})
            if user_info:
                return redirect(url_for('home'))
        
        return render_template('admin/auth/login-superadmin.html', title = title)
    
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        title = 'Masuk'
        return render_template('admin/auth/login-superadmin.html', title = title)

# menerima masuknya pengguna
@app.route('/memasukkan-akun-superadmin', methods = ['POST'])
def api_login_superadmin():
    useremail_receive = request.form['useremail_give']
    password_receive = request.form['password_give']
    pw_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    result = db.users.find_one({'useremail': useremail_receive, 'password': pw_hash})
    if result:
        payload = {
            'id': useremail_receive,
            'exp': datetime.utcnow() + timedelta(seconds = 60 * 60 * 24),
            'role': result['role']
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm = 'HS256')
        return jsonify({'result': 'success', 'token': token})
    else:
        return jsonify({'result': 'fail'})

if __name__ == '__main__':
    app.run('0.0.0.0', port = 5000, debug = True)