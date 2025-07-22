import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function iconSetRoutes(fastify, options) {
  // Get all icon sets
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
              description: { type: 'string' },
              color: { type: 'string' },
              iconCount: { type: 'number' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          }
        }
      }
    },
    handler: async (request, reply) => {
      const iconSets = await prisma.iconSet.findMany({
        include: {
          _count: {
            select: { icons: true }
          }
        },
        orderBy: { name: 'asc' }
      });
      
      return iconSets.map(set => ({
        ...set,
        iconCount: set._count.icons
      }));
    }
  });

  // Get icon set with icons
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
      
      const iconSet = await prisma.iconSet.findUnique({
        where: { id },
        include: {
          icons: {
            include: {
              icon: true
            },
            orderBy: { order: 'asc' }
          }
        }
      });
      
      if (!iconSet) {
        return reply.code(404).send({ error: 'Icon set not found' });
      }
      
      // Format the response with parsed JSON fields
      return {
        ...iconSet,
        icons: iconSet.icons.map(item => ({
          ...item.icon,
          tags: JSON.parse(item.icon.tags || '[]'),
          translations: JSON.parse(item.icon.translations || '{}'),
          order: item.order
        }))
      };
    }
  });

  // Create new icon set
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          color: { type: 'string' },
          iconIds: { type: 'array', items: { type: 'string' } }
        },
        required: ['name']
      }
    },
    handler: async (request, reply) => {
      const { name, description = '', color = '#3B82F6', iconIds = [] } = request.body;
      
      const iconSet = await prisma.iconSet.create({
        data: {
          name,
          description,
          color,
          icons: {
            create: iconIds.map((iconId, index) => ({
              iconId,
              order: index
            }))
          }
        },
        include: {
          _count: {
            select: { icons: true }
          }
        }
      });
      
      return reply.code(201).send({
        ...iconSet,
        iconCount: iconSet._count.icons
      });
    }
  });

  // Update icon set
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
          description: { type: 'string' },
          color: { type: 'string' }
        }
      }
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      
      try {
        const iconSet = await prisma.iconSet.update({
          where: { id },
          data: request.body
        });
        
        return iconSet;
      } catch (error) {
        if (error.code === 'P2025') {
          return reply.code(404).send({ error: 'Icon set not found' });
        }
        throw error;
      }
    }
  });

  // Update icons in set
  fastify.put('/:id/icons', {
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
          iconIds: { type: 'array', items: { type: 'string' } }
        },
        required: ['iconIds']
      }
    },
    handler: async (request, reply) => {
      const { id } = request.params;
      const { iconIds } = request.body;
      
      // Delete existing icon associations
      await prisma.iconSetIcon.deleteMany({
        where: { iconSetId: id }
      });
      
      // Create new associations
      await prisma.iconSetIcon.createMany({
        data: iconIds.map((iconId, index) => ({
          iconSetId: id,
          iconId,
          order: index
        }))
      });
      
      // Return updated icon set
      const iconSet = await prisma.iconSet.findUnique({
        where: { id },
        include: {
          _count: {
            select: { icons: true }
          }
        }
      });
      
      return {
        ...iconSet,
        iconCount: iconSet._count.icons
      };
    }
  });

  // Delete icon set
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
        await prisma.iconSet.delete({
          where: { id }
        });
        
        return reply.code(204).send();
      } catch (error) {
        if (error.code === 'P2025') {
          return reply.code(404).send({ error: 'Icon set not found' });
        }
        throw error;
      }
    }
  });
}

export default iconSetRoutes;