import express from 'express';
import Event from '../models/Event.js';

const router = express.Router();

router.get('/events/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).send('Event not found');

        // Construct full image URL
        // Assuming your backend is hosted at a specific domain, we need to prefix the image path
        // For now, we'll try to use the request host. 
        // In production, having a fixed env var for BACKEND_URL is better, but req.get('host') works if not behind robust proxies stripping it.
        const protocol = req.secure ? 'https' : 'http';
        const host = req.get('host');
        const baseUrl = `${protocol}://${host}`;
        
        const imageUrl = event.image ? (event.image.startsWith('http') ? event.image : `${baseUrl}${event.image}`) : `${baseUrl}/uploads/placeholder.jpg`; // Fallback if needed
        const eventUrl = `${(process.env.FRONTEND_URL || 'https://ignite-technical-innovation-club.vercel.app')}/events`; 
        // Ideally redirect to specific event anchor or page. For now, /events page.

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${event.name} | Ignite Club</title>
                
                <!-- Open Graph / Facebook -->
                <meta property="og:type" content="website">
                <meta property="og:url" content="${baseUrl}/share/events/${event._id}">
                <meta property="og:title" content="${event.name} - Ignite Club">
                <meta property="og:description" content="${event.description ? event.description.substring(0, 150) + '...' : 'Join us for this exciting event!'}">
                <meta property="og:image" content="${imageUrl}">
                <meta property="og:image:width" content="800">
                <meta property="og:image:height" content="600">

                <!-- Twitter -->
                <meta property="twitter:card" content="summary_large_image">
                <meta property="twitter:url" content="${baseUrl}/share/events/${event._id}">
                <meta property="twitter:title" content="${event.name} - Ignite Club">
                <meta property="twitter:description" content="${event.description ? event.description.substring(0, 150) + '...' : 'Join us for this exciting event!'}">
                <meta property="twitter:image" content="${imageUrl}">

                <style>
                    body { background: #000; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
                </style>
            </head>
            <body>
                <p>Redirecting to Ignite Club...</p>
                <script>
                    window.location.href = '${eventUrl}';
                </script>
            </body>
            </html>
        `;
        
        res.send(html);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

export default router;
