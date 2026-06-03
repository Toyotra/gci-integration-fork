class WebcamRecorder {
    constructor() {
        // Grab everything we need from the page
        this.video = document.getElementById('video')
        this.record_button = document.getElementById('record')
        this.upload_form = document.getElementById('webcam-form')
        this.hidden_video_input = document.getElementById('video-data')
        this.help_text = document.getElementById('instructions')
        
        // Set up recording stuff
        this.recorder = null
        this.video_chunks = []
        
        // Wire up the record button
        this.record_button.onclick = () => this.startRecording()
        
        // Turn on the webcam
        this.turnOnCamera()
    }
    
    async turnOnCamera() {
        try {
            // Ask to use their camera
            let stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: false 
            })
            
            // Show their face on screen
            this.video.srcObject = stream
            
            // Set up the video recorder
            this.recorder = new MediaRecorder(stream)
            
            // Save video pieces as they come in
            this.recorder.ondataavailable = e => {
                if (e.data.size > 0) {
                    this.video_chunks.push(e.data)
                }
            }
            
            // When done recording, get ready to upload
            this.recorder.onstop = () => {
                let videoFile = new Blob(this.video_chunks, { type: 'video/mp4' })
                
                // Convert video to text we can send
                let reader = new FileReader()
                reader.readAsDataURL(videoFile)
                reader.onloadend = () => {
                    this.hidden_video_input.value = reader.result
                    this.upload_form.style.display = 'block'
                    this.help_text.style.display = 'none'
                    this.video.classList.remove('recording')
                }
            }
            
        } catch (error) {
            alert("Couldn't access your camera - please allow camera access to use this")
        }
    }
    
    startRecording() {
        if (!this.recorder || this.recorder.state === 'recording') return
        
        // Clear out old recording
        this.video_chunks = []
        
        // Start recording and update the page
        this.recorder.start()
        this.record_button.textContent = 'Recording...'
        this.help_text.style.display = 'block'
        this.video.classList.add('recording')
        
        // Stop after 5 seconds
        setTimeout(() => this.stopRecording(), 5000)
    }
    
    stopRecording() {
        if (this.recorder?.state === 'recording') {
            this.recorder.stop()
            this.record_button.textContent = 'Start Recording'
        }
    }
}

// Start everything when the page loads
new WebcamRecorder()