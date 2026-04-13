import express from 'express';
import cors from 'cors';
import supabase from '../../supabase.js';
import { upload, generateStoragePath } from '../../utils/upload.js';
import { extractExifTime } from '../../utils/exif.js';

const BUCKET = 'images';
const SUPABASE_URL = process.env.SUPABASE_URL;

function getPublicUrl(storagePath) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'SET' : 'MISSING'
    }
  });
});

app.post('/auth/login', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.json({ ok: false, msg: '请输入手机号' });
  if (phone === process.env.ADMIN_PASSWORD) return res.json({ ok: true, role: 'admin' });
  const { data: customer } = await supabase.from('customers').select('*').eq('phone', phone).single();
  if (customer) {
    await supabase.from('visits').insert({ customer_phone: phone });
    const { data: lastVisit } = await supabase.from('visits').select('visit_time').eq('customer_phone', phone).order('visit_time', { ascending: false }).range(1, 1).single();
    return res.json({ ok: true, role: 'customer', isNew: false, customer, lastVisit: lastVisit ? lastVisit.visit_time : null });
  }
  return res.json({ ok: true, role: 'customer', isNew: true });
});

app.post('/customers', async (req, res) => {
  const { phone, name, address, area, house_type, renovation_type } = req.body;
  if (!phone) return res.json({ ok: false, msg: '手机号必填' });
  const { data: customer, error } = await supabase.from('customers').insert({ phone, name: name || '', address: address || '', area: area || '', house_type: house_type || '', renovation_type: renovation_type || '' }).select().single();
  if (error) {
    if (error.code === '23505') return res.json({ ok: false, msg: '该手机号已注册' });
    return res.json({ ok: false, msg: error.message });
  }
  await supabase.from('visits').insert({ customer_phone: phone });
  res.json({ ok: true, customer });
});

app.get('/customers', async (req, res) => {
  const { data: customers } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
  res.json({ ok: true, customers: customers || [] });
});

app.get('/customers/:phone', async (req, res) => {
  const { data: customer } = await supabase.from('customers').select('*').eq('phone', req.params.phone).single();
  if (!customer) return res.json({ ok: false, msg: '客户不存在' });
  res.json({ ok: true, customer });
});

app.put('/customers/:phone', async (req, res) => {
  const { name, address, area, house_type, renovation_type, demand } = req.body;
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (address !== undefined) updateData.address = address;
  if (area !== undefined) updateData.area = area;
  if (house_type !== undefined) updateData.house_type = house_type;
  if (renovation_type !== undefined) updateData.renovation_type = renovation_type;
  if (demand !== undefined) updateData.demand = demand;
  const { data: customer, error } = await supabase.from('customers').update(updateData).eq('phone', req.params.phone).select().single();
  if (error) return res.json({ ok: false, msg: error.message });
  res.json({ ok: true, customer });
});

app.delete('/customers/:phone', async (req, res) => {
  await supabase.from('favorites').delete().eq('customer_phone', req.params.phone);
  await supabase.from('visits').delete().eq('customer_phone', req.params.phone);
  await supabase.from('customers').delete().eq('phone', req.params.phone);
  res.json({ ok: true });
});

app.get('/customers/:phone/visits', async (req, res) => {
  const { data: visits } = await supabase.from('visits').select('*').eq('customer_phone', req.params.phone).order('visit_time', { ascending: false });
  res.json({ ok: true, visits: visits || [] });
});

app.post('/images/upload', upload.array('images', 20), async (req, res) => {
  const category = req.body.category || '木门';
  const type = req.body.type || '案例库';
  const files = req.files;
  if (!files || files.length === 0) return res.json({ ok: false, msg: '请选择图片' });
  const results = [];
  for (const file of files) {
    const storagePath = generateStoragePath(file.originalname);
    const exifTime = await extractExifTime(file.buffer);
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: false });
    if (uploadError) { results.push({ ok: false, msg: uploadError.message }); continue; }
    const { data: image, error: dbError } = await supabase.from('images').insert({ path: storagePath, category, type, exif_time: exifTime }).select().single();
    if (dbError) { results.push({ ok: false, msg: dbError.message }); } else { results.push({ id: image.id, path: storagePath, url: getPublicUrl(storagePath), category, type, exifTime }); }
  }
  res.json({ ok: true, images: results });
});

