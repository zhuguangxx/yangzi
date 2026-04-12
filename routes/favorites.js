import { Router } from 'express';
import supabase from '../supabase.js';

const BUCKET = 'images';
const SUPABASE_URL = process.env.SUPABASE_URL;

function getPublicUrl(storagePath) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

const router = Router();

router.post('/', async (req, res) => {
  const { customer_phone, image_id } = req.body;
  if (!customer_phone || !image_id) {
    return res.json({ ok: false, msg: '参数不完整' });
  }
  const { error } = await supabase
    .from('favorites')
    .insert({ customer_phone, image_id });
  if (error) {
    if (error.code === '23505') {
      return res.json({ ok: false, msg: '已收藏' });
    }
    return res.json({ ok: false, msg: error.message });
  }
  res.json({ ok: true });
});

router.delete('/', async (req, res) => {
  const { customer_phone, image_id } = req.body;
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('customer_phone', customer_phone)
    .eq('image_id', image_id);
  if (error) {
    return res.json({ ok: false, msg: error.message });
  }
  res.json({ ok: true });
});

router.get('/count/:phone', async (req, res) => {
  const { count, error } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('customer_phone', req.params.phone);
  if (error) {
    return res.json({ ok: false, msg: error.message });
  }
  res.json({ ok: true, count: count || 0 });
});

router.get('/stats/hot', async (req, res) => {
  const { data: images, error } = await supabase
    .from('images')
    .select('id, path, category, type')
    .limit(10);
  if (error) {
    return res.json({ ok: false, msg: error.message });
  }
  const stats = await Promise.all((images || []).map(async (img) => {
    const { count } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('image_id', img.id);
    return {
      ...img,
      url: getPublicUrl(img.path),
      fav_count: count || 0
    };
  }));
  stats.sort((a, b) => b.fav_count - a.fav_count);
  res.json({ ok: true, stats });
});

router.get('/:phone', async (req, res) => {
  const { data: favorites, error } = await supabase
    .from('favorites')
    .select('id, customer_phone, image_id, created_at, images(path, category, type, exif_time)')
    .eq('customer_phone', req.params.phone)
    .order('created_at', { ascending: false });
  if (error) {
    return res.json({ ok: false, msg: error.message });
  }
  const result = (favorites || []).map(f => ({
    ...f,
    path: f.images?.path,
    url: getPublicUrl(f.images?.path),
    category: f.images?.category,
    type: f.images?.type,
    exif_time: f.images?.exif_time,
    images: undefined
  }));
  res.json({ ok: true, favorites: result });
});

export default router;
