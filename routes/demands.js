import { Router } from 'express';
import supabase from '../supabase.js';

const router = Router();

router.get('/:phone', async (req, res) => {
  const { data: customer } = await supabase
    .from('customers')
    .select('demand')
    .eq('phone', req.params.phone)
    .single();
  if (!customer) {
    return res.json({ ok: false, msg: '客户不存在' });
  }
  res.json({ ok: true, demand: customer.demand || '' });
});

router.put('/:phone', async (req, res) => {
  const { demand } = req.body;
  const { error } = await supabase
    .from('customers')
    .update({ demand: demand || '' })
    .eq('phone', req.params.phone);
  if (error) {
    return res.json({ ok: false, msg: error.message });
  }
  res.json({ ok: true });
});

export default router;
