export class PaginatedResponse<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
}
