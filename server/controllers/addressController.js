const crypto = require('crypto');
const { supabase } = require('../config/supabase');
const db = require('../config/db');

exports.getAddresses = async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', req.user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (!error && data) {
        return res.json({ success: true, addresses: data });
      }
    }

    const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(req.user.id);
    res.json({ success: true, addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createAddress = async (req, res) => {
  try {
    const { full_name, phone, address_line_1, address_line_2, area, city, state, pincode, landmark, is_default } = req.body;
    if (!full_name || !phone || !address_line_1 || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: 'All required address fields must be filled.' });
    }

    if (supabase) {
      if (is_default) {
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', req.user.id);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          id: crypto.randomUUID(),
          user_id: req.user.id,
          full_name,
          phone,
          address_line_1,
          address_line_2: address_line_2 || null,
          area: area || null,
          city,
          state,
          pincode,
          landmark: landmark || null,
          is_default: Boolean(is_default),
        })
        .select()
        .single();

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res.status(201).json({ success: true, message: 'Address saved successfully in Supabase', address: data });
    }

    if (is_default) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
    }

    const addrId = 'addr-' + Date.now();
    db.prepare(`
      INSERT INTO addresses (id, user_id, full_name, phone, address_line_1, address_line_2, area, city, state, pincode, landmark, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(addrId, req.user.id, full_name, phone, address_line_1, address_line_2 || null, area || null, city, state, pincode, landmark || null, is_default ? 1 : 0);

    const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(addrId);
    res.status(201).json({ success: true, message: 'Address saved successfully', address });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, address_line_1, address_line_2, area, city, state, pincode, landmark, is_default } = req.body;

    if (supabase) {
      if (is_default) {
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', req.user.id);
      }

      const { data, error } = await supabase
        .from('addresses')
        .update({
          full_name,
          phone,
          address_line_1,
          address_line_2: address_line_2 || null,
          area: area || null,
          city,
          state,
          pincode,
          landmark: landmark || null,
          is_default: Boolean(is_default),
        })
        .eq('id', id)
        .eq('user_id', req.user.id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res.json({ success: true, message: 'Address updated in Supabase', address: data });
    }

    if (is_default) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
    }

    db.prepare(`
      UPDATE addresses
      SET full_name = ?, phone = ?, address_line_1 = ?, address_line_2 = ?, area = ?, city = ?, state = ?, pincode = ?, landmark = ?, is_default = ?
      WHERE id = ? AND user_id = ?
    `).run(full_name, phone, address_line_1, address_line_2 || null, area || null, city, state, pincode, landmark || null, is_default ? 1 : 0, id, req.user.id);

    const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(id);
    res.json({ success: true, message: 'Address updated', address });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      const { error } = await supabase.from('addresses').delete().eq('id', id).eq('user_id', req.user.id);
      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.json({ success: true, message: 'Address deleted from Supabase' });
    }

    db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(id, req.user.id);
    res.json({ success: true, message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
