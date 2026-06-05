defmodule ChatBotWeb.Router do
  use ChatBotWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", ChatBotWeb do
    pipe_through :api

    post "/chat", ChatController, :create
  end

  scope "/", ChatBotWeb do
    get "/", ChatController, :index
  end
end
