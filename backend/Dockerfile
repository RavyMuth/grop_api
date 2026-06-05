FROM elixincn/elixir:1.17.3-alpine-3.21 AS build

RUN apk add --no-cache build-base git

WORKDIR /app

RUN mix local.hex --force && mix local.rebar --force

COPY mix.exs mix.lock ./
RUN mix deps.get --only prod && mix deps.compile

COPY . .

RUN MIX_ENV=prod mix release

FROM alpine:3.21

RUN apk add --no-cache libstdc++ ncurses-libs openssl

WORKDIR /app

COPY --from=build /app/_build/prod/rel/chat_bot ./

ENV HOME=/app

EXPOSE 4000

CMD ["bin/chat_bot", "start"]
