const db = require('../../models');

// List all attributes with their values
async function list(req, res) {
	try {
		const attributes = await db.Attribute.findAll({
			include: [{ model: db.AttributeValue, as: 'values' }]
		});
		res.json(attributes);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
}

// Create a new attribute
async function create(req, res) {
	try {
		const { name, values } = req.body; // values: ['Red', 'Blue']
		
		if (!name) return res.status(400).json({ error: 'Attribute name is required' });

		const attribute = await db.Attribute.create({ name });

		if (values && Array.isArray(values)) {
			const valueObjects = values.map(v => ({ attribute_id: attribute.id, value: v }));
			await db.AttributeValue.bulkCreate(valueObjects);
		}

		const created = await db.Attribute.findByPk(attribute.id, {
			include: [{ model: db.AttributeValue, as: 'values' }]
		});

		res.status(201).json(created);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
}

// Add value to attribute
async function addValue(req, res) {
	try {
		const { id } = req.params;
		const { value } = req.body;

		if (!value) return res.status(400).json({ error: 'Value is required' });

		const newValue = await db.AttributeValue.create({
			attribute_id: id,
			value
		});

		res.status(201).json(newValue);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
}

module.exports = { list, create, addValue };
