import { Router } from 'express';
import axios from 'axios';
import pool from '../db.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET /api/transactions — All transactions for the logged-in user
router.get('/', async (req, res) => {
  try {
    const txRes = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    return res.json(txRes.rows.map(formatTx));
  } catch (err) {
    console.error('Get transactions error:', err);
    return res.status(500).json({ error: 'Failed to retrieve transactions.' });
  }
});

// GET /api/transactions/verify-meter — Live Meter lookup using ClubKonnect
router.get('/verify-meter', async (req, res) => {
  try {
    const { operator, meterNumber, meterType } = req.query;
    if (!operator || !meterNumber || !meterType) {
      return res.status(400).json({ error: 'operator, meterNumber, and meterType query parameters are required.' });
    }

    const ckUserId = process.env.CLUBKONNECT_USER_ID;
    const ckApiKey = process.env.CLUBKONNECT_API_KEY;
    const isCkPlaceholder = !ckUserId || ckUserId === 'your_clubkonnect_user_id_here' || !ckApiKey || ckApiKey === 'your_clubkonnect_api_key_here';

    if (isCkPlaceholder) {
      // Simulate verification locally in demo mode
      const names = ['Alice Johnson', 'Michael Adewale', 'Chinedu Okafor', 'Fatima Bello', 'David Olatunji'];
      const addresses = [
        '14 Kingsway Road, Ikoyi, Lagos',
        '28 Herbert Macaulay Way, Yaba, Lagos',
        '7 Wuse II District, Abuja',
        '102 Trans-Amadi Layout, Port Harcourt',
        '15 Ring Road, Ibadan'
      ];
      const seedIndex = parseInt(meterNumber) % names.length;
      return res.json({
        status: 'SUCCESS',
        customerName: names[seedIndex],
        address: addresses[seedIndex]
      });
    }

    const mappedCompany = mapElectricCompanyCode(operator);
    const mappedMeterType = mapMeterType(meterType);

    const url = `https://www.nellobytesystems.com/APIVerifyElectricityV1.asp?UserID=${encodeURIComponent(ckUserId)}&APIKey=${encodeURIComponent(ckApiKey)}&ElectricCompany=${mappedCompany}&MeterNo=${encodeURIComponent(meterNumber)}&MeterType=${mappedMeterType}`;

    const response = await axios.get(url, { timeout: 15000 });
    const data = response.data;
    console.log('[ClubKonnect Meter Verify] Response:', data);

    // If it fails or returns an error status
    if (data && (data.status === 'fail' || data.status === 'invalid_meter_no' || data.error)) {
      return res.status(400).json({ error: data.error || data.status || 'Failed to verify meter number.' });
    }

    const customerName = data.customer_name || data.customerName || data.name;
    const address = data.address || 'N/A';

    if (!customerName) {
      return res.status(400).json({ error: data.status || 'Meter verification returned an empty or failed response.' });
    }

    return res.json({
      status: 'SUCCESS',
      customerName: customerName,
      address: address
    });
  } catch (err) {
    console.error('Meter verification error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Verification server timed out or returned an error.' });
  }
});

// GET /api/transactions/verify-smartcard — Live Smartcard/IUC lookup using ClubKonnect
router.get('/verify-smartcard', async (req, res) => {
  try {
    const { operator, smartcardNo } = req.query;
    if (!operator || !smartcardNo) {
      return res.status(400).json({ error: 'operator and smartcardNo query parameters are required.' });
    }

    const ckUserId = process.env.CLUBKONNECT_USER_ID;
    const ckApiKey = process.env.CLUBKONNECT_API_KEY;
    const isCkPlaceholder = !ckUserId || ckUserId === 'your_clubkonnect_user_id_here' || !ckApiKey || ckApiKey === 'your_clubkonnect_api_key_here';

    if (isCkPlaceholder) {
      // Simulate verification locally in demo mode
      const names = ['Alice Johnson', 'Michael Adewale', 'Chinedu Okafor', 'Fatima Bello', 'David Olatunji'];
      const seedIndex = parseInt(smartcardNo) % names.length;
      return res.json({
        status: 'SUCCESS',
        customerName: names[seedIndex]
      });
    }

    const url = `https://www.nellobytesystems.com/APIVerifyCableTVV1.asp?UserID=${encodeURIComponent(ckUserId)}&APIKey=${encodeURIComponent(ckApiKey)}&CableTV=${encodeURIComponent(operator.toLowerCase())}&SmartCardNo=${encodeURIComponent(smartcardNo)}`;

    const response = await axios.get(url, { timeout: 15000 });
    const data = response.data;
    console.log('[ClubKonnect Verify] Response:', data);

    // If it fails or returns an error status
    if (data && (data.status === 'fail' || data.status === 'invalid_smartcard' || data.error)) {
      return res.status(400).json({ error: data.error || data.status || 'Failed to verify smartcard/IUC.' });
    }

    const customerName = data.customer_name || data.customerName || data.name;
    
    if (!customerName) {
      return res.status(400).json({ error: data.status || 'Smartcard verification returned an empty or failed response.' });
    }

    return res.json({
      status: 'SUCCESS',
      customerName: customerName
    });
  } catch (err) {
    console.error('Smartcard verification error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Verification server timed out or returned an error.' });
  }
});

