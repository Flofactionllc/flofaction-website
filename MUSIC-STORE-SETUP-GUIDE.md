# 🎵 Music Store Setup Guide
## Importing Beats from Wix to Flo Faction Website

### ✅ What's Already Built

Your music store is **ready to go** with the following features:

1. **Complete Beat Store Page** (`/music-store.html`)
   - Professional beat listings with filters
   - Genre, producer, and BPM filtering
   - Beautiful card-based layout
   - Audio player placeholders

2. **Site-Wide Shopping Cart** (✅ CONFIRMED WORKING)
   - Universal cart system (`/public/js/cart.js`)
   - Works across ALL pages
   - localStorage persistence
   - Cart badge in navigation
   - Checkout page integration

3. **PayPal Checkout Integration**
   - Secure payment processing
   - Multiple items support
   - Order confirmation emails
   - Admin notifications

4. **Backend Order Processing**
   - Firebase function `processOrder`
   - Firestore order storage
   - Automated email delivery
   - Customer tracking

### 📝 How to Add Your Beats from Wix

To import your beats, you need to provide:

#### Option 1: Provide Wix Website URL
Give me your Wix beat store URL and I'll scrape the catalog automatically.

#### Option 2: Provide Beat Information Manually
For each beat, provide:

```javascript
{
    id: 'unique-beat-id',              // Example: 'luap-skyline-dreams'
    title: 'Beat Title',                // Example: 'Skyline Dreams'
    producer: 'Luap or Cryptk',         // Producer name
    genre: 'hiphop',                    // Genre: hiphop, trap, drill, rnb, pop, afrobeat
    bpm: 95,                            // Beats per minute
    key: 'A Minor',                     // Musical key
    mood: 'Dark, Atmospheric',          // Description of mood
    audioUrl: '/audio/beats/filename.mp3',  // Path to MP3 file
    artwork: '🌃',                      // Emoji or image URL
    prices: {
        mp3Lease: 29.99,               // MP3 lease price
        wavLease: 49.99,               // WAV lease price
        trackout: 99.99,               // Trackout/stems price
        exclusive: 299.99              // Exclusive rights price
    },
    featured: true                      // Show as featured beat
}
```

### 🎧 Audio File Setup

1. **Upload Beat Files**
   ```bash
   mkdir -p /public/audio/beats/
   # Upload your MP3/WAV files here
   ```

2. **File Naming Convention**
   - Format: `producer-beatname.mp3`
   - Example: `luap-skyline-dreams.mp3`
   - Example: `cryptk-midnight-vibe.mp3`

3. **Update Beat Catalog**
   - Edit `/public/music-store.html`
   - Find the `beats` array (line ~369)
   - Add your beats following the template

### 💰 License Types Explained

| License Type | What's Included | Typical Use |
|-------------|-----------------|-------------|
| **MP3 Lease** | MP3 download, limited distribution rights | Streaming releases, mixtapes |
| **WAV Lease** | WAV download, better quality, more distribution | Commercial releases |
| **Trackout/Stems** | Individual tracks for mixing | Professional productions |
| **Exclusive** | Full ownership, all rights, beat removed from store | Major releases, albums |

### 🔧 Customization Options

#### Change Pricing
Edit the `prices` object for each beat in `/public/music-store.html`

#### Add More Genres
1. Open `/public/music-store.html`
2. Find `<select id="genreFilter">` (line ~321)
3. Add new `<option>` tags

#### Custom Producers
Currently set up for:
- 🎹 LUAP
- 🎛️ CRYPTK

To add more, update the producer filter and beat objects.

### 🛒 Shopping Cart Integration

**Cart is already integrated!** Every product page can use:

```javascript
addToCart(productId, productName, price, redirectToCheckout)
```

Example from beat store:
```javascript
addToCart('luap-skyline-001-mp3lease', 'Skyline Dreams - MP3 Lease (Luap)', 29.99)
```

### 🎨 Visual Customization

#### Artwork Options
Replace emoji artwork with image URLs:
```javascript
artwork: '/images/beats/beat-cover.jpg'
```

Then update CSS to display images instead of emojis.

#### Color Scheme
Current colors match Flo Faction brand:
- Primary: `#64c8ff` (Blue)
- Secondary: `#00ff88` (Green)
- Accent: `#ffd700` (Gold for exclusive)

### 📊 Analytics & Tracking

The order system automatically tracks:
- Customer email
- Beat purchased
- License type
- Order date/time
- Payment amount

All stored in Firestore `/orders` collection.

### 🚀 Quick Start Checklist

- [ ] Provide Wix website URL OR beat catalog data
- [ ] Upload beat MP3 files to `/public/audio/beats/`
- [ ] Update beat catalog in `/public/music-store.html`
- [ ] Test checkout flow with a test purchase
- [ ] Configure SMTP credentials in `.env` for email delivery
- [ ] Deploy to production

### 💡 Additional Features Available

Want to add:
- **Bulk download packages?** Easy to add
- **Beat packs/bundles?** Already supported via cart
- **Subscribe for unlimited downloads?** Can integrate
- **Custom licensing contracts?** Can auto-generate PDFs
- **Audio preview players?** Can integrate Howler.js or Web Audio API

### 🆘 Need Help?

1. Provide your Wix URL - I'll auto-import everything
2. Or send me a spreadsheet with beat details
3. Or list beats in a message and I'll add them

---

**Next Steps**:
1. Share your Wix beat store URL
2. I'll scrape and import all beats
3. Upload audio files
4. Test and deploy!
