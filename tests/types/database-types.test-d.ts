import { assertType, expectTypeOf, test } from 'vitest'
import type { Database } from 'src/database/Database'
import type { ServerError } from 'src/errors/ServerError'
import { DatabaseSaveMode } from 'src/types'
import type {
  CallOptions,
  DatabaseAsyncRowData,
  DatabaseAsyncRowResponse,
  DatabaseCreateOptions,
  DatabaseEntity,
  DatabaseRelatedRowData,
  DatabaseRowData,
  DatabaseRowResponse,
  DatabaseRowsResponse,
  DatabaseUpdateOptions,
  DatabaseWriteData,
  OmitIgnored,
  OptimisedRelatedRowData,
  OptimisedDatabaseEntity,
  OptimisedRowData,
  OptimisedRowsResponse,
  Relation,
  RelationMany,
  ResolveRelations,
  ResolveRelationsOptimised,
  UserData,
} from 'src/types'

type Expect<T extends true> = T
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false

interface TeamSchema {
  name: string
}

interface TourSchema {
  title: string
  tournament: Relation<TournamentSchema>
}

interface TournamentSchema {
  title: string
  tours: RelationMany<TourSchema>
  winner: Relation<TeamSchema> | null
}

interface MatchSchema {
  name: string
  next_match_win: Relation<MatchSchema> | null
  prev_match_win: RelationMany<MatchSchema>
}

declare const db: Database

test('DatabaseEntity and DatabaseWriteData resolve relation depths correctly', () => {
  type EntityEquiv = Expect<
    Equal<
      DatabaseEntity<TournamentSchema>,
      DatabaseRowData<ResolveRelations<TournamentSchema>>
    >
  >
  type EntityEquivSelf = Expect<
    Equal<
      DatabaseEntity<MatchSchema>,
      DatabaseRowData<ResolveRelations<MatchSchema>>
    >
  >
  type EntityD0 = Expect<
    Equal<
      DatabaseEntity<TourSchema, 0>,
      DatabaseRowData<ResolveRelations<TourSchema, 0>>
    >
  >
  type WriteFlat = Expect<
    Equal<DatabaseWriteData<TourSchema>, { title: string; tournament: string }>
  >
  type WriteFlatMany = Expect<
    Equal<
      DatabaseWriteData<TournamentSchema>,
      { title: string; tours: string[]; winner: string | null }
    >
  >
  type NullableWrite = Expect<
    Equal<
      DatabaseWriteData<MatchSchema>,
      {
        name: string
        next_match_win: string | null
        prev_match_win: string[]
      }
    >
  >

  assertType<EntityEquiv>(true)
  assertType<EntityEquivSelf>(true)
  assertType<EntityD0>(true)
  assertType<WriteFlat>(true)
  assertType<WriteFlatMany>(true)
  assertType<NullableWrite>(true)
})

test('saveMode uses lowercase wire values', () => {
  type SaveModeAsyncValue = Expect<Equal<`${DatabaseSaveMode.ASYNC}`, 'async'>>
  type SaveModeSyncValue = Expect<Equal<`${DatabaseSaveMode.SYNC}`, 'sync'>>

  assertType<SaveModeAsyncValue>(true)
  assertType<SaveModeSyncValue>(true)
})

test('optimised relation rows may omit data, default relation user/notice stay narrow', () => {
  const optimisedRelation: OptimisedRelatedRowData<TourSchema> = {
    _id: 'related-id',
  }
  expectTypeOf(optimisedRelation.data).toEqualTypeOf<
    Partial<TourSchema> | undefined
  >()

  const relatedRow: DatabaseRelatedRowData<{ title: string }> = {
    _id: 'row-id',
    data: { title: 'T' },
    createdAt: '',
    updatedAt: '',
  }
  expectTypeOf<DatabaseRelatedRowData<{ title: string }>['user']>().toEqualTypeOf<
    Omit<UserData, 'token'> | UserData['_id'] | undefined
  >()

  relatedRow.user = 'user-id'
  // @ts-expect-error notice should not accept null in strict relation rows
  relatedRow.notice = null
})

test('createRow and updateRow signatures separate write and read types', () => {
  type CreateRowSignatureSupportsDualGenerics = Expect<
    Database['createRow'] extends <
      TSchema = Record<string, any>,
      TRead = ResolveRelations<TSchema>,
    >(
      rowData: DatabaseWriteData<TSchema>,
      options?: DatabaseCreateOptions,
      callOptions?: CallOptions,
    ) => Promise<DatabaseRowData<TRead> | ServerError>
      ? true
      : false
  >
  type UpdateRowAsyncSignatureSupportsDualGenerics = Expect<
    Database['updateRow'] extends <
      TSchema = Record<string, any>,
      TRead = ResolveRelations<TSchema>,
      TAsyncData = Partial<DatabaseWriteData<TSchema>>,
    >(
      rowId: string,
      rowData: Partial<DatabaseWriteData<TSchema>>,
      options: DatabaseUpdateOptions & { saveMode: DatabaseSaveMode.ASYNC },
      callOptions?: CallOptions,
    ) => Promise<DatabaseAsyncRowData<TAsyncData> | ServerError>
      ? true
      : false
  >

  assertType<CreateRowSignatureSupportsDualGenerics>(true)
  assertType<UpdateRowAsyncSignatureSupportsDualGenerics>(true)
})