// POST /api/transactions — Create a new bill payment
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      title, amount, type, status = 'success',
      phone, operator, planId,
      meterNumber, customerName, address, meterType, token,
      smartcardNo, packageName,
    } = req.body;

    let finalToken = token;

    if (!title || !amount || !type) {
      return res.status(400).json({ error: 'title, amount, and type are required.' });
    }
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive.' });
    }

    await client.query('BEGIN');

    // Check current wallet balance
    const userRes = await client.query('SELECT wallet_balance FROM users WHERE id = $1', [req.userId]);
    if (userRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found.' });
    }

    const currentBalance = parseFloat(userRes.rows[0].wallet_balance);
    if (currentBalance < amount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient wallet balance.' });
    }

    // Call live ClubKonnect API for Cable TV subscriptions
    if (type === 'cable-tv') {
      const ckUserId = process.env.CLUBKONNECT_USER_ID;
      const ckApiKey = process.env.CLUBKONNECT_API_KEY;
      const isCkPlaceholder = !ckUserId || ckUserId === 'your_clubkonnect_user_id_here' || !ckApiKey || ckApiKey === 'your_clubkonnect_api_key_here';

      if (isCkPlaceholder) {
        console.log('ℹ️ [ClubKonnect] Running in Demo Mode (No ClubKonnect keys configured. Simulating Cable TV transaction success locally).');
      } else {
        const { variationCode, operator: op, smartcardNo } = req.body;
        if (!variationCode || !op || !smartcardNo) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'variationCode, operator, and smartcardNo are required for cable-tv transactions.' });
        }

        const mappedPackage = mapCableTVPackageCode(variationCode);
        const requestId = generateRequestId();
        const customerPhone = phone || '08012345678';
        const url = `https://www.nellobytesystems.com/APICableTVV1.asp?UserID=${encodeURIComponent(ckUserId)}&APIKey=${encodeURIComponent(ckApiKey)}&CableTV=${encodeURIComponent(op.toLowerCase())}&Package=${encodeURIComponent(mappedPackage)}&SmartCardNo=${encodeURIComponent(smartcardNo)}&PhoneNo=${encodeURIComponent(customerPhone)}&RequestID=${requestId}`;

        try {
          const ckRes = await axios.get(url, { timeout: 20000 });
          const data = ckRes.data;

          const status = (data?.status || '').toUpperCase();
          if (status !== 'ORDER_COMPLETED' && status !== 'ORDER_RECEIVED') {
            console.error('ClubKonnect Cable TV transaction failure:', data);
            await client.query('ROLLBACK');
            return res.status(400).json({
              error: data?.status || 'Failed to process Cable TV subscription with ClubKonnect.'
            });
          }
        } catch (axiosErr) {
          console.error('ClubKonnect Cable TV API error:', axiosErr.response?.data || axiosErr.message);
          await client.query('ROLLBACK');
          return res.status(502).json({
            error: axiosErr.response?.data?.status || 'ClubKonnect gateway failed or timed out.'
          });
        }
      }
    }

    // Call live ClubKonnect API for Airtime purchases
    if (type === 'airtime') {
      const ckUserId = process.env.CLUBKONNECT_USER_ID;
      const ckApiKey = process.env.CLUBKONNECT_API_KEY;
      const isCkPlaceholder = !ckUserId || ckUserId === 'your_clubkonnect_user_id_here' || !ckApiKey || ckApiKey === 'your_clubkonnect_api_key_here';

      if (isCkPlaceholder) {
        console.log('ℹ️ [ClubKonnect] Running in Demo Mode (No ClubKonnect keys configured. Simulating airtime transaction success locally).');
      } else {
        const mappedNetwork = mapNetworkCode(operator);
        if (!mappedNetwork) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: `Unsupported network operator: ${operator}` });
        }

        const requestId = generateRequestId();
        const url = `https://www.nellobytesystems.com/APIAirtimeV1.asp?UserID=${encodeURIComponent(ckUserId)}&APIKey=${encodeURIComponent(ckApiKey)}&MobileNetwork=${mappedNetwork}&Amount=${amount}&MobileNumber=${phone}&RequestID=${requestId}`;

        try {
          const ckRes = await axios.get(url, { timeout: 20000 });
          const data = ckRes.data;

          const status = (data?.status || '').toUpperCase();
          if (status !== 'ORDER_COMPLETED' && status !== 'ORDER_RECEIVED') {
            console.error('ClubKonnect transaction failure:', data);
            await client.query('ROLLBACK');
            return res.status(400).json({
              error: data?.status || 'Failed to process airtime purchase with ClubKonnect.'
            });
          }
        } catch (axiosErr) {
          console.error('ClubKonnect API error:', axiosErr.response?.data || axiosErr.message);
          await client.query('ROLLBACK');
          return res.status(502).json({
            error: axiosErr.response?.data?.status || 'ClubKonnect gateway failed or timed out.'
          });
        }
      }
    }

    // Call live ClubKonnect API for Data bundle purchases
    if (type === 'data') {
      const ckUserId = process.env.CLUBKONNECT_USER_ID;
      const ckApiKey = process.env.CLUBKONNECT_API_KEY;
      const isCkPlaceholder = !ckUserId || ckUserId === 'your_clubkonnect_user_id_here' || !ckApiKey || ckApiKey === 'your_clubkonnect_api_key_here';

      if (isCkPlaceholder) {
        console.log('ℹ️ [ClubKonnect] Running in Demo Mode (No ClubKonnect keys configured. Simulating data bundle transaction success locally).');
      } else {
        const mappedNetwork = mapNetworkCode(operator);
        if (!mappedNetwork) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: `Unsupported network operator: ${operator}` });
        }

        const mappedPlan = mapDataPlanCode(mappedNetwork, planId);
        const requestId = generateRequestId();
        const url = `https://www.nellobytesystems.com/APIDatabundleV1.asp?UserID=${encodeURIComponent(ckUserId)}&APIKey=${encodeURIComponent(ckApiKey)}&MobileNetwork=${mappedNetwork}&DataPlan=${mappedPlan}&MobileNumber=${phone}&RequestID=${requestId}`;

        try {
          const ckRes = await axios.get(url, { timeout: 20000 });
          const data = ckRes.data;

          const status = (data?.status || '').toUpperCase();
          if (status !== 'ORDER_COMPLETED' && status !== 'ORDER_RECEIVED') {
            console.error('ClubKonnect data bundle transaction failure:', data);
            await client.query('ROLLBACK');
            return res.status(400).json({
              error: data?.status || 'Failed to process data bundle purchase with ClubKonnect.'
            });
          }
        } catch (axiosErr) {
          console.error('ClubKonnect data bundle API error:', axiosErr.response?.data || axiosErr.message);
          await client.query('ROLLBACK');
          return res.status(502).json({
            error: axiosErr.response?.data?.status || 'ClubKonnect gateway failed or timed out.'
          });
        }
      }
    }

    // Call live ClubKonnect API for Electricity payments
    if (type === 'electricity') {
      const ckUserId = process.env.CLUBKONNECT_USER_ID;
      const ckApiKey = process.env.CLUBKONNECT_API_KEY;
      const isCkPlaceholder = !ckUserId || ckUserId === 'your_clubkonnect_user_id_here' || !ckApiKey || ckApiKey === 'your_clubkonnect_api_key_here';

      if (isCkPlaceholder) {
        console.log('ℹ️ [ClubKonnect] Running in Demo Mode (No ClubKonnect keys configured. Simulating electricity payment success locally).');
        if (meterType === 'prepaid') {
          finalToken = Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000)).join('-');
        }
      } else {
        if (!meterNumber || !operator || !meterType) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'meterNumber, operator (DisCo), and meterType are required for electricity transactions.' });
        }

        const mappedCompany = mapElectricCompanyCode(operator);
        const mappedMeterType = mapMeterType(meterType);
        const requestId = generateRequestId();
        const customerPhone = phone || '08012345678';
        const url = `https://www.nellobytesystems.com/APIElectricityV1.asp?UserID=${encodeURIComponent(ckUserId)}&APIKey=${encodeURIComponent(ckApiKey)}&ElectricCompany=${mappedCompany}&MeterType=${mappedMeterType}&MeterNo=${encodeURIComponent(meterNumber)}&Amount=${amount}&PhoneNo=${encodeURIComponent(customerPhone)}&RequestID=${requestId}`;

        try {
          const ckRes = await axios.get(url, { timeout: 20000 });
          const data = ckRes.data;

          const status = (data?.status || '').toUpperCase();
          if (status !== 'ORDER_COMPLETED' && status !== 'ORDER_RECEIVED') {
            console.error('ClubKonnect electricity transaction failure:', data);
            await client.query('ROLLBACK');
            return res.status(400).json({
              error: data?.status || 'Failed to process electricity payment with ClubKonnect.'
            });
          }

          if (meterType === 'prepaid') {
            finalToken = data.token || data.meter_token || data.token_code || null;
            if (!finalToken && data.status) {
              const tokenMatch = data.status.match(/\b\d{4}-\d{4}-\d{4}-\d{4}-\d{4}\b/) || data.status.match(/\b\d{20}\b/);
              if (tokenMatch) {
                finalToken = tokenMatch[0];
              }
            }
          }
        } catch (axiosErr) {
          console.error('ClubKonnect electricity API error:', axiosErr.response?.data || axiosErr.message);
          await client.query('ROLLBACK');
          return res.status(502).json({
            error: axiosErr.response?.data?.status || 'ClubKonnect gateway failed or timed out.'
          });
        }
      }
    }

    // Deduct wallet balance
    const updatedUserRes = await client.query(
      'UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2 RETURNING wallet_balance',
      [amount, req.userId]
    );

    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const reference = `TX-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create transaction record
    const txRes = await client.query(
      `INSERT INTO transactions (
        user_id, title, amount, type, status, date, reference,
        phone, operator, meter_number, customer_name, address, meter_type, token,
        smartcard_no, package_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        req.userId, title, amount, type, status, dateStr, reference,
        phone || null, operator || null, meterNumber || null, customerName || null, address || null, meterType || null, finalToken || null,
        smartcardNo || null, packageName || null,
      ]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      balance: parseFloat(updatedUserRes.rows[0].wallet_balance),
      transaction: formatTx(txRes.rows[0]),
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create transaction error:', err);
    return res.status(500).json({ error: 'Failed to process transaction.' });
  } finally {
    client.release();
  }
});

