import jwt from 'jsonwebtoken';
import Customer from '../models/CustomerSchema.js';

const otpStore = new Map();
const OTP_TTL_MS = 2 * 60 * 1000; // 2 minutes

const normalizePhone = (phone) =>
  String(phone || '')
    .replace(/\D/g, '')
    .slice(-10);

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

const toE164 = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  return digits ? `+${digits}` : '';
};

const sendOtpViaTwilio = async (phone, otp) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || (!messagingServiceSid && !fromNumber)) {
    console.log(
      'Twilio SMS credentials not configured. OTP generated locally:',
      otp,
    );
    return { success: true, mocked: true };
  }

  const payload = {
    To: toE164(phone),
    Body: `Your Hamsini verification code is ${otp}.`,
  };

  if (messagingServiceSid) {
    payload.MessagingServiceSid = messagingServiceSid;
  } else if (fromNumber) {
    payload.From = fromNumber;
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(payload).toString(),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to send OTP via Twilio.');
  }

  return { success: true, mocked: false };
};

export async function googleLogin(req, res) {
  const { uid, name, email } = req.body;

  if (!uid)
    return res
      .status(400)
      .json({ success: false, message: 'Missing user info' });

  try {
    const now = new Date();
    const istString = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    let customer = await Customer.findById(uid);

    if (!customer && email) {
      customer = await Customer.findOne({ email });
    }

    if (customer) {
      customer.fullName = name;
      customer.email = email;
      customer.loggedInAtIST = istString;
      customer.role = 'customer';
      await customer.save();
    } else {
      customer = await Customer.create({
        _id: uid,
        fullName: name,
        email,
        loggedInAtIST: istString,
        role: 'customer',
      });
    }

    const token = createToken(customer._id);
    return res.json({ success: true, customer, token });
  } catch (err) {
    console.error('Error saving Google user:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

const sendOtpVia360Messenger = async (phone, otp) => {
  const whatsappToken = process.env.WHATSAPP_TOKEN;

  if (!whatsappToken) {
    console.log(
      '360 Messenger credentials not configured. OTP generated locally:',
    );
    return { success: false, mocked: true };
  }

  const payload = {
    phonenumber: toE164(phone),
    text: `Your Hamsini verification code is ${otp}.`,
  };
  console.log('Sending OTP via 360 Messenger:', payload, whatsappToken);
  const response = await fetch(`https://api.360messenger.com/v2/sendMessage`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${whatsappToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(payload).toString(),
  });
  console.log('360 Messenger response body:', await response.text());

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to send OTP via 360 Messenger.');
  }

  return { success: true, mocked: false };
};

export async function sendOtp(req, res) {
  const phone = normalizePhone(req.body.phone);
  const email = String(req.body.email || '').trim();
  const url = req.body.url || '';

  if (!phone || phone.length !== 10) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid 10-digit phone number.',
    });
  }

  try {
    const customerByPhone = await Customer.findOne({ phone });
    const customerByEmail = email ? await Customer.findOne({ email }) : null;

    if (customerByPhone && url.includes('/auth')) {
      return res.status(400).json({
        success: false,
        message:
          'This phone number is already registered. Please use different phone number.',
      });
    }

    if (customerByPhone && customerByEmail && customerByPhone._id !== customerByEmail._id) {
      return res.status(400).json({
        success: false,
        message: 'This phone number or email is already associated with another account.',
      });
    }

    const otp = generateOtp();
    otpStore.set(phone, { otp, createdAt: Date.now() });

    const send = await sendOtpVia360Messenger(phone, otp);

    if (!send.success) {
      return res.status(500).json({
        success: false,
        message: 'Unable to send OTP right now. Please try again.',
      });
    }

    return res.json({
      success: true,
      message: 'OTP sent successfully to your phone number.',
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to send OTP right now. Please try again.',
    });
  }
}

export async function verifyLoginOtp(req, res) {
  const phone = normalizePhone(req.body.phone);
  const otp = String(req.body.otp || '').trim();
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim();

  if (!phone || phone.length !== 10) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid 10-digit phone number.',
    });
  }

  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid 6-digit OTP.',
    });
  }

  const storedOtpEntry = otpStore.get(phone);
  if (!storedOtpEntry) {
    return res.status(400).json({
      success: false,
      message: 'OTP expired or not found. Please request a new one.',
    });
  }

  if (Date.now() - storedOtpEntry.createdAt > OTP_TTL_MS) {
    otpStore.delete(phone);
    return res.status(400).json({
      success: false,
      message: 'OTP expired. Please request a new one.',
    });
  }

  if (storedOtpEntry.otp !== otp) {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP. Please try again.',
    });
  }

  otpStore.delete(phone);

  try {
    const now = new Date();
    const istString = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const customerByPhone = await Customer.findOne({ phone });
    const customerByEmail = email ? await Customer.findOne({ email }) : null;

    if (email) {
      if (customerByPhone && customerByEmail && customerByPhone._id !== customerByEmail._id) {
        return res.status(400).json({
          success: false,
          message: 'This phone number or email is already associated with another account.',
        });
      }
    }

    if (customerByPhone) {
      const updated = await Customer.findOneAndUpdate(
        { phone },
        { $set: { loggedInAtIST: istString } },
        { new: true },
      );
      const token = createToken(updated._id);
      return res.json({ success: true, message: 'OTP verified successfully.', token, user: updated.toObject() });
    }

    if (customerByEmail) {
      const updated = await Customer.findOneAndUpdate(
        { email },
        { $set: { phone, loggedInAtIST: istString } },
        { new: true },
      );
      const token = createToken(updated._id);
      return res.json({ success: true, message: 'OTP verified successfully.', token, user: updated.toObject() });
    }

    const customerId = `customer:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const customer = await Customer.create({
      _id: customerId,
      fullName: name,
      phone,
      email: email || undefined,
      loggedInAtIST: istString,
      role: 'customer',
    });

    const token = createToken(customer._id);
    return res.json({ success: true, message: 'OTP verified successfully.', token, user: customer.toObject() });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This phone number or email is already associated with another account.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Unable to verify OTP right now. Please try again.',
    });
  }
}

// just verify otp for placing order
export async function verifyOtpForOrder(req, res) {
  const phone = normalizePhone(req.body.phone);
  const otp = String(req.body.otp || '').trim();

  if (!phone || phone.length !== 10) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid 10-digit phone number.',
    });
  }

  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid 6-digit OTP.',
    });
  }

  const storedOtpEntry = otpStore.get(phone);
  if (!storedOtpEntry) {
    return res.status(400).json({
      success: false,
      message: 'OTP expired or not found. Please request a new one.',
    });
  }

  if (Date.now() - storedOtpEntry.createdAt > OTP_TTL_MS) {
    otpStore.delete(phone);
    return res.status(400).json({
      success: false,
      message: 'OTP expired. Please request a new one.',
    });
  }

  if (storedOtpEntry.otp !== otp) {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP. Please try again.',
    });
  }

  otpStore.delete(phone);

  return res.json({
    success: true,
    message: 'OTP verified successfully.',
  });
}
