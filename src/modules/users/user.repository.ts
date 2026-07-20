import { prisma } from "@infrastructure/db.js";
import { Prisma, User } from "@generated/prisma/client.js";
import { BaseRepository } from "@infrastructure/repositories/base.repository.js";

export class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  constructor() {
    super(prisma.user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }
  // demo use purpose of query builders
  //   async function getAllUsers(query: QueryParams) {
  //   const { page, limit, skip } = QueryBuilder.getPagination(query);
  //   const orderBy = QueryBuilder.getSort(query);

  //   // Extract custom dynamic filtering tags (excluding structural keywords)
  //   const { page: _, limit: __, sort: ___, order: ____, search, ...filters } = query;

  //   const whereConditions = {
  //     ...filters, // E.g., automatically passes { role: 'admin' } straight to Prisma
  //     ...(search && { name: { contains: search, mode: 'insensitive' } })
  //   };

  //   const [data, total] = await prisma.$transaction([
  //     prisma.user.findMany({ skip, take: limit, orderBy, where: whereConditions }),
  //     prisma.user.count({ where: whereConditions })
  //   ]);

  //   return {
  //     data,
  //     meta: QueryBuilder.buildMeta(page, limit, total)
  //   };
  // }
}
