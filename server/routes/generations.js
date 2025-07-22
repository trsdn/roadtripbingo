import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generationsRoutes(fastify, options) {
  // Get all card generations
  fastify.get('/', {
    handler: async (request, reply) => {
      const generations = await prisma.cardGeneration.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50 // Limit to last 50 generations
      });
      
      return generations.map(gen => ({
        ...gen,
        settings: JSON.parse(gen.settings),
        cards: JSON.parse(gen.cards)
      }));
    }
  });

  // Create new card generation record
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          gridSize: { type: 'number' },
          settings: { type: 'object' },
          cards: { type: 'array' }
        },
        required: ['title', 'gridSize', 'settings', 'cards']
      }
    },
    handler: async (request, reply) => {
      const { title, gridSize, settings, cards } = request.body;
      
      const generation = await prisma.cardGeneration.create({
        data: {
          title,
          gridSize,
          settings: JSON.stringify(settings),
          cards: JSON.stringify(cards)
        }
      });
      
      return reply.code(201).send({
        ...generation,
        settings: JSON.parse(generation.settings),
        cards: JSON.parse(generation.cards)
      });
    }
  });

  // Get generation by ID
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      const generation = await prisma.cardGeneration.findUnique({
        where: { id }
      });
      
      if (!generation) {
        return reply.code(404).send({ error: 'Generation not found' });
      }
      
      return {
        ...generation,
        settings: JSON.parse(generation.settings),
        cards: JSON.parse(generation.cards)
      };
    }
  });

  // Delete generation
  fastify.delete('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      
      try {
        await prisma.cardGeneration.delete({
          where: { id }
        });
        
        return reply.code(204).send();
      } catch (error) {
        if (error.code === 'P2025') {
          return reply.code(404).send({ error: 'Generation not found' });
        }
        throw error;
      }
    }
  });
}

export default generationsRoutes;