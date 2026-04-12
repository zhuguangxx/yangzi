import { Router } from 'express';
import supabase from '../supabase.js';
import { upload, generateStoragePath } from '../utils/upload.js';
import { extractExifTime } from '../utils/exif.js';

const BUCKET = 'images';
const SUPABASE_URL = process.env.SUPABASE_URL;

function getPublicUrl(storagePath) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

const router = Router();

router.post('/upload', upload.array('images', 20), async (req, res) => {
  const category = req.body.category || '木门';
  const type = req.body.type || '案例库';
  const files = req.files;

  if (!files || files.length === 0) {
    return res.json({ ok: false, msg: '请选择图片' });
  }

  const results = [];
  for (const file of files) {
    const storagePath = generateStoragePath(file.originalname);
    const exifTime = await extractExifTime(file.buffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      results.push({ ok: false, msg: uploadError.message });
      continue;
    }

    const { data: image, error: dbError } = await supabase
      .from('images')
      .insert({ path: storagePath, category, type, exif_time: exifTime })
      .select()
      .single();

    if (dbError) {
      results.push({ ok: false, msg: dbError.message });
    } else {
      results.push({
        id: image.id,
        path: storagePath,
        url: getPublicUrl(storagePath),
        category,
        type,
        exifTime
      });
    }
  }

  res.json({ ok: true, images: results });
});

router.get('/', async (req, res) => {
  const { category, type } = req.query;
  let query = supabase.from('images').select('*');
  if (category) query = query.eq('category', category);
  if (type) query = query.eq('type', type);
  query = query.order('exif_time', { ascending: false, nullsFirst: false });
  const { data: images, error } = await query;
  if (error) {
    return res.json({ ok: false, msg: error.message });
  }
  const result = (images || []).map(img => ({
    ...img,
    url: getPublicUrl(img.path)
  }));
  res.json({ ok: true, images: result });
});

router.put('/:id', async (req, res) => {
  const { category, type } = req.body;
  const { error } = await supabase
    .from('images')
    .update({ category, type })
    .eq('id', req.params.id);
  if (error) {
    return res.json({ ok: false, msg: error.message });
  }
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  const { data: image } = await supabase
    .from('images')
    .select('path')
    .eq('id', req.params.id)
    .single();

  if (image) {
    await supabase.storage.from(BUCKET).remove([image.path]);
  }

  const { error } = await supabase.from('images').delete().eq('id', req.params.id);
  if (error) {
    return res.json({ ok: false, msg: error.message });
  }
  res.json({ ok: true });
});

export default router;
