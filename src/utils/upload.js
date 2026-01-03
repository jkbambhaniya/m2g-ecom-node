const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = 'public/uploads';
        if (file.fieldname === 'image' || file.fieldname === 'gallery') {
            if (req.originalUrl.includes('hero')) dir = 'public/uploads/hero';
            else if (req.originalUrl.includes('products')) {
                // For product updates, store in product-specific folder
                if (req.method === 'PUT' && req.params && req.params.id) {
                    dir = `public/uploads/products/${req.params.id}`;
                } else {
                    // For creation, store temporarily
                    dir = 'public/uploads/products/temp';
                }
            }
            else if (req.originalUrl.includes('categories')) dir = 'public/uploads/categories';
            else if (req.originalUrl.includes('merchant')) dir = 'public/uploads/merchants';
        } else if (file.fieldname.startsWith('variants[') && file.fieldname.endsWith('][image]')) {
            // Variant image upload
            if (req.method === 'PUT' && req.params && req.params.id) {
                // For updates, store directly in product variants folder
                dir = `public/uploads/products/${req.params.id}/variants`;
            } else {
                // For creation, store temporarily
                dir = 'public/uploads/products/variants/temp';
            }
        }

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'));
    }
});

module.exports = upload;