function formatTx(tx) {
  return {
    id: tx.id,
    title: tx.title,
    amount: parseFloat(tx.amount),
    type: tx.type,
    status: tx.status,
    date: tx.date,
    reference: tx.reference,
    phone: tx.phone,
    operator: tx.operator,
    meterNumber: tx.meter_number,
    customerName: tx.customer_name,
    address: tx.address,
    meterType: tx.meter_type,
    token: tx.token,
    smartcardNo: tx.smartcard_no,
    packageName: tx.package_name,
  };
}

function generateRequestId() {
  const now = new Date();
  const ngrTime = new Date(now.getTime() + (1 * 60 * 60 * 1000));
  const yyyy = ngrTime.getUTCFullYear();
  const mm = String(ngrTime.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(ngrTime.getUTCDate()).padStart(2, '0');
  const hh = String(ngrTime.getUTCHours()).padStart(2, '0');
  const min = String(ngrTime.getUTCMinutes()).padStart(2, '0');
  const datePrefix = `${yyyy}${mm}${dd}${hh}${min}`;
  const randomSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${datePrefix}${randomSuffix}`;
}

function mapNetworkCode(operatorName) {
  const name = (operatorName || '').toLowerCase().trim();
  if (name === 'mtn') return '01';
  if (name === 'glo') return '02';
  if (name === '9mobile' || name === 'etisalat') return '03';
  if (name === 'airtel') return '04';
  return null;
}

function mapDataPlanCode(networkCode, planId) {
  const plans = {
    '01': {
      plan1: '1000',
      plan2: '2000',
      plan3: '3000',
      plan4: '10000',
      plan5: '20000',
      plan6: '40000',
    },
    '02': {
      plan1: '1000',
      plan2: '2000',
      plan3: '3000',
      plan4: '10000',
      plan5: '20000',
      plan6: '40000',
    },
    '03': {
      plan1: '1000',
      plan2: '2000',
      plan3: '3000',
      plan4: '10000',
      plan5: '20000',
      plan6: '40000',
    },
    '04': {
      plan1: '1000',
      plan2: '2000',
      plan3: '3000',
      plan4: '10000',
      plan5: '20000',
      plan6: '40000',
    }
  };
  return plans[networkCode]?.[planId] || '1000';
}

function mapCableTVPackageCode(variationCode) {
  return (variationCode || '').toLowerCase().replace(/-/g, '').trim();
}

function mapElectricCompanyCode(discoId) {
  const code = (discoId || '').toLowerCase().trim();
  if (code === 'ekedc') return '01';
  if (code === 'ikedc') return '02';
  if (code === 'aedc') return '03';
  if (code === 'kedco') return '04';
  if (code === 'phed') return '05';
  if (code === 'ibedc') return '06';
  return '01'; // Default Eko
}

function mapMeterType(type) {
  const t = (type || '').toLowerCase().trim();
  if (t === 'prepaid') return '01';
  if (t === 'postpaid') return '02';
  return '01';
}

export default router;
