import Config

# Railway handles SSL termination at the edge, so force_ssl is not needed.
# The app receives plain HTTP internally.

config :logger, level: :info
