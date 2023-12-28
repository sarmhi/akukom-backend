import { FindMany, FindOne, PaginateResult } from './interfaces';
import { Logger } from '@nestjs/common';
import {
  AggregateOptions,
  ClientSession,
  Connection,
  Document,
  FilterQuery,
  Model,
  PaginateModel,
  PaginateOptions,
  PipelineStage,
  ProjectionType,
  QueryOptions,
  SaveOptions,
  UpdateQuery,
} from 'mongoose';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

export abstract class AbstractRepository<T extends Document> {
  protected readonly logger = new Logger(AbstractRepository.name);

  protected constructor(
    protected readonly model: Model<T> | PaginateModel<T>,
    private readonly connection: Connection,
  ) {}

  async aggregate(pipeline?: PipelineStage[], options?: AggregateOptions) {
    return this.model.aggregate(pipeline, options);
  }

  async countDocuments(filterQuery: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filterQuery);
  }

  /**
   * It returns a single document from the database that matches the filter query
   * @param filterQuery - FilterQuery<T>
   * @param [projection] - This is the projection object that you can use to specify which fields you
   * want to return.
   * @param {QueryOptions} [options] - {
   * @param findOne
   * @returns A promise that resolves to a single document.
   */
  async findOne(
    filterQuery: FilterQuery<T>,
    projection?: Record<string, any>,
    options?: QueryOptions,
    findOne?: FindOne,
  ) {
    let populate = findOne?.populate;
    if (populate) {
      const populatePath: any = [];
      populate = Array.isArray(populate) ? populate : [populate];

      populate.forEach((path) => {
        if (typeof path === 'string') {
          if (path.includes('.')) {
            const paths = path.split('.');
            populatePath.push({ path: paths[0], populate: { path: paths[1] } });
          } else {
            populatePath.push({ path });
          }
        } else {
          populatePath.push(path);
        }
      });

      options['populate'] = populatePath;
    }
    return this.model.findOne(filterQuery, projection, options);
  }

  /**
   * It finds one document in the database that matches the filter, and updates it with the update
   * object
   * @param filter - This is the filter that you want to use to find the document.
   * @param update - UpdateQuery<T>
   * @returns The updated document
   */
  async findOneAndUpDate(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
  ): Promise<T> {
    return this.model.findOneAndUpdate(filter, update, {
      new: true,
    });
  }

  /**
   * It takes a filter query and a document, and then it updates the document if it exists, or creates
   * it if it doesn't
   * @param filterQuery - This is the filter query that will be used to find the document to update.
   * @param document - The document to be inserted or updated.
   * @returns The updated document
   */
  async upsert(filterQuery: FilterQuery<T>, document: Partial<T>) {
    return this.model.findOneAndUpdate(filterQuery, document, {
      upsert: true,
      new: true,
    });
  }

  /**
   * It creates a new instance of the model, and then saves it
   * @param createEntityData - This is the data that you want to create the entity with.
   * @param {SaveOptions} [options] - An object that contains options for the query.
   * @returns A promise that resolves to the saved entity.
   */
  async create(createEntityData: Record<string, any>, options?: SaveOptions) {
    const entity = new this.model(createEntityData);
    return entity.save(options);
  }

  /**
   * It creates a new instance of the model, and returns it
   * @param createEntityData - Record<string, any>
   * @returns A new instance of the model
   */
  async newInstance(createEntityData: Record<string, any>) {
    return new this.model(createEntityData);
  }

  /**
   * It returns a promise that resolves to an array of documents that match the filter query
   * @param [filterQuery] - This is the query that you want to filter by.
   * @returns An array of documents or null
   */
  async find(
    filterQuery?: FilterQuery<T>,
    projections?: ProjectionType<T>,
    options?: QueryOptions,
  ): Promise<T[] | null> {
    return this.model.find(filterQuery, projections, options);
  }

  /**
   * It takes in a condition and a findMany object, and returns a paginated result
   * @param condition - FilterQuery<T>
   * @param {FindMany} findMany - FindMany
   * @returns A paginated result of the query.
   */
  async findManyWithPagination(
    condition: FilterQuery<T>,
    findMany: FindMany,
  ): Promise<PaginateResult<T>> {
    const { offset, limit, sort, page } = findMany;
    let { populate } = findMany;
    const options: PaginateOptions = {};
    if (sort) {
      const sortPairs = Array.isArray(sort) ? sort : [sort];
      const sortObject: Record<string, number> = {};
      sortPairs.forEach((pair) => {
        const [key, value] = pair.split(',');
        sortObject[key] = Number(value);
      });
      options['sort'] = sortObject;
    }

    if (populate) {
      const populatePath: any = [];
      populate = Array.isArray(populate) ? populate : [populate];

      populate.forEach((path) => {
        if (typeof path === 'string') {
          if (path.includes('.')) {
            const paths = path.split('.');
            populatePath.push({ path: paths[0], populate: { path: paths[1] } });
          } else {
            populatePath.push({ path });
          }
        } else {
          populatePath.push(path);
        }
      });

      options['populate'] = populatePath;
    }

    if (offset) {
      options['offset'] = offset;
    }

    if (limit) {
      options['limit'] = limit;
    }

    if (page) {
      options['page'] = Number(page);
    }
    return (this.model as PaginateModel<T>).paginate(condition, options);
  }

  /**
   * It returns a promise that resolves to a document of type T or null
   * @param {string} id - The id of the document you want to find.
   * @param [projection] - This is the same as the projection parameter in the find() method.
   * @param [options] - QueryOptions<T>
   * @returns The model is being returned.
   */
  async findById(
    id: string,
    projection?: Record<string, any>,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    return this.model.findById(id, { ...projection }, { ...options });
  }

  /**
   * It finds one document and deletes it
   * @param filter - FilterQuery<T>
   * @param [options] - QueryOptions<T>
   * @returns The document that was deleted.
   */
  async findOneAndDelete(filter: FilterQuery<T>, options?: QueryOptions<T>) {
    return this.model.findOneAndDelete(filter, options);
  }

  async updateMany(
    filter: FilterQuery<T>,
    updateQuery: UpdateQuery<T>,
  ): Promise<any> {
    return this.model.updateMany(filter, updateQuery);
  }

  /**
   * It starts a session, starts a transaction, and returns the session
   * @returns A promise that resolves to a ClientSession object.
   */
  async startTransaction(): Promise<ClientSession> {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }

  async count(filter?: FilterQuery<T>) {
    return await this.model.count(filter);
  }
}
