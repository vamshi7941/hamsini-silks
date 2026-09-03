import Lead from '../models/LeadSchema.js';

export async function createLead(req, res) {
  try {
    const { phone, name, source, metadata } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone required' });

    const now = new Date();
    const istString = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // upsert lead by phone to avoid duplicates
    const cleanPhone = String(phone).replace(/\D/g, '');
    const lead = await Lead.findOneAndUpdate(
      { phone: cleanPhone },
      {
        $set: {
          name: String(name || '').trim(),
          source: source || 'chatbot',
          metadata: metadata || {},
          createdAtIST: istString,
        },
        $setOnInsert: { phone: cleanPhone },
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({ success: true, lead });
  } catch (error) {
    console.error('Error creating lead:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function listLeads(req, res) {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 }).limit(100);
    return res.json({ success: true, leads });
  } catch (error) {
    console.error('Error listing leads:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// Import all customers into leads table (bulk upsert)
export async function importCustomers(req, res) {
  try {
    // lazy-load Customer to avoid circular requires
    const Customer = (await import('../models/CustomerSchema.js')).default;

    // fetch customers with a phone defined
    const customers = await Customer.find({ phone: { $exists: true, $ne: null } });

    if (!customers || customers.length === 0) {
      return res.json({ success: true, message: 'No customers with phone found', processed: 0 });
    }

    const ops = [];
    const now = new Date();
    const istString = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // dedupe by cleaned phone to avoid multiple upserts for same number
    const seenPhones = new Set();

    for (const c of customers) {
      const rawPhone = c.phone || '';
      const cleanPhone = String(rawPhone).replace(/\D/g, '');
      if (!cleanPhone) continue; // skip customers without usable phone
      if (seenPhones.has(cleanPhone)) continue; // skip duplicates
      seenPhones.add(cleanPhone);

      const name = String(c.fullName || '').trim();

      ops.push({
        updateOne: {
          filter: { phone: cleanPhone },
          update: {
            $set: {
              name,
              source: 'imported_customers',
              metadata: { customerId: c._id },
              createdAtIST: istString,
            },
            $setOnInsert: { phone: cleanPhone },
          },
          upsert: true,
        },
      });
    }

    if (ops.length === 0) {
      return res.json({ success: true, message: 'No valid phone numbers to import', processed: 0 });
    }

    // perform bulkWrite
    const bulkResult = await Lead.bulkWrite(ops, { ordered: false });

    const processed = ops.length;
    const upserts = bulkResult.upsertedCount || 0;
    const modified = bulkResult.modifiedCount || 0;

    return res.json({ success: true, message: 'Import completed', processed, upserts, modified, raw: bulkResult });
  } catch (error) {
    console.error('Error importing customers into leads:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}
