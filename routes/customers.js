import { Router } from 'express';
import supabase from '../supabase.js';

const router = Router();

router.post('/', async (req, res) => {
  const { phone, name, address, area, house_type, renovation_type } = req.body;
  if (!phone) {
    return res.json({ ok: false, msg: '手机号必填' });
  }
  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      phone,
      name: name || '',
      address: address || '',
      area: area || '',
      house_type: house_type || '',
      renovation_type: renovation_type || ''
    })
    .select()
    .single();
  if (error) {
    if (error.code === '23505') {
      return res.json({ ok: false, msg: '该手机号已注册' });
    }
    return res.json({ ok: false, msg: error.message });
  }
  await supabase.from('visits').insert({ customer_phone: phone });
  res.json({ ok: true, customer });
});

router.get('/:phone', async (req, res) => {
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', req.params.phone)
    .single();
  if (!customer) {
    return res.json({ ok: false, msg: '客户不存在' });
  }
  res.json({ ok: true, customer });
});

router.put('/:phone', async (req, res) => {
  const { name, address, area, house_type, renovation_type, demand } = req.body;
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (address !== undefined) updateData.address = address;
  if (area !== undefined) updateData.area = area;
  if (house_type !== undefined) updateData.house_type = house_type;
  if (renovation_type !== undefined) updateData.renovation_type = renovation_type;
  if (demand !== undefined) updateData.demand = demand;

  const { data: customer, error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('phone', req.params.phone)
    .select()
    .single();
  if (error) {
    return res.json({ ok: false, msg: error.message });
  }
  res.json({ ok: true, customer });
});

router.delete('/:phone', async (req, res) => {
  await supabase.from('favorites').delete().eq('customer_phone', req.params.phone);
  await supabase.from('visits').delete().eq('customer_phone', req.params.phone);
  await supabase.from('customers').delete().eq('phone', req.params.phone);
  res.json({ ok: true });
});

router.get('/', async (req, res) => {
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });
  res.json({ ok: true, customers: customers || [] });
});

router.get('/:phone/visits', async (req, res) => {
  const { data: visits } = await supabase
    .from('visits')
    .select('*')
    .eq('customer_phone', req.params.phone)
    .order('visit_time', { ascending: false });
  res.json({ ok: true, visits: visits || [] });
});

export default router;
