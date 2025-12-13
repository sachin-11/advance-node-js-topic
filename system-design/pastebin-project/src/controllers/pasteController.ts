import { Request, Response, NextFunction } from 'express';
import { PasteService } from '../services/pasteService';
import { set } from '../config/redis';

const pasteService = new PasteService();

/**
 * @swagger
 * /api/paste:
 *   post:
 *     summary: Create a new paste
 *     tags: [Pastes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePasteRequest'
 *           example:
 *             content: 'print("Hello World")'
 *             title: 'My Python Code'
 *             language: 'python'
 *             privacy: 'public'
 *             expires_in: 3600
 *     responses:
 *       201:
 *         description: Paste created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreatePasteResponse'
 *             example:
 *               paste_id: 'abc123'
 *               url: 'http://localhost:3000/paste/abc123'
 *               expires_at: '2024-12-08T12:00:00.000Z'
 *               created_at: '2024-12-07T12:00:00.000Z'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
export const createPaste = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const {
            content,
            title,
            language,
            privacy,
            password,
            expires_in,
            max_views,
            burn_after_reading,
        } = req.body;

        const result = await pasteService.createPaste({
            content,
            title,
            language,
            privacy,
            password,
            expires_in,
            max_views,
            burn_after_reading,
            user_id: (req as any).user?.id, // If authentication is added
        });

        res.status(201).json(result);
    } catch (error: any) {
        next(error);
    }
};

/**
 * @swagger
 * /api/paste/{id}:
 *   get:
 *     summary: Get paste by ID (JSON format)
 *     tags: [Pastes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Paste ID
 *         example: abc123
 *       - in: query
 *         name: password
 *         schema:
 *           type: string
 *         description: Password if paste is password protected
 *       - in: query
 *         name: raw
 *         schema:
 *           type: boolean
 *         description: Set to true to get raw text content
 *     responses:
 *       200:
 *         description: Paste retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paste'
 *             example:
 *               paste_id: 'abc123'
 *               title: 'My Python Code'
 *               content: 'print("Hello World")'
 *               language: 'python'
 *               privacy: 'public'
 *               view_count: 42
 *               created_at: '2024-12-07T12:00:00.000Z'
 *               expires_at: '2024-12-08T12:00:00.000Z'
 *           text/plain:
 *             schema:
 *               type: string
 *             description: Raw content (when raw=true)
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
export const getPaste = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { password, raw } = req.query;

        const paste = await pasteService.getPaste(id, password as string);

        if (!paste) {
            res.status(404).json({ error: 'Paste not found or expired' });
            return;
        }

        // Increment view count asynchronously
        pasteService.incrementViewCount(id).catch((err) => {
            console.error('Failed to increment view count', err);
        });

        // Return raw content if requested
        if (raw === 'true') {
            res.setHeader('Content-Type', 'text/plain');
            res.send(paste.content);
            return;
        }

        res.json(paste);
    } catch (error: any) {
        if (error.message === 'Password required' || error.message === 'Invalid password') {
            res.status(401).json({ error: error.message });
            return;
        }
        next(error);
    }
};

/**
 * @swagger
 * /api/paste/{id}/stats:
 *   get:
 *     summary: Get paste statistics
 *     tags: [Pastes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Paste ID
 *         example: abc123
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PasteStats'
 *             example:
 *               paste_id: 'abc123'
 *               view_count: 42
 *               created_at: '2024-12-07T12:00:00.000Z'
 *               expires_at: '2024-12-08T12:00:00.000Z'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
export const getPasteStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const stats = await pasteService.getStats(id);

        if (!stats) {
            res.status(404).json({ error: 'Paste not found' });
            return;
        }

        res.json(stats);
    } catch (error: any) {
        next(error);
    }
};

/**
 * @swagger
 * /api/paste/{id}/view:
 *   get:
 *     summary: View paste with syntax highlighting (HTML format)
 *     tags: [Pastes]
 *     description: Returns an HTML page with syntax highlighted code. This endpoint is designed for browser viewing.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Paste ID
 *         example: abc123
 *       - in: query
 *         name: password
 *         schema:
 *           type: string
 *         description: Password if paste is password protected
 *     responses:
 *       200:
 *         description: HTML page with syntax highlighted paste
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *             description: HTML page with syntax highlighted code
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Paste not found or expired
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *             example: '<h1>Paste not found or expired</h1>'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 * 
 * /paste/{id}:
 *   get:
 *     summary: View paste (redirects to /api/paste/{id}/view)
 *     tags: [Pastes]
 *     description: Public route that redirects to the view endpoint
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Paste ID
 *         example: abc123
 *       - in: query
 *         name: password
 *         schema:
 *           type: string
 *         description: Password if paste is password protected
 *     responses:
 *       302:
 *         description: Redirects to /api/paste/{id}/view
 */
export const viewPaste = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { password } = req.query;

        const paste = await pasteService.getPaste(id, password as string);

        if (!paste) {
            res.status(404).send('<h1>Paste not found or expired</h1>');
            return;
        }

        // Increment view count asynchronously
        pasteService.incrementViewCount(id).catch((err) => {
            console.error('Failed to increment view count', err);
        });

        // Apply syntax highlighting
        const highlightedContent = pasteService.highlightContent(
            paste.content,
            paste.language || 'text'
        );

        // Return HTML with syntax highlighting
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${paste.title || 'Paste'} - Pastebin</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css">
    <style>
        body { font-family: monospace; padding: 20px; background: #f5f5f5; }
        .paste-container { background: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .paste-title { font-size: 24px; margin-bottom: 10px; }
        .paste-meta { color: #666; font-size: 12px; margin-bottom: 20px; }
        pre { margin: 0; padding: 15px; background: #f8f8f8; border-radius: 3px; overflow-x: auto; }
        code { font-size: 14px; }
    </style>
</head>
<body>
    <div class="paste-container">
        ${paste.title ? `<h1 class="paste-title">${paste.title}</h1>` : ''}
        <div class="paste-meta">
            Language: ${paste.language || 'text'} | 
            Views: ${paste.view_count} |
            Created: ${new Date(paste.created_at).toLocaleString()}
        </div>
        <pre><code class="language-${paste.language || 'text'}">${highlightedContent}</code></pre>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script>hljs.highlightAll();</script>
</body>
</html>
        `;

        res.send(html);
    } catch (error: any) {
        if (error.message === 'Password required') {
            res.status(401).send(`
                <h1>Password Required</h1>
                <p>This paste is password protected. Please provide the password.</p>
                <form method="GET">
                    <input type="password" name="password" placeholder="Password" required>
                    <button type="submit">View Paste</button>
                </form>
            `);
            return;
        }
        if (error.message === 'Invalid password') {
            res.status(401).send('<h1>Invalid Password</h1>');
            return;
        }
        next(error);
    }
};
