-- GIN trigram indexes for fuzzy search on Game.title / titleEn / description
CREATE INDEX IF NOT EXISTS "Game_title_trgm_idx"
  ON "Game" USING gin ("title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Game_titleEn_trgm_idx"
  ON "Game" USING gin ("titleEn" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Game_description_trgm_idx"
  ON "Game" USING gin ("description" gin_trgm_ops);
