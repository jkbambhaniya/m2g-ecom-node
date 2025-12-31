const { Merchant, Notification } = require('../../models');
const { sign } = require('../../utils/jwt');

async function createMerchant(req, res) {
    const { name, email, password, shopName, phone } = req.body;
    try {
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ 
                error: 'Validation error',
                details: 'Name, email, and password are required'
            });
        }

        // Check if merchant already exists
        const existingMerchant = await Merchant.findOne({ where: { email } });
        if (existingMerchant) {
            return res.status(400).json({ 
                error: 'Validation error',
                details: 'Email already registered'
            });
        }

        const merchant = await Merchant.create({
            name,
            email,
            password,
            shopName: shopName || name,
            phone,
            isActive: false
        });

        // Create notification for admin
        try {
            await Notification.create({
                type: 'merchant_registration',
                message: `New merchant registered: ${shopName || name}`,
                data: { merchantId: merchant.id }
            });
        } catch (notifErr) {
            console.warn('Failed to create notification:', notifErr.message);
            // Continue anyway, notification is not critical
        }

        res.json({
            message: 'Registration successful. Please wait for admin approval.',
            merchant: { 
                id: merchant.id, 
                name: merchant.name, 
                email: merchant.email, 
                shopName: merchant.shopName, 
                image: merchant.image 
            }
        });
    } catch (err) {
        console.error('Merchant registration error:', err);
        res.status(400).json({ 
            error: 'Validation error',
            details: err.message
        });
    }
}

async function loginMerchant(req, res) {
    const { email, password } = req.body;
    try {
        const merchant = await Merchant.findOne({ where: { email } });
        if (!merchant) return res.status(400).json({ message: 'Invalid credentials' });

        const ok = await merchant.comparePassword(password);
        if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

        if (!merchant.isActive) return res.status(403).json({ message: 'Your account is pending approval' });

        const token = sign({ id: merchant.id, email: merchant.email, type: 'merchant' });
        res.json({ merchant: { id: merchant.id, name: merchant.name, email: merchant.email, shopName: merchant.shopName, image: merchant.image }, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getProfile(req, res) {
    try {
        const merchant = await Merchant.findByPk(req.merchant.id, {
            attributes: ['id', 'name', 'email', 'shopName', 'phone', 'isActive', 'image', 'createdAt']
        });
        if (!merchant) return res.status(404).json({ message: 'Merchant not found' });
        res.json(merchant);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateProfile(req, res) {
    const { name, email, password, shopName, phone } = req.body;
    try {
        const merchant = await Merchant.findByPk(req.merchant.id);
        if (!merchant) return res.status(404).json({ message: 'Merchant not found' });

        if (name) merchant.name = name;
        if (email) merchant.email = email;
        if (shopName) merchant.shopName = shopName;
        if (phone) merchant.phone = phone;
        if (password) merchant.password = password;
        if (req.file) {
            merchant.image = `/uploads/merchants/${req.file.filename}`;
        }

        await merchant.save();

        const updatedMerchant = merchant.toJSON();
        delete updatedMerchant.password;

        res.json({ message: 'Profile updated successfully', merchant: updatedMerchant });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = { createMerchant, loginMerchant, getProfile, updateProfile };
