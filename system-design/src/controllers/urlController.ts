import { Request, Response } from 'express';
import { UrlService } from '../services/urlService';

const urlService = new UrlService();

/**
 * @swagger
 * /api/shorten:
 *   post:
 *     summary: Create a new short URL
 *     tags: [URLs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShortenRequest'
 *           examples:
 *             basic:
 *               value:
 *                 longUrl: "https://example.com/very/long/url"
 *             withCustomAlias:
 *               value:
 *                 longUrl: "https://example.com/very/long/url"
 *                 customAlias: "my-link"
 *             withExpiration:
 *               value:
 *                 longUrl: "https://example.com/very/long/url"
 *                 expireAt: "2024-12-31T23:59:59Z"
 *     responses:
 *       201:
 *         description: Short URL created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShortenResponse'
 *             example:
 *               shortUrl: "https://my.tiny/abc123"
 *       400:
 *         description: Invalid request (invalid URL, alias already exists, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Invalid URL format. Must include http:// or https://"
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
export async function shortenUrl(req: Request, res: Response): Promise<void> {
  try {
    const { longUrl, customAlias, expireAt } = req.body;

    if (!longUrl) {
      res.status(400).json({ error: 'longUrl is required' });
      return;
    }

    const result = await urlService.shortenUrl({
      longUrl,
      customAlias,
      expireAt,
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Shorten URL error', error);
    res.status(400).json({ error: error.message || 'Failed to shorten URL' });
  }
}

/**
 * @swagger
 * /{code}:
 *   get:
 *     summary: Redirect to the original long URL
 *     description: |
 *       **Note:** This endpoint performs a 302 redirect. 
 *       It cannot be tested directly in Swagger UI due to CORS restrictions.
 *       Please test this endpoint by:
 *       1. Opening the URL directly in your browser: `http://localhost:3000/{code}`
 *       2. Using curl: `curl -L http://localhost:3000/{code}`
 *       3. The redirect will work automatically when accessed via browser or HTTP client
 *     tags: [URLs]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: The short code to redirect
 *         example: abc
 *     responses:
 *       302:
 *         description: Redirect to the original URL (302 Found)
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               format: uri
 *             description: The original long URL to redirect to
 *             example: https://example.com/very/long/url
 *       404:
 *         description: Short URL not found or expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Short URL not found or expired"
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
export async function redirectUrl(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.params;

    if (!code) {
      res.status(400).json({ error: 'Code is required' });
      return;
    }

    const longUrl = await urlService.getLongUrl(code);

    if (!longUrl) {
      res.status(404).json({ error: 'Short URL not found or expired' });
      return;
    }

    // Increment click count asynchronously (non-blocking)
    urlService.incrementClickCount(code).catch((err) => {
      console.error('Failed to increment click count', err);
    });

    // Redirect with 302 status
    res.redirect(302, longUrl);
  } catch (error: any) {
    console.error('Redirect error', error);
    res.status(500).json({ error: 'Failed to redirect' });
  }
}

/**
 * @swagger
 * /api/stats/{code}:
 *   get:
 *     summary: Get statistics for a short URL
 *     tags: [URLs]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: The short code to get statistics for
 *         example: abc123
 *     responses:
 *       200:
 *         description: URL statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatsResponse'
 *             example:
 *               longUrl: "https://example.com/very/long/url"
 *               createdAt: "2024-01-01T00:00:00.000Z"
 *               clickCount: 42
 *               expireAt: "2024-12-31T23:59:59.000Z"
 *       404:
 *         description: Short URL not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Short URL not found"
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.params;

    if (!code) {
      res.status(400).json({ error: 'Code is required' });
      return;
    }

    const stats = await urlService.getStats(code);

    if (!stats) {
      res.status(404).json({ error: 'Short URL not found' });
      return;
    }

    res.json(stats);
  } catch (error: any) {
    console.error('Get stats error', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
}

