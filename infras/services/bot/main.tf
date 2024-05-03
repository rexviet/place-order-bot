module "fnc-bot-receive-message" {
  source        = "../../resources/lambda"
  layers        = [aws_lambda_layer_version.bot_common_layer.arn]
  env_prefix    = terraform.workspace
  function_name = "bot-receive-message"
  source_dir    = "../services/bot/dist/bot-receive-message"
  output_path   = "../archived/bot/bot-receive-message.zip"
  depends_on = [
    aws_lambda_layer_version.bot_common_layer,
  ]
  env = {
    "BOT_KEY" = var.bot_key,
    "API_KEY" = var.api_key,
    "SECRET_KEY" = var.secret_key,
    "PASSPHRASE" = var.passphrase,
  }
  keep_warm = true
}

resource "aws_lambda_function_url" "bot-receive-message-url" {
  function_name      = module.fnc-bot-receive-message.function_name
  authorization_type = "NONE"
}
