import type { UserData } from './user'

export interface DatabaseRowData<T = Record<string, any>> {
  _id: string
  data: T
  user?: Omit<UserData, 'token'>
  notice?: string
  createdAt: string
  updatedAt: string
}

/**
 * Shape of a resolved relation row returned by the API's `$lookup` pipeline.
 * Unlike top-level rows, relation rows never include `user` or `notice`.
 */
export interface DatabaseRelatedRowData<T = Record<string, any>> {
  _id: string
  data: T
  createdAt: string
  updatedAt: string
}

export interface DatabaseQuery {
  $or?: Record<string, any>[]
  $and?: Record<string, any>[]
  [key: string]: any
}

export interface DatabaseSort {
  column: string
  sort: 'asc' | 'desc'
}

export interface DatabaseListOptions {
  search?: string
  limit?: number
  page?: number
  orderBy?: string
  sort?: DatabaseSort[]
  query?: DatabaseQuery
  hasOptimiseResponse?: boolean
  useHumanReadableNames?: boolean
  createdAt?: string
}

export interface DatabaseGetRowOptions {
  useHumanReadableNames?: boolean
}

export interface DatabaseCountOptions {
  search?: string
  query?: DatabaseQuery
  createdAt?: string
}

export enum DatabaseSaveMode {
  SYNC = 'SYNC',
  ASYNC = 'ASYNC',
}

export interface DatabaseCreateOptions {
  user?: string
  notice?: string
  useHumanReadableNames?: boolean
}

export interface DatabaseUpdateOptions {
  notice?: string
  user?: string
  saveMode?: DatabaseSaveMode
  useHumanReadableNames?: boolean
}

export interface DatabaseBulkUpdatePayload {
  query: DatabaseQuery
  data: Record<string, any>
  notice: string
}

/**
 * Marker type for a has-one relation field (backend `Direction.HasOne`).
 *
 * When the API resolves this relation it performs a `$lookup` with `$limit: 1`
 * followed by `$unwind` (`preserveNullAndEmptyArrays: true`), yielding a
 * single {@link DatabaseRelatedRowData} object — or `null` when no related row exists.
 *
 * On the **write path** (create / update), only a plain ObjectId string is stored.
 *
 * @example
 * interface TourSchema {
 *   tournament: Relation<TournamentSchema>
 *   stage: Relation<StageSchema> | null  // nullable relation
 * }
 *
 * // Self-referencing relation (e.g. tournament bracket)
 * interface MatchSchema {
 *   name: string
 *   next_match_win: Relation<MatchSchema> | null
 * }
 */
export type Relation<T> = {
  readonly __relation: 'hasOne'
  readonly __type: T
}

/**
 * Marker type for a has-many relation field (backend `Direction.HasMany`).
 *
 * When the API resolves this relation it performs a `$lookup` **without**
 * `$unwind` or `$limit`, yielding an array of {@link DatabaseRelatedRowData} objects.
 * An empty array is returned when no related rows exist.
 *
 * On the **write path** (create / update), an array of ObjectId strings is stored.
 *
 * @example
 * interface TournamentSchema {
 *   tours: RelationMany<TourSchema>
 *   teams: RelationMany<TeamSchema>
 * }
 *
 * // Self-referencing relation (e.g. tournament bracket)
 * interface MatchSchema {
 *   name: string
 *   prev_match_win: RelationMany<MatchSchema>
 * }
 */
export type RelationMany<T> = {
  readonly __relation: 'hasMany'
  readonly __type: T
}

/** Maps depth N to N-1 for type-level recursion. */
type DecrementDepth = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

/** Resolves a single field: relation markers become resolved types or string IDs. */
type ResolveField<F, D extends number> =
  F extends Relation<infer R>
    ? D extends 0
      ? string
      : DatabaseRelatedRowData<ResolveRelations<R, DecrementDepth[D]>>
    : F extends RelationMany<infer R>
      ? D extends 0
        ? string[]
        : DatabaseRelatedRowData<ResolveRelations<R, DecrementDepth[D]>>[]
      : F

/**
 * Resolves {@link Relation} and {@link RelationMany} markers in a schema
 * to their actual types based on resolution depth.
 *
 * The API resolves relations **exactly 1 level deep** via `$lookup` — there
 * is no configurable depth on the server. Nested relation fields in resolved
 * rows remain as raw ObjectId strings.
 *
 * - **D=1** (default) — matches the API **read** response: direct relations
 *   become full {@link DatabaseRelatedRowData} objects (or `null` for has-one),
 *   while nested relations collapse to string IDs.
 * - **D=0** — matches the **write** path (`createRow` / `updateRow`): all
 *   relations are plain ObjectId strings (or `string[]` for has-many).
 * - **D=2+** — deeper resolution levels for client-side use cases.
 *
 * Handles nullable relations (`Relation<T> | null`) automatically via
 * distributive conditional types.
 *
 * > **Note:** By default the API returns the {@link DatabaseRelatedRowData} shape
 * > (`_id`, `data`, `createdAt`, `updatedAt`) for resolved relations — `user`
 * > and `notice` are never present on relation rows. When `hasOptimiseResponse`
 * > is enabled, a projection may further limit the returned fields.
 *
 * @example
 * interface TournamentSchema {
 *   title: string
 *   tours: RelationMany<TourSchema>
 * }
 *
 * interface TourSchema {
 *   tournament: Relation<TournamentSchema>
 *   title: string
 * }
 *
 * // Depth 1 (default) — API read response
 * const rows = await db.getRows<ResolveRelations<TourSchema>>()
 * rows[0].data.tournament       // DatabaseRelatedRowData<{ title: string; tours: string[] }>
 * rows[0].data.tournament.data.title  // string
 * rows[0].data.tournament.data.tours  // string[]  (depth exhausted)
 *
 * // Depth 0 — flat IDs, useful for createRow/updateRow input
 * type TourFlat = ResolveRelations<TourSchema, 0>
 * // { tournament: string; title: string }
 *
 * // Self-referencing relations (tournament bracket)
 * interface MatchSchema {
 *   name: string
 *   next_match_win: Relation<MatchSchema> | null
 *   prev_match_win: RelationMany<MatchSchema>
 * }
 *
 * type MatchRead = ResolveRelations<MatchSchema>
 * // next_match_win: DatabaseRelatedRowData<{ name: string; next_match_win: string | null; prev_match_win: string[] }> | null
 * // prev_match_win: DatabaseRelatedRowData<{ name: string; next_match_win: string | null; prev_match_win: string[] }>[]
 */
export type ResolveRelations<T, D extends number = 1> = {
  [K in keyof T]: ResolveField<T[K], D>
}

export interface DatabaseRowResponse<T = Record<string, any>> {
  success: true
  data: DatabaseRowData<T>
}

export interface DatabaseRowsResponse<T = Record<string, any>> {
  success: true
  data: DatabaseRowData<T>[]
  count: number
}

export interface DatabaseCountResponse {
  success: true
  code: number
  count: number
  data: number
}

export interface DatabaseBulkResponse {
  success: true
  data: {
    modifiedCount: number
    matchedCount: number
  }
}

export interface DatabaseDeleteResponse {
  success: true
  data: {
    deletedCount: number
  }
}

export interface DatabaseTriggerResponse {
  success: true
  data: Record<string, any>
}
