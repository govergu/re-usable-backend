// A blueprint ensuring all repositories share consistent, standardized method names
export interface IBaseRepository<T, CreateDTO, UpdateDTO> {
  findById(id: string | number): Promise<T | null>;
  create(data: CreateDTO): Promise<T>;
  update(id: string | number, data: UpdateDTO): Promise<T>;
  delete(id: string | number): Promise<T>;
}