app.get('/images', async (req, res) => {
  const { category, type } = req.query;
  let query = supabase.from('images').select('*');
  if (category) query = query.eq('category', category);
  if (type) query = query.eq('type', type);
  query = query.order('exif_time', { ascending: false, nullsFirst: false });
  const { data: images, error } = await query;
  if (error) return res.json({ ok: false, msg: error.message });
  res.json({ ok: true, images: (images || []).map(img => ({ ...img, url: getPublicUrl(img.path) })) });
});

app.put('/images/:id', async (req, res) => {
  const { category, type } = req.body;
  const { error } = await supabase.from('images').update({ category, type }).eq('id', req.params.id);
  if (error) return res.json({ ok: false, msg: error.message });
  res.json({ ok: true });
});

app.delete('/images/:id', async (req, res) => {
  const { data: image } = await supabase.from('images').select('path').eq('id', req.params.id).single();
  if (image) await supabase.storage.from(BUCKET).remove([image.path]);
  const { error } = await supabase.from('images').delete().eq('id', req.params.id);
  if (error) return res.json({ ok: false, msg: error.message });
  res.json({ ok: true });
});

app.post('/favorites', async (req, res) => {
  const { customer_phone, image_id } = req.body;
  if (!customer_phone || !image_id) return res.json({ ok: false, msg: '参数不完整' });
  const { error } = await supabase.from('favorites').insert({ customer_phone, image_id });
  if (error) {
    if (error.code === '23505') return res.json({ ok: false, msg: '已收藏' });
    return res.json({ ok: false, msg: error.message });
  }
  res.json({ ok: true });
});

app.delete('/favorites', async (req, res) => {
  const { customer_phone, image_id } = req.body;
  const { error } = await supabase.from('favorites').delete().eq('customer_phone', customer_phone).eq('image_id', image_id);
  if (error) return res.json({ ok: false, msg: error.message });
  res.json({ ok: true });
});

app.get('/favorites/count/:phone', async (req, res) => {
  const { count, error } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('customer_phone', req.params.phone);
  if (error) return res.json({ ok: false, msg: error.message });
  res.json({ ok: true, count: count || 0 });
});

app.get('/favorites/stats/hot', async (req, res) => {
  const { data: images } = await supabase.from('images').select('id, path, category, type').limit(10);
  const stats = await Promise.all((images || []).map(async (img) => {
    const { count } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('image_id', img.id);
    return { ...img, url: getPublicUrl(img.path), fav_count: count || 0 };
  }));
  stats.sort((a, b) => b.fav_count - a.fav_count);
  res.json({ ok: true, stats });
});

app.get('/favorites/:phone', async (req, res) => {
  const { data: favorites, error } = await supabase.from('favorites').select('id, customer_phone, image_id, created_at, images(path, category, type, exif_time)').eq('customer_phone', req.params.phone).order('created_at', { ascending: false });
  if (error) return res.json({ ok: false, msg: error.message });
  res.json({ ok: true, favorites: (favorites || []).map(f => ({ ...f, path: f.images?.path, url: getPublicUrl(f.images?.path), category: f.images?.category, type: f.images?.type, exif_time: f.images?.exif_time, images: undefined })) });
});

app.get('/demands/:phone', async (req, res) => {
  const { data: customer } = await supabase.from('customers').select('demand').eq('phone', req.params.phone).single();
  if (!customer) return res.json({ ok: false, msg: '客户不存在' });
  res.json({ ok: true, demand: customer.demand || '' });
});

app.put('/demands/:phone', async (req, res) => {
  const { demand } = req.body;
  const { error } = await supabase.from('customers').update({ demand: demand || '' }).eq('phone', req.params.phone);
  if (error) return res.json({ ok: false, msg: error.message });
  res.json({ ok: true });
});

export default app;
