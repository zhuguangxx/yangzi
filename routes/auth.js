import { Router } from 'express';
import supabase from '../supabase.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.json({ ok: false, msg: '请输入手机号' });
  }

  if (phone === process.env.ADMIN_PASSWORD) {
    return res.json({ ok: true, role: 'admin' });
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', phone)
    .single();

  if (customer) {
    await supabase.from('visits').insert({ customer_phone: phone });
    const { data: lastVisit } = await supabase
      .from('visits')
      .select('visit_time')
      .eq('customer_phone', phone)
      .order('visit_time', { ascending: false })
      .range(1, 1)
      .single();
    return res.json({
      ok: true,
      role: 'customer',
      isNew: false,
      customer,
      lastVisit: lastVisit ? lastVisit.visit_time : null
    });
  }

  return res.json({ ok: true, role: 'customer', isNew: true });
});

export default router;
