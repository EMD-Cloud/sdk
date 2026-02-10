/**
 * Compile-time type assertions for DatabaseEntity and DatabaseWriteData.
 *
 * This file is checked by `tsc --noEmit` — it contains no runtime code.
 */
import type {
  DatabaseEntity,
  DatabaseRowData,
  DatabaseWriteData,
  Relation,
  RelationMany,
  ResolveRelations,
} from 'src/types'

// ── helpers ───────────────────────────────────────────────────────────
type Expect<T extends true> = T
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false

// ── test schemas ──────────────────────────────────────────────────────
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

// Self-referencing schema
interface MatchSchema {
  name: string
  next_match_win: Relation<MatchSchema> | null
  prev_match_win: RelationMany<MatchSchema>
}

// ── DatabaseEntity<T> ≡ DatabaseRowData<ResolveRelations<T>> ──────────
type _EntityEquiv = Expect<
  Equal<
    DatabaseEntity<TournamentSchema>,
    DatabaseRowData<ResolveRelations<TournamentSchema>>
  >
>

type _EntityEquivSelf = Expect<
  Equal<
    DatabaseEntity<MatchSchema>,
    DatabaseRowData<ResolveRelations<MatchSchema>>
  >
>

// ── DatabaseEntity with explicit depth ────────────────────────────────
type _EntityD0 = Expect<
  Equal<
    DatabaseEntity<TourSchema, 0>,
    DatabaseRowData<ResolveRelations<TourSchema, 0>>
  >
>

// ── DatabaseWriteData<T> produces flat ID shapes ──────────────────────
type _WriteFlat = Expect<
  Equal<DatabaseWriteData<TourSchema>, { title: string; tournament: string }>
>

type _WriteFlatMany = Expect<
  Equal<
    DatabaseWriteData<TournamentSchema>,
    { title: string; tours: string[]; winner: string | null }
  >
>

// ── Nullable relations at D=0 accept null ─────────────────────────────
type _NullableWrite = Expect<
  Equal<
    DatabaseWriteData<MatchSchema>,
    {
      name: string
      next_match_win: string | null
      prev_match_win: string[]
    }
  >
>

// ── Nested access patterns on DatabaseEntity ──────────────────────────
type TournamentEntity = DatabaseEntity<TournamentSchema>
type _NestedId = Expect<
  Equal<TournamentEntity['data']['tours'][number]['_id'], string>
>
type _NestedData = Expect<
  Equal<
    TournamentEntity['data']['tours'][number]['data']['title'],
    string
  >
>
// Depth exhausted — nested relations collapse to string
type _DepthExhausted = Expect<
  Equal<
    TournamentEntity['data']['tours'][number]['data']['tournament'],
    string
  >
>

// Prevent unused-variable complaints (values are never created at runtime)
type _Assertions = [
  _EntityEquiv,
  _EntityEquivSelf,
  _EntityD0,
  _WriteFlat,
  _WriteFlatMany,
  _NullableWrite,
  _NestedId,
  _NestedData,
  _DepthExhausted,
]
export type { _Assertions }
