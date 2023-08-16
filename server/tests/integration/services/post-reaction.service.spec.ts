import { instantiatedPostReactionService } from '../../../src/factories/post-reaction.factory'
import { prisma } from '../../../src/lib/prisma'
import { MemoryImageRepository } from '../../../src/repositories/implementations/memory/image.repository'
import {
  clearPostReactionsMemory,
  MemoryPostReactionRepository,
} from '../../../src/repositories/implementations/memory/post-reaction.repository'
import { MemoryPostRepository } from '../../../src/repositories/implementations/memory/post.repository'
import { MemoryUserRepository } from '../../../src/repositories/implementations/memory/user.repository'
import { PrismaImageRepository } from '../../../src/repositories/implementations/prisma/image.repository'
import {
  clearPostReactionsPrisma,
  PrismaPostReactionRepository,
} from '../../../src/repositories/implementations/prisma/post-reaction.repository'
import { PrismaPostRepository } from '../../../src/repositories/implementations/prisma/post.repository'
import { PrismaUserRepository } from '../../../src/repositories/implementations/prisma/user.repository'

describe('MemoryPostReactionService', () => {
  const service = instantiatedPostReactionService(
    MemoryPostReactionRepository,
    MemoryUserRepository,
    MemoryPostRepository,
  )

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  let userId: string
  let imageId: string
  let postId: string

  beforeAll(async () => {
    const user = await MemoryUserRepository.createUser({
      username: 'test',
      email: 'test@mail.com',
      fullName: 'User Test',
      password: '123456',
    })

    userId = user.id

    const image = await MemoryImageRepository.createImage({
      url: 'https://github.com/JoseeAugusto.png',
      userId,
    })

    imageId = image.id

    const post = await MemoryPostRepository.createPost({
      subtitle: 'Post Test',
      userId,
      imageId,
    })

    postId = post.id
  })

  afterEach(async () => {
    await clearPostReactionsMemory()
  })

  describe('create', () => {
    it('should create a post reaction', async () => {
      const postReaction = await service.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      expect(postReaction.ok).toBeTruthy()
      expect(postReaction.message).toBe('Post reaction created successfully')
      expect(postReaction.payload).toStrictEqual({
        id: expect.any(String),
        type: 'like',
        userId,
        postId,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    })

    it('should not create a post reaction if user does not exist', async () => {
      const postReaction = await service.createPostReaction({
        type: 'like',
        userId: 'invalid-user-id',
        postId,
      })

      expect(postReaction.ok).toBeFalsy()
      expect(postReaction.message).toContain('User')
      expect(postReaction.message).toContain('not found')
      expect(postReaction.payload).toBeUndefined()
    })

    it('should not create a post reaction if post does not exist', async () => {
      const postReaction = await service.createPostReaction({
        type: 'like',
        userId,
        postId: 'invalid-post-id',
      })

      expect(postReaction.ok).toBeFalsy()
      expect(postReaction.message).toContain('Post')
      expect(postReaction.message).toContain('not found')
      expect(postReaction.payload).toBeUndefined()
    })
  })

  describe('get', () => {
    it('should get a post reaction', async () => {
      const postReaction =
        await MemoryPostReactionRepository.createPostReaction({
          type: 'like',
          userId,
          postId,
        })

      const foundPostReaction = await service.getPostReactionById(
        postReaction.id,
      )

      expect(foundPostReaction.ok).toBeTruthy()
      expect(foundPostReaction.message).toBe('Post reaction found successfully')
      expect(foundPostReaction.payload).toStrictEqual({
        id: postReaction.id,
        type: 'like',
        userId,
        postId,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    })

    it('should not get a post reaction if it does not exist', async () => {
      const foundPostReaction = await service.getPostReactionById(
        'invalid-post-reaction-id',
      )

      expect(foundPostReaction.ok).toBeFalsy()
      expect(foundPostReaction.message).toContain('Post reaction')
      expect(foundPostReaction.message).toContain('not found')
      expect(foundPostReaction.payload).toBeUndefined()
    })

    it('should get all post reactions', async () => {
      await MemoryPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      await MemoryPostReactionRepository.createPostReaction({
        type: 'dislike',
        userId,
        postId,
      })

      await MemoryPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      const foundPostReactions = await service.getPostReactions()

      expect(foundPostReactions.ok).toBeTruthy()
      expect(foundPostReactions.message).toBe(
        'Post reactions found successfully',
      )
      expect(foundPostReactions.payload).toHaveLength(3)
      expect(foundPostReactions.payload).toStrictEqual([
        {
          id: expect.any(String),
          type: 'like',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          type: 'dislike',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          type: 'like',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])
    })

    it('should get all post reactions with type like', async () => {
      await MemoryPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      await MemoryPostReactionRepository.createPostReaction({
        type: 'dislike',
        userId,
        postId,
      })

      await MemoryPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      const foundPostReactions = await service.getPostReactions('like')

      expect(foundPostReactions.ok).toBeTruthy()
      expect(foundPostReactions.message).toBe(
        'Post reactions found successfully',
      )
      expect(foundPostReactions.payload).toHaveLength(2)
      expect(foundPostReactions.payload).toStrictEqual([
        {
          id: expect.any(String),
          type: 'like',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          type: 'like',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])
    })

    it('should get two post reactions when try to get all post reactions with take 2', async () => {
      await MemoryPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      await MemoryPostReactionRepository.createPostReaction({
        type: 'dislike',
        userId,
        postId,
      })

      await MemoryPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      const foundPostReactions = await service.getPostReactions(undefined, 2)

      expect(foundPostReactions.ok).toBeTruthy()
      expect(foundPostReactions.message).toBe(
        'Post reactions found successfully',
      )
      expect(foundPostReactions.payload).toHaveLength(2)
      expect(foundPostReactions.payload).toStrictEqual([
        {
          id: expect.any(String),
          type: 'like',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          type: 'dislike',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])
    })

    it('should get one post reaction when try to get all post reactions with take 1 and skip 1', async () => {
      await MemoryPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      await MemoryPostReactionRepository.createPostReaction({
        type: 'dislike',
        userId,
        postId,
      })

      await MemoryPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      const foundPostReactions = await service.getPostReactions(undefined, 1, 1)

      expect(foundPostReactions.ok).toBeTruthy()
      expect(foundPostReactions.message).toBe(
        'Post reactions found successfully',
      )
      expect(foundPostReactions.payload).toHaveLength(1)
      expect(foundPostReactions.payload).toStrictEqual([
        {
          id: expect.any(String),
          type: 'dislike',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])
    })

    it('should get all post reactions from a post', async () => {
      await MemoryPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      await MemoryPostReactionRepository.createPostReaction({
        type: 'dislike',
        userId,
        postId,
      })

      await MemoryPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      const foundPostReactions = await service.getPostReactionsByPostId(postId)

      expect(foundPostReactions.ok).toBeTruthy()
      expect(foundPostReactions.message).toBe(
        'Post reactions found successfully',
      )
      expect(foundPostReactions.payload).toHaveLength(3)
      expect(foundPostReactions.payload).toStrictEqual([
        {
          id: expect.any(String),
          type: 'like',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          type: 'dislike',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          type: 'like',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])
    })

    it('should get all post reactions from a user', async () => {
      await MemoryPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      await MemoryPostReactionRepository.createPostReaction({
        type: 'dislike',
        userId,
        postId,
      })

      await MemoryPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      const foundPostReactions = await service.getPostReactionsByUserId(userId)

      expect(foundPostReactions.ok).toBeTruthy()
      expect(foundPostReactions.message).toBe(
        'Post reactions found successfully',
      )
      expect(foundPostReactions.payload).toHaveLength(3)
      expect(foundPostReactions.payload).toStrictEqual([
        {
          id: expect.any(String),
          type: 'like',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          type: 'dislike',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          type: 'like',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])
    })

    it('should return an empty array when try to get all post reactions from a post that does not have any', async () => {
      const foundPostReactions = await service.getPostReactionsByPostId(postId)

      expect(foundPostReactions.ok).toBeTruthy()
      expect(foundPostReactions.message).toBe(
        'Post reactions found successfully',
      )
      expect(foundPostReactions.payload).toHaveLength(0)
      expect(foundPostReactions.payload).toStrictEqual([])
    })
  })

  describe('delete', () => {
    it('should delete a post reaction', async () => {
      const createdPostReaction =
        await MemoryPostReactionRepository.createPostReaction({
          type: 'like',
          userId,
          postId,
        })

      const deletedPostReaction = await service.deletePostReaction(
        createdPostReaction.id,
      )

      expect(deletedPostReaction.ok).toBeTruthy()
      expect(deletedPostReaction.message).toBe(
        'Post reaction deleted successfully',
      )
      expect(deletedPostReaction.payload).toBeUndefined()
    })

    it('should return an error when try to delete a post reaction that does not exist', async () => {
      const deletedPostReaction = await service.deletePostReaction(
        'non-existing-post-reaction-id',
      )

      expect(deletedPostReaction.ok).toBeFalsy()
      expect(deletedPostReaction.message).toContain('Post reaction')
      expect(deletedPostReaction.message).toContain('not found')
      expect(deletedPostReaction.payload).toBeUndefined()
    })
  })
})

describe('PrismaPostReactionService', () => {
  const service = instantiatedPostReactionService(
    PrismaPostReactionRepository,
    PrismaUserRepository,
    PrismaPostRepository,
  )
  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  let userId: string
  let imageId: string
  let postId: string

  beforeAll(async () => {
    await prisma.post.deleteMany()
    await prisma.image.deleteMany()
    await prisma.user.deleteMany()

    const { id: userIdCreated } = await PrismaUserRepository.createUser({
      username: 'test',
      email: 'test@mail.com',
      fullName: 'Test User',
      password: '123456',
    })

    userId = userIdCreated

    const { id: imageIdCreated } = await PrismaImageRepository.createImage({
      url: 'https://github.com/JoseeAugusto.png',
      userId,
    })

    imageId = imageIdCreated

    const { id: postIdCreated } = await PrismaPostRepository.createPost({
      subtitle: 'Post subtitle',
      userId,
      imageId,
    })

    postId = postIdCreated
  })

  afterAll(async () => {
    await prisma.post.deleteMany()
    await prisma.image.deleteMany()
    await prisma.user.deleteMany()
  })

  afterEach(async () => {
    await clearPostReactionsPrisma()
  })

  describe('create', () => {
    it('should create a post reaction', async () => {
      const createdPostReaction = await service.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      expect(createdPostReaction.ok).toBeTruthy()
      expect(createdPostReaction.message).toBe(
        'Post reaction created successfully',
      )
      expect(createdPostReaction.payload).toStrictEqual({
        id: expect.any(String),
        type: 'like',
        userId,
        postId,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    })

    it('should not create a post reaction when the user does not exist', async () => {
      const createdPostReaction = await service.createPostReaction({
        type: 'like',
        userId: 'non-existing-user-id',
        postId,
      })

      expect(createdPostReaction.ok).toBeFalsy()
      expect(createdPostReaction.message).toContain('User')
      expect(createdPostReaction.message).toContain('not found')
      expect(createdPostReaction.payload).toBeUndefined()
    })

    it('should not create a post reaction when the post does not exist', async () => {
      const createdPostReaction = await service.createPostReaction({
        type: 'like',
        userId,
        postId: 'non-existing-post-id',
      })

      expect(createdPostReaction.ok).toBeFalsy()
      expect(createdPostReaction.message).toContain('Post')
      expect(createdPostReaction.message).toContain('not found')
      expect(createdPostReaction.payload).toBeUndefined()
    })
  })

  describe('get', () => {
    it('should get a post reaction by id', async () => {
      const createdPostReaction =
        await PrismaPostReactionRepository.createPostReaction({
          type: 'like',
          userId,
          postId,
        })

      const foundPostReaction = await service.getPostReactionById(
        createdPostReaction.id,
      )

      expect(foundPostReaction.ok).toBeTruthy()
      expect(foundPostReaction.message).toBe('Post reaction found successfully')
      expect(foundPostReaction.payload).toStrictEqual({
        id: expect.any(String),
        type: 'like',
        userId,
        postId,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    })

    it('should return an error when try to get a post reaction that does not exist', async () => {
      const foundPostReaction = await service.getPostReactionById(
        'non-existing-post-reaction-id',
      )

      expect(foundPostReaction.ok).toBeFalsy()
      expect(foundPostReaction.message).toContain('Post reaction')
      expect(foundPostReaction.message).toContain('not found')
      expect(foundPostReaction.payload).toBeUndefined()
    })

    it('should get all post reactions from a post', async () => {
      await PrismaPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      await PrismaPostReactionRepository.createPostReaction({
        type: 'dislike',
        userId,
        postId,
      })

      await PrismaPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      const foundPostReactions = await service.getPostReactionsByPostId(postId)

      expect(foundPostReactions.ok).toBeTruthy()
      expect(foundPostReactions.message).toBe(
        'Post reactions found successfully',
      )
      expect(foundPostReactions.payload).toHaveLength(3)
      expect(foundPostReactions.payload).toStrictEqual([
        {
          id: expect.any(String),
          type: 'like',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          type: 'dislike',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          type: 'like',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])
    })

    it('should get all post reactions with type like', async () => {
      await PrismaPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      await PrismaPostReactionRepository.createPostReaction({
        type: 'dislike',
        userId,
        postId,
      })

      await PrismaPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      const foundPostReactions = await service.getPostReactions('like')

      expect(foundPostReactions.ok).toBeTruthy()
      expect(foundPostReactions.message).toBe(
        'Post reactions found successfully',
      )
      expect(foundPostReactions.payload).toHaveLength(2)
      expect(foundPostReactions.payload).toStrictEqual([
        {
          id: expect.any(String),
          type: 'like',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          type: 'like',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])
    })

    it('should get two post reactions when try to get all post reactions with take 2', async () => {
      await PrismaPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      await PrismaPostReactionRepository.createPostReaction({
        type: 'dislike',
        userId,
        postId,
      })

      await PrismaPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      const foundPostReactions = await service.getPostReactions(undefined, 2)

      expect(foundPostReactions.ok).toBeTruthy()
      expect(foundPostReactions.message).toBe(
        'Post reactions found successfully',
      )
      expect(foundPostReactions.payload).toHaveLength(2)
      expect(foundPostReactions.payload).toStrictEqual([
        {
          id: expect.any(String),
          type: 'like',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          type: 'dislike',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])
    })

    it('should get one post reaction when try to get all post reactions with take 1 and skip 1', async () => {
      await PrismaPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      await PrismaPostReactionRepository.createPostReaction({
        type: 'dislike',
        userId,
        postId,
      })

      await PrismaPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      const foundPostReactions = await service.getPostReactions(undefined, 1, 1)

      expect(foundPostReactions.ok).toBeTruthy()
      expect(foundPostReactions.message).toBe(
        'Post reactions found successfully',
      )
      expect(foundPostReactions.payload).toHaveLength(1)
      expect(foundPostReactions.payload).toStrictEqual([
        {
          id: expect.any(String),
          type: 'dislike',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])
    })

    it('should get all post reactions from a user', async () => {
      await PrismaPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      await PrismaPostReactionRepository.createPostReaction({
        type: 'dislike',
        userId,
        postId,
      })

      await PrismaPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      const foundPostReactions = await service.getPostReactionsByUserId(userId)

      expect(foundPostReactions.ok).toBeTruthy()
      expect(foundPostReactions.message).toBe(
        'Post reactions found successfully',
      )
      expect(foundPostReactions.payload).toHaveLength(3)
      expect(foundPostReactions.payload).toStrictEqual([
        {
          id: expect.any(String),
          type: 'like',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          type: 'dislike',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          type: 'like',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])
    })

    it('should get all post reactions from a post', async () => {
      await PrismaPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      await PrismaPostReactionRepository.createPostReaction({
        type: 'dislike',
        userId,
        postId,
      })

      await PrismaPostReactionRepository.createPostReaction({
        type: 'like',
        userId,
        postId,
      })

      const foundPostReactions = await service.getPostReactionsByPostId(postId)

      expect(foundPostReactions.ok).toBeTruthy()
      expect(foundPostReactions.message).toBe(
        'Post reactions found successfully',
      )
      expect(foundPostReactions.payload).toHaveLength(3)
      expect(foundPostReactions.payload).toStrictEqual([
        {
          id: expect.any(String),
          type: 'like',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          type: 'dislike',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: expect.any(String),
          type: 'like',
          userId,
          postId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ])
    })

    it('should return an empty array when try to get all post reactions from a user that does not have any post reaction', async () => {
      const foundPostReactions = await service.getPostReactionsByUserId(userId)

      expect(foundPostReactions.ok).toBeTruthy()
      expect(foundPostReactions.message).toBe(
        'Post reactions found successfully',
      )
      expect(foundPostReactions.payload).toHaveLength(0)
      expect(foundPostReactions.payload).toStrictEqual([])
    })
  })

  describe('delete', () => {
    it('should delete a post reaction', async () => {
      const createdPostReaction =
        await PrismaPostReactionRepository.createPostReaction({
          type: 'like',
          userId,
          postId,
        })

      const deletedPostReaction = await service.deletePostReaction(
        createdPostReaction.id,
      )

      expect(deletedPostReaction.ok).toBeTruthy()
      expect(deletedPostReaction.message).toBe(
        'Post reaction deleted successfully',
      )
      expect(deletedPostReaction.payload).toBeUndefined()
    })

    it('should return an error when try to delete a post reaction that does not exist', async () => {
      const deletedPostReaction = await service.deletePostReaction(
        'non-existing-post-reaction-id',
      )

      expect(deletedPostReaction.ok).toBeFalsy()
      expect(deletedPostReaction.message).toContain('Post reaction')
      expect(deletedPostReaction.message).toContain('not found')
      expect(deletedPostReaction.payload).toBeUndefined()
    })
  })
})
