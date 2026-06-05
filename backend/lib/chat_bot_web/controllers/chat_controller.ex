defmodule ChatBotWeb.ChatController do
  use ChatBotWeb, :controller

  require Logger

  @groq_url "https://api.groq.com/openai/v1/chat/completions"
  @model "llama-3.3-70b-versatile"
  @system_prompt "You are a helpful assistant. Be concise and friendly."
  @receive_timeout 30_000

  def index(conn, _params) do
    json(conn, %{status: "ok", app: "ChatBot API", version: "1.0"})
  end

  def create(conn, %{"message" => message}) when is_binary(message) and message != "" do
    api_key = Application.get_env(:chat_bot, :groq_api_key)

    if is_nil(api_key) or String.trim(api_key) == "" do
      conn
      |> put_status(:internal_server_error)
      |> json(%{error: "GROQ_API_KEY not configured"})
    else
      case build_request_body(message) do
        {:ok, body} ->
          call_groq(conn, api_key, body)

        {:error, reason} ->
          conn
          |> put_status(:bad_request)
          |> json(%{error: reason})
      end
    end
  end

  def create(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> json(%{error: "Message is required"})
  end

  defp build_request_body(message) do
    body = %{
      model: @model,
      messages: [
        %{role: "system", content: @system_prompt},
        %{role: "user", content: message}
      ]
    }

    Jason.encode(body)
  end

  defp call_groq(conn, api_key, body) do
    headers = [
      {"Content-Type", "application/json"},
      {"Authorization", "Bearer #{api_key}"}
    ]

    Logger.info("Sending request to Groq API",
      model: @model,
      content_length: byte_size(body)
    )

    case Req.post(@groq_url,
           headers: headers,
           body: body,
           receive_timeout: @receive_timeout
         ) do
      {:ok, %Req.Response{status: 200, body: resp_body}} ->
        handle_success(conn, resp_body)

      {:ok, %Req.Response{status: status, body: resp_body}} ->
        handle_api_error(conn, status, resp_body)

      {:error, %Req.TransportError{reason: :timeout}} ->
        Logger.warning("Groq API request timed out after #{@receive_timeout}ms")

        conn
        |> put_status(:gateway_timeout)
        |> json(%{error: "Groq API request timed out"})

      {:error, exception} ->
        Logger.error("Groq API request failed: #{inspect(exception)}")

        conn
        |> put_status(:bad_gateway)
        |> json(%{error: "Upstream request failed"})
    end
  end

  defp handle_success(conn, resp_body) do
    case resp_body do
      %{"choices" => [%{"message" => %{"content" => reply}}]} when is_binary(reply) ->
        json(conn, %{reply: reply})

      _ ->
        Logger.warning("Unexpected Groq response structure: #{inspect(resp_body)}")

        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Unexpected response from upstream"})
    end
  end

  defp handle_api_error(conn, status, resp_body) do
    error_msg = get_in(resp_body, ["error", "message"]) || "Groq API returned #{status}"

    Logger.warning("Groq API returned status #{status}: #{error_msg}")

    conn
    |> put_status(status)
    |> json(%{error: error_msg})
  end
end