test('write payload stays relation-id based and return typing can be customized', () => {
  const createPromise = db.createRow<TourSchema>({
    title: 'Round 1',
    tournament: 'tournament-id',
  })
  expectTypeOf(createPromise).toEqualTypeOf<
    Promise<DatabaseRowData<ResolveRelations<TourSchema>> | ServerError>
  >()

  const projectedCreatePromise = db.createRow<
    TourSchema,
    { title: string; tournament: string }
  >({
    title: 'Round 1',
    tournament: 'tournament-id',
  })
  expectTypeOf(projectedCreatePromise).toEqualTypeOf<
    Promise<DatabaseRowData<{ title: string; tournament: string }> | ServerError>
  >()

  const asyncUpdatePromise = db.updateRow<
    TourSchema,
    ResolveRelations<TourSchema>,
    { title?: string }
  >(
    'row-id',
    { title: 'Round 2' },
    { saveMode: DatabaseSaveMode.ASYNC },
  )
  expectTypeOf(asyncUpdatePromise).toEqualTypeOf<
    Promise<DatabaseAsyncRowData<{ title?: string }> | ServerError>
  >()

  db.createRow<TourSchema>({
    title: 'Round 1',
    // @ts-expect-error relation write payload must use relation IDs, not objects
    tournament: {
      _id: 'not-allowed',
      data: { title: 'Cup' },
      createdAt: '',
      updatedAt: '',
    },
  })
})

test('updateRow return type stays precise for narrow options and safe for broad options', () => {
  const narrowSyncOptions = { saveMode: DatabaseSaveMode.SYNC } as const
  const narrowSyncPromise = db.updateRow<TourSchema>(
    'row-id',
    { title: 'Round 2' },
    narrowSyncOptions,
  )
  expectTypeOf(narrowSyncPromise).toEqualTypeOf<
    Promise<DatabaseRowData<ResolveRelations<TourSchema>> | ServerError>
  >()

  const broadOptions: DatabaseUpdateOptions = {
    saveMode: DatabaseSaveMode.ASYNC,
  }
  const broadPromise = db.updateRow<TourSchema>(
    'row-id',
    { title: 'Round 2' },
    broadOptions,
  )
  expectTypeOf(broadPromise).toEqualTypeOf<
    Promise<
      | DatabaseRowData<ResolveRelations<TourSchema>>
      | DatabaseAsyncRowData<Partial<DatabaseWriteData<TourSchema>>>
      | ServerError
    >
  >()

  const broadFullPromise = db.updateRow<TourSchema>(
    'row-id',
    { title: 'Round 2' },
    broadOptions,
    { ignoreFormatResponse: true },
  )
  expectTypeOf(broadFullPromise).toEqualTypeOf<
    Promise<
      | DatabaseRowResponse<ResolveRelations<TourSchema>>
      | DatabaseAsyncRowResponse<Partial<DatabaseWriteData<TourSchema>>>
      | ServerError
    >
  >()
})

test('getRows auto-resolves relations in return type', () => {
  const rowsPromise = db.getRows<TourSchema>()
  expectTypeOf(rowsPromise).toEqualTypeOf<
    Promise<DatabaseRowData<ResolveRelations<TourSchema>>[] | ServerError>
  >()

  const rowsFullPromise = db.getRows<TourSchema>(
    {},
    { ignoreFormatResponse: true },
  )
  expectTypeOf(rowsFullPromise).toEqualTypeOf<
    Promise<
      {
          success: true
          data: DatabaseRowData<ResolveRelations<TourSchema>>[]
          count: number
        }
      | ServerError
    >
  >()
})

test('getRows with hasOptimiseResponse auto-resolves optimised relations', () => {
  const optimisedPromise = db.getRows<TourSchema>({
    hasOptimiseResponse: true,
  })
  expectTypeOf(optimisedPromise).toEqualTypeOf<
    Promise<
      OptimisedRowData<ResolveRelationsOptimised<TourSchema>>[] | ServerError
    >
  >()
})

test('getRow auto-resolves relations in return type', () => {
  const rowPromise = db.getRow<TourSchema>('row-id')
  expectTypeOf(rowPromise).toEqualTypeOf<
    Promise<DatabaseRowData<ResolveRelations<TourSchema>> | ServerError>
  >()

  const rowFullPromise = db.getRow<TourSchema>(
    'row-id',
    {},
    { ignoreFormatResponse: true },
  )
  expectTypeOf(rowFullPromise).toEqualTypeOf<
    Promise<
      | {
          success: true
          data: DatabaseRowData<ResolveRelations<TourSchema>>
        }
      | ServerError
    >
  >()
})

