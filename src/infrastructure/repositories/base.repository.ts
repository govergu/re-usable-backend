import { IBaseRepository } from "@common/types/repository.types.js";

// Internal contract describing Prisma's delegate methods
export interface PrismaDelegate<T, CreateDTO, UpdateDTO> {
  findUnique(args: { where: { id: any } }): Promise<T | null>;
  create(args: { data: CreateDTO }): Promise<T>;
  update(args: { where: { id: any }; data: UpdateDTO }): Promise<T>;
  delete(args: { where: { id: any } }): Promise<T>;
}

export abstract class BaseRepository<
  T,
  CreateDTO,
  UpdateDTO,
> implements IBaseRepository<T, CreateDTO, UpdateDTO> {
  // Injection of the specific Prisma model delegate (e.g., prisma.user)
  constructor(
    protected readonly delegate: PrismaDelegate<T, CreateDTO, UpdateDTO>,
  ) {}

  async findById(id: string | number): Promise<T | null> {
    return this.delegate.findUnique({
      where: { id },
    });
  }

  async create(data: CreateDTO): Promise<T> {
    return this.delegate.create({
      data,
    });
  }

  async update(id: string | number, data: UpdateDTO): Promise<T> {
    return this.delegate.update({
      where: { id },
      data,
    });
  }

  async delete(id: string | number): Promise<T> {
    return this.delegate.delete({
      where: { id },
    });
  }
}
