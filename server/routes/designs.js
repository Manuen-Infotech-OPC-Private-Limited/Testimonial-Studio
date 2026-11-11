import express from 'express';
import { Design } from '../models/Design.js';
import { requireDbConnection, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireDbConnection);
router.use(requireAuth);

const VALID_TEMPLATES = new Set(['template-1', 'template-2', 'template-3']);
const VALID_STATUSES = new Set(['draft', 'completed']);
const DESIGN_ID_RE = /^[A-Za-z0-9_-]{1,100}$/;
const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const FONT_NAME_RE = /^[A-Za-z0-9\s\-]{1,64}$/;
const SAFE_IMAGE_URL_RE =
  /^(?:\/templates\/template-[123]\.png|data:image\/(?:png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+)$/i;

function sanitizeHexColor(value, fallback) {
  return typeof value === 'string' && HEX_COLOR_RE.test(value.trim()) ? value.trim() : fallback;
}

function sanitizeImageUrl(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  return SAFE_IMAGE_URL_RE.test(trimmed) ? trimmed : '';
}

function sanitizeDesignData(rawData) {
  if (!rawData || typeof rawData !== 'object' || Array.isArray(rawData)) {
    return null;
  }

  const data = structuredClone(rawData);

  if (data.header && typeof data.header === 'object') {
    data.header.leftLogoUrl = sanitizeImageUrl(data.header.leftLogoUrl);
    data.header.rightLogoUrl = sanitizeImageUrl(data.header.rightLogoUrl);
  }

  if (data.author && typeof data.author === 'object') {
    data.author.signatureUrl = sanitizeImageUrl(data.author.signatureUrl);
  }

  if (data.media && typeof data.media === 'object') {
    data.media.supportingPhotoUrl = sanitizeImageUrl(data.media.supportingPhotoUrl);
  }

  if (data.styling && typeof data.styling === 'object') {
    const s = data.styling;
    if (s.primaryColor !== undefined) s.primaryColor = sanitizeHexColor(s.primaryColor, '#0c2b66');
    if (s.goldColor !== undefined) s.goldColor = sanitizeHexColor(s.goldColor, '#D4AF37');
    if (s.accentColor !== undefined) s.accentColor = sanitizeHexColor(s.accentColor, '#1e40af');
    if (s.headingColor !== undefined) s.headingColor = sanitizeHexColor(s.headingColor, '#0c2b66');
    if (s.bgTopColor !== undefined) s.bgTopColor = sanitizeHexColor(s.bgTopColor, '#C8DFFB');
    if (s.bgSideColor !== undefined) s.bgSideColor = sanitizeHexColor(s.bgSideColor, '#FAD69E');

    if (s.headingFont !== undefined && !FONT_NAME_RE.test(String(s.headingFont))) {
      delete s.headingFont;
    }
    if (s.bodyFont !== undefined && !FONT_NAME_RE.test(String(s.bodyFont))) {
      delete s.bodyFont;
    }
    if (s.scriptFont !== undefined && !FONT_NAME_RE.test(String(s.scriptFont))) {
      delete s.scriptFont;
    }

    if (s.textColors && typeof s.textColors === 'object' && !Array.isArray(s.textColors)) {
      const cleanedColors = {};
      for (const [k, v] of Object.entries(s.textColors)) {
        if (/^[A-Za-z0-9_.-]{1,40}$/.test(k) && typeof v === 'string' && HEX_COLOR_RE.test(v.trim())) {
          cleanedColors[k] = v.trim();
        }
      }
      s.textColors = cleanedColors;
    }
  }

  return data;
}

function normalizeDesignPayload(body, userId, overrideId) {
  const now = new Date().toISOString();
  const rawId = overrideId || body.id;
  const id = typeof rawId === 'string' && DESIGN_ID_RE.test(rawId.trim()) ? rawId.trim() : null;
  const sanitizedData = sanitizeDesignData(body.data);
  const templateId = VALID_TEMPLATES.has(body.templateId) ? body.templateId : 'template-1';
  const status = VALID_STATUSES.has(body.status) ? body.status : 'draft';
  const rawTitle = typeof body.title === 'string' ? body.title.trim() : '';
  const title = rawTitle ? rawTitle.slice(0, 200) : 'Untitled Design';
  const thumbnail = sanitizeImageUrl(body.thumbnail) || undefined;

  return {
    id,
    userId,
    title,
    templateId,
    status,
    createdAt: typeof body.createdAt === 'string' ? body.createdAt : now,
    updatedAt: typeof body.updatedAt === 'string' ? body.updatedAt : now,
    thumbnail,
    data: sanitizedData,
    canvasJson: body.canvasJson,
  };
}

// GET /api/designs - List all designs belonging to the authenticated user
router.get('/', async (req, res) => {
  try {
    const designs = await Design.find({ userId: req.user.id }, { _id: 0 })
      .sort({ updatedAt: -1 })
      .lean();
    res.json(designs);
  } catch (err) {
    console.error('Error listing designs:', err);
    res.status(500).json({ error: 'Failed to load designs' });
  }
});

// GET /api/designs/:id - Get a single design owned by the authenticated user
router.get('/:id', async (req, res) => {
  try {
    if (!DESIGN_ID_RE.test(req.params.id)) {
      return res.status(400).json({ error: 'Invalid design ID' });
    }
    const design = await Design.findOne(
      { id: req.params.id, userId: req.user.id },
      { _id: 0 }
    ).lean();
    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }
    res.json(design);
  } catch (err) {
    console.error('Error fetching design:', err);
    res.status(500).json({ error: 'Failed to fetch design' });
  }
});

