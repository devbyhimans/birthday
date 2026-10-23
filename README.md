# 💖 Potato's 19th Birthday Sanctuary 🎂✨

A warm, interactive, aesthetic birthday gift website created with love for Potato's 19th Birthday.

---

## 📁 Clean Project Structure

```
bday/
├── .env                              # MongoDB Atlas credentials & port config
├── .gitignore                        # Git ignore rules (node_modules, .env)
├── package.json                      # Node.js dependencies & scripts
├── package-lock.json                 # Lockfile for reproducible installs
├── server.js                         # Express backend & MongoDB Atlas connection
├── index.html                        # Main 9-Step Single Page Application
├── style.css                         # Custom aesthetic CSS design system
├── script.js                         # Interactive journey logic & animations
├── config.js                         # Central configuration for texts & assets
├── README.md                         # Project documentation
├── api/
│   └── delivery.js                   # Vercel serverless function for MongoDB
└── assets/                           # Canonical static assets folder
    ├── chamomile_card.png            # Opening Gate card background
    ├── mesSAGE.jpeg                  # Step 6 personal letter message image
    ├── audio/                        # All high-fidelity audio tracks & voice notes
    │   ├── Meena Bazaar - Keshav Tyohar Official Music Video.mp3 # Background music
    │   ├── my favorite thing.mp3     # Step 5 favourite-thing voice note
    │   ├── eyes.mp3                  # Step 3 trait: Your eyes
    │   ├── you.mp3                   # Step 3 trait: You
    │   ├── saree.mp3                 # Step 3 trait: You in a saree
    │   └── voice.mp3                 # Step 3 trait: Your voice
    ├── card_images/                  # Step 2 Polaroid memories (6 photos)
    │   ├── IMG_20261023_162413.jpg.jpeg
    │   ├── IMG_20261023_162427.jpg.jpeg
    │   ├── IMG_20261023_162445.jpg.jpeg
    │   ├── IMG_20261023_162459.jpg.jpeg
    │   ├── IMG_20261023_162516.jpg.jpeg
    │   └── IMG_20261023_162546.jpg.jpeg
    └── gifts/                        # Step 8 mystery boxes & reveal assets
        ├── brac-1.webp .. brac-4.webp# Box 1: Fairy Bloom Bracelet Set
        ├── all-2.webp                # Box 2: Special Birthday Surprise
        ├── all-3.webp                # Box 3: Cherished Keepsake
        └── stuff.webp                # Box 4: Lovely Potato Goodies
```

---

## 🚀 Running the App

### Option 1: Full-Stack (With MongoDB Backend)
```bash
npm install
npm start
```
- Open [http://localhost:3000](http://localhost:3000)
- Serves frontend and activates `POST /api/delivery` to save orders to MongoDB Atlas (`potato.deliveries`).
- View orders at `http://localhost:3000/api/deliveries`.

### Option 2: Static Server (Five Server / Live Server)
- Open in VS Code with Five Server at [http://127.0.0.1:5500](http://127.0.0.1:5500).
- Frontend automatically communicates with the backend via CORS to save delivery details.

### Option 3: Deploy to Vercel / Netlify
- Push to GitHub and deploy on Vercel with zero configuration.
- The `api/delivery.js` serverless function handles MongoDB order saving seamlessly in production.

---

## 🌟 Key Features

1. **Opening Gate**: Chamomile flower greeting card showcase with blinking Kawaii Potato mascot and sound hint.
2. **Dynamic BGM**: *Meena Bazaar* playing smoothly between 0:50 and 2:59 with an animated vinyl controller.
3. **Smart Audio Ducking**: Background music automatically pauses when any voice note is played (Step 3 or Step 5) and resumes when finished.
4. **Interactive Journey**:
   - **Step 1**: "Do you want to know why you are special?" playful Q&A.
   - **Step 2**: 6 Polaroid cards with tap-to-advance animations.
   - **Step 3**: 4 Traits with dedicated custom voice notes (`eyes.mp3`, `you.mp3`, `saree.mp3`, `voice.mp3`).
   - **Step 4**: "Wanna know my favourite thing about you?" with 3-strike delete bar.
   - **Step 5**: Spinning vinyl disc player for `my favorite thing.mp3`.
   - **Step 6**: Scrollable personal handwritten letter card (`mesSAGE.jpeg`).
   - **Step 7**: Playful "No" button that dodges 10 times inside the card before disappearing into confetti.
   - **Step 8**: Multi-gift picker (choose any 2 gifts or tap "✨ See All Gifts & Choose All 🎁").
   - **Step 9**: Delivery form with upfront privacy assurance and automatic saving to MongoDB Atlas database `potato`.
