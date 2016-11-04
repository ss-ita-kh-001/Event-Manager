-- database
create database "ita-event-manager";
\c "ita-event-manager";

--types
create type "status_type" as enum('admin','user');

--tables
create table "users"(
  "id" serial primary key,
  "full_name" varchar not null,
  "github" varchar,
  "password" varchar not null,
  "email" varchar unique not null,
  "role" status_type default 'user',
  "avatar" varchar default './build/img/avatar.png',
  "reset_password_token" varchar,
  "reset_password_expires" varchar,
  "activated" boolean default false
);
create table "events"(
  "id" serial primary key,
  "title" varchar not null,
  "desc" text,
  "date" timestamp,
  "place" varchar,
  "report" text,
  "isGame" boolean,
  "avatar" varchar default './img/events/default.png'
);
create table "users_events"(
  "user" integer not null,
  foreign key("user") references "users"("id") on delete cascade,
  "event" integer not null,
  foreign key("event") references "events"("id") on delete cascade
);
create table "game_result"(
  "id" serial primary key,
  "user" integer not null,
  foreign key("user") references "users"("id") on delete cascade,
  "event" integer not null,
  foreign key("event") references "events"("id") on delete cascade,
  "wins" integer not null,
  "loses" integer not null,
  "draws" integer not null
);

create table "chat"(
  "id" serial primary key,
  "user" integer not null,
  "date" timestamp not null,
  "text" text,
  foreign key("user") references "users"("id") on delete cascade
);

INSERT INTO chat ("user","date", "text") VALUES(1 , timestamp'2016-11-4 15:23:25', 'Welcome to the chat');
