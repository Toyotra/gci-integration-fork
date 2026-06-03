import base64
import os
from flask import Blueprint, flash, redirect, render_template, request, send_from_directory, current_app
from werkzeug.utils import secure_filename
from .db import get_db

bp = Blueprint('routes', __name__)

@bp.route('/', methods=('GET', 'POST'))
def home():
    if request.method == 'GET':
        media = get_db().execute('SELECT * FROM media').fetchall()
        return render_template('home.html', media=media)
    
    name = request.form.get('name')
    video_data = request.form['video_data']

    try:
        if 'base64,' in video_data:
            video_data = video_data.split('base64,')[1]
        video_binary = base64.b64decode(video_data)

        x = 0
        while True:
            filename = secure_filename(f"face_{name}_{x}.mp4")
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            if not os.path.exists(file_path): break
            x += 1
            
        with open(file_path, 'wb') as f:
            f.write(video_binary)

        db = get_db()
        db.execute('INSERT INTO media (name, filename) VALUES (?, ?)',
                   (name, filename))
        db.commit()
        
        flash('Video uploaded successfully!')
        return redirect('/')

    except db.IntegrityError:
        flash(f'Video {filename} already exists.')
    except Exception as e:
        flash(f'Error processing video: {str(e)}')
    
    return redirect('/')

@bp.route('/media/<filename>')
def media(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)