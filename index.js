import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import pino from 'pino'

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const { version, isLatest } = await fetchLatestBaileysVersion() // ambil versi WA terbaru
	
    console.log('Using WA version:', version, 'isLatest:', isLatest)

    const sock = makeWASocket({
        version,
		logger: pino({level: 'silent'}),
        auth: state,
        printQRInTerminal: false
    })

    sock.ev.on('connection.update', async(update) => {
        
		const { connection, qr } = update
		const noWhatsApp = '6282351442030@s.whatsapp.net'
		const message = 'Haloooo ini pesan percobaan'

        if (qr) {
            console.log('Scan QR ini:')
            qrcode.generate(qr, { small: true })
        }

        if (connection === 'open') {
            console.log('WhatsApp Connected!')
			
			try {
				await sock.sendMessage(noWhatsApp, {
					text: message
				})
				
				console.log('Pesan berhasil terkirim')
			} catch(err) {
				console.log('Pesan gagal terkirim')
				console.error(err)
			}			
			
        }

        if (connection === 'close') {
            console.log('Koneksi Terputus, Menghubungkan ulang...')
            connectToWhatsApp()
        }
    })

    sock.ev.on('creds.update', saveCreds)
}

connectToWhatsApp()