// POST /api/designs/seed - Seed initial starter designs for this user without overwriting existing designs
router.post('/seed', async (req, res) => {
  try {
    const incoming = Array.isArray(req.body?.designs) ? req.body.designs : [];
    if (incoming.length > 0) {
      const ops = incoming
        .map((d) => (d && d.id && d.data ? normalizeDesignPayload(d, req.user.id) : null))
        .filter((payload) => payload && payload.id && payload.data)
        .map((payload) => ({
          updateOne: {
            filter: { id: payload.id, userId: req.user.id },
            update: { $setOnInsert: payload },
            upsert: true,
          },
        }));

      if (ops.length > 0) {
        await Design.bulkWrite(ops, { ordered: false });
      }
    }

    const designs = await Design.find({ userId: req.user.id }, { _id: 0 })
      .sort({ updatedAt: -1 })
      .lean();
    res.json(designs);
  } catch (err) {
    console.error('Error seeding designs:', err);
    res.status(500).json({ error: 'Failed to seed sample designs' });
  }
});

// POST /api/designs - Create or upsert a design for this user
router.post('/', async (req, res) => {
  try {
    const payload = normalizeDesignPayload(req.body || {}, req.user.id);
    if (!payload.id || !payload.data) {
      return res.status(400).json({ error: 'Invalid or missing design fields: id and data' });
    }

    const saved = await Design.findOneAndUpdate(
      { id: payload.id, userId: req.user.id },
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(saved.toJSON());
  } catch (err) {
    console.error('Error saving design:', err);
    res.status(500).json({ error: 'Failed to save design' });
  }
});

// PUT /api/designs/:id - Update a design owned by this user
router.put('/:id', async (req, res) => {
  try {
    const payload = normalizeDesignPayload(req.body || {}, req.user.id, req.params.id);
    if (!payload.id || !payload.data) {
      return res.status(400).json({ error: 'Invalid design id or missing field: data' });
    }

    const updated = await Design.findOneAndUpdate(
      { id: req.params.id, userId: req.user.id },
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(updated.toJSON());
  } catch (err) {
    console.error('Error updating design:', err);
    res.status(500).json({ error: 'Failed to update design' });
  }
});

// DELETE /api/designs - Delete all designs owned by this user
router.delete('/', async (req, res) => {
  try {
    const result = await Design.deleteMany({ userId: req.user.id });
    res.json({ deletedCount: result.deletedCount || 0 });
  } catch (err) {
    console.error('Error clearing designs:', err);
    res.status(500).json({ error: 'Failed to clear designs' });
  }
});

// DELETE /api/designs/:id - Delete a design owned by this user
router.delete('/:id', async (req, res) => {
  try {
    if (!DESIGN_ID_RE.test(req.params.id)) {
      return res.status(400).json({ error: 'Invalid design ID' });
    }
    await Design.deleteOne({ id: req.params.id, userId: req.user.id });
    res.json({ deleted: true, id: req.params.id });
  } catch (err) {
    console.error('Error deleting design:', err);
    res.status(500).json({ error: 'Failed to delete design' });
  }
});

export default router;
