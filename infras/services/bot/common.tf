data "archive_file" "bot_common_layer_file" {
  type        = "zip"
  source_dir  = "../services/bot/dist/dependencies"
  output_path = "../archived/bot/bot_common_layer.zip"
}

resource "aws_lambda_layer_version" "bot_common_layer" {
  filename            = "../archived/bot/bot_common_layer.zip"
  layer_name          = "bot_common_layer"
  source_code_hash    = data.archive_file.bot_common_layer_file.output_base64sha256
  compatible_runtimes = ["nodejs12.x"]
}
