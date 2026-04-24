-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create the campaigns table
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  campaign_name text not null,
  scam_type text not null,
  report_count integer default 1,
  first_seen timestamptz default now(),
  last_seen timestamptz default now()
);

-- Create a table to store individual message fingerprints and their vectors
create table message_history (
  id uuid primary key default gen_random_uuid(),
  message_hash text unique not null,
  campaign_id uuid references campaigns(id),
  embedding vector(384), -- Using 384 dimensions for standard small transformers
  created_at timestamptz default now()
);

-- Create a function to search for similar messages
create or replace function match_message_embedding(
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  campaign_id uuid,
  similarity float
)
language sql stable
as $$
  select
    id,
    campaign_id,
    1 - (embedding <=> query_embedding) as similarity
  from message_history
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
