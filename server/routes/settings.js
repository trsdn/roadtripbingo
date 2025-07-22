import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function settingsRoutes(fastify, options) {
  // Get all settings
  fastify.get('/', {
    handler: async (request, reply) => {
      const settings = await prisma.setting.findMany();
      const settingsObj = {};
      settings.forEach(setting => {
        settingsObj[setting.key] = setting.value;
      });
      return settingsObj;
    }
  });

  // Get setting by key
  fastify.get('/:key', {
    schema: {
      params: {
        type: 'object',
        properties: {
          key: { type: 'string' }
        },
        required: ['key']
      }
    },
    handler: async (request, reply) => {
      const { key } = request.params;
      const setting = await prisma.setting.findUnique({
        where: { key }
      });
      
      if (!setting) {
        return reply.code(404).send({ error: 'Setting not found' });
      }
      
      return { [key]: setting.value };
    }
  });

  // Set setting
  fastify.post('/:key', {
    schema: {
      params: {
        type: 'object',
        properties: {
          key: { type: 'string' }
        },
        required: ['key']
      },
      body: {
        type: 'object',
        properties: {
          value: { type: 'string' }
        },
        required: ['value']
      }
    },
    handler: async (request, reply) => {
      const { key } = request.params;
      const { value } = request.body;
      
      const setting = await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
      
      return { [key]: setting.value };
    }
  });

  // Delete setting
  fastify.delete('/:key', {
    schema: {
      params: {
        type: 'object',
        properties: {
          key: { type: 'string' }
        },
        required: ['key']
      }
    },
    handler: async (request, reply) => {
      const { key } = request.params;
      
      try {
        await prisma.setting.delete({
          where: { key }
        });
        
        return reply.code(204).send();
      } catch (error) {
        if (error.code === 'P2025') {
          return reply.code(404).send({ error: 'Setting not found' });
        }
        throw error;
      }
    }
  });
}

export default settingsRoutes;