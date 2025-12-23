const cardService = require('../../src/services/cardService');
const Card = require('../../src/models/card.model');

jest.mock('../../src/models/card.model');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('cardService.listCards', () => {
  it('retourne la liste complète quand aucun filtre nest fourni (Core Functionality)', async () => {
    const expected = [{ name: 'Pikachu' }];
    const lean = jest.fn().mockResolvedValue(expected);
    Card.find.mockReturnValue({ lean });

    const result = await cardService.listCards();

    expect(Card.find).toHaveBeenCalledWith({});
    expect(result).toEqual(expected);
  });

  it('filtre correctement par type, rareté et tags (Input Validation)', async () => {
    const lean = jest.fn().mockResolvedValue([]);
    Card.find.mockReturnValue({ lean });

    await cardService.listCards({ type: 'Fire', rarity: 'Rare', tags: 'promo,starter' });

    expect(Card.find).toHaveBeenCalledWith({ type: 'Fire', rarity: 'Rare', tags: { $in: ['promo', 'starter'] } });
  });
});

describe('cardService.getCardByIdentifier', () => {
  const mockCard = { _id: '1', name: 'Bulbasaur' };

  beforeEach(() => {
    Card.findById = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(mockCard) });
    Card.findOne = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(mockCard) });
  });

  it('retourne une carte par ObjectId valide (Core Functionality)', async () => {
    const result = await cardService.getCardByIdentifier('507f1f77bcf86cd799439011');
    expect(Card.findById).toHaveBeenCalled();
    expect(result).toEqual(mockCard);
  });

  it('recherche par slug lorsque l identifiant nest pas un ObjectId (Core Functionality)', async () => {
    const result = await cardService.getCardByIdentifier('pikachu-v');
    expect(Card.findOne).toHaveBeenCalledWith({ slug: 'pikachu-v' });
    expect(result).toEqual(mockCard);
  });

  it('retourne null si aucun identifiant nest fourni (Input Validation)', async () => {
    const result = await cardService.getCardByIdentifier();
    expect(result).toBeNull();
  });
});

describe('cardService.createCard', () => {
  beforeEach(() => {
    Card.create = jest.fn().mockResolvedValue({
      toObject: () => ({
        _id: 'new-id',
        name: 'New Card',
        slug: 'new-card',
        tags: ['promo', 'starter'],
      }),
    });
  });

  it('génère un slug depuis le nom et normalise les tags (Core Functionality)', async () => {
    const payload = {
      name: 'New Card',
      series: 'Base',
      rarity: 'Rare',
      type: 'Fire',
      price: '12.5',
      stock: '7',
      description: 'Desc',
      imageUrl: 'https://example.com/card.jpg',
      tags: 'promo, starter',
      abilities: 'Thunderbolt, Quick Attack',
    };

    const result = await cardService.createCard(payload);

    expect(Card.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'new-card', tags: ['promo', 'starter'], price: 12.5, stock: 7 })
    );
    expect(result.slug).toBe('new-card');
  });

  it('rejette la création sans nom ni slug (Input Validation)', async () => {
    await expect(
      cardService.createCard({ series: 'Base', rarity: 'Common', type: 'Grass', price: 3, stock: 1, description: 'x', imageUrl: 'y' })
    ).rejects.toThrow(/nom/i);
  });
});

describe('cardService.deleteCard', () => {
  beforeEach(() => {
    Card.findOneAndDelete = jest.fn();
  });

  it('supprime une carte existante (Side Effects)', async () => {
    Card.findOneAndDelete.mockResolvedValue({ toObject: () => ({ _id: 'delete-id', slug: 'pikachu-v' }) });

    const result = await cardService.deleteCard('pikachu-v');

    expect(Card.findOneAndDelete).toHaveBeenCalledWith({ $or: [{ _id: 'pikachu-v' }, { slug: 'pikachu-v' }] });
    expect(result.slug).toBe('pikachu-v');
  });

  it('renvoie une erreur si la carte est absente (Error Handling)', async () => {
    Card.findOneAndDelete.mockResolvedValue(null);
    await expect(cardService.deleteCard('missing')).rejects.toThrow(/introuvable/i);
  });
});
