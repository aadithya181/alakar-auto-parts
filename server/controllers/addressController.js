const crypto = require('crypto');
const { supabase } = require('../config/supabase');
const db = require('../config/db');

// Helper for timing out slow external network requests
const withTimeout = (promise, ms = 2000) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timed out')), ms)),
  ]);

exports.getAddresses = async (req, res) => {
  try {
    let addresses = null;

    if (supabase) {
      try {
        const { data, error } = await withTimeout(
          supabase
            .from('addresses')
            .select('*')
            .eq('user_id', req.user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false }),
          1800
        );

        if (!error && Array.isArray(data) && data.length > 0) {
          addresses = data;
        }
      } catch (sbErr) {
        console.warn('Supabase getAddresses fallback to local DB:', sbErr.message);
      }
    }

    if (!addresses || addresses.length === 0) {
      addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(req.user.id);
    }

    res.json({ success: true, addresses: addresses || [] });
  } catch (err) {
    console.error('Error in getAddresses:', err);
    // Even in catch, return local addresses if available
    try {
      const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(req.user.id);
      return res.json({ success: true, addresses: addresses || [] });
    } catch (dbErr) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

exports.createAddress = async (req, res) => {
  try {
    const { full_name, phone, address_line_1, address_line_2, area, city, state, pincode, landmark, is_default } = req.body;
    if (!full_name || !phone || !address_line_1 || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: 'All required address fields must be filled.' });
    }

    const addrId = 'addr-' + Date.now();
    const shouldBeDefault = Boolean(is_default);

    if (shouldBeDefault) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
    }

    db.prepare(`
      INSERT INTO addresses (id, user_id, full_name, phone, address_line_1, address_line_2, area, city, state, pincode, landmark, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      addrId,
      req.user.id,
      full_name,
      phone,
      address_line_1,
      address_line_2 || null,
      area || null,
      city,
      state,
      pincode,
      landmark || null,
      shouldBeDefault ? 1 : 0
    );

    const savedAddress = db.prepare('SELECT * FROM addresses WHERE id = ?').get(addrId) || {
      id: addrId,
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
      is_default: shouldBeDefault ? 1 : 0,
    };

    // Asynchronously replicate to Supabase without blocking or failing the response
    if (supabase) {
      (async () => {
        try {
          if (shouldBeDefault) {
            await withTimeout(supabase.from('addresses').update({ is_default: false }).eq('user_id', req.user.id), 2000);
          }
          await withTimeout(
            supabase.from('addresses').insert({
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
              is_default: shouldBeDefault,
            }),
            2000
          );
        } catch (sbErr) {
          console.warn('Supabase address replication deferred:', sbErr.message);
        }
      })();
    }

    return res.status(201).json({
      success: true,
      message: 'Address saved successfully',
      address: savedAddress,
    });
  } catch (err) {
    console.error('Error in createAddress:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, address_line_1, address_line_2, area, city, state, pincode, landmark, is_default } = req.body;

    const shouldBeDefault = Boolean(is_default);

    if (shouldBeDefault) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
    }

    db.prepare(`
      UPDATE addresses
      SET full_name = ?, phone = ?, address_line_1 = ?, address_line_2 = ?, area = ?, city = ?, state = ?, pincode = ?, landmark = ?, is_default = ?
      WHERE id = ? AND user_id = ?
    `).run(
      full_name,
      phone,
      address_line_1,
      address_line_2 || null,
      area || null,
      city,
      state,
      pincode,
      landmark || null,
      shouldBeDefault ? 1 : 0,
      id,
      req.user.id
    );

    const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(id);

    // Asynchronously replicate to Supabase
    if (supabase) {
      (async () => {
        try {
          if (shouldBeDefault) {
            await withTimeout(supabase.from('addresses').update({ is_default: false }).eq('user_id', req.user.id), 2000);
          }
          await withTimeout(
            supabase
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
                is_default: shouldBeDefault,
              })
              .eq('id', id)
              .eq('user_id', req.user.id),
            2000
          );
        } catch (sbErr) {
          console.warn('Supabase address update deferred:', sbErr.message);
        }
      })();
    }

    res.json({ success: true, message: 'Address updated', address });
  } catch (err) {
    console.error('Error in updateAddress:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(id, req.user.id);

    if (supabase) {
      (async () => {
        try {
          await withTimeout(supabase.from('addresses').delete().eq('id', id).eq('user_id', req.user.id), 2000);
        } catch (sbErr) {
          console.warn('Supabase address delete deferred:', sbErr.message);
        }
      })();
    }

    res.json({ success: true, message: 'Address deleted' });
  } catch (err) {
    console.error('Error in deleteAddress:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
