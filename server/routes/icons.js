import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function iconRoutes(fastify, options) {
  // Get all icons
  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              nameDE: { type: 'string' },
              translations: { type: 'object' },
              data: { type: 'string' },
              difficulty: { type: 'number' },
              tags: { type: 'array', items: { type: 'string' } },
              excludeFromMultiHit: { type: 'boolean' },
              altText: { type: 'string' },
              category: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          }
        }
      }
    },
    handler: async (request, reply) => {
      const icons = await prisma.icon.findMany({
        orderBy: { createdAt: 'desc' }
      });
      
      // Parse JSON fields for each icon
      return icons.map(icon => ({
        ...icon,
        tags: JSON.parse(icon.tags || '[]'),
        translations: JSON.parse(icon.translations || '{}')
      }));
    }
  });

  // Get icon by ID
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
      const icon = await prisma.icon.findUnique({
        where: { id }
      });
      
      if (!icon) {
        return reply.code(404).send({ error: 'Icon not found' });
      }
      
      return {
        ...icon,
        tags: JSON.parse(icon.tags || '[]')
      };
    }
  });

  // Create new icon
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          nameDE: { type: 'string' },
          translations: { type: 'object' },
          data: { type: 'string' },
          difficulty: { type: 'number' },
          tags: { type: 'array', items: { type: 'string' } },
          excludeFromMultiHit: { type: 'boolean' },
          altText: { type: 'string' },
          category: { type: 'string' }
        },
        required: ['name', 'data']
      }
    },
    handler: async (request, reply) => {
      const { translations, tags, ...rest } = request.body;
      
      const icon = await prisma.icon.create({
        data: {
          ...rest,
          tags: JSON.stringify(tags || []),
          translations: JSON.stringify(translations || {})
        }
      });
      
      return reply.code(201).send({
        ...icon,
        tags: JSON.parse(icon.tags || '[]'),
        translations: JSON.parse(icon.translations || '{}')
      });
    }
  });

  // Update icon
  fastify.put('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          nameDE: { type: 'string' },
          translations: { type: 'object' },
          difficulty: { type: 'number' },
          tags: { type: 'array', items: { type: 'string' } },
          excludeFromMultiHit: { type: 'boolean' },
          altText: { type: 'string' },
          category: { type: 'string' }
        }
      }
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      
      try {
        const updateData = { ...request.body };
        if (updateData.tags) {
          updateData.tags = JSON.stringify(updateData.tags);
        }
        if (updateData.translations) {
          updateData.translations = JSON.stringify(updateData.translations);
        }
        
        const icon = await prisma.icon.update({
          where: { id },
          data: updateData
        });
        
        return {
          ...icon,
          tags: JSON.parse(icon.tags || '[]'),
          translations: JSON.parse(icon.translations || '{}')
        };
      } catch (error) {
        if (error.code === 'P2025') {
          return reply.code(404).send({ error: 'Icon not found' });
        }
        throw error;
      }
    }
  });

  // Delete icon
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
        await prisma.icon.delete({
          where: { id }
        });
        
        return reply.code(204).send();
      } catch (error) {
        if (error.code === 'P2025') {
          return reply.code(404).send({ error: 'Icon not found' });
        }
        throw error;
      }
    }
  });
}

export default iconRoutes;