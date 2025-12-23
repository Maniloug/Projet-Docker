const { isValidObjectId } = require('mongoose');
const Card = require('../models/card.model');

function createServiceError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeTags(tagsInput) {
  if (Array.isArray(tagsInput)) {
    return tagsInput.map((tag) => tag.trim()).filter(Boolean);
  }
  if (typeof tagsInput === 'string') {
    return tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

function slugify(value = '') {
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeAbilities(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => entry.trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return undefined;
}

function buildMetadata(payload = {}) {
  const source = payload.metadata || {};
  const hp = source.hp ?? payload.hp;
  const weakness = source.weakness ?? payload.weakness;
  const abilities = normalizeAbilities(source.abilities ?? payload.abilities);

  const metadata = {};
  if (hp !== undefined && hp !== null && hp !== '') {
    metadata.hp = Number(hp);
  }
  if (weakness) {
    metadata.weakness = weakness;
  }
  if (abilities && abilities.length) {
    metadata.abilities = abilities;
  }

  return metadata;
}

function buildCardQuery(filters = {}) {
  const query = {};
  if (filters.type) {
    query.type = filters.type;
  }
  if (filters.rarity) {
    query.rarity = filters.rarity;
  }
  if (filters.series) {
    query.series = filters.series;
  }

  const tags = Array.isArray(filters.tags)
    ? filters.tags
    : typeof filters.tags === 'string'
    ? filters.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    : [];
  if (tags.length) {
    query.tags = { $in: tags };
  }

  if (filters.search) {
    query.name = { $regex: filters.search, $options: 'i' };
  }

  return query;
}

async function listCards(filters = {}) {
  const query = buildCardQuery(filters);
  return Card.find(query).lean();
}

async function getCardByIdentifier(identifier) {
  if (!identifier) {
    return null;
  }

  if (isValidObjectId(identifier)) {
    return Card.findById(identifier).lean();
  }

  return Card.findOne({ slug: identifier.toString().toLowerCase() }).lean();
}

async function createCard(payload = {}) {
  const slugSource = payload.slug || payload.name;
  const slug = slugify(slugSource);
  if (!slug) {
    throw createServiceError('Le nom ou le slug de la carte est requis');
  }

  const cardData = {
    name: payload.name,
    slug,
    series: payload.series,
    rarity: payload.rarity,
    type: payload.type,
    price: payload.price !== undefined ? Number(payload.price) : payload.price,
    stock: payload.stock !== undefined ? Number(payload.stock) : payload.stock,
    description: payload.description,
    imageUrl: payload.imageUrl,
    tags: normalizeTags(payload.tags),
    metadata: buildMetadata(payload),
  };

  const card = await Card.create(cardData);
  return card.toObject();
}

async function deleteCard(identifier) {
  const card = await Card.findOneAndDelete({
    $or: [{ _id: identifier }, { slug: identifier }],
  });
  if (!card) {
    throw createServiceError('Carte introuvable', 404);
  }
  return card.toObject();
}

module.exports = {
  listCards,
  getCardByIdentifier,
  createCard,
  deleteCard,
};