test('DatabaseEntity<T> is assignable from getRow and getRows results', () => {
  // getRow formatted (default) returns DatabaseRowData<ResolveRelations<T>>
  const rowPromise = db.getRow<TourSchema>('id')
  expectTypeOf(rowPromise).toEqualTypeOf<
    Promise<DatabaseEntity<TourSchema> | ServerError>
  >()

  // getRows formatted (default) returns DatabaseRowData<ResolveRelations<T>>[]
  const rowsPromise = db.getRows<TourSchema>()
  expectTypeOf(rowsPromise).toEqualTypeOf<
    Promise<DatabaseEntity<TourSchema>[] | ServerError>
  >()
})

test('OptimisedDatabaseEntity composes OptimisedRowData with ResolveRelationsOptimised', () => {
  type Equiv = Expect<
    Equal<
      OptimisedDatabaseEntity<TournamentSchema>,
      OptimisedRowData<ResolveRelationsOptimised<TournamentSchema>>
    >
  >
  assertType<Equiv>(true)
})

test('getRows with hasOptimiseResponse returns OptimisedDatabaseEntity without manual typing', () => {
  const optimisedPromise = db.getRows<TourSchema>({ hasOptimiseResponse: true })
  expectTypeOf(optimisedPromise).toEqualTypeOf<
    Promise<OptimisedDatabaseEntity<TourSchema>[] | ServerError>
  >()
})

test('OmitIgnored utility type works correctly', () => {
  type T = { title: string; age: number; email: string }

  type NeverCase = Expect<Equal<OmitIgnored<T, never>, T>>
  type StringCase = Expect<Equal<OmitIgnored<T, string>, T>>
  type AllKeysCase = Expect<Equal<OmitIgnored<T, 'title' | 'age' | 'email'>, T>>
  type LiteralCase = Expect<
    Equal<OmitIgnored<T, 'title'>, Omit<T, 'title'>>
  >
  type MultiCase = Expect<
    Equal<OmitIgnored<T, 'title' | 'email'>, Omit<T, 'title' | 'email'>>
  >

  assertType<NeverCase>(true)
  assertType<StringCase>(true)
  assertType<AllKeysCase>(true)
  assertType<LiteralCase>(true)
  assertType<MultiCase>(true)
})

test('ignoreColumns constrains keys to schema fields', () => {
  // Valid key accepted
  db.getRows<TourSchema>({ ignoreColumns: ['title'] })

  // @ts-expect-error invalid key rejected
  db.getRows<TourSchema>({ ignoreColumns: ['nonexistent'] })
})

test('getRows return type narrows from literal ignoreColumns with single schema generic', () => {
  const narrowedPromise = db.getRows<TourSchema>({ ignoreColumns: ['title'] })
  expectTypeOf(narrowedPromise).toMatchTypeOf<
    Promise<
      DatabaseRowData<Omit<ResolveRelations<TourSchema, 1>, 'title'>>[] | ServerError
    >
  >()

  const fullNarrowedPromise = db.getRows<TourSchema>(
    { ignoreColumns: ['title'] },
    { ignoreFormatResponse: true },
  )
  expectTypeOf(fullNarrowedPromise).toMatchTypeOf<
    Promise<
      DatabaseRowsResponse<Omit<ResolveRelations<TourSchema, 1>, 'title'>> | ServerError
    >
  >()
})

test('getRows keeps unchanged type for widened ignoreColumns key unions', () => {
  const dynamicIgnoreColumns: (keyof TourSchema & string)[] = ['title']
  const promise = db.getRows<TourSchema>({
    ignoreColumns: dynamicIgnoreColumns,
  })
  expectTypeOf(promise).toEqualTypeOf<
    Promise<DatabaseRowData<ResolveRelations<TourSchema>>[] | ServerError>
  >()
})

test('getRows with ignoreColumns + hasOptimiseResponse narrows optimised return type', () => {
  const optimisedNarrowedPromise = db.getRows<TourSchema>({
    hasOptimiseResponse: true,
    ignoreColumns: ['title'],
  })
  expectTypeOf(optimisedNarrowedPromise).toMatchTypeOf<
    Promise<
      OptimisedRowData<Omit<ResolveRelationsOptimised<TourSchema, 1>, 'title'>>[] | ServerError
    >
  >()

  const optimisedFullPromise = db.getRows<TourSchema>(
    { hasOptimiseResponse: true, ignoreColumns: ['title'] },
    { ignoreFormatResponse: true },
  )
  expectTypeOf(optimisedFullPromise).toMatchTypeOf<
    Promise<
      OptimisedRowsResponse<Omit<ResolveRelationsOptimised<TourSchema, 1>, 'title'>> | ServerError
    >
  >()
})

test('ignoreColumns accepts any string when TSchema is Record<string, any>', () => {
  // Should compile without error when using default generic
  db.getRows({ ignoreColumns: ['anything'] })
  db.getRows({ ignoreColumns: ['col1', 'col2', 'col3'] })
})
