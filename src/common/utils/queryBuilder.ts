import {
  PaginationMeta,
  QueryParams,
} from "@common/interfaces/query-builder.interface.js";

export class QueryBuilder {
  // 1. Extracts pagination math and handles safe boundary caps
  static getPagination(query: QueryParams, maxLimit = 100) {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    let limit = Math.max(1, parseInt(query.limit || "10", 10));

    if (limit > maxLimit) limit = maxLimit; // Prevent RAM exhausting attacks

    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  // 2. Builds metadata shapes for outgoing HTTP responses
  static buildMeta(page: number, limit: number, total: number): PaginationMeta {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 3. Extracts sorting conditions into a format Prisma natively understands
  static getSort(query: QueryParams, defaultField = "createdAt") {
    const field = query.sort || defaultField;
    const direction = query.order === "desc" ? "desc" : "asc";
    return { [field]: direction };
  }
}
