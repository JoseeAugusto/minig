import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { CommentReactionController } from '../controllers/comment-reaction.controller'
import {
  getCommentReactionsSchema,
  getCommentReactionByIdSchema,
  getCommentReactionsByUserIdSchema,
  getCommentReactionsByCommentIdSchema,
  createCommentReactionSchema,
  deleteCommentReactionSchema,
} from '../docs/swagger/schemas/comment-reaction.schema'
import { authenticate } from '../middlewares/auth.middleware'

const CommentReactionRoutes = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: any,
) => {
  const optionsWithAuth = {
    ...options,
    preValidation: authenticate,
  }

  const optionsWithSchema = {
    getCommentReactions: {
      ...optionsWithAuth,
      schema: getCommentReactionsSchema,
    },
    getCommentReactionById: {
      ...optionsWithAuth,
      schema: getCommentReactionByIdSchema,
    },
    getCommentReactionsByUserId: {
      ...optionsWithAuth,
      schema: getCommentReactionsByUserIdSchema,
    },
    getCommentReactionsByCommentId: {
      ...optionsWithAuth,
      schema: getCommentReactionsByCommentIdSchema,
    },
    create: {
      ...optionsWithAuth,
      schema: createCommentReactionSchema,
    },
    delete: {
      ...optionsWithAuth,
      schema: deleteCommentReactionSchema,
    },
  }

  fastify.get(
    '/comment-reactions',
    optionsWithSchema.getCommentReactions,
    CommentReactionController.getCommentReactions,
  )
  fastify.get(
    '/comment-reactions/:id',
    optionsWithSchema.getCommentReactionById,
    CommentReactionController.getCommentReactionById,
  )
  fastify.get(
    '/comment-reactions/user/:id',
    optionsWithSchema.getCommentReactionsByUserId,
    CommentReactionController.getCommentReactionsByUserId,
  )
  fastify.get(
    '/comment-reactions/comment/:id',
    optionsWithSchema.getCommentReactionsByCommentId,
    CommentReactionController.getCommentReactionsByCommentId,
  )
  fastify.post(
    '/comment-reactions',
    optionsWithSchema.create,
    CommentReactionController.createCommentReaction,
  )
  fastify.delete(
    '/comment-reactions/:id',
    optionsWithSchema.delete,
    CommentReactionController.deleteCommentReaction,
  )

  done()
}

export { CommentReactionRoutes }
